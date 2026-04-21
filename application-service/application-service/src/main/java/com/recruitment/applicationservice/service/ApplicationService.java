package com.recruitment.applicationservice.service;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;
import java.util.function.Function;
import java.util.stream.Collectors;

import com.recruitment.applicationservice.client.JobServiceClient;
import com.recruitment.applicationservice.client.UserServiceClient;
import com.recruitment.applicationservice.domain.ApplicationStatus;
import com.recruitment.applicationservice.domain.JobApplication;
import com.recruitment.applicationservice.dto.ApplicationRequest;
import com.recruitment.applicationservice.dto.ApplicationResponse;
import com.recruitment.applicationservice.dto.ApplicationStatisticsDto;
import com.recruitment.applicationservice.dto.UpdateApplicationStatusRequest;
import com.recruitment.applicationservice.dto.event.ApplicationCreatedEvent;
import com.recruitment.applicationservice.dto.event.ApplicationStatusChangedEvent;
import com.recruitment.applicationservice.exception.DuplicateApplicationException;
import com.recruitment.applicationservice.exception.ResourceNotFoundException;
import com.recruitment.applicationservice.exception.UnauthorizedException;
import com.recruitment.applicationservice.exception.ValidationException;
import com.recruitment.applicationservice.mapper.ApplicationMapper;
import com.recruitment.applicationservice.repository.JobApplicationRepository;
import com.recruitment.applicationservice.security.SecurityUtils;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class ApplicationService {

    private final JobApplicationRepository jobApplicationRepository;
    private final ApplicationMapper applicationMapper;
    private final SecurityUtils securityUtils;
    private final JobServiceClient jobServiceClient;
    private final UserServiceClient userServiceClient;
    private final ApplicationEventPublisher eventPublisher;

    @Transactional
    public ApplicationResponse apply(ApplicationRequest request) {
        ensureRole("CANDIDATE");
        Long candidateId = securityUtils.currentUserId();
        if (jobApplicationRepository.existsByCandidateIdAndJobId(candidateId, request.jobId())) {
            throw new DuplicateApplicationException("Candidate " + candidateId + " has already applied to job " + request.jobId());
        }

        JobServiceClient.JobSnapshot job = jobServiceClient.getJob(request.jobId());
        if (!"OPEN".equals(job.status())) {
            throw new ValidationException("Applications are only allowed for open jobs");
        }
        if (job.expiresAt() != null && job.expiresAt().isBefore(LocalDateTime.now())) {
            throw new ValidationException("This job offer has expired");
        }

        UserServiceClient.CandidateSnapshot candidate = userServiceClient.getCandidate(candidateId);
        UserServiceClient.EmployerSnapshot employer = userServiceClient.getEmployer(job.employerId());

        JobApplication application = jobApplicationRepository.save(JobApplication.builder()
                .candidateId(candidateId)
                .jobId(request.jobId())
                .coverLetter(request.coverLetter().trim())
                .status(ApplicationStatus.PENDING)
                .appliedAt(LocalDateTime.now())
                .updatedAt(LocalDateTime.now())
                .build());

        jobServiceClient.adjustApplicationCount(request.jobId(), 1);

        eventPublisher.publishCreated(new ApplicationCreatedEvent(
                "APPLICATION_CREATED",
                application.getId(),
                candidate.userId(),
                candidate.email(),
                candidate.fullName(),
                employer.employerId(),
                employer.email(),
                job.id(),
                job.title(),
                job.company(),
                LocalDateTime.now()));

        return applicationMapper.toResponse(
                application,
                candidate.fullName(),
                candidate.email(),
                candidate.cvUrl(),
                job.title(),
                job.company());
    }

    @Transactional(readOnly = true)
    public ApplicationResponse getApplication(Long id) {
        JobApplication application = findApplication(id);
        authorizeAccess(application);
        return enrich(application);
    }

    @Transactional(readOnly = true)
    public List<ApplicationResponse> getApplicationsForCandidate(Long candidateId) {
        if (!securityUtils.isAdmin() && !securityUtils.currentUserId().equals(candidateId)) {
            throw new UnauthorizedException("You can only view your own applications");
        }
        return jobApplicationRepository.findAllByCandidateIdOrderByAppliedAtDesc(candidateId).stream()
                .map(this::enrich)
                .toList();
    }

    @Transactional(readOnly = true)
    public List<ApplicationResponse> getApplicationsForJob(Long jobId) {
        JobServiceClient.JobSnapshot job = jobServiceClient.getJob(jobId);
        ensureEmployerOwnership(job.employerId());
        return jobApplicationRepository.findAllByJobIdOrderByAppliedAtDesc(jobId).stream()
                .map(this::enrich)
                .toList();
    }

    @Transactional(readOnly = true)
    public List<ApplicationResponse> getApplicationsForJobInternal(Long jobId) {
        return jobApplicationRepository.findAllByJobIdOrderByAppliedAtDesc(jobId).stream()
                .map(this::enrich)
                .toList();
    }

    @Transactional
    public ApplicationResponse updateStatus(Long id, UpdateApplicationStatusRequest request) {
        JobApplication application = findApplication(id);
        JobServiceClient.JobSnapshot job = jobServiceClient.getJob(application.getJobId());
        ensureEmployerOwnership(job.employerId());

        application.setStatus(request.status());
        application.setEmployerNote(request.employerNote());
        application.setUpdatedAt(LocalDateTime.now());
        JobApplication saved = jobApplicationRepository.save(application);

        UserServiceClient.CandidateSnapshot candidate = userServiceClient.getCandidate(saved.getCandidateId());
        UserServiceClient.EmployerSnapshot employer = userServiceClient.getEmployer(job.employerId());

        ApplicationStatusChangedEvent event = new ApplicationStatusChangedEvent(
                "APPLICATION_STATUS_CHANGED",
                saved.getId(),
                saved.getCandidateId(),
                saved.getJobId(),
                job.title(),
                request.status().name(),
                candidate.email(),
                job.company(),
                employer.email(),
                LocalDateTime.now());
        eventPublisher.publishStatusChanged(event);
        if (request.status() == ApplicationStatus.INTERVIEW) {
            eventPublisher.publishInterviewReminder(event);
        }

        return applicationMapper.toResponse(
                saved,
                candidate.fullName(),
                candidate.email(),
                candidate.cvUrl(),
                job.title(),
                job.company());
    }

    @Transactional
    public void withdraw(Long id) {
        JobApplication application = findApplication(id);
        if (!securityUtils.currentUserId().equals(application.getCandidateId()) && !securityUtils.isAdmin()) {
            throw new UnauthorizedException("You can only withdraw your own applications");
        }
        if (application.getStatus() != ApplicationStatus.PENDING && !securityUtils.isAdmin()) {
            throw new ValidationException("Only pending applications can be withdrawn");
        }
        jobApplicationRepository.delete(application);
        jobServiceClient.adjustApplicationCount(application.getJobId(), -1);
    }

    @Transactional(readOnly = true)
    public List<ApplicationResponse> getAllApplications(Long candidateId, Long jobId) {
        return jobApplicationRepository.findAll().stream()
                .filter(application -> candidateId == null || candidateId.equals(application.getCandidateId()))
                .filter(application -> jobId == null || jobId.equals(application.getJobId()))
                .sorted((left, right) -> right.getAppliedAt().compareTo(left.getAppliedAt()))
                .map(this::enrich)
                .toList();
    }

    @Transactional(readOnly = true)
    public ApplicationStatisticsDto getStatistics() {
        List<JobApplication> applications = jobApplicationRepository.findAll();
        Map<String, Long> byStatus = applications.stream()
                .collect(Collectors.groupingBy(application -> application.getStatus().name(), Collectors.counting()));
        Map<Long, Long> byJob = applications.stream()
                .collect(Collectors.groupingBy(JobApplication::getJobId, Collectors.counting()));
        return new ApplicationStatisticsDto(applications.size(), byStatus, byJob);
    }

    private ApplicationResponse enrich(JobApplication application) {
        UserServiceClient.CandidateSnapshot candidate = userServiceClient.getCandidate(application.getCandidateId());
        JobServiceClient.JobSnapshot job = jobServiceClient.getJob(application.getJobId());
        return applicationMapper.toResponse(
                application,
                candidate.fullName(),
                candidate.email(),
                candidate.cvUrl(),
                job.title(),
                job.company());
    }

    private void authorizeAccess(JobApplication application) {
        if (securityUtils.isAdmin()) {
            return;
        }
        String role = securityUtils.currentRole();
        if ("CANDIDATE".equals(role) && securityUtils.currentUserId().equals(application.getCandidateId())) {
            return;
        }
        if ("EMPLOYER".equals(role)) {
            JobServiceClient.JobSnapshot job = jobServiceClient.getJob(application.getJobId());
            if (securityUtils.currentUserId().equals(job.employerId())) {
                return;
            }
        }
        throw new UnauthorizedException("You are not allowed to view this application");
    }

    private void ensureRole(String role) {
        if (!role.equals(securityUtils.currentRole()) && !securityUtils.isAdmin()) {
            throw new UnauthorizedException("Only " + role + " users can perform this action");
        }
    }

    private void ensureEmployerOwnership(Long employerId) {
        if (securityUtils.isAdmin()) {
            return;
        }
        if (!"EMPLOYER".equals(securityUtils.currentRole()) || !securityUtils.currentUserId().equals(employerId)) {
            throw new UnauthorizedException("Only the owning employer can manage this application");
        }
    }

    private JobApplication findApplication(Long id) {
        return jobApplicationRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Application with id " + id + " not found"));
    }
}

package com.recruitment.jobservice.service;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;
import java.util.function.Function;
import java.util.stream.Collectors;

import com.recruitment.jobservice.client.UserServiceClient;
import com.recruitment.jobservice.domain.JobOffer;
import com.recruitment.jobservice.domain.JobStatus;
import com.recruitment.jobservice.dto.job.ChangeJobStatusRequest;
import com.recruitment.jobservice.dto.job.JobOfferDto;
import com.recruitment.jobservice.dto.job.JobRequest;
import com.recruitment.jobservice.dto.job.JobStatisticsDto;
import com.recruitment.jobservice.exception.ResourceNotFoundException;
import com.recruitment.jobservice.exception.UnauthorizedException;
import com.recruitment.jobservice.exception.ValidationException;
import com.recruitment.jobservice.mapper.JobOfferMapper;
import com.recruitment.jobservice.repository.JobOfferRepository;
import com.recruitment.jobservice.repository.JobOfferSpecifications;
import com.recruitment.jobservice.security.SecurityUtils;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class JobService {

    private final JobOfferRepository jobOfferRepository;
    private final JobOfferMapper jobOfferMapper;
    private final SecurityUtils securityUtils;
    private final UserServiceClient userServiceClient;

    @Transactional
    public JobOfferDto createJob(JobRequest request) {
        ensureEmployerRole();
        Long employerId = securityUtils.currentUserId();
        UserServiceClient.EmployerSnapshot employer = userServiceClient.getEmployer(employerId);

        JobOffer jobOffer = JobOffer.builder()
                .title(request.title().trim())
                .description(request.description().trim())
                .company(employer.companyName())
                .location(request.location().trim())
                .contractType(request.contractType())
                .salary(request.salary())
                .experienceLevel(request.experienceLevel())
                .requiredSkills(List.copyOf(request.requiredSkills()))
                .employerId(employerId)
                .status(JobStatus.OPEN)
                .publishedAt(LocalDateTime.now())
                .expiresAt(request.expiresAt())
                .applicationCount(0)
                .build();

        return jobOfferMapper.toDto(jobOfferRepository.save(jobOffer));
    }

    @Transactional(readOnly = true)
    public Page<JobOfferDto> searchJobs(String query,
                                        String location,
                                        com.recruitment.jobservice.domain.ContractType contractType,
                                        com.recruitment.jobservice.domain.ExperienceLevel experienceLevel,
                                        JobStatus status,
                                        int page,
                                        int size,
                                        String sortBy) {
        Sort sort = "salary".equalsIgnoreCase(sortBy)
                ? Sort.by(Sort.Direction.ASC, "salary")
                : Sort.by(Sort.Direction.DESC, "publishedAt");
        PageRequest pageRequest = PageRequest.of(page, size, sort);
        JobStatus effectiveStatus = status == null ? JobStatus.OPEN : status;
        return jobOfferRepository.findAll(
                        JobOfferSpecifications.withFilters(query, location, contractType, experienceLevel, effectiveStatus),
                        pageRequest)
                .map(jobOfferMapper::toDto);
    }

    @Transactional(readOnly = true)
    public JobOfferDto getJob(Long id) {
        return jobOfferMapper.toDto(findJob(id));
    }

    @Transactional
    public JobOfferDto updateJob(Long id, JobRequest request) {
        JobOffer jobOffer = findJob(id);
        ensureOwner(jobOffer.getEmployerId());

        UserServiceClient.EmployerSnapshot employer = userServiceClient.getEmployer(jobOffer.getEmployerId());
        jobOffer.setTitle(request.title().trim());
        jobOffer.setDescription(request.description().trim());
        jobOffer.setCompany(employer.companyName());
        jobOffer.setLocation(request.location().trim());
        jobOffer.setContractType(request.contractType());
        jobOffer.setSalary(request.salary());
        jobOffer.setExperienceLevel(request.experienceLevel());
        jobOffer.setRequiredSkills(List.copyOf(request.requiredSkills()));
        jobOffer.setExpiresAt(request.expiresAt());
        return jobOfferMapper.toDto(jobOfferRepository.save(jobOffer));
    }

    @Transactional
    public void deleteJob(Long id) {
        JobOffer jobOffer = findJob(id);
        ensureOwner(jobOffer.getEmployerId());
        jobOfferRepository.delete(jobOffer);
    }

    @Transactional(readOnly = true)
    public List<JobOfferDto> getEmployerJobs(Long employerId) {
        ensureOwner(employerId);
        return jobOfferRepository.findAllByEmployerIdOrderByPublishedAtDesc(employerId).stream()
                .map(jobOfferMapper::toDto)
                .toList();
    }

    @Transactional
    public JobOfferDto changeStatus(Long id, ChangeJobStatusRequest request) {
        JobOffer jobOffer = findJob(id);
        ensureOwner(jobOffer.getEmployerId());
        jobOffer.setStatus(request.status());
        return jobOfferMapper.toDto(jobOfferRepository.save(jobOffer));
    }

    @Transactional(readOnly = true)
    public List<JobOfferDto> getAllJobs(Long employerId, JobStatus status) {
        return jobOfferRepository.findAll(JobOfferSpecifications.withFilters(null, null, null, null, status)).stream()
                .filter(job -> employerId == null || employerId.equals(job.getEmployerId()))
                .sorted((left, right) -> right.getPublishedAt().compareTo(left.getPublishedAt()))
                .map(jobOfferMapper::toDto)
                .toList();
    }

    @Transactional
    public JobOfferDto adjustApplicationCount(Long id, int delta) {
        JobOffer jobOffer = findJob(id);
        int updatedCount = jobOffer.getApplicationCount() + delta;
        if (updatedCount < 0) {
            throw new ValidationException("Application count cannot be negative");
        }
        jobOffer.setApplicationCount(updatedCount);
        return jobOfferMapper.toDto(jobOfferRepository.save(jobOffer));
    }

    @Transactional(readOnly = true)
    public JobStatisticsDto getStatistics() {
        List<JobOffer> jobs = jobOfferRepository.findAll();
        Map<String, Long> byLocation = groupBy(jobs, JobOffer::getLocation);
        Map<String, Long> byContractType = groupBy(jobs, job -> job.getContractType().name());
        return new JobStatisticsDto(
                jobs.size(),
                jobs.stream().filter(job -> job.getStatus() == JobStatus.OPEN).count(),
                byLocation,
                byContractType);
    }

    private Map<String, Long> groupBy(List<JobOffer> jobs, Function<JobOffer, String> classifier) {
        return jobs.stream()
                .collect(Collectors.groupingBy(classifier, Collectors.counting()));
    }

    private JobOffer findJob(Long id) {
        return jobOfferRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Job offer with id " + id + " not found"));
    }

    private void ensureEmployerRole() {
        if (!"EMPLOYER".equals(securityUtils.currentRole()) && !securityUtils.isAdmin()) {
            throw new UnauthorizedException("Only employers can manage job offers");
        }
    }

    private void ensureOwner(Long employerId) {
        ensureEmployerRole();
        if (!securityUtils.isOwnerOrAdmin(employerId)) {
            throw new UnauthorizedException("You are not allowed to manage this job offer");
        }
    }
}

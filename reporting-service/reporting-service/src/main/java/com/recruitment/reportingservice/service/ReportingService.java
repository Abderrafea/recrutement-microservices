package com.recruitment.reportingservice.service;

import java.time.LocalDateTime;
import java.util.Comparator;
import java.util.List;
import java.util.Map;
import java.util.Set;
import java.util.function.Function;
import java.util.stream.Collectors;

import com.recruitment.reportingservice.client.ApplicationServiceClient;
import com.recruitment.reportingservice.client.JobServiceClient;
import com.recruitment.reportingservice.client.UserServiceClient;
import com.recruitment.reportingservice.dto.ApplicationStatisticsReportDto;
import com.recruitment.reportingservice.dto.EmployerPerformanceDto;
import com.recruitment.reportingservice.dto.EmployerReportDto;
import com.recruitment.reportingservice.dto.JobPerformanceDto;
import com.recruitment.reportingservice.dto.JobStatisticsReportDto;
import com.recruitment.reportingservice.dto.PlatformOverviewDto;
import com.recruitment.reportingservice.exception.UnauthorizedException;
import com.recruitment.reportingservice.mapper.ReportingMapper;
import com.recruitment.reportingservice.security.SecurityUtils;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class ReportingService {

    private final UserServiceClient userServiceClient;
    private final JobServiceClient jobServiceClient;
    private final ApplicationServiceClient applicationServiceClient;
    private final ReportingMapper reportingMapper;
    private final SecurityUtils securityUtils;
    private final ReportCacheService reportCacheService;

    @Transactional(readOnly = true)
    public PlatformOverviewDto getOverview() {
        ensureAdmin();
        UserServiceClient.UserStatisticsSnapshot userStatistics = userServiceClient.getStatistics();
        List<JobServiceClient.JobSnapshot> jobs = jobServiceClient.getAllJobs(null);
        List<ApplicationServiceClient.ApplicationSnapshot> applications = applicationServiceClient.getAllApplications();

        PlatformOverviewDto overview = new PlatformOverviewDto(
                userStatistics.totalUsers(),
                userStatistics.totalCandidates(),
                userStatistics.totalEmployers(),
                jobs.size(),
                jobs.stream().filter(job -> "OPEN".equals(job.status())).count(),
                applications.size(),
                groupApplicationsByStatus(applications),
                jobs.stream()
                        .collect(Collectors.groupingBy(JobServiceClient.JobSnapshot::location, Collectors.counting()))
                        .entrySet().stream()
                        .sorted(Map.Entry.<String, Long>comparingByValue().reversed())
                        .limit(3)
                        .map(Map.Entry::getKey)
                        .toList(),
                userStatistics.registrationsByDate(),
                acceptanceRate(applications),
                LocalDateTime.now());
        return reportCacheService.cache("overview", overview);
    }

    @Transactional(readOnly = true)
    public JobStatisticsReportDto getJobsReport() {
        ensureAdmin();
        List<JobServiceClient.JobSnapshot> jobs = jobServiceClient.getAllJobs(null);
        JobStatisticsReportDto report = new JobStatisticsReportDto(
                jobs.size(),
                jobs.stream().filter(job -> "OPEN".equals(job.status())).count(),
                jobs.stream().collect(Collectors.groupingBy(JobServiceClient.JobSnapshot::location, Collectors.counting())),
                jobs.stream().collect(Collectors.groupingBy(JobServiceClient.JobSnapshot::contractType, Collectors.counting())),
                jobs.stream()
                        .collect(Collectors.groupingBy(JobServiceClient.JobSnapshot::employerId))
                        .entrySet().stream()
                        .map(entry -> {
                            List<JobServiceClient.JobSnapshot> employerJobs = entry.getValue();
                            JobServiceClient.JobSnapshot firstJob = employerJobs.getFirst();
                            long applicationsReceived = employerJobs.stream().mapToLong(JobServiceClient.JobSnapshot::applicationCount).sum();
                            return new EmployerPerformanceDto(entry.getKey(), firstJob.company(), employerJobs.size(), applicationsReceived);
                        })
                        .sorted(Comparator.comparingLong(EmployerPerformanceDto::applicationsReceived).reversed())
                        .limit(10)
                        .toList(),
                LocalDateTime.now());
        return reportCacheService.cache("jobs", report);
    }

    @Transactional(readOnly = true)
    public ApplicationStatisticsReportDto getApplicationsReport() {
        ensureAdmin();
        List<ApplicationServiceClient.ApplicationSnapshot> applications = applicationServiceClient.getAllApplications();
        ApplicationStatisticsReportDto report = new ApplicationStatisticsReportDto(
                applications.size(),
                groupApplicationsByStatus(applications),
                applications.stream().collect(Collectors.groupingBy(ApplicationServiceClient.ApplicationSnapshot::jobId, Collectors.counting())),
                acceptanceRate(applications),
                LocalDateTime.now());
        return reportCacheService.cache("applications", report);
    }

    @Transactional(readOnly = true)
    public EmployerReportDto getEmployerReport(Long employerId) {
        if (!securityUtils.isAdmin() && !securityUtils.currentUserId().equals(employerId)) {
            throw new UnauthorizedException("You can only access your own employer report");
        }

        List<JobServiceClient.JobSnapshot> jobs = jobServiceClient.getAllJobs(employerId);
        List<ApplicationServiceClient.ApplicationSnapshot> applications = applicationServiceClient.getAllApplications();
        Set<Long> employerJobIds = jobs.stream().map(JobServiceClient.JobSnapshot::id).collect(Collectors.toSet());
        List<ApplicationServiceClient.ApplicationSnapshot> employerApplications = applications.stream()
                .filter(application -> employerJobIds.contains(application.jobId()))
                .toList();

        UserServiceClient.EmployerSnapshot employer = userServiceClient.getEmployer(employerId);
        List<JobPerformanceDto> performance = jobs.stream()
                .map(job -> reportingMapper.toJobPerformance(job, employerApplications.stream()
                        .filter(application -> application.jobId().equals(job.id()))
                        .count()))
                .toList();

        EmployerReportDto report = new EmployerReportDto(
                employerId,
                employer.companyName(),
                jobs.size(),
                jobs.stream().filter(job -> "OPEN".equals(job.status())).count(),
                employerApplications.size(),
                acceptanceRate(employerApplications),
                jobs.isEmpty() ? 0.0 : (double) employerApplications.size() / jobs.size(),
                performance,
                LocalDateTime.now());
        return reportCacheService.cache("employer-" + employerId, report);
    }

    private void ensureAdmin() {
        if (!securityUtils.isAdmin()) {
            throw new UnauthorizedException("Admin access is required");
        }
    }

    private Map<String, Long> groupApplicationsByStatus(List<ApplicationServiceClient.ApplicationSnapshot> applications) {
        return applications.stream()
                .collect(Collectors.groupingBy(ApplicationServiceClient.ApplicationSnapshot::status, Collectors.counting()));
    }

    private double acceptanceRate(List<ApplicationServiceClient.ApplicationSnapshot> applications) {
        if (applications.isEmpty()) {
            return 0.0;
        }
        long accepted = applications.stream().filter(application -> "ACCEPTED".equals(application.status())).count();
        return (double) accepted / applications.size();
    }
}

package com.recruitment.reportingservice.dto;

import java.time.LocalDateTime;
import java.util.List;

public record EmployerReportDto(
        Long employerId,
        String companyName,
        long totalJobsPosted,
        long openJobs,
        long totalApplicationsReceived,
        double acceptanceRate,
        double averageApplicationsPerJob,
        List<JobPerformanceDto> jobPerformance,
        LocalDateTime generatedAt
) {
}

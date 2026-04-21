package com.recruitment.reportingservice.dto;

public record EmployerPerformanceDto(
        Long employerId,
        String companyName,
        long totalJobsPosted,
        long applicationsReceived
) {
}

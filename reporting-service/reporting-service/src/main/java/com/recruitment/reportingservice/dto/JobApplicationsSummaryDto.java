package com.recruitment.reportingservice.dto;

public record JobApplicationsSummaryDto(
        Long jobId,
        String title,
        String company,
        long totalApplications
) {
}

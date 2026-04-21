package com.recruitment.reportingservice.dto;

public record JobPerformanceDto(
        Long jobId,
        String title,
        long applications,
        String status
) {
}

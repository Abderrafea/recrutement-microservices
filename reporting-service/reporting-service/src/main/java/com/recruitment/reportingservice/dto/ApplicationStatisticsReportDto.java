package com.recruitment.reportingservice.dto;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;

public record ApplicationStatisticsReportDto(
        long totalApplications,
        Map<String, Long> applicationsByStatus,
        Map<Long, Long> applicationsByJob,
        List<JobApplicationsSummaryDto> applicationsByJobDetails,
        double acceptanceRate,
        LocalDateTime generatedAt
) {
}

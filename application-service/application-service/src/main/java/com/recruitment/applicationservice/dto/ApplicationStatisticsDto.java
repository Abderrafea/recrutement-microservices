package com.recruitment.applicationservice.dto;

import java.util.Map;

public record ApplicationStatisticsDto(
        long totalApplications,
        Map<String, Long> applicationsByStatus,
        Map<Long, Long> applicationsByJob
) {
}

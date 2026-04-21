package com.recruitment.reportingservice.dto;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;

public record PlatformOverviewDto(
        long totalUsers,
        long totalCandidates,
        long totalEmployers,
        long totalJobOffers,
        long openJobOffers,
        long totalApplications,
        Map<String, Long> applicationsByStatus,
        List<String> topLocations,
        Map<String, Long> registrationsByDate,
        double acceptanceRate,
        LocalDateTime generatedAt
) {
}

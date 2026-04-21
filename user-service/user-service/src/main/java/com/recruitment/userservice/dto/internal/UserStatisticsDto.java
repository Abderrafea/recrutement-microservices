package com.recruitment.userservice.dto.internal;

import java.util.Map;

public record UserStatisticsDto(
        long totalUsers,
        long totalCandidates,
        long totalEmployers,
        Map<String, Long> registrationsByDate
) {
}

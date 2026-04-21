package com.recruitment.jobservice.dto.job;

import java.util.Map;

public record JobStatisticsDto(
        long totalJobs,
        long openJobs,
        Map<String, Long> jobsByLocation,
        Map<String, Long> jobsByContractType
) {
}

package com.recruitment.reportingservice.dto;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;

public record JobStatisticsReportDto(
        long totalJobs,
        long openJobs,
        Map<String, Long> jobsByLocation,
        Map<String, Long> jobsByContractType,
        List<EmployerPerformanceDto> topEmployers,
        LocalDateTime generatedAt
) {
}

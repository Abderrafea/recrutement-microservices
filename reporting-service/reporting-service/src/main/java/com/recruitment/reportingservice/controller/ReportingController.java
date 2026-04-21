package com.recruitment.reportingservice.controller;

import com.recruitment.reportingservice.dto.ApplicationStatisticsReportDto;
import com.recruitment.reportingservice.dto.EmployerReportDto;
import com.recruitment.reportingservice.dto.JobStatisticsReportDto;
import com.recruitment.reportingservice.dto.PlatformOverviewDto;
import com.recruitment.reportingservice.service.ReportingService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/reports")
@RequiredArgsConstructor
public class ReportingController {

    private final ReportingService reportingService;

    @GetMapping("/overview")
    public PlatformOverviewDto getOverview() {
        return reportingService.getOverview();
    }

    @GetMapping("/jobs")
    public JobStatisticsReportDto getJobsReport() {
        return reportingService.getJobsReport();
    }

    @GetMapping("/applications")
    public ApplicationStatisticsReportDto getApplicationsReport() {
        return reportingService.getApplicationsReport();
    }

    @GetMapping("/employer/{id}")
    public EmployerReportDto getEmployerReport(@PathVariable Long id) {
        return reportingService.getEmployerReport(id);
    }
}

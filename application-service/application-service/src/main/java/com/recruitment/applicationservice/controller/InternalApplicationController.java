package com.recruitment.applicationservice.controller;

import java.util.List;

import com.recruitment.applicationservice.dto.ApplicationResponse;
import com.recruitment.applicationservice.dto.ApplicationStatisticsDto;
import com.recruitment.applicationservice.service.ApplicationService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/applications/internal")
@RequiredArgsConstructor
public class InternalApplicationController {

    private final ApplicationService applicationService;

    @GetMapping("/all")
    public List<ApplicationResponse> getAllApplications(@RequestParam(required = false) Long candidateId,
                                                         @RequestParam(required = false) Long jobId) {
        return applicationService.getAllApplications(candidateId, jobId);
    }

    @GetMapping("/stats")
    public ApplicationStatisticsDto getStatistics() {
        return applicationService.getStatistics();
    }

    @GetMapping("/jobs/{jobId}")
    public List<ApplicationResponse> getApplicationsByJob(@PathVariable Long jobId) {
        return applicationService.getApplicationsForJobInternal(jobId);
    }
}

package com.recruitment.jobservice.controller;

import java.util.List;

import com.recruitment.jobservice.domain.JobStatus;
import com.recruitment.jobservice.dto.job.JobOfferDto;
import com.recruitment.jobservice.dto.job.JobStatisticsDto;
import com.recruitment.jobservice.service.JobService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/jobs/internal")
@RequiredArgsConstructor
public class InternalJobController {

    private final JobService jobService;

    @GetMapping("/all")
    public List<JobOfferDto> getAllJobs(@RequestParam(required = false) Long employerId,
                                        @RequestParam(required = false) JobStatus status) {
        return jobService.getAllJobs(employerId, status);
    }

    @GetMapping("/{id}")
    public JobOfferDto getJob(@PathVariable Long id) {
        return jobService.getJob(id);
    }

    @GetMapping("/stats")
    public JobStatisticsDto getStats() {
        return jobService.getStatistics();
    }

    @PatchMapping("/{id}/application-count")
    public JobOfferDto adjustApplicationCount(@PathVariable Long id, @RequestParam int delta) {
        return jobService.adjustApplicationCount(id, delta);
    }
}

package com.recruitment.jobservice.controller;

import java.util.List;

import com.recruitment.jobservice.domain.ContractType;
import com.recruitment.jobservice.domain.ExperienceLevel;
import com.recruitment.jobservice.domain.JobStatus;
import com.recruitment.jobservice.dto.job.ChangeJobStatusRequest;
import com.recruitment.jobservice.dto.job.JobOfferDto;
import com.recruitment.jobservice.dto.job.JobRequest;
import com.recruitment.jobservice.service.JobService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;

import static org.springframework.http.HttpStatus.CREATED;
import static org.springframework.http.HttpStatus.NO_CONTENT;

@RestController
@RequestMapping("/api/jobs")
@RequiredArgsConstructor
public class JobController {

    private final JobService jobService;

    @PostMapping
    @ResponseStatus(CREATED)
    public JobOfferDto createJob(@Valid @RequestBody JobRequest request) {
        return jobService.createJob(request);
    }

    @GetMapping
    public Page<JobOfferDto> listOpenJobs(@RequestParam(defaultValue = "0") int page,
                                          @RequestParam(defaultValue = "10") int size) {
        return jobService.searchJobs(null, null, null, null, JobStatus.OPEN, page, size, "publishedAt");
    }

    @GetMapping("/{id}")
    public JobOfferDto getJob(@PathVariable Long id) {
        return jobService.getJob(id);
    }

    @PutMapping("/{id}")
    public JobOfferDto updateJob(@PathVariable Long id, @Valid @RequestBody JobRequest request) {
        return jobService.updateJob(id, request);
    }

    @DeleteMapping("/{id}")
    @ResponseStatus(NO_CONTENT)
    public void deleteJob(@PathVariable Long id) {
        jobService.deleteJob(id);
    }

    @GetMapping("/search")
    public Page<JobOfferDto> searchJobs(@RequestParam(required = false) String query,
                                        @RequestParam(required = false) String location,
                                        @RequestParam(required = false) ContractType contractType,
                                        @RequestParam(required = false) ExperienceLevel experienceLevel,
                                        @RequestParam(required = false) JobStatus status,
                                        @RequestParam(defaultValue = "0") int page,
                                        @RequestParam(defaultValue = "10") int size,
                                        @RequestParam(defaultValue = "publishedAt") String sortBy) {
        return jobService.searchJobs(query, location, contractType, experienceLevel, status, page, size, sortBy);
    }

    @GetMapping("/employer/{employerId}")
    public List<JobOfferDto> getJobsForEmployer(@PathVariable Long employerId) {
        return jobService.getEmployerJobs(employerId);
    }

    @PatchMapping("/{id}/status")
    public JobOfferDto changeStatus(@PathVariable Long id, @Valid @RequestBody ChangeJobStatusRequest request) {
        return jobService.changeStatus(id, request);
    }
}

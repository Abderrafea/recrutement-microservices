package com.recruitment.applicationservice.controller;

import java.util.List;

import com.recruitment.applicationservice.dto.ApplicationRequest;
import com.recruitment.applicationservice.dto.ApplicationResponse;
import com.recruitment.applicationservice.dto.UpdateApplicationStatusRequest;
import com.recruitment.applicationservice.service.ApplicationService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/applications")
@RequiredArgsConstructor
public class ApplicationController {

    private final ApplicationService applicationService;

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public ApplicationResponse apply(@Valid @RequestBody ApplicationRequest request) {
        return applicationService.apply(request);
    }

    @GetMapping("/{id}")
    public ApplicationResponse getApplication(@PathVariable Long id) {
        return applicationService.getApplication(id);
    }

    @GetMapping("/candidate/{candidateId}")
    public List<ApplicationResponse> getCandidateApplications(@PathVariable Long candidateId) {
        return applicationService.getApplicationsForCandidate(candidateId);
    }

    @GetMapping("/job/{jobId}")
    public List<ApplicationResponse> getJobApplications(@PathVariable Long jobId) {
        return applicationService.getApplicationsForJob(jobId);
    }

    @PatchMapping("/{id}/status")
    public ApplicationResponse updateStatus(@PathVariable Long id,
                                            @Valid @RequestBody UpdateApplicationStatusRequest request) {
        return applicationService.updateStatus(id, request);
    }

    @DeleteMapping("/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void withdraw(@PathVariable Long id) {
        applicationService.withdraw(id);
    }
}

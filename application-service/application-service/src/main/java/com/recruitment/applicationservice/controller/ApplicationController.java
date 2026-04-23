package com.recruitment.applicationservice.controller;

import java.util.List;

import com.recruitment.applicationservice.dto.ApplicationResponse;
import com.recruitment.applicationservice.dto.UpdateApplicationStatusRequest;
import com.recruitment.applicationservice.service.ApplicationService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.core.io.Resource;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RequestPart;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;

@RestController
@RequestMapping("/api/applications")
@RequiredArgsConstructor
public class ApplicationController {

    private final ApplicationService applicationService;

    @PostMapping(consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    @ResponseStatus(HttpStatus.CREATED)
    public ApplicationResponse apply(@RequestParam("jobId") Long jobId,
                                     @RequestParam("coverLetter") String coverLetter,
                                     @RequestPart("cvFile") MultipartFile cvFile) {
        return applicationService.apply(jobId, coverLetter, cvFile);
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

    @GetMapping("/{id}/cv")
    public ResponseEntity<Resource> downloadCv(@PathVariable Long id) {
        ApplicationService.DownloadedFile downloadedFile = applicationService.downloadCv(id);
        return ResponseEntity.ok()
                .contentType(MediaType.APPLICATION_OCTET_STREAM)
                .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=\"" + downloadedFile.fileName() + "\"")
                .body(downloadedFile.resource());
    }
}

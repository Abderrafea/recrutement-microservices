package com.recruitment.applicationservice.dto;

import java.time.LocalDateTime;

import com.fasterxml.jackson.annotation.JsonInclude;
import com.recruitment.applicationservice.domain.ApplicationStatus;

@JsonInclude(JsonInclude.Include.NON_NULL)
public record ApplicationResponse(
        Long id,
        Long candidateId,
        String candidateName,
        String candidateEmail,
        String candidateCvUrl,
        Long jobId,
        String jobTitle,
        String company,
        String coverLetter,
        ApplicationStatus status,
        LocalDateTime appliedAt,
        LocalDateTime updatedAt,
        String employerNote,
        String cvFileName
) {
}

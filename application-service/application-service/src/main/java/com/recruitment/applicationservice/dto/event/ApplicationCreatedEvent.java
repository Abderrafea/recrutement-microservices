package com.recruitment.applicationservice.dto.event;

import java.time.LocalDateTime;

public record ApplicationCreatedEvent(
        String eventType,
        Long applicationId,
        Long candidateId,
        String candidateEmail,
        String candidateName,
        Long employerId,
        String employerEmail,
        Long jobId,
        String jobTitle,
        String employerCompany,
        LocalDateTime timestamp
) {
}

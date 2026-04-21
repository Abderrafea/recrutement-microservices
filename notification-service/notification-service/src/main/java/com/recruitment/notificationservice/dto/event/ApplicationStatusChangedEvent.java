package com.recruitment.notificationservice.dto.event;

import java.time.LocalDateTime;

public record ApplicationStatusChangedEvent(
        String eventType,
        Long applicationId,
        Long candidateId,
        Long jobId,
        String jobTitle,
        String newStatus,
        String candidateEmail,
        String employerCompany,
        String employerEmail,
        LocalDateTime timestamp
) {
}

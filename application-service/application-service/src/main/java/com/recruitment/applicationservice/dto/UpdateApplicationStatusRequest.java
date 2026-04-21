package com.recruitment.applicationservice.dto;

import com.recruitment.applicationservice.domain.ApplicationStatus;
import jakarta.validation.constraints.NotNull;

public record UpdateApplicationStatusRequest(
        @NotNull ApplicationStatus status,
        String employerNote
) {
}

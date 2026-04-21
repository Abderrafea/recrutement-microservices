package com.recruitment.applicationservice.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

public record ApplicationRequest(
        @NotNull Long jobId,
        @NotBlank String coverLetter
) {
}

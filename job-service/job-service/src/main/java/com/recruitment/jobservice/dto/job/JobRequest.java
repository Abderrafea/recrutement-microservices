package com.recruitment.jobservice.dto.job;

import java.time.LocalDateTime;
import java.util.List;

import com.recruitment.jobservice.domain.ContractType;
import com.recruitment.jobservice.domain.ExperienceLevel;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.NotNull;

public record JobRequest(
        @NotBlank String title,
        @NotBlank String description,
        @NotBlank String location,
        @NotNull ContractType contractType,
        String salary,
        @NotNull ExperienceLevel experienceLevel,
        @NotEmpty List<@NotBlank String> requiredSkills,
        LocalDateTime expiresAt
) {
}

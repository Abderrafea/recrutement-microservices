package com.recruitment.jobservice.dto.job;

import java.time.LocalDateTime;
import java.util.List;

import com.recruitment.jobservice.domain.ContractType;
import com.recruitment.jobservice.domain.ExperienceLevel;
import com.recruitment.jobservice.domain.JobStatus;

public record JobOfferDto(
        Long id,
        String title,
        String description,
        String company,
        String location,
        ContractType contractType,
        String salary,
        ExperienceLevel experienceLevel,
        List<String> requiredSkills,
        Long employerId,
        JobStatus status,
        LocalDateTime publishedAt,
        LocalDateTime expiresAt,
        int applicationCount
) {
}

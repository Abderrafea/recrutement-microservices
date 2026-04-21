package com.recruitment.jobservice.dto.job;

import com.recruitment.jobservice.domain.JobStatus;
import jakarta.validation.constraints.NotNull;

public record ChangeJobStatusRequest(@NotNull JobStatus status) {
}

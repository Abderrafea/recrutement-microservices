package com.recruitment.userservice.dto.user;

import java.time.LocalDateTime;

import com.recruitment.userservice.domain.Role;

public record UserSummaryDto(
        Long id,
        String email,
        String firstName,
        String lastName,
        Role role,
        LocalDateTime createdAt
) {
}

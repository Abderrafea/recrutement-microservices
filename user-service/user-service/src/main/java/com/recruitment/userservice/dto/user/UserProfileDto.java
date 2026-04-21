package com.recruitment.userservice.dto.user;

import java.time.LocalDateTime;

import com.fasterxml.jackson.annotation.JsonInclude;
import com.recruitment.userservice.domain.Role;

@JsonInclude(JsonInclude.Include.NON_NULL)
public record UserProfileDto(
        Long id,
        String email,
        String firstName,
        String lastName,
        Role role,
        Object profile,
        LocalDateTime createdAt
) {
}

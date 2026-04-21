package com.recruitment.userservice.dto.auth;

import java.util.List;

import com.recruitment.userservice.domain.Role;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

public record RegisterRequest(
        @Email @NotBlank String email,
        @NotBlank @Size(min = 8, max = 100) String password,
        @NotBlank String firstName,
        @NotBlank String lastName,
        @NotNull Role role,
        String phone,
        String address,
        String summary,
        List<@NotBlank String> skills,
        String companyName,
        String companyDescription,
        String website,
        String industry
) {
}

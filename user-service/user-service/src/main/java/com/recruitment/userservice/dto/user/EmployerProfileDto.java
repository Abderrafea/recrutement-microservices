package com.recruitment.userservice.dto.user;

public record EmployerProfileDto(
        String companyName,
        String companyDescription,
        String website,
        String industry
) {
}

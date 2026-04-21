package com.recruitment.userservice.dto.internal;

public record EmployerSnapshotDto(
        Long employerId,
        String email,
        String firstName,
        String lastName,
        String companyName,
        String companyDescription,
        String website,
        String industry
) {
}

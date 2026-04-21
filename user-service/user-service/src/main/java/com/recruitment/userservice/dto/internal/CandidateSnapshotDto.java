package com.recruitment.userservice.dto.internal;

public record CandidateSnapshotDto(
        Long userId,
        String email,
        String firstName,
        String lastName,
        String fullName,
        String cvUrl
) {
}

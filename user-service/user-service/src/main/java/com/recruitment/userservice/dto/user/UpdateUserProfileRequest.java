package com.recruitment.userservice.dto.user;

import java.util.List;

import jakarta.validation.constraints.Size;

public record UpdateUserProfileRequest(
        @Size(max = 100) String firstName,
        @Size(max = 100) String lastName,
        String phone,
        String address,
        String summary,
        List<String> skills,
        String companyName,
        String companyDescription,
        String website,
        String industry
) {
}

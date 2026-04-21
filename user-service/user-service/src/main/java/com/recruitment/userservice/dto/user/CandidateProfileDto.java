package com.recruitment.userservice.dto.user;

import java.util.List;

public record CandidateProfileDto(
        String phone,
        String address,
        String summary,
        String cvUrl,
        List<String> skills
) {
}

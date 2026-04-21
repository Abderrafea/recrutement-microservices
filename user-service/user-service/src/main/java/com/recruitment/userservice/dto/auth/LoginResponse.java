package com.recruitment.userservice.dto.auth;

import com.recruitment.userservice.domain.Role;
import com.recruitment.userservice.dto.user.UserSummaryDto;

public record LoginResponse(
        String accessToken,
        String tokenType,
        long expiresIn,
        Long userId,
        Role role,
        UserSummaryDto user
) {
}

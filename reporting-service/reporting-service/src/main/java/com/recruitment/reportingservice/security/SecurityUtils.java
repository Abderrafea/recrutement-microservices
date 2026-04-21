package com.recruitment.reportingservice.security;

import com.recruitment.reportingservice.exception.UnauthorizedException;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.stereotype.Component;

@Component
public class SecurityUtils {

    public Long currentUserId() {
        return Long.parseLong(currentJwt().getSubject());
    }

    public String currentRole() {
        return currentJwt().getClaimAsString("role");
    }

    public boolean isAdmin() {
        return "ADMIN".equals(currentRole());
    }

    private Jwt currentJwt() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        if (authentication == null || !(authentication.getPrincipal() instanceof Jwt jwt)) {
            throw new UnauthorizedException("Authentication is required");
        }
        return jwt;
    }
}

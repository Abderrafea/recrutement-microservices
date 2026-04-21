package com.recruitment.userservice.security;

import com.recruitment.userservice.domain.Role;
import com.recruitment.userservice.exception.UnauthorizedException;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.stereotype.Component;

@Component
public class SecurityUtils {

    public Long currentUserId() {
        Jwt jwt = currentJwt();
        return Long.parseLong(jwt.getSubject());
    }

    public Role currentRole() {
        Jwt jwt = currentJwt();
        return Role.valueOf(jwt.getClaimAsString("role"));
    }

    public boolean isSelfOrAdmin(Long userId) {
        Role role = currentRole();
        return role == Role.ADMIN || currentUserId().equals(userId);
    }

    public boolean hasAnyRole(Role... roles) {
        Role currentRole = currentRole();
        for (Role role : roles) {
            if (currentRole == role) {
                return true;
            }
        }
        return false;
    }

    private Jwt currentJwt() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        if (authentication == null || !(authentication.getPrincipal() instanceof Jwt jwt)) {
            throw new UnauthorizedException("Authentication is required");
        }
        return jwt;
    }
}

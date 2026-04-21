package com.recruitment.userservice.service;

import java.time.LocalDateTime;

import com.recruitment.userservice.domain.CandidateProfile;
import com.recruitment.userservice.domain.EmployerProfile;
import com.recruitment.userservice.domain.Role;
import com.recruitment.userservice.domain.User;
import com.recruitment.userservice.dto.auth.LoginRequest;
import com.recruitment.userservice.dto.auth.LoginResponse;
import com.recruitment.userservice.dto.auth.RegisterRequest;
import com.recruitment.userservice.dto.user.UserProfileDto;
import com.recruitment.userservice.exception.DuplicateResourceException;
import com.recruitment.userservice.exception.UnauthorizedException;
import com.recruitment.userservice.exception.ValidationException;
import com.recruitment.userservice.mapper.UserMapper;
import com.recruitment.userservice.repository.CandidateProfileRepository;
import com.recruitment.userservice.repository.EmployerProfileRepository;
import com.recruitment.userservice.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class AuthService {

    private final UserRepository userRepository;
    private final CandidateProfileRepository candidateProfileRepository;
    private final EmployerProfileRepository employerProfileRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtService jwtService;
    private final UserMapper userMapper;

    @Transactional
    public UserProfileDto register(RegisterRequest request) {
        if (userRepository.existsByEmailIgnoreCase(request.email())) {
            throw new DuplicateResourceException("User with email " + request.email() + " already exists");
        }

        if (request.role() == Role.EMPLOYER && (request.companyName() == null || request.companyName().isBlank())) {
            throw new ValidationException("Company name is required for employer registration");
        }

        User user = User.builder()
                .email(request.email().trim().toLowerCase())
                .passwordHash(passwordEncoder.encode(request.password()))
                .firstName(request.firstName().trim())
                .lastName(request.lastName().trim())
                .role(request.role())
                .createdAt(LocalDateTime.now())
                .build();

        User savedUser = userRepository.save(user);

        if (savedUser.getRole() == Role.CANDIDATE) {
            candidateProfileRepository.save(CandidateProfile.builder()
                    .user(savedUser)
                    .phone(request.phone())
                    .address(request.address())
                    .summary(request.summary())
                    .skills(request.skills() == null ? java.util.List.of() : request.skills())
                    .build());
        } else if (savedUser.getRole() == Role.EMPLOYER) {
            employerProfileRepository.save(EmployerProfile.builder()
                    .user(savedUser)
                    .companyName(request.companyName())
                    .companyDescription(request.companyDescription())
                    .website(request.website())
                    .industry(request.industry())
                    .build());
        }

        return userMapper.toProfile(userRepository.findById(savedUser.getId()).orElseThrow());
    }

    @Transactional(readOnly = true)
    public LoginResponse login(LoginRequest request) {
        User user = userRepository.findByEmailIgnoreCase(request.email())
                .orElseThrow(() -> new UnauthorizedException("Invalid email or password"));
        if (!passwordEncoder.matches(request.password(), user.getPasswordHash())) {
            throw new UnauthorizedException("Invalid email or password");
        }

        String token = jwtService.generateToken(user);
        return new LoginResponse(
                token,
                "Bearer",
                jwtService.expirationInMilliseconds(),
                user.getId(),
                user.getRole(),
                userMapper.toSummary(user));
    }
}

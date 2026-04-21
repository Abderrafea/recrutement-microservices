package com.recruitment.userservice.service;

import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

import com.recruitment.userservice.domain.CandidateProfile;
import com.recruitment.userservice.domain.EmployerProfile;
import com.recruitment.userservice.domain.Role;
import com.recruitment.userservice.domain.User;
import com.recruitment.userservice.dto.internal.CandidateSnapshotDto;
import com.recruitment.userservice.dto.internal.EmployerSnapshotDto;
import com.recruitment.userservice.dto.internal.UserStatisticsDto;
import com.recruitment.userservice.dto.user.UserSummaryDto;
import com.recruitment.userservice.exception.ResourceNotFoundException;
import com.recruitment.userservice.mapper.UserMapper;
import com.recruitment.userservice.repository.CandidateProfileRepository;
import com.recruitment.userservice.repository.EmployerProfileRepository;
import com.recruitment.userservice.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class InternalUserService {

    private final UserRepository userRepository;
    private final CandidateProfileRepository candidateProfileRepository;
    private final EmployerProfileRepository employerProfileRepository;
    private final UserMapper userMapper;

    @Transactional(readOnly = true)
    public List<UserSummaryDto> listUsers(String role) {
        if (role == null || role.isBlank()) {
            return userRepository.findAll().stream()
                    .sorted((left, right) -> right.getCreatedAt().compareTo(left.getCreatedAt()))
                    .map(userMapper::toSummary)
                    .toList();
        }
        Role userRole = Role.valueOf(role.toUpperCase());
        return userRepository.findAllByRoleOrderByCreatedAtDesc(userRole).stream()
                .map(userMapper::toSummary)
                .toList();
    }

    @Transactional(readOnly = true)
    public UserSummaryDto getUser(Long id) {
        return userMapper.toSummary(findUser(id));
    }

    @Transactional(readOnly = true)
    public CandidateSnapshotDto getCandidate(Long id) {
        User user = findUser(id);
        CandidateProfile candidateProfile = candidateProfileRepository.findByUserId(id)
                .orElseThrow(() -> new ResourceNotFoundException("Candidate profile for user " + id + " not found"));
        return new CandidateSnapshotDto(
                user.getId(),
                user.getEmail(),
                user.getFirstName(),
                user.getLastName(),
                user.getFirstName() + " " + user.getLastName(),
                candidateProfile.getCvUrl());
    }

    @Transactional(readOnly = true)
    public EmployerSnapshotDto getEmployer(Long id) {
        User user = findUser(id);
        EmployerProfile employerProfile = employerProfileRepository.findByUserId(id)
                .orElseThrow(() -> new ResourceNotFoundException("Employer profile for user " + id + " not found"));
        return new EmployerSnapshotDto(
                user.getId(),
                user.getEmail(),
                user.getFirstName(),
                user.getLastName(),
                employerProfile.getCompanyName(),
                employerProfile.getCompanyDescription(),
                employerProfile.getWebsite(),
                employerProfile.getIndustry());
    }

    @Transactional(readOnly = true)
    public UserStatisticsDto getStatistics() {
        List<User> users = userRepository.findAll();
        Map<String, Long> registrationsByDate = users.stream()
                .collect(Collectors.groupingBy(user -> user.getCreatedAt().toLocalDate().toString(), Collectors.counting()));
        long totalCandidates = users.stream().filter(user -> user.getRole() == Role.CANDIDATE).count();
        long totalEmployers = users.stream().filter(user -> user.getRole() == Role.EMPLOYER).count();
        return new UserStatisticsDto(users.size(), totalCandidates, totalEmployers, registrationsByDate);
    }

    private User findUser(Long id) {
        return userRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("User with id " + id + " not found"));
    }
}

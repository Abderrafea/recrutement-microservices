package com.recruitment.userservice.service;

import java.nio.file.Path;
import java.util.List;

import com.recruitment.userservice.domain.CandidateProfile;
import com.recruitment.userservice.domain.EmployerProfile;
import com.recruitment.userservice.domain.Role;
import com.recruitment.userservice.domain.User;
import com.recruitment.userservice.dto.user.ChangePasswordRequest;
import com.recruitment.userservice.dto.user.UpdateUserProfileRequest;
import com.recruitment.userservice.dto.user.UserProfileDto;
import com.recruitment.userservice.dto.user.UserSummaryDto;
import com.recruitment.userservice.exception.ResourceNotFoundException;
import com.recruitment.userservice.exception.UnauthorizedException;
import com.recruitment.userservice.exception.ValidationException;
import com.recruitment.userservice.mapper.UserMapper;
import com.recruitment.userservice.repository.CandidateProfileRepository;
import com.recruitment.userservice.repository.EmployerProfileRepository;
import com.recruitment.userservice.repository.UserRepository;
import com.recruitment.userservice.security.SecurityUtils;
import lombok.RequiredArgsConstructor;
import org.springframework.core.io.Resource;
import org.springframework.stereotype.Service;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

@Service
@RequiredArgsConstructor
public class UserService {

    private final UserRepository userRepository;
    private final CandidateProfileRepository candidateProfileRepository;
    private final EmployerProfileRepository employerProfileRepository;
    private final UserMapper userMapper;
    private final SecurityUtils securityUtils;
    private final FileStorageService fileStorageService;
    private final PasswordEncoder passwordEncoder;

    @Transactional(readOnly = true)
    public UserProfileDto getCurrentUserProfile() {
        return getProfile(securityUtils.currentUserId());
    }

    @Transactional(readOnly = true)
    public List<UserSummaryDto> listUsers(Role role) {
        return (role == null ? userRepository.findAll() : userRepository.findAllByRoleOrderByCreatedAtDesc(role)).stream()
                .map(userMapper::toSummary)
                .toList();
    }

    @Transactional(readOnly = true)
    public UserProfileDto getProfile(Long id) {
        return userMapper.toProfile(findUser(id));
    }

    @Transactional
    public UserProfileDto updateProfile(Long id, UpdateUserProfileRequest request) {
        if (!securityUtils.isSelfOrAdmin(id)) {
            throw new UnauthorizedException("You are not allowed to update this profile");
        }
        User user = findUser(id);
        if (request.firstName() != null && !request.firstName().isBlank()) {
            user.setFirstName(request.firstName().trim());
        }
        if (request.lastName() != null && !request.lastName().isBlank()) {
            user.setLastName(request.lastName().trim());
        }

        if (user.getRole() == Role.CANDIDATE) {
            CandidateProfile profile = candidateProfileRepository.findByUserId(id)
                    .orElseThrow(() -> new ResourceNotFoundException("Candidate profile for user " + id + " not found"));
            profile.setPhone(request.phone());
            profile.setAddress(request.address());
            profile.setSummary(request.summary());
            profile.setSkills(request.skills() == null ? List.of() : request.skills());
            candidateProfileRepository.save(profile);
        } else if (user.getRole() == Role.EMPLOYER) {
            EmployerProfile profile = employerProfileRepository.findByUserId(id)
                    .orElseThrow(() -> new ResourceNotFoundException("Employer profile for user " + id + " not found"));
            profile.setCompanyName(request.companyName());
            profile.setCompanyDescription(request.companyDescription());
            profile.setWebsite(request.website());
            profile.setIndustry(request.industry());
            employerProfileRepository.save(profile);
        }

        return userMapper.toProfile(userRepository.save(user));
    }

    @Transactional
    public UserProfileDto uploadCv(Long userId, MultipartFile file) {
        if (!securityUtils.isSelfOrAdmin(userId)) {
            throw new UnauthorizedException("You are not allowed to upload a CV for this user");
        }
        User user = findUser(userId);
        if (user.getRole() != Role.CANDIDATE) {
            throw new ValidationException("Only candidate accounts can upload a CV");
        }
        CandidateProfile candidateProfile = candidateProfileRepository.findByUserId(userId)
                .orElseThrow(() -> new ResourceNotFoundException("Candidate profile for user " + userId + " not found"));
        fileStorageService.deleteIfExists(candidateProfile.getCvUrl());
        candidateProfile.setCvUrl(fileStorageService.storeCv(userId, file));
        candidateProfileRepository.save(candidateProfile);
        return userMapper.toProfile(findUser(userId));
    }

    @Transactional(readOnly = true)
    public DownloadedFile downloadCv(Long userId) {
        User user = findUser(userId);
        if (!(securityUtils.isSelfOrAdmin(userId) || securityUtils.hasAnyRole(Role.EMPLOYER))) {
            throw new UnauthorizedException("You are not allowed to download this CV");
        }
        if (user.getRole() != Role.CANDIDATE) {
            throw new ValidationException("Only candidate accounts have CV files");
        }
        CandidateProfile candidateProfile = candidateProfileRepository.findByUserId(userId)
                .orElseThrow(() -> new ResourceNotFoundException("Candidate profile for user " + userId + " not found"));
        Resource resource = fileStorageService.loadCv(candidateProfile.getCvUrl());
        String fileName = Path.of(candidateProfile.getCvUrl()).getFileName().toString();
        return new DownloadedFile(resource, fileName);
    }

    @Transactional
    public void deleteUser(Long userId) {
        if (!securityUtils.isSelfOrAdmin(userId)) {
            throw new UnauthorizedException("You are not allowed to delete this user");
        }
        User user = findUser(userId);
        if (user.getRole() == Role.CANDIDATE) {
            candidateProfileRepository.findByUserId(userId).ifPresent(profile -> {
                fileStorageService.deleteIfExists(profile.getCvUrl());
                candidateProfileRepository.delete(profile);
            });
        } else if (user.getRole() == Role.EMPLOYER) {
            employerProfileRepository.findByUserId(userId).ifPresent(employerProfileRepository::delete);
        }
        userRepository.delete(user);
    }

    @Transactional
    public void changePassword(Long userId, ChangePasswordRequest request) {
        if (!securityUtils.isSelfOrAdmin(userId)) {
            throw new UnauthorizedException("You are not allowed to change the password for this user");
        }

        User user = findUser(userId);
        if (!passwordEncoder.matches(request.currentPassword(), user.getPasswordHash())) {
            throw new ValidationException("Current password is incorrect");
        }

        user.setPasswordHash(passwordEncoder.encode(request.newPassword()));
        userRepository.save(user);
    }

    private User findUser(Long id) {
        return userRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("User with id " + id + " not found"));
    }

    public record DownloadedFile(Resource resource, String fileName) {
    }
}

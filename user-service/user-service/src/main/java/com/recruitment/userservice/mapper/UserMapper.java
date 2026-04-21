package com.recruitment.userservice.mapper;

import com.recruitment.userservice.domain.CandidateProfile;
import com.recruitment.userservice.domain.EmployerProfile;
import com.recruitment.userservice.domain.User;
import com.recruitment.userservice.dto.user.CandidateProfileDto;
import com.recruitment.userservice.dto.user.EmployerProfileDto;
import com.recruitment.userservice.dto.user.UserProfileDto;
import com.recruitment.userservice.dto.user.UserSummaryDto;
import org.mapstruct.Mapper;

@Mapper(componentModel = "spring")
public interface UserMapper {

    UserSummaryDto toSummary(User user);

    CandidateProfileDto toCandidateProfile(CandidateProfile candidateProfile);

    EmployerProfileDto toEmployerProfile(EmployerProfile employerProfile);

    default UserProfileDto toProfile(User user) {
        Object profile = switch (user.getRole()) {
            case CANDIDATE -> user.getCandidateProfile() == null ? null : toCandidateProfile(user.getCandidateProfile());
            case EMPLOYER -> user.getEmployerProfile() == null ? null : toEmployerProfile(user.getEmployerProfile());
            case ADMIN -> null;
        };
        return new UserProfileDto(
                user.getId(),
                user.getEmail(),
                user.getFirstName(),
                user.getLastName(),
                user.getRole(),
                profile,
                user.getCreatedAt());
    }
}

package com.recruitment.userservice.repository;

import java.util.Optional;

import com.recruitment.userservice.domain.CandidateProfile;
import org.springframework.data.jpa.repository.JpaRepository;

public interface CandidateProfileRepository extends JpaRepository<CandidateProfile, Long> {
    Optional<CandidateProfile> findByUserId(Long userId);
}

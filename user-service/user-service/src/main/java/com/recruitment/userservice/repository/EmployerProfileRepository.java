package com.recruitment.userservice.repository;

import java.util.Optional;

import com.recruitment.userservice.domain.EmployerProfile;
import org.springframework.data.jpa.repository.JpaRepository;

public interface EmployerProfileRepository extends JpaRepository<EmployerProfile, Long> {
    Optional<EmployerProfile> findByUserId(Long userId);
}

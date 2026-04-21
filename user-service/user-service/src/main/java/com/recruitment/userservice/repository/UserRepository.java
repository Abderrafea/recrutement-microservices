package com.recruitment.userservice.repository;

import java.util.List;
import java.util.Optional;

import com.recruitment.userservice.domain.Role;
import com.recruitment.userservice.domain.User;
import org.springframework.data.jpa.repository.JpaRepository;

public interface UserRepository extends JpaRepository<User, Long> {
    Optional<User> findByEmailIgnoreCase(String email);

    boolean existsByEmailIgnoreCase(String email);

    List<User> findAllByRoleOrderByCreatedAtDesc(Role role);
}

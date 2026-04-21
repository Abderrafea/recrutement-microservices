package com.recruitment.userservice.controller;

import java.util.List;

import com.recruitment.userservice.dto.internal.CandidateSnapshotDto;
import com.recruitment.userservice.dto.internal.EmployerSnapshotDto;
import com.recruitment.userservice.dto.internal.UserStatisticsDto;
import com.recruitment.userservice.dto.user.UserSummaryDto;
import com.recruitment.userservice.service.InternalUserService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/users/internal")
@RequiredArgsConstructor
public class InternalUserController {

    private final InternalUserService internalUserService;

    @GetMapping("/users")
    public List<UserSummaryDto> listUsers(@RequestParam(required = false) String role) {
        return internalUserService.listUsers(role);
    }

    @GetMapping("/users/{id}")
    public UserSummaryDto getUser(@PathVariable Long id) {
        return internalUserService.getUser(id);
    }

    @GetMapping("/candidates/{id}")
    public CandidateSnapshotDto getCandidate(@PathVariable Long id) {
        return internalUserService.getCandidate(id);
    }

    @GetMapping("/employers/{id}")
    public EmployerSnapshotDto getEmployer(@PathVariable Long id) {
        return internalUserService.getEmployer(id);
    }

    @GetMapping("/stats")
    public UserStatisticsDto getStatistics() {
        return internalUserService.getStatistics();
    }
}

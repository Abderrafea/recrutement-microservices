package com.recruitment.userservice.controller;

import java.util.List;

import com.recruitment.userservice.domain.Role;
import com.recruitment.userservice.dto.user.UpdateUserProfileRequest;
import com.recruitment.userservice.dto.user.UserProfileDto;
import com.recruitment.userservice.dto.user.UserSummaryDto;
import com.recruitment.userservice.service.UserService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.core.io.Resource;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RequestPart;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;

@RestController
@RequestMapping("/api/users")
@RequiredArgsConstructor
public class UserController {

    private final UserService userService;

    @GetMapping("/me")
    public UserProfileDto getCurrentUser() {
        return userService.getCurrentUserProfile();
    }

    @GetMapping
    @PreAuthorize("hasRole('ADMIN')")
    public List<UserSummaryDto> listUsers(@RequestParam(required = false) Role role) {
        return userService.listUsers(role);
    }

    @GetMapping("/{id}")
    public UserProfileDto getUser(@PathVariable Long id) {
        return userService.getProfile(id);
    }

    @PutMapping("/{id}")
    public UserProfileDto updateUser(@PathVariable Long id, @Valid @org.springframework.web.bind.annotation.RequestBody UpdateUserProfileRequest request) {
        return userService.updateProfile(id, request);
    }

    @PostMapping(path = "/{id}/cv", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    @ResponseStatus(HttpStatus.CREATED)
    public UserProfileDto uploadCv(@PathVariable Long id, @RequestPart("file") MultipartFile file) {
        return userService.uploadCv(id, file);
    }

    @GetMapping("/{id}/cv")
    public ResponseEntity<Resource> downloadCv(@PathVariable Long id) {
        UserService.DownloadedFile downloadedFile = userService.downloadCv(id);
        return ResponseEntity.ok()
                .contentType(MediaType.APPLICATION_OCTET_STREAM)
                .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=\"" + downloadedFile.fileName() + "\"")
                .body(downloadedFile.resource());
    }

    @DeleteMapping("/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void deleteUser(@PathVariable Long id) {
        userService.deleteUser(id);
    }
}

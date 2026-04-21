package com.recruitment.userservice.service;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.nio.file.StandardCopyOption;
import java.util.UUID;

import com.recruitment.userservice.config.StorageProperties;
import com.recruitment.userservice.exception.ResourceNotFoundException;
import com.recruitment.userservice.exception.ValidationException;
import jakarta.annotation.PostConstruct;
import lombok.RequiredArgsConstructor;
import org.springframework.core.io.PathResource;
import org.springframework.core.io.Resource;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

@Service
@RequiredArgsConstructor
public class FileStorageService {

    private final StorageProperties storageProperties;

    private Path cvStorageDirectory;

    @PostConstruct
    void init() {
        try {
            cvStorageDirectory = Paths.get(storageProperties.cvDirectory()).toAbsolutePath().normalize();
            Files.createDirectories(cvStorageDirectory);
        } catch (IOException exception) {
            throw new IllegalStateException("Unable to initialize CV storage directory", exception);
        }
    }

    public String storeCv(Long userId, MultipartFile file) {
        if (file.isEmpty()) {
            throw new ValidationException("Uploaded CV file is empty");
        }
        String originalFilename = file.getOriginalFilename() == null ? "cv.pdf" : file.getOriginalFilename();
        String safeFilename = originalFilename.replaceAll("[^a-zA-Z0-9.\\-]", "_");
        String storedFileName = userId + "-" + UUID.randomUUID() + "-" + safeFilename;
        Path target = cvStorageDirectory.resolve(storedFileName);
        try {
            file.transferTo(target);
        } catch (IOException exception) {
            throw new IllegalStateException("Unable to store CV file", exception);
        }
        return target.toString();
    }

    public Resource loadCv(String path) {
        Path filePath = Paths.get(path).toAbsolutePath().normalize();
        if (!Files.exists(filePath)) {
            throw new ResourceNotFoundException("CV file not found");
        }
        return new PathResource(filePath);
    }

    public void deleteIfExists(String path) {
        if (path == null || path.isBlank()) {
            return;
        }
        try {
            Files.deleteIfExists(Paths.get(path));
        } catch (IOException exception) {
            throw new IllegalStateException("Unable to delete stored file", exception);
        }
    }
}

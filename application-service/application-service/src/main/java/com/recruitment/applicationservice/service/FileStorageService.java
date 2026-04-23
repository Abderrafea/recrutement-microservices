package com.recruitment.applicationservice.service;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.nio.file.StandardCopyOption;
import java.util.UUID;

import com.recruitment.applicationservice.config.StorageProperties;
import com.recruitment.applicationservice.exception.ResourceNotFoundException;
import com.recruitment.applicationservice.exception.ValidationException;
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
            throw new IllegalStateException("Unable to initialize application CV storage directory", exception);
        }
    }

    public String storeCv(Long applicationId, MultipartFile file) {
        if (file.isEmpty()) {
            throw new ValidationException("Uploaded CV file is empty");
        }

        String originalFilename = file.getOriginalFilename() == null ? "cv.pdf" : file.getOriginalFilename();
        String extension = originalFilename.contains(".")
                ? originalFilename.substring(originalFilename.lastIndexOf('.'))
                : ".pdf";
        String safeExtension = extension.replaceAll("[^a-zA-Z0-9.]", "");
        String storedFileName = "app-" + applicationId + "-" + UUID.randomUUID() + safeExtension;
        Path target = cvStorageDirectory.resolve(storedFileName);

        try {
            Files.copy(file.getInputStream(), target, StandardCopyOption.REPLACE_EXISTING);
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

    public String resolveFileName(String path) {
        if (path == null || path.isBlank()) {
            return null;
        }
        return Path.of(path).getFileName().toString();
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

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
    private Path coverLetterStorageDirectory;

    @PostConstruct
    void init() {
        try {
            cvStorageDirectory = Paths.get(storageProperties.cvDirectory()).toAbsolutePath().normalize();
            Files.createDirectories(cvStorageDirectory);

            String coverLetterDir = storageProperties.coverLetterDirectory() != null
                    ? storageProperties.coverLetterDirectory()
                    : storageProperties.cvDirectory() + "/cover-letters";
            coverLetterStorageDirectory = Paths.get(coverLetterDir).toAbsolutePath().normalize();
            Files.createDirectories(coverLetterStorageDirectory);
        } catch (IOException exception) {
            throw new IllegalStateException("Unable to initialize application storage directories", exception);
        }
    }

    public String storeCv(Long applicationId, MultipartFile file) {
        return storeFile(applicationId, file, cvStorageDirectory, "cv");
    }

    public String storeCoverLetter(Long applicationId, MultipartFile file) {
        return storeFile(applicationId, file, coverLetterStorageDirectory, "cover-letter");
    }

    private String storeFile(Long applicationId, MultipartFile file, Path storageDir, String prefix) {
        if (file.isEmpty()) {
            throw new ValidationException("Uploaded file is empty");
        }

        String originalFilename = file.getOriginalFilename() == null ? prefix + ".pdf" : file.getOriginalFilename();
        String extension = originalFilename.contains(".")
                ? originalFilename.substring(originalFilename.lastIndexOf('.'))
                : ".pdf";
        String safeExtension = extension.replaceAll("[^a-zA-Z0-9.]", "");
        String storedFileName = "app-" + applicationId + "-" + prefix + "-" + UUID.randomUUID() + safeExtension;
        Path target = storageDir.resolve(storedFileName);

        try {
            Files.copy(file.getInputStream(), target, StandardCopyOption.REPLACE_EXISTING);
        } catch (IOException exception) {
            throw new IllegalStateException("Unable to store file", exception);
        }

        return target.toString();
    }

    public Resource loadCv(String path) {
        return loadFile(path, "CV");
    }

    public Resource loadCoverLetter(String path) {
        return loadFile(path, "Cover letter");
    }

    private Resource loadFile(String path, String label) {
        Path filePath = Paths.get(path).toAbsolutePath().normalize();
        if (!Files.exists(filePath)) {
            throw new ResourceNotFoundException(label + " file not found");
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

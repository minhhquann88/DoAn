package com.coursemgmt.service;

import com.coursemgmt.exception.ResourceNotFoundException;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.core.io.Resource;
import org.springframework.core.io.UrlResource;
import org.springframework.stereotype.Service;
import org.springframework.util.StringUtils;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.net.MalformedURLException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.nio.file.StandardCopyOption;
import java.util.Objects;
import java.util.UUID;

@Service
public class FileStorageService {

    private final Path avatarStorageLocation;
    private final String avatarBaseUrl;

    public FileStorageService(@Value("${avatar.storage.path:./uploads/avatars}") String avatarStoragePath,
                              @Value("${avatar.base-url:http://localhost:8080/api/files/avatars}") String avatarBaseUrl) {
        this.avatarStorageLocation = Paths.get(avatarStoragePath).toAbsolutePath().normalize();
        this.avatarBaseUrl = avatarBaseUrl;
        try {
            Files.createDirectories(this.avatarStorageLocation);
        } catch (Exception ex) {
            throw new RuntimeException("Could not create the directory where the uploaded files will be stored.", ex);
        }
    }

    public String storeAvatar(MultipartFile file, Long userId) {
        // Normalize file name
        String originalFileName = StringUtils.cleanPath(Objects.requireNonNull(file.getOriginalFilename()));
        String fileExtension = "";
        int dotIndex = originalFileName.lastIndexOf('.');
        if (dotIndex > 0) {
            fileExtension = originalFileName.substring(dotIndex);
        }

        // Validate file type (only images)
        if (!file.getContentType().startsWith("image/")) {
            throw new RuntimeException("Invalid file type. Only image files are allowed.");
        }

        // Validate file size (max 5MB)
        if (file.getSize() > 5 * 1024 * 1024) { // 5 MB
            throw new RuntimeException("File size exceeds the limit of 5MB.");
        }

        // Create unique file name: userId_timestamp_uuid.extension
        String fileName = userId + "_" + System.currentTimeMillis() + "_" + UUID.randomUUID().toString().substring(0, 8) + fileExtension;

        try {
            Path targetLocation = this.avatarStorageLocation.resolve(fileName);
            Files.copy(file.getInputStream(), targetLocation, StandardCopyOption.REPLACE_EXISTING);
            return avatarBaseUrl + "/" + fileName;
        } catch (IOException ex) {
            throw new RuntimeException("Could not store file " + fileName + ". Please try again!", ex);
        }
    }

    public Resource loadFileAsResource(String fileName) {
        try {
            Path filePath = this.avatarStorageLocation.resolve(fileName).normalize();
            Resource resource = new UrlResource(filePath.toUri());
            if (resource.exists()) {
                return resource;
            } else {
                throw new ResourceNotFoundException("File not found " + fileName);
            }
        } catch (MalformedURLException ex) {
            throw new ResourceNotFoundException("File not found " + fileName);
        }
    }

    public void deleteFile(String fileName) {
        try {
            Path filePath = this.avatarStorageLocation.resolve(fileName).normalize();
            Files.deleteIfExists(filePath);
        } catch (IOException ex) {
            throw new RuntimeException("Could not delete file " + fileName, ex);
        }
    }
}


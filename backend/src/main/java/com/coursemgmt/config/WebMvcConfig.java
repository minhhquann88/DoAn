package com.coursemgmt.config;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Configuration;
import org.springframework.lang.NonNull;
import org.springframework.web.servlet.config.annotation.ResourceHandlerRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

import java.nio.file.Path;
import java.nio.file.Paths;

/**
 * Configuration để serve static files (avatars, certificates, etc.)
 */
@Configuration
public class WebMvcConfig implements WebMvcConfigurer {

    @Value("${avatar.storage.path:./uploads/avatars}")
    private String avatarStoragePath;

    @Value("${certificate.storage.path:./certificates}")
    private String certificateStoragePath;

    @Override
    public void addResourceHandlers(@NonNull ResourceHandlerRegistry registry) {
        // Serve avatar files
        Path avatarPath = Paths.get(avatarStoragePath).toAbsolutePath().normalize();
        String avatarLocation = "file:" + avatarPath + "/";
        registry.addResourceHandler("/api/files/avatars/**")
                .addResourceLocations(avatarLocation)
                .setCachePeriod(3600); // Cache 1 hour

        // Serve certificate files
        Path certificatePath = Paths.get(certificateStoragePath).toAbsolutePath().normalize();
        String certificateLocation = "file:" + certificatePath + "/";
        registry.addResourceHandler("/certificates/**")
                .addResourceLocations(certificateLocation)
                .setCachePeriod(3600); // Cache 1 hour
    }
}

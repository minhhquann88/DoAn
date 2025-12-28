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

    @Value("${course.image.storage.path:./uploads/courses}")
    private String courseImageStoragePath;

    @Value("${lesson.video.storage.path:./uploads/lessons/videos}")
    private String lessonVideoStoragePath;

    @Value("${lesson.document.storage.path:./uploads/lessons/documents}")
    private String lessonDocumentStoragePath;

    @Value("${lesson.slide.storage.path:./uploads/lessons/slides}")
    private String lessonSlideStoragePath;

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

        // Serve course image files
        Path courseImagePath = Paths.get(courseImageStoragePath).toAbsolutePath().normalize();
        String courseImageLocation = "file:" + courseImagePath + "/";
        registry.addResourceHandler("/api/files/courses/**")
                .addResourceLocations(courseImageLocation)
                .setCachePeriod(3600); // Cache 1 hour

        // Serve lesson video files
        Path lessonVideoPath = Paths.get(lessonVideoStoragePath).toAbsolutePath().normalize();
        String lessonVideoLocation = "file:" + lessonVideoPath + "/";
        registry.addResourceHandler("/api/files/lessons/videos/**")
                .addResourceLocations(lessonVideoLocation)
                .setCachePeriod(3600); // Cache 1 hour

        // Serve lesson document files
        Path lessonDocumentPath = Paths.get(lessonDocumentStoragePath).toAbsolutePath().normalize();
        String lessonDocumentLocation = "file:" + lessonDocumentPath + "/";
        registry.addResourceHandler("/api/files/lessons/documents/**")
                .addResourceLocations(lessonDocumentLocation)
                .setCachePeriod(3600); // Cache 1 hour

        // Serve lesson slide files
        Path lessonSlidePath = Paths.get(lessonSlideStoragePath).toAbsolutePath().normalize();
        String lessonSlideLocation = "file:" + lessonSlidePath + "/";
        registry.addResourceHandler("/api/files/lessons/slides/**")
                .addResourceLocations(lessonSlideLocation)
                .setCachePeriod(3600); // Cache 1 hour
    }
}

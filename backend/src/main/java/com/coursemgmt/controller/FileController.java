package com.coursemgmt.controller;

import com.coursemgmt.service.FileStorageService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.core.io.Resource;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import jakarta.servlet.http.HttpServletRequest;
import java.io.IOException;
import java.net.URLEncoder;
import java.nio.charset.StandardCharsets;

@CrossOrigin(origins = "*", maxAge = 3600)
@RestController
@RequestMapping("/api/files")
public class FileController {

    @Autowired
    private FileStorageService fileStorageService;

    /**
     * Serve lesson documents for inline viewing (not download)
     * This endpoint sets Content-Disposition: inline to allow browser to display the file
     */
    @GetMapping("/view/documents/{fileName:.+}")
    public ResponseEntity<Resource> viewDocument(@PathVariable String fileName, HttpServletRequest request) {
        Resource resource = fileStorageService.loadLessonDocumentAsResource(fileName);

        // Determine content type
        String contentType = null;
        try {
            contentType = request.getServletContext().getMimeType(resource.getFile().getAbsolutePath());
        } catch (IOException ex) {
            // Could not determine file type
        }

        // Fallback to octet-stream if type could not be determined
        if (contentType == null) {
            // Try to determine from file extension
            String lowerFileName = fileName.toLowerCase();
            if (lowerFileName.endsWith(".pdf")) {
                contentType = "application/pdf";
            } else if (lowerFileName.endsWith(".doc")) {
                contentType = "application/msword";
            } else if (lowerFileName.endsWith(".docx")) {
                contentType = "application/vnd.openxmlformats-officedocument.wordprocessingml.document";
            } else {
                contentType = "application/octet-stream";
            }
        }

        // Encode filename for Content-Disposition header
        String encodedFileName = URLEncoder.encode(fileName, StandardCharsets.UTF_8).replace("+", "%20");

        return ResponseEntity.ok()
                .contentType(MediaType.parseMediaType(contentType))
                .header(HttpHeaders.CONTENT_DISPOSITION, "inline; filename=\"" + encodedFileName + "\"")
                .header(HttpHeaders.CACHE_CONTROL, "public, max-age=3600")
                .header("X-Frame-Options", "SAMEORIGIN")
                .header("Content-Security-Policy", "frame-ancestors 'self' http://localhost:3000 http://localhost:5173")
                .body(resource);
    }

    /**
     * Serve lesson videos for inline viewing
     */
    @GetMapping("/view/videos/{fileName:.+}")
    public ResponseEntity<Resource> viewVideo(@PathVariable String fileName, HttpServletRequest request) {
        Resource resource = fileStorageService.loadLessonVideoAsResource(fileName);

        // Determine content type
        String contentType = null;
        try {
            contentType = request.getServletContext().getMimeType(resource.getFile().getAbsolutePath());
        } catch (IOException ex) {
            // Could not determine file type
        }

        if (contentType == null) {
            String lowerFileName = fileName.toLowerCase();
            if (lowerFileName.endsWith(".mp4")) {
                contentType = "video/mp4";
            } else if (lowerFileName.endsWith(".webm")) {
                contentType = "video/webm";
            } else if (lowerFileName.endsWith(".ogg")) {
                contentType = "video/ogg";
            } else {
                contentType = "video/mp4";
            }
        }

        return ResponseEntity.ok()
                .contentType(MediaType.parseMediaType(contentType))
                .header(HttpHeaders.CONTENT_DISPOSITION, "inline; filename=\"" + fileName + "\"")
                .header(HttpHeaders.CACHE_CONTROL, "public, max-age=3600")
                .body(resource);
    }

    /**
     * Serve lesson slides for inline viewing
     */
    @GetMapping("/view/slides/{fileName:.+}")
    public ResponseEntity<Resource> viewSlide(@PathVariable String fileName, HttpServletRequest request) {
        Resource resource = fileStorageService.loadLessonSlideAsResource(fileName);

        // Determine content type
        String contentType = null;
        try {
            contentType = request.getServletContext().getMimeType(resource.getFile().getAbsolutePath());
        } catch (IOException ex) {
            // Could not determine file type
        }

        if (contentType == null) {
            String lowerFileName = fileName.toLowerCase();
            if (lowerFileName.endsWith(".pdf")) {
                contentType = "application/pdf";
            } else if (lowerFileName.endsWith(".ppt")) {
                contentType = "application/vnd.ms-powerpoint";
            } else if (lowerFileName.endsWith(".pptx")) {
                contentType = "application/vnd.openxmlformats-officedocument.presentationml.presentation";
            } else if (lowerFileName.endsWith(".odp")) {
                contentType = "application/vnd.oasis.opendocument.presentation";
            } else {
                contentType = "application/octet-stream";
            }
        }

        String encodedFileName = URLEncoder.encode(fileName, StandardCharsets.UTF_8).replace("+", "%20");

        return ResponseEntity.ok()
                .contentType(MediaType.parseMediaType(contentType))
                .header(HttpHeaders.CONTENT_DISPOSITION, "inline; filename=\"" + encodedFileName + "\"")
                .header(HttpHeaders.CACHE_CONTROL, "public, max-age=3600")
                .header("X-Frame-Options", "SAMEORIGIN")
                .body(resource);
    }
}


package com.coursemgmt.service;

import com.coursemgmt.model.*;
import com.coursemgmt.repository.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.MediaType;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.stereotype.Service;
import org.springframework.web.reactive.function.client.WebClient;

import java.time.Duration;
import java.util.*;

/**
 * UC-CHAT-01: Chatbot Service với Google Gemini API và RAG (Retrieval Augmented Generation)
 * Lấy context từ khóa học để trả lời câu hỏi của học viên
 */
@Service
public class ChatService {

    @Value("${gemini.api.key}")
    private String geminiApiKey;

    @Value("${gemini.api.url:https://generativelanguage.googleapis.com/v1beta}")
    private String geminiApiUrl;

    @Value("${gemini.api.model:gemini-2.5-flash}")
    private String geminiModel;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private CourseRepository courseRepository;

    @Autowired
    private EnrollmentRepository enrollmentRepository;

    @Autowired
    private ChapterRepository chapterRepository;

    // LessonRepository not used in current implementation, but may be needed for future enhancements

    private final WebClient webClient;

    public ChatService() {
        this.webClient = WebClient.builder()
                .baseUrl("https://generativelanguage.googleapis.com/v1beta")
                .defaultHeader("Content-Type", MediaType.APPLICATION_JSON_VALUE)
                .build();
    }

    /**
     * UC-CHAT-01: Xử lý câu hỏi từ học viên với RAG
     * 
     * @param question Câu hỏi của học viên
     * @param courseId Optional: ID khóa học để lấy context cụ thể
     * @return Câu trả lời từ Gemini API với context từ khóa học
     */
    public String chat(String question, Long courseId) {
        try {
            // 1. Lấy user hiện tại
            Long userId = getCurrentUserId();
            if (userId == null) {
                return "Xin lỗi, bạn cần đăng nhập để sử dụng chatbot.";
            }

            // 2. RAG: Lấy context từ khóa học
            String courseContext = buildCourseContext(userId, courseId);
            
            // 3. Xây dựng prompt với context
            String prompt = buildPrompt(question, courseContext, userId);
            
            // 4. Gọi Gemini API
            String response = callGeminiAPI(prompt);
            
            return response;
        } catch (Exception e) {
            System.err.println("ChatService error: " + e.getMessage());
            e.printStackTrace();
            return "Xin lỗi, tôi đang gặp sự cố. Vui lòng thử lại sau.";
        }
    }

    /**
     * RAG: Xây dựng context từ khóa học của user
     */
    private String buildCourseContext(Long userId, Long courseId) {
        StringBuilder context = new StringBuilder();
        
        try {
            // Lấy thông tin user
            User user = userRepository.findById(userId).orElse(null);
            if (user != null) {
                context.append("Học viên: ").append(user.getFullName()).append("\n");
            }

            // Nếu có courseId cụ thể, lấy context của khóa học đó
            if (courseId != null) {
                Course course = courseRepository.findById(courseId).orElse(null);
                if (course != null) {
                    context.append("\n=== THÔNG TIN KHÓA HỌC ===\n");
                    context.append("Tên khóa học: ").append(course.getTitle()).append("\n");
                    context.append("Mô tả: ").append(course.getDescription()).append("\n");
                    
                    // Lấy chapters và lessons
                    List<Chapter> chapters = chapterRepository.findByCourseIdWithLessons(courseId);
                    if (chapters != null && !chapters.isEmpty()) {
                        context.append("\n=== NỘI DUNG KHÓA HỌC ===\n");
                        for (Chapter chapter : chapters) {
                            context.append("\nChương ").append(chapter.getPosition()).append(": ")
                                   .append(chapter.getTitle()).append("\n");
                            
                            if (chapter.getLessons() != null) {
                                for (Lesson lesson : chapter.getLessons()) {
                                    context.append("  - Bài ").append(lesson.getPosition()).append(": ")
                                           .append(lesson.getTitle()).append("\n");
                                    if (lesson.getContent() != null && !lesson.getContent().isEmpty()) {
                                        // Lấy một phần nội dung (tránh quá dài)
                                        String content = lesson.getContent().length() > 200 
                                            ? lesson.getContent().substring(0, 200) + "..."
                                            : lesson.getContent();
                                        context.append("    Nội dung: ").append(content).append("\n");
                                    }
                                }
                            }
                        }
                    }
                }
            } else {
                // Lấy tất cả khóa học đã đăng ký của user
                List<Enrollment> enrollments = enrollmentRepository.findByUserIdWithCourse(userId);
                if (enrollments != null && !enrollments.isEmpty()) {
                    context.append("\n=== CÁC KHÓA HỌC ĐÃ ĐĂNG KÝ ===\n");
                    for (Enrollment enrollment : enrollments) {
                        if (enrollment.getCourse() != null) {
                            Course course = enrollment.getCourse();
                            context.append("- ").append(course.getTitle());
                            if (enrollment.getProgress() != null) {
                                context.append(" (Tiến độ: ").append(String.format("%.1f", enrollment.getProgress()))
                                       .append("%)");
                            }
                            context.append("\n");
                        }
                    }
                }
            }
        } catch (Exception e) {
            System.err.println("Error building course context: " + e.getMessage());
        }
        
        return context.toString();
    }

    /**
     * Xây dựng prompt cho Gemini API
     */
    private String buildPrompt(String question, String courseContext, Long userId) {
        StringBuilder prompt = new StringBuilder();
        
        prompt.append("Bạn là trợ lý AI thông minh của một nền tảng học trực tuyến (E-Learning). ");
        prompt.append("Nhiệm vụ của bạn là trả lời câu hỏi của học viên về các khóa học và nội dung học tập.\n\n");
        
        if (!courseContext.isEmpty()) {
            prompt.append("=== THÔNG TIN NGỮ CẢNH ===\n");
            prompt.append(courseContext).append("\n\n");
        }
        
        prompt.append("=== CÂU HỎI CỦA HỌC VIÊN ===\n");
        prompt.append(question).append("\n\n");
        
        prompt.append("=== HƯỚNG DẪN ===\n");
        prompt.append("- Trả lời câu hỏi dựa trên thông tin ngữ cảnh được cung cấp.\n");
        prompt.append("- Nếu câu hỏi liên quan đến khóa học cụ thể, hãy tham khảo thông tin trong phần ngữ cảnh.\n");
        prompt.append("- Trả lời bằng tiếng Việt, ngắn gọn, dễ hiểu.\n");
        prompt.append("- Nếu không có thông tin trong ngữ cảnh, hãy trả lời chung chung hoặc đề xuất học viên liên hệ hỗ trợ.\n");
        prompt.append("- Luôn thân thiện và hỗ trợ học viên.\n");
        
        return prompt.toString();
    }

    /**
     * Gọi Google Gemini API
     */
    private String callGeminiAPI(String prompt) {
        try {
            String url = String.format("%s/models/%s:generateContent?key=%s", 
                geminiApiUrl, geminiModel, geminiApiKey);
            
            Map<String, Object> requestBody = new HashMap<>();
            Map<String, Object> content = new HashMap<>();
            Map<String, Object> part = new HashMap<>();
            part.put("text", prompt);
            
            List<Map<String, Object>> parts = new ArrayList<>();
            parts.add(part);
            content.put("parts", parts);
            
            List<Map<String, Object>> contents = new ArrayList<>();
            contents.add(content);
            requestBody.put("contents", contents);
            
            // Safety settings (optional)
            Map<String, String> safetySettings = new HashMap<>();
            safetySettings.put("category", "HARM_CATEGORY_HARASSMENT");
            safetySettings.put("threshold", "BLOCK_MEDIUM_AND_ABOVE");
            
            System.out.println("========================================");
            System.out.println("Calling Gemini API");
            System.out.println("URL: " + url);
            System.out.println("Model: " + geminiModel);
            System.out.println("Prompt length: " + prompt.length());
            System.out.println("========================================");
            
            Map<String, Object> response = webClient.post()
                    .uri(url)
                    .bodyValue(requestBody)
                    .retrieve()
                    .bodyToMono(Map.class)
                    .timeout(Duration.ofSeconds(30))
                    .block();
            
            if (response == null) {
                throw new RuntimeException("Empty response from Gemini API");
            }
            
            // Parse response
            @SuppressWarnings("unchecked")
            List<Map<String, Object>> candidates = (List<Map<String, Object>>) response.get("candidates");
            if (candidates == null || candidates.isEmpty()) {
                @SuppressWarnings("unchecked")
                Map<String, Object> promptFeedback = (Map<String, Object>) response.get("promptFeedback");
                if (promptFeedback != null) {
                    @SuppressWarnings("unchecked")
                    Map<String, Object> blockReason = (Map<String, Object>) promptFeedback.get("blockReason");
                    if (blockReason != null) {
                        return "Xin lỗi, câu hỏi của bạn không phù hợp với chính sách của hệ thống.";
                    }
                }
                throw new RuntimeException("No candidates in response");
            }
            
            @SuppressWarnings("unchecked")
            Map<String, Object> candidate = candidates.get(0);
            @SuppressWarnings("unchecked")
            Map<String, Object> contentResponse = (Map<String, Object>) candidate.get("content");
            @SuppressWarnings("unchecked")
            List<Map<String, Object>> partsResponse = (List<Map<String, Object>>) contentResponse.get("parts");
            @SuppressWarnings("unchecked")
            String text = (String) partsResponse.get(0).get("text");
            
            System.out.println("Gemini API Response received: " + (text != null ? text.length() : 0) + " characters");
            
            return text != null ? text : "Xin lỗi, không thể tạo phản hồi.";
            
        } catch (Exception e) {
            System.err.println("Error calling Gemini API: " + e.getMessage());
            e.printStackTrace();
            throw new RuntimeException("Failed to call Gemini API: " + e.getMessage(), e);
        }
    }

    /**
     * Helper: Lấy user ID hiện tại
     */
    private Long getCurrentUserId() {
        try {
            Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
            if (authentication == null || !(authentication.getPrincipal() instanceof UserDetails)) {
                return null;
            }
            UserDetails userDetails = (UserDetails) authentication.getPrincipal();
            String username = userDetails.getUsername();
            User user = userRepository.findByUsername(username).orElse(null);
            return user != null ? user.getId() : null;
        } catch (Exception e) {
            System.err.println("Error getting current user ID: " + e.getMessage());
            return null;
        }
    }
}


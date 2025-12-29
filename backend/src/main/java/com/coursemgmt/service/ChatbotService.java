package com.coursemgmt.service;

import com.coursemgmt.dto.ChatRequest;
import com.coursemgmt.dto.ChatResponse;
import com.coursemgmt.model.Course;
import com.coursemgmt.repository.CourseRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.*;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import java.util.HashMap;
import java.util.Map;
import java.util.Optional;

@Service
@RequiredArgsConstructor
@Slf4j
public class ChatbotService {
    
    private final RestTemplate restTemplate = new RestTemplate();
    private final CourseRepository courseRepository;
    
    @Value("${gemini.api.key:}")
    private String geminiApiKey;
    
    @Value("${gemini.api.url:https://generativelanguage.googleapis.com/v1beta}")
    private String geminiApiUrl;
    
    @Value("${gemini.api.model:gemini-2.0-flash-exp}")
    private String geminiModel;
    
    public ChatResponse processMessage(ChatRequest request, Long userId) {
        try {
            // Build context from course if courseId is provided
            String context = buildContext(request.getCourseId());
            
            // Build prompt with context
            String prompt = buildPrompt(request.getMessage(), context);
            
            // Call Gemini API
            String response = callGeminiAPI(prompt);
            
            ChatResponse chatResponse = new ChatResponse();
            chatResponse.setResponse(response);
            chatResponse.setMessage(response);
            chatResponse.setCourseId(request.getCourseId());
            return chatResponse;
        } catch (Exception e) {
            log.error("Error processing chatbot message: {}", e.getMessage(), e);
            ChatResponse errorResponse = new ChatResponse();
            errorResponse.setResponse("Xin lỗi, tôi đang gặp sự cố kết nối. Vui lòng thử lại sau.");
            errorResponse.setMessage("Xin lỗi, tôi đang gặp sự cố kết nối. Vui lòng thử lại sau.");
            return errorResponse;
        }
    }
    
    private String buildContext(Long courseId) {
        if (courseId == null) {
            return "Bạn là trợ lý ảo của nền tảng E-learning. Bạn có thể giúp người dùng tìm hiểu về các khóa học, đăng ký khóa học, chính sách hoàn tiền, và các câu hỏi khác liên quan đến nền tảng.";
        }
        
        Optional<Course> courseOpt = courseRepository.findById(courseId);
        if (courseOpt.isPresent()) {
            Course course = courseOpt.get();
            return String.format(
                "Bạn đang trả lời câu hỏi về khóa học: %s. Mô tả: %s. Giá: %s VNĐ. Trạng thái: %s.",
                course.getTitle(),
                course.getDescription() != null ? course.getDescription() : "Không có mô tả",
                course.getPrice() != null ? course.getPrice().toString() : "Miễn phí",
                course.getStatus()
            );
        }
        
        return "Khóa học không tồn tại.";
    }
    
    private String buildPrompt(String userMessage, String context) {
        return String.format(
            "%s\n\nNgười dùng hỏi: %s\n\nHãy trả lời một cách thân thiện và hữu ích bằng tiếng Việt.",
            context,
            userMessage
        );
    }
    
    private String callGeminiAPI(String prompt) {
        if (geminiApiKey == null || geminiApiKey.isEmpty()) {
            log.warn("Gemini API key not configured");
            return "Xin lỗi, dịch vụ chatbot chưa được cấu hình. Vui lòng liên hệ quản trị viên.";
        }
        
        try {
            String url = String.format("%s/models/%s:generateContent?key=%s", 
                geminiApiUrl, geminiModel, geminiApiKey);
            
            Map<String, Object> requestBody = new HashMap<>();
            Map<String, Object> content = new HashMap<>();
            Map<String, Object> part = new HashMap<>();
            part.put("text", prompt);
            content.put("parts", new Object[]{part});
            requestBody.put("contents", new Object[]{content});
            
            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_JSON);
            
            HttpEntity<Map<String, Object>> entity = new HttpEntity<>(requestBody, headers);
            
            @SuppressWarnings("unchecked")
            ResponseEntity<Map> response = restTemplate.postForEntity(url, entity, Map.class);
            
            if (response.getStatusCode() == HttpStatus.OK && response.getBody() != null) {
                @SuppressWarnings("unchecked")
                Map<String, Object> body = (Map<String, Object>) response.getBody();
                // Parse Gemini API response
                return parseGeminiResponse(body);
            } else {
                log.error("Gemini API returned error: {}", response.getStatusCode());
                return "Xin lỗi, không thể kết nối đến dịch vụ AI. Vui lòng thử lại sau.";
            }
        } catch (Exception e) {
            log.error("Error calling Gemini API: {}", e.getMessage(), e);
            return "Xin lỗi, tôi đang gặp sự cố kết nối. Vui lòng thử lại sau.";
        }
    }
    
    @SuppressWarnings("unchecked")
    private String parseGeminiResponse(Map<String, Object> response) {
        try {
            if (response.containsKey("candidates") && response.get("candidates") instanceof java.util.List) {
                java.util.List<Map<String, Object>> candidates = (java.util.List<Map<String, Object>>) response.get("candidates");
                if (!candidates.isEmpty()) {
                    Map<String, Object> candidate = candidates.get(0);
                    if (candidate.containsKey("content")) {
                        Map<String, Object> content = (Map<String, Object>) candidate.get("content");
                        if (content.containsKey("parts") && content.get("parts") instanceof java.util.List) {
                            java.util.List<Map<String, Object>> parts = (java.util.List<Map<String, Object>>) content.get("parts");
                            if (!parts.isEmpty() && parts.get(0).containsKey("text")) {
                                return (String) parts.get(0).get("text");
                            }
                        }
                    }
                }
            }
            return "Xin lỗi, không thể xử lý phản hồi từ AI.";
        } catch (Exception e) {
            log.error("Error parsing Gemini response: {}", e.getMessage(), e);
            return "Xin lỗi, không thể xử lý phản hồi từ AI.";
        }
    }
}


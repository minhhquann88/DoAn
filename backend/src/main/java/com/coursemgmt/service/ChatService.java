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
     * UC-CHAT-01: Xử lý câu hỏi với RAG
     * Hỗ trợ cả người dùng đã đăng nhập và khách (guest)
     * 
     * @param question Câu hỏi của người dùng
     * @param courseId Optional: ID khóa học để lấy context cụ thể
     * @return Câu trả lời từ Gemini API với context từ khóa học
     */
    public String chat(String question, Long courseId) {
        try {
            // 1. Lấy user hiện tại (có thể null nếu là guest)
            Long userId = getCurrentUserId();
            User user = userId != null ? userRepository.findById(userId).orElse(null) : null;
            
            System.out.println("========================================");
            System.out.println("ChatService.chat - User ID: " + userId);
            System.out.println("Is Guest: " + (userId == null));
            if (user != null) {
                System.out.println("User: " + user.getFullName());
                System.out.println("Roles: " + user.getRoles());
            }
            System.out.println("========================================");

            // 2. RAG: Lấy context từ khóa học (khác nhau cho guest và authenticated user)
            String courseContext = buildCourseContext(userId, courseId, user);
            
            // 3. Xây dựng prompt với context
            String prompt = buildPrompt(question, courseContext, userId, user);
            
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
     * RAG: Xây dựng context từ khóa học
     * - Guest: chỉ lấy thông tin khóa học công khai (published)
     * - Authenticated: lấy thông tin user + khóa học đã đăng ký/giảng dạy
     */
    private String buildCourseContext(Long userId, Long courseId, User user) {
        StringBuilder context = new StringBuilder();
        
        try {
            // Nếu là guest (user == null), chỉ lấy thông tin khóa học công khai
            if (user == null) {
                context.append("Người dùng: Khách (chưa đăng nhập)\n");
                context.append("Lưu ý: Chỉ có thể truy cập thông tin khóa học công khai.\n");
            } else {
                // Authenticated user: lấy thông tin đầy đủ
                String userRole = getUserRoleLabel(user);
                context.append(userRole).append(": ").append(user.getFullName()).append("\n");
                
                // Log role để debug
                System.out.println("ChatService.buildCourseContext: User " + user.getFullName() + 
                                 " has role: " + userRole);
            }

            // Nếu có courseId cụ thể, lấy context của khóa học đó
            if (courseId != null) {
                Course course = courseRepository.findById(courseId).orElse(null);
                if (course != null) {
                    // Guest chỉ xem được khóa học đã published
                    if (user == null && course.getStatus() != ECourseStatus.PUBLISHED) {
                        context.append("\n=== THÔNG BÁO ===\n");
                        context.append("Khóa học này chưa được công khai hoặc bạn cần đăng nhập để xem.\n");
                    } else {
                        context.append("\n=== THÔNG TIN KHÓA HỌC ===\n");
                        context.append("Tên khóa học: ").append(course.getTitle()).append("\n");
                        context.append("Mô tả: ").append(course.getDescription()).append("\n");
                        if (course.getStatus() != null) {
                            context.append("Trạng thái: ").append(course.getStatus().name()).append("\n");
                        }
                        
                        // Lấy chapters và lessons (chỉ preview cho guest)
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
                                        // Guest chỉ xem preview, authenticated user xem đầy đủ
                                        if (user != null && lesson.getContent() != null && !lesson.getContent().isEmpty()) {
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
                }
            } else {
                // Không có courseId cụ thể
                if (user == null) {
                    // Guest: Lấy danh sách khóa học công khai (featured hoặc published)
                    List<Course> publishedCourses = courseRepository.findFeaturedCourses();
                    if (publishedCourses == null || publishedCourses.isEmpty()) {
                        // Fallback: lấy top courses published
                        publishedCourses = courseRepository.findAll().stream()
                                .filter(c -> c.getStatus() == ECourseStatus.PUBLISHED)
                                .limit(10)
                                .collect(java.util.stream.Collectors.toList());
                    }
                    if (publishedCourses != null && !publishedCourses.isEmpty()) {
                        context.append("\n=== CÁC KHÓA HỌC CÔNG KHAI ===\n");
                        for (Course course : publishedCourses) {
                            context.append("- ").append(course.getTitle());
                            if (course.getPrice() != null) {
                                context.append(" (Giá: ").append(course.getPrice()).append(" VND)");
                            }
                            context.append("\n");
                        }
                    }
                } else {
                    // Authenticated user: Lấy context dựa trên role
                    boolean isLecturer = user.getRoles().stream()
                            .anyMatch(role -> role.getName() == ERole.ROLE_LECTURER || role.getName() == ERole.ROLE_ADMIN);
                    
                    if (isLecturer) {
                        // Giảng viên: Lấy các khóa học mà họ dạy
                        if (user.getCoursesInstructed() != null && !user.getCoursesInstructed().isEmpty()) {
                            context.append("\n=== CÁC KHÓA HỌC ĐANG GIẢNG DẠY ===\n");
                            for (Course course : user.getCoursesInstructed()) {
                                context.append("- ").append(course.getTitle());
                                if (course.getStatus() != null) {
                                    context.append(" (Trạng thái: ").append(course.getStatus().name()).append(")");
                                }
                                context.append("\n");
                            }
                        }
                    } else {
                        // Học viên: Lấy các khóa học đã đăng ký
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
    private String buildPrompt(String question, String courseContext, Long userId, User user) {
        StringBuilder prompt = new StringBuilder();
        
        // Xác định role và trạng thái đăng nhập
        String userRole = user != null ? getUserRoleLabel(user) : "Khách";
        boolean isGuest = user == null;
        boolean isLecturer = user != null && user.getRoles().stream()
                .anyMatch(role -> role.getName() == ERole.ROLE_LECTURER || role.getName() == ERole.ROLE_ADMIN);
        
        prompt.append("Bạn là trợ lý AI thông minh của một nền tảng học trực tuyến (E-Learning). ");
        
        if (isGuest) {
            prompt.append("Bạn đang trò chuyện với một khách (chưa đăng nhập). ");
            prompt.append("Nhiệm vụ của bạn là trả lời câu hỏi về các khóa học công khai và giúp họ tìm hiểu về nền tảng.\n\n");
        } else if (isLecturer && user != null) {
            prompt.append("Bạn đang trò chuyện với một ").append(userRole.toLowerCase())
                  .append(" (").append(user.getFullName()).append("). ");
            prompt.append("Nhiệm vụ của bạn là trả lời câu hỏi về quản lý khóa học, học viên, và các vấn đề liên quan đến giảng dạy.\n\n");
        } else if (user != null) {
            prompt.append("Bạn đang trò chuyện với một ").append(userRole.toLowerCase())
                  .append(" (").append(user.getFullName()).append("). ");
            prompt.append("Nhiệm vụ của bạn là trả lời câu hỏi về các khóa học và nội dung học tập.\n\n");
        }
        
        if (!courseContext.isEmpty()) {
            prompt.append("=== THÔNG TIN NGỮ CẢNH ===\n");
            prompt.append(courseContext).append("\n\n");
        }
        
        prompt.append("=== CÂU HỎI CỦA ").append(userRole.toUpperCase()).append(" ===\n");
        prompt.append(question).append("\n\n");
        
        prompt.append("=== HƯỚNG DẪN ===\n");
        prompt.append("- Trả lời câu hỏi dựa trên thông tin ngữ cảnh được cung cấp.\n");
        prompt.append("- Nếu câu hỏi liên quan đến khóa học cụ thể, hãy tham khảo thông tin trong phần ngữ cảnh.\n");
        prompt.append("- Trả lời bằng tiếng Việt, ngắn gọn, dễ hiểu.\n");
        if (isGuest) {
            prompt.append("- Người dùng là khách, chỉ có thể truy cập thông tin khóa học công khai. ");
            prompt.append("Nếu câu hỏi cần thông tin cá nhân hoặc khóa học chưa công khai, hãy đề xuất họ đăng nhập.\n");
        } else if (isLecturer) {
            prompt.append("- Người dùng là ").append(userRole.toLowerCase())
                  .append(", hãy điều chỉnh cách trả lời phù hợp với vai trò này.\n");
        }
        prompt.append("- Nếu không có thông tin trong ngữ cảnh, hãy trả lời chung chung hoặc đề xuất liên hệ hỗ trợ.\n");
        prompt.append("- Luôn thân thiện và hỗ trợ.\n");
        
        return prompt.toString();
    }
    
    /**
     * Helper: Lấy label role của user
     */
    private String getUserRoleLabel(User user) {
        if (user == null || user.getRoles() == null || user.getRoles().isEmpty()) {
            return "Người dùng";
        }
        
        // Kiểm tra role theo thứ tự ưu tiên: ADMIN > LECTURER > STUDENT
        for (Role role : user.getRoles()) {
            if (role.getName() == ERole.ROLE_ADMIN) {
                return "Quản trị viên";
            }
        }
        for (Role role : user.getRoles()) {
            if (role.getName() == ERole.ROLE_LECTURER) {
                return "Giảng viên";
            }
        }
        for (Role role : user.getRoles()) {
            if (role.getName() == ERole.ROLE_STUDENT) {
                return "Học viên";
            }
        }
        
        return "Người dùng";
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


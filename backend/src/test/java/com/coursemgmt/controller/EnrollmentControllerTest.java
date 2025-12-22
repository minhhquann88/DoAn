package com.coursemgmt.controller;

import com.coursemgmt.dto.LoginRequest;
import com.coursemgmt.dto.RegisterRequest;
import com.coursemgmt.model.Category;
import com.coursemgmt.model.Course;
import com.coursemgmt.model.ECourseStatus;
import com.coursemgmt.model.ERole;
import com.coursemgmt.model.Role;
import com.coursemgmt.model.User;
import com.coursemgmt.repository.CategoryRepository;
import com.coursemgmt.repository.CourseRepository;
import com.coursemgmt.repository.EnrollmentRepository;
import com.coursemgmt.repository.RoleRepository;
import com.coursemgmt.repository.UserRepository;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.junit.jupiter.api.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.MvcResult;

import java.time.LocalDateTime;
import java.util.HashSet;
import java.util.Set;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;
import static org.hamcrest.Matchers.*;

/**
 * Integration Tests cho Enrollment Module
 */
@SpringBootTest
@AutoConfigureMockMvc
@ActiveProfiles("test")
@TestMethodOrder(MethodOrderer.OrderAnnotation.class)
public class EnrollmentControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private RoleRepository roleRepository;

    @Autowired
    private CourseRepository courseRepository;

    @Autowired
    private CategoryRepository categoryRepository;

    @Autowired
    private EnrollmentRepository enrollmentRepository;

    private static String studentToken;
    private static Long testCourseId;
    private static Long testStudentId;
    private static Long testEnrollmentId;
    private static Long testCategoryId;

    private static final String STUDENT_USERNAME = "enrolltest_student";
    private static final String STUDENT_EMAIL = "enrolltest_student@test.com";
    private static final String INSTRUCTOR_EMAIL = "enroll_instructor@test.com";
    private static final String TEST_PASSWORD = "Test123!@#";

    @BeforeAll
    static void setup(@Autowired MockMvc mockMvc,
                      @Autowired ObjectMapper objectMapper,
                      @Autowired RoleRepository roleRepository,
                      @Autowired CategoryRepository categoryRepository,
                      @Autowired CourseRepository courseRepository,
                      @Autowired UserRepository userRepository) throws Exception {

        // Cleanup
        userRepository.findByEmail(STUDENT_EMAIL).ifPresent(userRepository::delete);
        userRepository.findByEmail(INSTRUCTOR_EMAIL).ifPresent(userRepository::delete);
        userRepository.findByUsername(STUDENT_USERNAME).ifPresent(userRepository::delete);
        
        // Setup roles
        if (roleRepository.findByName(ERole.ROLE_STUDENT).isEmpty()) {
            Role role = new Role();
            role.setName(ERole.ROLE_STUDENT);
            roleRepository.save(role);
        }
        if (roleRepository.findByName(ERole.ROLE_LECTURER).isEmpty()) {
            Role role = new Role();
            role.setName(ERole.ROLE_LECTURER);
            roleRepository.save(role);
        }

        // Create category
        Category category = new Category();
        category.setName("Enrollment Test Category");
        category.setDescription("Test");
        Category savedCategory = categoryRepository.save(category);
        testCategoryId = savedCategory.getId();

        // Create instructor user
        Role lecturerRole = roleRepository.findByName(ERole.ROLE_LECTURER).get();
        User instructor = new User();
        instructor.setUsername("enroll_instructor");
        instructor.setEmail(INSTRUCTOR_EMAIL);
        instructor.setPassword("$2a$10$dummyhashedpassword");
        instructor.setFullName("Enroll Instructor");
        Set<Role> instructorRoles = new HashSet<>();
        instructorRoles.add(lecturerRole);
        instructor.setRoles(instructorRoles);
        User savedInstructor = userRepository.save(instructor);

        // Create test course
        Course course = new Course();
        course.setTitle("Enrollment Test Course");
        course.setDescription("Test course for enrollment testing");
        course.setPrice(100000.0);
        course.setCategory(savedCategory);
        course.setInstructor(savedInstructor);
        course.setStatus(ECourseStatus.PUBLISHED);
        course.setCreatedAt(LocalDateTime.now());
        Course savedCourse = courseRepository.save(course);
        testCourseId = savedCourse.getId();

        // Register student
        RegisterRequest studentReg = new RegisterRequest();
        studentReg.setUsername(STUDENT_USERNAME);
        studentReg.setFullName("Enrollment Test Student");
        studentReg.setEmail(STUDENT_EMAIL);
        studentReg.setPassword(TEST_PASSWORD);
        Set<String> studentRoles = new HashSet<>();
        studentRoles.add("student");
        studentReg.setRoles(studentRoles);

        mockMvc.perform(post("/api/auth/register")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(studentReg)));

        // Login student
        LoginRequest studentLogin = new LoginRequest();
        studentLogin.setUsernameOrEmail(STUDENT_EMAIL);
        studentLogin.setPassword(TEST_PASSWORD);

        MvcResult result = mockMvc.perform(post("/api/auth/login")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(studentLogin)))
                .andReturn();

        String response = result.getResponse().getContentAsString();
        studentToken = objectMapper.readTree(response).get("token").asText();
        testStudentId = objectMapper.readTree(response).get("id").asLong();
    }

    // ==========================================
    // ENROLLMENT TESTS
    // ==========================================

    @Test
    @Order(1)
    @DisplayName("POST /api/v1/enrollments - Ghi danh thanh cong")
    void createEnrollment_Success() throws Exception {
        String requestBody = "{\"courseId\":" + testCourseId + ",\"studentId\":" + testStudentId + "}";

        MvcResult result = mockMvc.perform(post("/api/v1/enrollments")
                .header("Authorization", "Bearer " + studentToken)
                .contentType(MediaType.APPLICATION_JSON)
                .content(requestBody))
                .andExpect(status().isOk())
                .andReturn();

        String response = result.getResponse().getContentAsString();
        if (response.contains("id")) {
            testEnrollmentId = objectMapper.readTree(response).get("id").asLong();
        }
    }

    @Test
    @Order(2)
    @DisplayName("POST /api/v1/enrollments - Khong ghi danh trung")
    void createEnrollment_Fail_AlreadyEnrolled() throws Exception {
        String requestBody = "{\"courseId\":" + testCourseId + ",\"studentId\":" + testStudentId + "}";

        mockMvc.perform(post("/api/v1/enrollments")
                .header("Authorization", "Bearer " + studentToken)
                .contentType(MediaType.APPLICATION_JSON)
                .content(requestBody))
                .andExpect(status().isBadRequest());
    }

    // ==========================================
    // GET ENROLLMENTS TESTS
    // ==========================================

    @Test
    @Order(3)
    @DisplayName("GET /api/v1/enrollments/course/{id} - Lay danh sach enrollment theo course")
    void getEnrollmentsByCourse_Success() throws Exception {
        mockMvc.perform(get("/api/v1/enrollments/course/" + testCourseId)
                .header("Authorization", "Bearer " + studentToken))
                .andExpect(status().isOk());
    }

    @Test
    @Order(4)
    @DisplayName("GET /api/v1/enrollments/student/{id} - Lay danh sach enrollment theo student")
    void getEnrollmentsByStudent_Success() throws Exception {
        mockMvc.perform(get("/api/v1/enrollments/student/" + testStudentId)
                .header("Authorization", "Bearer " + studentToken))
                .andExpect(status().isOk());
    }

    @Test
    @Order(5)
    @DisplayName("GET /api/v1/enrollments/{id} - Lay chi tiet enrollment")
    void getEnrollmentById_Success() throws Exception {
        if (testEnrollmentId != null) {
            mockMvc.perform(get("/api/v1/enrollments/" + testEnrollmentId)
                    .header("Authorization", "Bearer " + studentToken))
                    .andExpect(status().isOk());
        }
    }

    // ==========================================
    // MONTHLY STATS TESTS
    // ==========================================

    @Test
    @Order(6)
    @DisplayName("GET /api/v1/enrollments/stats/monthly - Thong ke theo thang")
    void getMonthlyStats_Success() throws Exception {
        mockMvc.perform(get("/api/v1/enrollments/stats/monthly")
                .param("year", "2025")
                .header("Authorization", "Bearer " + studentToken))
                .andExpect(status().isOk());
    }

    // ==========================================
    // CLEANUP
    // ==========================================

    @AfterAll
    static void cleanup(@Autowired EnrollmentRepository enrollmentRepository,
                        @Autowired CourseRepository courseRepository,
                        @Autowired UserRepository userRepository,
                        @Autowired CategoryRepository categoryRepository) {
        if (testEnrollmentId != null) {
            enrollmentRepository.deleteById(testEnrollmentId);
        }
        if (testCourseId != null) {
            courseRepository.deleteById(testCourseId);
        }
        userRepository.findByEmail(STUDENT_EMAIL).ifPresent(userRepository::delete);
        userRepository.findByEmail(INSTRUCTOR_EMAIL).ifPresent(userRepository::delete);
        if (testCategoryId != null) {
            categoryRepository.deleteById(testCategoryId);
        }
    }
}

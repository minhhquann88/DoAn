package com.coursemgmt.controller;

import com.coursemgmt.dto.CourseRequest;
import com.coursemgmt.dto.LoginRequest;
import com.coursemgmt.dto.RegisterRequest;
import com.coursemgmt.model.Category;
import com.coursemgmt.model.ERole;
import com.coursemgmt.model.Role;
import com.coursemgmt.repository.CategoryRepository;
import com.coursemgmt.repository.CourseRepository;
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

import java.util.HashSet;
import java.util.Set;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;
import static org.hamcrest.Matchers.*;

/**
 * Integration Tests cho Course Module
 */
@SpringBootTest
@AutoConfigureMockMvc
@ActiveProfiles("test")
@TestMethodOrder(MethodOrderer.OrderAnnotation.class)
public class CourseControllerTest {

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

    private static String instructorToken;
    private static String studentToken;
    private static Long testCourseId;
    private static Long testCategoryId;

    private static final String INSTRUCTOR_USERNAME = "instructor_test";
    private static final String INSTRUCTOR_EMAIL = "instructor@test.com";
    private static final String STUDENT_USERNAME = "student_test";
    private static final String STUDENT_EMAIL = "student@test.com";
    private static final String TEST_PASSWORD = "Test123!@#";

    @BeforeAll
    static void setupUsers(@Autowired MockMvc mockMvc, 
                           @Autowired ObjectMapper objectMapper,
                           @Autowired RoleRepository roleRepository,
                           @Autowired CategoryRepository categoryRepository,
                           @Autowired UserRepository userRepository) throws Exception {
        
        // Cleanup existing test users
        userRepository.findByEmail(INSTRUCTOR_EMAIL).ifPresent(userRepository::delete);
        userRepository.findByEmail(STUDENT_EMAIL).ifPresent(userRepository::delete);
        userRepository.findByUsername(INSTRUCTOR_USERNAME).ifPresent(userRepository::delete);
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

        // Setup category
        Category category = new Category();
        category.setName("Test Category");
        category.setDescription("Test Description");
        Category savedCategory = categoryRepository.save(category);
        testCategoryId = savedCategory.getId();

        // Register instructor
        RegisterRequest instructorReg = new RegisterRequest();
        instructorReg.setUsername(INSTRUCTOR_USERNAME);
        instructorReg.setFullName("Test Instructor");
        instructorReg.setEmail(INSTRUCTOR_EMAIL);
        instructorReg.setPassword(TEST_PASSWORD);
        Set<String> instructorRoles = new HashSet<>();
        instructorRoles.add("lecturer");
        instructorReg.setRoles(instructorRoles);

        mockMvc.perform(post("/api/auth/register")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(instructorReg)));

        // Login instructor
        LoginRequest instructorLogin = new LoginRequest();
        instructorLogin.setUsernameOrEmail(INSTRUCTOR_EMAIL);
        instructorLogin.setPassword(TEST_PASSWORD);

        MvcResult instructorResult = mockMvc.perform(post("/api/auth/login")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(instructorLogin)))
                .andReturn();

        instructorToken = objectMapper.readTree(instructorResult.getResponse().getContentAsString())
                .get("token").asText();

        // Register student
        RegisterRequest studentReg = new RegisterRequest();
        studentReg.setUsername(STUDENT_USERNAME);
        studentReg.setFullName("Test Student");
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

        MvcResult studentResult = mockMvc.perform(post("/api/auth/login")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(studentLogin)))
                .andReturn();

        studentToken = objectMapper.readTree(studentResult.getResponse().getContentAsString())
                .get("token").asText();
    }

    // ==========================================
    // PUBLIC ENDPOINTS TESTS
    // ==========================================

    @Test
    @Order(1)
    @DisplayName("GET /api/courses - Lay danh sach khoa hoc (public)")
    void getCourses_Success_PublicAccess() throws Exception {
        mockMvc.perform(get("/api/courses"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.content", isA(java.util.List.class)));
    }

    @Test
    @Order(2)
    @DisplayName("GET /api/courses - Phan trang hoat dong dung")
    void getCourses_Pagination_Works() throws Exception {
        mockMvc.perform(get("/api/courses")
                .param("page", "0")
                .param("size", "5"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.size", is(5)))
                .andExpect(jsonPath("$.number", is(0)));
    }

    @Test
    @Order(3)
    @DisplayName("GET /api/courses - Search theo keyword")
    void getCourses_Search_ByKeyword() throws Exception {
        mockMvc.perform(get("/api/courses")
                .param("keyword", "java"))
                .andExpect(status().isOk());
    }

    // ==========================================
    // COURSE CREATION TESTS
    // ==========================================

    @Test
    @Order(4)
    @DisplayName("POST /api/courses - Instructor tao khoa hoc thanh cong")
    void createCourse_Success_AsInstructor() throws Exception {
        CourseRequest request = new CourseRequest();
        request.setTitle("Test Course - Java Programming");
        request.setDescription("Complete Java course for beginners. Learn Java from scratch.");
        request.setCategoryId(testCategoryId);
        request.setPrice(500000.0);
        request.setTotalDurationInHours(40);

        MvcResult result = mockMvc.perform(post("/api/courses")
                .header("Authorization", "Bearer " + instructorToken)
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.title", is("Test Course - Java Programming")))
                .andExpect(jsonPath("$.id", notNullValue()))
                .andReturn();

        // Save course ID for later tests
        testCourseId = objectMapper.readTree(result.getResponse().getContentAsString())
                .get("id").asLong();
    }

    @Test
    @Order(5)
    @DisplayName("POST /api/courses - Student khong the tao khoa hoc")
    void createCourse_Fail_AsStudent() throws Exception {
        CourseRequest request = new CourseRequest();
        request.setTitle("Student Course");
        request.setDescription("Student should not be able to create course");
        request.setCategoryId(testCategoryId);
        request.setPrice(100000.0);

        mockMvc.perform(post("/api/courses")
                .header("Authorization", "Bearer " + studentToken)
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isForbidden());
    }

    @Test
    @Order(6)
    @DisplayName("POST /api/courses - Tu choi khi khong co token")
    void createCourse_Fail_NoToken() throws Exception {
        CourseRequest request = new CourseRequest();
        request.setTitle("No Token Course");
        request.setDescription("No token provided");
        request.setCategoryId(testCategoryId);
        request.setPrice(100000.0);

        mockMvc.perform(post("/api/courses")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isUnauthorized());
    }

    // ==========================================
    // GET COURSE BY ID TESTS
    // ==========================================

    @Test
    @Order(7)
    @DisplayName("GET /api/courses/{id} - Lay chi tiet khoa hoc")
    void getCourseById_Success() throws Exception {
        mockMvc.perform(get("/api/courses/" + testCourseId))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.id", is(testCourseId.intValue())))
                .andExpect(jsonPath("$.title", notNullValue()));
    }

    @Test
    @Order(8)
    @DisplayName("GET /api/courses/{id} - 404 khi khong tim thay")
    void getCourseById_NotFound() throws Exception {
        mockMvc.perform(get("/api/courses/99999"))
                .andExpect(status().isNotFound());
    }

    // ==========================================
    // UPDATE COURSE TESTS
    // ==========================================

    @Test
    @Order(9)
    @DisplayName("PUT /api/courses/{id} - Cap nhat khoa hoc thanh cong")
    void updateCourse_Success() throws Exception {
        CourseRequest request = new CourseRequest();
        request.setTitle("Updated Course Title");
        request.setDescription("Updated full description");
        request.setCategoryId(testCategoryId);
        request.setPrice(600000.0);
        request.setTotalDurationInHours(50);

        mockMvc.perform(put("/api/courses/" + testCourseId)
                .header("Authorization", "Bearer " + instructorToken)
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.title", is("Updated Course Title")));
    }

    // ==========================================
    // DELETE COURSE TESTS
    // ==========================================

    @Test
    @Order(99)
    @DisplayName("DELETE /api/courses/{id} - Xoa khoa hoc")
    void deleteCourse_Success() throws Exception {
        mockMvc.perform(delete("/api/courses/" + testCourseId)
                .header("Authorization", "Bearer " + instructorToken))
                .andExpect(status().isOk());
    }

    // ==========================================
    // CLEANUP
    // ==========================================

    @AfterAll
    static void cleanup(@Autowired UserRepository userRepository,
                        @Autowired CourseRepository courseRepository,
                        @Autowired CategoryRepository categoryRepository) {
        userRepository.findByEmail(INSTRUCTOR_EMAIL).ifPresent(userRepository::delete);
        userRepository.findByEmail(STUDENT_EMAIL).ifPresent(userRepository::delete);
        if (testCategoryId != null) {
            categoryRepository.deleteById(testCategoryId);
        }
    }
}

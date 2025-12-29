package com.coursemgmt.controller;

import com.coursemgmt.dto.LoginRequest;
import com.coursemgmt.dto.RegisterRequest;
import com.coursemgmt.model.ERole;
import com.coursemgmt.model.Role;
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
 * Integration Tests cho Auth Module
 */
@SpringBootTest
@AutoConfigureMockMvc
@ActiveProfiles("test")
@TestMethodOrder(MethodOrderer.OrderAnnotation.class)
public class AuthControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private RoleRepository roleRepository;

    private static final String TEST_USERNAME = "testuser";
    private static final String TEST_EMAIL = "testuser@example.com";
    private static final String TEST_PASSWORD = "Test123!@#";
    private static final String TEST_FULLNAME = "Test User";

    @BeforeEach
    void setUp() {
        // Ensure roles exist
        if (roleRepository.findByName(ERole.ROLE_STUDENT).isEmpty()) {
            Role studentRole = new Role();
            studentRole.setName(ERole.ROLE_STUDENT);
            roleRepository.save(studentRole);
        }
        if (roleRepository.findByName(ERole.ROLE_LECTURER).isEmpty()) {
            Role lecturerRole = new Role();
            lecturerRole.setName(ERole.ROLE_LECTURER);
            roleRepository.save(lecturerRole);
        }
        if (roleRepository.findByName(ERole.ROLE_ADMIN).isEmpty()) {
            Role adminRole = new Role();
            adminRole.setName(ERole.ROLE_ADMIN);
            roleRepository.save(adminRole);
        }
    }

    // ==========================================
    // REGISTER TESTS
    // ==========================================

    @Test
    @Order(1)
    @DisplayName("Register - Dang ky thanh cong voi thong tin hop le")
    void register_Success_WithValidData() throws Exception {
        // Clean up if exists
        userRepository.findByEmail(TEST_EMAIL).ifPresent(userRepository::delete);
        userRepository.findByUsername(TEST_USERNAME).ifPresent(userRepository::delete);

        RegisterRequest request = new RegisterRequest();
        request.setUsername(TEST_USERNAME);
        request.setFullName(TEST_FULLNAME);
        request.setEmail(TEST_EMAIL);
        request.setPassword(TEST_PASSWORD);
        Set<String> roles = new HashSet<>();
        roles.add("student");
        request.setRoles(roles);

        mockMvc.perform(post("/api/auth/register")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isOk());

        // Verify user was created
        Assertions.assertTrue(userRepository.findByEmail(TEST_EMAIL).isPresent());
    }

    @Test
    @Order(2)
    @DisplayName("Register - Tu choi email da ton tai")
    void register_Fail_EmailAlreadyExists() throws Exception {
        RegisterRequest request = new RegisterRequest();
        request.setUsername("anotheruser");
        request.setFullName("Another User");
        request.setEmail(TEST_EMAIL); // Same email as previous test
        request.setPassword("AnotherPass123!");
        Set<String> roles = new HashSet<>();
        roles.add("student");
        request.setRoles(roles);

        mockMvc.perform(post("/api/auth/register")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isBadRequest());
    }

    @Test
    @Order(3)
    @DisplayName("Register - Tu choi khi thieu email")
    void register_Fail_MissingEmail() throws Exception {
        RegisterRequest request = new RegisterRequest();
        request.setUsername("newuser");
        request.setFullName(TEST_FULLNAME);
        request.setPassword(TEST_PASSWORD);
        Set<String> roles = new HashSet<>();
        roles.add("student");
        request.setRoles(roles);
        // Missing email

        mockMvc.perform(post("/api/auth/register")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isBadRequest());
    }

    @Test
    @Order(4)
    @DisplayName("Register - Tu choi khi thieu password")
    void register_Fail_MissingPassword() throws Exception {
        RegisterRequest request = new RegisterRequest();
        request.setUsername("newuser2");
        request.setFullName(TEST_FULLNAME);
        request.setEmail("newuser2@example.com");
        Set<String> roles = new HashSet<>();
        roles.add("student");
        request.setRoles(roles);
        // Missing password

        mockMvc.perform(post("/api/auth/register")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isBadRequest());
    }

    // ==========================================
    // LOGIN TESTS
    // ==========================================

    @Test
    @Order(5)
    @DisplayName("Login - Dang nhap thanh cong, tra ve token")
    void login_Success_ReturnsToken() throws Exception {
        LoginRequest request = new LoginRequest();
        request.setUsernameOrEmail(TEST_EMAIL);
        request.setPassword(TEST_PASSWORD);

        mockMvc.perform(post("/api/auth/login")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.token", notNullValue()))
                .andExpect(jsonPath("$.type", is("Bearer")));
    }

    @Test
    @Order(6)
    @DisplayName("Login - Tu choi sai password")
    void login_Fail_WrongPassword() throws Exception {
        LoginRequest request = new LoginRequest();
        request.setUsernameOrEmail(TEST_EMAIL);
        request.setPassword("WrongPassword123!");

        mockMvc.perform(post("/api/auth/login")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isBadRequest());
    }

    @Test
    @Order(7)
    @DisplayName("Login - Tu choi email khong ton tai")
    void login_Fail_UserNotFound() throws Exception {
        LoginRequest request = new LoginRequest();
        request.setUsernameOrEmail("nonexistent@example.com");
        request.setPassword(TEST_PASSWORD);

        mockMvc.perform(post("/api/auth/login")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isBadRequest());
    }

    // ==========================================
    // JWT TOKEN TESTS
    // ==========================================

    @Test
    @Order(8)
    @DisplayName("JWT - Token co the su dung de truy cap protected endpoint")
    void jwt_Token_CanAccessProtectedEndpoint() throws Exception {
        // First login to get token
        LoginRequest loginRequest = new LoginRequest();
        loginRequest.setUsernameOrEmail(TEST_EMAIL);
        loginRequest.setPassword(TEST_PASSWORD);

        MvcResult result = mockMvc.perform(post("/api/auth/login")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(loginRequest)))
                .andExpect(status().isOk())
                .andReturn();

        String response = result.getResponse().getContentAsString();
        String token = objectMapper.readTree(response).get("token").asText();

        // Use token to access protected endpoint
        mockMvc.perform(get("/api/user/profile")
                .header("Authorization", "Bearer " + token))
                .andExpect(status().isOk());
    }

    // ==========================================
    // CLEANUP
    // ==========================================

    @AfterAll
    static void cleanup(@Autowired UserRepository userRepository) {
        userRepository.findByEmail(TEST_EMAIL).ifPresent(userRepository::delete);
        userRepository.findByUsername(TEST_USERNAME).ifPresent(userRepository::delete);
    }
}

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
 * Integration Tests cho Statistics Module
 */
@SpringBootTest
@AutoConfigureMockMvc
@ActiveProfiles("test")
@TestMethodOrder(MethodOrderer.OrderAnnotation.class)
public class StatisticsControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @Autowired
    private RoleRepository roleRepository;

    @Autowired
    private UserRepository userRepository;

    private static String userToken;
    private static Long testUserId;

    private static final String TEST_USERNAME = "stats_user";
    private static final String TEST_EMAIL = "stats_user@test.com";
    private static final String TEST_PASSWORD = "Test123!@#";

    @BeforeAll
    static void setup(@Autowired MockMvc mockMvc,
                      @Autowired ObjectMapper objectMapper,
                      @Autowired RoleRepository roleRepository,
                      @Autowired UserRepository userRepository) throws Exception {

        // Cleanup
        userRepository.findByEmail(TEST_EMAIL).ifPresent(userRepository::delete);
        userRepository.findByUsername(TEST_USERNAME).ifPresent(userRepository::delete);
        
        // Setup roles
        if (roleRepository.findByName(ERole.ROLE_ADMIN).isEmpty()) {
            Role role = new Role();
            role.setName(ERole.ROLE_ADMIN);
            roleRepository.save(role);
        }
        if (roleRepository.findByName(ERole.ROLE_STUDENT).isEmpty()) {
            Role role = new Role();
            role.setName(ERole.ROLE_STUDENT);
            roleRepository.save(role);
        }

        // Register user
        RegisterRequest userReg = new RegisterRequest();
        userReg.setUsername(TEST_USERNAME);
        userReg.setFullName("Stats User");
        userReg.setEmail(TEST_EMAIL);
        userReg.setPassword(TEST_PASSWORD);
        Set<String> roles = new HashSet<>();
        roles.add("student");
        userReg.setRoles(roles);

        mockMvc.perform(post("/api/auth/register")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(userReg)));

        // Login
        LoginRequest loginRequest = new LoginRequest();
        loginRequest.setUsernameOrEmail(TEST_EMAIL);
        loginRequest.setPassword(TEST_PASSWORD);

        MvcResult result = mockMvc.perform(post("/api/auth/login")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(loginRequest)))
                .andReturn();

        String response = result.getResponse().getContentAsString();
        userToken = objectMapper.readTree(response).get("token").asText();
        testUserId = objectMapper.readTree(response).get("id").asLong();
    }

    // ==========================================
    // DASHBOARD STATISTICS TESTS
    // ==========================================

    @Test
    @Order(1)
    @DisplayName("GET /api/v1/statistics/dashboard - Lay tong quan dashboard")
    void getDashboardStats_Success() throws Exception {
        mockMvc.perform(get("/api/v1/statistics/dashboard")
                .header("Authorization", "Bearer " + userToken))
                .andExpect(status().isOk());
    }

    // ==========================================
    // STUDENT STATISTICS TESTS
    // ==========================================

    @Test
    @Order(2)
    @DisplayName("GET /api/v1/statistics/student/{id} - Thong ke hoc vien")
    void getStudentStats_Success() throws Exception {
        mockMvc.perform(get("/api/v1/statistics/student/" + testUserId)
                .header("Authorization", "Bearer " + userToken))
                .andExpect(status().isOk());
    }

    // ==========================================
    // REVENUE STATISTICS TESTS
    // ==========================================

    @Test
    @Order(3)
    @DisplayName("GET /api/v1/statistics/revenue - Bao cao doanh thu")
    void getRevenueReport_Success() throws Exception {
        mockMvc.perform(get("/api/v1/statistics/revenue")
                .param("startDate", "2025-01-01T00:00:00")
                .param("endDate", "2025-12-31T23:59:59")
                .header("Authorization", "Bearer " + userToken))
                .andExpect(status().isOk());
    }

    // ==========================================
    // COMPLETION STATISTICS TESTS
    // ==========================================

    @Test
    @Order(4)
    @DisplayName("GET /api/v1/statistics/completion - Bao cao ty le hoan thanh")
    void getCompletionReport_Success() throws Exception {
        mockMvc.perform(get("/api/v1/statistics/completion")
                .header("Authorization", "Bearer " + userToken))
                .andExpect(status().isOk());
    }

    // ==========================================
    // AUTHORIZATION TESTS
    // ==========================================

    @Test
    @Order(5)
    @DisplayName("Statistics - Tu choi khi khong co token")
    void statistics_Fail_NoToken() throws Exception {
        mockMvc.perform(get("/api/v1/statistics/dashboard"))
                .andExpect(status().isUnauthorized());
    }

    // ==========================================
    // CLEANUP
    // ==========================================

    @AfterAll
    static void cleanup(@Autowired UserRepository userRepository) {
        userRepository.findByEmail(TEST_EMAIL).ifPresent(userRepository::delete);
    }
}

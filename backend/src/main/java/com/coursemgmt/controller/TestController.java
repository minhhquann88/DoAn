package com.coursemgmt.controller;

import com.coursemgmt.repository.UserRepository;
import com.coursemgmt.model.User;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/test")
@CrossOrigin(origins = "*")
public class TestController {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    /**
     * Endpoint để test và verify password của admin
     * GET /api/test/verify-admin-password?password=123456
     */
    @GetMapping("/verify-admin-password")
    public String verifyAdminPassword(@RequestParam String password) {
        try {
            User admin = userRepository.findByUsernameOrEmail("admin", "admin@example.com")
                    .orElse(null);

            if (admin == null) {
                return "ERROR: Admin user not found in database!";
            }

            StringBuilder result = new StringBuilder();
            result.append("========================================\n");
            result.append("Admin User Info:\n");
            result.append("ID: ").append(admin.getId()).append("\n");
            result.append("Username: ").append(admin.getUsername()).append("\n");
            result.append("Email: ").append(admin.getEmail()).append("\n");
            result.append("Is Enabled: ").append(admin.getIsEnabled()).append("\n");
            result.append("Password Hash: ").append(admin.getPassword()).append("\n");
            result.append("========================================\n");
            result.append("\n");

            // Test password
            boolean matches = passwordEncoder.matches(password, admin.getPassword());
            result.append("Password Test:\n");
            result.append("Input Password: ").append(password).append("\n");
            result.append("Password Matches: ").append(matches ? "✓ YES" : "✗ NO").append("\n");
            result.append("========================================\n");

            // Generate new hash if needed
            if (!matches) {
                result.append("\n");
                result.append("Generating new hash for password '").append(password).append("':\n");
                String newHash = passwordEncoder.encode(password);
                result.append("New Hash: ").append(newHash).append("\n");
                result.append("\n");
                result.append("SQL UPDATE statement:\n");
                result.append("UPDATE coursemgmt_test.users\n");
                result.append("SET password = '").append(newHash).append("',\n");
                result.append("    is_enabled = 1\n");
                result.append("WHERE username = 'admin' OR email = 'admin@example.com';\n");
            }

            return result.toString();
        } catch (Exception e) {
            return "ERROR: " + e.getMessage() + "\n" + e.getClass().getName();
        }
    }
}


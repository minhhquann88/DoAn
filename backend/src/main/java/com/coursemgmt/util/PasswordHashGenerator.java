package com.coursemgmt.util;

import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;

/**
 * Utility class để generate BCrypt password hash
 * Chạy main method để generate hash cho password "123456"
 */
public class PasswordHashGenerator {
    public static void main(String[] args) {
        BCryptPasswordEncoder encoder = new BCryptPasswordEncoder();
        
        String password = "123456";
        String hash = encoder.encode(password);
        
        System.out.println("========================================");
        System.out.println("Password: " + password);
        System.out.println("BCrypt Hash: " + hash);
        System.out.println("========================================");
        System.out.println();
        System.out.println("SQL UPDATE statement:");
        System.out.println("UPDATE coursemgmt_test.users");
        System.out.println("SET password = '" + hash + "',");
        System.out.println("    is_enabled = 1");
        System.out.println("WHERE username = 'admin' OR email = 'admin@example.com';");
        System.out.println("========================================");
        
        // Verify the hash
        boolean matches = encoder.matches(password, hash);
        System.out.println("Verification: " + (matches ? "✓ Password matches hash" : "✗ Password does NOT match hash"));
    }
}


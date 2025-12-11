package com.coursemgmt.security;

import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.security.core.AuthenticationException;
import org.springframework.security.web.AuthenticationEntryPoint;
import org.springframework.stereotype.Component;

import java.io.IOException;

/**
 * Custom Authentication Entry Point
 * Không block các endpoint permitAll - để Spring Security tự xử lý
 */
@Component
public class CustomAuthenticationEntryPoint implements AuthenticationEntryPoint {
    
    @Override
    public void commence(HttpServletRequest request, HttpServletResponse response,
                         AuthenticationException authException) throws IOException, ServletException {
        
        String path = request.getRequestURI();
        
        // Cho phép các endpoint /api/v1/** và /api/auth/** pass through
        // Không trả về 401, để Spring Security tự xử lý permitAll
        if (path.startsWith("/api/v1/") || path.startsWith("/api/auth/")) {
            // Không làm gì cả, để request tiếp tục đến controller
            // Spring Security sẽ tự xử lý permitAll
            return;
        }
        
        // Chỉ trả về 401 cho các endpoint khác thực sự cần authentication
        response.setContentType("application/json;charset=UTF-8");
        response.setStatus(HttpServletResponse.SC_UNAUTHORIZED);
        response.getWriter().write("{\"error\":\"Unauthorized\",\"message\":\"Full authentication is required to access this resource\"}");
    }
}


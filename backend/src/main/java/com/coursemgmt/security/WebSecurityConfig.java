package com.coursemgmt.security;

import com.coursemgmt.security.jwt.AuthEntryPointJwt;
import com.coursemgmt.security.jwt.AuthTokenFilter;
import com.coursemgmt.security.services.UserDetailsServiceImpl;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpMethod;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.dao.DaoAuthenticationProvider;
import org.springframework.security.config.annotation.authentication.configuration.AuthenticationConfiguration;
import org.springframework.security.config.annotation.method.configuration.EnableMethodSecurity;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;

@Configuration
@EnableMethodSecurity // Kích hoạt @PreAuthorize
public class WebSecurityConfig {
    @Autowired
    UserDetailsServiceImpl userDetailsService;

    @Autowired
    private AuthEntryPointJwt unauthorizedHandler;

    @Bean
    public AuthTokenFilter authenticationJwtTokenFilter() {
        return new AuthTokenFilter();
    }

    @Bean
    public DaoAuthenticationProvider authenticationProvider() {
        DaoAuthenticationProvider authProvider = new DaoAuthenticationProvider();

        authProvider.setUserDetailsService(userDetailsService);
        // Đây là bộ mã hóa BCrypt bạn yêu cầu
        authProvider.setPasswordEncoder(passwordEncoder());

        return authProvider;
    }

    @Bean
    public AuthenticationManager authenticationManager(AuthenticationConfiguration authConfig) throws Exception {
        return authConfig.getAuthenticationManager();
    }

    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }

    @Bean
    public SecurityFilterChain filterChain(HttpSecurity http) throws Exception {
        http.csrf(csrf -> csrf.disable())
                .exceptionHandling(exception -> exception.authenticationEntryPoint(unauthorizedHandler))
                .sessionManagement(session -> session.sessionCreationPolicy(SessionCreationPolicy.STATELESS))
                .authorizeHttpRequests(auth ->
                        auth.requestMatchers("/api/auth/**").permitAll() // Cho phép tất cả truy cập API auth
                                .requestMatchers(HttpMethod.GET, "/api/courses", "/api/courses/**").permitAll()
                                .requestMatchers(HttpMethod.GET, "/api/content/**").authenticated()
                                .requestMatchers(HttpMethod.POST, "/api/content/**").authenticated()

                                // THAY TẤT CẢ CÁC DÒNG QUẢN LÝ BẰNG 1 DÒNG NÀY:
                                // "Tất cả request (GET, POST, PUT, DELETE) tới /api/manage/content/
                                // đều phải có quyền ADMIN hoặc LECTURER"
                                .requestMatchers("/api/manage/content/**").hasAnyRole("ADMIN", "LECTURER")

                                // Giảng viên/Admin: Tạo/Update/Delete Test, xem thống kê, chấm bài
                                .requestMatchers("/api/manage/tests/**").hasAnyRole("ADMIN", "LECTURER")

                                // Học viên: Làm bài, xem kết quả
                                .requestMatchers("/api/tests/**").hasRole("STUDENT")

                                .anyRequest().authenticated()
                );

        http.authenticationProvider(authenticationProvider());

        http.addFilterBefore(authenticationJwtTokenFilter(), UsernamePasswordAuthenticationFilter.class);

        return http.build();
    }
}
package com.coursemgmt.service;

import com.coursemgmt.dto.*;
import com.coursemgmt.model.ERole;
import com.coursemgmt.model.PasswordResetToken;
import com.coursemgmt.model.Role;
import com.coursemgmt.model.User;
import com.coursemgmt.repository.PasswordResetTokenRepository;
import com.coursemgmt.repository.RoleRepository;
import com.coursemgmt.repository.UserRepository;
import com.coursemgmt.security.jwt.JwtUtils;
import com.coursemgmt.security.services.UserDetailsImpl;
import jakarta.servlet.http.HttpServletRequest;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.HashSet;
import java.util.List;
import java.util.Set;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
public class AuthService {

    @Autowired
    AuthenticationManager authenticationManager;

    @Autowired
    UserRepository userRepository;

    @Autowired
    RoleRepository roleRepository;

    @Autowired
    PasswordEncoder encoder; // Encoder BCrypt

    @Autowired
    JwtUtils jwtUtils;

    @Autowired
    PasswordResetTokenRepository tokenRepository;

    @Autowired
    EmailService emailService;

    // Chức năng Đăng nhập
    public JwtResponse loginUser(LoginRequest loginRequest) {
        Authentication authentication = authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(
                        loginRequest.getUsernameOrEmail(),
                        loginRequest.getPassword()));

        SecurityContextHolder.getContext().setAuthentication(authentication);
        String jwt = jwtUtils.generateJwtToken(authentication); // Trả token JWT

        UserDetailsImpl userDetails = (UserDetailsImpl) authentication.getPrincipal();
        List<String> roles = userDetails.getAuthorities().stream()
                .map(item -> item.getAuthority())
                .collect(Collectors.toList());

        return new JwtResponse(jwt,
                userDetails.getId(),
                userDetails.getUsername(),
                userDetails.getEmail(),
                roles);
    }

    // Chức năng Đăng ký
    @Transactional
    public User registerUser(RegisterRequest registerRequest) {
        if (userRepository.existsByUsername(registerRequest.getUsername())) {
            throw new RuntimeException("Error: Username is already taken!");
        }

        if (userRepository.existsByEmail(registerRequest.getEmail())) {
            throw new RuntimeException("Error: Email is already in use!");
        }

        User user = new User();
        user.setUsername(registerRequest.getUsername());
        user.setEmail(registerRequest.getEmail());
        user.setPassword(encoder.encode(registerRequest.getPassword())); // Mã hóa BCrypt
        user.setFullName(registerRequest.getFullName());
        user.setCreatedAt(LocalDateTime.now());
        user.setIsEnabled(true); // Tạm thời để true, sau này có thể set false để xác thực email

        Set<String> strRoles = registerRequest.getRoles();
        Set<Role> roles = new HashSet<>();

        if (strRoles == null || strRoles.isEmpty()) {
            Role userRole = roleRepository.findByName(ERole.ROLE_STUDENT)
                    .orElseThrow(() -> new RuntimeException("Error: Role 'STUDENT' is not found."));
            roles.add(userRole);
        } else {
            strRoles.forEach(role -> {
                switch (role) {
                    case "admin":
                        Role adminRole = roleRepository.findByName(ERole.ROLE_ADMIN)
                                .orElseThrow(() -> new RuntimeException("Error: Role 'ADMIN' is not found."));
                        roles.add(adminRole);
                        break;
                    case "lecturer":
                        Role modRole = roleRepository.findByName(ERole.ROLE_LECTURER)
                                .orElseThrow(() -> new RuntimeException("Error: Role 'LECTURER' is not found."));
                        roles.add(modRole);
                        break;
                    default:
                        Role userRole = roleRepository.findByName(ERole.ROLE_STUDENT)
                                .orElseThrow(() -> new RuntimeException("Error: Role 'STUDENT' is not found."));
                        roles.add(userRole);
                }
            });
        }
        user.setRoles(roles);
        return userRepository.save(user);
    }

    // Chức năng Quên mật khẩu
    @Transactional
    public void handleForgotPassword(ForgotPasswordRequest request, HttpServletRequest servletRequest) {
        User user = userRepository.findByEmail(request.getEmail())
                .orElseThrow(() -> new UsernameNotFoundException("Error: Email not found!"));

        // Xóa token cũ nếu có
        tokenRepository.deleteByUser(user);

        // Tạo token mới
        String token = UUID.randomUUID().toString();
        PasswordResetToken resetToken = new PasswordResetToken(token, user);
        tokenRepository.save(resetToken);

        // Tạo link reset (trỏ về phía Frontend)
        String appUrl = servletRequest.getScheme() + "://" + servletRequest.getServerName() + ":" + servletRequest.getServerPort();
        String resetLink = appUrl + "/reset-password?token=" + token;

        // Gửi email
        emailService.sendPasswordResetEmail(user.getEmail(), resetLink);
    }

    // Chức năng Đặt lại mật khẩu
    @Transactional
    public void handleResetPassword(ResetPasswordRequest request) {
        PasswordResetToken resetToken = tokenRepository.findByToken(request.getToken())
                .orElseThrow(() -> new RuntimeException("Error: Invalid reset token!"));

        if (resetToken.getExpiryDate().isBefore(LocalDateTime.now())) {
            tokenRepository.delete(resetToken);
            throw new RuntimeException("Error: Token expired!");
        }

        User user = resetToken.getUser();
        user.setPassword(encoder.encode(request.getNewPassword()));
        userRepository.save(user);

        // Xóa token sau khi dùng xong
        tokenRepository.delete(resetToken);
    }

    // Chức năng Cập nhật Profile
    @Transactional
    public User updateProfile(Long userId, UpdateProfileRequest request) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new UsernameNotFoundException("User not found!"));

        // Kiểm tra email mới có bị trùng không
        if(request.getEmail() != null && !request.getEmail().equals(user.getEmail())) {
            if(userRepository.existsByEmail(request.getEmail())) {
                throw new RuntimeException("Error: Email is already in use!");
            }
            user.setEmail(request.getEmail());
        }

        if(request.getFullName() != null) {
            user.setFullName(request.getFullName());
        }
        if(request.getAvatarUrl() != null) {
            user.setAvatarUrl(request.getAvatarUrl());
        }
        if(request.getBio() != null) {
            user.setBio(request.getBio());
        }

        return userRepository.save(user);
    }

    // New method to update only avatar URL
    @Transactional
    public User updateAvatarUrl(Long userId, String avatarUrl) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new UsernameNotFoundException("User not found!"));
        user.setAvatarUrl(avatarUrl);
        return userRepository.save(user);
    }

    // New method to get user by ID
    public User getUserById(Long userId) {
        return userRepository.findById(userId)
                .orElseThrow(() -> new UsernameNotFoundException("User not found with id: " + userId));
    }
}
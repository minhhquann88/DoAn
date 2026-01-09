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
import org.springframework.beans.factory.annotation.Value;
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
import java.util.Optional;
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
    PasswordEncoder encoder;

    @Autowired
    JwtUtils jwtUtils;

    @Autowired
    PasswordResetTokenRepository tokenRepository;

    @Autowired
    EmailService emailService;

    @Value("${app.frontend.url:http://localhost:3000}")
    private String frontendUrl;

    // Đăng nhập người dùng
    public JwtResponse loginUser(LoginRequest loginRequest) {
        // Tìm user theo username hoặc email
        Optional<User> userOptional = userRepository.findByUsernameOrEmail(
                loginRequest.getUsernameOrEmail(), 
                loginRequest.getUsernameOrEmail()
        );
        
        // Kiểm tra tài khoản có bị khóa không
        if (userOptional.isPresent()) {
            User user = userOptional.get();
            if (user.getIsEnabled() != null && !user.getIsEnabled()) {
                String lockMessage = user.getLockReason() != null && !user.getLockReason().trim().isEmpty()
                    ? user.getLockReason()
                    : "Tài khoản của bạn đã bị khóa. Vui lòng liên hệ quản trị viên để được hỗ trợ.";
                throw new org.springframework.security.authentication.DisabledException(lockMessage); // Throw exception nếu bị khóa
            }
        }
        
        // Xác thực username/password với Spring Security
        Authentication authentication = authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(
                        loginRequest.getUsernameOrEmail(),
                        loginRequest.getPassword()));

        // Lưu Authentication vào SecurityContext → Để các request sau biết user đã đăng nhập
        SecurityContextHolder.getContext().setAuthentication(authentication);
        // Tạo JWT token từ Authentication → Token chứa username, roles, expiry time
        String jwt = jwtUtils.generateJwtToken(authentication);

        // Lấy thông tin user và roles từ Authentication
        UserDetailsImpl userDetails = (UserDetailsImpl) authentication.getPrincipal();
        List<String> roles = userDetails.getAuthorities().stream()
                .map(item -> item.getAuthority())
                .collect(Collectors.toList());

        // Trả về JWT token + thông tin user
        return new JwtResponse(jwt,
                userDetails.getId(),
                userDetails.getUsername(),
                userDetails.getEmail(),
                roles);
    }

    // Đăng ký người dùng mới
    @Transactional
    public User registerUser(RegisterRequest registerRequest) {
        // Kiểm tra username đã tồn tại
        if (userRepository.existsByUsername(registerRequest.getUsername())) {
            throw new RuntimeException("Error: Username is already taken!");
        }

        // Kiểm tra email đã tồn tại 
        if (userRepository.existsByEmail(registerRequest.getEmail())) {
            throw new RuntimeException("Error: Email is already in use!");
        }

        // Tạo User object mới
        User user = new User();
        user.setUsername(registerRequest.getUsername());
        user.setEmail(registerRequest.getEmail());
        user.setPassword(encoder.encode(registerRequest.getPassword())); // Mã hóa
        user.setFullName(registerRequest.getFullName());
        user.setCreatedAt(LocalDateTime.now());
        user.setIsEnabled(true);

        // Xử lý roles
        Set<String> strRoles = registerRequest.getRoles();
        Set<Role> roles = new HashSet<>();

        // Không cho đăng ký role ADMIN 
        if (strRoles != null && !strRoles.isEmpty()) {
            if (strRoles.contains("admin")) {
                throw new RuntimeException("Error: Role is not allowed for public registration.");
            }
        }

        // Nếu không có role → Mặc định là STUDENT
        if (strRoles == null || strRoles.isEmpty()) {
            Role userRole = roleRepository.findByName(ERole.ROLE_STUDENT)
                    .orElseThrow(() -> new RuntimeException("Error: Role 'STUDENT' is not found."));
            roles.add(userRole);
        } else {
            // Chỉ cho phép đăng ký role LECTURER hoặc STUDENT
            strRoles.forEach(role -> {
                switch (role.toLowerCase()) {
                    case "lecturer":
                        Role lecturerRole = roleRepository.findByName(ERole.ROLE_LECTURER)
                                .orElseThrow(() -> new RuntimeException("Error: Role 'LECTURER' is not found."));
                        roles.add(lecturerRole);
                        break;
                    case "student":
                    default:
                        Role userRole = roleRepository.findByName(ERole.ROLE_STUDENT)
                                .orElseThrow(() -> new RuntimeException("Error: Role 'STUDENT' is not found."));
                        roles.add(userRole);
                        break;
                }
            });
        }
        user.setRoles(roles);
        // Lưu user vào database 
        return userRepository.save(user);
    }

    // Xử lý quên mật khẩu
    @Transactional
    public void handleForgotPassword(ForgotPasswordRequest request, HttpServletRequest servletRequest) {
        // Tìm user theo email 
        User user = userRepository.findByEmail(request.getEmail())
                .orElseThrow(() -> new UsernameNotFoundException("Email không tồn tại trong hệ thống!"));

        // Kiểm tra có token cũ không 
        // Nếu có thì cập nhật, không thì tạo mới 
        Optional<PasswordResetToken> existingToken = tokenRepository.findByUser(user);
        String token = UUID.randomUUID().toString();
        PasswordResetToken resetToken;
        
        if (existingToken.isPresent()) {
            resetToken = existingToken.get(); 
            resetToken.setToken(token);
            resetToken.setExpiryDate(LocalDateTime.now().plusHours(24)); 
        } else {
            resetToken = new PasswordResetToken(token, user); 
        }

        // Lưu token vào database
        tokenRepository.save(resetToken); 
        String resetLink = frontendUrl + "/reset-password?token=" + token; 
        // Gửi email chứa link reset
        emailService.sendPasswordResetEmail(user.getEmail(), resetLink); 
    }

    // Xử lý đặt lại mật khẩu
    @Transactional
    public void handleResetPassword(ResetPasswordRequest request) {
        // Bước 1: Tìm token trong database → Query: SELECT * FROM password_reset_tokens WHERE token = ?
        PasswordResetToken resetToken = tokenRepository.findByToken(request.getToken())
                .orElseThrow(() -> new RuntimeException("Error: Invalid reset token!"));

        // Bước 2: Kiểm tra token có hết hạn không (expiryDate < now)
        if (resetToken.getExpiryDate().isBefore(LocalDateTime.now())) {
            tokenRepository.delete(resetToken); // Xóa token hết hạn
            throw new RuntimeException("Error: Token expired!");
        }

        User user = resetToken.getUser(); // Lấy user từ token
        
        // Bước 3: Kiểm tra mật khẩu mới không được giống mật khẩu cũ
        if (encoder.matches(request.getNewPassword(), user.getPassword())) {
            throw new IllegalArgumentException("Mật khẩu mới phải khác mật khẩu cũ. Vui lòng chọn mật khẩu khác.");
        }
        
        // Bước 4: Mã hóa mật khẩu mới bằng BCrypt → Lưu vào database
        user.setPassword(encoder.encode(request.getNewPassword()));
        userRepository.save(user);
        // Bước 5: Xóa token sau khi dùng (token chỉ dùng 1 lần)
        tokenRepository.delete(resetToken);
    }

    // Cập nhật thông tin profile
    @Transactional
    public User updateProfile(Long userId, UpdateProfileRequest request) {
        // Bước 1: Tìm user theo ID → Query: SELECT * FROM users WHERE id = ?
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new UsernameNotFoundException("User not found!"));

        if (request == null) {
            throw new IllegalArgumentException("Request không hợp lệ");
        }

        // Bước 2: Partial Update - Chỉ update field có giá trị (không null)
        // Nếu đổi email → Kiểm tra email mới chưa được sử dụng
        if (request.getEmail() != null && !request.getEmail().equals(user.getEmail())) {
            if (userRepository.existsByEmail(request.getEmail())) { // Query: SELECT COUNT(*) FROM users WHERE email = ?
                throw new IllegalArgumentException("Email này đã được sử dụng");
            }
            user.setEmail(request.getEmail());
        }

        if (request.getFullName() != null && !request.getFullName().trim().isEmpty()) {
            user.setFullName(request.getFullName());
        }

        if (request.getAvatarUrl() != null) {
            user.setAvatarUrl(request.getAvatarUrl());
        }

        if (request.getBio() != null) {
            user.setBio(request.getBio());
        }

        // Cho phép xóa field bằng cách gửi empty string → Convert thành null
        if (request.getExpertise() != null) {
            user.setExpertise(request.getExpertise().trim().isEmpty() ? null : request.getExpertise().trim());
        }

        if (request.getPhoneNumber() != null) {
            user.setPhoneNumber(request.getPhoneNumber().trim().isEmpty() ? null : request.getPhoneNumber().trim());
        }

        if (request.getAddress() != null) {
            user.setAddress(request.getAddress().trim().isEmpty() ? null : request.getAddress().trim());
        }

        if (request.getEmailNotificationEnabled() != null) {
            user.setEmailNotificationEnabled(request.getEmailNotificationEnabled());
        }

        // Bước 3: Lưu thay đổi vào database → UPDATE users SET ...
        return userRepository.save(user);
    }

    // Cập nhật avatar URL
    @Transactional
    public User updateAvatarUrl(Long userId, String avatarUrl) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new UsernameNotFoundException("User not found!"));
        user.setAvatarUrl(avatarUrl);
        return userRepository.save(user);
    }

    // Lấy user theo ID
    public User getUserById(Long userId) {
        return userRepository.findById(userId)
                .orElseThrow(() -> new UsernameNotFoundException("User not found with id: " + userId));
    }

    // Lấy thông tin profile dưới dạng DTO
    public ProfileResponse getUserProfile(Long userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new UsernameNotFoundException("User not found with id: " + userId));
        
        return new ProfileResponse(
                user.getId(),
                user.getUsername(),
                user.getEmail(),
                user.getFullName(),
                user.getPhoneNumber(),
                user.getAddress(),
                user.getBio(),
                user.getExpertise(),
                user.getAvatarUrl(),
                user.getEmailNotificationEnabled() != null ? user.getEmailNotificationEnabled() : false,
                user.getCreatedAt()
        );
    }

    // Đổi mật khẩu
    @Transactional
    public void changePassword(Long userId, ChangePasswordRequest request) {
        // Bước 1: Tìm user theo ID
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new UsernameNotFoundException("User not found!"));

        // Bước 2: Validate request
        if (request == null) {
            throw new IllegalArgumentException("Request không hợp lệ");
        }
        if (request.getOldPassword() == null || request.getOldPassword().trim().isEmpty()) {
            throw new IllegalArgumentException("Mật khẩu hiện tại không được để trống");
        }
        if (request.getNewPassword() == null || request.getNewPassword().trim().isEmpty()) {
            throw new IllegalArgumentException("Mật khẩu mới không được để trống");
        }

        String storedPassword = user.getPassword(); // Lấy password đã mã hóa từ database
        if (storedPassword == null || storedPassword.trim().isEmpty()) {
            throw new RuntimeException("Lỗi: Mật khẩu trong database không hợp lệ");
        }

        // Bước 3: Verify old password → encoder.matches() so sánh plain password với hashed password
        if (!encoder.matches(request.getOldPassword(), storedPassword)) {
            throw new IllegalArgumentException("Mật khẩu hiện tại không đúng");
        }

        // Bước 4: Kiểm tra mật khẩu mới không được giống mật khẩu cũ
        if (encoder.matches(request.getNewPassword(), storedPassword)) {
            throw new IllegalArgumentException("Mật khẩu mới phải khác mật khẩu cũ. Vui lòng chọn mật khẩu khác.");
        }

        // Bước 5: Mã hóa mật khẩu mới bằng BCrypt → Lưu vào database
        user.setPassword(encoder.encode(request.getNewPassword()));
        userRepository.save(user);
    }
}
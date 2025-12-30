package com.coursemgmt.dto;

import com.coursemgmt.model.User;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class AdminUserDTO {
    private Long id;
    private String username;
    private String email;
    private String fullName;
    private String avatarUrl;
    private Boolean isEnabled;
    private LocalDateTime createdAt;
    private List<RoleDTO> roles;

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    public static class RoleDTO {
        private Integer id;
        private String name;
    }

    // Static method to convert User entity to DTO
    public static AdminUserDTO fromEntity(User user) {
        List<RoleDTO> roleDTOs = user.getRoles().stream()
                .map(role -> new RoleDTO(role.getId(), role.getName().name()))
                .collect(Collectors.toList());

        return new AdminUserDTO(
                user.getId(),
                user.getUsername(),
                user.getEmail(),
                user.getFullName(),
                user.getAvatarUrl(),
                user.getIsEnabled(),
                user.getCreatedAt(),
                roleDTOs
        );
    }
}


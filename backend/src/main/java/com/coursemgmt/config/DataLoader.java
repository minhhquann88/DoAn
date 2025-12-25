package com.coursemgmt.config;

import com.coursemgmt.model.ERole;
import com.coursemgmt.model.Role;
import com.coursemgmt.repository.RoleRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Component;

/**
 * DataLoader - Tự động khởi tạo dữ liệu cần thiết khi ứng dụng khởi động
 */
@Component
public class DataLoader implements CommandLineRunner {

    private static final Logger logger = LoggerFactory.getLogger(DataLoader.class);

    @Autowired
    private RoleRepository roleRepository;

    @Override
    public void run(String... args) throws Exception {
        initRoles();
    }

    private void initRoles() {
        // Tạo ROLE_STUDENT nếu chưa có
        if (roleRepository.findByName(ERole.ROLE_STUDENT).isEmpty()) {
            Role studentRole = new Role();
            studentRole.setName(ERole.ROLE_STUDENT);
            roleRepository.save(studentRole);
            logger.info("Created role: ROLE_STUDENT");
        }

        // Tạo ROLE_LECTURER nếu chưa có
        if (roleRepository.findByName(ERole.ROLE_LECTURER).isEmpty()) {
            Role lecturerRole = new Role();
            lecturerRole.setName(ERole.ROLE_LECTURER);
            roleRepository.save(lecturerRole);
            logger.info("Created role: ROLE_LECTURER");
        }

        // Tạo ROLE_ADMIN nếu chưa có
        if (roleRepository.findByName(ERole.ROLE_ADMIN).isEmpty()) {
            Role adminRole = new Role();
            adminRole.setName(ERole.ROLE_ADMIN);
            roleRepository.save(adminRole);
            logger.info("Created role: ROLE_ADMIN");
        }

        logger.info("Roles initialization completed!");
    }
}


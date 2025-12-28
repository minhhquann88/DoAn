package com.coursemgmt.config;

import com.coursemgmt.model.Category;
import com.coursemgmt.repository.CategoryRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Component;

@Component
public class DataLoader implements CommandLineRunner {

    @Autowired
    private CategoryRepository categoryRepository;

    @Override
    public void run(String... args) throws Exception {
        if (categoryRepository.count() == 0) {
            System.out.println("Initializing categories...");

            Category cat1 = new Category();
            cat1.setName("Lập trình");
            cat1.setDescription("Các khóa học về lập trình và phát triển phần mềm");
            categoryRepository.save(cat1);

            Category cat2 = new Category();
            cat2.setName("Web Development");
            cat2.setDescription("Phát triển ứng dụng web");
            categoryRepository.save(cat2);

            Category cat3 = new Category();
            cat3.setName("Mobile Development");
            cat3.setDescription("Phát triển ứng dụng di động");
            categoryRepository.save(cat3);

            Category cat4 = new Category();
            cat4.setName("Data Science");
            cat4.setDescription("Khoa học dữ liệu và phân tích");
            categoryRepository.save(cat4);

            Category cat5 = new Category();
            cat5.setName("Front-end");
            cat5.setDescription("Phát triển giao diện người dùng");
            categoryRepository.save(cat5);

            Category cat6 = new Category();
            cat6.setName("Back-end");
            cat6.setDescription("Phát triển server và API");
            categoryRepository.save(cat6);

            Category cat7 = new Category();
            cat7.setName("Mobile App");
            cat7.setDescription("Phát triển ứng dụng di động");
            categoryRepository.save(cat7);

            Category cat8 = new Category();
            cat8.setName("DevOps");
            cat8.setDescription("Vận hành và triển khai phần mềm");
            categoryRepository.save(cat8);

            Category cat9 = new Category();
            cat9.setName("UI/UX Design");
            cat9.setDescription("Thiết kế giao diện và trải nghiệm người dùng");
            categoryRepository.save(cat9);

            Category cat10 = new Category();
            cat10.setName("Database");
            cat10.setDescription("Quản lý và phát triển cơ sở dữ liệu");
            categoryRepository.save(cat10);

            System.out.println("Categories initialized successfully!");
        } else {
            System.out.println("Categories already exist. Skipping initialization.");
        }
    }
}


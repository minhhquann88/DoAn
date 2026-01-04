package com.coursemgmt.config;

import com.coursemgmt.model.*;
import com.coursemgmt.repository.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

import java.time.LocalDateTime;
import java.util.HashSet;
import java.util.List;

@Component
public class DataLoader implements CommandLineRunner {

    @Autowired
    private CategoryRepository categoryRepository;

    @Autowired
    private RoleRepository roleRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private CourseRepository courseRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @Override
    public void run(String... args) throws Exception {
        // Initialize Roles
        initializeRoles();
        
        // Initialize Categories
        initializeCategories();
        
        // Initialize Sample Instructors and Featured Courses
        initializeSampleData();
    }

    private void initializeRoles() {
        if (roleRepository.count() == 0) {
            System.out.println("Initializing roles...");

            Role adminRole = new Role();
            adminRole.setName(ERole.ROLE_ADMIN);
            roleRepository.save(adminRole);

            Role lecturerRole = new Role();
            lecturerRole.setName(ERole.ROLE_LECTURER);
            roleRepository.save(lecturerRole);

            Role studentRole = new Role();
            studentRole.setName(ERole.ROLE_STUDENT);
            roleRepository.save(studentRole);

            System.out.println("Roles initialized successfully!");
        } else {
            System.out.println("Roles already exist. Skipping initialization.");
        }
    }

    private void initializeCategories() {
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

    private void initializeSampleData() {
        // Chỉ tạo dữ liệu mẫu nếu chưa có courses nào
        if (courseRepository.count() == 0) {
            System.out.println("Initializing sample instructors and featured courses...");

            // Lấy roles
            Role lecturerRole = roleRepository.findByName(ERole.ROLE_LECTURER)
                    .orElseThrow(() -> new RuntimeException("ROLE_LECTURER not found"));

            // Lấy categories
            List<Category> categories = categoryRepository.findAll();
            if (categories.isEmpty()) {
                System.out.println("No categories found. Skipping sample data initialization.");
                return;
            }

            // Tạo instructors
            User instructor1 = createInstructor(
                    "instructor1",
                    "instructor1@example.com",
                    "Nguyễn Văn A",
                    "Giảng viên chuyên về Java và Spring Boot với hơn 10 năm kinh nghiệm",
                    "Java, Spring Boot, Microservices",
                    passwordEncoder.encode("123456")
            );
            instructor1.getRoles().add(lecturerRole);
            instructor1 = userRepository.save(instructor1);

            User instructor2 = createInstructor(
                    "instructor2",
                    "instructor2@example.com",
                    "Trần Thị B",
                    "Chuyên gia phát triển web với React.js và Node.js",
                    "React.js, Node.js, JavaScript",
                    passwordEncoder.encode("123456")
            );
            instructor2.getRoles().add(lecturerRole);
            instructor2 = userRepository.save(instructor2);

            User instructor3 = createInstructor(
                    "instructor3",
                    "instructor3@example.com",
                    "Lê Văn C",
                    "Giảng viên về Python và Data Science",
                    "Python, Data Science, Machine Learning",
                    passwordEncoder.encode("123456")
            );
            instructor3.getRoles().add(lecturerRole);
            instructor3 = userRepository.save(instructor3);

            // Tạo featured courses
            createFeaturedCourse(
                    "Java Spring Boot Cơ bản",
                    "Khóa học toàn diện về Spring Boot framework cho Java. Học từ cơ bản đến nâng cao, xây dựng ứng dụng web thực tế với Spring Boot, Spring Data JPA, Spring Security và nhiều công nghệ khác.",
                    500000.0,
                    "https://files.f8.edu.vn/f8-prod/courses/7.png",
                    40,
                    instructor1,
                    categories.stream().filter(c -> c.getName().equals("Lập trình")).findFirst().orElse(categories.get(0))
            );

            createFeaturedCourse(
                    "React.js từ Zero đến Hero",
                    "Học React.js từ cơ bản đến nâng cao. Xây dựng ứng dụng web hiện đại với React Hooks, Redux, Next.js và các công nghệ frontend mới nhất.",
                    600000.0,
                    "https://files.f8.edu.vn/f8-prod/courses/7.png",
                    50,
                    instructor2,
                    categories.stream().filter(c -> c.getName().equals("Front-end")).findFirst().orElse(categories.get(0))
            );

            createFeaturedCourse(
                    "Node.js Backend Development",
                    "Xây dựng backend mạnh mẽ với Node.js và Express. Học cách tạo RESTful API, WebSocket, authentication, và deploy ứng dụng lên production.",
                    550000.0,
                    "https://files.f8.edu.vn/f8-prod/courses/7.png",
                    45,
                    instructor2,
                    categories.stream().filter(c -> c.getName().equals("Back-end")).findFirst().orElse(categories.get(0))
            );

            createFeaturedCourse(
                    "Python cho Data Science",
                    "Khóa học Python chuyên sâu về Data Science. Học cách phân tích dữ liệu với Pandas, NumPy, Matplotlib và xây dựng mô hình Machine Learning.",
                    650000.0,
                    "https://files.f8.edu.vn/f8-prod/courses/7.png",
                    60,
                    instructor3,
                    categories.stream().filter(c -> c.getName().equals("Data Science")).findFirst().orElse(categories.get(0))
            );

            createFeaturedCourse(
                    "Full Stack Web Development",
                    "Khóa học toàn diện về phát triển web full stack. Học cả frontend (React) và backend (Node.js), database (MongoDB, PostgreSQL), và deploy ứng dụng.",
                    800000.0,
                    "https://files.f8.edu.vn/f8-prod/courses/7.png",
                    80,
                    instructor2,
                    categories.stream().filter(c -> c.getName().equals("Web Development")).findFirst().orElse(categories.get(0))
            );

            System.out.println("Sample instructors and featured courses initialized successfully!");
        } else {
            System.out.println("Courses already exist. Skipping sample data initialization.");
        }
    }

    private User createInstructor(String username, String email, String fullName, 
                                  String bio, String expertise, String encodedPassword) {
        User instructor = new User();
        instructor.setUsername(username);
        instructor.setEmail(email);
        instructor.setFullName(fullName);
        instructor.setPassword(encodedPassword);
        instructor.setBio(bio);
        instructor.setExpertise(expertise);
        instructor.setIsEnabled(true);
        instructor.setCreatedAt(LocalDateTime.now());
        instructor.setRoles(new HashSet<>());
        return instructor;
    }

    private void createFeaturedCourse(String title, String description, Double price,
                                      String imageUrl, Integer totalDurationInHours,
                                      User instructor, Category category) {
        Course course = new Course();
        course.setTitle(title);
        course.setDescription(description);
        course.setPrice(price);
        course.setImageUrl(imageUrl);
        course.setTotalDurationInHours(totalDurationInHours);
        course.setStatus(ECourseStatus.PUBLISHED);
        course.setIsFeatured(true);
        course.setIsPublished(true);
        course.setInstructor(instructor);
        course.setCategory(category);
        course.setCreatedAt(LocalDateTime.now());
        course.setUpdatedAt(LocalDateTime.now());
        courseRepository.save(course);
    }
}


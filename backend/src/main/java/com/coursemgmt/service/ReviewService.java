package com.coursemgmt.service;

import com.coursemgmt.dto.CourseRatingDTO;
import com.coursemgmt.dto.ReviewDTO;
import com.coursemgmt.dto.ReviewRequest;
import com.coursemgmt.model.Course;
import com.coursemgmt.model.Enrollment;
import com.coursemgmt.model.Review;
import com.coursemgmt.model.User;
import com.coursemgmt.repository.CourseRepository;
import com.coursemgmt.repository.EnrollmentRepository;
import com.coursemgmt.repository.ReviewRepository;
import com.coursemgmt.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;

@Service
public class ReviewService {

    @Autowired
    private ReviewRepository reviewRepository;

    @Autowired
    private CourseRepository courseRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private EnrollmentRepository enrollmentRepository;

    @Autowired
    private NotificationService notificationService;

    /**
     * Tạo hoặc cập nhật đánh giá
     */
    @Transactional
    public ReviewDTO createOrUpdateReview(Long userId, Long courseId, ReviewRequest request) {
        // Kiểm tra user tồn tại
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy người dùng"));

        // Kiểm tra course tồn tại
        Course course = courseRepository.findById(courseId)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy khóa học"));

        // Kiểm tra user đã đăng ký khóa học chưa
        boolean isEnrolled = enrollmentRepository.existsByUserIdAndCourseId(userId, courseId);
        if (!isEnrolled) {
            throw new RuntimeException("Bạn cần đăng ký khóa học trước khi đánh giá");
        }

        // Tìm review cũ hoặc tạo mới
        Optional<Review> existingReview = reviewRepository.findByUserIdAndCourseId(userId, courseId);
        boolean isNewReview = existingReview.isEmpty();
        
        Review review = existingReview.orElse(new Review());

        review.setUser(user);
        review.setCourse(course);
        review.setRating(request.getRating());
        review.setComment(request.getComment());

        Review savedReview = reviewRepository.save(review);
        
        // Gửi thông báo cho giảng viên khi có đánh giá mới hoặc chỉnh sửa
        try {
            if (isNewReview) {
                System.out.println(">>> Creating notification for new review: studentId=" + userId + ", courseId=" + courseId + ", rating=" + request.getRating());
                notificationService.notifyNewReview(userId, courseId, request.getRating());
            } else {
                System.out.println(">>> Creating notification for updated review: studentId=" + userId + ", courseId=" + courseId + ", rating=" + request.getRating());
                notificationService.notifyReviewUpdate(userId, courseId, request.getRating());
            }
            System.out.println(">>> Notification created successfully");
        } catch (Exception e) {
            System.err.println(">>> ERROR: Failed to create notification in ReviewService: " + e.getMessage());
            e.printStackTrace();
            // Không throw exception để không ảnh hưởng đến việc tạo review
        }
        
        return convertToDTO(savedReview);
    }

    /**
     * Lấy đánh giá của user cho một khóa học
     */
    @Transactional(readOnly = true)
    public Optional<ReviewDTO> getUserReviewForCourse(Long userId, Long courseId) {
        return reviewRepository.findByUserIdAndCourseId(userId, courseId)
                .map(this::convertToDTO);
    }

    /**
     * Lấy tất cả đánh giá của một khóa học
     */
    @Transactional(readOnly = true)
    public Page<ReviewDTO> getCourseReviews(Long courseId, Pageable pageable) {
        return reviewRepository.findByCourseId(courseId, pageable)
                .map(this::convertToDTO);
    }

    /**
     * Lấy thông tin rating tổng hợp của khóa học
     */
    @Transactional(readOnly = true)
    public CourseRatingDTO getCourseRating(Long courseId) {
        Double avgRating = reviewRepository.getAverageRatingByCourseId(courseId);
        Long totalReviews = reviewRepository.countByCourseId(courseId);
        
        // Lấy phân bố rating
        Map<Integer, Long> distribution = new HashMap<>();
        for (int i = 1; i <= 5; i++) {
            distribution.put(i, 0L);
        }
        
        List<Object[]> rawDistribution = reviewRepository.getRatingDistribution(courseId);
        for (Object[] row : rawDistribution) {
            Integer rating = (Integer) row[0];
            Long count = (Long) row[1];
            distribution.put(rating, count);
        }

        return new CourseRatingDTO(
                courseId,
                avgRating != null ? avgRating : 0.0,
                totalReviews != null ? totalReviews : 0L,
                distribution
        );
    }

    /**
     * Lấy điểm đánh giá trung bình của instructor
     */
    @Transactional(readOnly = true)
    public Double getInstructorAverageRating(Long instructorId) {
        Double avgRating = reviewRepository.getAverageRatingByInstructorId(instructorId);
        return avgRating != null ? avgRating : 0.0;
    }

    /**
     * Xóa đánh giá
     */
    @Transactional
    public void deleteReview(Long reviewId, Long userId) {
        Review review = reviewRepository.findById(reviewId)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy đánh giá"));

        if (!review.getUser().getId().equals(userId)) {
            throw new RuntimeException("Bạn không có quyền xóa đánh giá này");
        }

        reviewRepository.delete(review);
    }

    /**
     * Kiểm tra user có thể đánh giá khóa học không
     */
    @Transactional(readOnly = true)
    public boolean canUserReview(Long userId, Long courseId) {
        // User phải đã đăng ký khóa học
        return enrollmentRepository.existsByUserIdAndCourseId(userId, courseId);
    }

    /**
     * Kiểm tra user đã đánh giá khóa học chưa
     */
    @Transactional(readOnly = true)
    public boolean hasUserReviewed(Long userId, Long courseId) {
        return reviewRepository.existsByUserIdAndCourseId(userId, courseId);
    }

    /**
     * Convert Review entity to DTO
     */
    private ReviewDTO convertToDTO(Review review) {
        ReviewDTO dto = new ReviewDTO();
        dto.setId(review.getId());
        dto.setRating(review.getRating());
        dto.setComment(review.getComment());
        dto.setCreatedAt(review.getCreatedAt());
        dto.setUpdatedAt(review.getUpdatedAt());

        if (review.getUser() != null) {
            dto.setUserId(review.getUser().getId());
            dto.setUserName(review.getUser().getUsername());
            dto.setUserFullName(review.getUser().getFullName());
            dto.setUserAvatar(review.getUser().getAvatarUrl());
        }

        if (review.getCourse() != null) {
            dto.setCourseId(review.getCourse().getId());
            dto.setCourseTitle(review.getCourse().getTitle());
            
            // Instructor info for reply
            if (review.getCourse().getInstructor() != null) {
                dto.setInstructorName(review.getCourse().getInstructor().getFullName());
                dto.setInstructorAvatar(review.getCourse().getInstructor().getAvatarUrl());
            }
        }

        // Instructor reply
        dto.setInstructorReply(review.getInstructorReply());
        dto.setRepliedAt(review.getRepliedAt());

        return dto;
    }

    /**
     * Giảng viên phản hồi đánh giá
     */
    @Transactional
    public ReviewDTO replyToReview(Long reviewId, Long instructorId, String reply) {
        Review review = reviewRepository.findById(reviewId)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy đánh giá"));

        // Kiểm tra quyền: chỉ instructor của khóa học mới được phản hồi
        if (review.getCourse().getInstructor() == null ||
            !review.getCourse().getInstructor().getId().equals(instructorId)) {
            throw new RuntimeException("Bạn không có quyền phản hồi đánh giá này");
        }

        review.setInstructorReply(reply);
        review.setRepliedAt(java.time.LocalDateTime.now());

        Review savedReview = reviewRepository.save(review);
        
        // Gửi thông báo cho học viên khi giảng viên phản hồi
        notificationService.notifyReviewReply(
            review.getUser().getId(),
            review.getCourse().getId(),
            review.getCourse().getInstructor().getFullName()
        );
        
        return convertToDTO(savedReview);
    }

    /**
     * Lấy tất cả đánh giá cho các khóa học của instructor
     */
    @Transactional(readOnly = true)
    public Page<ReviewDTO> getInstructorCourseReviews(Long instructorId, Pageable pageable) {
        return reviewRepository.findByInstructorId(instructorId, pageable)
                .map(this::convertToDTO);
    }

    /**
     * Đếm số đánh giá chưa phản hồi của instructor
     */
    @Transactional(readOnly = true)
    public Long countUnrepliedReviews(Long instructorId) {
        return reviewRepository.countUnrepliedByInstructorId(instructorId);
    }
}


package com.coursemgmt.controller;

import com.coursemgmt.dto.CourseRatingDTO;
import com.coursemgmt.dto.MessageResponse;
import com.coursemgmt.dto.ReviewDTO;
import com.coursemgmt.dto.ReviewRequest;
import com.coursemgmt.security.services.UserDetailsImpl;
import com.coursemgmt.service.ReviewService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.Map;
import java.util.Optional;

@RestController
@RequestMapping("/api/reviews")
@CrossOrigin(origins = "*", maxAge = 3600)
public class ReviewController {

    @Autowired
    private ReviewService reviewService;

    /**
     * Tạo hoặc cập nhật đánh giá cho khóa học
     */
    @PostMapping("/courses/{courseId}")
    @PreAuthorize("hasRole('STUDENT') or hasRole('LECTURER') or hasRole('ADMIN')")
    public ResponseEntity<?> createOrUpdateReview(
            @PathVariable Long courseId,
            @Valid @RequestBody ReviewRequest request,
            @AuthenticationPrincipal UserDetailsImpl userDetails) {
        try {
            ReviewDTO review = reviewService.createOrUpdateReview(
                    userDetails.getId(),
                    courseId,
                    request
            );
            return ResponseEntity.ok(review);
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest()
                    .body(new MessageResponse(e.getMessage()));
        }
    }

    /**
     * Lấy đánh giá của user hiện tại cho một khóa học
     */
    @GetMapping("/courses/{courseId}/my-review")
    @PreAuthorize("hasRole('STUDENT') or hasRole('LECTURER') or hasRole('ADMIN')")
    public ResponseEntity<?> getMyReview(
            @PathVariable Long courseId,
            @AuthenticationPrincipal UserDetailsImpl userDetails) {
        Optional<ReviewDTO> review = reviewService.getUserReviewForCourse(
                userDetails.getId(),
                courseId
        );
        
        if (review.isPresent()) {
            return ResponseEntity.ok(review.get());
        } else {
            // Return empty response with 200 status
            return ResponseEntity.ok().build();
        }
    }

    /**
     * Lấy tất cả đánh giá của một khóa học
     */
    @GetMapping("/courses/{courseId}")
    public ResponseEntity<Page<ReviewDTO>> getCourseReviews(
            @PathVariable Long courseId,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(defaultValue = "createdAt") String sortBy,
            @RequestParam(defaultValue = "desc") String sortDir) {
        
        Sort sort = sortDir.equalsIgnoreCase("asc") 
                ? Sort.by(sortBy).ascending() 
                : Sort.by(sortBy).descending();
        Pageable pageable = PageRequest.of(page, size, sort);
        
        Page<ReviewDTO> reviews = reviewService.getCourseReviews(courseId, pageable);
        return ResponseEntity.ok(reviews);
    }

    /**
     * Lấy thông tin rating tổng hợp của khóa học
     */
    @GetMapping("/courses/{courseId}/rating")
    public ResponseEntity<CourseRatingDTO> getCourseRating(@PathVariable Long courseId) {
        CourseRatingDTO rating = reviewService.getCourseRating(courseId);
        return ResponseEntity.ok(rating);
    }

    /**
     * Kiểm tra user có thể đánh giá khóa học không
     */
    @GetMapping("/courses/{courseId}/can-review")
    @PreAuthorize("hasRole('STUDENT') or hasRole('LECTURER') or hasRole('ADMIN')")
    public ResponseEntity<?> canReview(
            @PathVariable Long courseId,
            @AuthenticationPrincipal UserDetailsImpl userDetails) {
        
        boolean canReview = reviewService.canUserReview(userDetails.getId(), courseId);
        boolean hasReviewed = reviewService.hasUserReviewed(userDetails.getId(), courseId);
        
        Map<String, Object> response = new HashMap<>();
        response.put("canReview", canReview);
        response.put("hasReviewed", hasReviewed);
        
        return ResponseEntity.ok(response);
    }

    /**
     * Xóa đánh giá
     */
    @DeleteMapping("/{reviewId}")
    @PreAuthorize("hasRole('STUDENT') or hasRole('LECTURER') or hasRole('ADMIN')")
    public ResponseEntity<?> deleteReview(
            @PathVariable Long reviewId,
            @AuthenticationPrincipal UserDetailsImpl userDetails) {
        try {
            reviewService.deleteReview(reviewId, userDetails.getId());
            return ResponseEntity.ok(new MessageResponse("Đã xóa đánh giá thành công"));
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest()
                    .body(new MessageResponse(e.getMessage()));
        }
    }

    /**
     * Giảng viên phản hồi đánh giá
     */
    @PostMapping("/{reviewId}/reply")
    @PreAuthorize("hasRole('LECTURER') or hasRole('ADMIN')")
    public ResponseEntity<?> replyToReview(
            @PathVariable Long reviewId,
            @RequestBody Map<String, String> request,
            @AuthenticationPrincipal UserDetailsImpl userDetails) {
        try {
            String reply = request.get("reply");
            if (reply == null || reply.trim().isEmpty()) {
                return ResponseEntity.badRequest()
                        .body(new MessageResponse("Nội dung phản hồi không được để trống"));
            }
            ReviewDTO review = reviewService.replyToReview(reviewId, userDetails.getId(), reply.trim());
            return ResponseEntity.ok(review);
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest()
                    .body(new MessageResponse(e.getMessage()));
        }
    }

    /**
     * Lấy tất cả đánh giá cho các khóa học của giảng viên
     */
    @GetMapping("/instructor/my-course-reviews")
    @PreAuthorize("hasRole('LECTURER') or hasRole('ADMIN')")
    public ResponseEntity<Page<ReviewDTO>> getInstructorCourseReviews(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            @AuthenticationPrincipal UserDetailsImpl userDetails) {
        
        Pageable pageable = PageRequest.of(page, size, Sort.by("createdAt").descending());
        Page<ReviewDTO> reviews = reviewService.getInstructorCourseReviews(userDetails.getId(), pageable);
        return ResponseEntity.ok(reviews);
    }

    /**
     * Đếm số đánh giá chưa phản hồi
     */
    @GetMapping("/instructor/unreplied-count")
    @PreAuthorize("hasRole('LECTURER') or hasRole('ADMIN')")
    public ResponseEntity<?> getUnrepliedCount(@AuthenticationPrincipal UserDetailsImpl userDetails) {
        Long count = reviewService.countUnrepliedReviews(userDetails.getId());
        Map<String, Long> response = new HashMap<>();
        response.put("count", count);
        return ResponseEntity.ok(response);
    }
}


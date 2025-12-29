import apiClient from '@/lib/api';

// Types
export interface Review {
  id: number;
  rating: number;
  comment: string;
  createdAt: string;
  updatedAt?: string;
  userId: number;
  userName: string;
  userFullName: string;
  userAvatar?: string;
  courseId: number;
  courseTitle: string;
  // Instructor reply
  instructorReply?: string;
  repliedAt?: string;
  instructorName?: string;
  instructorAvatar?: string;
}

export interface ReviewRequest {
  rating: number;
  comment?: string;
}

export interface CourseRating {
  courseId: number;
  averageRating: number;
  totalReviews: number;
  ratingDistribution: Record<number, number>; // { 5: 10, 4: 5, 3: 2, 2: 1, 1: 0 }
}

export interface ReviewsPage {
  content: Review[];
  totalElements: number;
  totalPages: number;
  size: number;
  number: number;
}

export interface CanReviewResponse {
  canReview: boolean;
  hasReviewed: boolean;
}

// API Functions

/**
 * Tạo hoặc cập nhật đánh giá cho khóa học
 */
export const createOrUpdateReview = async (courseId: number, data: ReviewRequest): Promise<Review> => {
  const response = await apiClient.post<Review>(`/reviews/courses/${courseId}`, data);
  return response.data;
};

/**
 * Lấy đánh giá của user hiện tại cho một khóa học
 */
export const getMyReview = async (courseId: number): Promise<Review | null> => {
  try {
    const response = await apiClient.get<Review>(`/reviews/courses/${courseId}/my-review`);
    return response.data || null;
  } catch (error) {
    return null;
  }
};

/**
 * Lấy tất cả đánh giá của một khóa học
 */
export const getCourseReviews = async (
  courseId: number,
  page: number = 0,
  size: number = 10,
  sortBy: string = 'createdAt',
  sortDir: string = 'desc'
): Promise<ReviewsPage> => {
  const response = await apiClient.get<ReviewsPage>(`/reviews/courses/${courseId}`, {
    params: { page, size, sortBy, sortDir },
  });
  return response.data;
};

/**
 * Lấy thông tin rating tổng hợp của khóa học
 */
export const getCourseRating = async (courseId: number): Promise<CourseRating> => {
  const response = await apiClient.get<CourseRating>(`/reviews/courses/${courseId}/rating`);
  return response.data;
};

/**
 * Kiểm tra user có thể đánh giá khóa học không
 */
export const canReview = async (courseId: number): Promise<CanReviewResponse> => {
  try {
    const response = await apiClient.get<CanReviewResponse>(`/reviews/courses/${courseId}/can-review`);
    return response.data;
  } catch (error) {
    return { canReview: false, hasReviewed: false };
  }
};

/**
 * Xóa đánh giá
 */
export const deleteReview = async (reviewId: number): Promise<void> => {
  await apiClient.delete(`/reviews/${reviewId}`);
};

/**
 * Giảng viên phản hồi đánh giá
 */
export const replyToReview = async (reviewId: number, reply: string): Promise<Review> => {
  const response = await apiClient.post<Review>(`/reviews/${reviewId}/reply`, { reply });
  return response.data;
};

/**
 * Lấy tất cả đánh giá cho các khóa học của giảng viên
 */
export const getInstructorCourseReviews = async (
  page: number = 0,
  size: number = 10
): Promise<ReviewsPage> => {
  const response = await apiClient.get<ReviewsPage>('/reviews/instructor/my-course-reviews', {
    params: { page, size },
  });
  return response.data;
};

/**
 * Đếm số đánh giá chưa phản hồi
 */
export const getUnrepliedCount = async (): Promise<number> => {
  try {
    const response = await apiClient.get<{ count: number }>('/reviews/instructor/unreplied-count');
    return response.data.count;
  } catch {
    return 0;
  }
};


// Module 7: Instructor Management Service
// API Base: /api/v1/instructors
import apiClient from '@/lib/api';

// API prefix for instructors
const API_PREFIX = '/v1/instructors';

// =====================
// TYPES
// =====================

export interface Instructor {
  id: number;
  userId: number;
  userName: string;
  email: string;
  fullName: string;
  bio?: string;
  expertise?: string[];
  rating: number;
  totalStudents: number;
  totalCourses: number;
  totalRevenue: number;
  status: 'ACTIVE' | 'SUSPENDED' | 'INACTIVE';
  joinedAt: string;
  lastActiveAt?: string;
}

export interface InstructorStatistics {
  instructorId: number;
  totalCourses: number;
  publishedCourses: number;
  draftCourses: number;
  totalStudents: number;
  activeStudents: number;
  totalEnrollments: number;
  completionRate: number;
  averageRating: number;
  totalReviews: number;
  totalRevenue: number;
  monthlyRevenue: { month: string; revenue: number }[];
  topCourses: Array<{
    courseId: number;
    title: string;
    enrollments: number;
    revenue: number;
  }>;
}

export interface InstructorCreateRequest {
  userId: number;
  bio?: string;
  expertise?: string[];
}

export interface InstructorUpdateRequest {
  bio?: string;
  expertise?: string[];
  status?: 'ACTIVE' | 'SUSPENDED' | 'INACTIVE';
}

// =====================
// INSTRUCTOR MANAGEMENT (Admin)
// =====================

/**
 * Get all instructors (Admin)
 */
export const getAllInstructors = async (params?: {
  page?: number;
  size?: number;
  status?: 'ACTIVE' | 'SUSPENDED' | 'INACTIVE';
  search?: string;
  sortBy?: 'rating' | 'students' | 'courses' | 'revenue' | 'joinedAt';
  sortDir?: 'asc' | 'desc';
}): Promise<{
  content: Instructor[];
  totalElements: number;
  totalPages: number;
  currentPage: number;
}> => {
  const response = await apiClient.get(API_PREFIX, { params });
  return response.data;
};

/**
 * Get instructor by ID
 */
export const getInstructorById = async (instructorId: number): Promise<Instructor> => {
  const response = await apiClient.get(`${API_PREFIX}/${instructorId}`);
  return response.data;
};

/**
 * Create new instructor (Admin)
 */
export const createInstructor = async (data: InstructorCreateRequest): Promise<Instructor> => {
  const response = await apiClient.post(API_PREFIX, data);
  return response.data;
};

/**
 * Update instructor (Admin)
 */
export const updateInstructor = async (
  instructorId: number,
  data: InstructorUpdateRequest
): Promise<Instructor> => {
  const response = await apiClient.put(`${API_PREFIX}/${instructorId}`, data);
  return response.data;
};

/**
 * Delete instructor (Admin)
 */
export const deleteInstructor = async (instructorId: number): Promise<void> => {
  await apiClient.delete(`${API_PREFIX}/${instructorId}`);
};

/**
 * Suspend instructor (Admin)
 */
export const suspendInstructor = async (
  instructorId: number,
  reason?: string
): Promise<Instructor> => {
  // Note: Backend uses PATCH /v1/instructors/{id}/status?status=SUSPENDED
  const response = await apiClient.patch(`${API_PREFIX}/${instructorId}/status`, null, {
    params: { status: 'SUSPENDED' },
  });
  return response.data;
};

/**
 * Activate instructor (Admin)
 */
export const activateInstructor = async (instructorId: number): Promise<Instructor> => {
  // Note: Backend uses PATCH /v1/instructors/{id}/status?status=ACTIVE
  const response = await apiClient.patch(`${API_PREFIX}/${instructorId}/status`, null, {
    params: { status: 'ACTIVE' },
  });
  return response.data;
};

// =====================
// INSTRUCTOR PROFILE (Self)
// =====================

/**
 * Get my instructor profile
 */
export const getMyInstructorProfile = async (): Promise<Instructor> => {
  // Note: Backend doesn't have /me endpoint - need to get instructor by userId
  // TODO: Backend should implement GET /v1/instructors/me
  const response = await apiClient.get(`${API_PREFIX}/me`);
  return response.data;
};

/**
 * Update my instructor profile
 */
export const updateMyInstructorProfile = async (
  data: Partial<InstructorUpdateRequest>
): Promise<Instructor> => {
  // TODO: Backend should implement PUT /v1/instructors/me
  const response = await apiClient.put(`${API_PREFIX}/me`, data);
  return response.data;
};

// =====================
// INSTRUCTOR STATISTICS
// =====================

/**
 * Get instructor statistics
 */
export const getInstructorStatistics = async (
  instructorId: number,
  params?: {
    startDate?: string;
    endDate?: string;
  }
): Promise<InstructorStatistics> => {
  // Note: Backend endpoint is GET /v1/instructors/{id}/stats (not /statistics)
  const response = await apiClient.get(`${API_PREFIX}/${instructorId}/stats`, { params });
  return response.data;
};

/**
 * Get my statistics (Instructor)
 */
export const getMyStatistics = async (params?: {
  startDate?: string;
  endDate?: string;
}): Promise<InstructorStatistics> => {
  // TODO: Backend should implement GET /v1/instructors/me/stats
  const response = await apiClient.get(`${API_PREFIX}/me/stats`, { params });
  return response.data;
};

/**
 * Get instructor revenue report
 */
export const getInstructorRevenue = async (
  instructorId: number,
  params?: {
    startDate?: string;
    endDate?: string;
    groupBy?: 'day' | 'week' | 'month' | 'year';
  }
) => {
  // TODO: Backend should implement GET /v1/instructors/{id}/revenue
  const response = await apiClient.get(`${API_PREFIX}/${instructorId}/revenue`, { params });
  return response.data;
};

/**
 * Get my revenue report (Instructor)
 */
export const getMyRevenue = async (params?: {
  startDate?: string;
  endDate?: string;
  groupBy?: 'day' | 'week' | 'month' | 'year';
}) => {
  // TODO: Backend should implement GET /v1/instructors/me/revenue
  const response = await apiClient.get(`${API_PREFIX}/me/revenue`, { params });
  return response.data;
};

// =====================
// INSTRUCTOR COURSES
// =====================

/**
 * Get instructor's courses
 */
export const getInstructorCourses = async (
  instructorId: number,
  params?: {
    status?: 'DRAFT' | 'PENDING' | 'PUBLISHED' | 'ARCHIVED';
    page?: number;
    size?: number;
  }
) => {
  const response = await apiClient.get(`${API_PREFIX}/${instructorId}/courses`, { params });
  return response.data;
};

/**
 * Get my courses (Instructor)
 */
export const getMyCourses = async (params?: {
  status?: 'DRAFT' | 'PENDING' | 'PUBLISHED' | 'ARCHIVED';
  page?: number;
  size?: number;
}) => {
  // TODO: Backend should implement GET /v1/instructors/me/courses
  const response = await apiClient.get(`${API_PREFIX}/me/courses`, { params });
  return response.data;
};

// =====================
// INSTRUCTOR STUDENTS
// =====================

/**
 * Get instructor's students
 */
export const getInstructorStudents = async (
  instructorId: number,
  params?: {
    courseId?: number;
    status?: 'ACTIVE' | 'COMPLETED' | 'DROPPED';
    page?: number;
    size?: number;
  }
) => {
  // TODO: Backend should implement GET /v1/instructors/{id}/students
  const response = await apiClient.get(`${API_PREFIX}/${instructorId}/students`, { params });
  return response.data;
};

/**
 * Get my students (Instructor)
 */
export const getMyStudents = async (params?: {
  courseId?: number;
  status?: 'ACTIVE' | 'COMPLETED' | 'DROPPED';
  page?: number;
  size?: number;
}) => {
  // TODO: Backend should implement GET /v1/instructors/me/students
  const response = await apiClient.get(`${API_PREFIX}/me/students`, { params });
  return response.data;
};

// =====================
// INSTRUCTOR RANKINGS
// =====================

/**
 * Get top instructors
 */
export const getTopInstructors = async (params?: {
  limit?: number;
  sortBy?: 'rating' | 'students' | 'courses' | 'revenue';
  timeframe?: 'all' | 'month' | 'year';
}) => {
  // TODO: Backend should implement GET /v1/instructors/top
  const response = await apiClient.get(`${API_PREFIX}/top`, { params });
  return response.data;
};

/**
 * Get instructor leaderboard
 */
export const getInstructorLeaderboard = async (params?: {
  page?: number;
  size?: number;
  period?: 'month' | 'quarter' | 'year';
}) => {
  // TODO: Backend should implement GET /v1/instructors/leaderboard
  const response = await apiClient.get(`${API_PREFIX}/leaderboard`, { params });
  return response.data;
};

// =====================
// INSTRUCTOR REVIEWS
// =====================

/**
 * Get instructor reviews
 */
export const getInstructorReviews = async (
  instructorId: number,
  params?: {
    page?: number;
    size?: number;
    rating?: number;
  }
) => {
  // TODO: Backend should implement GET /v1/instructors/{id}/reviews
  const response = await apiClient.get(`${API_PREFIX}/${instructorId}/reviews`, { params });
  return response.data;
};

/**
 * Get my reviews (Instructor)
 */
export const getMyReviews = async (params?: {
  page?: number;
  size?: number;
  rating?: number;
}) => {
  // TODO: Backend should implement GET /v1/instructors/me/reviews
  const response = await apiClient.get(`${API_PREFIX}/me/reviews`, { params });
  return response.data;
};

export default {
  // Management (Admin)
  getAllInstructors,
  getInstructorById,
  createInstructor,
  updateInstructor,
  deleteInstructor,
  suspendInstructor,
  activateInstructor,
  
  // Profile (Self)
  getMyInstructorProfile,
  updateMyInstructorProfile,
  
  // Statistics
  getInstructorStatistics,
  getMyStatistics,
  getInstructorRevenue,
  getMyRevenue,
  
  // Courses
  getInstructorCourses,
  getMyCourses,
  
  // Students
  getInstructorStudents,
  getMyStudents,
  
  // Rankings
  getTopInstructors,
  getInstructorLeaderboard,
  
  // Reviews
  getInstructorReviews,
  getMyReviews,
};




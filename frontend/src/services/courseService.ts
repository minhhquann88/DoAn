/**
 * Course Service
 * API functions for course management
 */
import apiClient from '@/lib/api';
import type { Course, CourseRequest, PaginatedResponse, SearchFilters } from '@/types';

/**
 * Get all courses with optional filters
 */
export const getCourses = async (filters?: SearchFilters): Promise<PaginatedResponse<Course>> => {
  const params = new URLSearchParams();
  
  if (filters?.keyword) params.append('keyword', filters.keyword);
  if (filters?.categoryId) params.append('categoryId', filters.categoryId.toString());
  if (filters?.level) params.append('level', filters.level);
  
  // Price filtering
  if (filters?.isFree !== undefined) params.append('isFree', filters.isFree.toString());
  if (filters?.isPaid !== undefined) params.append('isPaid', filters.isPaid.toString());
  if (filters?.minPrice !== undefined) params.append('minPrice', filters.minPrice.toString());
  if (filters?.maxPrice !== undefined) params.append('maxPrice', filters.maxPrice.toString());
  
  // Pagination
  const page = filters?.page ?? 0;
  params.append('page', page.toString());
  params.append('size', '12');
  
  // Sorting
  let sortParam = 'createdAt,desc';
  if (filters?.sortBy === 'popular') sortParam = 'enrollmentCount,desc';
  if (filters?.sortBy === 'rating') sortParam = 'rating,desc';
  if (filters?.sortBy === 'price_low') sortParam = 'price,asc';
  if (filters?.sortBy === 'price_high') sortParam = 'price,desc';
  params.append('sort', sortParam);
  
  const response = await apiClient.get<PaginatedResponse<Course>>(`/v1/courses?${params.toString()}`);
  return response.data;
};

/**
 * Get course by ID
 */
export const getCourseById = async (id: string | number): Promise<Course> => {
  const response = await apiClient.get<Course>(`/v1/courses/${id}`);
  return response.data;
};

/**
 * Create a new course
 */
export const createCourse = async (data: CourseRequest): Promise<Course> => {
  const response = await apiClient.post<Course>('/v1/courses', data);
  return response.data;
};

/**
 * Update an existing course
 */
export const updateCourse = async (id: string | number, data: CourseRequest): Promise<Course> => {
  const response = await apiClient.put<Course>(`/v1/courses/${id}`, data);
  return response.data;
};

/**
 * Delete a course
 */
export const deleteCourse = async (id: string | number): Promise<void> => {
  await apiClient.delete(`/v1/courses/${id}`);
};

/**
 * Approve a course (Admin only)
 */
export const approveCourse = async (id: string | number): Promise<Course> => {
  const response = await apiClient.patch<Course>(`/v1/courses/${id}/approve`);
  return response.data;
};

/**
 * Get course statistics
 */
export const getCourseStatistics = async (id: string | number): Promise<any> => {
  const response = await apiClient.get(`/v1/courses/${id}/statistics`);
  return response.data;
};

/**
 * Get featured courses
 */
export const getFeaturedCourses = async (): Promise<Course[]> => {
  const response = await apiClient.get<Course[]>('/v1/courses/featured');
  return response.data;
};

/**
 * Get my courses (for students)
 */
export const getMyCourses = async (): Promise<Course[]> => {
  const response = await apiClient.get<Course[]>('/v1/courses/my-courses');
  return response.data;
};

/**
 * Get instructor courses (for instructors)
 */
export const getInstructorCourses = async (): Promise<Course[]> => {
  const response = await apiClient.get<Course[]>('/instructor/courses');
  return response.data;
};

/**
 * Publish a course (DRAFT -> PUBLISHED)
 */
export const publishCourse = async (id: string | number): Promise<Course> => {
  const response = await apiClient.post<Course>(`/v1/courses/${id}/publish`);
  return response.data;
};

/**
 * Unpublish a course (PUBLISHED -> DRAFT)
 */
export const unpublishCourse = async (id: string | number): Promise<Course> => {
  const response = await apiClient.post<Course>(`/v1/courses/${id}/unpublish`);
  return response.data;
};

/**
 * Upload course image
 */
export const uploadCourseImage = async (courseId: string | number, file: File): Promise<string> => {
  const formData = new FormData();
  formData.append('file', file);
  
  // Không set Content-Type thủ công - browser sẽ tự động set với boundary
  const response = await apiClient.post<{ imageUrl: string }>(`/v1/courses/${courseId}/image`, formData);
  
  return response.data.imageUrl;
};


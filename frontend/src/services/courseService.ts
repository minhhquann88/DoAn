/**
 * Course Service - Connect to Spring Boot Backend
 */
import apiClient from '@/lib/api';
import type { Course, PaginatedResponse } from '@/types';

export interface CourseRequest {
  title: string;
  shortDescription: string;
  description: string;
  categoryId: number;
  level: 'BEGINNER' | 'INTERMEDIATE' | 'ADVANCED' | 'EXPERT';
  language: string;
  price: number;
  thumbnail?: string;
  videoUrl?: string;
}

export interface CourseFilters {
  keyword?: string;
  categoryId?: number;
  level?: string;
  page?: number;
  size?: number;
  sort?: string;
}

/**
 * Get all courses với filters & pagination
 */
export const getCourses = async (filters: CourseFilters = {}): Promise<PaginatedResponse<Course>> => {
  const params = {
    keyword: filters.keyword,
    categoryId: filters.categoryId,
    page: filters.page || 0,
    size: filters.size || 12,
    sort: filters.sort || 'createdAt,desc',
  };
  
  const response = await apiClient.get<PaginatedResponse<Course>>('/courses', { params });
  return response.data;
};

/**
 * Get course by ID
 */
export const getCourseById = async (id: string): Promise<Course> => {
  const response = await apiClient.get<Course>(`/courses/${id}`);
  return response.data;
};

/**
 * Create course (Instructor/Admin)
 */
export const createCourse = async (data: CourseRequest): Promise<Course> => {
  const response = await apiClient.post<Course>('/courses', data);
  return response.data;
};

/**
 * Update course (Instructor/Admin)
 */
export const updateCourse = async (id: string, data: CourseRequest): Promise<Course> => {
  const response = await apiClient.put<Course>(`/courses/${id}`, data);
  return response.data;
};

/**
 * Delete course (Instructor/Admin)
 */
export const deleteCourse = async (id: string): Promise<void> => {
  await apiClient.delete(`/courses/${id}`);
};

/**
 * Approve course (Admin only)
 */
export const approveCourse = async (id: string): Promise<Course> => {
  const response = await apiClient.patch<Course>(`/courses/${id}/approve`);
  return response.data;
};

/**
 * Get course statistics (Instructor/Admin)
 */
export const getCourseStatistics = async (id: string) => {
  const response = await apiClient.get(`/courses/${id}/statistics`);
  return response.data;
};

/**
 * Get instructor's courses
 */
export const getInstructorCourses = async (): Promise<Course[]> => {
  const response = await apiClient.get<Course[]>('/courses/instructor/my-courses');
  return response.data;
};

/**
 * Get pending courses (Admin)
 */
export const getPendingCourses = async (): Promise<Course[]> => {
  const response = await apiClient.get<Course[]>('/courses/pending');
  return response.data;
};

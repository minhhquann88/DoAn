/**
 * Tests cho Course Service
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import * as courseService from '@/services/courseService';

// Mock axios
vi.mock('@/lib/api', () => ({
  default: {
    get: vi.fn(),
    post: vi.fn(),
    put: vi.fn(),
    delete: vi.fn(),
    patch: vi.fn(),
  },
}));

import apiClient from '@/lib/api';

describe('Course Service', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  // ==========================================
  // GET COURSES TESTS
  // ==========================================

  describe('getCourses', () => {
    it('✅ should fetch courses with default params', async () => {
      const mockResponse = {
        data: {
          content: [
            { id: 1, title: 'Course 1' },
            { id: 2, title: 'Course 2' },
          ],
          totalElements: 2,
          totalPages: 1,
        },
      };

      (apiClient.get as any).mockResolvedValue(mockResponse);

      const result = await courseService.getCourses();

      expect(apiClient.get).toHaveBeenCalledWith('/courses', {
        params: {
          keyword: undefined,
          categoryId: undefined,
          page: 0,
          size: 12,
          sort: 'createdAt,desc',
        },
      });
      expect(result.content).toHaveLength(2);
    });

    it('✅ should fetch courses with filters', async () => {
      const mockResponse = {
        data: {
          content: [{ id: 1, title: 'Java Course' }],
          totalElements: 1,
          totalPages: 1,
        },
      };

      (apiClient.get as any).mockResolvedValue(mockResponse);

      const result = await courseService.getCourses({
        keyword: 'java',
        categoryId: 1,
        page: 0,
        size: 10,
      });

      expect(apiClient.get).toHaveBeenCalledWith('/courses', {
        params: expect.objectContaining({
          keyword: 'java',
          categoryId: 1,
        }),
      });
      expect(result.content[0].title).toContain('Java');
    });
  });

  // ==========================================
  // GET COURSE BY ID TESTS
  // ==========================================

  describe('getCourseById', () => {
    it('✅ should fetch course by ID', async () => {
      const mockCourse = {
        id: 1,
        title: 'Test Course',
        description: 'Test Description',
        price: 500000,
      };

      (apiClient.get as any).mockResolvedValue({ data: mockCourse });

      const result = await courseService.getCourseById('1');

      expect(apiClient.get).toHaveBeenCalledWith('/courses/1');
      expect(result.id).toBe(1);
      expect(result.title).toBe('Test Course');
    });

    it('❌ should throw error for non-existent course', async () => {
      (apiClient.get as any).mockRejectedValue(new Error('Course not found'));

      await expect(courseService.getCourseById('99999'))
        .rejects.toThrow('Course not found');
    });
  });

  // ==========================================
  // CREATE COURSE TESTS
  // ==========================================

  describe('createCourse', () => {
    it('✅ should create course successfully', async () => {
      const courseData = {
        title: 'New Course',
        shortDescription: 'Short desc',
        description: 'Full description',
        categoryId: 1,
        level: 'BEGINNER' as const,
        language: 'Vietnamese',
        price: 500000,
      };

      const mockResponse = {
        data: {
          id: 1,
          ...courseData,
        },
      };

      (apiClient.post as any).mockResolvedValue(mockResponse);

      const result = await courseService.createCourse(courseData);

      expect(apiClient.post).toHaveBeenCalledWith('/courses', courseData);
      expect(result.title).toBe('New Course');
      expect(result.id).toBe(1);
    });

    it('❌ should throw error on validation failure', async () => {
      (apiClient.post as any).mockRejectedValue(new Error('Validation failed'));

      await expect(courseService.createCourse({
        title: '', // Invalid - empty title
        shortDescription: 'desc',
        description: 'desc',
        categoryId: 1,
        level: 'BEGINNER',
        language: 'Vietnamese',
        price: 0,
      })).rejects.toThrow();
    });
  });

  // ==========================================
  // UPDATE COURSE TESTS
  // ==========================================

  describe('updateCourse', () => {
    it('✅ should update course successfully', async () => {
      const courseData = {
        title: 'Updated Course',
        shortDescription: 'Updated desc',
        description: 'Updated full description',
        categoryId: 1,
        level: 'INTERMEDIATE' as const,
        language: 'Vietnamese',
        price: 600000,
      };

      const mockResponse = {
        data: {
          id: 1,
          ...courseData,
        },
      };

      (apiClient.put as any).mockResolvedValue(mockResponse);

      const result = await courseService.updateCourse('1', courseData);

      expect(apiClient.put).toHaveBeenCalledWith('/courses/1', courseData);
      expect(result.title).toBe('Updated Course');
    });
  });

  // ==========================================
  // DELETE COURSE TESTS
  // ==========================================

  describe('deleteCourse', () => {
    it('✅ should delete course successfully', async () => {
      (apiClient.delete as any).mockResolvedValue({ data: {} });

      await courseService.deleteCourse('1');

      expect(apiClient.delete).toHaveBeenCalledWith('/courses/1');
    });
  });

  // ==========================================
  // APPROVE COURSE TESTS
  // ==========================================

  describe('approveCourse', () => {
    it('✅ should approve course successfully', async () => {
      const mockResponse = {
        data: {
          id: 1,
          title: 'Test Course',
          status: 'PUBLISHED',
        },
      };

      (apiClient.patch as any).mockResolvedValue(mockResponse);

      const result = await courseService.approveCourse('1');

      expect(apiClient.patch).toHaveBeenCalledWith('/courses/1/approve');
      expect(result.status).toBe('PUBLISHED');
    });
  });

  // ==========================================
  // GET COURSE STATISTICS TESTS
  // ==========================================

  describe('getCourseStatistics', () => {
    it('✅ should fetch course statistics', async () => {
      const mockStats = {
        totalEnrollments: 100,
        activeEnrollments: 80,
        completedEnrollments: 20,
        revenue: 50000000,
      };

      (apiClient.get as any).mockResolvedValue({ data: mockStats });

      const result = await courseService.getCourseStatistics('1');

      expect(apiClient.get).toHaveBeenCalledWith('/courses/1/statistics');
      expect(result.totalEnrollments).toBe(100);
    });
  });
});


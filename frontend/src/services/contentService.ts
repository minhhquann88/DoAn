/**
 * Content Management Service
 * API Base: 
 * - Access: /api/content
 * - Management: /api/manage/content
 * 
 * Backend uses Chapter/Lesson hierarchical model
 */
import apiClient from '@/lib/api';

// =====================
// TYPES - Matching Backend Models
// =====================

export interface Lesson {
  id: number;
  chapterId: number;
  title: string;
  description?: string;
  contentType: 'VIDEO' | 'TEXT' | 'DOCUMENT' | 'QUIZ';
  contentUrl?: string;
  duration?: number; // in minutes
  orderIndex: number;
  isFree: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export interface Chapter {
  id: number;
  courseId: number;
  title: string;
  description?: string;
  orderIndex: number;
  lessons?: Lesson[];
  createdAt?: string;
  updatedAt?: string;
}

export interface ChapterResponse {
  id: number;
  title: string;
  description?: string;
  orderIndex: number;
  lessons: LessonResponse[];
}

export interface LessonResponse {
  id: number;
  title: string;
  description?: string;
  contentType: string;
  contentUrl?: string;
  duration?: number;
  orderIndex: number;
  isFree: boolean;
  isCompleted?: boolean;
  isPreview?: boolean; // Lesson có thể xem trước (cho guests)
  videoUrl?: string; // Video URL for preview lessons
}

export interface ChapterRequest {
  title: string;
  description?: string;
  orderIndex: number;
}

export interface LessonRequest {
  title: string;
  description?: string;
  contentType: 'VIDEO' | 'TEXT' | 'DOCUMENT' | 'QUIZ';
  contentUrl?: string;
  duration?: number;
  orderIndex: number;
  isFree?: boolean;
}

export interface UserProgress {
  lessonId: number;
  completed: boolean;
  completedAt?: string;
}

// =====================
// CONTENT ACCESS API (/api/content)
// For Students and Instructors to view content
// =====================

/**
 * Get full course content (chapters and lessons)
 * Requires authentication - user must be enrolled or instructor
 */
export const getCourseContent = async (courseId: number): Promise<ChapterResponse[]> => {
  const response = await apiClient.get<ChapterResponse[]>(`/content/courses/${courseId}`);
  return response.data;
};

/**
 * Mark lesson as completed (Student only)
 */
export const markLessonAsCompleted = async (lessonId: number): Promise<{ message: string }> => {
  const response = await apiClient.post(`/content/lessons/${lessonId}/complete`);
  return response.data;
};

// =====================
// CONTENT MANAGEMENT API (/api/manage/content)
// For Instructors and Admins to manage content
// =====================

// --- CHAPTER MANAGEMENT ---

/**
 * Create a new chapter in a course
 */
export const createChapter = async (courseId: number, data: ChapterRequest): Promise<Chapter> => {
  const response = await apiClient.post<Chapter>(`/manage/content/courses/${courseId}/chapters`, data);
  return response.data;
};

/**
 * Update a chapter
 */
export const updateChapter = async (chapterId: number, data: ChapterRequest): Promise<Chapter> => {
  const response = await apiClient.put<Chapter>(`/manage/content/chapters/${chapterId}`, data);
  return response.data;
};

/**
 * Delete a chapter
 */
export const deleteChapter = async (chapterId: number): Promise<{ message: string }> => {
  const response = await apiClient.delete(`/manage/content/chapters/${chapterId}`);
  return response.data;
};

// --- LESSON MANAGEMENT ---

/**
 * Create a new lesson in a chapter
 */
export const createLesson = async (chapterId: number, data: LessonRequest): Promise<Lesson> => {
  const response = await apiClient.post<Lesson>(`/manage/content/chapters/${chapterId}/lessons`, data);
  return response.data;
};

/**
 * Update a lesson
 */
export const updateLesson = async (lessonId: number, data: LessonRequest): Promise<Lesson> => {
  const response = await apiClient.put<Lesson>(`/manage/content/lessons/${lessonId}`, data);
  return response.data;
};

/**
 * Delete a lesson
 */
export const deleteLesson = async (lessonId: number): Promise<{ message: string }> => {
  const response = await apiClient.delete(`/manage/content/lessons/${lessonId}`);
  return response.data;
};

// --- IMPORT/EXPORT ---

/**
 * Export course content to Excel
 */
export const exportCourseContent = async (courseId: number): Promise<Blob> => {
  const response = await apiClient.get(`/manage/content/courses/${courseId}/export`, {
    responseType: 'blob',
  });
  return response.data;
};

/**
 * Import course content from Excel
 */
export const importCourseContent = async (
  courseId: number,
  file: File,
  onProgress?: (progress: number) => void
): Promise<{ message: string }> => {
  const formData = new FormData();
  formData.append('file', file);

  const response = await apiClient.post(`/manage/content/courses/${courseId}/import`, formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
    onUploadProgress: (progressEvent) => {
      if (onProgress && progressEvent.total) {
        const progress = Math.round((progressEvent.loaded * 100) / progressEvent.total);
        onProgress(progress);
      }
    },
  });

  return response.data;
};

// =====================
// HELPER FUNCTIONS
// =====================

/**
 * Download export file
 */
export const downloadExportFile = (blob: Blob, courseId: number) => {
  const url = window.URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = `NoiDungKhoaHoc_${courseId}.xlsx`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  window.URL.revokeObjectURL(url);
};

/**
 * Calculate total course duration from chapters
 */
export const calculateCourseDuration = (chapters: ChapterResponse[]): number => {
  return chapters.reduce((total, chapter) => {
    const chapterDuration = chapter.lessons.reduce((sum, lesson) => {
      return sum + (lesson.duration || 0);
    }, 0);
    return total + chapterDuration;
  }, 0);
};

/**
 * Count total lessons in course
 */
export const countTotalLessons = (chapters: ChapterResponse[]): number => {
  return chapters.reduce((total, chapter) => total + chapter.lessons.length, 0);
};

/**
 * Calculate completion percentage
 */
export const calculateCompletionPercentage = (chapters: ChapterResponse[]): number => {
  const totalLessons = countTotalLessons(chapters);
  if (totalLessons === 0) return 0;

  const completedLessons = chapters.reduce((total, chapter) => {
    return total + chapter.lessons.filter((lesson) => lesson.isCompleted).length;
  }, 0);

  return Math.round((completedLessons / totalLessons) * 100);
};

// =====================
// LEGACY FUNCTIONS (kept for backward compatibility)
// These map old API calls to new structure
// =====================

/**
 * @deprecated Use getCourseContent instead
 */
export const getCourseContents = async (courseId: number) => {
  return getCourseContent(courseId);
};

/**
 * @deprecated Use markLessonAsCompleted instead
 */
export const markContentCompleted = async (contentId: number) => {
  return markLessonAsCompleted(contentId);
};

// =====================
// EXPORTS
// =====================

export default {
  // Content Access
  getCourseContent,
  markLessonAsCompleted,

  // Chapter Management
  createChapter,
  updateChapter,
  deleteChapter,

  // Lesson Management
  createLesson,
  updateLesson,
  deleteLesson,

  // Import/Export
  exportCourseContent,
  importCourseContent,

  // Helpers
  downloadExportFile,
  calculateCourseDuration,
  countTotalLessons,
  calculateCompletionPercentage,

  // Legacy
  getCourseContents,
  markContentCompleted,
};

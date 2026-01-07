import apiClient from '@/lib/api';

export interface Lesson {
  id: number;
  chapterId: number;
  title: string;
  description?: string;
  contentType: 'VIDEO' | 'TEXT' | 'DOCUMENT' | 'QUIZ';
  contentUrl?: string;
  duration?: number;
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
  position: number;
  lessons: LessonResponse[];
}

export interface LessonResponse {
  id: number;
  title: string;
  contentType: 'VIDEO' | 'YOUTUBE' | 'TEXT' | 'DOCUMENT' | 'SLIDE';
  videoUrl?: string;
  documentUrl?: string;
  slideUrl?: string;
  content?: string;
  durationInMinutes?: number;
  position: number;
  isPreview?: boolean;
  isCompleted?: boolean;
  isLocked?: boolean; // Trạng thái khóa bài học (chỉ được mở khi đã học bài trước)
}

export interface ChapterRequest {
  title: string;
  position: number;
}

export interface LessonRequest {
  title: string;
  contentType: 'VIDEO' | 'YOUTUBE' | 'TEXT' | 'DOCUMENT' | 'SLIDE';
  videoUrl?: string;
  documentUrl?: string;
  slideUrl?: string;
  content?: string; // For TEXT content type
  durationInMinutes?: number;
  position: number;
  isPreview?: boolean;
}

export interface UserProgress {
  lessonId: number;
  completed: boolean;
  completedAt?: string;
}

/**
 * Lấy toàn bộ nội dung khóa học (chapters và lessons)
 */
export const getCourseContent = async (courseId: number): Promise<ChapterResponse[]> => {
  const response = await apiClient.get<ChapterResponse[]>(`/content/courses/${courseId}`);
  return response.data;
};

/**
 * Lấy bài học preview của khóa học có phí
 */
export const getPreviewLesson = async (courseId: number): Promise<LessonResponse | null> => {
  try {
    const response = await apiClient.get<LessonResponse>(`/content/courses/${courseId}/preview`);
    return response.data;
  } catch (error: any) {
    if (error.response?.status === 404) {
      return null;
    }
    console.error('Error fetching preview lesson:', error);
    return null;
  }
};

/**
 * Lấy cấu trúc chương trình học công khai (không có chi tiết nội dung)
 */
export const getPublicCurriculum = async (courseId: number): Promise<ChapterResponse[]> => {
  try {
    const response = await apiClient.get<ChapterResponse[]>(`/v1/courses/${courseId}/curriculum`);
    return response.data;
  } catch (error: any) {
    console.error('Error fetching public curriculum:', error);
    return [];
  }
};

/**
 * Đánh dấu lesson đã hoàn thành
 */
export const markLessonAsCompleted = async (lessonId: number): Promise<{ message: string }> => {
  const response = await apiClient.post(`/content/lessons/${lessonId}/complete`);
  return response.data;
};

/**
 * Cập nhật tiến độ xem video của lesson
 */
export const updateLessonProgress = async (
  lessonId: number,
  watchedTime: number,
  totalDuration: number
): Promise<{ message: string }> => {
  const response = await apiClient.post(`/content/lessons/${lessonId}/progress`, {
    watchedTime: Math.round(watchedTime),
    totalDuration: Math.round(totalDuration),
  });
  return response.data;
};

/**
 * Tạo chapter mới trong khóa học
 */
export const createChapter = async (courseId: number, data: ChapterRequest): Promise<ChapterResponse> => {
  const response = await apiClient.post<{ chapter: ChapterResponse }>(`/v1/courses/${courseId}/chapters`, data);
  return response.data.chapter;
};

/**
 * Cập nhật chapter
 */
export const updateChapter = async (courseId: number, chapterId: number, data: ChapterRequest): Promise<ChapterResponse> => {
  const response = await apiClient.put<{ chapter: ChapterResponse }>(`/v1/courses/${courseId}/chapters/${chapterId}`, data);
  return response.data.chapter;
};

/**
 * Xóa chapter
 */
export const deleteChapter = async (courseId: number, chapterId: number): Promise<{ message: string }> => {
  const response = await apiClient.delete(`/v1/courses/${courseId}/chapters/${chapterId}`);
  return response.data;
};

/**
 * Tạo lesson mới trong chapter
 */
export const createLesson = async (courseId: number, chapterId: number, data: LessonRequest): Promise<LessonResponse> => {
  const response = await apiClient.post<{ lesson: LessonResponse }>(`/v1/courses/${courseId}/chapters/${chapterId}/lessons`, data);
  return response.data.lesson;
};

/**
 * Cập nhật lesson
 */
export const updateLesson = async (courseId: number, chapterId: number, lessonId: number, data: LessonRequest): Promise<LessonResponse> => {
  const response = await apiClient.put<{ lesson: LessonResponse }>(`/v1/courses/${courseId}/chapters/${chapterId}/lessons/${lessonId}`, data);
  return response.data.lesson;
};

/**
 * Xóa lesson
 */
export const deleteLesson = async (courseId: number, chapterId: number, lessonId: number): Promise<{ message: string }> => {
  const response = await apiClient.delete(`/v1/courses/${courseId}/chapters/${chapterId}/lessons/${lessonId}`);
  return response.data;
};

/**
 * Preview lesson cho giảng viên
 */
export const previewLesson = async (courseId: number, chapterId: number, lessonId: number): Promise<LessonResponse> => {
  const response = await apiClient.get<LessonResponse>(`/v1/courses/${courseId}/chapters/${chapterId}/lessons/${lessonId}/preview`);
  return response.data;
};

/**
 * Upload video file cho lesson
 */
export const uploadLessonVideo = async (
  courseId: number, 
  chapterId: number, 
  lessonId: number, 
  file: File,
  durationInSeconds?: number
): Promise<string> => {
  const formData = new FormData();
  formData.append('file', file);
  if (durationInSeconds !== undefined && durationInSeconds > 0) {
    formData.append('durationInSeconds', durationInSeconds.toString());
  }
  const response = await apiClient.post<{ videoUrl: string }>(
    `/v1/courses/${courseId}/chapters/${chapterId}/lessons/${lessonId}/upload-video`, 
    formData,
    { timeout: 600000 }
  );
  return response.data.videoUrl;
};

/**
 * Trích xuất thời lượng từ file video
 */
export const extractVideoDuration = (file: File): Promise<number> => {
  return new Promise((resolve, reject) => {
    if (!file || file.size === 0) {
      reject(new Error('File is empty or invalid'));
      return;
    }
    if (!file.type.startsWith('video/')) {
      reject(new Error('File is not a video'));
      return;
    }

    const video = document.createElement('video');
    video.preload = 'metadata';
    video.muted = true;
    video.playsInline = true;
    
    let objectUrl: string | null = null;
    let timeoutId: NodeJS.Timeout | null = null;
    
    const cleanup = () => {
      if (objectUrl) {
        window.URL.revokeObjectURL(objectUrl);
        objectUrl = null;
      }
      if (timeoutId) {
        clearTimeout(timeoutId);
        timeoutId = null;
      }
      video.remove();
    };
    
    timeoutId = setTimeout(() => {
      cleanup();
      reject(new Error('Timeout: Video metadata loading took too long'));
    }, 30000);
    
    video.onloadedmetadata = () => {
      if (timeoutId) clearTimeout(timeoutId);
      
      const duration = Math.floor(video.duration);
      if (isNaN(duration) || duration <= 0) {
        cleanup();
        reject(new Error('Invalid video duration'));
        return;
      }
      
      cleanup();
      resolve(duration);
    };
    
    video.onerror = (e) => {
      cleanup();
      const error = (e as any).target?.error;
      const errorMessage = error 
        ? `Failed to load video metadata: ${error.message || 'Unknown error'}`
        : 'Failed to load video metadata';
      reject(new Error(errorMessage));
    };
    
    video.onabort = () => {
      cleanup();
      reject(new Error('Video loading was aborted'));
    };
    
    try {
      objectUrl = URL.createObjectURL(file);
      video.src = objectUrl;
      video.load();
    } catch (error: any) {
      cleanup();
      reject(new Error(`Failed to create object URL: ${error.message || 'Unknown error'}`));
    }
  });
};

/**
 * Round duration in seconds to minutes
 * Rules: >= 30 seconds round up, < 30 seconds round down
 * Example: 378s (6:18) → 6 minutes, 349s (5:49) → 6 minutes
 */
export const roundDurationToMinutes = (durationInSeconds: number): number => {
  if (durationInSeconds <= 0) return 0;
  const minutes = durationInSeconds / 60;
  // Đảm bảo video rất ngắn (<30s) vẫn được tính tối thiểu 1 phút để qua validation
  return Math.max(1, Math.round(minutes));
};

/**
 * Trích xuất thời lượng từ YouTube URL
 */
export const extractYouTubeDuration = async (courseId: number, youtubeUrl: string): Promise<number | null> => {
  try {
    const response = await apiClient.get(`/v1/courses/${courseId}/chapters/extract-youtube-duration`, {
      params: { url: youtubeUrl }
    });
    return response.data.durationInMinutes || null;
  } catch (error: any) {
    console.warn('Failed to extract YouTube duration:', error);
    return null;
  }
};

/**
 * Upload document file cho lesson
 */
export const uploadLessonDocument = async (courseId: number, chapterId: number, lessonId: number, file: File): Promise<string> => {
  const formData = new FormData();
  formData.append('file', file);
  const response = await apiClient.post<{ documentUrl: string }>(
    `/v1/courses/${courseId}/chapters/${chapterId}/lessons/${lessonId}/upload-document`, 
    formData,
    { timeout: 120000 }
  );
  return response.data.documentUrl;
};

/**
 * Upload slide file cho lesson
 */
export const uploadLessonSlide = async (courseId: number, chapterId: number, lessonId: number, file: File): Promise<string> => {
  const formData = new FormData();
  formData.append('file', file);
  const response = await apiClient.post<{ slideUrl: string }>(
    `/v1/courses/${courseId}/chapters/${chapterId}/lessons/${lessonId}/upload-slide`, 
    formData,
    { timeout: 300000 }
  );
  return response.data.slideUrl;
};

/**
 * Sắp xếp lại thứ tự chapters
 */
export const reorderChapters = async (courseId: number, chapterPositions: Record<number, number>): Promise<{ message: string }> => {
  const response = await apiClient.patch(`/v1/courses/${courseId}/chapters/reorder`, chapterPositions);
  return response.data;
};

/**
 * Sắp xếp lại thứ tự lessons trong chapter
 */
export const reorderLessons = async (courseId: number, chapterId: number, lessonPositions: Record<number, number>): Promise<{ message: string }> => {
  const response = await apiClient.patch(`/v1/courses/${courseId}/chapters/${chapterId}/lessons/reorder`, lessonPositions);
  return response.data;
};

/**
 * Export nội dung khóa học ra file Excel
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

/**
 * Tải file export xuống
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
 * Tính tổng thời lượng khóa học từ các chapters
 */
export const calculateCourseDuration = (chapters: ChapterResponse[]): number => {
  return chapters.reduce((total, chapter) => {
    const chapterDuration = chapter.lessons.reduce((sum, lesson) => {
      return sum + ((lesson as any).duration || 0);
    }, 0);
    return total + chapterDuration;
  }, 0);
};

/**
 * Đếm tổng số bài học trong khóa học
 */
export const countTotalLessons = (chapters: ChapterResponse[]): number => {
  return chapters.reduce((total, chapter) => total + chapter.lessons.length, 0);
};

/**
 * Tính phần trăm hoàn thành khóa học
 */
export const calculateCompletionPercentage = (chapters: ChapterResponse[]): number => {
  const totalLessons = countTotalLessons(chapters);
  if (totalLessons === 0) return 0;

  const completedLessons = chapters.reduce((total, chapter) => {
    return total + chapter.lessons.filter((lesson) => lesson.isCompleted).length;
  }, 0);

  return Math.round((completedLessons / totalLessons) * 100);
};

export default {
  getCourseContent,
  markLessonAsCompleted,
  createChapter,
  updateChapter,
  deleteChapter,
  createLesson,
  updateLesson,
  deleteLesson,
  exportCourseContent,
  importCourseContent,
  downloadExportFile,
  calculateCourseDuration,
  countTotalLessons,
  calculateCompletionPercentage,
};

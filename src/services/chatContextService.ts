/**
 * Service để lấy context từ backend Java/Spring Boot
 * Context chứa thông tin học tập của user (courses, progress, etc.)
 */

import api from '../api';

/**
 * Interface cho AiContextResponse từ backend
 */
export interface AiContextResponse {
  userName?: string;
  month?: string;
  summary?: {
    totalCourses?: number;
    completedCourses?: number;
    averageScore?: number;
    totalStudyHours?: number;
    completionRate?: number; // %
  };
  enrolledCourses?: Array<{
    id: number;
    name: string;
    progress: number; // %
    instructor?: string;
    category?: string;
  }>;
  learningProgress?: Array<{
    courseId: number;
    courseName: string;
    completedLessons: number;
    totalLessons: number;
    lastAccessed?: string;
  }>;
  recentActivities?: Array<{
    type: string;
    description: string;
    date: string;
  }>;
  recommendations?: string[];
  lastUpdated?: string;
}

/**
 * Lấy context từ backend
 * @param question - Câu hỏi của user (optional, để backend có thể filter context phù hợp)
 */
export const fetchChatContext = async (
  question?: string
): Promise<AiContextResponse | null> => {
  try {
    const params = question ? { question } : {};
    const response = await api.get<AiContextResponse>('/chat/context', {
      params,
    });
    return response.data;
  } catch (error) {
    console.error('Error fetching chat context:', error);
    // Trả về null nếu lỗi (không throw để có thể fallback)
    return null;
  }
};


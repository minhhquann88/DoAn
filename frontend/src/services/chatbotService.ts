/**
 * Chatbot Service - UC-CHAT-01
 * Connect to Spring Boot Backend with Google Gemini API
 */
import apiClient from '@/lib/api';

export interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

export interface ChatRequest {
  message: string;
  courseId?: number; // Optional: để lấy context cụ thể từ khóa học
}

export interface ChatResponse {
  response: string;
  message?: string; // Alias for backward compatibility
  courseId?: number;
}

/**
 * UC-CHAT-01: Send message to chatbot
 * Gửi câu hỏi -> Hệ thống gọi Google Gemini API (RAG) -> Trả câu trả lời context khóa học
 */
export const sendChatMessage = async (
  message: string, 
  courseId?: number
): Promise<ChatResponse> => {
  try {
    const response = await apiClient.post<ChatResponse>('/v1/chat/message', {
      message,
      courseId,
    });
    return response.data;
  } catch (error: any) {
    console.error('Chatbot error:', error);
    return {
      response: 'Xin lỗi, tôi đang gặp sự cố kết nối. Vui lòng thử lại sau.',
      message: 'Xin lỗi, tôi đang gặp sự cố kết nối. Vui lòng thử lại sau.',
    };
  }
};

/**
 * Get chat context (for maintaining conversation)
 */
export const getChatContext = async (userId?: number) => {
  try {
    const params = userId ? { userId: userId.toString() } : {};
    const response = await apiClient.get('/v1/chat/context', { params });
    return response.data;
  } catch (error) {
    console.error('Get chat context error:', error);
    return null;
  }
};

/**
 * Health check
 */
export const checkChatbotHealth = async (): Promise<boolean> => {
  try {
    const response = await apiClient.get('/v1/chat/health');
    return response.status === 200;
  } catch (error) {
    return false;
  }
};

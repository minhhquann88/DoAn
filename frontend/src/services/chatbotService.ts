/**
 * Chatbot Service - Connect to Python FastAPI Backend
 */
import axios from 'axios';

const CHATBOT_BASE_URL = process.env.NEXT_PUBLIC_CHATBOT_API_URL || 'http://localhost:8000/api';

const chatbotClient = axios.create({
  baseURL: CHATBOT_BASE_URL,
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
  },
});

export interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

export interface ChatRequest {
  message: string;
  context?: any;
  userId?: string;
}

export interface ChatResponse {
  response: string;
  context?: any;
  suggestions?: string[];
}

/**
 * Send message to chatbot
 */
export const sendChatMessage = async (message: string, context?: any): Promise<ChatResponse> => {
  try {
    const response = await chatbotClient.post<ChatResponse>('/v1/chat/message', {
      message,
      context,
    });
    return response.data;
  } catch (error: any) {
    // Fallback response nếu service down
    console.error('Chatbot error:', error);
    return {
      response: 'Xin lỗi, tôi đang gặp sự cố kết nối. Vui lòng thử lại sau.',
      suggestions: [],
    };
  }
};

/**
 * Get chat context (for maintaining conversation)
 */
export const getChatContext = async (userId: string) => {
  try {
    const response = await chatbotClient.get(`/v1/chat/context?userId=${userId}`);
    return response.data;
  } catch (error) {
    return null;
  }
};

/**
 * Clear chat history
 */
export const clearChatHistory = async (sessionId: string) => {
  try {
    await chatbotClient.delete(`/v1/chat/history/${sessionId}`);
  } catch (error) {
    console.error('Clear chat history error:', error);
  }
};

/**
 * Health check
 */
export const checkChatbotHealth = async (): Promise<boolean> => {
  try {
    const response = await chatbotClient.get('/health');
    return response.status === 200;
  } catch (error) {
    return false;
  }
};

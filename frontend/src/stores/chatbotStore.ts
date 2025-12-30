/**
 * Chatbot Store - Quản lý trạng thái chatbot (AI Assistant)
 * Tách biệt với chatStore (real-time chat giữa users)
 */
import { create } from 'zustand';

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date | string;
}

interface ChatbotState {
  messagesByUser: Record<string, ChatMessage[]>; // userKey -> messages
  isLoading: boolean;
  
  // Actions
  addMessage: (userKey: string, message: ChatMessage) => void;
  setMessages: (userKey: string, messages: ChatMessage[]) => void;
  clearMessages: (userKey: string) => void;
  setLoading: (loading: boolean) => void;
}

export const useChatbotStore = create<ChatbotState>((set, get) => ({
  messagesByUser: {},
  isLoading: false,
  
  addMessage: (userKey, message) => set((state) => {
    const currentMessages = state.messagesByUser[userKey] || [];
    // Check if message already exists
    if (currentMessages.some(m => m.id === message.id)) {
      return state;
    }
    return {
      messagesByUser: {
        ...state.messagesByUser,
        [userKey]: [...currentMessages, message]
      }
    };
  }),
  
  setMessages: (userKey, messages) => set((state) => ({
    messagesByUser: {
      ...state.messagesByUser,
      [userKey]: messages
    }
  })),
  
  clearMessages: (userKey) => set((state) => {
    const newMessagesByUser = { ...state.messagesByUser };
    delete newMessagesByUser[userKey];
    return { messagesByUser: newMessagesByUser };
  }),
  
  setLoading: (loading) => set({ isLoading: loading }),
}));


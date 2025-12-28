/**
 * Chat Store - Quản lý lịch sử chat theo từng user/session
 * Mỗi user (hoặc guest) có lịch sử chat riêng
 */
import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date | string; // String khi lưu, Date khi sử dụng
}

interface ChatState {
  // Lưu messages theo user ID hoặc 'guest'
  messagesByUser: Record<string, ChatMessage[]>;
  
  // Actions
  getMessages: (userId: string | null) => ChatMessage[];
  addMessage: (userId: string | null, message: ChatMessage) => void;
  setMessages: (userId: string | null, messages: ChatMessage[]) => void;
  clearMessages: (userId: string | null) => void;
  clearAllMessages: () => void;
}

// Helper: Lấy key cho user (null = guest)
const getUserKey = (userId: string | null): string => {
  return userId ? `user_${userId}` : 'guest';
};

export const useChatStore = create<ChatState>()(
  persist(
    (set, get) => ({
      messagesByUser: {},
      
      getMessages: (userId) => {
        const key = getUserKey(userId);
        const messages = get().messagesByUser[key] || [];
        // Convert timestamp strings back to Date objects
        return messages.map(msg => ({
          ...msg,
          timestamp: typeof msg.timestamp === 'string' ? new Date(msg.timestamp) : msg.timestamp,
        }));
      },
      
      addMessage: (userId, message) => {
        const key = getUserKey(userId);
        // Convert Date to string for storage
        const messageToStore = {
          ...message,
          timestamp: message.timestamp instanceof Date ? message.timestamp.toISOString() : message.timestamp,
        };
        set((state) => ({
          messagesByUser: {
            ...state.messagesByUser,
            [key]: [...(state.messagesByUser[key] || []), messageToStore],
          },
        }));
      },
      
      setMessages: (userId, messages) => {
        const key = getUserKey(userId);
        // Convert Date to string for storage
        const messagesToStore = messages.map(msg => ({
          ...msg,
          timestamp: msg.timestamp instanceof Date ? msg.timestamp.toISOString() : msg.timestamp,
        }));
        set((state) => ({
          messagesByUser: {
            ...state.messagesByUser,
            [key]: messagesToStore,
          },
        }));
      },
      
      clearMessages: (userId) => {
        const key = getUserKey(userId);
        set((state) => {
          const newMessages = { ...state.messagesByUser };
          delete newMessages[key];
          return { messagesByUser: newMessages };
        });
      },
      
      clearAllMessages: () => {
        set({ messagesByUser: {} });
      },
    }),
    {
      name: 'chat-storage',
      // Chỉ persist messages, không persist state khác
    }
  )
);


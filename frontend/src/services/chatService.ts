/**
 * Chat Service
 * API functions for chat functionality
 */
import apiClient from '@/lib/api';

export interface Conversation {
  id: number;
  type: 'DIRECT' | 'GROUP';
  createdAt: string;
  updatedAt: string;
  lastMessageAt: string | null;
  otherParticipant: {
    id: number;
    fullName: string;
    avatar: string | null;
    role: string;
  } | null;
  lastMessage: Message | null;
  unreadCount: number;
}

export interface Message {
  id: number;
  conversationId: number;
  senderId: number;
  senderName: string;
  senderAvatar: string | null;
  content: string;
  messageType: 'TEXT' | 'IMAGE' | 'FILE' | 'SYSTEM';
  fileUrl: string | null;
  fileName: string | null;
  fileSize: number | null;
  isEdited: boolean;
  editedAt: string | null;
  isDeleted: boolean;
  createdAt: string;
  isRead: boolean;
  readAt: string | null;
}

export interface CreateConversationRequest {
  userId: number;
  courseId?: number; // Optional: để validate enrollment
}

export interface InstructorInfo {
  id: number;
  fullName: string;
  username: string;
  email: string;
  avatarUrl: string | null;
  courseId: number;
  courseTitle: string;
}

export interface SendMessageRequest {
  conversationId: number;
  content: string;
  messageType?: 'TEXT' | 'IMAGE' | 'FILE' | 'SYSTEM';
  fileUrl?: string;
  fileName?: string;
  fileSize?: number;
}

export interface UpdateMessageRequest {
  content: string;
}

/**
 * Create a new conversation
 */
export const createConversation = async (request: CreateConversationRequest): Promise<Conversation> => {
  const response = await apiClient.post<Conversation>('/v1/chat/conversations', request);
  return response.data;
};

/**
 * Get all conversations for current user
 */
export const getConversations = async (): Promise<Conversation[]> => {
  const response = await apiClient.get<Conversation[]>('/v1/chat/conversations');
  return response.data;
};

/**
 * Get conversation by ID
 */
export const getConversation = async (id: number): Promise<Conversation> => {
  const response = await apiClient.get<Conversation>(`/v1/chat/conversations/${id}`);
  return response.data;
};

/**
 * Get messages for a conversation
 */
export const getMessages = async (
  conversationId: number,
  page: number = 0,
  size: number = 50
): Promise<{ content: Message[]; totalPages: number; totalElements: number }> => {
  const response = await apiClient.get(`/v1/chat/conversations/${conversationId}/messages`, {
    params: { page, size },
  });
  return response.data;
};

/**
 * Send a message (REST fallback)
 */
export const sendMessage = async (request: SendMessageRequest): Promise<Message> => {
  const response = await apiClient.post<Message>('/v1/chat/messages', request);
  return response.data;
};

/**
 * Update a message
 */
export const updateMessage = async (messageId: number, request: UpdateMessageRequest): Promise<Message> => {
  const response = await apiClient.put<Message>(`/v1/chat/messages/${messageId}`, request);
  return response.data;
};

/**
 * Delete a message
 */
export const deleteMessage = async (messageId: number): Promise<void> => {
  await apiClient.delete(`/v1/chat/messages/${messageId}`);
};

/**
 * Mark conversation as read
 */
export const markAsRead = async (conversationId: number): Promise<void> => {
  await apiClient.post(`/v1/chat/conversations/${conversationId}/read`);
};

/**
 * Get unread count for a conversation
 */
export const getUnreadCount = async (conversationId: number): Promise<number> => {
  const response = await apiClient.get<number>(`/v1/chat/conversations/${conversationId}/unread-count`);
  return response.data;
};

/**
 * Get list of instructors from enrolled courses (for students)
 */
export const getEnrolledInstructors = async (): Promise<InstructorInfo[]> => {
  const response = await apiClient.get<InstructorInfo[]>('/v1/chat/instructors');
  return response.data;
};


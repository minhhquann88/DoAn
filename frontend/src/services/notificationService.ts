import apiClient from '@/lib/api';

export interface Notification {
  id: number;
  message: string;
  type: string;
  isRead: boolean;
  createdAt: string;
  courseId?: number;
  courseTitle?: string;
  actionUrl?: string;
}

export interface NotificationPage {
  content: Notification[];
  totalElements: number;
  totalPages: number;
  number: number;
  size: number;
}

/**
 * Lấy danh sách thông báo
 */
export const getNotifications = async (page: number = 0, size: number = 20): Promise<NotificationPage> => {
  const response = await apiClient.get<NotificationPage>(`/notifications?page=${page}&size=${size}`);
  return response.data;
};

/**
 * Đếm số thông báo chưa đọc
 */
export const getUnreadCount = async (): Promise<number> => {
  const response = await apiClient.get<{ count: number }>('/notifications/unread-count');
  return response.data.count;
};

/**
 * Đánh dấu thông báo là đã đọc
 */
export const markAsRead = async (notificationId: number): Promise<void> => {
  await apiClient.patch(`/notifications/${notificationId}/read`);
};

/**
 * Đánh dấu tất cả thông báo là đã đọc
 */
export const markAllAsRead = async (): Promise<void> => {
  await apiClient.patch('/notifications/read-all');
};


import apiClient from '@/lib/api';

/**
 * Đăng ký nhận tin tức (cho guest - không cần đăng nhập)
 */
export const subscribeNewsletter = async (email: string): Promise<void> => {
  await apiClient.post('/newsletter/subscribe', { email });
};

/**
 * Bật/tắt thông báo email (cho user đã đăng nhập)
 */
export const toggleEmailNotification = async (enabled: boolean): Promise<{ enabled: boolean }> => {
  const response = await apiClient.post<{ enabled: boolean; message: string }>('/newsletter/toggle', { enabled });
  return { enabled: response.data.enabled };
};

/**
 * Lấy trạng thái đăng ký nhận tin tức (cho user đã đăng nhập)
 */
export const getSubscriptionStatus = async (): Promise<{ enabled: boolean; email: string }> => {
  const response = await apiClient.get<{ enabled: boolean; email: string }>('/newsletter/status');
  return response.data;
};


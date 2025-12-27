/**
 * User Service - Handle user profile operations
 */
import apiClient from '@/lib/api';

export interface UpdateProfileRequest {
  fullName?: string;
  phone?: string;
  bio?: string;
  location?: string;
  expertise?: string;
  linkedin?: string;
  github?: string;
  twitter?: string;
  website?: string;
  // Note: email is NOT included to avoid security issues
  // Note: avatarUrl is set after avatar upload
}

export interface UpdateProfileResponse {
  id: number;
  username: string;
  email: string;
  fullName: string;
  phone?: string;
  bio?: string;
  avatarUrl?: string;
  createdAt: string;
}

/**
 * Get user profile - Fetch fresh data from database
 * @returns User profile data
 */
export const getProfile = async (): Promise<ProfileResponse> => {
  const response = await apiClient.get<ProfileResponse>('/user/profile');
  return response.data;
};

/**
 * Upload avatar file
 * @param file - The image file to upload
 * @returns Response with avatarUrl
 */
export const uploadAvatar = async (file: File): Promise<{ avatarUrl: string; user: any }> => {
  const formData = new FormData();
  formData.append('file', file);
  
  const response = await apiClient.post('/user/avatar', formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });
  
  return response.data;
};

/**
 * Update user profile
 * @param data - Profile data to update (excluding email)
 * @returns Updated user data
 */
export const updateProfile = async (data: UpdateProfileRequest): Promise<UpdateProfileResponse> => {
  const response = await apiClient.put<UpdateProfileResponse>('/user/profile', data);
  return response.data;
};

export interface ChangePasswordRequest {
  oldPassword: string;
  newPassword: string;
}

export interface ChangePasswordResponse {
  message: string;
}

/**
 * Change user password
 * @param data - Old and new password
 * @returns Success message
 */
export const changePassword = async (data: ChangePasswordRequest): Promise<ChangePasswordResponse> => {
  const response = await apiClient.put<ChangePasswordResponse>('/user/change-password', data);
  return response.data;
};


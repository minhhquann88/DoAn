/**
 * Authentication Service - Connect to Spring Boot Backend
 */
import apiClient, { setAuthToken, removeAuthToken } from '@/lib/api';

export interface LoginRequest {
  username: string; // Backend expects username (email)
  password: string;
}

export interface RegisterRequest {
  fullName: string;
  email: string;
  password: string;
  role: 'ROLE_STUDENT' | 'ROLE_LECTURER';
}

export interface ForgotPasswordRequest {
  email: string;
}

export interface ResetPasswordRequest {
  token: string;
  newPassword: string;
}

export interface JwtResponse {
  token: string;
  type: string;
  id: number;
  username: string;
  email: string;
  roles: string[];
}

export interface MessageResponse {
  message: string;
}

/**
 * Login user
 */
export const login = async (email: string, password: string): Promise<JwtResponse> => {
  const response = await apiClient.post<JwtResponse>('/auth/login', {
    username: email, // Backend expects 'username' field
    password,
  });
  
  // Save token
  if (response.data.token) {
    setAuthToken(response.data.token);
  }
  
  return response.data;
};

/**
 * Register user
 */
export const register = async (data: RegisterRequest): Promise<MessageResponse> => {
  const response = await apiClient.post<MessageResponse>('/auth/register', data);
  return response.data;
};

/**
 * Forgot password
 */
export const forgotPassword = async (email: string): Promise<MessageResponse> => {
  const response = await apiClient.post<MessageResponse>('/auth/forgot-password', {
    email,
  });
  return response.data;
};

/**
 * Reset password
 */
export const resetPassword = async (
  token: string,
  newPassword: string
): Promise<MessageResponse> => {
  const response = await apiClient.post<MessageResponse>('/auth/reset-password', {
    token,
    newPassword,
  });
  return response.data;
};

/**
 * Logout user
 */
export const logout = () => {
  removeAuthToken();
};

/**
 * Get current user info from localStorage
 * Note: Backend doesn't have GET /auth/user endpoint
 * User data is returned during login and stored locally
 */
export const getCurrentUser = () => {
  if (typeof window !== 'undefined') {
    const userData = localStorage.getItem('user_data');
    return userData ? JSON.parse(userData) : null;
  }
  return null;
};

/**
 * Update user profile
 * Note: Backend endpoint is PUT /api/user/profile (not /auth/profile)
 */
export const updateProfile = async (data: any) => {
  const response = await apiClient.put('/user/profile', data);
  return response.data;
};

/**
 * Change password
 * TODO: Backend needs to implement POST /api/auth/change-password
 * For now, this function throws an error
 */
export const changePassword = async (
  currentPassword: string,
  newPassword: string
): Promise<MessageResponse> => {
  // Backend endpoint not available yet
  throw new Error('Change password feature is not available yet. Please use forgot password instead.');
};

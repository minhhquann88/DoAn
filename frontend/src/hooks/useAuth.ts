/**
 * Custom hook cho Authentication
 */
import { useMutation, useQuery } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';
import apiClient, { setAuthToken, removeAuthToken, handleApiError } from '@/lib/api';
import { useAuthStore } from '@/stores/authStore';
import { useUIStore } from '@/stores/uiStore';
import { LoginRequest, RegisterRequest, AuthResponse, User } from '@/types';
import { ROUTES } from '@/lib/constants';

export const useAuth = () => {
  const router = useRouter();
  const { user, setUser, login: storeLogin, logout: storeLogout, isAuthenticated } = useAuthStore();
  const { addToast } = useUIStore();
  
  // Login mutation
  const loginMutation = useMutation({
    mutationFn: async (credentials: LoginRequest): Promise<AuthResponse> => {
      const response = await apiClient.post('/auth/login', credentials);
      return response.data;
    },
    onSuccess: (data) => {
      const userData: User = {
        id: data.id,
        username: data.username,
        email: data.email,
        fullName: data.username, // Backend sẽ trả về fullName
        role: data.roles[0] as any,
        createdAt: new Date().toISOString(),
      };
      
      storeLogin(userData, data.token);
      
      addToast({
        type: 'success',
        description: 'Đăng nhập thành công!',
      });
      
      // Redirect based on role
      if (data.roles.includes('ROLE_ADMIN')) {
        router.push(ROUTES.ADMIN_DASHBOARD);
      } else if (data.roles.includes('ROLE_LECTURER')) {
        router.push(ROUTES.INSTRUCTOR_DASHBOARD);
      } else {
        router.push(ROUTES.STUDENT_DASHBOARD);
      }
    },
    onError: (error: any) => {
      addToast({
        type: 'error',
        description: handleApiError(error),
      });
    },
  });
  
  // Register mutation
  const registerMutation = useMutation({
    mutationFn: async (data: RegisterRequest) => {
      const response = await apiClient.post('/auth/register', data);
      return response.data;
    },
    onSuccess: () => {
      addToast({
        type: 'success',
        description: 'Đăng ký thành công! Vui lòng đăng nhập.',
      });
      router.push(ROUTES.LOGIN);
    },
    onError: (error: any) => {
      addToast({
        type: 'error',
        description: handleApiError(error),
      });
    },
  });
  
  // Forgot password mutation
  const forgotPasswordMutation = useMutation({
    mutationFn: async (email: string) => {
      const response = await apiClient.post('/auth/forgot-password', { email });
      return response.data;
    },
    onSuccess: () => {
      addToast({
        type: 'success',
        description: 'Link đặt lại mật khẩu đã được gửi đến email của bạn!',
      });
    },
    onError: (error: any) => {
      addToast({
        type: 'error',
        description: handleApiError(error),
      });
    },
  });
  
  // Reset password mutation
  const resetPasswordMutation = useMutation({
    mutationFn: async ({ token, password }: { token: string; password: string }) => {
      const response = await apiClient.post('/auth/reset-password', { token, newPassword: password });
      return response.data;
    },
    onSuccess: () => {
      addToast({
        type: 'success',
        description: 'Đặt lại mật khẩu thành công! Vui lòng đăng nhập.',
      });
      router.push(ROUTES.LOGIN);
    },
    onError: (error: any) => {
      addToast({
        type: 'error',
        description: handleApiError(error),
      });
    },
  });
  
  // Logout
  const logout = () => {
    storeLogout();
    removeAuthToken();
    addToast({
      type: 'success',
      description: 'Đăng xuất thành công!',
    });
    router.push(ROUTES.LOGIN);
  };
  
  // Update profile mutation
  const updateProfileMutation = useMutation({
    mutationFn: async (data: Partial<User>) => {
      const response = await apiClient.put(`/users/${user?.id}`, data);
      return response.data;
    },
    onSuccess: (data) => {
      setUser(data);
      addToast({
        type: 'success',
        description: 'Cập nhật thông tin thành công!',
      });
    },
    onError: (error: any) => {
      addToast({
        type: 'error',
        description: handleApiError(error),
      });
    },
  });
  
  return {
    user,
    isAuthenticated,
    login: loginMutation.mutate,
    register: registerMutation.mutate,
    forgotPassword: forgotPasswordMutation.mutate,
    resetPassword: resetPasswordMutation.mutate,
    logout,
    updateProfile: updateProfileMutation.mutate,
    isLoginLoading: loginMutation.isPending,
    isRegisterLoading: registerMutation.isPending,
    isForgotPasswordLoading: forgotPasswordMutation.isPending,
    isResetPasswordLoading: resetPasswordMutation.isPending,
    isUpdateProfileLoading: updateProfileMutation.isPending,
  };
};


/**
 * Auth Store - Quản lý trạng thái authentication
 */
import { create } from 'zustand';
import { User } from '@/types';
import { STORAGE_KEYS } from '@/lib/constants';

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  
  // Actions
  setUser: (user: User | null) => void;
  setLoading: (loading: boolean) => void;
  login: (user: User, token: string) => void;
  logout: () => void;
  updateUser: (userData: Partial<User>) => void;
  
  // Helpers
  isAdmin: () => boolean;
  isInstructor: () => boolean;
  isStudent: () => boolean;
}

export const useAuthStore = create<AuthState>((set, get) => ({
  user: null,
  isAuthenticated: false,
  isLoading: false,
  
  setUser: (user) => set({ user, isAuthenticated: !!user }),
  
  setLoading: (loading) => set({ isLoading: loading }),
  
  login: (user, token) => {
    if (typeof window !== 'undefined') {
      // Save to localStorage for API calls
      localStorage.setItem(STORAGE_KEYS.AUTH_TOKEN, token);
      localStorage.setItem(STORAGE_KEYS.USER_DATA, JSON.stringify(user));
      
      // Save to cookie for middleware
      const expires = new Date();
      expires.setTime(expires.getTime() + 7 * 24 * 60 * 60 * 1000); // 7 days
      document.cookie = `token=${token};expires=${expires.toUTCString()};path=/;SameSite=Lax`;
    }
    set({ user, isAuthenticated: true });
  },
  
  logout: () => {
    if (typeof window !== 'undefined') {
      localStorage.removeItem(STORAGE_KEYS.AUTH_TOKEN);
      localStorage.removeItem(STORAGE_KEYS.USER_DATA);
      // Remove cookie
      document.cookie = 'token=;expires=Thu, 01 Jan 1970 00:00:00 UTC;path=/;';
      
      // Clear chat messages của user đang logout
      // Import dynamically để tránh circular dependency
      import('@/stores/chatStore').then(({ useChatStore }) => {
        const currentUserId = get().user?.id?.toString() || null;
        if (currentUserId) {
          useChatStore.getState().clearMessages(currentUserId);
        }
      });
    }
    set({ user: null, isAuthenticated: false });
  },
  
  updateUser: (userData) => {
    const currentUser = get().user;
    if (currentUser) {
      const updatedUser = { ...currentUser, ...userData };
      if (typeof window !== 'undefined') {
        localStorage.setItem(STORAGE_KEYS.USER_DATA, JSON.stringify(updatedUser));
      }
      set({ user: updatedUser });
    }
  },
  
  // Helper methods
  isAdmin: () => {
    const user = get().user;
    return user?.role === 'ROLE_ADMIN';
  },
  
  isInstructor: () => {
    const user = get().user;
    return user?.role === 'ROLE_LECTURER' || user?.role === 'ROLE_ADMIN';
  },
  
  isStudent: () => {
    const user = get().user;
    return user?.role === 'ROLE_STUDENT';
  },
}));

// Initialize auth state from localStorage on client side
if (typeof window !== 'undefined') {
  const storedUser = localStorage.getItem(STORAGE_KEYS.USER_DATA);
  const token = localStorage.getItem(STORAGE_KEYS.AUTH_TOKEN);
  
  if (storedUser && token) {
    try {
      const user = JSON.parse(storedUser);
      useAuthStore.setState({ user, isAuthenticated: true });
    } catch (error) {
      console.error('Failed to parse stored user data:', error);
      localStorage.removeItem(STORAGE_KEYS.USER_DATA);
      localStorage.removeItem(STORAGE_KEYS.AUTH_TOKEN);
    }
  }
}


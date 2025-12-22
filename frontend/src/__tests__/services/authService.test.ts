/**
 * Tests cho Auth Service
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import * as authService from '@/services/authService';

// Mock axios
vi.mock('@/lib/api', () => ({
  default: {
    post: vi.fn(),
    get: vi.fn(),
    put: vi.fn(),
  },
  setAuthToken: vi.fn(),
  removeAuthToken: vi.fn(),
}));

import apiClient, { setAuthToken, removeAuthToken } from '@/lib/api';

describe('Auth Service', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  // ==========================================
  // LOGIN TESTS
  // ==========================================

  describe('login', () => {
    it('✅ should login successfully and save token', async () => {
      const mockResponse = {
        data: {
          token: 'test-jwt-token',
          type: 'Bearer',
          id: 1,
          username: 'test@example.com',
          email: 'test@example.com',
          roles: ['ROLE_STUDENT'],
        },
      };

      (apiClient.post as any).mockResolvedValue(mockResponse);

      const result = await authService.login('test@example.com', 'password123');

      expect(apiClient.post).toHaveBeenCalledWith('/auth/login', {
        username: 'test@example.com',
        password: 'password123',
      });
      expect(setAuthToken).toHaveBeenCalledWith('test-jwt-token');
      expect(result.token).toBe('test-jwt-token');
      expect(result.email).toBe('test@example.com');
    });

    it('❌ should throw error on invalid credentials', async () => {
      (apiClient.post as any).mockRejectedValue(new Error('Invalid credentials'));

      await expect(authService.login('test@example.com', 'wrongpassword'))
        .rejects.toThrow('Invalid credentials');
    });
  });

  // ==========================================
  // REGISTER TESTS
  // ==========================================

  describe('register', () => {
    it('✅ should register successfully', async () => {
      const mockResponse = {
        data: { message: 'User registered successfully!' },
      };

      (apiClient.post as any).mockResolvedValue(mockResponse);

      const result = await authService.register({
        fullName: 'Test User',
        email: 'newuser@example.com',
        password: 'password123',
        role: 'ROLE_STUDENT',
      });

      expect(apiClient.post).toHaveBeenCalledWith('/auth/register', {
        fullName: 'Test User',
        email: 'newuser@example.com',
        password: 'password123',
        role: 'ROLE_STUDENT',
      });
      expect(result.message).toContain('successfully');
    });

    it('❌ should throw error on duplicate email', async () => {
      (apiClient.post as any).mockRejectedValue(new Error('Email already exists'));

      await expect(authService.register({
        fullName: 'Test User',
        email: 'existing@example.com',
        password: 'password123',
        role: 'ROLE_STUDENT',
      })).rejects.toThrow('Email already exists');
    });
  });

  // ==========================================
  // LOGOUT TESTS
  // ==========================================

  describe('logout', () => {
    it('✅ should logout and remove token', () => {
      authService.logout();

      expect(removeAuthToken).toHaveBeenCalled();
    });
  });

  // ==========================================
  // FORGOT PASSWORD TESTS
  // ==========================================

  describe('forgotPassword', () => {
    it('✅ should send forgot password request', async () => {
      const mockResponse = {
        data: { message: 'Password reset link sent to your email!' },
      };

      (apiClient.post as any).mockResolvedValue(mockResponse);

      const result = await authService.forgotPassword('test@example.com');

      expect(apiClient.post).toHaveBeenCalledWith('/auth/forgot-password', {
        email: 'test@example.com',
      });
      expect(result.message).toContain('sent');
    });
  });

  // ==========================================
  // RESET PASSWORD TESTS
  // ==========================================

  describe('resetPassword', () => {
    it('✅ should reset password successfully', async () => {
      const mockResponse = {
        data: { message: 'Password reset successfully!' },
      };

      (apiClient.post as any).mockResolvedValue(mockResponse);

      const result = await authService.resetPassword('reset-token', 'newpassword123');

      expect(apiClient.post).toHaveBeenCalledWith('/auth/reset-password', {
        token: 'reset-token',
        newPassword: 'newpassword123',
      });
      expect(result.message).toContain('successfully');
    });
  });

  // ==========================================
  // GET CURRENT USER TESTS
  // ==========================================

  describe('getCurrentUser', () => {
    it('✅ should return user from localStorage', () => {
      const mockUser = {
        id: 1,
        email: 'test@example.com',
        fullName: 'Test User',
      };

      vi.spyOn(window.localStorage, 'getItem').mockReturnValue(JSON.stringify(mockUser));

      const result = authService.getCurrentUser();

      expect(result).toEqual(mockUser);
    });

    it('✅ should return null if no user in localStorage', () => {
      vi.spyOn(window.localStorage, 'getItem').mockReturnValue(null);

      const result = authService.getCurrentUser();

      expect(result).toBeNull();
    });
  });

  // ==========================================
  // UPDATE PROFILE TESTS
  // ==========================================

  describe('updateProfile', () => {
    it('✅ should update profile successfully', async () => {
      const mockResponse = {
        data: {
          id: 1,
          fullName: 'Updated Name',
          email: 'test@example.com',
        },
      };

      (apiClient.put as any).mockResolvedValue(mockResponse);

      const result = await authService.updateProfile({ fullName: 'Updated Name' });

      expect(apiClient.put).toHaveBeenCalledWith('/user/profile', { fullName: 'Updated Name' });
      expect(result.fullName).toBe('Updated Name');
    });
  });
});


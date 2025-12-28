import apiClient from '@/lib/api';

// Admin Dashboard Stats
export interface AdminSummaryStats {
  totalUsers: number;
  totalCourses: number;
  totalRevenue: number;
  monthlyTransactions: number;
}

export interface RevenueChartData {
  month: number;
  year: number;
  monthName: string;
  revenue: number;
}

export interface TopSellingCourse {
  courseId: number;
  courseTitle: string;
  totalSales: number;
  price?: number;
  imageUrl?: string;
  instructorName?: string;
}

// Admin User Management
export interface AdminUser {
  id: number;
  username: string;
  email: string;
  fullName: string;
  avatarUrl?: string;
  isEnabled: boolean;
  roles: Array<{ id: number; name: string }>;
  createdAt: string;
}

// Admin Category Management
export interface AdminCategory {
  id: number;
  name: string;
  description?: string;
}

// Admin Course Management
export interface AdminCourse {
  id: number;
  title: string;
  description?: string;
  price: number;
  imageUrl?: string;
  status: string;
  instructorId?: number;
  instructorName?: string;
  instructor?: {
    id: number;
    fullName: string;
    avatarUrl?: string;
  };
  categoryId?: number;
  categoryName?: string;
  category?: {
    id: number;
    name: string;
  };
  createdAt: string;
  updatedAt?: string;
}

// Admin Transaction Management
export interface AdminTransaction {
  id: number;
  userId: number;
  userFullName: string;
  courseId: number;
  courseTitle: string;
  amount: number;
  paymentGateway: string;
  transactionStatus: string;
  transactionCode: string;
  createdAt: string;
}

// API Functions
export const adminService = {
  // Dashboard Stats
  async getSummaryStats(): Promise<AdminSummaryStats> {
    const response = await apiClient.get('/v1/admin/stats/summary');
    return response.data;
  },

  async getRevenueChart(): Promise<RevenueChartData[]> {
    const response = await apiClient.get('/v1/admin/stats/revenue-chart');
    return response.data;
  },

  async getTopSellingCourses(): Promise<TopSellingCourse[]> {
    const response = await apiClient.get('/v1/admin/stats/top-courses');
    return response.data;
  },

  // User Management
  async getUsers(params?: {
    page?: number;
    size?: number;
    sortBy?: string;
    sortDir?: string;
    search?: string;
  }): Promise<{ content: AdminUser[]; totalElements: number; totalPages: number; number: number }> {
    const response = await apiClient.get('/v1/admin/users', { params });
    return response.data;
  },

  async getUserById(id: number): Promise<AdminUser> {
    const response = await apiClient.get(`/v1/admin/users/${id}`);
    return response.data;
  },

  async updateUserStatus(id: number, isEnabled: boolean, lockReason?: string): Promise<AdminUser> {
    const response = await apiClient.put(`/v1/admin/users/${id}/status`, { 
      isEnabled,
      lockReason: lockReason || undefined
    });
    return response.data;
  },

  // Category Management
  async getCategories(): Promise<AdminCategory[]> {
    const response = await apiClient.get('/v1/admin/categories');
    return response.data;
  },

  async getCategoryById(id: number): Promise<AdminCategory> {
    const response = await apiClient.get(`/v1/admin/categories/${id}`);
    return response.data;
  },

  async createCategory(data: { name: string; description?: string }): Promise<AdminCategory> {
    const response = await apiClient.post('/v1/admin/categories', data);
    return response.data;
  },

  async updateCategory(id: number, data: { name: string; description?: string }): Promise<AdminCategory> {
    const response = await apiClient.put(`/v1/admin/categories/${id}`, data);
    return response.data;
  },

  async deleteCategory(id: number): Promise<void> {
    await apiClient.delete(`/v1/admin/categories/${id}`);
  },

  // Course Management
  async getCourses(params?: {
    page?: number;
    size?: number;
    sortBy?: string;
    sortDir?: string;
    search?: string;
    status?: string;
  }): Promise<{ content: AdminCourse[]; totalElements: number; totalPages: number; number: number }> {
    const response = await apiClient.get('/v1/admin/courses', { params });
    return response.data;
  },

  async getCourseById(id: number): Promise<AdminCourse> {
    const response = await apiClient.get(`/v1/admin/courses/${id}`);
    return response.data;
  },

  async getInstructors(): Promise<AdminUser[]> {
    const response = await apiClient.get('/v1/admin/courses/instructors');
    return response.data;
  },

  async transferCourseOwnership(courseId: number, instructorId: number): Promise<AdminCourse> {
    const response = await apiClient.put(`/v1/admin/courses/${courseId}/transfer`, { instructorId });
    return response.data;
  },

  // Admin chỉ có quyền xem khóa học, không có quyền xóa

  // Transaction Management
  async getTransactions(params?: {
    page?: number;
    size?: number;
    sortBy?: string;
    sortDir?: string;
  }): Promise<{ content: AdminTransaction[]; totalElements: number; totalPages: number; number: number }> {
    const response = await apiClient.get('/v1/admin/transactions', { params });
    return response.data;
  },
};


import apiClient from '@/lib/api';

export interface StudentDashboardStats {
  activeCourses: number;
  totalStudyHours: number;
  weeklyStudyHours: number;
  averageProgress: number;
  totalCertificates: number;
}

export const studentService = {
  /**
   * Lấy thống kê dashboard cho student
   */
  async getDashboardStats(): Promise<StudentDashboardStats> {
    const response = await apiClient.get<StudentDashboardStats>('/student/dashboard/stats');
    return response.data;
  },
};


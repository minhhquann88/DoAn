// Module 8: Statistics & Reports Service
// API Base: /api/v1/statistics
import apiClient from '@/lib/api';

// API prefix for statistics
const API_PREFIX = '/v1/statistics';

// =====================
// TYPES
// =====================

export interface DashboardOverview {
  totalCourses: number;
  totalStudents: number;
  totalInstructors: number;
  totalRevenue: number;
  monthlyRevenue: number;
  yearlyRevenue: number;
  pendingTransactions: number;
  completedTransactions: number;
  failedTransactions: number;
  averageCompletionRate: number;
  totalCertificates: number;
  newStudentsThisMonth: number;
  newCoursesThisMonth: number;
  revenueGrowth: number; // percentage
}

export interface CourseStatistics {
  courseId: number;
  title: string;
  totalEnrollments: number;
  activeEnrollments: number;
  completedEnrollments: number;
  droppedEnrollments: number;
  completionRate: number;
  averageProgress: number;
  averageScore: number;
  totalRevenue: number;
  certificatesIssued: number;
  averageRating: number;
  totalReviews: number;
}

export interface RevenueReport {
  totalRevenue: number;
  periodRevenue: Array<{
    date: string;
    revenue: number;
    transactions: number;
  }>;
  topCourses: Array<{
    courseId: number;
    title: string;
    revenue: number;
    enrollments: number;
  }>;
  paymentMethods: Array<{
    method: string;
    count: number;
    revenue: number;
  }>;
}

export interface CompletionReport {
  overallCompletionRate: number;
  totalCompleted: number;
  totalInProgress: number;
  totalDropped: number;
  courseCompletionRates: Array<{
    courseId: number;
    title: string;
    completionRate: number;
    enrolled: number;
    completed: number;
  }>;
  monthlyCompletion: Array<{
    month: string;
    completionRate: number;
    completed: number;
  }>;
}

export interface StudentStatistics {
  userId: number;
  userName: string;
  totalCourses: number;
  completedCourses: number;
  inProgressCourses: number;
  droppedCourses: number;
  averageProgress: number;
  averageScore: number;
  totalCertificates: number;
  totalTimeSpent: number; // in minutes
  lastActiveAt?: string;
}

export interface EnrollmentTrend {
  period: string;
  enrollments: number;
  completions: number;
  drops: number;
  revenue: number;
}

// =====================
// DASHBOARD STATISTICS (Admin)
// =====================

/**
 * Get admin dashboard overview
 */
export const getDashboardOverview = async (): Promise<DashboardOverview> => {
  const response = await apiClient.get(`${API_PREFIX}/dashboard`);
  return response.data;
};

/**
 * Get system statistics summary
 */
export const getSystemStatistics = async (params?: {
  startDate?: string;
  endDate?: string;
}) => {
  // TODO: Backend should implement GET /v1/statistics/system
  const response = await apiClient.get(`${API_PREFIX}/system`, { params });
  return response.data;
};

// =====================
// COURSE STATISTICS
// =====================

/**
 * Get statistics for a specific course
 */
export const getCourseStatistics = async (
  courseId: number,
  params?: {
    startDate?: string;
    endDate?: string;
  }
): Promise<CourseStatistics> => {
  const response = await apiClient.get(`${API_PREFIX}/course/${courseId}`, { params });
  return response.data;
};

/**
 * Get statistics for all courses
 */
export const getAllCoursesStatistics = async (params?: {
  page?: number;
  size?: number;
  sortBy?: 'enrollments' | 'revenue' | 'completionRate' | 'rating';
  sortDir?: 'asc' | 'desc';
}): Promise<{
  content: CourseStatistics[];
  totalElements: number;
  totalPages: number;
}> => {
  // TODO: Backend should implement GET /v1/statistics/courses
  const response = await apiClient.get(`${API_PREFIX}/courses`, { params });
  return response.data;
};

/**
 * Get course performance trends
 */
export const getCoursePerformanceTrends = async (
  courseId: number,
  params?: {
    startDate?: string;
    endDate?: string;
    groupBy?: 'day' | 'week' | 'month';
  }
) => {
  // TODO: Backend should implement GET /v1/statistics/course/{id}/trends
  const response = await apiClient.get(`${API_PREFIX}/course/${courseId}/trends`, { params });
  return response.data;
};

// =====================
// REVENUE REPORTS
// =====================

/**
 * Get revenue report
 */
export const getRevenueReport = async (params?: {
  startDate?: string;
  endDate?: string;
  groupBy?: 'day' | 'week' | 'month' | 'year';
}): Promise<RevenueReport> => {
  const response = await apiClient.get(`${API_PREFIX}/revenue`, { params });
  return response.data;
};

/**
 * Get revenue by course
 */
export const getRevenueByCourse = async (params?: {
  startDate?: string;
  endDate?: string;
  limit?: number;
}) => {
  // TODO: Backend should implement GET /v1/statistics/revenue/courses
  const response = await apiClient.get(`${API_PREFIX}/revenue/courses`, { params });
  return response.data;
};

/**
 * Get revenue by instructor
 */
export const getRevenueByInstructor = async (params?: {
  startDate?: string;
  endDate?: string;
  limit?: number;
}) => {
  // TODO: Backend should implement GET /v1/statistics/revenue/instructors
  const response = await apiClient.get(`${API_PREFIX}/revenue/instructors`, { params });
  return response.data;
};

/**
 * Get revenue by payment method
 */
export const getRevenueByPaymentMethod = async (params?: {
  startDate?: string;
  endDate?: string;
}) => {
  // TODO: Backend should implement GET /v1/statistics/revenue/payment-methods
  const response = await apiClient.get(`${API_PREFIX}/revenue/payment-methods`, { params });
  return response.data;
};

// =====================
// COMPLETION REPORTS
// =====================

/**
 * Get completion report
 */
export const getCompletionReport = async (params?: {
  startDate?: string;
  endDate?: string;
}): Promise<CompletionReport> => {
  const response = await apiClient.get(`${API_PREFIX}/completion`, { params });
  return response.data;
};

/**
 * Get completion trends
 */
export const getCompletionTrends = async (params?: {
  startDate?: string;
  endDate?: string;
  groupBy?: 'week' | 'month' | 'quarter';
}) => {
  // TODO: Backend should implement GET /v1/statistics/completion/trends
  const response = await apiClient.get(`${API_PREFIX}/completion/trends`, { params });
  return response.data;
};

// =====================
// STUDENT STATISTICS
// =====================

/**
 * Get student statistics (Admin/Instructor)
 */
export const getStudentStatistics = async (
  userId: number,
  params?: {
    courseId?: number;
  }
): Promise<StudentStatistics> => {
  const response = await apiClient.get(`${API_PREFIX}/student/${userId}`, { params });
  return response.data;
};

/**
 * Get all students statistics (Admin)
 */
export const getAllStudentsStatistics = async (params?: {
  page?: number;
  size?: number;
  courseId?: number;
  sortBy?: 'progress' | 'score' | 'courses' | 'certificates';
  sortDir?: 'asc' | 'desc';
}): Promise<{
  content: StudentStatistics[];
  totalElements: number;
  totalPages: number;
}> => {
  // TODO: Backend should implement GET /v1/statistics/students
  const response = await apiClient.get(`${API_PREFIX}/students`, { params });
  return response.data;
};

/**
 * Get student engagement metrics
 */
export const getStudentEngagement = async (params?: {
  startDate?: string;
  endDate?: string;
  courseId?: number;
}) => {
  // TODO: Backend should implement GET /v1/statistics/students/engagement
  const response = await apiClient.get(`${API_PREFIX}/students/engagement`, { params });
  return response.data;
};

// =====================
// ENROLLMENT TRENDS
// =====================

/**
 * Get enrollment trends
 */
export const getEnrollmentTrends = async (params?: {
  startDate?: string;
  endDate?: string;
  groupBy?: 'day' | 'week' | 'month';
  courseId?: number;
}): Promise<EnrollmentTrend[]> => {
  // TODO: Backend should implement GET /v1/statistics/enrollments/trends
  const response = await apiClient.get(`${API_PREFIX}/enrollments/trends`, { params });
  return response.data;
};

/**
 * Get enrollment by category
 */
export const getEnrollmentByCategory = async (params?: {
  startDate?: string;
  endDate?: string;
}) => {
  // TODO: Backend should implement GET /v1/statistics/enrollments/categories
  const response = await apiClient.get(`${API_PREFIX}/enrollments/categories`, { params });
  return response.data;
};

/**
 * Get enrollment by level
 */
export const getEnrollmentByLevel = async (params?: {
  startDate?: string;
  endDate?: string;
}) => {
  // TODO: Backend should implement GET /v1/statistics/enrollments/levels
  const response = await apiClient.get(`${API_PREFIX}/enrollments/levels`, { params });
  return response.data;
};

// =====================
// INSTRUCTOR STATISTICS
// =====================

/**
 * Get instructor statistics (Admin)
 */
export const getInstructorStatistics = async (
  instructorId: number,
  params?: {
    startDate?: string;
    endDate?: string;
  }
) => {
  const response = await apiClient.get(`${API_PREFIX}/instructor/${instructorId}`, { params });
  return response.data;
};

/**
 * Get all instructors statistics (Admin)
 */
export const getAllInstructorsStatistics = async (params?: {
  page?: number;
  size?: number;
  sortBy?: 'revenue' | 'students' | 'courses' | 'rating';
  sortDir?: 'asc' | 'desc';
}) => {
  // TODO: Backend should implement GET /v1/statistics/instructors
  const response = await apiClient.get(`${API_PREFIX}/instructors`, { params });
  return response.data;
};

// =====================
// EXPORT REPORTS
// =====================

/**
 * Export statistics as CSV
 */
export const exportStatisticsCSV = async (
  reportType: 'revenue' | 'completion' | 'enrollment' | 'students' | 'courses',
  params?: {
    startDate?: string;
    endDate?: string;
  }
): Promise<Blob> => {
  // TODO: Backend should implement GET /v1/statistics/export/{type}
  const response = await apiClient.get(`${API_PREFIX}/export/${reportType}`, {
    params,
    responseType: 'blob',
  });
  return response.data;
};

/**
 * Export statistics as PDF
 */
export const exportStatisticsPDF = async (
  reportType: 'revenue' | 'completion' | 'enrollment' | 'students' | 'courses',
  params?: {
    startDate?: string;
    endDate?: string;
  }
): Promise<Blob> => {
  // TODO: Backend should implement GET /v1/statistics/export/{type}/pdf
  const response = await apiClient.get(`${API_PREFIX}/export/${reportType}/pdf`, {
    params,
    responseType: 'blob',
  });
  return response.data;
};

// =====================
// REAL-TIME STATISTICS
// =====================

/**
 * Get real-time active users
 */
export const getActiveUsers = async () => {
  // TODO: Backend should implement GET /v1/statistics/realtime/active-users
  const response = await apiClient.get(`${API_PREFIX}/realtime/active-users`);
  return response.data;
};

/**
 * Get real-time course views
 */
export const getRealTimeCourseViews = async (courseId?: number) => {
  // TODO: Backend should implement GET /v1/statistics/realtime/views
  const params = courseId ? { courseId } : {};
  const response = await apiClient.get(`${API_PREFIX}/realtime/views`, { params });
  return response.data;
};

export default {
  // Dashboard
  getDashboardOverview,
  getSystemStatistics,
  
  // Course Statistics
  getCourseStatistics,
  getAllCoursesStatistics,
  getCoursePerformanceTrends,
  
  // Revenue Reports
  getRevenueReport,
  getRevenueByCourse,
  getRevenueByInstructor,
  getRevenueByPaymentMethod,
  
  // Completion Reports
  getCompletionReport,
  getCompletionTrends,
  
  // Student Statistics
  getStudentStatistics,
  getAllStudentsStatistics,
  getStudentEngagement,
  
  // Enrollment Trends
  getEnrollmentTrends,
  getEnrollmentByCategory,
  getEnrollmentByLevel,
  
  // Instructor Statistics
  getInstructorStatistics,
  getAllInstructorsStatistics,
  
  // Export
  exportStatisticsCSV,
  exportStatisticsPDF,
  
  // Real-time
  getActiveUsers,
  getRealTimeCourseViews,
};




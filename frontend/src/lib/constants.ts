/**
 * Constants cho ứng dụng E-Learning
 */

// API Configuration
export const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8080/api';
export const CHATBOT_API_URL = process.env.NEXT_PUBLIC_CHATBOT_API_URL || 'http://localhost:8000/api';

// Storage Keys
export const STORAGE_KEYS = {
  AUTH_TOKEN: 'auth_token',
  REFRESH_TOKEN: 'refresh_token',
  USER_DATA: 'user_data',
  THEME: 'theme',
} as const;

// Course Levels
export const COURSE_LEVELS = {
  BEGINNER: 'BEGINNER',
  INTERMEDIATE: 'INTERMEDIATE',
  ADVANCED: 'ADVANCED',
  EXPERT: 'EXPERT',
} as const;

export const COURSE_LEVEL_LABELS = {
  BEGINNER: 'Người mới bắt đầu',
  INTERMEDIATE: 'Trung cấp',
  ADVANCED: 'Nâng cao',
  EXPERT: 'Chuyên gia',
} as const;

// User Roles
export const USER_ROLES = {
  STUDENT: 'ROLE_STUDENT',
  LECTURER: 'ROLE_LECTURER',
  ADMIN: 'ROLE_ADMIN',
} as const;

export const USER_ROLE_LABELS = {
  [USER_ROLES.STUDENT]: 'Học viên',
  [USER_ROLES.LECTURER]: 'Giảng viên',
  [USER_ROLES.ADMIN]: 'Quản trị viên',
} as const;

// Course Status
export const COURSE_STATUS = {
  DRAFT: 'DRAFT',
  PENDING: 'PENDING',
  PUBLISHED: 'PUBLISHED',
  ARCHIVED: 'ARCHIVED',
} as const;

export const COURSE_STATUS_LABELS = {
  [COURSE_STATUS.DRAFT]: 'Bản nháp',
  [COURSE_STATUS.PENDING]: 'Chờ duyệt',
  [COURSE_STATUS.PUBLISHED]: 'Đã xuất bản',
  [COURSE_STATUS.ARCHIVED]: 'Đã lưu trữ',
} as const;

// Lesson Types
export const LESSON_TYPES = {
  VIDEO: 'VIDEO',
  ARTICLE: 'ARTICLE',
  QUIZ: 'QUIZ',
  ASSIGNMENT: 'ASSIGNMENT',
  LIVE: 'LIVE_SESSION',
} as const;

export const LESSON_TYPE_LABELS = {
  [LESSON_TYPES.VIDEO]: 'Video',
  [LESSON_TYPES.ARTICLE]: 'Bài viết',
  [LESSON_TYPES.QUIZ]: 'Bài kiểm tra',
  [LESSON_TYPES.ASSIGNMENT]: 'Bài tập',
  [LESSON_TYPES.LIVE]: 'Buổi học trực tiếp',
} as const;

// Pagination
export const PAGINATION = {
  DEFAULT_PAGE_SIZE: 12,
  PAGE_SIZE_OPTIONS: [12, 24, 48, 96],
} as const;

// Date Formats
export const DATE_FORMATS = {
  FULL: 'dd/MM/yyyy HH:mm',
  DATE_ONLY: 'dd/MM/yyyy',
  TIME_ONLY: 'HH:mm',
  RELATIVE: 'relative',
} as const;

// File Upload
export const FILE_UPLOAD = {
  MAX_SIZE: 100 * 1024 * 1024, // 100MB
  MAX_VIDEO_SIZE: 500 * 1024 * 1024, // 500MB
  ALLOWED_IMAGE_TYPES: ['image/jpeg', 'image/png', 'image/webp', 'image/gif'],
  ALLOWED_VIDEO_TYPES: ['video/mp4', 'video/webm', 'video/ogg'],
  ALLOWED_DOCUMENT_TYPES: [
    'application/pdf',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'application/vnd.ms-powerpoint',
    'application/vnd.openxmlformats-officedocument.presentationml.presentation',
  ],
} as const;

// Toast Messages
export const TOAST_MESSAGES = {
  SUCCESS: {
    CREATED: 'Tạo thành công!',
    UPDATED: 'Cập nhật thành công!',
    DELETED: 'Xóa thành công!',
    SAVED: 'Lưu thành công!',
  },
  ERROR: {
    GENERIC: 'Đã có lỗi xảy ra. Vui lòng thử lại!',
    NETWORK: 'Lỗi kết nối mạng. Vui lòng kiểm tra kết nối!',
    UNAUTHORIZED: 'Bạn không có quyền thực hiện thao tác này!',
    NOT_FOUND: 'Không tìm thấy dữ liệu!',
  },
} as const;

// Routes
// Note: (auth) là route group, không tạo URL segment
export const ROUTES = {
  HOME: '/',
  LOGIN: '/login',
  REGISTER: '/register',
  FORGOT_PASSWORD: '/forgot-password',
  RESET_PASSWORD: '/reset-password',
  COURSES: '/courses',
  COURSE_DETAIL: (id: string) => `/courses/${id}`,
  LEARN: (id: string) => `/learn/${id}`,
  
  // Student Routes - Organized to prevent cross-linking
  STUDENT: {
    DASHBOARD: '/student',
    MY_COURSES: '/student/my-courses',
    CART: '/student/cart',
    PROGRESS: '/student/progress',
    CERTIFICATES: '/student/certificates',
    TRANSACTIONS: '/student/transactions',
    PROFILE: '/student/profile',
  },
  
  // Instructor Routes - Organized to prevent cross-linking
  INSTRUCTOR: {
    DASHBOARD: '/instructor',
    COURSES: '/instructor/courses',
    CREATE_COURSE: '/instructor/courses/create',
    EDIT_COURSE: (id: string) => `/instructor/courses/${id}/edit`,
    COURSE_CONTENT: (id: string) => `/instructor/courses/${id}/content`,
    STUDENTS: '/instructor/students',
    EARNINGS: '/instructor/earnings',
    PROFILE: '/instructor/profile',
  },
  
  // Admin Routes
  ADMIN: {
    DASHBOARD: '/admin',
    USERS: '/admin/users',
    CATEGORIES: '/admin/categories',
    COURSES: '/admin/courses',
    TRANSACTIONS: '/admin/transactions',
  },
  // Backward compatibility
  ADMIN_DASHBOARD: '/admin',
  ADMIN_COURSES: '/admin/courses',
  ADMIN_INSTRUCTORS: '/admin/instructors',
  ADMIN_STUDENTS: '/admin/students',
  ADMIN_ANALYTICS: '/admin/analytics',
  ADMIN_SETTINGS: '/admin/settings',
  
  // Other Routes
  CHECKOUT: (courseId: string) => `/checkout/${courseId}`,
  
  // Backward compatibility - Keep old flat structure for existing code
  STUDENT_DASHBOARD: '/student',
  STUDENT_MY_COURSES: '/student/my-courses',
  STUDENT_PROGRESS: '/student/progress',
  STUDENT_CERTIFICATES: '/student/certificates',
  STUDENT_PROFILE: '/student/profile',
  INSTRUCTOR_DASHBOARD: '/instructor',
  INSTRUCTOR_COURSES: '/instructor/courses',
  INSTRUCTOR_CREATE_COURSE: '/instructor/courses/create',
  INSTRUCTOR_EDIT_COURSE: (id: string) => `/instructor/courses/${id}/edit`,
  INSTRUCTOR_COURSE_CONTENT: (id: string) => `/instructor/courses/${id}/content`,
  INSTRUCTOR_STUDENTS: '/instructor/students',
  INSTRUCTOR_EARNINGS: '/instructor/earnings',
  INSTRUCTOR_PROFILE: '/instructor/profile',
} as const;


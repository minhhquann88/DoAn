// Module 5: Assignment Service
import apiClient from '@/lib/api';

// =====================
// TYPES
// =====================

export interface Assignment {
  id: number;
  courseId: number;
  title: string;
  description: string;
  instructions?: string;
  dueDate?: string;
  maxScore: number;
  allowLateSubmission: boolean;
  lateSubmissionPenalty?: number; // percentage
  attachments?: string[];
  status: 'DRAFT' | 'PUBLISHED' | 'ARCHIVED';
  createdAt: string;
  updatedAt: string;
}

export interface AssignmentSubmission {
  id: number;
  assignmentId: number;
  userId: number;
  userName?: string;
  submittedAt: string;
  content: string;
  attachments?: string[];
  score?: number;
  feedback?: string;
  gradedAt?: string;
  gradedBy?: number;
  status: 'PENDING' | 'GRADED' | 'LATE' | 'REJECTED';
  isLate: boolean;
}

export interface AssignmentCreateRequest {
  courseId: number;
  title: string;
  description: string;
  instructions?: string;
  dueDate?: string;
  maxScore: number;
  allowLateSubmission?: boolean;
  lateSubmissionPenalty?: number;
}

export interface SubmissionCreateRequest {
  assignmentId: number;
  content: string;
  attachments?: string[];
}

export interface GradingRequest {
  score: number;
  feedback?: string;
}

// =====================
// ASSIGNMENT MANAGEMENT (Instructor/Admin)
// =====================

/**
 * Get all assignments for a course
 */
export const getCourseAssignments = async (courseId: number): Promise<Assignment[]> => {
  const response = await apiClient.get(`/courses/${courseId}/assignments`);
  return response.data;
};

/**
 * Get assignment by ID
 */
export const getAssignmentById = async (assignmentId: number): Promise<Assignment> => {
  const response = await apiClient.get(`/assignments/${assignmentId}`);
  return response.data;
};

/**
 * Create new assignment (Instructor/Admin)
 */
export const createAssignment = async (data: AssignmentCreateRequest): Promise<Assignment> => {
  const response = await apiClient.post('/assignments', data);
  return response.data;
};

/**
 * Update assignment (Instructor/Admin)
 */
export const updateAssignment = async (
  assignmentId: number,
  data: Partial<AssignmentCreateRequest>
): Promise<Assignment> => {
  const response = await apiClient.put(`/assignments/${assignmentId}`, data);
  return response.data;
};

/**
 * Delete assignment (Instructor/Admin)
 */
export const deleteAssignment = async (assignmentId: number): Promise<void> => {
  await apiClient.delete(`/assignments/${assignmentId}`);
};

/**
 * Publish assignment
 */
export const publishAssignment = async (assignmentId: number): Promise<Assignment> => {
  const response = await apiClient.patch(`/assignments/${assignmentId}/publish`);
  return response.data;
};

/**
 * Archive assignment
 */
export const archiveAssignment = async (assignmentId: number): Promise<Assignment> => {
  const response = await apiClient.patch(`/assignments/${assignmentId}/archive`);
  return response.data;
};

// =====================
// SUBMISSIONS (Student)
// =====================

/**
 * Submit assignment (Student)
 */
export const submitAssignment = async (
  data: SubmissionCreateRequest
): Promise<AssignmentSubmission> => {
  const response = await apiClient.post('/submissions', data);
  return response.data;
};

/**
 * Update submission (Student - before deadline)
 */
export const updateSubmission = async (
  submissionId: number,
  data: Partial<SubmissionCreateRequest>
): Promise<AssignmentSubmission> => {
  const response = await apiClient.put(`/submissions/${submissionId}`, data);
  return response.data;
};

/**
 * Get my submission for an assignment
 */
export const getMySubmission = async (
  assignmentId: number
): Promise<AssignmentSubmission | null> => {
  const response = await apiClient.get(`/assignments/${assignmentId}/my-submission`);
  return response.data;
};

/**
 * Get all my submissions for a course
 */
export const getMySubmissions = async (courseId: number): Promise<AssignmentSubmission[]> => {
  const response = await apiClient.get(`/courses/${courseId}/my-submissions`);
  return response.data;
};

// =====================
// GRADING (Instructor/Admin)
// =====================

/**
 * Get all submissions for an assignment (Instructor/Admin)
 */
export const getAssignmentSubmissions = async (
  assignmentId: number,
  params?: {
    status?: 'PENDING' | 'GRADED' | 'LATE' | 'REJECTED';
    page?: number;
    size?: number;
  }
): Promise<{
  content: AssignmentSubmission[];
  totalElements: number;
  totalPages: number;
}> => {
  const response = await apiClient.get(`/assignments/${assignmentId}/submissions`, { params });
  return response.data;
};

/**
 * Get submission by ID
 */
export const getSubmissionById = async (
  submissionId: number
): Promise<AssignmentSubmission> => {
  const response = await apiClient.get(`/submissions/${submissionId}`);
  return response.data;
};

/**
 * Grade submission (Instructor/Admin)
 */
export const gradeSubmission = async (
  submissionId: number,
  data: GradingRequest
): Promise<AssignmentSubmission> => {
  const response = await apiClient.post(`/submissions/${submissionId}/grade`, data);
  return response.data;
};

/**
 * Reject submission (Instructor/Admin)
 */
export const rejectSubmission = async (
  submissionId: number,
  reason?: string
): Promise<AssignmentSubmission> => {
  const response = await apiClient.post(`/submissions/${submissionId}/reject`, { reason });
  return response.data;
};

/**
 * Bulk grade submissions
 */
export const bulkGradeSubmissions = async (
  grades: Array<{ submissionId: number; score: number; feedback?: string }>
): Promise<void> => {
  await apiClient.post('/submissions/bulk-grade', { grades });
};

// =====================
// FILE UPLOAD
// =====================

/**
 * Upload assignment attachment
 */
export const uploadAssignmentFile = async (
  file: File,
  onProgress?: (progress: number) => void
): Promise<{ url: string; fileName: string }> => {
  const formData = new FormData();
  formData.append('file', file);

  const response = await apiClient.post('/assignments/upload', formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
    onUploadProgress: (progressEvent) => {
      if (onProgress && progressEvent.total) {
        const progress = Math.round((progressEvent.loaded * 100) / progressEvent.total);
        onProgress(progress);
      }
    },
  });

  return response.data;
};

/**
 * Upload submission attachment
 */
export const uploadSubmissionFile = async (
  file: File,
  onProgress?: (progress: number) => void
): Promise<{ url: string; fileName: string }> => {
  const formData = new FormData();
  formData.append('file', file);

  const response = await apiClient.post('/submissions/upload', formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
    onUploadProgress: (progressEvent) => {
      if (onProgress && progressEvent.total) {
        const progress = Math.round((progressEvent.loaded * 100) / progressEvent.total);
        onProgress(progress);
      }
    },
  });

  return response.data;
};

// =====================
// STATISTICS
// =====================

/**
 * Get assignment statistics (Instructor/Admin)
 */
export const getAssignmentStatistics = async (assignmentId: number) => {
  const response = await apiClient.get(`/assignments/${assignmentId}/statistics`);
  return response.data;
};

/**
 * Get submission statistics for a course
 */
export const getCourseSubmissionStats = async (courseId: number) => {
  const response = await apiClient.get(`/courses/${courseId}/submission-stats`);
  return response.data;
};

export default {
  // Assignment Management
  getCourseAssignments,
  getAssignmentById,
  createAssignment,
  updateAssignment,
  deleteAssignment,
  publishAssignment,
  archiveAssignment,
  
  // Submissions
  submitAssignment,
  updateSubmission,
  getMySubmission,
  getMySubmissions,
  
  // Grading
  getAssignmentSubmissions,
  getSubmissionById,
  gradeSubmission,
  rejectSubmission,
  bulkGradeSubmissions,
  
  // File Upload
  uploadAssignmentFile,
  uploadSubmissionFile,
  
  // Statistics
  getAssignmentStatistics,
  getCourseSubmissionStats,
};




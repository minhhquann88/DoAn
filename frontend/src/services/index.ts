// =====================
// SERVICES INDEX
// Export all services for easy import
// =====================

// Module 1: Authentication
export * from './authService';

// Module 2: Course Management
export * from './courseService';

// Module 3: Content Management
export * from './contentService';

// Module 6: Student/Enrollment
export * from './enrollmentService';

// Module 7: Instructor
// Note: Excluding getInstructorStatistics to avoid conflict with statisticsService
export {
  getAllInstructors,
  getInstructorById,
  createInstructor,
  updateInstructor,
  deleteInstructor,
  suspendInstructor,
  activateInstructor,
  getMyInstructorProfile,
  updateMyInstructorProfile,
  getInstructorRevenue,
  getMyRevenue,
  getInstructorCourses,
  getMyCourses,
  getInstructorStudents,
  getMyStudents,
  getTopInstructors,
  getInstructorLeaderboard,
  getInstructorReviews,
  getMyReviews,
} from './instructorService';
export type {
  Instructor,
  InstructorStatistics,
  InstructorCreateRequest,
  InstructorUpdateRequest,
} from './instructorService';

// Module 8: Statistics & Reports
export * from './statisticsService';

// Module 9: Payment & Certificate
export * from './paymentService';

// Chatbot
export * from './chatbotService';




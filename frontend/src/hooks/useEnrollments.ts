/**
 * Custom hook for fetching student enrollments
 */
import { useQuery } from '@tanstack/react-query';
import { getEnrollmentsByStudent, getStudentLearningHistory, type EnrollmentResponse } from '@/services/enrollmentService';
import { useAuthStore } from '@/stores/authStore';

export type EnrollmentWithCourse = EnrollmentResponse;

/**
 * Hook to fetch current student's enrollments
 */
export const useMyEnrollments = () => {
  const { user } = useAuthStore();
  
  const {
    data: enrollmentsData,
    isLoading,
    error,
    refetch,
  } = useQuery({
    queryKey: ['my-enrollments', user?.id],
    queryFn: async () => {
      if (!user?.id) {
        return { content: [], totalElements: 0, totalPages: 0 };
      }
      // Fetch all enrollments (use large page size to get all)
      const response = await getEnrollmentsByStudent(user.id, 0, 100);
      return response;
    },
    enabled: !!user?.id,
  });

  const enrollments: EnrollmentWithCourse[] = enrollmentsData?.content || [];
  
  // Calculate average progress
  const averageProgress = enrollments.length > 0
    ? Math.round(
        enrollments.reduce((sum, e) => sum + (e.progress || 0), 0) / enrollments.length
      )
    : 0;

  // Count active enrollments (not completed or dropped)
  const activeEnrollmentsCount = enrollments.filter(
    e => e.status === 'ACTIVE' || (e.status === 'COMPLETED' && (e.progress || 0) < 100)
  ).length;

  return {
    enrollments,
    totalCount: enrollmentsData?.totalElements || 0,
    activeCount: activeEnrollmentsCount,
    averageProgress,
    isLoading,
    error,
    refetch,
  };
};

/**
 * Hook to fetch student learning history (includes stats)
 */
export const useStudentLearningHistory = () => {
  const { user } = useAuthStore();
  
  const {
    data: history,
    isLoading,
    error,
  } = useQuery({
    queryKey: ['student-learning-history', user?.id],
    queryFn: async () => {
      if (!user?.id) {
        return null;
      }
      return await getStudentLearningHistory(user.id);
    },
    enabled: !!user?.id,
  });

  return {
    history,
    isLoading,
    error,
  };
};


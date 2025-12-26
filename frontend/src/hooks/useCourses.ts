/**
 * Custom hook cho Courses
 */
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import apiClient, { handleApiError } from '@/lib/api';
import { useUIStore } from '@/stores/uiStore';
import { Course, CourseRequest, PaginatedResponse, SearchFilters } from '@/types';

export const useCourses = (filters?: SearchFilters) => {
  const queryClient = useQueryClient();
  const { addToast } = useUIStore();
  
  // Fetch courses with filters
  const {
    data: coursesData,
    isLoading,
    error,
    refetch,
  } = useQuery<PaginatedResponse<Course>>({
    queryKey: ['courses', filters],
    queryFn: async () => {
      const params = new URLSearchParams();
      
      if (filters?.keyword) params.append('keyword', filters.keyword);
      if (filters?.categoryId) params.append('categoryId', filters.categoryId.toString());
      if (filters?.level) params.append('level', filters.level);
      
      // Price filtering
      if (filters?.isFree !== undefined) params.append('isFree', filters.isFree.toString());
      if (filters?.isPaid !== undefined) params.append('isPaid', filters.isPaid.toString());
      if (filters?.minPrice !== undefined) params.append('minPrice', filters.minPrice.toString());
      if (filters?.maxPrice !== undefined) params.append('maxPrice', filters.maxPrice.toString());
      
      // Pagination
      const page = filters?.page ?? 0;
      params.append('page', page.toString());
      params.append('size', '12');
      
      // Sorting
      let sortParam = 'createdAt,desc';
      if (filters?.sortBy === 'popular') sortParam = 'enrollmentCount,desc';
      if (filters?.sortBy === 'rating') sortParam = 'rating,desc';
      if (filters?.sortBy === 'price_low') sortParam = 'price,asc';
      if (filters?.sortBy === 'price_high') sortParam = 'price,desc';
      params.append('sort', sortParam);
      
      const response = await apiClient.get(`/courses?${params.toString()}`);
      return response.data;
    },
  });
  
  return {
    courses: coursesData?.content || [],
    totalPages: coursesData?.totalPages || 0,
    totalElements: coursesData?.totalElements || 0,
    isLoading,
    error,
    refetch,
  };
};

export const useCourse = (id: number | string) => {
  const {
    data: course,
    isLoading,
    error,
  } = useQuery<Course>({
    queryKey: ['course', id],
    queryFn: async () => {
      const response = await apiClient.get(`/courses/${id}`);
      return response.data;
    },
    enabled: !!id,
  });
  
  return { course, isLoading, error };
};

export const useCreateCourse = () => {
  const queryClient = useQueryClient();
  const { addToast } = useUIStore();
  
  return useMutation({
    mutationFn: async (data: CourseRequest) => {
      const response = await apiClient.post('/courses', data);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['courses'] });
      addToast({
        type: 'success',
        description: 'Tạo khóa học thành công!',
      });
    },
    onError: (error: any) => {
      addToast({
        type: 'error',
        description: handleApiError(error),
      });
    },
  });
};

export const useUpdateCourse = (id: number) => {
  const queryClient = useQueryClient();
  const { addToast } = useUIStore();
  
  return useMutation({
    mutationFn: async (data: CourseRequest) => {
      const response = await apiClient.put(`/courses/${id}`, data);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['courses'] });
      queryClient.invalidateQueries({ queryKey: ['course', id] });
      addToast({
        type: 'success',
        description: 'Cập nhật khóa học thành công!',
      });
    },
    onError: (error: any) => {
      addToast({
        type: 'error',
        description: handleApiError(error),
      });
    },
  });
};

export const useDeleteCourse = () => {
  const queryClient = useQueryClient();
  const { addToast } = useUIStore();
  
  return useMutation({
    mutationFn: async (id: number) => {
      await apiClient.delete(`/courses/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['courses'] });
      addToast({
        type: 'success',
        description: 'Xóa khóa học thành công!',
      });
    },
    onError: (error: any) => {
      addToast({
        type: 'error',
        description: handleApiError(error),
      });
    },
  });
};

/**
 * Hook để lấy danh sách khóa học nổi bật (Featured Courses)
 * Gọi trực tiếp endpoint /courses/featured từ backend
 */
export const useFeaturedCourses = () => {
  const {
    data: featuredCourses,
    isLoading,
    error,
  } = useQuery<Course[]>({
    queryKey: ['featured-courses'],
    queryFn: async () => {
      const response = await apiClient.get<Course[]>('/courses/featured');
      return response.data;
    },
  });
  
  return {
    featuredCourses: featuredCourses || [],
    isLoading,
    error,
  };
};


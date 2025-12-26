'use client';

import React from 'react';
import { useParams, useRouter } from 'next/navigation';
import { ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useCourse } from '@/hooks/useCourses';
import { Skeleton } from '@/components/ui/skeleton';

export default function EditCoursePage() {
  const params = useParams();
  const router = useRouter();
  const courseId = params.id as string;
  const { course, isLoading } = useCourse(courseId);

  // Redirect to create page with course data (for now, since edit page uses same form)
  React.useEffect(() => {
    if (course) {
      // In a real app, you would pass course data to the create form in edit mode
      // For now, we'll redirect to create page
      router.push('/instructor/courses/create');
    }
  }, [course, router]);

  return (
    <div className="p-6 space-y-6">
        <div className="flex items-center space-x-4">
          <Button variant="ghost" size="icon" onClick={() => router.back()}>
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div>
            <h1 className="text-3xl font-bold font-poppins">Chỉnh sửa khóa học</h1>
            {isLoading ? (
              <Skeleton className="h-4 w-48 mt-2" />
            ) : (
              <p className="text-muted-foreground mt-1">
                {course?.title || 'Đang tải...'}
              </p>
            )}
          </div>
        </div>
        
        {isLoading ? (
          <div className="space-y-4">
            <Skeleton className="h-64 w-full" />
            <Skeleton className="h-64 w-full" />
          </div>
        ) : (
          <div className="text-center py-12">
            <p className="text-muted-foreground">
              Đang chuyển hướng đến trang chỉnh sửa...
            </p>
          </div>
        )}
    </div>
  );
}


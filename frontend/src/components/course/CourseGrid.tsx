'use client';

import React from 'react';
import { Course } from '@/types';
import { CourseCard } from './CourseCard';
import { Skeleton } from '@/components/ui/skeleton';

interface CourseGridProps {
  courses: Course[];
  isLoading?: boolean;
}

export function CourseGrid({ courses, isLoading }: CourseGridProps) {
  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {[...Array(8)].map((_, i) => (
          <div key={i} className="space-y-3">
            <Skeleton className="aspect-video w-full" />
            <Skeleton className="h-4 w-3/4" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-1/2" />
          </div>
        ))}
      </div>
    );
  }
  
  if (!courses || courses.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-lg text-muted-foreground">
          Không tìm thấy khóa học nào
        </p>
      </div>
    );
  }
  
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
      {courses.map((course, index) => (
        <CourseCard key={course.id} course={course} priority={index < 4} />
      ))}
    </div>
  );
}


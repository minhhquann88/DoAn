'use client';

import React, { Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { Filter, SlidersHorizontal } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Navbar } from '@/components/layout/Navbar';
import { Footer } from '@/components/layout/Footer';
import { CourseGrid } from '@/components/course/CourseGrid';
import { useCourses } from '@/hooks/useCourses';
import { SearchFilters } from '@/types';
import { COURSE_LEVELS, COURSE_LEVEL_LABELS } from '@/lib/constants';

function CoursesContent() {
  const searchParams = useSearchParams();
  const [filters, setFilters] = React.useState<SearchFilters>({
    keyword: searchParams.get('keyword') || '',
    sortBy: 'popular',
  });
  
  const { courses, isLoading, totalElements } = useCourses(filters);
  
  const handleSortChange = (value: string) => {
    setFilters(prev => ({ ...prev, sortBy: value as any }));
  };
  
  const handleLevelFilter = (level: string) => {
    setFilters(prev => ({ 
      ...prev, 
      level: prev.level === level ? undefined : level 
    }));
  };
  
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      
      <div className="flex-1">
        {/* Page Header */}
        <div className="border-b bg-muted/30">
          <div className="container mx-auto px-4 py-8">
            <h1 className="text-3xl font-bold font-poppins mb-2">
              {filters.keyword ? `Kết quả tìm kiếm: "${filters.keyword}"` : 'Tất cả khóa học'}
            </h1>
            <p className="text-muted-foreground">
              {totalElements.toLocaleString()} khóa học
            </p>
          </div>
        </div>
        
        <div className="container mx-auto px-4 py-8">
          <div className="flex flex-col lg:flex-row gap-8">
            {/* Filters Sidebar */}
            <aside className="lg:w-64 space-y-6">
              <div className="rounded-lg border bg-card p-4">
                <div className="flex items-center gap-2 mb-4">
                  <SlidersHorizontal className="h-5 w-5" />
                  <h2 className="font-semibold">Bộ lọc</h2>
                </div>
                
                {/* Level Filter */}
                <div className="space-y-3">
                  <h3 className="text-sm font-medium">Cấp độ</h3>
                  <div className="space-y-2">
                    {Object.entries(COURSE_LEVEL_LABELS).map(([key, label]) => (
                      <label key={key} className="flex items-center space-x-2 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={filters.level === key}
                          onChange={() => handleLevelFilter(key)}
                          className="rounded border-gray-300"
                        />
                        <span className="text-sm">{label}</span>
                      </label>
                    ))}
                  </div>
                </div>
                
                {/* Price Filter */}
                <div className="mt-6 space-y-3">
                  <h3 className="text-sm font-medium">Giá</h3>
                  <div className="space-y-2">
                    <label className="flex items-center space-x-2 cursor-pointer">
                      <input type="checkbox" className="rounded border-gray-300" />
                      <span className="text-sm">Miễn phí</span>
                    </label>
                    <label className="flex items-center space-x-2 cursor-pointer">
                      <input type="checkbox" className="rounded border-gray-300" />
                      <span className="text-sm">Có phí</span>
                    </label>
                  </div>
                </div>
                
                {/* Rating Filter */}
                <div className="mt-6 space-y-3">
                  <h3 className="text-sm font-medium">Đánh giá</h3>
                  <div className="space-y-2">
                    {[5, 4, 3].map((rating) => (
                      <label key={rating} className="flex items-center space-x-2 cursor-pointer">
                        <input type="checkbox" className="rounded border-gray-300" />
                        <span className="text-sm">{rating} sao trở lên</span>
                      </label>
                    ))}
                  </div>
                </div>
                
                {/* Clear Filters */}
                <Button 
                  variant="outline" 
                  className="w-full mt-6"
                  onClick={() => setFilters({ sortBy: 'popular' })}
                >
                  Xóa bộ lọc
                </Button>
              </div>
            </aside>
            
            {/* Main Content */}
            <div className="flex-1">
              {/* Sort & View Options */}
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-4">
                  <span className="text-sm text-muted-foreground">
                    Hiển thị {courses.length} khóa học
                  </span>
                </div>
                
                <div className="flex items-center gap-2">
                  <span className="text-sm text-muted-foreground">Sắp xếp:</span>
                  <Select value={filters.sortBy} onValueChange={handleSortChange}>
                    <SelectTrigger className="w-48">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="popular">Phổ biến nhất</SelectItem>
                      <SelectItem value="rating">Đánh giá cao</SelectItem>
                      <SelectItem value="newest">Mới nhất</SelectItem>
                      <SelectItem value="price_low">Giá thấp đến cao</SelectItem>
                      <SelectItem value="price_high">Giá cao đến thấp</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              
              {/* Course Grid */}
              <CourseGrid courses={courses} isLoading={isLoading} />
              
              {/* Pagination */}
              {!isLoading && courses.length > 0 && (
                <div className="flex items-center justify-center mt-8 gap-2">
                  <Button variant="outline" disabled>
                    Trước
                  </Button>
                  <Button variant="default">1</Button>
                  <Button variant="outline">2</Button>
                  <Button variant="outline">3</Button>
                  <Button variant="outline">
                    Sau
                  </Button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
      
      <Footer />
    </div>
  );
}

export default function CoursesPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex flex-col">
        <div className="flex-1 flex items-center justify-center">
          <div className="animate-pulse">Đang tải...</div>
        </div>
      </div>
    }>
      <CoursesContent />
    </Suspense>
  );
}


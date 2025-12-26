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
    page: 0,
  });
  
  const { courses, isLoading, totalElements, totalPages } = useCourses(filters);
  
  const handleSortChange = (value: string) => {
    setFilters(prev => ({ ...prev, sortBy: value as any, page: 0 })); // Reset to first page on sort change
  };
  
  const handleLevelFilter = (level: string) => {
    setFilters(prev => ({ 
      ...prev, 
      level: prev.level === level ? undefined : level,
      page: 0 // Reset to first page on filter change
    }));
  };

  const handlePriceFilter = (filterType: 'free' | 'paid' | null) => {
    setFilters(prev => {
      const newFilters = { ...prev, page: 0 }; // Reset to first page
      if (filterType === 'free') {
        newFilters.isFree = prev.isFree ? undefined : true;
        newFilters.isPaid = undefined; // Clear paid filter
      } else if (filterType === 'paid') {
        newFilters.isPaid = prev.isPaid ? undefined : true;
        newFilters.isFree = undefined; // Clear free filter
      } else {
        newFilters.isFree = undefined;
        newFilters.isPaid = undefined;
      }
      return newFilters;
    });
  };

  const handlePageChange = (newPage: number) => {
    setFilters(prev => ({ ...prev, page: newPage }));
    // Scroll to top when page changes
    window.scrollTo({ top: 0, behavior: 'smooth' });
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
                      <input
                        type="checkbox"
                        checked={filters.isFree === true}
                        onChange={() => handlePriceFilter('free')}
                        className="rounded border-gray-300"
                      />
                      <span className="text-sm">Miễn phí</span>
                    </label>
                    <label className="flex items-center space-x-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={filters.isPaid === true}
                        onChange={() => handlePriceFilter('paid')}
                        className="rounded border-gray-300"
                      />
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
                  onClick={() => setFilters({ sortBy: 'popular', page: 0 })}
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
              {!isLoading && courses.length > 0 && totalPages > 1 && (
                <div className="flex items-center justify-center mt-8 gap-2">
                  <Button
                    variant="outline"
                    disabled={filters.page === 0}
                    onClick={() => handlePageChange((filters.page || 0) - 1)}
                  >
                    Trước
                  </Button>
                  {Array.from({ length: Math.min(totalPages, 5) }, (_, i) => {
                    // Show pages around current page
                    const currentPage = filters.page || 0;
                    let pageNum;
                    if (totalPages <= 5) {
                      pageNum = i;
                    } else if (currentPage < 3) {
                      pageNum = i;
                    } else if (currentPage > totalPages - 4) {
                      pageNum = totalPages - 5 + i;
                    } else {
                      pageNum = currentPage - 2 + i;
                    }
                    return (
                      <Button
                        key={pageNum}
                        variant={pageNum === currentPage ? 'default' : 'outline'}
                        onClick={() => handlePageChange(pageNum)}
                      >
                        {pageNum + 1}
                      </Button>
                    );
                  })}
                  <Button
                    variant="outline"
                    disabled={(filters.page || 0) >= totalPages - 1}
                    onClick={() => handlePageChange((filters.page || 0) + 1)}
                  >
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


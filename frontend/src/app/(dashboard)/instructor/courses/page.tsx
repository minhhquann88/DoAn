'use client';

import React from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { 
  Plus, 
  Edit, 
  Trash2, 
  BarChart3, 
  Eye,
  BookOpen,
  Users,
  DollarSign,
  Calendar,
  Search,
  Upload,
  Download,
  FileText
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { ROUTES } from '@/lib/constants';
import { useInstructorCourses, useDeleteCourse, usePublishCourse, useUnpublishCourse } from '@/hooks/useCourses';
import { useUIStore } from '@/stores/uiStore';

export default function InstructorCoursesPage() {
  const router = useRouter();
  const { addToast } = useUIStore();
  const { courses, isLoading } = useInstructorCourses();
  const deleteCourse = useDeleteCourse();
  const publishCourse = usePublishCourse();
  const unpublishCourse = useUnpublishCourse();
  const [searchQuery, setSearchQuery] = React.useState('');

  // Filter courses by search query
  const filteredCourses = React.useMemo(() => {
    if (!searchQuery) return courses;
    return courses.filter(course =>
      course.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      course.description?.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [courses, searchQuery]);

  const handleDelete = async (courseId: number, courseTitle: string) => {
    if (!confirm(`Bạn có chắc chắn muốn xóa khóa học "${courseTitle}"?`)) {
      return;
    }
    
    try {
      await deleteCourse.mutateAsync(courseId);
    } catch (error) {
      // Error already handled by hook
    }
  };

  const handlePublish = async (courseId: number) => {
    if (!confirm('Bạn có chắc chắn muốn xuất bản khóa học này? Khóa học sẽ được hiển thị công khai ngay lập tức.')) {
      return;
    }
    
    try {
      await publishCourse.mutateAsync(courseId);
    } catch (error) {
      // Error already handled by hook
    }
  };

  const handleUnpublish = async (courseId: number) => {
    if (!confirm('Bạn có chắc chắn muốn gỡ khóa học này? Khóa học sẽ không còn hiển thị công khai.')) {
      return;
    }
    
    try {
      await unpublishCourse.mutateAsync(courseId);
    } catch (error) {
      // Error already handled by hook
    }
  };

  const getStatusBadge = (status: string) => {
    const statusMap: Record<string, { label: string; variant: 'default' | 'secondary' | 'destructive' | 'outline' }> = {
      'PUBLISHED': { label: 'Đã xuất bản', variant: 'default' },
      'DRAFT': { label: 'Bản nháp', variant: 'secondary' },
      'PENDING_APPROVAL': { label: 'Chờ duyệt', variant: 'outline' },
    };
    
    const statusInfo = statusMap[status] || { label: status, variant: 'outline' as const };
    return <Badge variant={statusInfo.variant}>{statusInfo.label}</Badge>;
  };

  return (
    <div className="p-6 space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold font-poppins">Khóa học của tôi</h1>
            <p className="text-muted-foreground mt-1">
              Quản lý tất cả khóa học của bạn
            </p>
          </div>
          <Button asChild>
            <Link href={ROUTES.INSTRUCTOR_CREATE_COURSE}>
              <Plus className="h-4 w-4 mr-2" />
              Tạo khóa học mới
            </Link>
          </Button>
        </div>

        {/* Search Bar */}
        <div className="flex items-center gap-4">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              type="search"
              placeholder="Tìm kiếm khóa học..."
              className="pl-10"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <div className="text-sm text-muted-foreground">
            {filteredCourses.length} khóa học
          </div>
        </div>

        {/* Courses Table */}
        <div className="bg-card rounded-lg border">
          {isLoading ? (
            <div className="p-6 space-y-4">
              {[...Array(5)].map((_, i) => (
                <div key={i} className="flex items-center space-x-4">
                  <Skeleton className="h-16 w-16 rounded" />
                  <div className="flex-1 space-y-2">
                    <Skeleton className="h-4 w-3/4" />
                    <Skeleton className="h-3 w-1/2" />
                  </div>
                  <Skeleton className="h-8 w-24" />
                </div>
              ))}
            </div>
          ) : filteredCourses.length === 0 ? (
            <div className="p-12 text-center">
              <BookOpen className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">Chưa có khóa học nào</h3>
              <p className="text-muted-foreground mb-4">
                {searchQuery ? 'Không tìm thấy khóa học nào phù hợp.' : 'Bắt đầu tạo khóa học đầu tiên của bạn!'}
              </p>
              {!searchQuery && (
                <Button asChild>
                  <Link href={ROUTES.INSTRUCTOR_CREATE_COURSE}>
                    <Plus className="h-4 w-4 mr-2" />
                    Tạo khóa học mới
                  </Link>
                </Button>
              )}
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="border-b">
                  <tr>
                    <th className="text-left p-4 font-semibold">Khóa học</th>
                    <th className="text-left p-4 font-semibold">Trạng thái</th>
                    <th className="text-left p-4 font-semibold">Học viên</th>
                    <th className="text-left p-4 font-semibold">Giá thành</th>
                    <th className="text-left p-4 font-semibold">Cập nhật</th>
                    <th className="text-right p-4 font-semibold">Thao tác</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredCourses.map((course) => (
                    <tr key={course.id} className="border-b hover:bg-muted/50 transition-colors">
                      <td className="p-4">
                        <div className="flex items-center space-x-4">
                          <div className="h-16 w-16 rounded-lg overflow-hidden bg-muted flex-shrink-0">
                            {course.imageUrl ? (
                              <img
                                src={course.imageUrl}
                                alt={course.title}
                                className="w-full h-full object-cover"
                              />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center">
                                <BookOpen className="h-6 w-6 text-muted-foreground" />
                              </div>
                            )}
                          </div>
                          <div className="flex-1 min-w-0">
                            <h3 className="font-semibold truncate">{course.title}</h3>
                            <p className="text-sm text-muted-foreground line-clamp-1">
                              {course.description || 'Không có mô tả'}
                            </p>
                          </div>
                        </div>
                      </td>
                      <td className="p-4">
                        {getStatusBadge(course.status || 'DRAFT')}
                      </td>
                      <td className="p-4">
                        <div className="flex items-center space-x-2 text-sm">
                          <Users className="h-4 w-4 text-muted-foreground" />
                          <span>{course.enrollmentCount || 0}</span>
                        </div>
                      </td>
                      <td className="p-4">
                        <div className="flex items-center space-x-2 text-sm">
                          <DollarSign className="h-4 w-4 text-muted-foreground" />
                          <span>{(course.price || 0).toLocaleString('vi-VN')} đ</span>
                        </div>
                      </td>
                      <td className="p-4">
                        <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                          <Calendar className="h-4 w-4" />
                          <span>
                            {course.updatedAt
                              ? new Date(course.updatedAt).toLocaleDateString('vi-VN')
                              : 'N/A'}
                          </span>
                        </div>
                      </td>
                      <td className="p-4">
                        <div className="flex items-center justify-end space-x-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            asChild
                          >
                            <Link href={ROUTES.COURSE_DETAIL(course.id.toString())}>
                              <Eye className="h-4 w-4" />
                            </Link>
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            asChild
                            title="Quản lý nội dung"
                          >
                            <Link href={ROUTES.INSTRUCTOR.COURSE_CONTENT(course.id.toString())}>
                              <FileText className="h-4 w-4" />
                            </Link>
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            asChild
                            title="Chỉnh sửa thông tin"
                          >
                            <Link href={ROUTES.INSTRUCTOR_EDIT_COURSE(course.id.toString())}>
                              <Edit className="h-4 w-4" />
                            </Link>
                          </Button>
                          {course.status === 'DRAFT' && (
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handlePublish(course.id)}
                              className="text-green-600 hover:text-green-700"
                              title="Xuất bản khóa học"
                            >
                              <Upload className="h-4 w-4" />
                            </Button>
                          )}
                          {course.status === 'PUBLISHED' && (
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleUnpublish(course.id)}
                              className="text-orange-600 hover:text-orange-700"
                              title="Gỡ khóa học"
                            >
                              <Download className="h-4 w-4" />
                            </Button>
                          )}
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => router.push(`/instructor/courses/${course.id}/analytics`)}
                          >
                            <BarChart3 className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleDelete(course.id, course.title)}
                            className="text-destructive hover:text-destructive"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
    </div>
  );
}


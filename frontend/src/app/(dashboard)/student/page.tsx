'use client';

import React from 'react';
import Link from 'next/link';
import { 
  BookOpen, 
  Clock, 
  TrendingUp, 
  Award,
  PlayCircle,
  Calendar,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useAuthStore } from '@/stores/authStore';
import { ROUTES } from '@/lib/constants';
import { useMyEnrollments } from '@/hooks/useEnrollments';

export default function StudentDashboard() {
  const { user } = useAuthStore();
  const { enrollments, activeCount, averageProgress, isLoading } = useMyEnrollments();
  
  // Map enrollments to course format for UI
  const enrolledCourses = React.useMemo(() => {
    return enrollments.map((enrollment) => ({
      id: enrollment.courseId,
      title: enrollment.courseTitle || enrollment.course?.title || 'Khóa học',
      thumbnail: enrollment.course?.imageUrl || enrollment.course?.thumbnail || null,
      instructor: enrollment.instructorName || 'Giảng viên',
      progress: Math.round(enrollment.progress || 0),
      totalLessons: enrollment.totalLessons || 0,
      completedLessons: enrollment.completedLessons || 0,
      lastAccessed: enrollment.lastAccessedAt 
        ? new Date(enrollment.lastAccessedAt).toLocaleDateString('vi-VN')
        : enrollment.enrolledAt 
        ? new Date(enrollment.enrolledAt).toLocaleDateString('vi-VN')
        : '',
      category: enrollment.course?.category || 'Khác',
      status: enrollment.status,
    }));
  }, [enrollments]);
  
  // Filter active courses (in progress, not completed)
  const activeCourses = enrolledCourses.filter(
    course => (course.progress > 0 && course.progress < 100) || course.status === 'ACTIVE'
  );
  
  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="border-b bg-card">
        <div className="container mx-auto px-4 py-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold font-poppins mb-2">
                Chào mừng trở lại, {user?.fullName}! 👋
              </h1>
              <p className="text-muted-foreground">
                Tiếp tục hành trình học tập của bạn
              </p>
            </div>
            
            <Button asChild>
              <Link href={ROUTES.COURSES}>
                <BookOpen className="h-4 w-4 mr-2" />
                Khám phá khóa học
              </Link>
            </Button>
          </div>
        </div>
      </div>
      
      {/* Main Content */}
      <div className="container mx-auto px-4 py-8">
        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Khóa học đang học
              </CardTitle>
              <BookOpen className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{activeCount}</div>
              <p className="text-xs text-muted-foreground">
                {activeCount === 0 ? 'Chưa có khóa học' : 'Khóa học đang học'}
              </p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Giờ học
              </CardTitle>
              <Clock className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">42.5</div>
              <p className="text-xs text-muted-foreground">
                +5.2 giờ tuần này
              </p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Tiến độ trung bình
              </CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{averageProgress}%</div>
              <p className="text-xs text-muted-foreground">
                {enrollments.length > 0 
                  ? `Từ ${enrollments.length} khóa học` 
                  : 'Chưa có dữ liệu'}
              </p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Chứng chỉ
              </CardTitle>
              <Award className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">5</div>
              <p className="text-xs text-muted-foreground">
                +2 tháng này
              </p>
            </CardContent>
          </Card>
        </div>
        
        {/* Tabs */}
        <Tabs defaultValue="continue" className="space-y-6">
          <TabsList>
            <TabsTrigger value="continue">Tiếp tục học</TabsTrigger>
            <TabsTrigger value="all">Tất cả khóa học</TabsTrigger>
            <TabsTrigger value="activity">Hoạt động gần đây</TabsTrigger>
          </TabsList>
          
          {/* Continue Learning */}
          <TabsContent value="continue" className="space-y-6">
            {isLoading ? (
              <div className="text-center py-12 text-muted-foreground">Đang tải...</div>
            ) : activeCourses.length === 0 ? (
              <div className="text-center py-12">
                <BookOpen className="h-16 w-16 mx-auto mb-4 text-muted-foreground" />
                <h3 className="text-lg font-semibold mb-2">Chưa có khóa học đang học</h3>
                <p className="text-muted-foreground mb-6">
                  Bắt đầu học một khóa học mới ngay hôm nay!
                </p>
                <Button asChild>
                  <Link href={ROUTES.COURSES}>Khám phá khóa học</Link>
                </Button>
              </div>
            ) : (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {activeCourses.map((course) => (
                  <Card key={course.id} className="overflow-hidden hover:shadow-lg transition-shadow">
                    <div className="aspect-video bg-gradient-to-br from-primary/20 to-secondary/20 flex items-center justify-center">
                      <PlayCircle className="h-16 w-16 text-primary/50" />
                    </div>
                    <CardHeader>
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <Badge variant="secondary" className="mb-2">
                            {course.category}
                          </Badge>
                          <CardTitle className="line-clamp-2 mb-2">
                            {course.title}
                          </CardTitle>
                          <CardDescription>
                            Giảng viên: {course.instructor}
                          </CardDescription>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      {/* Progress */}
                      <div className="space-y-2">
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-muted-foreground">Tiến độ</span>
                          <span className="font-medium">{course.progress}%</span>
                        </div>
                        <Progress value={course.progress} />
                        <p className="text-xs text-muted-foreground">
                          {course.completedLessons} / {course.totalLessons} bài học hoàn thành
                        </p>
                      </div>
                      
                      {/* Actions */}
                      <div className="flex items-center gap-2">
                        <Button asChild className="flex-1">
                          <Link href={ROUTES.LEARN(course.id.toString())}>
                            <PlayCircle className="h-4 w-4 mr-2" />
                            Tiếp tục học
                          </Link>
                        </Button>
                        <Button variant="outline" asChild>
                          <Link href={ROUTES.COURSE_DETAIL(course.id.toString())}>
                            Chi tiết
                          </Link>
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
            </div>
            )}
          </TabsContent>
          
          {/* All Courses */}
          <TabsContent value="all" className="space-y-6">
            {isLoading ? (
              <div className="text-center py-12 text-muted-foreground">Đang tải...</div>
            ) : enrolledCourses.length === 0 ? (
              <div className="text-center py-12">
                <BookOpen className="h-16 w-16 mx-auto mb-4 text-muted-foreground" />
                <h3 className="text-lg font-semibold mb-2">Chưa có khóa học nào</h3>
                <p className="text-muted-foreground mb-6">
                  Bắt đầu học một khóa học mới ngay hôm nay!
                </p>
                <Button asChild>
                  <Link href={ROUTES.COURSES}>Khám phá khóa học</Link>
                </Button>
              </div>
            ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {enrolledCourses.map((course) => (
                <Card key={course.id} className="hover:shadow-lg transition-shadow">
                  <div className="aspect-video bg-gradient-to-br from-primary/20 to-secondary/20 flex items-center justify-center">
                    <BookOpen className="h-12 w-12 text-primary/50" />
                  </div>
                  <CardHeader>
                    <Badge variant="secondary" className="w-fit mb-2">
                      {course.category}
                    </Badge>
                    <CardTitle className="line-clamp-2">{course.title}</CardTitle>
                    <CardDescription>{course.instructor}</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="space-y-2">
                      <div className="flex items-center justify-between text-sm">
                        <span>Tiến độ</span>
                        <span className="font-medium">{course.progress}%</span>
                      </div>
                      <Progress value={course.progress} />
                    </div>
                    
                    <Button asChild className="w-full">
                      <Link href={ROUTES.LEARN(course.id.toString())}>
                        {course.progress === 0 ? 'Bắt đầu học' : 
                         course.progress === 100 ? 'Ôn tập' : 'Tiếp tục học'}
                      </Link>
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>
            )}
          </TabsContent>
          
          {/* Recent Activity */}
          <TabsContent value="activity" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Hoạt động gần đây</CardTitle>
                <CardDescription>
                  Theo dõi tiến trình học tập của bạn
                </CardDescription>
              </CardHeader>
              <CardContent>
                {isLoading ? (
                  <div className="text-center py-8 text-muted-foreground">Đang tải...</div>
                ) : enrollments.length === 0 ? (
                  <div className="text-center py-8">
                    <BookOpen className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                    <p className="text-muted-foreground mb-4">Chưa có hoạt động nào</p>
                    <Button asChild>
                      <Link href={ROUTES.COURSES}>Khám phá khóa học</Link>
                    </Button>
                  </div>
                ) : (
                <div className="space-y-4">
                    {enrollments
                      .filter(e => e.lastAccessedAt || e.enrolledAt)
                      .sort((a, b) => {
                        const dateA = a.lastAccessedAt ? new Date(a.lastAccessedAt).getTime() : new Date(a.enrolledAt).getTime();
                        const dateB = b.lastAccessedAt ? new Date(b.lastAccessedAt).getTime() : new Date(b.enrolledAt).getTime();
                        return dateB - dateA;
                      })
                      .slice(0, 10)
                      .map((enrollment) => {
                        const lastAccess = enrollment.lastAccessedAt || enrollment.enrolledAt;
                        const timeAgo = lastAccess 
                          ? new Date(lastAccess).toLocaleDateString('vi-VN', { 
                              day: 'numeric', 
                              month: 'short',
                              year: 'numeric'
                            })
                          : '';
                        
                        return (
                          <div 
                            key={enrollment.id}
                            className="flex items-start gap-4 p-4 rounded-lg border hover:bg-muted/50 transition-colors"
                          >
                            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10">
                              {enrollment.status === 'COMPLETED' ? (
                                <Award className="h-5 w-5 text-secondary" />
                              ) : (
                                <PlayCircle className="h-5 w-5 text-primary" />
                              )}
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="font-medium">
                                {enrollment.status === 'COMPLETED' 
                                  ? `Đã hoàn thành: ${enrollment.courseTitle || 'Khóa học'}`
                                  : `Đang học: ${enrollment.courseTitle || 'Khóa học'}`}
                              </p>
                              <p className="text-sm text-muted-foreground">
                                Tiến độ: {Math.round(enrollment.progress || 0)}%
                              </p>
                            </div>
                            <p className="text-sm text-muted-foreground whitespace-nowrap">
                              {timeAgo}
                            </p>
                          </div>
                        );
                      })}
                </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
        
        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-8">
          <Link href={ROUTES.STUDENT.CERTIFICATES}>
            <Card className="hover:shadow-lg transition-shadow cursor-pointer">
              <CardHeader>
                <Award className="h-8 w-8 text-accent mb-2" />
                <CardTitle>Chứng chỉ của tôi</CardTitle>
                <CardDescription>
                  Xem và tải về các chứng chỉ đã đạt được
                </CardDescription>
              </CardHeader>
            </Card>
          </Link>
          
          <Card className="hover:shadow-lg transition-shadow cursor-pointer">
            <CardHeader>
              <Calendar className="h-8 w-8 text-secondary mb-2" />
              <CardTitle>Lịch học</CardTitle>
              <CardDescription>
                Quản lý thời gian học tập hiệu quả
              </CardDescription>
            </CardHeader>
          </Card>
        </div>
      </div>
    </div>
  );
}


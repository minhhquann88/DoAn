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
import apiClient from '@/lib/api';
import type { Course } from '@/types';
import { CourseCard } from '@/components/course/CourseCard';
import { getMyCertificates, downloadCertificateByCode, type Certificate } from '@/services/paymentService';
import { useQuery } from '@tanstack/react-query';
import { Download, FileText } from 'lucide-react';
import { useUIStore } from '@/stores/uiStore';
import { studentService } from '@/services/studentService';

export default function StudentDashboard() {
  const { user } = useAuthStore();
  const { addToast } = useUIStore();
  const [courses, setCourses] = React.useState<Course[]>([]);
  const [isLoading, setIsLoading] = React.useState(true);
  
  // Fetch my courses from API
  React.useEffect(() => {
    const fetchCourses = async () => {
      try {
        console.log('Fetching my courses for dashboard...');
        const response = await apiClient.get<Course[]>('/v1/courses/my-courses');
        console.log('Dashboard - MY COURSES DATA:', response.data);
        
        if (Array.isArray(response.data)) {
          setCourses(response.data);
        } else {
          console.warn('Response is not an array:', response.data);
          setCourses([]);
        }
      } catch (error) {
        console.error('Error fetching courses:', error);
        setCourses([]);
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchCourses();
  }, []);
  
  // Fetch dashboard stats
  const { data: dashboardStats, isLoading: statsLoading } = useQuery({
    queryKey: ['student-dashboard-stats', user?.id],
    queryFn: () => studentService.getDashboardStats(),
    enabled: !!user?.id,
  });

  // Fetch certificates
  const { data: certificatesData } = useQuery({
    queryKey: ['my-certificates', user?.id],
    queryFn: async () => {
      if (!user?.id) throw new Error('User not found');
      return await getMyCertificates(user.id, { page: 0, size: 100 });
    },
    enabled: !!user?.id,
  });
  
  const certificates = certificatesData?.content || [];

  // Calculate stats from API or fallback to local calculation
  const activeCount = dashboardStats?.activeCourses ?? courses.filter(c => !c.enrollmentStatus || c.enrollmentStatus === 'IN_PROGRESS' || (c.enrollmentProgress ?? 0) < 100).length;
  const completedCount = certificates.length;
  const averageProgress = dashboardStats?.averageProgress ?? (courses.length > 0
    ? Math.round(courses.reduce((sum, c) => sum + (c.enrollmentProgress ?? 0), 0) / courses.length)
    : 0);
  const totalStudyHours = dashboardStats?.totalStudyHours ?? 0;
  const weeklyStudyHours = dashboardStats?.weeklyStudyHours ?? 0;
  const totalCertificates = dashboardStats?.totalCertificates ?? certificates.length;
  
  // Filter active courses (in-progress courses)
  const activeCourses = courses.filter(c => !c.enrollmentStatus || c.enrollmentStatus === 'IN_PROGRESS' || (c.enrollmentProgress ?? 0) < 100);
  
  const handleDownloadCertificate = async (certificate: Certificate) => {
    try {
      if (certificate.pdfUrl) {
        window.open(certificate.pdfUrl, '_blank');
      } else if (certificate.certificateCode) {
        const blob = await downloadCertificateByCode(certificate.certificateCode);
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `certificate-${certificate.certificateCode}.pdf`;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
        
        addToast({
          type: 'success',
          description: 'Đã tải chứng chỉ thành công!',
        });
      }
    } catch (error: any) {
      console.error('Error downloading certificate:', error);
      addToast({
        type: 'error',
        description: error.response?.data?.message || 'Không thể tải chứng chỉ',
      });
    }
  };
  
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('vi-VN', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };
  
  return (
    <div className="min-h-full bg-background">
      {/* Header */}
      <div className="border-b bg-card">
        <div className="container mx-auto px-4 py-6">
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
      <div className="container mx-auto px-4 py-6 space-y-6">
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
              <div className="text-2xl font-bold">
                {statsLoading ? '...' : activeCount}
              </div>
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
              <div className="text-2xl font-bold">
                {statsLoading ? '...' : totalStudyHours.toFixed(1)}
              </div>
              <p className="text-xs text-muted-foreground">
                {statsLoading ? 'Đang tải...' : (weeklyStudyHours > 0 ? `+${weeklyStudyHours.toFixed(1)} giờ tuần này` : 'Chưa có dữ liệu tuần này')}
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
              <div className="text-2xl font-bold">
                {statsLoading ? '...' : Math.round(averageProgress)}%
              </div>
              <p className="text-xs text-muted-foreground">
                {courses.length > 0 
                  ? `Từ ${courses.length} khóa học` 
                  : 'Chưa có dữ liệu'}
              </p>
            </CardContent>
          </Card>
          
          <Card className="cursor-pointer hover:shadow-lg transition-shadow" onClick={() => window.location.href = ROUTES.STUDENT.CERTIFICATES}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Chứng chỉ
              </CardTitle>
              <Award className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {statsLoading ? '...' : totalCertificates}
              </div>
              <p className="text-xs text-muted-foreground">
                {totalCertificates === 0 ? 'Chưa có chứng chỉ' : `${totalCertificates} chứng chỉ đã đạt được`}
              </p>
            </CardContent>
          </Card>
        </div>
        
        {/* Tabs */}
        <Tabs defaultValue="continue" className="space-y-6">
          <TabsList>
            <TabsTrigger value="continue">Tiếp tục học</TabsTrigger>
            <TabsTrigger value="all">Tất cả khóa học</TabsTrigger>
            <TabsTrigger value="certificates">Chứng chỉ của tôi</TabsTrigger>
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
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {activeCourses.map((course, index) => (
                  <CourseCard 
                    key={course.id} 
                    course={course} 
                    priority={index < 4} // Prioritize first 4 images for LCP
                  />
                ))}
              </div>
            )}
          </TabsContent>
          
          {/* All Courses */}
          <TabsContent value="all" className="space-y-6">
            {isLoading ? (
              <div className="text-center py-12 text-muted-foreground">Đang tải...</div>
            ) : courses.length === 0 ? (
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
                {courses.map((course, index) => (
                  <CourseCard 
                    key={course.id} 
                    course={course} 
                    priority={index < 4} // Prioritize first 4 images for LCP
                  />
                ))}
              </div>
            )}
          </TabsContent>
          
          {/* Certificates */}
          <TabsContent value="certificates" className="space-y-6">
            {certificates.length === 0 ? (
              <Card>
                <CardContent className="flex flex-col items-center justify-center py-16">
                  <Award className="h-16 w-16 text-muted-foreground mb-4" />
                  <h3 className="text-xl font-semibold mb-2">Chưa có chứng chỉ nào</h3>
                  <p className="text-muted-foreground mb-6 text-center max-w-md">
                    Hoàn thành các khóa học để nhận chứng chỉ. Chứng chỉ sẽ được cấp tự động khi bạn hoàn thành 100% khóa học.
                  </p>
                  <Button asChild>
                    <Link href={ROUTES.COURSES}>
                      Khám phá khóa học
                    </Link>
                  </Button>
                </CardContent>
              </Card>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {certificates.map((certificate) => (
                  <Card key={certificate.id} className="hover:shadow-lg transition-shadow">
                    <CardHeader>
                      <div className="flex items-start justify-between mb-2">
                        <div className="flex items-center gap-2">
                          <Award className="h-6 w-6 text-yellow-500" />
                          <CardTitle className="text-lg">Chứng chỉ</CardTitle>
                        </div>
                        <Badge 
                          variant={certificate.status === 'ACTIVE' ? 'default' : 'secondary'}
                        >
                          {certificate.status === 'ACTIVE' ? 'Hoạt động' : 'Đã thu hồi'}
                        </Badge>
                      </div>
                      <CardDescription className="text-base font-semibold text-foreground">
                        {certificate.courseName || 'Khóa học'}
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      {/* Certificate Info */}
                      <div className="space-y-2 text-sm">
                        <div className="flex items-center gap-2 text-muted-foreground">
                          <FileText className="h-4 w-4" />
                          <span className="font-mono text-xs">{certificate.certificateCode}</span>
                        </div>
                        <div className="flex items-center gap-2 text-muted-foreground">
                          <Calendar className="h-4 w-4" />
                          <span>Cấp ngày: {formatDate(certificate.issueDate || certificate.completionDate)}</span>
                        </div>
                        {certificate.score !== undefined && (
                          <div className="flex items-center gap-2 text-muted-foreground">
                            <BookOpen className="h-4 w-4" />
                            <span>Điểm số: {certificate.score}/100</span>
                          </div>
                        )}
                      </div>
                      
                      {/* Actions */}
                      <div className="flex gap-2 pt-2">
                        <Button
                          variant="outline"
                          className="flex-1"
                          onClick={() => handleDownloadCertificate(certificate)}
                        >
                          <Download className="h-4 w-4 mr-2" />
                          Tải về
                        </Button>
                        <Button
                          variant="outline"
                          asChild
                        >
                          <Link href={ROUTES.COURSE_DETAIL(certificate.courseId.toString())}>
                            <BookOpen className="h-4 w-4" />
                          </Link>
                        </Button>
                      </div>
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
                ) : courses.length === 0 ? (
                  <div className="text-center py-8">
                    <BookOpen className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                    <p className="text-muted-foreground mb-4">Chưa có hoạt động nào</p>
                    <Button asChild>
                      <Link href={ROUTES.COURSES}>Khám phá khóa học</Link>
                    </Button>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {courses
                      .sort((a, b) => {
                        // Sort by createdAt (most recent first)
                        const dateA = a.createdAt ? new Date(a.createdAt).getTime() : 0;
                        const dateB = b.createdAt ? new Date(b.createdAt).getTime() : 0;
                        return dateB - dateA;
                      })
                      .slice(0, 10)
                      .map((course) => {
                        const timeAgo = course.createdAt 
                          ? new Date(course.createdAt).toLocaleDateString('vi-VN', { 
                              day: 'numeric', 
                              month: 'short',
                              year: 'numeric'
                            })
                          : '';
                        
                        return (
                          <div 
                            key={course.id}
                            className="flex items-start gap-4 p-4 rounded-lg border hover:bg-muted/50 transition-colors cursor-pointer"
                            onClick={() => window.location.href = ROUTES.LEARN(course.id.toString())}
                          >
                            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10">
                              <PlayCircle className="h-5 w-5 text-primary" />
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="font-medium">
                                Đang học: {course.title}
                              </p>
                              <p className="text-sm text-muted-foreground">
                                {course.instructor?.fullName || 'Giảng viên'}
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
        <div className="grid grid-cols-1 md:grid-cols-1 gap-6 mt-8">
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
        </div>
      </div>
    </div>
  );
}


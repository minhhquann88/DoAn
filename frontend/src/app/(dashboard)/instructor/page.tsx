'use client';

import React from 'react';
import Link from 'next/link';
import { 
  BookOpen, 
  Users, 
  DollarSign, 
  TrendingUp,
  Plus,
  Eye,
  Edit,
  BarChart3,
  Clock,
  Star,
  Award,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Skeleton } from '@/components/ui/skeleton';
import { useAuthStore } from '@/stores/authStore';
import { ROUTES } from '@/lib/constants';
import { useQuery } from '@tanstack/react-query';
import apiClient from '@/lib/api';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  LineChart,
  Line,
} from 'recharts';

interface InstructorDashboardStats {
  totalCourses: number;
  totalStudents: number;
  totalEarnings: number;
  averageRating: number;
}

interface InstructorCourse {
  id: number;
  title: string;
  description: string;
  price: number;
  imageUrl: string;
  studentsCount: number;
  isPublished: boolean;
  status: string;
  createdAt: string;
  updatedAt: string;
}

interface ChartData {
  earnings: Array<{ month: string; value: number }>;
  enrollments: Array<{ month: string; value: number }>;
}

export default function InstructorDashboard() {
  const { user } = useAuthStore();

  // Fetch dashboard stats
  const { data: stats, isLoading: isLoadingStats } = useQuery<InstructorDashboardStats>({
    queryKey: ['instructor-dashboard-stats'],
    queryFn: async () => {
      const response = await apiClient.get<InstructorDashboardStats>('/instructor/stats');
      return response.data;
    },
  });

  // Fetch chart data
  const { data: chartData, isLoading: isLoadingCharts } = useQuery<ChartData>({
    queryKey: ['instructor-dashboard-charts'],
    queryFn: async () => {
      const response = await apiClient.get<ChartData>('/instructor/dashboard/charts');
      return response.data;
    },
  });

  // Fetch courses
  const { data: courses, isLoading: isLoadingCourses } = useQuery<InstructorCourse[]>({
    queryKey: ['instructor-dashboard-courses'],
    queryFn: async () => {
      const response = await apiClient.get<InstructorCourse[]>('/instructor/courses');
      return response.data;
    },
  });

  // Prepare chart data
  const revenueData = chartData?.earnings?.map(item => ({
    month: item.month,
    revenue: item.value,
  })) || [];

  const enrollmentData = chartData?.enrollments?.map(item => ({
    month: item.month,
    enrollments: item.value,
  })) || [];

  const isLoading = isLoadingStats || isLoadingCharts || isLoadingCourses;


  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
          <p className="text-muted-foreground">
            Chào mừng trở lại, {user?.fullName || 'Giảng viên'}!
          </p>
        </div>
        <Link href={ROUTES.INSTRUCTOR.CREATE_COURSE}>
          <Button>
            <Plus className="mr-2 h-4 w-4" />
            Tạo khóa học mới
          </Button>
        </Link>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Tổng khóa học</CardTitle>
            <BookOpen className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <Skeleton className="h-8 w-16" />
            ) : (
              <>
                <div className="text-2xl font-bold">{stats?.totalCourses || 0}</div>
                <p className="text-xs text-muted-foreground">
                  {(stats?.totalCourses || 0) > 0 ? `${stats.totalCourses} khóa học đã tạo` : 'Chưa có khóa học'}
                </p>
              </>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Tổng học viên</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <Skeleton className="h-8 w-16" />
            ) : (
              <>
                <div className="text-2xl font-bold">{stats?.totalStudents || 0}</div>
                <p className="text-xs text-muted-foreground">
                  {(stats?.totalStudents || 0) > 0 ? `${stats.totalStudents} học viên đã đăng ký` : 'Chưa có học viên'}
                </p>
              </>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Tổng doanh thu</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <Skeleton className="h-8 w-32" />
            ) : (
              <>
                <div className="text-2xl font-bold">
                  {(stats?.totalEarnings || 0).toLocaleString('vi-VN')} ₫
                </div>
                <p className="text-xs text-muted-foreground">
                  Từ tất cả các khóa học
                </p>
              </>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Đánh giá trung bình</CardTitle>
            <Star className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <Skeleton className="h-8 w-16" />
            ) : (
              <>
                <div className="text-2xl font-bold">{(stats?.averageRating || 0).toFixed(1)}</div>
                <p className="text-xs text-muted-foreground">
                  {(stats?.averageRating || 0) > 0 ? 'Từ học viên' : 'Chưa có đánh giá'}
                </p>
              </>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Charts */}
      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Doanh thu 6 tháng gần nhất</CardTitle>
            <CardDescription>Biểu đồ doanh thu theo tháng</CardDescription>
          </CardHeader>
          <CardContent>
            {isLoadingCharts ? (
              <Skeleton className="h-[300px] w-full" />
            ) : revenueData.length === 0 ? (
              <div className="h-[300px] flex items-center justify-center text-muted-foreground">
                Chưa có dữ liệu doanh thu
              </div>
            ) : (
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={revenueData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" />
                  <YAxis />
                  <Tooltip formatter={(value) => `${Number(value).toLocaleString('vi-VN')} ₫`} />
                  <Bar dataKey="revenue" fill="#8884d8" />
                </BarChart>
              </ResponsiveContainer>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Lượt đăng ký 6 tháng gần nhất</CardTitle>
            <CardDescription>Biểu đồ số lượng đăng ký theo tháng</CardDescription>
          </CardHeader>
          <CardContent>
            {isLoadingCharts ? (
              <Skeleton className="h-[300px] w-full" />
            ) : enrollmentData.length === 0 ? (
              <div className="h-[300px] flex items-center justify-center text-muted-foreground">
                Chưa có dữ liệu đăng ký
              </div>
            ) : (
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={enrollmentData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" />
                  <YAxis />
                  <Tooltip />
                  <Line type="monotone" dataKey="enrollments" stroke="#82ca9d" strokeWidth={2} />
                </LineChart>
              </ResponsiveContainer>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Recent Courses */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Khóa học của tôi</CardTitle>
              <CardDescription>Danh sách các khóa học bạn đã tạo</CardDescription>
            </div>
            <Link href={ROUTES.INSTRUCTOR.COURSES}>
              <Button variant="outline" size="sm">
                Xem tất cả
              </Button>
            </Link>
          </div>
        </CardHeader>
        <CardContent>
          {isLoadingCourses ? (
            <div className="space-y-4">
              {[1, 2, 3].map((i) => (
                <Skeleton key={i} className="h-20 w-full" />
              ))}
            </div>
          ) : !courses || courses.length === 0 ? (
            <div className="text-center py-8">
              <BookOpen className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
              <p className="text-muted-foreground mb-4">Bạn chưa có khóa học nào</p>
              <Link href={ROUTES.INSTRUCTOR.CREATE_COURSE}>
                <Button>
                  <Plus className="mr-2 h-4 w-4" />
                  Tạo khóa học đầu tiên
                </Button>
              </Link>
            </div>
          ) : (
            <div className="space-y-4">
              {courses.slice(0, 5).map((course) => (
                <div
                  key={course.id}
                  className="flex items-center justify-between p-4 border rounded-lg hover:bg-accent transition-colors"
                >
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <h3 className="font-semibold">{course.title}</h3>
                      <Badge variant={course.status === 'PUBLISHED' ? 'default' : 'secondary'}>
                        {course.status === 'PUBLISHED' ? 'Đã xuất bản' : course.status === 'DRAFT' ? 'Bản nháp' : course.status}
                      </Badge>
                    </div>
                    <div className="flex items-center gap-4 text-sm text-muted-foreground">
                      <span className="flex items-center gap-1">
                        <Users className="h-3 w-3" />
                        {course.studentsCount || 0} học viên
                      </span>
                      <span className="flex items-center gap-1">
                        <DollarSign className="h-3 w-3" />
                        {(course.price || 0).toLocaleString('vi-VN')} ₫
                      </span>
                      <span className="flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        {course.updatedAt ? new Date(course.updatedAt).toLocaleDateString('vi-VN') : 'N/A'}
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Link href={`${ROUTES.INSTRUCTOR.COURSES}/${course.id}/analytics`}>
                      <Button variant="outline" size="sm">
                        <BarChart3 className="h-4 w-4" />
                      </Button>
                    </Link>
                    <Link href={ROUTES.INSTRUCTOR.EDIT_COURSE(course.id.toString())}>
                      <Button variant="outline" size="sm">
                        <Edit className="h-4 w-4" />
                      </Button>
                    </Link>
                    <Link href={`/courses/${course.id}`}>
                      <Button variant="outline" size="sm">
                        <Eye className="h-4 w-4" />
                      </Button>
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

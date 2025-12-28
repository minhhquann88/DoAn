'use client';

import React from 'react';
import { useParams, useRouter } from 'next/navigation';
import { ArrowLeft, BarChart3, TrendingUp, Users, DollarSign } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { useCourse } from '@/hooks/useCourses';
import { useQuery } from '@tanstack/react-query';
import apiClient from '@/lib/api';
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from 'recharts';

interface CourseAnalyticsResponse {
  courseId: number;
  courseTitle: string;
  totalEnrollments: number;
  totalRevenue: number;
  completionRate: number;
  averageRating: number | null;
  monthlyEnrollments: Array<{ month: string; enrollments: number }>;
  monthlyRevenue: Array<{ month: string; revenue: number }>;
}

export default function CourseAnalyticsPage() {
  const params = useParams();
  const router = useRouter();
  const courseId = params.id as string;
  const { course, isLoading } = useCourse(courseId);

  // Fetch analytics data from API
  const { data: analytics, isLoading: isLoadingAnalytics } = useQuery<CourseAnalyticsResponse>({
    queryKey: ['course-analytics', courseId],
    queryFn: async () => {
      const response = await apiClient.get<CourseAnalyticsResponse>(`/v1/courses/${courseId}/analytics`);
      return response.data;
    },
    enabled: !!courseId,
  });

  // Prepare chart data
  const enrollmentData = analytics?.monthlyEnrollments || [];
  const revenueData = analytics?.monthlyRevenue || [];

  return (
    <div className="p-6 space-y-6">
        {/* Header */}
        <div className="flex items-center space-x-4">
          <Button variant="ghost" size="icon" onClick={() => router.back()}>
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div>
            <h1 className="text-3xl font-bold font-poppins">Phân tích khóa học</h1>
            <p className="text-muted-foreground mt-1">
              {isLoading ? 'Đang tải...' : course?.title || 'Khóa học'}
            </p>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Tổng học viên</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              {isLoadingAnalytics ? (
                <Skeleton className="h-8 w-20" />
              ) : (
                <>
                  <div className="text-2xl font-bold">{analytics?.totalEnrollments || 0}</div>
                  <p className="text-xs text-muted-foreground mt-1">Học viên đã đăng ký</p>
                </>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Doanh thu</CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              {isLoadingAnalytics ? (
                <Skeleton className="h-8 w-32" />
              ) : (
                <>
                  <div className="text-2xl font-bold">
                    {(analytics?.totalRevenue || 0).toLocaleString('vi-VN')} đ
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">Tổng doanh thu</p>
                </>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Tỷ lệ hoàn thành</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              {isLoadingAnalytics ? (
                <Skeleton className="h-8 w-16" />
              ) : (
                <>
                  <div className="text-2xl font-bold">
                    {analytics?.completionRate ? `${analytics.completionRate.toFixed(1)}%` : '0%'}
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">Học viên hoàn thành</p>
                </>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Đánh giá</CardTitle>
              <BarChart3 className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              {isLoadingAnalytics ? (
                <Skeleton className="h-8 w-16" />
              ) : (
                <>
                  <div className="text-2xl font-bold">
                    {analytics?.averageRating ? analytics.averageRating.toFixed(1) : 'N/A'}
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">Trung bình 5 sao</p>
                </>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Đăng ký theo tháng</CardTitle>
              <CardDescription>Số lượng học viên đăng ký mới</CardDescription>
            </CardHeader>
            <CardContent>
              {isLoadingAnalytics ? (
                <Skeleton className="h-[300px] w-full" />
              ) : enrollmentData.length === 0 ? (
                <div className="h-[300px] flex items-center justify-center text-muted-foreground">
                  Chưa có dữ liệu đăng ký
                </div>
              ) : (
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={enrollmentData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="month" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Bar dataKey="enrollments" fill="#8884d8" name="Số đăng ký" />
                  </BarChart>
                </ResponsiveContainer>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Doanh thu theo tháng</CardTitle>
              <CardDescription>Thu nhập từ khóa học</CardDescription>
            </CardHeader>
            <CardContent>
              {isLoadingAnalytics ? (
                <Skeleton className="h-[300px] w-full" />
              ) : revenueData.length === 0 ? (
                <div className="h-[300px] flex items-center justify-center text-muted-foreground">
                  Chưa có dữ liệu doanh thu
                </div>
              ) : (
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={revenueData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="month" />
                    <YAxis />
                    <Tooltip formatter={(value: number) => `${value.toLocaleString('vi-VN')} đ`} />
                    <Legend />
                    <Line 
                      type="monotone" 
                      dataKey="revenue" 
                      stroke="#82ca9d" 
                      name="Doanh thu"
                      strokeWidth={2}
                    />
                  </LineChart>
                </ResponsiveContainer>
              )}
            </CardContent>
          </Card>
        </div>
    </div>
  );
}


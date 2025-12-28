'use client';

import React from 'react';
import { 
  Users, 
  BookOpen, 
  DollarSign,
  CreditCard,
  TrendingUp,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useQuery } from '@tanstack/react-query';
import { adminService } from '@/services/adminService';
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';
import { formatCurrency } from '@/lib/utils';

export default function AdminDashboard() {
  // Fetch summary stats
  const { data: summaryStats, isLoading: statsLoading } = useQuery({
    queryKey: ['admin-summary-stats'],
    queryFn: () => adminService.getSummaryStats(),
  });

  // Fetch revenue chart data
  const { data: revenueChartData, isLoading: chartLoading } = useQuery({
    queryKey: ['admin-revenue-chart'],
    queryFn: () => adminService.getRevenueChart(),
  });

  // Fetch top selling courses
  const { data: topCourses, isLoading: topCoursesLoading } = useQuery({
    queryKey: ['admin-top-courses'],
    queryFn: () => adminService.getTopSellingCourses(),
  });

  const isLoading = statsLoading || chartLoading || topCoursesLoading;

  // Format revenue chart data for Recharts
  const chartData = React.useMemo(() => {
    if (!revenueChartData) return [];
    return revenueChartData.map(item => ({
      month: item.monthName,
      revenue: item.revenue,
    }));
  }, [revenueChartData]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Đang tải dữ liệu...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Dashboard</h1>
        <p className="text-muted-foreground">Tổng quan hệ thống</p>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Tổng số User</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{summaryStats?.totalUsers || 0}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Tổng số Khóa học</CardTitle>
            <BookOpen className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{summaryStats?.totalCourses || 0}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Tổng Doanh thu</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {formatCurrency(summaryStats?.totalRevenue || 0)}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Giao dịch tháng này</CardTitle>
            <CreditCard className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{summaryStats?.monthlyTransactions || 0}</div>
          </CardContent>
        </Card>
      </div>

      {/* Charts Row */}
      <div className="grid gap-4 md:grid-cols-2">
        {/* Revenue Chart */}
        <Card>
          <CardHeader>
            <CardTitle>Doanh thu theo tháng (12 tháng gần nhất)</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip formatter={(value: number) => formatCurrency(value)} />
                <Legend />
                <Line 
                  type="monotone" 
                  dataKey="revenue" 
                  stroke="#8884d8" 
                  name="Doanh thu"
                  strokeWidth={2}
                />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Top Selling Courses */}
        <Card>
          <CardHeader>
            <CardTitle>Top 5 khóa học bán chạy nhất</CardTitle>
          </CardHeader>
          <CardContent>
            {topCourses && topCourses.length > 0 ? (
              <div className="space-y-4">
                {topCourses.map((course, index) => (
                  <div key={course.courseId} className="flex items-center justify-between p-3 border rounded-lg">
                    <div className="flex items-center gap-3">
                      <div className="flex items-center justify-center w-8 h-8 rounded-full bg-primary text-primary-foreground font-bold">
                        {index + 1}
                      </div>
                      <div>
                        <p className="font-medium">{course.courseTitle}</p>
                        <p className="text-sm text-muted-foreground">
                          {course.instructorName || 'N/A'}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold">{course.totalSales} lượt mua</p>
                      {course.price !== undefined && (
                        <p className="text-sm text-muted-foreground">
                          {formatCurrency(course.price)}
                        </p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center text-muted-foreground py-8">
                Chưa có dữ liệu
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

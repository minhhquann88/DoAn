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
import { useAuthStore } from '@/stores/authStore';
import { ROUTES } from '@/lib/constants';
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

// Mock data
const revenueData = [
  { month: 'T1', revenue: 4000 },
  { month: 'T2', revenue: 3000 },
  { month: 'T3', revenue: 5000 },
  { month: 'T4', revenue: 4500 },
  { month: 'T5', revenue: 6000 },
  { month: 'T6', revenue: 5500 },
];

const enrollmentData = [
  { month: 'T1', enrollments: 65 },
  { month: 'T2', enrollments: 59 },
  { month: 'T3', enrollments: 80 },
  { month: 'T4', enrollments: 81 },
  { month: 'T5', enrollments: 95 },
  { month: 'T6', enrollments: 88 },
];

const mockCourses = [
  {
    id: 1,
    title: 'Next.js 14 Complete Course',
    students: 1245,
    revenue: 24900000,
    rating: 4.8,
    reviews: 156,
    status: 'PUBLISHED',
    lastUpdated: '2024-01-15',
  },
  {
    id: 2,
    title: 'TypeScript Advanced Patterns',
    students: 856,
    revenue: 17120000,
    rating: 4.6,
    reviews: 98,
    status: 'PUBLISHED',
    lastUpdated: '2024-01-10',
  },
  {
    id: 3,
    title: 'React Performance Optimization',
    students: 0,
    revenue: 0,
    rating: 0,
    reviews: 0,
    status: 'DRAFT',
    lastUpdated: '2024-01-05',
  },
];

export default function InstructorDashboard() {
  const { user } = useAuthStore();
  
  const totalStudents = mockCourses.reduce((sum, course) => sum + course.students, 0);
  const totalRevenue = mockCourses.reduce((sum, course) => sum + course.revenue, 0);
  const averageRating = mockCourses
    .filter(c => c.rating > 0)
    .reduce((sum, c) => sum + c.rating, 0) / mockCourses.filter(c => c.rating > 0).length;
  
  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="border-b bg-card">
        <div className="container mx-auto px-4 py-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold font-poppins mb-2">
                Instructor Dashboard
              </h1>
              <p className="text-muted-foreground">
                Quản lý khóa học và theo dõi hiệu suất giảng dạy
              </p>
            </div>
            
            <Button asChild size="lg">
              <Link href={ROUTES.INSTRUCTOR_CREATE_COURSE}>
                <Plus className="h-4 w-4 mr-2" />
                Tạo khóa học mới
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
                Tổng khóa học
              </CardTitle>
              <BookOpen className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{mockCourses.length}</div>
              <p className="text-xs text-muted-foreground">
                {mockCourses.filter(c => c.status === 'PUBLISHED').length} đã xuất bản
              </p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Tổng học viên
              </CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{totalStudents.toLocaleString()}</div>
              <p className="text-xs text-muted-foreground">
                +180 tháng này
              </p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Doanh thu
              </CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {(totalRevenue / 1000000).toFixed(1)}M
              </div>
              <p className="text-xs text-muted-foreground">
                +12% so với tháng trước
              </p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Đánh giá TB
              </CardTitle>
              <Star className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{averageRating.toFixed(1)}</div>
              <p className="text-xs text-muted-foreground">
                254 đánh giá tổng
              </p>
            </CardContent>
          </Card>
        </div>
        
        {/* Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          <Card>
            <CardHeader>
              <CardTitle>Doanh thu 6 tháng</CardTitle>
              <CardDescription>Biểu đồ doanh thu theo tháng</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={revenueData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="revenue" fill="hsl(var(--primary))" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader>
              <CardTitle>Số lượng học viên</CardTitle>
              <CardDescription>Biểu đồ đăng ký theo tháng</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={enrollmentData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" />
                  <YAxis />
                  <Tooltip />
                  <Line 
                    type="monotone" 
                    dataKey="enrollments" 
                    stroke="hsl(var(--accent))" 
                    strokeWidth={2}
                  />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </div>
        
        {/* Courses Management */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Quản lý khóa học</CardTitle>
                <CardDescription>Danh sách tất cả khóa học của bạn</CardDescription>
              </div>
              <Button variant="outline" asChild>
                <Link href={ROUTES.INSTRUCTOR_COURSES}>
                  Xem tất cả
                </Link>
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {mockCourses.map((course) => (
                <div 
                  key={course.id}
                  className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50 transition-colors"
                >
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="font-semibold line-clamp-1">{course.title}</h3>
                      <Badge variant={course.status === 'PUBLISHED' ? 'default' : 'secondary'}>
                        {course.status === 'PUBLISHED' ? 'Đã xuất bản' : 'Bản nháp'}
                      </Badge>
                    </div>
                    
                    <div className="flex items-center gap-6 text-sm text-muted-foreground">
                      <div className="flex items-center gap-1">
                        <Users className="h-4 w-4" />
                        <span>{course.students.toLocaleString()} học viên</span>
                      </div>
                      {course.rating > 0 && (
                        <div className="flex items-center gap-1">
                          <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                          <span>{course.rating} ({course.reviews} đánh giá)</span>
                        </div>
                      )}
                      <div className="flex items-center gap-1">
                        <DollarSign className="h-4 w-4" />
                        <span>{(course.revenue / 1000000).toFixed(1)}M</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Clock className="h-4 w-4" />
                        <span>{new Date(course.lastUpdated).toLocaleDateString('vi-VN')}</span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <Button variant="outline" size="sm" asChild>
                      <Link href={ROUTES.COURSE_DETAIL(course.id.toString())}>
                        <Eye className="h-4 w-4 mr-2" />
                        Xem
                      </Link>
                    </Button>
                    <Button variant="outline" size="sm" asChild>
                      <Link href={ROUTES.INSTRUCTOR_EDIT_COURSE(course.id.toString())}>
                        <Edit className="h-4 w-4 mr-2" />
                        Chỉnh sửa
                      </Link>
                    </Button>
                    <Button variant="outline" size="sm">
                      <BarChart3 className="h-4 w-4 mr-2" />
                      Thống kê
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
        
        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-8">
          <Link href={ROUTES.INSTRUCTOR_STUDENTS}>
            <Card className="hover:shadow-lg transition-shadow cursor-pointer h-full">
              <CardHeader>
                <Users className="h-8 w-8 text-primary mb-2" />
                <CardTitle>Quản lý học viên</CardTitle>
                <CardDescription>
                  Xem danh sách và tiến độ học viên
                </CardDescription>
              </CardHeader>
            </Card>
          </Link>
          
          <Link href={ROUTES.INSTRUCTOR_EARNINGS}>
            <Card className="hover:shadow-lg transition-shadow cursor-pointer h-full">
              <CardHeader>
                <DollarSign className="h-8 w-8 text-accent mb-2" />
                <CardTitle>Báo cáo doanh thu</CardTitle>
                <CardDescription>
                  Chi tiết thu nhập và thanh toán
                </CardDescription>
              </CardHeader>
            </Card>
          </Link>
          
          <Card className="hover:shadow-lg transition-shadow cursor-pointer">
            <CardHeader>
              <Award className="h-8 w-8 text-secondary mb-2" />
              <CardTitle>Chứng chỉ giảng viên</CardTitle>
              <CardDescription>
                Quản lý chứng chỉ và thành tích
              </CardDescription>
            </CardHeader>
          </Card>
        </div>
      </div>
    </div>
  );
}


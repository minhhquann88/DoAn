'use client';

import React from 'react';
import Link from 'next/link';
import { 
  BookOpen, 
  Users, 
  GraduationCap, 
  DollarSign,
  TrendingUp,
  TrendingDown,
  Clock,
  CheckCircle2,
  XCircle,
  AlertCircle,
  BarChart3,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ROUTES } from '@/lib/constants';
import {
  AreaChart,
  Area,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from 'recharts';

// Mock data
const revenueData = [
  { month: 'T1', revenue: 45000000, enrollments: 245 },
  { month: 'T2', revenue: 52000000, enrollments: 298 },
  { month: 'T3', revenue: 48000000, enrollments: 276 },
  { month: 'T4', revenue: 61000000, enrollments: 345 },
  { month: 'T5', revenue: 58000000, enrollments: 312 },
  { month: 'T6', revenue: 71000000, enrollments: 389 },
];

const categoryData = [
  { name: 'Lập trình', value: 45, color: 'hsl(var(--primary))' },
  { name: 'Design', value: 25, color: 'hsl(var(--secondary))' },
  { name: 'Marketing', value: 20, color: 'hsl(var(--accent))' },
  { name: 'Khác', value: 10, color: 'hsl(var(--muted))' },
];

const pendingCourses = [
  { id: 1, title: 'Advanced React Patterns', instructor: 'John Doe', submittedAt: '2024-01-18', status: 'PENDING' },
  { id: 2, title: 'Vue.js Masterclass', instructor: 'Jane Smith', submittedAt: '2024-01-17', status: 'PENDING' },
  { id: 3, title: 'Python for Data Science', instructor: 'Mike Johnson', submittedAt: '2024-01-16', status: 'PENDING' },
];

const recentActivities = [
  { id: 1, type: 'USER_REGISTERED', user: 'Nguyễn Văn A', time: '5 phút trước' },
  { id: 2, type: 'COURSE_PUBLISHED', course: 'Next.js 14 Complete', time: '12 phút trước' },
  { id: 3, type: 'PAYMENT_SUCCESS', amount: 499000, time: '23 phút trước' },
  { id: 4, type: 'INSTRUCTOR_JOINED', instructor: 'Trần Thị B', time: '1 giờ trước' },
];

export default function AdminDashboard() {
  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="border-b bg-card">
        <div className="container mx-auto px-4 py-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold font-poppins mb-2">
                Admin Dashboard
              </h1>
              <p className="text-muted-foreground">
                Tổng quan và quản lý hệ thống
              </p>
            </div>
            
            <div className="flex items-center gap-2">
              <Badge variant="outline" className="text-sm">
                <Clock className="h-3 w-3 mr-1" />
                Cập nhật: Vừa xong
              </Badge>
            </div>
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
              <div className="text-2xl font-bold">1,234</div>
              <div className="flex items-center text-xs text-muted-foreground mt-1">
                <TrendingUp className="h-3 w-3 mr-1 text-accent" />
                <span>+12% từ tháng trước</span>
              </div>
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
              <div className="text-2xl font-bold">45,231</div>
              <div className="flex items-center text-xs text-muted-foreground mt-1">
                <TrendingUp className="h-3 w-3 mr-1 text-accent" />
                <span>+18% từ tháng trước</span>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Giảng viên
              </CardTitle>
              <GraduationCap className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">892</div>
              <div className="flex items-center text-xs text-muted-foreground mt-1">
                <TrendingUp className="h-3 w-3 mr-1 text-accent" />
                <span>+5% từ tháng trước</span>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Doanh thu (VNĐ)
              </CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">335M</div>
              <div className="flex items-center text-xs text-muted-foreground mt-1">
                <TrendingDown className="h-3 w-3 mr-1 text-destructive" />
                <span>-3% từ tháng trước</span>
              </div>
            </CardContent>
          </Card>
        </div>
        
        {/* Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          <Card className="lg:col-span-2">
            <CardHeader>
              <CardTitle>Doanh thu & Đăng ký</CardTitle>
              <CardDescription>Biểu đồ 6 tháng gần đây</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <AreaChart data={revenueData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" />
                  <YAxis yAxisId="left" />
                  <YAxis yAxisId="right" orientation="right" />
                  <Tooltip />
                  <Legend />
                  <Area 
                    yAxisId="left"
                    type="monotone" 
                    dataKey="revenue" 
                    stroke="hsl(var(--primary))" 
                    fill="hsl(var(--primary))"
                    fillOpacity={0.6}
                    name="Doanh thu (VNĐ)"
                  />
                  <Area 
                    yAxisId="right"
                    type="monotone" 
                    dataKey="enrollments" 
                    stroke="hsl(var(--accent))" 
                    fill="hsl(var(--accent))"
                    fillOpacity={0.6}
                    name="Đăng ký"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader>
              <CardTitle>Khóa học theo danh mục</CardTitle>
              <CardDescription>Phân bố khóa học</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={categoryData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, value }) => `${name}: ${value}%`}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {categoryData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </div>
        
        {/* Tabs */}
        <Tabs defaultValue="pending" className="space-y-6">
          <TabsList>
            <TabsTrigger value="pending">
              Chờ duyệt ({pendingCourses.length})
            </TabsTrigger>
            <TabsTrigger value="activity">
              Hoạt động gần đây
            </TabsTrigger>
            <TabsTrigger value="reports">
              Báo cáo
            </TabsTrigger>
          </TabsList>
          
          {/* Pending Approvals */}
          <TabsContent value="pending">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle>Khóa học chờ duyệt</CardTitle>
                    <CardDescription>
                      Xem xét và phê duyệt khóa học mới
                    </CardDescription>
                  </div>
                  <Button variant="outline" asChild>
                    <Link href={ROUTES.ADMIN_COURSES}>
                      Xem tất cả
                    </Link>
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {pendingCourses.map((course) => (
                    <div 
                      key={course.id}
                      className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50 transition-colors"
                    >
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <h3 className="font-semibold">{course.title}</h3>
                          <Badge variant="secondary">
                            <AlertCircle className="h-3 w-3 mr-1" />
                            Chờ duyệt
                          </Badge>
                        </div>
                        <div className="flex items-center gap-4 text-sm text-muted-foreground">
                          <span>Giảng viên: {course.instructor}</span>
                          <span>•</span>
                          <span>{course.submittedAt}</span>
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-2">
                        <Button variant="outline" size="sm">
                          Xem chi tiết
                        </Button>
                        <Button size="sm" className="bg-accent">
                          <CheckCircle2 className="h-4 w-4 mr-2" />
                          Duyệt
                        </Button>
                        <Button variant="outline" size="sm">
                          <XCircle className="h-4 w-4 mr-2" />
                          Từ chối
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
          
          {/* Recent Activity */}
          <TabsContent value="activity">
            <Card>
              <CardHeader>
                <CardTitle>Hoạt động gần đây</CardTitle>
                <CardDescription>
                  Theo dõi các hoạt động trên hệ thống
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {recentActivities.map((activity) => (
                    <div 
                      key={activity.id}
                      className="flex items-start gap-4 p-4 border rounded-lg"
                    >
                      <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10">
                        {activity.type === 'USER_REGISTERED' && <Users className="h-5 w-5 text-primary" />}
                        {activity.type === 'COURSE_PUBLISHED' && <BookOpen className="h-5 w-5 text-accent" />}
                        {activity.type === 'PAYMENT_SUCCESS' && <DollarSign className="h-5 w-5 text-secondary" />}
                        {activity.type === 'INSTRUCTOR_JOINED' && <GraduationCap className="h-5 w-5 text-primary" />}
                      </div>
                      <div className="flex-1">
                        <p className="font-medium">
                          {activity.type === 'USER_REGISTERED' && `${activity.user} đã đăng ký`}
                          {activity.type === 'COURSE_PUBLISHED' && `Khóa học "${activity.course}" đã được xuất bản`}
                          {activity.type === 'PAYMENT_SUCCESS' && `Thanh toán ${activity.amount?.toLocaleString('vi-VN')} VNĐ thành công`}
                          {activity.type === 'INSTRUCTOR_JOINED' && `${activity.instructor} đã trở thành giảng viên`}
                        </p>
                        <p className="text-sm text-muted-foreground">{activity.time}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
          
          {/* Reports */}
          <TabsContent value="reports">
            <Card>
              <CardHeader>
                <CardTitle>Báo cáo hệ thống</CardTitle>
                <CardDescription>
                  Export và xem báo cáo chi tiết
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {[
                    { title: 'Báo cáo doanh thu', desc: 'Chi tiết doanh thu theo tháng' },
                    { title: 'Báo cáo người dùng', desc: 'Thống kê người dùng mới' },
                    { title: 'Báo cáo khóa học', desc: 'Phân tích hiệu suất khóa học' },
                    { title: 'Báo cáo thanh toán', desc: 'Lịch sử giao dịch' },
                  ].map((report, index) => (
                    <Card key={index} className="hover:shadow-lg transition-shadow cursor-pointer">
                      <CardContent className="p-6">
                        <h3 className="font-semibold mb-1">{report.title}</h3>
                        <p className="text-sm text-muted-foreground mb-4">{report.desc}</p>
                        <Button variant="outline" size="sm" className="w-full">
                          Xuất báo cáo
                        </Button>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
        
        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mt-8">
          <Link href={ROUTES.ADMIN_COURSES}>
            <Card className="hover:shadow-lg transition-shadow cursor-pointer h-full">
              <CardHeader>
                <BookOpen className="h-8 w-8 text-primary mb-2" />
                <CardTitle>Quản lý khóa học</CardTitle>
                <CardDescription>
                  1,234 khóa học
                </CardDescription>
              </CardHeader>
            </Card>
          </Link>
          
          <Link href={ROUTES.ADMIN_INSTRUCTORS}>
            <Card className="hover:shadow-lg transition-shadow cursor-pointer h-full">
              <CardHeader>
                <GraduationCap className="h-8 w-8 text-accent mb-2" />
                <CardTitle>Quản lý giảng viên</CardTitle>
                <CardDescription>
                  892 giảng viên
                </CardDescription>
              </CardHeader>
            </Card>
          </Link>
          
          <Link href={ROUTES.ADMIN_STUDENTS}>
            <Card className="hover:shadow-lg transition-shadow cursor-pointer h-full">
              <CardHeader>
                <Users className="h-8 w-8 text-secondary mb-2" />
                <CardTitle>Quản lý học viên</CardTitle>
                <CardDescription>
                  45,231 học viên
                </CardDescription>
              </CardHeader>
            </Card>
          </Link>
          
          <Link href={ROUTES.ADMIN_ANALYTICS}>
            <Card className="hover:shadow-lg transition-shadow cursor-pointer h-full">
              <CardHeader>
                <BarChart3 className="h-8 w-8 text-primary mb-2" />
                <CardTitle>Thống kê chi tiết</CardTitle>
                <CardDescription>
                  Xem báo cáo
                </CardDescription>
              </CardHeader>
            </Card>
          </Link>
        </div>
      </div>
    </div>
  );
}


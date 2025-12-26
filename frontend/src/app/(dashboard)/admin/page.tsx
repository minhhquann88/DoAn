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

export default function AdminDashboard() {
  const [revenueData, setRevenueData] = React.useState<Array<{ month: string; revenue: number; enrollments: number }>>([]);
  const [categoryData, setCategoryData] = React.useState<Array<{ name: string; value: number; color: string }>>([]);
  const [pendingCourses, setPendingCourses] = React.useState<Array<{ id: number; title: string; instructor: string; submittedAt: string; status: string }>>([]);
  const [recentActivities, setRecentActivities] = React.useState<Array<{ id: number; type: string; user?: string; course?: string; amount?: number; instructor?: string; time: string }>>([]);
  const [stats, setStats] = React.useState({
    totalCourses: 0,
    totalStudents: 0,
    totalInstructors: 0,
    totalRevenue: 0,
  });
  const [isLoading, setIsLoading] = React.useState(true);
  
  React.useEffect(() => {
    // TODO: Fetch data from API
    // const fetchData = async () => {
    //   try {
    //     const [statsRes, revenueRes, categoryRes, pendingRes, activityRes] = await Promise.all([
    //       // fetch all data
    //     ]);
    //     setStats(statsRes);
    //     setRevenueData(revenueRes);
    //     setCategoryData(categoryRes);
    //     setPendingCourses(pendingRes);
    //     setRecentActivities(activityRes);
    //   } catch (error) {
    //     console.error('Error fetching data:', error);
    //   } finally {
    //     setIsLoading(false);
    //   }
    // };
    // fetchData();
    setIsLoading(false);
  }, []);
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
              <div className="text-2xl font-bold">{stats.totalCourses.toLocaleString()}</div>
              <div className="flex items-center text-xs text-muted-foreground mt-1">
                <span>Tổng khóa học</span>
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
              <div className="text-2xl font-bold">{stats.totalStudents.toLocaleString()}</div>
              <div className="flex items-center text-xs text-muted-foreground mt-1">
                <span>Tổng học viên</span>
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
              <div className="text-2xl font-bold">{stats.totalInstructors.toLocaleString()}</div>
              <div className="flex items-center text-xs text-muted-foreground mt-1">
                <span>Tổng giảng viên</span>
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
              <div className="text-2xl font-bold">{(stats.totalRevenue / 1000000).toFixed(1)}M</div>
              <div className="flex items-center text-xs text-muted-foreground mt-1">
                <span>Tổng doanh thu</span>
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
                {isLoading ? (
                  <div className="text-center py-8 text-muted-foreground">Đang tải...</div>
                ) : pendingCourses.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">Không có khóa học nào chờ duyệt</div>
                ) : (
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
                )}
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
                {isLoading ? (
                  <div className="text-center py-8 text-muted-foreground">Đang tải...</div>
                ) : recentActivities.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">Chưa có hoạt động nào</div>
                ) : (
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
                )}
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
                  {stats.totalCourses.toLocaleString()} khóa học
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
                  {stats.totalInstructors.toLocaleString()} giảng viên
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
                  {stats.totalStudents.toLocaleString()} học viên
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


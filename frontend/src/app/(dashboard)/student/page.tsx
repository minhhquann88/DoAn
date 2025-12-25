'use client';

import React from 'react';
import Link from 'next/link';
import { 
  BookOpen, 
  Clock, 
  TrendingUp, 
  Award,
  PlayCircle,
  BarChart3,
  Calendar,
  Target,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useAuthStore } from '@/stores/authStore';
import { ROUTES } from '@/lib/constants';

// Mock data
const mockEnrolledCourses = [
  {
    id: 1,
    title: 'Next.js 14 Complete Course',
    thumbnail: null,
    instructor: 'John Doe',
    progress: 65,
    totalLessons: 48,
    completedLessons: 31,
    lastAccessed: '2024-01-15',
    category: 'Web Development',
  },
  {
    id: 2,
    title: 'TypeScript Advanced Patterns',
    thumbnail: null,
    instructor: 'Jane Smith',
    progress: 40,
    totalLessons: 32,
    completedLessons: 13,
    lastAccessed: '2024-01-14',
    category: 'Programming',
  },
  {
    id: 3,
    title: 'UI/UX Design Fundamentals',
    thumbnail: null,
    instructor: 'Mike Johnson',
    progress: 85,
    totalLessons: 24,
    completedLessons: 20,
    lastAccessed: '2024-01-13',
    category: 'Design',
  },
];

const mockRecentActivity = [
  {
    id: 1,
    type: 'LESSON_COMPLETED',
    title: 'Completed: Advanced React Patterns',
    course: 'Next.js 14 Complete Course',
    time: '2 hours ago',
  },
  {
    id: 3,
    type: 'CERTIFICATE_EARNED',
    title: 'Certificate earned',
    course: 'UI/UX Design Fundamentals',
    time: '3 days ago',
  },
];

export default function StudentDashboard() {
  const { user } = useAuthStore();
  
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
              <div className="text-2xl font-bold">3</div>
              <p className="text-xs text-muted-foreground">
                +1 từ tuần trước
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
              <div className="text-2xl font-bold">63%</div>
              <p className="text-xs text-muted-foreground">
                +12% từ tháng trước
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
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {mockEnrolledCourses
                .filter(course => course.progress > 0 && course.progress < 100)
                .map((course) => (
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
          </TabsContent>
          
          {/* All Courses */}
          <TabsContent value="all" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {mockEnrolledCourses.map((course) => (
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
                <div className="space-y-4">
                  {mockRecentActivity.map((activity) => (
                    <div 
                      key={activity.id}
                      className="flex items-start gap-4 p-4 rounded-lg border hover:bg-muted/50 transition-colors"
                    >
                      <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10">
                        {activity.type === 'LESSON_COMPLETED' && <PlayCircle className="h-5 w-5 text-primary" />}
                        {activity.type === 'CERTIFICATE_EARNED' && <Award className="h-5 w-5 text-secondary" />}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-medium">{activity.title}</p>
                        <p className="text-sm text-muted-foreground">{activity.course}</p>
                      </div>
                      <p className="text-sm text-muted-foreground whitespace-nowrap">
                        {activity.time}
                      </p>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
        
        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-8">
          <Card className="hover:shadow-lg transition-shadow cursor-pointer">
            <CardHeader>
              <BarChart3 className="h-8 w-8 text-primary mb-2" />
              <CardTitle>Xem báo cáo tiến độ</CardTitle>
              <CardDescription>
                Phân tích chi tiết về quá trình học tập
              </CardDescription>
            </CardHeader>
          </Card>
          
          <Card className="hover:shadow-lg transition-shadow cursor-pointer">
            <CardHeader>
              <Award className="h-8 w-8 text-accent mb-2" />
              <CardTitle>Chứng chỉ của tôi</CardTitle>
              <CardDescription>
                Xem và tải về các chứng chỉ đã đạt được
              </CardDescription>
            </CardHeader>
          </Card>
          
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


'use client';

import React from 'react';
import { 
  Users, 
  Search,
  GraduationCap,
  Calendar,
  TrendingUp,
  BookOpen
} from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Progress } from '@/components/ui/progress';
import { useAuthStore } from '@/stores/authStore';
import { useQuery } from '@tanstack/react-query';
import apiClient from '@/lib/api';

interface Student {
  enrollmentId: number;
  studentId: number;
  studentName: string;
  studentEmail: string;
  courseId: number;
  courseTitle: string;
  progress: number;
  enrolledAt: string;
  lastActive: string;
  status: string;
}

export default function InstructorStudentsPage() {
  const { user } = useAuthStore();
  const [searchQuery, setSearchQuery] = React.useState('');

  // Fetch students data from API
  const { data: students = [], isLoading } = useQuery<Student[]>({
    queryKey: ['instructor-students'],
    queryFn: async () => {
      const response = await apiClient.get<Student[]>('/instructor/students');
      return response.data;
    },
  });

  const filteredStudents = React.useMemo(() => {
    if (!searchQuery) return students;
    return students.filter(student =>
      student.studentName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      student.studentEmail.toLowerCase().includes(searchQuery.toLowerCase()) ||
      student.courseTitle.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [students, searchQuery]);

  // Calculate stats
  const totalStudents = students.length;
  const studyingCount = students.filter(s => s.progress > 0 && s.progress < 100).length;
  const completedCount = students.filter(s => s.progress === 100 || s.status === 'COMPLETED').length;
  const averageProgress = students.length > 0
    ? Math.round(students.reduce((acc, s) => acc + s.progress, 0) / students.length)
    : 0;

  const getProgressColor = (progress: number) => {
    if (progress >= 80) return 'bg-green-500';
    if (progress >= 50) return 'bg-blue-500';
    return 'bg-yellow-500';
  };

  return (
    <div className="p-6 space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold font-poppins">Học viên của tôi</h1>
          <p className="text-muted-foreground mt-1">
            Quản lý và theo dõi tiến độ học tập của học viên
          </p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="bg-card rounded-lg border p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Tổng học viên</p>
                {isLoading ? (
                  <Skeleton className="h-8 w-12 mt-1" />
                ) : (
                  <p className="text-2xl font-bold mt-1">{totalStudents}</p>
                )}
              </div>
              <Users className="h-8 w-8 text-primary" />
            </div>
          </div>
          <div className="bg-card rounded-lg border p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Đang học</p>
                {isLoading ? (
                  <Skeleton className="h-8 w-12 mt-1" />
                ) : (
                  <p className="text-2xl font-bold mt-1">{studyingCount}</p>
                )}
              </div>
              <BookOpen className="h-8 w-8 text-blue-500" />
            </div>
          </div>
          <div className="bg-card rounded-lg border p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Đã hoàn thành</p>
                {isLoading ? (
                  <Skeleton className="h-8 w-12 mt-1" />
                ) : (
                  <p className="text-2xl font-bold mt-1">{completedCount}</p>
                )}
              </div>
              <GraduationCap className="h-8 w-8 text-green-500" />
            </div>
          </div>
          <div className="bg-card rounded-lg border p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Tiến độ TB</p>
                {isLoading ? (
                  <Skeleton className="h-8 w-12 mt-1" />
                ) : (
                  <p className="text-2xl font-bold mt-1">{averageProgress}%</p>
                )}
              </div>
              <TrendingUp className="h-8 w-8 text-orange-500" />
            </div>
          </div>
        </div>

        {/* Search Bar */}
        <div className="flex items-center gap-4">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              type="search"
              placeholder="Tìm kiếm học viên..."
              className="pl-10"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <div className="text-sm text-muted-foreground">
            {filteredStudents.length} học viên
          </div>
        </div>

        {/* Students Table */}
        <div className="bg-card rounded-lg border">
          {isLoading ? (
            <div className="p-6 space-y-4">
              {[...Array(5)].map((_, i) => (
                <div key={i} className="flex items-center space-x-4">
                  <Skeleton className="h-12 w-12 rounded-full" />
                  <div className="flex-1 space-y-2">
                    <Skeleton className="h-4 w-3/4" />
                    <Skeleton className="h-3 w-1/2" />
                  </div>
                  <Skeleton className="h-8 w-24" />
                </div>
              ))}
            </div>
          ) : filteredStudents.length === 0 ? (
            <div className="p-12 text-center">
              <Users className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">Chưa có học viên nào</h3>
              <p className="text-muted-foreground">
                {searchQuery ? 'Không tìm thấy học viên nào phù hợp.' : 'Học viên sẽ xuất hiện ở đây khi họ đăng ký khóa học của bạn.'}
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="border-b">
                  <tr>
                    <th className="text-left p-4 font-semibold">Học viên</th>
                    <th className="text-left p-4 font-semibold">Khóa học</th>
                    <th className="text-left p-4 font-semibold">Tiến độ</th>
                    <th className="text-left p-4 font-semibold">Ngày tham gia</th>
                    <th className="text-left p-4 font-semibold">Hoạt động gần nhất</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredStudents.map((student) => (
                    <tr key={student.enrollmentId} className="border-b hover:bg-muted/50 transition-colors">
                      <td className="p-4">
                        <div className="flex items-center space-x-3">
                          <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                            <span className="text-sm font-semibold text-primary">
                              {student.studentName.charAt(0).toUpperCase()}
                            </span>
                          </div>
                          <div>
                            <p className="font-semibold">{student.studentName}</p>
                            <p className="text-sm text-muted-foreground">{student.studentEmail}</p>
                          </div>
                        </div>
                      </td>
                      <td className="p-4">
                        <p className="font-medium">{student.courseTitle}</p>
                      </td>
                      <td className="p-4">
                        <div className="space-y-2 min-w-[200px]">
                          <div className="flex items-center justify-between text-sm">
                            <span>{Math.round(student.progress)}%</span>
                            {(student.progress === 100 || student.status === 'COMPLETED') && (
                              <Badge variant="default" className="text-xs">Hoàn thành</Badge>
                            )}
                          </div>
                          <Progress 
                            value={student.progress} 
                            className="h-2"
                          />
                        </div>
                      </td>
                      <td className="p-4">
                        <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                          <Calendar className="h-4 w-4" />
                          <span>{student.enrolledAt ? new Date(student.enrolledAt).toLocaleDateString('vi-VN') : 'N/A'}</span>
                        </div>
                      </td>
                      <td className="p-4">
                        <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                          <Calendar className="h-4 w-4" />
                          <span>{student.lastActive ? new Date(student.lastActive).toLocaleDateString('vi-VN') : 'N/A'}</span>
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


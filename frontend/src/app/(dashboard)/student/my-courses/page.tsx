'use client';

import React from 'react';
import Link from 'next/link';
import { Search, Filter, Grid3x3, List, BookOpen, PlayCircle, Clock, CheckCircle2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ROUTES } from '@/lib/constants';

export default function MyCoursesPage() {
  const [viewMode, setViewMode] = React.useState<'grid' | 'list'>('grid');
  const [searchQuery, setSearchQuery] = React.useState('');
  const [sortBy, setSortBy] = React.useState('recent');
  const [courses, setCourses] = React.useState<Array<{
    id: number;
    title: string;
    thumbnail: string | null;
    instructor: string;
    progress: number;
    totalLessons: number;
    completedLessons: number;
    enrolledAt: string;
    lastAccessed: string;
    status: string;
    category: string;
  }>>([]);
  const [isLoading, setIsLoading] = React.useState(true);
  
  React.useEffect(() => {
    // TODO: Fetch data from API
    // const fetchCourses = async () => {
    //   try {
    //     const response = await fetch('/api/enrollments/my-courses');
    //     const data = await response.json();
    //     setCourses(data);
    //   } catch (error) {
    //     console.error('Error fetching courses:', error);
    //   } finally {
    //     setIsLoading(false);
    //   }
    // };
    // fetchCourses();
    setIsLoading(false);
  }, []);
  
  // Filter courses by status
  const inProgressCourses = courses.filter(c => c.status === 'IN_PROGRESS');
  const completedCourses = courses.filter(c => c.status === 'COMPLETED');
  
  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="border-b bg-card">
        <div className="container mx-auto px-4 py-8">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-3xl font-bold font-poppins mb-2">
                Khóa học của tôi
              </h1>
              <p className="text-muted-foreground">
                Quản lý và theo dõi tiến độ học tập
              </p>
            </div>
            
            <Button asChild>
              <Link href={ROUTES.COURSES}>
                <BookOpen className="h-4 w-4 mr-2" />
                Khám phá thêm
              </Link>
            </Button>
          </div>
          
          {/* Filters */}
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Tìm kiếm khóa học..."
                className="pl-10"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            
            <Select value={sortBy} onValueChange={setSortBy}>
              <SelectTrigger className="w-full sm:w-48">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="recent">Gần đây nhất</SelectItem>
                <SelectItem value="progress">Tiến độ</SelectItem>
                <SelectItem value="title">Tên A-Z</SelectItem>
                <SelectItem value="enrolled">Ngày đăng ký</SelectItem>
              </SelectContent>
            </Select>
            
            <div className="flex items-center gap-2">
              <Button
                variant={viewMode === 'grid' ? 'default' : 'outline'}
                size="icon"
                onClick={() => setViewMode('grid')}
              >
                <Grid3x3 className="h-4 w-4" />
              </Button>
              <Button
                variant={viewMode === 'list' ? 'default' : 'outline'}
                size="icon"
                onClick={() => setViewMode('list')}
              >
                <List className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      </div>
      
      {/* Content */}
      <div className="container mx-auto px-4 py-8">
        <Tabs defaultValue="all" className="space-y-6">
          <TabsList>
            <TabsTrigger value="all">
              Tất cả ({courses.length})
            </TabsTrigger>
            <TabsTrigger value="in-progress">
              Đang học ({inProgressCourses.length})
            </TabsTrigger>
            <TabsTrigger value="completed">
              Hoàn thành ({completedCourses.length})
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="all">
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
            ) : viewMode === 'grid' ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {courses.map((course) => (
                  <Card key={course.id} className="overflow-hidden hover:shadow-lg transition-shadow">
                    <div className="aspect-video bg-gradient-to-br from-primary/20 to-secondary/20 flex items-center justify-center">
                      <BookOpen className="h-16 w-16 text-primary/50" />
                    </div>
                    <CardHeader>
                      <div className="flex items-start justify-between gap-2 mb-2">
                        <Badge variant={course.status === 'COMPLETED' ? 'default' : 'secondary'}>
                          {course.status === 'COMPLETED' ? 'Hoàn thành' : 'Đang học'}
                        </Badge>
                        <Badge variant="outline">{course.category}</Badge>
                      </div>
                      <CardTitle className="line-clamp-2">{course.title}</CardTitle>
                      <CardDescription>{course.instructor}</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="space-y-2">
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-muted-foreground">Tiến độ</span>
                          <span className="font-medium">{course.progress}%</span>
                        </div>
                        <Progress value={course.progress} />
                        <p className="text-xs text-muted-foreground">
                          {course.completedLessons} / {course.totalLessons} bài học
                        </p>
                      </div>
                      
                      <div className="flex items-center gap-2">
                        <Button asChild className="flex-1">
                          <Link href={ROUTES.LEARN(course.id.toString())}>
                            <PlayCircle className="h-4 w-4 mr-2" />
                            {course.status === 'COMPLETED' ? 'Ôn tập' : 'Tiếp tục'}
                          </Link>
                        </Button>
                        <Button variant="outline" asChild>
                          <Link href={ROUTES.COURSE_DETAIL(course.id.toString())}>
                            Chi tiết
                          </Link>
                        </Button>
                      </div>
                      
                      <div className="flex items-center gap-2 text-xs text-muted-foreground">
                        <Clock className="h-3 w-3" />
                        <span>Truy cập gần nhất: {new Date(course.lastAccessed).toLocaleDateString('vi-VN')}</span>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : (
              <div className="space-y-4">
                {courses.map((course) => (
                  <Card key={course.id} className="hover:shadow-lg transition-shadow">
                    <CardContent className="p-6">
                      <div className="flex items-center gap-6">
                        <div className="w-40 aspect-video bg-gradient-to-br from-primary/20 to-secondary/20 rounded-lg flex items-center justify-center flex-shrink-0">
                          <BookOpen className="h-12 w-12 text-primary/50" />
                        </div>
                        
                        <div className="flex-1 min-w-0">
                          <div className="flex items-start justify-between gap-4 mb-2">
                            <div>
                              <h3 className="font-semibold text-lg mb-1">{course.title}</h3>
                              <p className="text-sm text-muted-foreground">{course.instructor}</p>
                            </div>
                            <div className="flex items-center gap-2">
                              <Badge variant={course.status === 'COMPLETED' ? 'default' : 'secondary'}>
                                {course.status === 'COMPLETED' ? 'Hoàn thành' : 'Đang học'}
                              </Badge>
                            </div>
                          </div>
                          
                          <div className="space-y-2 mb-4">
                            <div className="flex items-center justify-between text-sm">
                              <span className="text-muted-foreground">Tiến độ</span>
                              <span className="font-medium">{course.progress}%</span>
                            </div>
                            <Progress value={course.progress} className="h-2" />
                            <p className="text-xs text-muted-foreground">
                              {course.completedLessons} / {course.totalLessons} bài học hoàn thành
                            </p>
                          </div>
                          
                          <div className="flex items-center justify-between">
                            <div className="text-xs text-muted-foreground">
                              Truy cập: {new Date(course.lastAccessed).toLocaleDateString('vi-VN')}
                            </div>
                            <div className="flex items-center gap-2">
                              <Button asChild>
                                <Link href={ROUTES.LEARN(course.id.toString())}>
                                  <PlayCircle className="h-4 w-4 mr-2" />
                                  {course.status === 'COMPLETED' ? 'Ôn tập' : 'Tiếp tục học'}
                                </Link>
                              </Button>
                              <Button variant="outline" asChild>
                                <Link href={ROUTES.COURSE_DETAIL(course.id.toString())}>
                                  Chi tiết
                                </Link>
                              </Button>
                            </div>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>
          
          <TabsContent value="in-progress">
            {/* Similar structure for in-progress courses */}
            <div className={viewMode === 'grid' ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6' : 'space-y-4'}>
              {inProgressCourses.length > 0 ? (
                inProgressCourses.map((course) => (
                  <div key={course.id}>
                    {/* Same card component as above */}
                    <p className="text-center text-muted-foreground">Course card here</p>
                  </div>
                ))
              ) : (
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
              )}
            </div>
          </TabsContent>
          
          <TabsContent value="completed">
            {completedCourses.length > 0 ? (
              <div className={viewMode === 'grid' ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6' : 'space-y-4'}>
                {completedCourses.map((course) => (
                  <Card key={course.id} className="overflow-hidden">
                    <div className="aspect-video bg-gradient-to-br from-accent/20 to-primary/20 flex items-center justify-center relative">
                      <CheckCircle2 className="h-16 w-16 text-accent" />
                      <Badge className="absolute top-4 right-4 bg-accent">
                        Hoàn thành
                      </Badge>
                    </div>
                    <CardHeader>
                      <CardTitle className="line-clamp-2">{course.title}</CardTitle>
                      <CardDescription>{course.instructor}</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-muted-foreground">100% hoàn thành</span>
                        <Badge variant="outline">Chứng chỉ</Badge>
                      </div>
                      
                      <div className="flex items-center gap-2">
                        <Button asChild className="flex-1" variant="outline">
                          <Link href={ROUTES.LEARN(course.id.toString())}>
                            Ôn tập
                          </Link>
                        </Button>
                        <Button asChild className="flex-1">
                          <Link href={`/student/certificates/${course.id}`}>
                            Xem chứng chỉ
                          </Link>
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <CheckCircle2 className="h-16 w-16 mx-auto mb-4 text-muted-foreground" />
                <h3 className="text-lg font-semibold mb-2">Chưa hoàn thành khóa học nào</h3>
                <p className="text-muted-foreground">
                  Tiếp tục học tập để hoàn thành khóa học đầu tiên!
                </p>
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}


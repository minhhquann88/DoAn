'use client';

import React from 'react';
import { useParams, useRouter } from 'next/navigation';
import { 
  ChevronLeft,
  ChevronRight,
  CheckCircle2,
  Circle,
  PlayCircle,
  FileText,
  ClipboardList,
  BookOpen,
  Menu,
  X,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import { useCourse } from '@/hooks/useCourses';
import { Skeleton } from '@/components/ui/skeleton';

// Mock lesson data structure
interface Lesson {
  id: number;
  title: string;
  type: 'VIDEO' | 'ARTICLE' | 'QUIZ' | 'ASSIGNMENT';
  duration?: number;
  isCompleted: boolean;
  videoUrl?: string;
  content?: string;
}

interface Section {
  id: number;
  title: string;
  lessons: Lesson[];
}

export default function LearningPage() {
  const params = useParams();
  const router = useRouter();
  const { course, isLoading } = useCourse(params.id as string);
  
  const [sidebarOpen, setSidebarOpen] = React.useState(true);
  const [currentLessonId, setCurrentLessonId] = React.useState<number | null>(null);
  const [curriculum, setCurriculum] = React.useState<Section[]>([]);
  const [isLoadingCurriculum, setIsLoadingCurriculum] = React.useState(true);
  
  React.useEffect(() => {
    // TODO: Fetch curriculum from API
    // const fetchCurriculum = async () => {
    //   try {
    //     const response = await fetch(`/api/content/courses/${params.id}`);
    //     const data = await response.json();
    //     setCurriculum(data);
    //     if (data.length > 0 && data[0].lessons.length > 0) {
    //       setCurrentLessonId(data[0].lessons[0].id);
    //     }
    //   } catch (error) {
    //     console.error('Error fetching curriculum:', error);
    //   } finally {
    //     setIsLoadingCurriculum(false);
    //   }
    // };
    // if (params.id) {
    //   fetchCurriculum();
    // }
    setIsLoadingCurriculum(false);
  }, [params.id]);
  
  // Find current lesson
  const currentLesson = currentLessonId
    ? curriculum
    .flatMap(section => section.lessons)
        .find(lesson => lesson.id === currentLessonId)
    : null;
  
  // Calculate progress
  const totalLessons = curriculum.reduce((sum, section) => sum + section.lessons.length, 0);
  const completedLessons = curriculum
    .flatMap(section => section.lessons)
    .filter(lesson => lesson.isCompleted).length;
  const progressPercentage = (completedLessons / totalLessons) * 100;
  
  // Navigate to next/previous lesson
  const allLessons = curriculum.flatMap(section => section.lessons);
  const currentIndex = allLessons.findIndex(l => l.id === currentLessonId);
  
  const handleNext = () => {
    if (currentIndex < allLessons.length - 1) {
      setCurrentLessonId(allLessons[currentIndex + 1].id);
    }
  };
  
  const handlePrevious = () => {
    if (currentIndex > 0) {
      setCurrentLessonId(allLessons[currentIndex - 1].id);
    }
  };
  
  const handleCompleteLesson = () => {
    // TODO: API call to mark lesson as complete
    console.log('Mark lesson complete:', currentLessonId);
  };
  
  const getLessonIcon = (type: string) => {
    switch (type) {
      case 'VIDEO':
        return <PlayCircle className="h-4 w-4" />;
      case 'ARTICLE':
        return <FileText className="h-4 w-4" />;
      default:
        return <Circle className="h-4 w-4" />;
    }
  };
  
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <Skeleton className="h-8 w-64 mx-auto mb-4" />
          <Skeleton className="h-4 w-48 mx-auto" />
        </div>
      </div>
    );
  }
  
  if (!course) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">Không tìm thấy khóa học</h1>
          <Button onClick={() => router.push('/courses')}>
            Quay lại danh sách khóa học
          </Button>
        </div>
      </div>
    );
  }
  
  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Top Bar */}
      <div className="border-b bg-card sticky top-0 z-40">
        <div className="flex items-center justify-between p-4">
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setSidebarOpen(!sidebarOpen)}
            >
              {sidebarOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </Button>
            <div>
              <h1 className="font-semibold line-clamp-1">{course.title}</h1>
              <p className="text-sm text-muted-foreground">
                {completedLessons} / {totalLessons} bài học
              </p>
            </div>
          </div>
          
          <div className="flex items-center gap-4">
            <div className="hidden md:flex items-center gap-2">
              <Progress value={progressPercentage} className="w-32" />
              <span className="text-sm font-medium">{Math.round(progressPercentage)}%</span>
            </div>
            <Button variant="outline" onClick={() => router.push(`/courses/${course.id}`)}>
              Thoát
            </Button>
          </div>
        </div>
        
        {/* Mobile Progress */}
        <div className="md:hidden px-4 pb-4">
          <div className="flex items-center gap-2">
            <Progress value={progressPercentage} className="flex-1" />
            <span className="text-sm font-medium">{Math.round(progressPercentage)}%</span>
          </div>
        </div>
      </div>
      
      <div className="flex flex-1 overflow-hidden">
        {/* Sidebar - Curriculum */}
        <aside
          className={`
            ${sidebarOpen ? 'w-80' : 'w-0'}
            transition-all duration-300 border-r bg-card overflow-y-auto
          `}
        >
          {sidebarOpen && (
            <div className="p-4">
              <h2 className="font-semibold mb-4">Nội dung khóa học</h2>
              
              <Accordion type="single" collapsible defaultValue="section-1">
                {curriculum.map((section, sectionIndex) => (
                  <AccordionItem key={section.id} value={`section-${section.id}`}>
                    <AccordionTrigger className="hover:no-underline">
                      <div className="flex items-center justify-between w-full pr-4">
                        <span className="font-medium text-sm">{section.title}</span>
                        <Badge variant="secondary" className="text-xs">
                          {section.lessons.filter(l => l.isCompleted).length}/{section.lessons.length}
                        </Badge>
                      </div>
                    </AccordionTrigger>
                    <AccordionContent>
                      <ul className="space-y-1 mt-2">
                        {section.lessons.map((lesson) => (
                          <li key={lesson.id}>
                            <button
                              onClick={() => setCurrentLessonId(lesson.id)}
                              className={`
                                w-full text-left p-3 rounded-lg transition-colors
                                ${currentLessonId === lesson.id
                                  ? 'bg-primary text-primary-foreground'
                                  : 'hover:bg-muted'
                                }
                              `}
                            >
                              <div className="flex items-center gap-3">
                                <div>
                                  {lesson.isCompleted ? (
                                    <CheckCircle2 className="h-4 w-4 text-accent" />
                                  ) : (
                                    getLessonIcon(lesson.type)
                                  )}
                                </div>
                                <div className="flex-1 min-w-0">
                                  <p className="text-sm font-medium line-clamp-2">
                                    {lesson.title}
                                  </p>
                                  {lesson.duration && (
                                    <p className="text-xs opacity-70 mt-0.5">
                                      {lesson.duration} phút
                                    </p>
                                  )}
                                </div>
                              </div>
                            </button>
                          </li>
                        ))}
                      </ul>
                    </AccordionContent>
                  </AccordionItem>
                ))}
              </Accordion>
            </div>
          )}
        </aside>
        
        {/* Main Content */}
        <main className="flex-1 overflow-y-auto">
          <div className="container max-w-5xl mx-auto p-6">
            {/* Lesson Header */}
            <div className="mb-6">
              <div className="flex items-center gap-2 mb-2">
                {getLessonIcon(currentLesson?.type || 'VIDEO')}
                <Badge variant="outline">{currentLesson?.type}</Badge>
              </div>
              <h1 className="text-3xl font-bold mb-2">{currentLesson?.title}</h1>
              {currentLesson?.duration && (
                <p className="text-muted-foreground">
                  Thời lượng: {currentLesson.duration} phút
                </p>
              )}
            </div>
            
            {/* Lesson Content */}
            <Card className="mb-6">
              <CardContent className="p-0">
                {currentLesson?.type === 'VIDEO' && currentLesson.videoUrl && (
                  <div className="aspect-video bg-black">
                    <iframe
                      src={currentLesson.videoUrl}
                      className="w-full h-full"
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                      allowFullScreen
                    />
                  </div>
                )}
                
                {currentLesson?.type === 'ARTICLE' && (
                  <div className="p-8 prose max-w-none">
                    <h2>Nội dung bài học</h2>
                    <p>
                      Đây là nội dung bài học dạng article. Trong thực tế, nội dung này sẽ được
                      load từ backend và hiển thị ở đây.
                    </p>
                    <p>
                      Bạn có thể thêm text, hình ảnh, code blocks, và các elements khác vào đây
                      để tạo nội dung bài học phong phú.
                    </p>
                  </div>
                )}
                
                {currentLesson?.type === 'QUIZ' && (
                  <div className="p-8">
                    <div className="text-center py-12">
                      <ClipboardList className="h-16 w-16 mx-auto mb-4 text-muted-foreground" />
                      <h2 className="text-2xl font-bold mb-2">Bài kiểm tra</h2>
                      <p className="text-muted-foreground mb-6">
                        Hoàn thành bài kiểm tra để tiếp tục khóa học
                      </p>
                      <Button size="lg">
                        Bắt đầu làm bài
                      </Button>
                    </div>
                  </div>
                )}
                
                {currentLesson?.type === 'ASSIGNMENT' && (
                  <div className="p-8">
                    <div className="text-center py-12">
                      <BookOpen className="h-16 w-16 mx-auto mb-4 text-muted-foreground" />
                      <h2 className="text-2xl font-bold mb-2">Bài tập</h2>
                      <p className="text-muted-foreground mb-6">
                        Hoàn thành và nộp bài tập của bạn
                      </p>
                      <Button size="lg">
                        Xem chi tiết bài tập
                      </Button>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
            
            {/* Lesson Actions */}
            <div className="flex items-center justify-between gap-4">
              <Button
                variant="outline"
                onClick={handlePrevious}
                disabled={currentIndex === 0}
              >
                <ChevronLeft className="h-4 w-4 mr-2" />
                Bài trước
              </Button>
              
              <div className="flex items-center gap-2">
                {!currentLesson?.isCompleted && (
                  <Button onClick={handleCompleteLesson}>
                    <CheckCircle2 className="h-4 w-4 mr-2" />
                    Hoàn thành bài học
                  </Button>
                )}
              </div>
              
              <Button
                onClick={handleNext}
                disabled={currentIndex === allLessons.length - 1}
              >
                Bài tiếp theo
                <ChevronRight className="h-4 w-4 ml-2" />
              </Button>
            </div>
            
            {/* Notes Section */}
            <Separator className="my-8" />
            
            <div>
              <h3 className="text-xl font-bold mb-4">Ghi chú của bạn</h3>
              <Card>
                <CardContent className="p-6">
                  <p className="text-sm text-muted-foreground text-center py-8">
                    Tính năng ghi chú sẽ được thêm vào sau
                  </p>
                </CardContent>
              </Card>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}


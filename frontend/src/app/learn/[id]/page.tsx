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
  Loader2,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import { useCourse } from '@/hooks/useCourses';
import { Skeleton } from '@/components/ui/skeleton';
import { getCourseContent, markLessonAsCompleted, updateLessonProgress, type ChapterResponse, type LessonResponse } from '@/services/contentService';
import { isYouTubeUrl, getYouTubeEmbedUrl } from '@/lib/utils';
import { useAuthStore } from '@/stores/authStore';
import { useUIStore } from '@/stores/uiStore';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getMyCertificates } from '@/services/paymentService';

// Map backend contentType to frontend type
const mapContentType = (contentType: string): 'VIDEO' | 'ARTICLE' | 'SLIDE' | 'QUIZ' | 'ASSIGNMENT' => {
  switch (contentType) {
    case 'VIDEO':
      return 'VIDEO';
    case 'TEXT':
    case 'DOCUMENT':
      return 'ARTICLE';
    case 'SLIDE':
      return 'SLIDE';
    case 'QUIZ':
      return 'QUIZ';
    default:
      return 'ARTICLE';
  }
};

// Map ChapterResponse to Section format
interface Lesson {
  id: number;
  title: string;
  type: 'VIDEO' | 'ARTICLE' | 'SLIDE' | 'QUIZ' | 'ASSIGNMENT';
  duration?: number;
  isCompleted: boolean;
  videoUrl?: string;
  contentUrl?: string;
  slideUrl?: string;
  content?: string;
  originalContentType?: 'VIDEO' | 'TEXT' | 'DOCUMENT' | 'SLIDE';
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
  const { isAuthenticated } = useAuthStore();
  const { addToast } = useUIStore();
  const queryClient = useQueryClient();
  
  const [sidebarOpen, setSidebarOpen] = React.useState(true);
  const [currentLessonId, setCurrentLessonId] = React.useState<number | null>(null);
  
  // Track video progress to show "Complete" button only when watched >= 80%
  const [videoProgress, setVideoProgress] = React.useState<{
    watchedTime: number; // seconds
    totalDuration: number; // seconds
    percentage: number; // 0-100
  } | null>(null);
  
  // Flag to prevent multiple auto-complete calls
  const [hasAutoCompleted, setHasAutoCompleted] = React.useState(false);
  
  // Reset video progress and auto-complete flag when lesson changes
  React.useEffect(() => {
    setVideoProgress(null);
    setHasAutoCompleted(false);
  }, [currentLessonId]);
  
  // Fetch course content from backend
  const { data: chapters, isLoading: isLoadingCurriculum, error, refetch: refetchCourseContent } = useQuery<ChapterResponse[]>({
    queryKey: ['course-content', params.id],
    queryFn: async () => {
      if (!params.id) throw new Error('Course ID is required');
      return await getCourseContent(Number(params.id));
    },
    enabled: !!params.id && isAuthenticated,
    retry: 1,
  });
  
  const { user } = useAuthStore();
  
  // Fetch enrollment to get backend progress - use student enrollments and filter by course
  const { data: enrollment, refetch: refetchEnrollment } = useQuery({
    queryKey: ['enrollment', params.id, user?.id],
    queryFn: async () => {
      if (!params.id || !user?.id) return null;
      try {
        // Get all student enrollments and find the one for this course
        const { getEnrollmentsByStudent } = await import('@/services/enrollmentService');
        const response = await getEnrollmentsByStudent(user.id, 0, 100);
        return response.content.find(e => e.courseId === Number(params.id)) || null;
      } catch (error) {
        console.error('Error fetching enrollment:', error);
        return null;
      }
    },
    enabled: !!params.id && !!user?.id && isAuthenticated,
  });
  
  // Fetch certificates for this course
  const { data: certificatesData } = useQuery({
    queryKey: ['certificates', params.id],
    queryFn: async () => {
      if (!params.id || !enrollment?.studentId) return null;
      const result = await getMyCertificates(enrollment.studentId, { page: 0, size: 100 });
      // Filter certificates for current course
      return result.content.filter(cert => cert.courseId === Number(params.id));
    },
    enabled: !!params.id && !!enrollment?.studentId,
  });
  
  const courseCertificate = certificatesData && certificatesData.length > 0 ? certificatesData[0] : null;
  
  // Map ChapterResponse[] to Section[]
  const curriculum: Section[] = React.useMemo(() => {
    if (!chapters) return [];
    
    const mapped = chapters.map((chapter) => ({
      id: chapter.id,
      title: chapter.title,
      lessons: chapter.lessons.map((lesson: LessonResponse) => {
        // Debug: Log lesson data to see what fields are available
        console.log('Mapping lesson:', lesson.title, 'Raw lesson data:', lesson);
        
        return {
          id: lesson.id,
          title: lesson.title,
          type: mapContentType(lesson.contentType),
          duration: lesson.durationInMinutes,
          // Try both isCompleted and completed (Jackson might serialize differently)
          isCompleted: (lesson as any).isCompleted ?? (lesson as any).completed ?? false,
          videoUrl: lesson.videoUrl,
          contentUrl: lesson.documentUrl, // For DOCUMENT type lessons
          slideUrl: lesson.slideUrl, // For SLIDE type lessons
          content: lesson.content, // For TEXT type lessons
          originalContentType: lesson.contentType, // Keep original type for proper handling
        };
      }),
    }));
    
    // Debug: Log curriculum mapping to track completion status
    console.log('Curriculum mapped from chapters:', mapped);
    mapped.forEach(section => {
      const completed = section.lessons.filter(l => l.isCompleted).length;
      console.log(`Section "${section.title}": ${completed}/${section.lessons.length} completed`);
    });
    
    return mapped;
  }, [chapters]);
  
  // Set first lesson as current when curriculum loads
  React.useEffect(() => {
    if (curriculum.length > 0 && !currentLessonId) {
      const firstLesson = curriculum[0]?.lessons[0];
      if (firstLesson) {
        setCurrentLessonId(firstLesson.id);
      }
    }
  }, [curriculum, currentLessonId]);
  
  // Redirect if not authenticated
  React.useEffect(() => {
    if (!isAuthenticated && !isLoading) {
      router.push(`/courses/${params.id}`);
    }
  }, [isAuthenticated, isLoading, params.id, router]);
  
  // Find current lesson
  const currentLesson = currentLessonId
    ? curriculum
    .flatMap(section => section.lessons)
        .find(lesson => lesson.id === currentLessonId)
    : null;
  
  // Calculate progress - use backend enrollment progress if available, otherwise calculate from local state
  const totalLessons = curriculum.reduce((sum, section) => sum + section.lessons.length, 0);
  const completedLessons = curriculum
    .flatMap(section => section.lessons)
    .filter(lesson => lesson.isCompleted).length;
  const localProgressPercentage = totalLessons > 0 ? (completedLessons / totalLessons) * 100 : 0;
  
  // Use backend enrollment progress if available (more accurate)
  const progressPercentage = enrollment?.progress ?? localProgressPercentage;
  const isCourseCompleted = progressPercentage >= 100 || enrollment?.status === 'COMPLETED';
  
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
  
  // Mark lesson as completed mutation
  const completeLessonMutation = useMutation({
    mutationFn: async (lessonId: number) => {
      return await markLessonAsCompleted(lessonId);
    },
    onSuccess: async () => {
      // Wait a bit to ensure backend transaction is committed
      await new Promise(resolve => setTimeout(resolve, 500));
      
      // Remove queries from cache first to force fresh fetch (more aggressive than invalidate)
      queryClient.removeQueries({ queryKey: ['course-content', params.id] });
      queryClient.removeQueries({ queryKey: ['enrollment', params.id, user?.id] });
      
      // Also invalidate other related queries to sync progress across all pages
      queryClient.invalidateQueries({ queryKey: ['certificates', params.id] });
      queryClient.invalidateQueries({ queryKey: ['my-courses'] });
      queryClient.invalidateQueries({ queryKey: ['my-enrollments'] });
      queryClient.invalidateQueries({ queryKey: ['featured-courses'] }); // Homepage featured courses
      queryClient.invalidateQueries({ queryKey: ['courses'] }); // Courses listing page
      queryClient.invalidateQueries({ queryKey: ['course', params.id] }); // Course detail page
      
      // Then refetch course content and enrollment to immediately update UI
      console.log('Refetching course content and enrollment...');
      try {
        const [courseContentResult, enrollmentResult] = await Promise.all([
          refetchCourseContent(),
          refetchEnrollment(),
        ]);
        
        // Debug: Log the refetched data
        console.log('Refetched course content:', courseContentResult.data);
        if (courseContentResult.data) {
          const completedCount = courseContentResult.data
            .flatMap(ch => ch.lessons)
            .filter(l => l.isCompleted).length;
          console.log('Completed lessons count:', completedCount);
          courseContentResult.data.forEach(chapter => {
            const chapterCompleted = chapter.lessons.filter(l => l.isCompleted).length;
            console.log(`Chapter "${chapter.title}": ${chapterCompleted}/${chapter.lessons.length} completed`);
            chapter.lessons.forEach(lesson => {
              console.log(`  Lesson "${lesson.title}": isCompleted=${lesson.isCompleted}`);
            });
          });
        }
        
        // Check if course is completed using the refetched enrollment data
        const updatedEnrollment = enrollmentResult.data;
        
        if (updatedEnrollment && (updatedEnrollment.progress >= 100 || updatedEnrollment.status === 'COMPLETED')) {
          // Course completed - show certificate notification
          addToast({
            type: 'success',
            title: 'Chúc mừng!',
            description: 'Bạn đã hoàn thành khóa học! Chứng chỉ đã được cấp.',
          });
        } else {
          addToast({
            type: 'success',
            description: 'Đã đánh dấu bài học hoàn thành!',
          });
        }
      } catch (error) {
        console.error('Error refetching data:', error);
        addToast({
          type: 'success',
          description: 'Đã đánh dấu bài học hoàn thành!',
        });
      }
    },
    onError: (error: any) => {
      console.error('Error marking lesson as completed:', error);
      addToast({
        type: 'error',
        description: error.response?.data?.message || 'Không thể đánh dấu bài học hoàn thành',
      });
    },
  });
  
  // Check for course completion on mount and when enrollment changes
  React.useEffect(() => {
    if (isCourseCompleted && courseCertificate && !queryClient.getQueryData(['completion-notified', params.id])) {
      // Mark as notified to avoid duplicate notifications
      queryClient.setQueryData(['completion-notified', params.id], true);
      addToast({
        type: 'success',
        title: 'Chúc mừng!',
        description: 'Bạn đã hoàn thành khóa học! Chứng chỉ đã được cấp.',
      });
    }
  }, [isCourseCompleted, courseCertificate, params.id, queryClient, addToast]);
  
  const handleCompleteLesson = () => {
    if (currentLessonId) {
      completeLessonMutation.mutate(currentLessonId);
    }
  };
  
  const getLessonIcon = (type: string) => {
    switch (type) {
      case 'VIDEO':
        return <PlayCircle className="h-4 w-4" />;
      case 'ARTICLE':
        return <FileText className="h-4 w-4" />;
      case 'SLIDE':
        return <FileText className="h-4 w-4" />;
      default:
        return <Circle className="h-4 w-4" />;
    }
  };
  
  if (isLoading || isLoadingCurriculum) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4" />
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
  
  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">Không thể tải nội dung khóa học</h1>
          <p className="text-muted-foreground mb-4">
            Bạn cần đăng ký khóa học này để xem nội dung
          </p>
          <Button onClick={() => router.push(`/courses/${params.id}`)}>
            Quay lại trang khóa học
          </Button>
        </div>
      </div>
    );
  }
  
  if (!curriculum || curriculum.length === 0) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">Khóa học chưa có nội dung</h1>
          <p className="text-muted-foreground mb-4">
            Khóa học này chưa có bài học nào. Vui lòng quay lại sau.
          </p>
          <Button onClick={() => router.push(`/courses/${params.id}`)}>
            Quay lại trang khóa học
          </Button>
        </div>
      </div>
    );
  }
  
  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Course Completion Banner */}
      {isCourseCompleted && courseCertificate && (
        <div className="bg-gradient-to-r from-green-500 to-emerald-600 text-white p-4 sticky top-0 z-50">
          <div className="container mx-auto flex items-center justify-between">
            <div className="flex items-center gap-3">
              <CheckCircle2 className="h-6 w-6" />
              <div>
                <h3 className="font-semibold">Chúc mừng! Bạn đã hoàn thành khóa học!</h3>
                <p className="text-sm opacity-90">Chứng chỉ đã được cấp. Mã chứng chỉ: {courseCertificate.certificateCode}</p>
              </div>
            </div>
            {courseCertificate.pdfUrl && (
              <Button
                variant="secondary"
                onClick={() => window.open(courseCertificate.pdfUrl, '_blank')}
              >
                Tải chứng chỉ
              </Button>
            )}
          </div>
        </div>
      )}
      
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
                    {isYouTubeUrl(currentLesson.videoUrl) ? (
                      // YouTube embed - no progress tracking available
                      <iframe
                        src={getYouTubeEmbedUrl(currentLesson.videoUrl) || ''}
                        className="w-full h-full"
                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                        allowFullScreen
                        title={currentLesson.title}
                      />
                    ) : (
                      // Regular video with progress tracking
                    <video
                      src={currentLesson.videoUrl}
                      controls
                      className="w-full h-full"
                      onLoadedMetadata={(e) => {
                        // Get video duration when metadata is loaded
                        const video = e.currentTarget;
                        if (video.duration) {
                          setVideoProgress({
                            watchedTime: video.currentTime,
                            totalDuration: video.duration,
                            percentage: 0,
                          });
                        }
                      }}
                      onTimeUpdate={(e) => {
                        // Track video progress locally
                        const video = e.currentTarget;
                        if (video.duration && video.duration > 0) {
                          const watchedTime = video.currentTime;
                          const totalDuration = video.duration;
                          const percentage = (watchedTime / totalDuration) * 100;
                          
                          setVideoProgress({
                            watchedTime,
                            totalDuration,
                            percentage,
                          });
                          
                          // Auto-mark as completed when video reaches 90% (only once)
                          if (percentage >= 90 && currentLessonId && !currentLesson.isCompleted && !hasAutoCompleted) {
                            setHasAutoCompleted(true);
                            handleCompleteLesson();
                          }
                        }
                      }}
                      onEnded={() => {
                        // Auto-mark as completed when video ends
                        if (currentLessonId && !currentLesson.isCompleted) {
                          handleCompleteLesson();
                        }
                      }}
                    >
                      Trình duyệt của bạn không hỗ trợ video tag.
                    </video>
                    )}
                  </div>
                )}
                
                {currentLesson?.type === 'ARTICLE' && (
                  <div className="p-8 prose max-w-none">
                    {currentLesson.originalContentType === 'TEXT' && currentLesson.content ? (
                      // Text content - render HTML
                      <div 
                        className="whitespace-pre-wrap"
                        dangerouslySetInnerHTML={{ __html: currentLesson.content }}
                      />
                    ) : currentLesson.contentUrl ? (
                      // Document content - handle PDF vs DOC/DOCX
                      (() => {
                        const docUrl = currentLesson.contentUrl || '';
                        const fileName = docUrl.split('/').pop() || '';
                        
                        // Convert document URL to inline viewing URL
                        const getViewUrl = (url: string) => {
                          if (url.includes('/api/files/lessons/documents/')) {
                            return url.replace('/api/files/lessons/documents/', '/api/files/view/documents/');
                          }
                          const file = url.split('/').pop();
                          return `http://localhost:8080/api/files/view/documents/${file}`;
                        };
                        
                        const viewUrl = getViewUrl(docUrl);
                        
                        return (
                          <div className="flex flex-col gap-4 not-prose">
                            {/* Info bar */}
                            <div className="flex items-center justify-between bg-muted p-3 rounded-lg">
                              <span className="text-sm">📄 {fileName} (PDF)</span>
                              <a
                                href={viewUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="inline-flex items-center gap-2 px-3 py-1.5 text-sm bg-secondary text-secondary-foreground rounded-md hover:bg-secondary/90"
                              >
                                Mở tab mới
                              </a>
                            </div>
                            
                            {/* PDF viewer */}
                            <object
                              data={viewUrl}
                              type="application/pdf"
                              className="w-full min-h-[600px] border rounded-lg"
                            >
                              <div className="flex flex-col items-center justify-center h-[400px] gap-4">
                                <FileText className="h-16 w-16 text-muted-foreground" />
                                <p className="text-muted-foreground">Trình duyệt không hỗ trợ xem PDF trực tiếp</p>
                                <a
                                  href={viewUrl}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="inline-flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90"
                                >
                                  Mở PDF trong tab mới
                                </a>
                              </div>
                            </object>
                          </div>
                        );
                      })()
                    ) : (
                      <div className="flex flex-col items-center justify-center py-12 gap-4 not-prose">
                        <BookOpen className="h-16 w-16 text-muted-foreground" />
                        <p className="text-muted-foreground">Chưa có nội dung cho bài học này</p>
                      </div>
                    )}
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
                
                {currentLesson?.type === 'SLIDE' && (
                  <div className="p-8">
                    {currentLesson.slideUrl ? (
                      (() => {
                        const slideUrl = currentLesson.slideUrl || '';
                        const fileName = slideUrl.split('/').pop() || '';
                        
                        // Convert slide URL to inline viewing URL
                        const getViewUrl = (url: string) => {
                          if (url.includes('/api/files/lessons/slides/')) {
                            return url.replace('/api/files/lessons/slides/', '/api/files/view/slides/');
                          }
                          const file = url.split('/').pop();
                          return `http://localhost:8080/api/files/view/slides/${file}`;
                        };
                        
                        const viewUrl = getViewUrl(slideUrl);
                        
                        return (
                          <div className="flex flex-col gap-4">
                            {/* Info bar */}
                            <div className="flex items-center justify-between bg-muted p-3 rounded-lg">
                              <span className="text-sm">📊 {fileName} (Slide bài giảng)</span>
                              <a
                                href={viewUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="inline-flex items-center gap-2 px-3 py-1.5 text-sm bg-secondary text-secondary-foreground rounded-md hover:bg-secondary/90"
                              >
                                Mở tab mới
                              </a>
                            </div>
                            
                            {/* Slide viewer - All slides are now PDF (auto-converted) */}
                            <object
                              data={viewUrl}
                              type="application/pdf"
                              className="w-full min-h-[600px] border rounded-lg"
                            >
                              <div className="flex flex-col items-center justify-center h-[400px] gap-4">
                                <FileText className="h-16 w-16 text-muted-foreground" />
                                <p className="text-muted-foreground">Trình duyệt không hỗ trợ xem PDF trực tiếp</p>
                                <a
                                  href={viewUrl}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="inline-flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90"
                                >
                                  Mở slide trong tab mới
                                </a>
                              </div>
                            </object>
                          </div>
                        );
                      })()
                    ) : (
                      <div className="flex flex-col items-center justify-center py-12 gap-4">
                        <FileText className="h-16 w-16 text-muted-foreground" />
                        <p className="text-muted-foreground">Chưa có slide cho bài học này</p>
                      </div>
                    )}
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
                {!currentLesson?.isCompleted ? (
                  // Only show "Complete" button if:
                  // - Video is watched >= 80% (for uploaded videos)
                  // - OR it's a YouTube video (can't track progress, allow manual completion)
                  // - OR it's a non-video lesson
                  (currentLesson?.type === 'VIDEO' 
                    ? (isYouTubeUrl(currentLesson.videoUrl || '') || (videoProgress && videoProgress.percentage >= 80))
                    : true
                  ) ? (
                    <Button 
                      onClick={handleCompleteLesson}
                      disabled={completeLessonMutation.isPending}
                    >
                      {completeLessonMutation.isPending ? (
                        <>
                          <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                          Đang xử lý...
                        </>
                      ) : (
                        <>
                          <CheckCircle2 className="h-4 w-4 mr-2" />
                          Hoàn thành bài học
                        </>
                      )}
                    </Button>
                  ) : (
                    // Show progress message when video is watched < 80%
                    videoProgress && (
                      <div className="text-sm text-muted-foreground px-4 py-2">
                        Xem {Math.round(videoProgress.percentage)}% để hoàn thành bài học
                      </div>
                    )
                  )
                ) : (
                  <Badge variant="default" className="px-4 py-2">
                    <CheckCircle2 className="h-4 w-4 mr-2" />
                    Đã hoàn thành
                  </Badge>
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
          </div>
        </main>
      </div>
    </div>
  );
}


'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { 
  ChevronLeft,
  ChevronRight,
  Check,
  Upload,
  Video,
  FileText,
  Settings,
  Save,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Separator } from '@/components/ui/separator';
import { cn } from '@/lib/utils';
import { ROUTES } from '@/lib/constants';

const courseSchema = z.object({
  title: z.string().min(5, 'Tên khóa học phải có ít nhất 5 ký tự'),
  shortDescription: z.string().min(10, 'Mô tả ngắn phải có ít nhất 10 ký tự'),
  description: z.string().min(50, 'Mô tả chi tiết phải có ít nhất 50 ký tự'),
  categoryId: z.string().min(1, 'Vui lòng chọn danh mục'),
  level: z.enum(['BEGINNER', 'INTERMEDIATE', 'ADVANCED', 'EXPERT']),
  language: z.string().min(1, 'Vui lòng chọn ngôn ngữ'),
  price: z.number().min(0, 'Giá phải lớn hơn hoặc bằng 0'),
});

type CourseFormData = z.infer<typeof courseSchema>;

const steps = [
  { id: 1, name: 'Thông tin cơ bản', icon: FileText },
  { id: 2, name: 'Media & Thumbnail', icon: Upload },
  { id: 3, name: 'Nội dung khóa học', icon: Video },
  { id: 4, name: 'Cài đặt & Xuất bản', icon: Settings },
];

export default function CreateCoursePage() {
  const router = useRouter();
  const [currentStep, setCurrentStep] = React.useState(1);
  const [thumbnailPreview, setThumbnailPreview] = React.useState<string | null>(null);
  
  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
  } = useForm<CourseFormData>({
    resolver: zodResolver(courseSchema),
    defaultValues: {
      level: 'BEGINNER',
      language: 'vi',
      price: 0,
    },
  });
  
  const handleThumbnailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setThumbnailPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };
  
  const onSubmit = (data: CourseFormData) => {
    console.log('Create course:', data);
    // TODO: API call
    router.push(ROUTES.INSTRUCTOR_COURSES);
  };
  
  const nextStep = () => {
    if (currentStep < steps.length) {
      setCurrentStep(currentStep + 1);
    }
  };
  
  const prevStep = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };
  
  const progress = (currentStep / steps.length) * 100;
  
  return (
    <div className="min-h-screen bg-background">
      <div className="container max-w-5xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <Button 
            variant="ghost" 
            onClick={() => router.push(ROUTES.INSTRUCTOR_DASHBOARD)}
            className="mb-4"
          >
            <ChevronLeft className="h-4 w-4 mr-2" />
            Quay lại Dashboard
          </Button>
          <h1 className="text-3xl font-bold font-poppins mb-2">Tạo khóa học mới</h1>
          <p className="text-muted-foreground">
            Điền thông tin để tạo khóa học của bạn
          </p>
        </div>
        
        {/* Progress Bar */}
        <div className="mb-8">
          <Progress value={progress} className="h-2 mb-4" />
          <div className="grid grid-cols-4 gap-4">
            {steps.map((step) => {
              const Icon = step.icon;
              const isActive = currentStep === step.id;
              const isCompleted = currentStep > step.id;
              
              return (
                <div
                  key={step.id}
                  className={cn(
                    'flex items-center gap-3 p-3 rounded-lg border-2 transition-all',
                    isActive && 'border-primary bg-primary/5',
                    isCompleted && 'border-accent bg-accent/5',
                    !isActive && !isCompleted && 'border-border'
                  )}
                >
                  <div
                    className={cn(
                      'flex h-10 w-10 items-center justify-center rounded-full',
                      isActive && 'bg-primary text-primary-foreground',
                      isCompleted && 'bg-accent text-accent-foreground',
                      !isActive && !isCompleted && 'bg-muted'
                    )}
                  >
                    {isCompleted ? (
                      <Check className="h-5 w-5" />
                    ) : (
                      <Icon className="h-5 w-5" />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium line-clamp-1">{step.name}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
        
        {/* Form */}
        <form onSubmit={handleSubmit(onSubmit)}>
          {/* Step 1: Basic Info */}
          {currentStep === 1 && (
            <Card>
              <CardHeader>
                <CardTitle>Thông tin cơ bản</CardTitle>
                <CardDescription>
                  Nhập thông tin cơ bản về khóa học của bạn
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="title">
                    Tên khóa học <span className="text-destructive">*</span>
                  </Label>
                  <Input
                    id="title"
                    placeholder="VD: Next.js 14 - Hướng dẫn từ cơ bản đến nâng cao"
                    {...register('title')}
                  />
                  {errors.title && (
                    <p className="text-sm text-destructive">{errors.title.message}</p>
                  )}
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="shortDescription">
                    Mô tả ngắn <span className="text-destructive">*</span>
                  </Label>
                  <Textarea
                    id="shortDescription"
                    placeholder="Viết mô tả ngắn gọn về khóa học (hiển thị trên card)"
                    rows={3}
                    {...register('shortDescription')}
                  />
                  {errors.shortDescription && (
                    <p className="text-sm text-destructive">{errors.shortDescription.message}</p>
                  )}
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="description">
                    Mô tả chi tiết <span className="text-destructive">*</span>
                  </Label>
                  <Textarea
                    id="description"
                    placeholder="Viết mô tả chi tiết về khóa học, nội dung, lợi ích..."
                    rows={6}
                    {...register('description')}
                  />
                  {errors.description && (
                    <p className="text-sm text-destructive">{errors.description.message}</p>
                  )}
                </div>
                
                <Separator />
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="categoryId">
                      Danh mục <span className="text-destructive">*</span>
                    </Label>
                    <Select 
                      onValueChange={(value) => setValue('categoryId', value)}
                      defaultValue=""
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Chọn danh mục" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="1">Lập trình Web</SelectItem>
                        <SelectItem value="2">Mobile Development</SelectItem>
                        <SelectItem value="3">Data Science</SelectItem>
                        <SelectItem value="4">Design</SelectItem>
                        <SelectItem value="5">Marketing</SelectItem>
                      </SelectContent>
                    </Select>
                    {errors.categoryId && (
                      <p className="text-sm text-destructive">{errors.categoryId.message}</p>
                    )}
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="level">
                      Cấp độ <span className="text-destructive">*</span>
                    </Label>
                    <Select 
                      onValueChange={(value) => setValue('level', value as any)}
                      defaultValue="BEGINNER"
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="BEGINNER">Người mới bắt đầu</SelectItem>
                        <SelectItem value="INTERMEDIATE">Trung cấp</SelectItem>
                        <SelectItem value="ADVANCED">Nâng cao</SelectItem>
                        <SelectItem value="EXPERT">Chuyên gia</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="language">
                      Ngôn ngữ <span className="text-destructive">*</span>
                    </Label>
                    <Select 
                      onValueChange={(value) => setValue('language', value)}
                      defaultValue="vi"
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="vi">Tiếng Việt</SelectItem>
                        <SelectItem value="en">English</SelectItem>
                        <SelectItem value="zh">中文</SelectItem>
                        <SelectItem value="ja">日本語</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="price">
                      Giá (VNĐ) <span className="text-destructive">*</span>
                    </Label>
                    <Input
                      id="price"
                      type="number"
                      placeholder="0"
                      {...register('price', { valueAsNumber: true })}
                    />
                    {errors.price && (
                      <p className="text-sm text-destructive">{errors.price.message}</p>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
          
          {/* Step 2: Media */}
          {currentStep === 2 && (
            <Card>
              <CardHeader>
                <CardTitle>Media & Thumbnail</CardTitle>
                <CardDescription>
                  Tải lên hình ảnh và video giới thiệu khóa học
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-2">
                  <Label>Thumbnail khóa học</Label>
                  <div className="border-2 border-dashed rounded-lg p-8 text-center hover:border-primary transition-colors">
                    {thumbnailPreview ? (
                      <div className="relative">
                        <img
                          src={thumbnailPreview}
                          alt="Thumbnail preview"
                          className="max-h-64 mx-auto rounded-lg"
                        />
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          className="mt-4"
                          onClick={() => setThumbnailPreview(null)}
                        >
                          Đổi ảnh khác
                        </Button>
                      </div>
                    ) : (
                      <div>
                        <Upload className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                        <p className="text-sm text-muted-foreground mb-2">
                          Click để tải lên hoặc kéo thả ảnh vào đây
                        </p>
                        <p className="text-xs text-muted-foreground">
                          PNG, JPG hoặc WEBP (tối đa 2MB)
                        </p>
                        <Label
                          htmlFor="thumbnail"
                          className="cursor-pointer inline-block mt-4"
                        >
                          <Button type="button" variant="outline" asChild>
                            <span>Chọn ảnh</span>
                          </Button>
                        </Label>
                        <input
                          id="thumbnail"
                          type="file"
                          accept="image/*"
                          className="hidden"
                          onChange={handleThumbnailChange}
                        />
                      </div>
                    )}
                  </div>
                </div>
                
                <Separator />
                
                <div className="space-y-2">
                  <Label>Video giới thiệu (tùy chọn)</Label>
                  <div className="border-2 border-dashed rounded-lg p-8 text-center hover:border-primary transition-colors">
                    <Video className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                    <p className="text-sm text-muted-foreground mb-2">
                      Tải lên video giới thiệu khóa học
                    </p>
                    <p className="text-xs text-muted-foreground mb-4">
                      MP4, MOV hoặc AVI (tối đa 100MB)
                    </p>
                    <Button type="button" variant="outline">
                      Chọn video
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
          
          {/* Step 3: Curriculum */}
          {currentStep === 3 && (
            <Card>
              <CardHeader>
                <CardTitle>Nội dung khóa học</CardTitle>
                <CardDescription>
                  Xây dựng curriculum cho khóa học của bạn
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-center py-12">
                  <Video className="h-16 w-16 mx-auto mb-4 text-muted-foreground" />
                  <h3 className="text-lg font-semibold mb-2">
                    Curriculum Builder
                  </h3>
                  <p className="text-muted-foreground mb-6">
                    Tính năng xây dựng nội dung chi tiết sẽ được thêm sau
                  </p>
                  <Badge variant="secondary">Coming Soon</Badge>
                </div>
              </CardContent>
            </Card>
          )}
          
          {/* Step 4: Settings */}
          {currentStep === 4 && (
            <Card>
              <CardHeader>
                <CardTitle>Cài đặt & Xuất bản</CardTitle>
                <CardDescription>
                  Kiểm tra và xuất bản khóa học của bạn
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="rounded-lg border bg-muted/50 p-6">
                  <h3 className="font-semibold mb-4">Tổng quan khóa học</h3>
                  <dl className="space-y-2">
                    <div className="flex justify-between">
                      <dt className="text-muted-foreground">Tên khóa học:</dt>
                      <dd className="font-medium">{watch('title') || 'Chưa nhập'}</dd>
                    </div>
                    <div className="flex justify-between">
                      <dt className="text-muted-foreground">Cấp độ:</dt>
                      <dd className="font-medium">{watch('level')}</dd>
                    </div>
                    <div className="flex justify-between">
                      <dt className="text-muted-foreground">Giá:</dt>
                      <dd className="font-medium">{watch('price')?.toLocaleString('vi-VN')} VNĐ</dd>
                    </div>
                  </dl>
                </div>
                
                <div className="space-y-4">
                  <Label>Trạng thái xuất bản</Label>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <Card className="cursor-pointer hover:border-primary transition-colors">
                      <CardContent className="p-4">
                        <h4 className="font-semibold mb-1">Lưu bản nháp</h4>
                        <p className="text-sm text-muted-foreground">
                          Lưu khóa học và tiếp tục chỉnh sửa sau
                        </p>
                      </CardContent>
                    </Card>
                    
                    <Card className="cursor-pointer hover:border-accent transition-colors">
                      <CardContent className="p-4">
                        <h4 className="font-semibold mb-1">Xuất bản ngay</h4>
                        <p className="text-sm text-muted-foreground">
                          Xuất bản khóa học lên nền tảng
                        </p>
                      </CardContent>
                    </Card>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
          
          {/* Navigation Buttons */}
          <div className="flex items-center justify-between mt-8">
            <Button
              type="button"
              variant="outline"
              onClick={prevStep}
              disabled={currentStep === 1}
            >
              <ChevronLeft className="h-4 w-4 mr-2" />
              Quay lại
            </Button>
            
            <div className="flex items-center gap-2">
              {currentStep < steps.length ? (
                <Button type="button" onClick={nextStep}>
                  Tiếp theo
                  <ChevronRight className="h-4 w-4 ml-2" />
                </Button>
              ) : (
                <Button type="submit">
                  <Save className="h-4 w-4 mr-2" />
                  Lưu khóa học
                </Button>
              )}
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}


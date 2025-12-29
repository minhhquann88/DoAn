'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { ArrowLeft, Save } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useCreateCourse } from '@/hooks/useCourses';
import { useUIStore } from '@/stores/uiStore';
import apiClient from '@/lib/api';
import { ROUTES } from '@/lib/constants';
import { ImageUpload } from '@/components/ui/image-upload';
import { uploadCourseImage } from '@/services/courseService';
import type { CourseRequest } from '@/types';

const courseSchema = z.object({
  title: z.string().min(1, 'Tiêu đề không được để trống').max(200, 'Tiêu đề không được vượt quá 200 ký tự'),
  description: z.string().min(1, 'Mô tả không được để trống'),
  price: z.number().min(0, 'Giá tiền phải lớn hơn hoặc bằng 0'),
  imageUrl: z.string().url('URL ảnh không hợp lệ').optional().or(z.literal('')),
  totalDurationInHours: z.number().int().min(0, 'Thời lượng phải lớn hơn hoặc bằng 0').optional(),
  categoryId: z.number().min(1, 'Vui lòng chọn danh mục'),
});

type CourseFormData = z.infer<typeof courseSchema>;

interface Category {
  id: number;
  name: string;
  description?: string;
}

export default function CreateCoursePage() {
  const router = useRouter();
  const { addToast } = useUIStore();
  const createCourse = useCreateCourse();
  const [categories, setCategories] = React.useState<Category[]>([]);
  const [isLoadingCategories, setIsLoadingCategories] = React.useState(true);

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<CourseFormData>({
    resolver: zodResolver(courseSchema),
    defaultValues: {
      title: '',
      description: '',
      price: 0,
      imageUrl: '',
      totalDurationInHours: 0,
      categoryId: undefined,
    },
  });

  const imageUrl = watch('imageUrl');
  const [pendingImageFile, setPendingImageFile] = React.useState<File | null>(null);

  // Fetch categories
  React.useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await apiClient.get<any>('/v1/categories');
        let categoriesData: Category[] = [];

        // Xử lý cả trường hợp response là array hoặc string (JSON stringified)
        if (Array.isArray(response.data)) {
          categoriesData = response.data;
        } else if (typeof response.data === 'string') {
          try {
            // Parse JSON string nếu response là string
            const parsed = JSON.parse(response.data);
            if (Array.isArray(parsed)) {
              categoriesData = parsed;
            } else {
              console.error('Parsed categories is not an array:', parsed);
              categoriesData = [];
            }
          } catch (parseError) {
            console.error('Error parsing categories JSON string:', parseError);
            categoriesData = [];
          }
        } else {
          console.error('Categories response is not an array or string:', response.data);
          categoriesData = [];
        }

        setCategories(categoriesData);

        // Show error toast nếu không có categories nào
        if (categoriesData.length === 0) {
          addToast({
            type: 'error',
            description: 'Không thể tải danh sách danh mục. Vui lòng thử lại sau.',
          });
        }
      } catch (error: any) {
        console.error('Error fetching categories:', error);
        setCategories([]);
        addToast({
          type: 'error',
          description: 'Không thể tải danh sách danh mục. Vui lòng thử lại sau.',
        });
      } finally {
        setIsLoadingCategories(false);
      }
    };

    fetchCategories();
  }, [addToast]);

  const onSubmit = async (data: CourseFormData) => {
    try {
      // Map form data to CourseRequest format
      const courseData: CourseRequest = {
        title: data.title,
        description: data.description,
        price: data.price,
        categoryId: data.categoryId,
        imageUrl: data.imageUrl || undefined,
        totalDurationInHours: data.totalDurationInHours || undefined,
      };
      
      // Create course first
      const course = await createCourse.mutateAsync(courseData);
      
      // Upload image if there's a pending file
      if (pendingImageFile) {
        try {
          const uploadedImageUrl = await uploadCourseImage(course.id, pendingImageFile);
          // Update course with uploaded image URL
          await apiClient.put(`/v1/courses/${course.id}`, {
            ...courseData,
            imageUrl: uploadedImageUrl,
          });
        } catch (uploadError: any) {
          console.error('Error uploading image:', uploadError);
          // Don't fail the whole operation if image upload fails
          addToast({
            type: 'warning',
            description: 'Khóa học đã được tạo nhưng có lỗi khi upload ảnh. Bạn có thể cập nhật ảnh sau.',
          });
        }
      }
      
      addToast({
        type: 'success',
        description: `Khóa học "${course.title}" đã được tạo thành công! Khóa học đã được lưu ở trạng thái DRAFT.`,
      });
      // Redirect to courses list page to show the newly created course
      router.push(ROUTES.INSTRUCTOR.COURSES);
    } catch (error) {
      // Error already handled by hook
    }
  };

  const handleImageUpload = async (file: File): Promise<string> => {
    // Store the file to upload after course is created
    setPendingImageFile(file);
    // Return a temporary preview URL
    return URL.createObjectURL(file);
  };

  return (
    <div className="p-6 space-y-6 max-w-4xl mx-auto">
      {/* Header */}
      <div className="flex items-center space-x-4">
        <Button variant="ghost" size="icon" onClick={() => router.back()}>
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <div>
          <h1 className="text-3xl font-bold font-poppins">Tạo khóa học mới</h1>
          <p className="text-muted-foreground mt-1">
            Điền thông tin cơ bản của khóa học. Khóa học sẽ được lưu ở trạng thái DRAFT.
          </p>
        </div>
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Thông tin cơ bản</CardTitle>
            <CardDescription>
              Nhập tên, mô tả và các thông tin cơ bản của khóa học
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Title */}
            <div>
              <Label htmlFor="title">Tiêu đề khóa học *</Label>
              <Input
                id="title"
                {...register('title')}
                placeholder="Ví dụ: Lập trình React từ cơ bản đến nâng cao"
                className="mt-2"
              />
              {errors.title && (
                <p className="text-sm text-destructive mt-1">{errors.title.message}</p>
              )}
            </div>

            {/* Description */}
            <div>
              <Label htmlFor="description">Mô tả khóa học *</Label>
              <Textarea
                id="description"
                {...register('description')}
                placeholder="Mô tả chi tiết về khóa học, những gì học viên sẽ học được..."
                className="mt-2 min-h-[120px]"
              />
              {errors.description && (
                <p className="text-sm text-destructive mt-1">{errors.description.message}</p>
              )}
            </div>

            {/* Category */}
            <div>
              <Label htmlFor="categoryId">Danh mục *</Label>
              {isLoadingCategories ? (
                <div className="mt-2 text-sm text-muted-foreground">Đang tải danh mục...</div>
              ) : (
                <select
                  id="categoryId"
                  {...register('categoryId', { valueAsNumber: true })}
                  className="mt-2 flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  <option value="">-- Chọn danh mục --</option>
                  {Array.isArray(categories) && categories.length > 0 ? (
                    categories.map((category) => (
                      <option key={category.id} value={category.id}>
                        {category.name}
                      </option>
                    ))
                  ) : (
                    <option value="" disabled>Không có danh mục nào</option>
                  )}
                </select>
              )}
              {errors.categoryId && (
                <p className="text-sm text-destructive mt-1">{errors.categoryId.message}</p>
              )}
            </div>

            {/* Price */}
            <div>
              <Label htmlFor="price">Giá tiền (VNĐ) *</Label>
              <Input
                id="price"
                type="number"
                step="1000"
                min="0"
                {...register('price', { valueAsNumber: true })}
                placeholder="0"
                className="mt-2"
              />
              {errors.price && (
                <p className="text-sm text-destructive mt-1">{errors.price.message}</p>
              )}
              <p className="text-xs text-muted-foreground mt-1">
                Nhập 0 nếu khóa học miễn phí
              </p>
            </div>

            {/* Image Upload */}
            <div>
              <ImageUpload
                value={imageUrl}
                onChange={(url) => setValue('imageUrl', url)}
                onUpload={handleImageUpload}
                label="Ảnh bìa khóa học"
                maxSize={10}
                className="mt-2"
              />
              {errors.imageUrl && (
                <p className="text-sm text-destructive mt-1">{errors.imageUrl.message}</p>
              )}
              <p className="text-xs text-muted-foreground mt-1">
                Hoặc bạn có thể nhập URL ảnh trực tiếp vào trường bên dưới
              </p>
              <Input
                id="imageUrl"
                {...register('imageUrl')}
                placeholder="https://example.com/image.jpg (tùy chọn)"
                className="mt-2"
              />
            </div>

            {/* Total Duration */}
            <div>
              <Label htmlFor="totalDurationInHours">Tổng thời lượng (giờ)</Label>
              <Input
                id="totalDurationInHours"
                type="number"
                step="0.5"
                min="0"
                {...register('totalDurationInHours', { valueAsNumber: true })}
                placeholder="0"
                className="mt-2"
              />
              {errors.totalDurationInHours && (
                <p className="text-sm text-destructive mt-1">{errors.totalDurationInHours.message}</p>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Actions */}
        <div className="flex items-center justify-end space-x-4">
          <Button
            type="button"
            variant="outline"
            onClick={() => router.back()}
          >
            Hủy
          </Button>
          <Button
            type="submit"
            disabled={isSubmitting || createCourse.isPending}
          >
            <Save className="h-4 w-4 mr-2" />
            {isSubmitting || createCourse.isPending ? 'Đang tạo...' : 'Tạo khóa học'}
          </Button>
        </div>
      </form>
    </div>
  );
}


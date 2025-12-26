'use client';

import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { 
  User, 
  Mail,
  Linkedin,
  Github,
  Twitter,
  Globe,
  Save,
  Upload
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useAuthStore } from '@/stores/authStore';
import { useUIStore } from '@/stores/uiStore';

const profileSchema = z.object({
  bio: z.string().max(500, 'Bio không được vượt quá 500 ký tự').optional(),
  expertise: z.string().optional(),
  linkedin: z.string().url('URL không hợp lệ').optional().or(z.literal('')),
  github: z.string().url('URL không hợp lệ').optional().or(z.literal('')),
  twitter: z.string().url('URL không hợp lệ').optional().or(z.literal('')),
  website: z.string().url('URL không hợp lệ').optional().or(z.literal('')),
});

type ProfileFormData = z.infer<typeof profileSchema>;

export default function InstructorProfilePage() {
  const { user } = useAuthStore();
  const { addToast } = useUIStore();
  const [isLoading, setIsLoading] = React.useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<ProfileFormData>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      bio: user?.bio || '',
      expertise: '',
      linkedin: '',
      github: '',
      twitter: '',
      website: '',
    },
  });

  const onSubmit = async (data: ProfileFormData) => {
    setIsLoading(true);
    try {
      // TODO: Call API to update profile
      await new Promise(resolve => setTimeout(resolve, 1000)); // Simulate API call
      
      addToast({
        type: 'success',
        description: 'Cập nhật hồ sơ thành công!',
      });
    } catch (error) {
      addToast({
        type: 'error',
        description: 'Có lỗi xảy ra khi cập nhật hồ sơ.',
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="p-6 space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold font-poppins">Hồ sơ giảng viên</h1>
          <p className="text-muted-foreground mt-1">
            Cập nhật thông tin cá nhân và liên kết mạng xã hội
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Profile Info Card */}
          <Card>
            <CardHeader>
              <CardTitle>Thông tin cá nhân</CardTitle>
              <CardDescription>Thông tin cơ bản của bạn</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex flex-col items-center space-y-4">
                <div className="h-24 w-24 rounded-full bg-primary/10 flex items-center justify-center">
                  <User className="h-12 w-12 text-primary" />
                </div>
                <div className="text-center">
                  <h3 className="font-semibold text-lg">{user?.fullName || 'Giảng viên'}</h3>
                  <p className="text-sm text-muted-foreground">{user?.email}</p>
                </div>
                <Button variant="outline" size="sm" className="w-full">
                  <Upload className="h-4 w-4 mr-2" />
                  Cập nhật ảnh đại diện
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Edit Profile Form */}
          <div className="lg:col-span-2 space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Cập nhật hồ sơ</CardTitle>
                <CardDescription>
                  Chia sẻ thông tin về bản thân và chuyên môn của bạn
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                  {/* Bio */}
                  <div>
                    <Label htmlFor="bio">Giới thiệu</Label>
                    <Textarea
                      id="bio"
                      {...register('bio')}
                      placeholder="Viết một vài dòng giới thiệu về bản thân và kinh nghiệm của bạn..."
                      className="mt-2 min-h-[120px]"
                    />
                    {errors.bio && (
                      <p className="text-sm text-destructive mt-1">{errors.bio.message}</p>
                    )}
                    <p className="text-xs text-muted-foreground mt-1">
                      Tối đa 500 ký tự
                    </p>
                  </div>

                  {/* Expertise */}
                  <div>
                    <Label htmlFor="expertise">Chuyên môn</Label>
                    <Input
                      id="expertise"
                      {...register('expertise')}
                      placeholder="Ví dụ: React, Node.js, Python, UI/UX Design..."
                      className="mt-2"
                    />
                    <p className="text-xs text-muted-foreground mt-1">
                      Phân cách các kỹ năng bằng dấu phẩy
                    </p>
                  </div>

                  {/* Social Links */}
                  <div className="space-y-4">
                    <h3 className="font-semibold">Liên kết mạng xã hội</h3>
                    
                    <div>
                      <Label htmlFor="linkedin">LinkedIn</Label>
                      <div className="relative mt-2">
                        <Linkedin className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <Input
                          id="linkedin"
                          {...register('linkedin')}
                          placeholder="https://linkedin.com/in/yourprofile"
                          className="pl-10"
                        />
                      </div>
                      {errors.linkedin && (
                        <p className="text-sm text-destructive mt-1">{errors.linkedin.message}</p>
                      )}
                    </div>

                    <div>
                      <Label htmlFor="github">GitHub</Label>
                      <div className="relative mt-2">
                        <Github className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <Input
                          id="github"
                          {...register('github')}
                          placeholder="https://github.com/yourusername"
                          className="pl-10"
                        />
                      </div>
                      {errors.github && (
                        <p className="text-sm text-destructive mt-1">{errors.github.message}</p>
                      )}
                    </div>

                    <div>
                      <Label htmlFor="twitter">Twitter</Label>
                      <div className="relative mt-2">
                        <Twitter className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <Input
                          id="twitter"
                          {...register('twitter')}
                          placeholder="https://twitter.com/yourusername"
                          className="pl-10"
                        />
                      </div>
                      {errors.twitter && (
                        <p className="text-sm text-destructive mt-1">{errors.twitter.message}</p>
                      )}
                    </div>

                    <div>
                      <Label htmlFor="website">Website cá nhân</Label>
                      <div className="relative mt-2">
                        <Globe className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <Input
                          id="website"
                          {...register('website')}
                          placeholder="https://yourwebsite.com"
                          className="pl-10"
                        />
                      </div>
                      {errors.website && (
                        <p className="text-sm text-destructive mt-1">{errors.website.message}</p>
                      )}
                    </div>
                  </div>

                  {/* Submit Button */}
                  <div className="flex justify-end space-x-4 pt-4">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => reset()}
                    >
                      Hủy
                    </Button>
                    <Button type="submit" disabled={isLoading}>
                      <Save className="h-4 w-4 mr-2" />
                      {isLoading ? 'Đang lưu...' : 'Lưu thay đổi'}
                    </Button>
                  </div>
                </form>
              </CardContent>
            </Card>
          </div>
        </div>
    </div>
  );
}


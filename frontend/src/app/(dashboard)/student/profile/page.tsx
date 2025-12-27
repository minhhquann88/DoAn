'use client';

import React from 'react';
import { Camera, Mail, User as UserIcon, Phone, MapPin, Calendar, Save } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Separator } from '@/components/ui/separator';
import { useAuthStore } from '@/stores/authStore';
import { useUIStore } from '@/stores/uiStore';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { getProfile, uploadAvatar, updateProfile, changePassword } from '@/services/userService';
import { useSearchParams } from 'next/navigation';
import { Moon, Sun } from 'lucide-react';

const profileSchema = z.object({
  fullName: z.string().min(2, 'Tên phải có ít nhất 2 ký tự'),
  email: z.string().email('Email không hợp lệ'),
  phone: z.string().optional(),
  bio: z.string().max(500, 'Bio không được quá 500 ký tự').optional(),
  location: z.string().optional(),
});

const passwordSchema = z.object({
  currentPassword: z.string().min(1, 'Vui lòng nhập mật khẩu hiện tại'),
  newPassword: z.string()
    .min(6, 'Mật khẩu mới phải có ít nhất 6 ký tự')
    .regex(/[a-zA-Z]/, 'Mật khẩu phải chứa ít nhất một chữ cái')
    .regex(/[0-9]/, 'Mật khẩu phải chứa ít nhất một số'),
  confirmPassword: z.string(),
}).refine((data) => data.newPassword === data.confirmPassword, {
  message: 'Mật khẩu xác nhận không khớp',
  path: ['confirmPassword'],
});

type ProfileFormData = z.infer<typeof profileSchema>;
type PasswordFormData = z.infer<typeof passwordSchema>;

export default function ProfilePage() {
  const { user, updateUser } = useAuthStore();
  const { addToast, theme, toggleTheme } = useUIStore();
  const searchParams = useSearchParams();
  const [avatarPreview, setAvatarPreview] = React.useState<string | null>(null);
  const [avatarFile, setAvatarFile] = React.useState<File | null>(null);
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const [emailNotif, setEmailNotif] = React.useState(false);
  const [activeTab, setActiveTab] = React.useState('profile');
  const [changePassError, setChangePassError] = React.useState('');
  const [changePassSuccess, setChangePassSuccess] = React.useState('');
  const [profileSuccessMessage, setProfileSuccessMessage] = React.useState('');
  const fileInputRef = React.useRef<HTMLInputElement>(null);
  
  // Handle tab switching from query param
  React.useEffect(() => {
    const tab = searchParams.get('activeTab');
    if (tab === 'options' || tab === 'preferences') {
      setActiveTab('preferences');
    } else if (tab === 'security') {
      setActiveTab('security');
    } else if (tab === 'profile') {
      setActiveTab('profile');
    }
  }, [searchParams]);

  // Fetch fresh profile data from database on component mount
  React.useEffect(() => {
    async function loadFreshData() {
      try {
        console.log('ProfilePage: Loading fresh profile data from database...');
        const freshData = await getProfile();
        
        // Update form fields with fresh data from database
        resetProfile({
          fullName: freshData.fullName || '',
          email: freshData.email || '',
          phone: freshData.phoneNumber || '', // Map phoneNumber to phone
          bio: freshData.bio || '',
        });
        
        // Update avatar preview with fresh avatarUrl
        if (freshData.avatarUrl) {
          setAvatarPreview(freshData.avatarUrl);
        } else {
          setAvatarPreview(null);
        }
        
        // Update user in store with fresh data
        updateUser({
          fullName: freshData.fullName,
          email: freshData.email,
          phone: freshData.phoneNumber, // Map phoneNumber to phone
          bio: freshData.bio,
          avatar: freshData.avatarUrl,
        });
        
        console.log('ProfilePage: Fresh profile data loaded successfully', freshData);
      } catch (error) {
        console.error('ProfilePage: Failed to load fresh profile data', error);
        // Fallback to user context data if API call fails
      }
    }
    
    loadFreshData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  
  const {
    register: registerProfile,
    handleSubmit: handleSubmitProfile,
    reset: resetProfile,
    formState: { errors: profileErrors },
  } = useForm<ProfileFormData>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      fullName: user?.fullName || '',
      email: user?.email || '',
      phone: user?.phone || '',
      bio: user?.bio || '',
    },
  });
  
  const {
    register: registerPassword,
    handleSubmit: handleSubmitPassword,
    reset: resetPassword,
    formState: { errors: passwordErrors },
  } = useForm<PasswordFormData>({
    resolver: zodResolver(passwordSchema),
  });
  
  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setAvatarFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setAvatarPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };
  
  const handleAvatarClick = () => {
    fileInputRef.current?.click();
  };
  
  const onProfileSubmit = async (data: ProfileFormData) => {
    setIsSubmitting(true);
    setProfileSuccessMessage('');
    
    try {
      let avatarUrl: string | undefined;
      
      // Step 1: Upload avatar if a new file was selected
      if (avatarFile) {
        try {
          const avatarResponse = await uploadAvatar(avatarFile);
          avatarUrl = avatarResponse.avatarUrl;
        } catch (error: any) {
          addToast({
            type: 'error',
            description: error?.response?.data?.message || 'Lỗi khi tải ảnh đại diện',
          });
          setIsSubmitting(false);
          return;
        }
      }
      
      // Step 2: Update profile (excluding email for security)
      // Note: Backend only supports fullName, avatarUrl, and bio
      const updateData: any = {
        fullName: data.fullName,
        bio: data.bio || undefined,
      };
      
      // Add avatarUrl if avatar was uploaded
      if (avatarUrl) {
        updateData.avatarUrl = avatarUrl;
      }
      
      await updateProfile(updateData);
      
      // Step 3: Show success message and reload page after delay to update avatar/name in header
      setProfileSuccessMessage('Cập nhật hồ sơ thành công! Đang tải lại...');
      
      // Also show toast for consistency
      addToast({
        type: 'success',
        description: 'Cập nhật hồ sơ thành công!',
      });
      
      // Step 4: Clear avatar file state
      setAvatarFile(null);
      
      // Step 5: Force page reload to update avatar/name in header
      setTimeout(() => {
        window.location.reload();
      }, 1500);
      
    } catch (error: any) {
      addToast({
        type: 'error',
        description: error?.response?.data?.message || 'Có lỗi xảy ra khi cập nhật hồ sơ',
      });
      setIsSubmitting(false);
    }
  };
  
  const onPasswordSubmit = async (data: PasswordFormData) => {
    // Reset error and success messages
    setChangePassError('');
    setChangePassSuccess('');

    // Validate password match
    if (data.newPassword !== data.confirmPassword) {
      setChangePassError('Mật khẩu xác nhận không khớp');
      return;
    }

    try {
      await changePassword({
        oldPassword: data.currentPassword,
        newPassword: data.newPassword,
      });

      // Success: Set success message and clear form
      setChangePassSuccess('Đổi mật khẩu thành công!');
      resetPassword();
      
      // Also show toast for consistency
      addToast({
        type: 'success',
        description: 'Đổi mật khẩu thành công',
      });
    } catch (error: any) {
      // Handle error - capture error message from backend
      const errorMessage = error?.response?.data?.message || 'Đã có lỗi xảy ra khi đổi mật khẩu';
      setChangePassError(errorMessage);
      
      // Also show toast for consistency
      addToast({
        type: 'error',
        description: errorMessage,
      });
    }
  };

  // Clear error/success messages when user starts typing
  const handlePasswordFieldChange = () => {
    if (changePassError) {
      setChangePassError('');
    }
    if (changePassSuccess) {
      setChangePassSuccess('');
    }
  };
  
  return (
    <div className="min-h-screen bg-background">
      <div className="container max-w-4xl mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold font-poppins mb-2">Hồ sơ của tôi</h1>
          <p className="text-muted-foreground">
            Quản lý thông tin cá nhân và cài đặt tài khoản
          </p>
        </div>
        
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList>
            <TabsTrigger value="profile">Thông tin cá nhân</TabsTrigger>
            <TabsTrigger value="security">Bảo mật</TabsTrigger>
            <TabsTrigger value="preferences">Tùy chọn</TabsTrigger>
          </TabsList>
          
          {/* Profile Tab */}
          <TabsContent value="profile">
            <Card>
              <CardHeader>
                <CardTitle>Thông tin cá nhân</CardTitle>
                <CardDescription>
                  Cập nhật thông tin và ảnh đại diện của bạn
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmitProfile(onProfileSubmit)} className="space-y-6">
                  {/* Success Alert */}
                  {profileSuccessMessage && (
                    <div className="p-3 mb-4 text-sm rounded-md bg-green-50 border border-green-200 text-green-600">
                      {profileSuccessMessage}
                    </div>
                  )}
                  
                  {/* Avatar Upload */}
                  <div className="flex items-center gap-6">
                    <Avatar className="h-24 w-24">
                      <AvatarImage src={avatarPreview || user?.avatar} />
                      <AvatarFallback className="text-2xl">
                        {user?.fullName?.charAt(0).toUpperCase() || 'U'}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <Label
                        htmlFor="avatar"
                        onClick={handleAvatarClick}
                        className="cursor-pointer inline-flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 transition-colors"
                      >
                        <Camera className="h-4 w-4" />
                        Thay đổi ảnh đại diện
                      </Label>
                      <input
                        ref={fileInputRef}
                        id="avatar"
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={handleAvatarChange}
                      />
                      <p className="text-sm text-muted-foreground mt-2">
                        JPG, PNG hoặc GIF. Tối đa 2MB.
                      </p>
                    </div>
                  </div>
                  
                  <Separator />
                  
                  {/* Form Fields */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <Label htmlFor="fullName">
                        Họ và tên <span className="text-destructive">*</span>
                      </Label>
                      <div className="relative">
                        <UserIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <Input
                          id="fullName"
                          placeholder="Nguyễn Văn A"
                          className="pl-10"
                          {...registerProfile('fullName')}
                        />
                      </div>
                      {profileErrors.fullName && (
                        <p className="text-sm text-destructive">{profileErrors.fullName.message}</p>
                      )}
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="email">Email</Label>
                      <div className="relative">
                        <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <Input
                          id="email"
                          type="email"
                          placeholder="email@example.com"
                          className="pl-10 bg-gray-100 text-gray-500 cursor-not-allowed"
                          {...registerProfile('email')}
                          disabled
                          readOnly
                        />
                      </div>
                      {profileErrors.email && (
                        <p className="text-sm text-destructive">{profileErrors.email.message}</p>
                      )}
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="phone">Số điện thoại</Label>
                      <div className="relative">
                        <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <Input
                          id="phone"
                          placeholder="0123456789"
                          className="pl-10"
                          {...registerProfile('phone')}
                        />
                      </div>
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="location">Vị trí</Label>
                      <div className="relative">
                        <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <Input
                          id="location"
                          placeholder="Hà Nội, Việt Nam"
                          className="pl-10"
                          {...registerProfile('location')}
                        />
                      </div>
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="bio">Giới thiệu bản thân</Label>
                    <Textarea
                      id="bio"
                      placeholder="Viết vài dòng về bản thân..."
                      rows={4}
                      {...registerProfile('bio')}
                    />
                    {profileErrors.bio && (
                      <p className="text-sm text-destructive">{profileErrors.bio.message}</p>
                    )}
                  </div>
                  
                  <div className="flex items-center justify-between pt-4">
                    <p className="text-sm text-muted-foreground">
                      <Calendar className="h-4 w-4 inline mr-1" />
                      Tham gia ngày {new Date(user?.createdAt || '').toLocaleDateString('vi-VN')}
                    </p>
                    <Button type="submit" disabled={isSubmitting}>
                      <Save className="h-4 w-4 mr-2" />
                      {isSubmitting ? 'Đang lưu...' : 'Lưu thay đổi'}
                    </Button>
                  </div>
                </form>
              </CardContent>
            </Card>
          </TabsContent>
          
          {/* Security Tab */}
          <TabsContent value="security">
            <Card>
              <CardHeader>
                <CardTitle>Đổi mật khẩu</CardTitle>
                <CardDescription>
                  Cập nhật mật khẩu để bảo mật tài khoản
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmitPassword(onPasswordSubmit)} className="space-y-6">
                  {/* Error Alert */}
                  {changePassError && (
                    <div className="p-3 mb-4 text-sm rounded-md bg-red-50 border border-red-200 text-red-600">
                      {changePassError}
                    </div>
                  )}
                  
                  {/* Success Alert */}
                  {changePassSuccess && (
                    <div className="p-3 mb-4 text-sm rounded-md bg-green-50 border border-green-200 text-green-600">
                      {changePassSuccess}
                    </div>
                  )}
                  
                  <div className="space-y-2">
                    <Label htmlFor="currentPassword">
                      Mật khẩu hiện tại <span className="text-destructive">*</span>
                    </Label>
                    <Input
                      id="currentPassword"
                      type="password"
                      {...registerPassword('currentPassword', {
                        onChange: handlePasswordFieldChange,
                      })}
                      className={changePassError ? 'border-red-500' : ''}
                    />
                    {passwordErrors.currentPassword && (
                      <p className="text-sm text-destructive">{passwordErrors.currentPassword.message}</p>
                    )}
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="newPassword">
                      Mật khẩu mới <span className="text-destructive">*</span>
                    </Label>
                    <Input
                      id="newPassword"
                      type="password"
                      {...registerPassword('newPassword', {
                        onChange: handlePasswordFieldChange,
                      })}
                      className={changePassError ? 'border-red-500' : ''}
                    />
                    {passwordErrors.newPassword && (
                      <p className="text-sm text-destructive">{passwordErrors.newPassword.message}</p>
                    )}
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="confirmPassword">
                      Xác nhận mật khẩu mới <span className="text-destructive">*</span>
                    </Label>
                    <Input
                      id="confirmPassword"
                      type="password"
                      {...registerPassword('confirmPassword', {
                        onChange: handlePasswordFieldChange,
                      })}
                      className={changePassError ? 'border-red-500' : ''}
                    />
                    {passwordErrors.confirmPassword && (
                      <p className="text-sm text-destructive">{passwordErrors.confirmPassword.message}</p>
                    )}
                  </div>
                  
                  <Button type="submit">
                    Đổi mật khẩu
                  </Button>
                </form>
              </CardContent>
            </Card>
          </TabsContent>
          
          {/* Preferences Tab */}
          <TabsContent value="preferences">
            <Card>
              <CardHeader>
                <CardTitle>Tùy chọn</CardTitle>
                <CardDescription>
                  Cài đặt hiển thị và thông báo
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium">Thông báo email</p>
                      <p className="text-sm text-muted-foreground">
                        Nhận email về khóa học và cập nhật
                      </p>
                    </div>
                    <Button 
                      variant="outline"
                      onClick={() => {
                        setEmailNotif(!emailNotif);
                        addToast({
                          type: 'success',
                          description: 'Đã cập nhật cài đặt thông báo email.',
                        });
                      }}
                    >
                      {emailNotif ? 'Tắt' : 'Bật'}
                    </Button>
                  </div>
                  
                  <Separator />
                  
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium">Chế độ tối</p>
                      <p className="text-sm text-muted-foreground">
                        Tự động chuyển đổi giao diện
                      </p>
                    </div>
                    <Button 
                      variant="outline"
                      onClick={toggleTheme}
                      className="flex items-center gap-2"
                    >
                      {theme === 'dark' ? (
                        <>
                          <Sun className="h-4 w-4" />
                          <span>Bật sáng</span>
                        </>
                      ) : (
                        <>
                          <Moon className="h-4 w-4" />
                          <span>Bật tối</span>
                        </>
                      )}
                    </Button>
                  </div>
                  
                  <Separator />
                  
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium">Ngôn ngữ</p>
                      <p className="text-sm text-muted-foreground">
                        Tiếng Việt
                      </p>
                    </div>
                    <Button 
                      variant="outline"
                      onClick={() => {
                        addToast({
                          type: 'info',
                          description: 'Tính năng đa ngôn ngữ đang được phát triển.',
                        });
                      }}
                    >
                      Thay đổi
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}


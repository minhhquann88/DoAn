'use client';

import React from 'react';
import Link from 'next/link';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { ArrowLeft, BookOpen, Mail } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { useAuth } from '@/hooks/useAuth';
import { ROUTES } from '@/lib/constants';

const forgotPasswordSchema = z.object({
  email: z.string().email('Email không hợp lệ'),
});

type ForgotPasswordFormData = z.infer<typeof forgotPasswordSchema>;

export default function ForgotPasswordPage() {
  const [isSuccess, setIsSuccess] = React.useState(false);
  const { forgotPassword, isForgotPasswordLoading } = useAuth();
  
  const {
    register,
    handleSubmit,
    formState: { errors },
    watch,
  } = useForm<ForgotPasswordFormData>({
    resolver: zodResolver(forgotPasswordSchema),
  });
  
  const email = watch('email');
  
  const onSubmit = (data: ForgotPasswordFormData) => {
    forgotPassword(data.email);
    setIsSuccess(true);
  };
  
  if (isSuccess) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary/5 via-secondary/5 to-accent/5 p-4">
        <div className="w-full max-w-md">
          <Link href={ROUTES.HOME} className="flex items-center justify-center space-x-2 mb-8">
            <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary">
              <BookOpen className="h-7 w-7 text-primary-foreground" />
            </div>
            <span className="font-poppins text-2xl font-bold">EduLearn</span>
          </Link>
          
          <Card className="shadow-lg">
            <CardHeader className="text-center">
              <div className="mx-auto mb-4 flex h-20 w-20 items-center justify-center rounded-full bg-accent/10">
                <Mail className="h-10 w-10 text-accent" />
              </div>
              <CardTitle className="text-2xl font-bold">Kiểm tra email của bạn</CardTitle>
              <CardDescription>
                Chúng tôi đã gửi link đặt lại mật khẩu đến
              </CardDescription>
            </CardHeader>
            
            <CardContent className="text-center">
              <p className="text-sm font-medium">{email}</p>
              <p className="mt-4 text-sm text-muted-foreground">
                Vui lòng kiểm tra hộp thư đến và làm theo hướng dẫn để đặt lại mật khẩu.
              </p>
              <p className="mt-2 text-sm text-muted-foreground">
                Không nhận được email?{' '}
                <button
                  onClick={() => setIsSuccess(false)}
                  className="text-primary hover:underline font-medium"
                >
                  Gửi lại
                </button>
              </p>
            </CardContent>
            
            <CardFooter>
              <Button
                variant="outline"
                className="w-full"
                onClick={() => window.location.href = ROUTES.LOGIN}
              >
                <ArrowLeft className="mr-2 h-4 w-4" />
                Quay lại đăng nhập
              </Button>
            </CardFooter>
          </Card>
        </div>
      </div>
    );
  }
  
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary/5 via-secondary/5 to-accent/5 p-4">
      <div className="w-full max-w-md">
        {/* Logo */}
        <Link href={ROUTES.HOME} className="flex items-center justify-center space-x-2 mb-8">
          <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary">
            <BookOpen className="h-7 w-7 text-primary-foreground" />
          </div>
          <span className="font-poppins text-2xl font-bold">EduLearn</span>
        </Link>
        
        <Card className="shadow-lg">
          <CardHeader className="space-y-1">
            <CardTitle className="text-2xl font-bold text-center">Quên mật khẩu?</CardTitle>
            <CardDescription className="text-center">
              Nhập email của bạn để nhận link đặt lại mật khẩu
            </CardDescription>
          </CardHeader>
          
          <CardContent>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              {/* Email */}
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="email@example.com"
                  {...register('email')}
                  className={errors.email ? 'border-destructive' : ''}
                />
                {errors.email && (
                  <p className="text-sm text-destructive">{errors.email.message}</p>
                )}
              </div>
              
              {/* Submit Button */}
              <Button 
                type="submit" 
                className="w-full" 
                size="lg"
                disabled={isForgotPasswordLoading}
              >
                {isForgotPasswordLoading ? 'Đang gửi...' : 'Gửi link đặt lại mật khẩu'}
              </Button>
            </form>
          </CardContent>
          
          <CardFooter>
            <Link href={ROUTES.LOGIN} className="w-full">
              <Button variant="ghost" className="w-full">
                <ArrowLeft className="mr-2 h-4 w-4" />
                Quay lại đăng nhập
              </Button>
            </Link>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
}


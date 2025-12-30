'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/stores/authStore';
import { ROUTES } from '@/lib/constants';
import { AdminLayout } from '@/components/layout/AdminLayout';

interface AdminLayoutRouteProps {
  children: React.ReactNode;
}

export default function AdminLayoutRoute({ children }: AdminLayoutRouteProps) {
  const router = useRouter();
  const { user, isLoading } = useAuthStore();
  const [isChecking, setIsChecking] = React.useState(true);

  // Role-based redirection: Protect Admin routes - CHỈ ADMIN mới được truy cập
  React.useEffect(() => {
    if (!isLoading && user) {
      // CHỈ ADMIN mới được truy cập, không cho LECTURER hay STUDENT
      if (user.role !== 'ROLE_ADMIN') {
        // Redirect non-admin users to their appropriate dashboard
        if (user.role === 'ROLE_LECTURER') {
          router.replace(ROUTES.INSTRUCTOR.DASHBOARD);
        } else if (user.role === 'ROLE_STUDENT') {
          router.replace(ROUTES.STUDENT.DASHBOARD);
        } else {
          router.replace(ROUTES.LOGIN);
        }
        return;
      }
      setIsChecking(false);
    } else if (!isLoading && !user) {
      // Not authenticated, redirect to login
      router.replace(ROUTES.LOGIN);
    }
  }, [user, isLoading, router]);

  // Prevent rendering children (and triggering API calls) while checking or if invalid role
  if (isLoading || isChecking || !user || user.role !== 'ROLE_ADMIN') {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Đang kiểm tra quyền truy cập...</p>
        </div>
      </div>
    );
  }

  return <AdminLayout>{children}</AdminLayout>;
}

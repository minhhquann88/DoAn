'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/stores/authStore';
import { ROUTES } from '@/lib/constants';

interface StudentLayoutProps {
  children: React.ReactNode;
}

export default function StudentLayout({ children }: StudentLayoutProps) {
  const router = useRouter();
  const { user, isLoading } = useAuthStore();
  const [isChecking, setIsChecking] = React.useState(true);

  // Role-based redirection: Protect Student routes
  React.useEffect(() => {
    if (!isLoading && user) {
      // If user is NOT a STUDENT (e.g., is INSTRUCTOR or ADMIN), redirect them to their own dashboard
      if (user.role !== 'ROLE_STUDENT') {
        if (user.role === 'ROLE_LECTURER') {
          router.replace(ROUTES.INSTRUCTOR.DASHBOARD);
        } else if (user.role === 'ROLE_ADMIN') {
          router.replace(ROUTES.ADMIN_DASHBOARD);
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
  if (isLoading || isChecking || !user || user.role !== 'ROLE_STUDENT') {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Đang kiểm tra quyền truy cập...</p>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}


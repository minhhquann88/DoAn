'use client';

import { usePathname } from 'next/navigation';
import { DashboardLayout } from '@/components/layout/DashboardLayout';

export default function Layout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  
  // Admin routes use AdminLayout, not DashboardLayout
  // AdminLayout is already applied in admin/layout.tsx
  if (pathname?.startsWith('/admin')) {
    return <>{children}</>;
  }
  
  return <DashboardLayout>{children}</DashboardLayout>;
}


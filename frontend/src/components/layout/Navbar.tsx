'use client';

import React from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Search, Bell, ShoppingCart, User, LogOut, BookOpen, Menu } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { useAuthStore } from '@/stores/authStore';
import { useCartStore } from '@/stores/cartStore';
import { useUIStore } from '@/stores/uiStore';
import { ROUTES } from '@/lib/constants';
import { useQuery } from '@tanstack/react-query';
import { getUnreadCount, getNotifications, markAsRead, markAllAsRead, type Notification } from '@/services/notificationService';

export function Navbar() {
  const router = useRouter();
  const { user, isAuthenticated, logout } = useAuthStore();
  const { cart, fetchCart } = useCartStore();
  const { toggleTheme, theme } = useUIStore();
  const [searchQuery, setSearchQuery] = React.useState('');
  
  // Fetch unread notification count
  const { data: unreadCount = 0, refetch: refetchUnreadCount } = useQuery({
    queryKey: ['notifications-unread-count'],
    queryFn: getUnreadCount,
    enabled: isAuthenticated,
    refetchInterval: 30000, // Refetch every 30 seconds
  });
  
  // Fetch notifications
  const { data: notificationsData, refetch: refetchNotifications } = useQuery({
    queryKey: ['notifications'],
    queryFn: () => getNotifications(0, 10),
    enabled: isAuthenticated,
  });
  
  const notifications = notificationsData?.content || [];
  
  // Get cart count from store
  const cartCount = cart?.itemCount || 0;
  
  React.useEffect(() => {
    // Only fetch cart if user is fully authenticated and is a student
    // Check if token exists in localStorage before making API call
    if (isAuthenticated && user?.role === 'ROLE_STUDENT' && user?.id) {
      // Check if token exists
      const token = typeof window !== 'undefined' 
        ? localStorage.getItem('auth_token') 
        : null;
      
      if (!token) {
        // No token, skip fetching cart
        return;
      }
      
      // Small delay to ensure authentication token is ready
      const timer = setTimeout(() => {
        fetchCart().catch((error) => {
          // Silently handle 400/401 errors (user might not be fully authenticated yet)
          if (error.response?.status === 400 || error.response?.status === 401) {
            // Don't log these errors - they're expected during initial load
            return;
          }
          // Only log unexpected errors
          if (error.response?.status !== 400 && error.response?.status !== 401) {
            console.error('Error fetching cart:', error);
          }
        });
      }, 200); // Increased delay to 200ms to ensure token is set
      
      return () => clearTimeout(timer);
    }
  }, [isAuthenticated, user?.role, user?.id, fetchCart]);
  
  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      router.push(`${ROUTES.COURSES}?keyword=${encodeURIComponent(searchQuery)}`);
    }
  };
  
  const handleLogout = () => {
    logout();
    router.push(ROUTES.LOGIN);
  };
  
  const getDashboardRoute = () => {
    if (user?.role === 'ROLE_ADMIN') return ROUTES.ADMIN_DASHBOARD;
    if (user?.role === 'ROLE_LECTURER') return ROUTES.INSTRUCTOR.DASHBOARD;
    return ROUTES.STUDENT.DASHBOARD;
  };
  
  const getMyCoursesRoute = () => {
    if (user?.role === 'ROLE_LECTURER') return ROUTES.INSTRUCTOR.COURSES;
    return ROUTES.STUDENT.MY_COURSES;
  };
  
  const getProfileRoute = () => {
    if (user?.role === 'ROLE_ADMIN') return ROUTES.ADMIN_SETTINGS;
    if (user?.role === 'ROLE_LECTURER') return ROUTES.INSTRUCTOR.PROFILE;
    return ROUTES.STUDENT.PROFILE;
  };
  
  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto flex h-16 items-center justify-between px-4">
        {/* Logo */}
        <Link href={ROUTES.HOME} className="flex items-center space-x-2">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary">
            <BookOpen className="h-6 w-6 text-primary-foreground" />
          </div>
          <span className="font-poppins text-xl font-bold hidden sm:inline-block">
            EduLearn
          </span>
        </Link>
        
        {/* Search Bar - Desktop */}
        <form onSubmit={handleSearch} className="hidden md:flex flex-1 max-w-md mx-8">
          <div className="relative w-full">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              type="search"
              placeholder="Tìm kiếm khóa học..."
              className="pl-10"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </form>
        
        {/* Right Side Actions */}
        <div className="flex items-center space-x-4">
          {/* Mobile Menu Button */}
          <Button variant="ghost" size="icon" className="md:hidden">
            <Menu className="h-5 w-5" />
          </Button>
          
          {/* Navigation Links */}
          {isAuthenticated ? (
            <>
              {/* Notifications */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon" className="relative">
                    <Bell className="h-5 w-5" />
                    {unreadCount > 0 && (
                      <Badge 
                        variant="destructive" 
                        className="absolute -top-1 -right-1 h-5 w-5 rounded-full p-0 flex items-center justify-center text-xs"
                      >
                        {unreadCount > 99 ? '99+' : unreadCount}
                      </Badge>
                    )}
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="w-80 p-0" align="end">
                  <div className="flex items-center justify-between p-4 border-b">
                    <h3 className="font-semibold">Thông báo</h3>
                    {unreadCount > 0 && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={async (e) => {
                          e.stopPropagation();
                          try {
                            await markAllAsRead();
                            refetchUnreadCount();
                            refetchNotifications();
                          } catch (error) {
                            console.error('Error marking all as read:', error);
                          }
                        }}
                      >
                        Đánh dấu tất cả đã đọc
                      </Button>
                    )}
                  </div>
                  <div className="max-h-[400px] overflow-y-auto">
                    {notifications.length === 0 ? (
                      <div className="p-8 text-center text-muted-foreground">
                        <Bell className="h-8 w-8 mx-auto mb-2 opacity-50" />
                        <p>Chưa có thông báo nào</p>
                      </div>
                    ) : (
                      <div className="divide-y">
                        {notifications.map((notification) => (
                          <div
                            key={notification.id}
                            className={`p-4 hover:bg-muted/50 cursor-pointer transition-colors ${
                              !notification.isRead ? 'bg-primary/5' : ''
                            }`}
                            onClick={async () => {
                              // Đánh dấu đã đọc
                              if (!notification.isRead) {
                                try {
                                  await markAsRead(notification.id);
                                  refetchUnreadCount();
                                  refetchNotifications();
                                } catch (error) {
                                  console.error('Error marking as read:', error);
                                }
                              }
                              
                              // Chuyển đến trang liên quan nếu có actionUrl
                              if (notification.actionUrl) {
                                router.push(notification.actionUrl);
                              }
                            }}
                          >
                            <div className="flex items-start gap-3">
                              <div className={`h-2 w-2 rounded-full mt-2 flex-shrink-0 ${
                                !notification.isRead ? 'bg-primary' : 'bg-transparent'
                              }`} />
                              <div className="flex-1 min-w-0">
                                <p className={`text-sm ${!notification.isRead ? 'font-semibold' : ''}`}>
                                  {notification.message}
                                </p>
                                {notification.courseTitle && (
                                  <p className="text-xs text-muted-foreground mt-1">
                                    {notification.courseTitle}
                                  </p>
                                )}
                                <p className="text-xs text-muted-foreground mt-1">
                                  {new Date(notification.createdAt).toLocaleString('vi-VN')}
                                </p>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </DropdownMenuContent>
              </DropdownMenu>
              
              {/* Shopping Cart - Only for students */}
              {user?.role === 'ROLE_STUDENT' && (
                <Button 
                  variant="ghost" 
                  size="icon" 
                  className="relative"
                  asChild
                >
                  <Link href={ROUTES.STUDENT.CART}>
                    <ShoppingCart className="h-5 w-5" />
                    {cartCount > 0 && (
                      <Badge 
                        variant="destructive" 
                        className="absolute -top-1 -right-1 h-5 w-5 rounded-full p-0 flex items-center justify-center text-xs"
                      >
                        {cartCount > 99 ? '99+' : cartCount}
                      </Badge>
                    )}
                  </Link>
                </Button>
              )}
              
              {/* User Menu */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="relative h-10 w-10 rounded-full">
                    <Avatar>
                      <AvatarImage src={user?.avatar} alt={user?.fullName} />
                      <AvatarFallback>
                        {user?.fullName?.charAt(0).toUpperCase() || 'U'}
                      </AvatarFallback>
                    </Avatar>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="w-56" align="end">
                  <DropdownMenuLabel>
                    <div className="flex flex-col space-y-1">
                      <p className="text-sm font-medium leading-none">{user?.fullName}</p>
                      <p className="text-xs leading-none text-muted-foreground">
                        {user?.email}
                      </p>
                    </div>
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  {/* Student Menu: Dashboard, Khóa học của tôi, Đăng xuất */}
                  {/* Note: "Cài đặt" and "Tiến độ học tập" have been removed as requested */}
                  <DropdownMenuItem onClick={() => router.push(getDashboardRoute())}>
                    <User className="mr-2 h-4 w-4" />
                    <span>Dashboard</span>
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => router.push(getMyCoursesRoute())}>
                    <BookOpen className="mr-2 h-4 w-4" />
                    <span>Khóa học của tôi</span>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={handleLogout}>
                    <LogOut className="mr-2 h-4 w-4" />
                    <span>Đăng xuất</span>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </>
          ) : (
            <>
              <Button variant="ghost" onClick={() => router.push(ROUTES.LOGIN)}>
                Đăng nhập
              </Button>
              <Button onClick={() => router.push(ROUTES.REGISTER)}>
                Đăng ký
              </Button>
            </>
          )}
        </div>
      </div>
      
      {/* Mobile Search */}
      <div className="md:hidden border-t px-4 py-3">
        <form onSubmit={handleSearch}>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              type="search"
              placeholder="Tìm kiếm khóa học..."
              className="pl-10"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </form>
      </div>
    </header>
  );
}


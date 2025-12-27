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
import { useUIStore } from '@/stores/uiStore';
import { ROUTES } from '@/lib/constants';

export function Navbar() {
  const router = useRouter();
  const { user, isAuthenticated, logout } = useAuthStore();
  const { toggleTheme, theme } = useUIStore();
  const [searchQuery, setSearchQuery] = React.useState('');
  const [notificationCount, setNotificationCount] = React.useState(0);
  const [cartCount, setCartCount] = React.useState(0);
  const [isLoadingNotifications, setIsLoadingNotifications] = React.useState(false);
  
  React.useEffect(() => {
    if (isAuthenticated) {
      // TODO: Fetch notification count from API
      // const fetchNotifications = async () => {
      //   try {
      //     setIsLoadingNotifications(true);
      //     const response = await fetch('/api/notifications/unread-count');
      //     const data = await response.json();
      //     setNotificationCount(data.count || 0);
      //   } catch (error) {
      //     console.error('Error fetching notifications:', error);
      //   } finally {
      //     setIsLoadingNotifications(false);
      //   }
      // };
      // fetchNotifications();
      
      // TODO: Fetch cart count from API
      // const fetchCartCount = async () => {
      //   try {
      //     const response = await fetch('/api/cart/count');
      //     const data = await response.json();
      //     setCartCount(data.count || 0);
      //   } catch (error) {
      //     console.error('Error fetching cart count:', error);
      //   }
      // };
      // if (user?.role === 'ROLE_STUDENT') {
      //   fetchCartCount();
      // }
    }
  }, [isAuthenticated, user?.role]);
  
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
              <Button variant="ghost" size="icon" className="relative">
                <Bell className="h-5 w-5" />
                {notificationCount > 0 && (
                <Badge 
                  variant="destructive" 
                  className="absolute -top-1 -right-1 h-5 w-5 rounded-full p-0 flex items-center justify-center text-xs"
                >
                    {notificationCount > 99 ? '99+' : notificationCount}
                </Badge>
                )}
              </Button>
              
              {/* Shopping Cart - Only for students */}
              {user?.role === 'ROLE_STUDENT' && (
                <Button variant="ghost" size="icon" className="relative">
                  <ShoppingCart className="h-5 w-5" />
                  {cartCount > 0 && (
                  <Badge 
                    variant="secondary" 
                    className="absolute -top-1 -right-1 h-5 w-5 rounded-full p-0 flex items-center justify-center text-xs"
                  >
                      {cartCount > 99 ? '99+' : cartCount}
                  </Badge>
                  )}
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


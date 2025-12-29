/**
 * Next.js Middleware - Handle authentication and routing
 * Uses cookies for server-side authentication check (since localStorage is not available)
 */
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// Public routes that don't require authentication
const publicRoutes = ['/login', '/register', '/forgot-password', '/reset-password', '/', '/courses', '/about', '/contact', '/faq', '/terms', '/privacy', '/help', '/instructors'];

// Protected routes that require authentication
const protectedRoutes = ['/student', '/instructor', '/admin'];

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  
  // Check if route is protected
  const isProtectedRoute = protectedRoutes.some(route => 
    pathname.startsWith(route)
  );
  
  // Check if route is public
  const isPublicRoute = publicRoutes.some(route => 
    pathname === route || pathname.startsWith(route + '/')
  );
  
  // Get token from cookie
  const token = request.cookies.get('token')?.value;
  
  // If accessing protected route without token, redirect to login
  if (isProtectedRoute && !token) {
    const loginUrl = new URL('/login', request.url);
    loginUrl.searchParams.set('redirect', pathname);
    return NextResponse.redirect(loginUrl);
  }
  
  // If accessing login page with valid token, redirect to appropriate dashboard
  // (We can't determine role from token in middleware, so redirect to student as default)
  if (pathname === '/login' && token) {
    return NextResponse.redirect(new URL('/student', request.url));
  }
  
  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    '/((?!api|_next/static|_next/image|favicon.ico).*)',
  ],
};


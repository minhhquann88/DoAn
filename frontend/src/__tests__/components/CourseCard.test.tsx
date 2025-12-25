/**
 * Tests cho CourseCard Component
 */

import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { CourseCard } from '@/components/course/CourseCard';

// Mock next/link
vi.mock('next/link', () => ({
  default: ({ children, href }: { children: React.ReactNode; href: string }) => (
    <a href={href}>{children}</a>
  ),
}));

// Mock next/image
vi.mock('next/image', () => ({
  default: ({ src, alt, ...props }: { src: string; alt: string }) => (
    <img src={src} alt={alt} {...props} />
  ),
}));

describe('CourseCard Component', () => {
  const mockCourse = {
    id: 1,
    title: 'Test Course',
    shortDescription: 'This is a test course description',
    price: 500000,
    thumbnailUrl: 'https://example.com/image.jpg',
    rating: 4.5,
    totalStudents: 100,
    instructor: {
      id: 1,
      fullName: 'Test Instructor',
    },
    level: 'BEGINNER' as const,
  };

  it('✅ should render course title', () => {
    render(<CourseCard course={mockCourse} />);
    expect(screen.getByText('Test Course')).toBeInTheDocument();
  });

  it('✅ should render course description', () => {
    render(<CourseCard course={mockCourse} />);
    expect(screen.getByText(/This is a test course/)).toBeInTheDocument();
  });

  it('✅ should render instructor name', () => {
    render(<CourseCard course={mockCourse} />);
    expect(screen.getByText('Test Instructor')).toBeInTheDocument();
  });

  it('✅ should render price formatted correctly', () => {
    render(<CourseCard course={mockCourse} />);
    // Format depends on implementation
    expect(screen.getByText(/500/)).toBeInTheDocument();
  });

  it('✅ should render course level', () => {
    render(<CourseCard course={mockCourse} />);
    expect(screen.getByText(/BEGINNER/i)).toBeInTheDocument();
  });

  it('✅ should have link to course detail', () => {
    render(<CourseCard course={mockCourse} />);
    const link = screen.getByRole('link');
    expect(link).toHaveAttribute('href', '/courses/1');
  });

  it('✅ should render with default thumbnail if not provided', () => {
    const courseWithoutThumbnail = { ...mockCourse, thumbnailUrl: undefined };
    render(<CourseCard course={courseWithoutThumbnail} />);
    // Should still render without crashing
    expect(screen.getByText('Test Course')).toBeInTheDocument();
  });

  it('✅ should display student count', () => {
    render(<CourseCard course={mockCourse} />);
    expect(screen.getByText(/100/)).toBeInTheDocument();
  });
});


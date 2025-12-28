'use client';

import React from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { Clock, Users, Star, BookOpen, TrendingUp, PlayCircle } from 'lucide-react';
import { Card, CardContent, CardFooter } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Progress } from '@/components/ui/progress';
import { Course } from '@/types';
import { ROUTES, COURSE_LEVEL_LABELS } from '@/lib/constants';

interface CourseCardProps {
  course: Course;
  priority?: boolean; // For LCP optimization: prioritize first 4 images
}

export function CourseCard({ course, priority = false }: CourseCardProps) {
  const router = useRouter();
  const discountPercentage = course.discountPrice 
    ? Math.round(((course.price - course.discountPrice) / course.price) * 100)
    : 0;
  
  const handleCardClick = () => {
    router.push(ROUTES.COURSE_DETAIL(course.id.toString()));
  };
  
  return (
    <Card 
      className="group h-full overflow-hidden transition-all duration-300 hover:shadow-lg hover:-translate-y-1 cursor-pointer"
      onClick={handleCardClick}
    >
        {/* Thumbnail */}
        <div className="relative aspect-video w-full overflow-hidden bg-muted">
          {course.imageUrl || course.thumbnail ? (
            <Image
              src={course.imageUrl || course.thumbnail || ''}
              alt={course.title}
              fill
              priority={priority}
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
              className="object-cover transition-transform duration-300 group-hover:scale-105"
            />
          ) : (
            <div className="flex h-full items-center justify-center">
              <BookOpen className="h-16 w-16 text-muted-foreground" />
            </div>
          )}
          
          {/* Badges */}
          <div className="absolute top-2 left-2 flex flex-wrap gap-2">
            {course.isFeatured && (
              <Badge className="bg-accent text-accent-foreground">
                <TrendingUp className="mr-1 h-3 w-3" />
                Nổi bật
              </Badge>
            )}
            {discountPercentage > 0 && (
              <Badge variant="destructive">
                -{discountPercentage}%
              </Badge>
            )}
          </div>
          
          {/* Level Badge */}
          <div className="absolute top-2 right-2">
            <Badge variant="secondary">
              {COURSE_LEVEL_LABELS[course.level]}
            </Badge>
          </div>
        </div>
        
        <CardContent className="p-4 space-y-3">
          {/* Category */}
          {course.category && (
            <div className="flex items-center gap-2">
              <Badge variant="outline" className="text-xs">
                {course.category.name}
              </Badge>
            </div>
          )}
          
          {/* Title */}
          <h3 className="font-semibold text-lg line-clamp-2 group-hover:text-primary transition-colors">
            {course.title}
          </h3>
          
          {/* Description */}
          {course.shortDescription && (
            <p className="text-sm text-muted-foreground line-clamp-2">
              {course.shortDescription}
            </p>
          )}
          
          {/* Instructor */}
          <div className="flex items-center gap-2">
            <Avatar className="h-6 w-6">
              <AvatarImage src={course.instructor.avatar} />
              <AvatarFallback className="text-xs">
                {course.instructor.fullName.charAt(0)}
              </AvatarFallback>
            </Avatar>
            <span className="text-sm text-muted-foreground">
              {course.instructor.fullName}
            </span>
          </div>
          
          {/* Stats */}
          <div className="flex items-center justify-between text-sm">
            <div className="flex items-center gap-4">
              {/* Rating */}
              {course.rating && (
                <div className="flex items-center gap-1">
                  <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                  <span className="font-medium">{course.rating.toFixed(1)}</span>
                  {course.reviewCount && (
                    <span className="text-muted-foreground">({course.reviewCount})</span>
                  )}
                </div>
              )}
              
              {/* Students */}
              <div className="flex items-center gap-1 text-muted-foreground">
                <Users className="h-4 w-4" />
                <span>{(course.enrollmentCount ?? 0).toLocaleString()}</span>
              </div>
              
              {/* Duration */}
              {course.duration && (
                <div className="flex items-center gap-1 text-muted-foreground">
                  <Clock className="h-4 w-4" />
                  <span>{course.duration}</span>
                </div>
              )}
            </div>
          </div>
        </CardContent>
        
        <CardFooter className="p-4 pt-0">
          {course.isEnrolled ? (
            // User is enrolled - Show progress and "Tiếp tục học" button
            <div className="w-full space-y-3">
              {course.enrollmentProgress !== undefined && (
                <div className="space-y-1">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-muted-foreground">Tiến độ</span>
                    <span className="font-medium">{Math.round(course.enrollmentProgress)}%</span>
                  </div>
                  <Progress value={course.enrollmentProgress} className="h-2" />
                </div>
              )}
              <Button 
                size="sm" 
                className="w-full bg-green-600 hover:bg-green-700 text-white"
                asChild
              >
                <Link href={ROUTES.LEARN(course.id.toString())} onClick={(e) => e.stopPropagation()}>
                  <PlayCircle className="h-4 w-4 mr-2" />
                  {course.enrollmentStatus === 'COMPLETED' || (course.enrollmentProgress ?? 0) >= 100
                    ? 'Ôn tập lại'
                    : 'Tiếp tục học'}
                </Link>
              </Button>
            </div>
          ) : (
            <div className="flex items-center justify-between w-full">
              {/* Price */}
              <div className="flex items-baseline gap-2">
                {course.discountPrice ? (
                  <>
                    <span className="text-2xl font-bold text-primary">
                      {course.discountPrice.toLocaleString('vi-VN')}đ
                    </span>
                    <span className="text-sm text-muted-foreground line-through">
                      {course.price.toLocaleString('vi-VN')}đ
                    </span>
                  </>
                ) : course.price > 0 ? (
                  <span className="text-2xl font-bold text-primary">
                    {course.price.toLocaleString('vi-VN')}đ
                  </span>
                ) : (
                  <span className="text-2xl font-bold text-accent">
                    Miễn phí
                  </span>
                )}
              </div>
              
              {/* CTA Button */}
              <Button 
                size="sm" 
                className="group-hover:bg-primary group-hover:text-primary-foreground"
                onClick={(e) => e.stopPropagation()}
              >
                Xem chi tiết
              </Button>
            </div>
          )}
        </CardFooter>
      </Card>
  );
}


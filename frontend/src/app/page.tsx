'use client';

import React from 'react';
import Link from 'next/link';
import { ArrowRight, BookOpen, Users, Award, TrendingUp, Search } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Navbar } from '@/components/layout/Navbar';
import { Footer } from '@/components/layout/Footer';
import { CourseGrid } from '@/components/course/CourseGrid';
import { useCourses } from '@/hooks/useCourses';
import { ROUTES } from '@/lib/constants';

export default function HomePage() {
  const [searchQuery, setSearchQuery] = React.useState('');
  const { courses, isLoading } = useCourses();
  
  const featuredCourses = courses.filter(c => c.isFeatured).slice(0, 8);
  
  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      window.location.href = `${ROUTES.COURSES}?keyword=${encodeURIComponent(searchQuery)}`;
    }
  };
  
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      
      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-primary/10 via-secondary/10 to-accent/10 py-20 md:py-32">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto text-center space-y-8">
            <h1 className="text-4xl md:text-6xl font-bold font-poppins">
              Học tập mọi lúc,{' '}
              <span className="text-primary">mọi nơi</span>
            </h1>
            <p className="text-lg md:text-xl text-muted-foreground">
              Khám phá hàng ngàn khóa học chất lượng cao từ các giảng viên hàng đầu. 
              Nâng cao kỹ năng và phát triển sự nghiệp của bạn ngay hôm nay.
            </p>
            
            {/* Search Bar */}
            <form onSubmit={handleSearch} className="max-w-2xl mx-auto">
              <div className="flex gap-2">
                <div className="relative flex-1">
                  <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                  <Input
                    type="search"
                    placeholder="Tìm kiếm khóa học, chủ đề, kỹ năng..."
                    className="pl-12 h-14 text-lg"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                </div>
                <Button type="submit" size="lg" className="h-14 px-8">
                  Tìm kiếm
                </Button>
              </div>
            </form>
            
            {/* CTA Buttons */}
            <div className="flex flex-wrap items-center justify-center gap-4">
              <Link href={ROUTES.COURSES}>
                <Button size="lg" className="gap-2">
                  Khám phá khóa học
                  <ArrowRight className="h-5 w-5" />
                </Button>
              </Link>
              <Link href={ROUTES.REGISTER}>
                <Button size="lg" variant="outline">
                  Đăng ký miễn phí
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>
      
      {/* Stats Section */}
      <section className="py-12 border-y bg-muted/30">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            <div className="text-center">
              <div className="flex items-center justify-center mb-3">
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
                  <BookOpen className="h-6 w-6 text-primary" />
                </div>
              </div>
              <div className="text-3xl font-bold">10,000+</div>
              <div className="text-sm text-muted-foreground">Khóa học</div>
            </div>
            
            <div className="text-center">
              <div className="flex items-center justify-center mb-3">
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-secondary/10">
                  <Users className="h-6 w-6 text-secondary" />
                </div>
              </div>
              <div className="text-3xl font-bold">500,000+</div>
              <div className="text-sm text-muted-foreground">Học viên</div>
            </div>
            
            <div className="text-center">
              <div className="flex items-center justify-center mb-3">
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-accent/10">
                  <Award className="h-6 w-6 text-accent" />
                </div>
              </div>
              <div className="text-3xl font-bold">1,000+</div>
              <div className="text-sm text-muted-foreground">Giảng viên</div>
            </div>
            
            <div className="text-center">
              <div className="flex items-center justify-center mb-3">
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
                  <TrendingUp className="h-6 w-6 text-primary" />
                </div>
              </div>
              <div className="text-3xl font-bold">95%</div>
              <div className="text-sm text-muted-foreground">Hài lòng</div>
            </div>
          </div>
        </div>
      </section>
      
      {/* Featured Courses Section */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h2 className="text-3xl font-bold font-poppins mb-2">
                Khóa học nổi bật
              </h2>
              <p className="text-muted-foreground">
                Các khóa học được đánh giá cao nhất bởi học viên
              </p>
            </div>
            <Link href={ROUTES.COURSES}>
              <Button variant="outline" className="gap-2">
                Xem tất cả
                <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>
          </div>
          
          <CourseGrid courses={featuredCourses} isLoading={isLoading} />
        </div>
      </section>
      
      {/* Categories Section */}
      <section className="py-16 bg-muted/30">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold font-poppins mb-2">
              Danh mục phổ biến
            </h2>
            <p className="text-muted-foreground">
              Khám phá các lĩnh vực học tập đa dạng
            </p>
          </div>
          
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            {[
              { name: 'Lập trình', icon: '💻', count: '2,500+' },
              { name: 'Thiết kế', icon: '🎨', count: '1,200+' },
              { name: 'Kinh doanh', icon: '💼', count: '1,800+' },
              { name: 'Marketing', icon: '📊', count: '900+' },
              { name: 'Ngoại ngữ', icon: '🌍', count: '1,500+' },
              { name: 'Kỹ năng mềm', icon: '🎯', count: '800+' },
            ].map((category) => (
              <Link
                key={category.name}
                href={`${ROUTES.COURSES}?category=${encodeURIComponent(category.name)}`}
                className="group"
              >
                <div className="flex flex-col items-center justify-center p-6 bg-card rounded-lg border hover:border-primary hover:shadow-md transition-all">
                  <div className="text-4xl mb-3">{category.icon}</div>
                  <div className="font-semibold group-hover:text-primary transition-colors">
                    {category.name}
                  </div>
                  <div className="text-sm text-muted-foreground">
                    {category.count} khóa học
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>
      
      {/* CTA Section */}
      <section className="py-20 bg-primary text-primary-foreground">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl md:text-4xl font-bold font-poppins mb-4">
            Bắt đầu học tập ngay hôm nay
          </h2>
          <p className="text-lg mb-8 opacity-90 max-w-2xl mx-auto">
            Tham gia cộng đồng học viên và nâng cao kỹ năng của bạn với hàng ngàn khóa học chất lượng
          </p>
          <div className="flex flex-wrap items-center justify-center gap-4">
            <Link href={ROUTES.REGISTER}>
              <Button size="lg" variant="secondary" className="gap-2">
                Đăng ký miễn phí
                <ArrowRight className="h-5 w-5" />
              </Button>
            </Link>
            <Link href={ROUTES.COURSES}>
              <Button size="lg" variant="outline" className="bg-transparent border-primary-foreground text-primary-foreground hover:bg-primary-foreground hover:text-primary">
                Khám phá khóa học
              </Button>
            </Link>
          </div>
        </div>
      </section>
      
      <Footer />
    </div>
  );
}

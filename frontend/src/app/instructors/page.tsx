'use client';

import React from 'react';
import Link from 'next/link';
import { Navbar } from '@/components/layout/Navbar';
import { Footer } from '@/components/layout/Footer';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  GraduationCap, 
  BookOpen, 
  Users, 
  Star, 
  Award,
  ArrowRight,
  Search,
  User
} from 'lucide-react';
import { Input } from '@/components/ui/input';

interface Instructor {
  id: number;
  name: string;
  title: string;
  expertise: string[];
  coursesCount: number;
  studentsCount: number;
  rating: number;
  bio: string;
}

const instructors: Instructor[] = [
  {
    id: 1,
    name: 'Nguyễn Văn A',
    title: 'Senior Full-Stack Developer',
    expertise: ['React', 'Node.js', 'TypeScript'],
    coursesCount: 12,
    studentsCount: 3500,
    rating: 4.9,
    bio: 'Chuyên gia với hơn 10 năm kinh nghiệm trong phát triển web full-stack. Đã giảng dạy hàng nghìn học viên.',
  },
  {
    id: 2,
    name: 'Trần Thị B',
    title: 'UI/UX Design Expert',
    expertise: ['Figma', 'Adobe XD', 'Design System'],
    coursesCount: 8,
    studentsCount: 2800,
    rating: 4.8,
    bio: 'Nhà thiết kế với portfolio ấn tượng, chuyên về thiết kế giao diện người dùng hiện đại và trải nghiệm người dùng.',
  },
  {
    id: 3,
    name: 'Lê Văn C',
    title: 'Mobile App Developer',
    expertise: ['React Native', 'Flutter', 'iOS'],
    coursesCount: 10,
    studentsCount: 4200,
    rating: 4.9,
    bio: 'Chuyên gia phát triển ứng dụng di động với nhiều ứng dụng thành công trên App Store và Google Play.',
  },
  {
    id: 4,
    name: 'Phạm Thị D',
    title: 'Data Science Specialist',
    expertise: ['Python', 'Machine Learning', 'Data Analysis'],
    coursesCount: 9,
    studentsCount: 3100,
    rating: 4.7,
    bio: 'Chuyên gia về khoa học dữ liệu và machine learning, có nhiều năm kinh nghiệm trong ngành.',
  },
  {
    id: 5,
    name: 'Hoàng Văn E',
    title: 'DevOps Engineer',
    expertise: ['Docker', 'Kubernetes', 'AWS'],
    coursesCount: 7,
    studentsCount: 1900,
    rating: 4.8,
    bio: 'Kỹ sư DevOps với kiến thức sâu về cloud computing và containerization.',
  },
  {
    id: 6,
    name: 'Vũ Thị F',
    title: 'Backend Architect',
    expertise: ['Java', 'Spring Boot', 'Microservices'],
    coursesCount: 11,
    studentsCount: 3800,
    rating: 4.9,
    bio: 'Kiến trúc sư backend với kinh nghiệm xây dựng hệ thống quy mô lớn.',
  },
];

export default function InstructorsPage() {
  const [searchQuery, setSearchQuery] = React.useState('');

  const filteredInstructors = instructors.filter(instructor =>
    instructor.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    instructor.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    instructor.expertise.some(skill => skill.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      
      {/* Hero Section */}
      <section className="bg-gradient-to-br from-primary/10 via-secondary/10 to-accent/10 py-20">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto text-center">
            <div className="flex items-center justify-center mb-4">
              <div className="flex h-16 w-16 items-center justify-center rounded-full bg-primary/10">
                <GraduationCap className="h-8 w-8 text-primary" />
              </div>
            </div>
            <h1 className="text-4xl md:text-5xl font-bold font-poppins mb-4">
              Đội ngũ giảng viên
            </h1>
            <p className="text-lg text-muted-foreground mb-8">
              Học từ những chuyên gia hàng đầu trong lĩnh vực công nghệ thông tin
            </p>
            
            {/* Search Bar */}
            <div className="max-w-2xl mx-auto">
              <div className="relative">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                <Input
                  type="search"
                  placeholder="Tìm kiếm giảng viên, chuyên môn..."
                  className="pl-12 h-12"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Instructors Grid */}
      <section className="py-16 flex-1">
        <div className="container mx-auto px-4">
          <div className="mb-8 flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold font-poppins">
                Tất cả giảng viên
              </h2>
              <p className="text-muted-foreground mt-1">
                {filteredInstructors.length} giảng viên
              </p>
            </div>
          </div>

          {filteredInstructors.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-muted-foreground text-lg">
                Không tìm thấy giảng viên nào
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredInstructors.map((instructor) => (
                <div
                  key={instructor.id}
                  className="bg-card rounded-lg border p-6 hover:border-primary hover:shadow-lg transition-all"
                >
                  {/* Avatar and Basic Info */}
                  <div className="flex items-start space-x-4 mb-4">
                    <div className="relative">
                      <div className="h-20 w-20 rounded-full bg-muted border-2 border-primary/20 flex items-center justify-center">
                        <User className="h-10 w-10 text-muted-foreground" />
                      </div>
                      <div className="absolute -bottom-1 -right-1 bg-primary rounded-full p-1.5">
                        <Award className="h-4 w-4 text-primary-foreground" />
                      </div>
                    </div>
                    <div className="flex-1">
                      <h3 className="text-xl font-bold mb-1">{instructor.name}</h3>
                      <p className="text-sm text-muted-foreground mb-2">{instructor.title}</p>
                      <div className="flex items-center space-x-1">
                        <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                        <span className="text-sm font-semibold">{instructor.rating}</span>
                        <span className="text-xs text-muted-foreground">({instructor.studentsCount.toLocaleString()})</span>
                      </div>
                    </div>
                  </div>

                  {/* Bio */}
                  <p className="text-sm text-muted-foreground mb-4 line-clamp-2">
                    {instructor.bio}
                  </p>

                  {/* Expertise */}
                  <div className="flex flex-wrap gap-2 mb-4">
                    {instructor.expertise.map((skill, index) => (
                      <Badge key={index} variant="secondary" className="text-xs">
                        {skill}
                      </Badge>
                    ))}
                  </div>

                  {/* Stats */}
                  <div className="flex items-center justify-between pt-4 border-t">
                    <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                      <BookOpen className="h-4 w-4" />
                      <span>{instructor.coursesCount} khóa học</span>
                    </div>
                    <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                      <Users className="h-4 w-4" />
                      <span>{instructor.studentsCount.toLocaleString()} học viên</span>
                    </div>
                  </div>

                  {/* View Profile Button */}
                  <Button
                    variant="outline"
                    className="w-full mt-4"
                    asChild
                  >
                    <Link href={`/instructors/${instructor.id}`}>
                      Xem hồ sơ
                      <ArrowRight className="h-4 w-4 ml-2" />
                    </Link>
                  </Button>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 bg-muted/30">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto text-center">
            <h2 className="text-3xl font-bold font-poppins mb-4">
              Bạn muốn trở thành giảng viên?
            </h2>
            <p className="text-muted-foreground mb-6">
              Chia sẻ kiến thức của bạn và kiếm thu nhập từ các khóa học trực tuyến
            </p>
            <Button size="lg" asChild>
              <Link href="/register?role=instructor">
                Đăng ký làm giảng viên
                <ArrowRight className="h-5 w-5 ml-2" />
              </Link>
            </Button>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}


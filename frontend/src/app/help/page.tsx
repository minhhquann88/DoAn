'use client';

import React from 'react';
import Link from 'next/link';
import { Navbar } from '@/components/layout/Navbar';
import { Footer } from '@/components/layout/Footer';
import { Button } from '@/components/ui/button';
import { 
  BookOpen, 
  Video, 
  CreditCard, 
  User, 
  Settings, 
  MessageCircle,
  FileText,
  HelpCircle,
  ArrowRight
} from 'lucide-react';

const helpCategories = [
  {
    icon: BookOpen,
    title: 'Bắt đầu học',
    description: 'Hướng dẫn cách đăng ký và bắt đầu khóa học đầu tiên của bạn',
    articles: [
      'Cách đăng ký tài khoản',
      'Tìm và chọn khóa học phù hợp',
      'Cách truy cập nội dung khóa học',
      'Sử dụng tính năng ghi chú',
    ],
  },
  {
    icon: Video,
    title: 'Xem video và học tập',
    description: 'Tìm hiểu cách tận dụng tối đa trải nghiệm học tập của bạn',
    articles: [
      'Điều chỉnh tốc độ phát video',
      'Tải tài liệu khóa học',
      'Làm bài tập và bài kiểm tra',
      'Theo dõi tiến độ học tập',
    ],
  },
  {
    icon: CreditCard,
    title: 'Thanh toán và giá cả',
    description: 'Câu hỏi về giá cả, thanh toán và hoàn tiền',
    articles: [
      'Các phương thức thanh toán',
      'Chính sách hoàn tiền',
      'Sử dụng mã giảm giá',
      'Quản lý đăng ký khóa học',
    ],
  },
  {
    icon: User,
    title: 'Quản lý tài khoản',
    description: 'Cài đặt tài khoản, hồ sơ và bảo mật',
    articles: [
      'Cập nhật thông tin cá nhân',
      'Thay đổi mật khẩu',
      'Cài đặt thông báo',
      'Xóa tài khoản',
    ],
  },
  {
    icon: Settings,
    title: 'Kỹ thuật và khắc phục sự cố',
    description: 'Giải quyết các vấn đề kỹ thuật và sự cố',
    articles: [
      'Video không phát được',
      'Vấn đề về âm thanh',
      'Lỗi đăng nhập',
      'Yêu cầu hệ thống',
    ],
  },
  {
    icon: MessageCircle,
    title: 'Giảng viên',
    description: 'Hướng dẫn cho giảng viên về cách tạo và quản lý khóa học',
    articles: [
      'Tạo khóa học đầu tiên',
      'Tải lên video và tài liệu',
      'Quản lý học viên',
      'Kiếm tiền từ khóa học',
    ],
  },
];

export default function HelpPage() {
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      
      {/* Hero Section */}
      <section className="bg-gradient-to-br from-primary/10 via-secondary/10 to-accent/10 py-20">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto text-center">
            <div className="flex items-center justify-center mb-4">
              <div className="flex h-16 w-16 items-center justify-center rounded-full bg-primary/10">
                <HelpCircle className="h-8 w-8 text-primary" />
              </div>
            </div>
            <h1 className="text-4xl md:text-5xl font-bold font-poppins mb-4">
              Trung tâm trợ giúp
            </h1>
            <p className="text-lg text-muted-foreground mb-8">
              Tìm câu trả lời và hướng dẫn chi tiết về cách sử dụng EduLearn
            </p>
            
            {/* Search Bar */}
            <div className="max-w-2xl mx-auto">
              <div className="relative">
                <input
                  type="search"
                  placeholder="Tìm kiếm câu trả lời..."
                  className="w-full px-4 py-3 pl-12 rounded-lg border bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                />
                <HelpCircle className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Help Categories */}
      <section className="py-16 flex-1">
        <div className="container mx-auto px-4">
          <div className="max-w-6xl mx-auto">
            <h2 className="text-2xl font-bold font-poppins mb-8 text-center">
              Chọn chủ đề bạn cần trợ giúp
            </h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
              {helpCategories.map((category, index) => {
                const Icon = category.icon;
                return (
                  <div
                    key={index}
                    className="bg-card rounded-lg border p-6 hover:border-primary transition-all hover:shadow-md"
                  >
                    <div className="flex items-center mb-4">
                      <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10 mr-4">
                        <Icon className="h-6 w-6 text-primary" />
                      </div>
                      <h3 className="text-lg font-semibold">{category.title}</h3>
                    </div>
                    <p className="text-sm text-muted-foreground mb-4">
                      {category.description}
                    </p>
                    <ul className="space-y-2">
                      {category.articles.map((article, articleIndex) => (
                        <li key={articleIndex} className="text-sm text-muted-foreground flex items-center">
                          <ArrowRight className="h-3 w-3 mr-2 text-primary" />
                          {article}
                        </li>
                      ))}
                    </ul>
                  </div>
                );
              })}
            </div>

            {/* Quick Links */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl mx-auto">
              <Link href="/faq">
                <div className="bg-card rounded-lg border p-6 hover:border-primary transition-all hover:shadow-md">
                  <div className="flex items-center mb-3">
                    <FileText className="h-6 w-6 text-primary mr-3" />
                    <h3 className="text-lg font-semibold">Câu hỏi thường gặp</h3>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    Xem các câu hỏi phổ biến nhất từ người dùng
                  </p>
                </div>
              </Link>

              <Link href="/contact">
                <div className="bg-card rounded-lg border p-6 hover:border-primary transition-all hover:shadow-md">
                  <div className="flex items-center mb-3">
                    <MessageCircle className="h-6 w-6 text-primary mr-3" />
                    <h3 className="text-lg font-semibold">Liên hệ hỗ trợ</h3>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    Không tìm thấy câu trả lời? Liên hệ với đội ngũ hỗ trợ của chúng tôi
                  </p>
                </div>
              </Link>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}


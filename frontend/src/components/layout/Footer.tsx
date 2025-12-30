'use client';

import React from 'react';
import Link from 'next/link';
import { BookOpen, Facebook, Twitter, Linkedin, Youtube, Mail } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Separator } from '@/components/ui/separator';
import { ROUTES } from '@/lib/constants';
import { subscribeNewsletter } from '@/services/newsletterService';
import { useUIStore } from '@/stores/uiStore';

export function Footer() {
  const currentYear = new Date().getFullYear();
  const { addToast } = useUIStore();
  const [email, setEmail] = React.useState('');
  const [isSubmitting, setIsSubmitting] = React.useState(false);

  const handleSubscribe = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) {
      addToast({
        type: 'error',
        description: 'Vui lòng nhập email',
      });
      return;
    }

    setIsSubmitting(true);
    try {
      await subscribeNewsletter(email.trim());
      addToast({
        type: 'success',
        description: 'Đăng ký nhận tin tức thành công!',
      });
      setEmail('');
    } catch (error: any) {
      addToast({
        type: 'error',
        description: error?.response?.data?.message || 'Có lỗi xảy ra khi đăng ký',
      });
    } finally {
      setIsSubmitting(false);
    }
  };
  
  return (
    <footer className="border-t bg-muted/30">
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-8">
          {/* Brand */}
          <div className="lg:col-span-2">
            <Link href={ROUTES.HOME} className="flex items-center space-x-2 mb-4">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary">
                <BookOpen className="h-6 w-6 text-primary-foreground" />
              </div>
              <span className="font-poppins text-xl font-bold">E-learning</span>
            </Link>
            <p className="text-sm text-muted-foreground mb-4 max-w-sm">
              Nền tảng học trực tuyến hàng đầu với hàng ngàn khóa học chất lượng cao. 
              Học mọi lúc, mọi nơi với đội ngũ giảng viên chuyên nghiệp.
            </p>
            
            {/* Newsletter */}
            <div className="space-y-2">
              <p className="text-sm font-medium">Đăng ký nhận tin tức</p>
              <form onSubmit={handleSubscribe} className="flex space-x-2">
                <Input 
                  type="email" 
                  placeholder="Email của bạn" 
                  className="max-w-xs"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  disabled={isSubmitting}
                  required
                />
                <Button type="submit" disabled={isSubmitting}>
                  <Mail className="h-4 w-4 mr-2" />
                  {isSubmitting ? 'Đang xử lý...' : 'Đăng ký'}
                </Button>
              </form>
            </div>
          </div>
          
          {/* Quick Links */}
          <div>
            <h3 className="font-semibold mb-4">Về chúng tôi</h3>
            <ul className="space-y-2">
              <li>
                <Link href="/about" className="text-sm text-muted-foreground hover:text-primary transition-colors">
                  Giới thiệu
                </Link>
              </li>
              <li>
                <Link href="/courses" className="text-sm text-muted-foreground hover:text-primary transition-colors">
                  Khóa học
                </Link>
              </li>
              <li>
                <Link href="/instructors" className="text-sm text-muted-foreground hover:text-primary transition-colors">
                  Giảng viên
                </Link>
              </li>
              <li>
                <Link href="/contact" className="text-sm text-muted-foreground hover:text-primary transition-colors">
                  Liên hệ
                </Link>
              </li>
            </ul>
          </div>
          
          {/* Support */}
          <div>
            <h3 className="font-semibold mb-4">Hỗ trợ</h3>
            <ul className="space-y-2">
              <li>
                <Link href="/help" className="text-sm text-muted-foreground hover:text-primary transition-colors">
                  Trung tâm trợ giúp
                </Link>
              </li>
              <li>
                <Link href="/faq" className="text-sm text-muted-foreground hover:text-primary transition-colors">
                  Câu hỏi thường gặp
                </Link>
              </li>
              <li>
                <Link href="/terms" className="text-sm text-muted-foreground hover:text-primary transition-colors">
                  Điều khoản sử dụng
                </Link>
              </li>
              <li>
                <Link href="/privacy" className="text-sm text-muted-foreground hover:text-primary transition-colors">
                  Chính sách bảo mật
                </Link>
              </li>
            </ul>
          </div>
          
          {/* Community */}
          <div>
            <h3 className="font-semibold mb-4">Cộng đồng</h3>
            <div className="flex space-x-2">
              <Button variant="outline" size="icon">
                <Facebook className="h-4 w-4" />
              </Button>
              <Button variant="outline" size="icon">
                <Twitter className="h-4 w-4" />
              </Button>
              <Button variant="outline" size="icon">
                <Linkedin className="h-4 w-4" />
              </Button>
              <Button variant="outline" size="icon">
                <Youtube className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
        
        <Separator className="my-8" />
        
        {/* Copyright */}
        <div className="flex flex-col md:flex-row justify-between items-center">
          <p className="text-sm text-muted-foreground">
            © {currentYear} E-learning. All rights reserved.
          </p>
          <p className="text-sm text-muted-foreground">
            Made with ❤️ in Vietnam
          </p>
        </div>
      </div>
    </footer>
  );
}


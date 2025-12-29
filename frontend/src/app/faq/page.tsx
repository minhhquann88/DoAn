'use client';

import React, { useState } from 'react';
import { Navbar } from '@/components/layout/Navbar';
import { Footer } from '@/components/layout/Footer';
import { ChevronDown, HelpCircle } from 'lucide-react';
import { cn } from '@/lib/utils';

interface FAQItem {
  question: string;
  answer: string;
}

const faqs: FAQItem[] = [
  {
    question: 'Làm thế nào để đăng ký khóa học?',
    answer: 'Bạn có thể đăng ký khóa học bằng cách tạo tài khoản trên EduLearn, duyệt các khóa học có sẵn, và nhấn nút "Đăng ký ngay". Sau đó, bạn có thể thanh toán trực tuyến hoặc sử dụng mã giảm giá nếu có.',
  },
  {
    question: 'Tôi có thể học trên điện thoại không?',
    answer: 'Có! EduLearn được thiết kế responsive và hoàn toàn tương thích với mọi thiết bị, bao gồm điện thoại, máy tính bảng và máy tính. Bạn có thể học mọi lúc, mọi nơi.',
  },
  {
    question: 'Khóa học có thời hạn không?',
    answer: 'Sau khi đăng ký, bạn có quyền truy cập trọn đời vào khóa học. Bạn có thể học theo tốc độ của riêng mình và xem lại nội dung bất cứ lúc nào.',
  },
  {
    question: 'Tôi có nhận được chứng chỉ sau khi hoàn thành khóa học không?',
    answer: 'Có! Sau khi hoàn thành 100% khóa học và vượt qua các bài kiểm tra, bạn sẽ nhận được chứng chỉ điện tử có thể tải xuống và chia sẻ trên LinkedIn hoặc CV của mình.',
  },
  {
    question: 'Làm thế nào để hoàn tiền nếu không hài lòng?',
    answer: 'Chúng tôi có chính sách hoàn tiền trong vòng 30 ngày kể từ ngày đăng ký nếu bạn không hài lòng với khóa học. Vui lòng liên hệ bộ phận hỗ trợ để được hỗ trợ.',
  },
  {
    question: 'Tôi có thể chia sẻ tài khoản với người khác không?',
    answer: 'Không. Mỗi tài khoản chỉ dành cho một người sử dụng. Chia sẻ tài khoản vi phạm điều khoản sử dụng và có thể dẫn đến việc khóa tài khoản.',
  },
  {
    question: 'Làm thế nào để trở thành giảng viên trên EduLearn?',
    answer: 'Nếu bạn muốn trở thành giảng viên, vui lòng đăng ký tài khoản với vai trò "Giảng viên" và gửi hồ sơ của bạn. Đội ngũ của chúng tôi sẽ xem xét và liên hệ với bạn trong vòng 5-7 ngày làm việc.',
  },
  {
    question: 'Tôi có thể tải video về để xem offline không?',
    answer: 'Hiện tại, chúng tôi không hỗ trợ tải video về. Tuy nhiên, bạn có thể truy cập khóa học bất cứ lúc nào khi có kết nối internet.',
  },
];

export default function FAQPage() {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  const toggleFAQ = (index: number) => {
    setOpenIndex(openIndex === index ? null : index);
  };

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
              Câu hỏi thường gặp
            </h1>
            <p className="text-lg text-muted-foreground">
              Tìm câu trả lời cho những thắc mắc phổ biến về EduLearn
            </p>
          </div>
        </div>
      </section>

      {/* FAQ Content */}
      <section className="py-16 flex-1">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto space-y-4">
            {faqs.map((faq, index) => (
              <div
                key={index}
                className="bg-card rounded-lg border overflow-hidden transition-all"
              >
                <button
                  onClick={() => toggleFAQ(index)}
                  className="w-full px-6 py-4 flex items-center justify-between text-left hover:bg-muted/50 transition-colors"
                >
                  <span className="font-semibold pr-4">{faq.question}</span>
                  <ChevronDown
                    className={cn(
                      'h-5 w-5 text-muted-foreground flex-shrink-0 transition-transform',
                      openIndex === index && 'transform rotate-180'
                    )}
                  />
                </button>
                {openIndex === index && (
                  <div className="px-6 pb-4">
                    <p className="text-muted-foreground leading-relaxed">{faq.answer}</p>
                  </div>
                )}
              </div>
            ))}
          </div>

          {/* Still have questions */}
          <div className="max-w-3xl mx-auto mt-12 p-8 bg-card rounded-lg border text-center">
            <h3 className="text-xl font-semibold mb-2">Vẫn còn thắc mắc?</h3>
            <p className="text-muted-foreground mb-4">
              Nếu bạn không tìm thấy câu trả lời, đừng ngần ngại liên hệ với chúng tôi.
            </p>
            <a
              href="/contact"
              className="inline-flex items-center text-primary hover:underline font-medium"
            >
              Liên hệ hỗ trợ
              <ChevronDown className="h-4 w-4 ml-1 rotate-[-90deg]" />
            </a>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}


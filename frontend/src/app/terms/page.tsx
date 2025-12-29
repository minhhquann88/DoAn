'use client';

import React from 'react';
import { Navbar } from '@/components/layout/Navbar';
import { Footer } from '@/components/layout/Footer';
import { FileText } from 'lucide-react';

export default function TermsPage() {
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      
      {/* Hero Section */}
      <section className="bg-gradient-to-br from-primary/10 via-secondary/10 to-accent/10 py-20">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto text-center">
            <div className="flex items-center justify-center mb-4">
              <div className="flex h-16 w-16 items-center justify-center rounded-full bg-primary/10">
                <FileText className="h-8 w-8 text-primary" />
              </div>
            </div>
            <h1 className="text-4xl md:text-5xl font-bold font-poppins mb-4">
              Điều khoản sử dụng
            </h1>
            <p className="text-lg text-muted-foreground">
              Cập nhật lần cuối: {new Date().toLocaleDateString('vi-VN', { year: 'numeric', month: 'long', day: 'numeric' })}
            </p>
          </div>
        </div>
      </section>

      {/* Content */}
      <section className="py-16 flex-1">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto prose prose-slate dark:prose-invert">
            <div className="space-y-8 text-muted-foreground leading-relaxed">
              <section>
                <h2 className="text-2xl font-bold text-foreground mb-4">1. Chấp nhận điều khoản</h2>
                <p>
                  Bằng việc truy cập và sử dụng nền tảng E-learning, bạn đồng ý tuân thủ và bị ràng buộc 
                  bởi các điều khoản và điều kiện này. Nếu bạn không đồng ý với bất kỳ phần nào của 
                  các điều khoản này, bạn không được phép sử dụng dịch vụ của chúng tôi.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-bold text-foreground mb-4">2. Tài khoản người dùng</h2>
                <p>
                  Khi tạo tài khoản trên E-learning, bạn cam kết:
                </p>
                <ul className="list-disc pl-6 space-y-2 mt-4">
                  <li>Cung cấp thông tin chính xác, đầy đủ và cập nhật</li>
                  <li>Bảo mật mật khẩu và tài khoản của bạn</li>
                  <li>Chịu trách nhiệm cho mọi hoạt động diễn ra dưới tài khoản của bạn</li>
                  <li>Thông báo ngay lập tức cho chúng tôi về bất kỳ vi phạm bảo mật nào</li>
                </ul>
              </section>

              <section>
                <h2 className="text-2xl font-bold text-foreground mb-4">3. Sử dụng dịch vụ</h2>
                <p>Bạn đồng ý sử dụng dịch vụ của chúng tôi một cách hợp pháp và chỉ cho mục đích 
                được phép. Bạn không được:</p>
                <ul className="list-disc pl-6 space-y-2 mt-4">
                  <li>Sao chép, phân phối hoặc chia sẻ nội dung khóa học mà không có sự cho phép</li>
                  <li>Sử dụng dịch vụ cho mục đích bất hợp pháp hoặc gian lận</li>
                  <li>Can thiệp hoặc phá hoại hoạt động của nền tảng</li>
                  <li>Tạo nhiều tài khoản để lạm dụng chính sách hoàn tiền</li>
                </ul>
              </section>

              <section>
                <h2 className="text-2xl font-bold text-foreground mb-4">4. Quyền sở hữu trí tuệ</h2>
                <p>
                  Tất cả nội dung trên E-learning, bao gồm nhưng không giới hạn ở video, tài liệu, 
                  hình ảnh, và văn bản, đều thuộc quyền sở hữu của E-learning hoặc các đối tác của 
                  chúng tôi. Bạn không được phép sao chép, phân phối, hoặc sử dụng nội dung này 
                  mà không có sự cho phép bằng văn bản.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-bold text-foreground mb-4">5. Thanh toán và hoàn tiền</h2>
                <p>
                  Tất cả các khoản thanh toán đều được xử lý an toàn thông qua các cổng thanh toán 
                  được ủy quyền. Chúng tôi có chính sách hoàn tiền trong vòng 30 ngày nếu bạn 
                  không hài lòng với khóa học, với điều kiện bạn chưa hoàn thành hơn 50% nội dung 
                  khóa học.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-bold text-foreground mb-4">6. Chấm dứt tài khoản</h2>
                <p>
                  Chúng tôi có quyền chấm dứt hoặc tạm ngưng tài khoản của bạn nếu bạn vi phạm 
                  các điều khoản này hoặc tham gia vào các hoạt động có hại cho nền tảng hoặc 
                  người dùng khác.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-bold text-foreground mb-4">7. Thay đổi điều khoản</h2>
                <p>
                  Chúng tôi có quyền cập nhật các điều khoản này bất cứ lúc nào. Các thay đổi sẽ 
                  có hiệu lực ngay sau khi được đăng tải. Việc bạn tiếp tục sử dụng dịch vụ sau 
                  khi có thay đổi được coi là bạn đã chấp nhận các điều khoản mới.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-bold text-foreground mb-4">8. Liên hệ</h2>
                <p>
                  Nếu bạn có bất kỳ câu hỏi nào về các điều khoản này, vui lòng liên hệ với chúng tôi 
                  tại <a href="/contact" className="text-primary hover:underline">trang liên hệ</a>.
                </p>
              </section>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}


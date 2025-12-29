'use client';

import React from 'react';
import { Navbar } from '@/components/layout/Navbar';
import { Footer } from '@/components/layout/Footer';
import { Shield } from 'lucide-react';

export default function PrivacyPage() {
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      
      {/* Hero Section */}
      <section className="bg-gradient-to-br from-primary/10 via-secondary/10 to-accent/10 py-20">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto text-center">
            <div className="flex items-center justify-center mb-4">
              <div className="flex h-16 w-16 items-center justify-center rounded-full bg-primary/10">
                <Shield className="h-8 w-8 text-primary" />
              </div>
            </div>
            <h1 className="text-4xl md:text-5xl font-bold font-poppins mb-4">
              Chính sách bảo mật
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
          <div className="max-w-4xl mx-auto space-y-8 text-muted-foreground leading-relaxed">
            <section>
              <h2 className="text-2xl font-bold text-foreground mb-4">1. Thông tin chúng tôi thu thập</h2>
              <p className="mb-4">
                Chúng tôi thu thập các loại thông tin sau đây khi bạn sử dụng dịch vụ của chúng tôi:
              </p>
              <ul className="list-disc pl-6 space-y-2">
                <li><strong>Thông tin cá nhân:</strong> Tên, email, số điện thoại, địa chỉ khi bạn đăng ký tài khoản</li>
                <li><strong>Thông tin thanh toán:</strong> Được xử lý an toàn bởi các đối tác thanh toán của chúng tôi</li>
                <li><strong>Dữ liệu sử dụng:</strong> Thông tin về cách bạn tương tác với nền tảng, bao gồm các khóa học bạn đã xem</li>
                <li><strong>Thông tin thiết bị:</strong> Địa chỉ IP, loại trình duyệt, hệ điều hành</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-foreground mb-4">2. Cách chúng tôi sử dụng thông tin</h2>
              <p>Chúng tôi sử dụng thông tin thu thập được để:</p>
              <ul className="list-disc pl-6 space-y-2 mt-4">
                <li>Cung cấp, duy trì và cải thiện dịch vụ của chúng tôi</li>
                <li>Xử lý các giao dịch và gửi thông báo liên quan</li>
                <li>Cá nhân hóa trải nghiệm học tập của bạn</li>
                <li>Gửi email về các khóa học mới, cập nhật và ưu đãi (bạn có thể từ chối bất cứ lúc nào)</li>
                <li>Phát hiện và ngăn chặn gian lận, lạm dụng</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-foreground mb-4">3. Chia sẻ thông tin</h2>
              <p>
                Chúng tôi không bán thông tin cá nhân của bạn cho bên thứ ba. Chúng tôi chỉ chia sẻ 
                thông tin trong các trường hợp sau:
              </p>
              <ul className="list-disc pl-6 space-y-2 mt-4">
                <li><strong>Nhà cung cấp dịch vụ:</strong> Các đối tác giúp chúng tôi vận hành nền tảng (xử lý thanh toán, lưu trữ dữ liệu)</li>
                <li><strong>Yêu cầu pháp lý:</strong> Khi được yêu cầu bởi cơ quan pháp luật</li>
                <li><strong>Bảo vệ quyền lợi:</strong> Để bảo vệ quyền, tài sản hoặc an toàn của E-learning, người dùng hoặc công chúng</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-foreground mb-4">4. Bảo mật dữ liệu</h2>
              <p>
                Chúng tôi sử dụng các biện pháp bảo mật kỹ thuật và tổ chức phù hợp để bảo vệ thông tin 
                cá nhân của bạn khỏi truy cập trái phép, mất mát, phá hủy hoặc thay đổi. Tuy nhiên, 
                không có phương thức truyền tải qua internet hoặc lưu trữ điện tử nào là 100% an toàn.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-foreground mb-4">5. Quyền của bạn</h2>
              <p>Bạn có quyền:</p>
              <ul className="list-disc pl-6 space-y-2 mt-4">
                <li>Truy cập và chỉnh sửa thông tin cá nhân của bạn</li>
                <li>Yêu cầu xóa tài khoản và dữ liệu của bạn</li>
                <li>Từ chối nhận email marketing (bạn vẫn sẽ nhận email quan trọng về tài khoản)</li>
                <li>Yêu cầu xuất dữ liệu của bạn dưới dạng có thể đọc được</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-foreground mb-4">6. Cookie</h2>
              <p>
                Chúng tôi sử dụng cookie và công nghệ theo dõi tương tự để cải thiện trải nghiệm của bạn, 
                phân tích cách bạn sử dụng nền tảng, và cung cấp nội dung được cá nhân hóa. Bạn có thể 
                kiểm soát cookie thông qua cài đặt trình duyệt của mình.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-foreground mb-4">7. Thay đổi chính sách</h2>
              <p>
                Chúng tôi có thể cập nhật chính sách bảo mật này theo thời gian. Chúng tôi sẽ thông báo 
                cho bạn về bất kỳ thay đổi quan trọng nào bằng cách đăng thông báo trên nền tảng hoặc 
                gửi email cho bạn.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-foreground mb-4">8. Liên hệ</h2>
              <p>
                Nếu bạn có câu hỏi về chính sách bảo mật này, vui lòng liên hệ với chúng tôi tại 
                <a href="/contact" className="text-primary hover:underline"> trang liên hệ</a> hoặc 
                gửi email đến privacy@elearn.vn.
              </p>
            </section>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}


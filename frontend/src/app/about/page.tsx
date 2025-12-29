'use client';

import React from 'react';
import { Navbar } from '@/components/layout/Navbar';
import { Footer } from '@/components/layout/Footer';
import { BookOpen, Users, Target, Award } from 'lucide-react';

export default function AboutPage() {
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      
      {/* Hero Section */}
      <section className="bg-gradient-to-br from-primary/10 via-secondary/10 to-accent/10 py-20">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto text-center">
            <h1 className="text-4xl md:text-5xl font-bold font-poppins mb-4">
              Về E-learning
            </h1>
            <p className="text-lg text-muted-foreground">
              Nền tảng học trực tuyến hàng đầu, mang đến cơ hội học tập chất lượng cao cho mọi người
            </p>
          </div>
        </div>
      </section>

      {/* Main Content */}
      <section className="py-16 flex-1">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto space-y-12">
            {/* Mission */}
            <div>
              <h2 className="text-3xl font-bold font-poppins mb-4">Sứ mệnh của chúng tôi</h2>
              <p className="text-muted-foreground leading-relaxed">
                E-learning được thành lập với sứ mệnh mang đến nền giáo dục trực tuyến chất lượng cao, 
                dễ tiếp cận cho mọi người. Chúng tôi tin rằng giáo dục là quyền cơ bản của mỗi người 
                và không nên bị giới hạn bởi địa lý, thời gian hay tài chính.
              </p>
            </div>

            {/* Values */}
            <div>
              <h2 className="text-3xl font-bold font-poppins mb-6">Giá trị cốt lõi</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="p-6 bg-card rounded-lg border">
                  <div className="flex items-center mb-3">
                    <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10 mr-4">
                      <Target className="h-6 w-6 text-primary" />
                    </div>
                    <h3 className="text-xl font-semibold">Chất lượng</h3>
                  </div>
                  <p className="text-muted-foreground">
                    Chúng tôi cam kết cung cấp các khóa học được thiết kế kỹ lưỡng bởi các chuyên gia 
                    hàng đầu trong lĩnh vực.
                  </p>
                </div>

                <div className="p-6 bg-card rounded-lg border">
                  <div className="flex items-center mb-3">
                    <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10 mr-4">
                      <Users className="h-6 w-6 text-primary" />
                    </div>
                    <h3 className="text-xl font-semibold">Cộng đồng</h3>
                  </div>
                  <p className="text-muted-foreground">
                    Xây dựng một cộng đồng học tập tích cực, nơi mọi người có thể chia sẻ kiến thức 
                    và hỗ trợ lẫn nhau.
                  </p>
                </div>

                <div className="p-6 bg-card rounded-lg border">
                  <div className="flex items-center mb-3">
                    <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10 mr-4">
                      <BookOpen className="h-6 w-6 text-primary" />
                    </div>
                    <h3 className="text-xl font-semibold">Đổi mới</h3>
                  </div>
                  <p className="text-muted-foreground">
                    Luôn cập nhật công nghệ và phương pháp giảng dạy mới nhất để mang đến trải nghiệm 
                    học tập tốt nhất.
                  </p>
                </div>

                <div className="p-6 bg-card rounded-lg border">
                  <div className="flex items-center mb-3">
                    <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10 mr-4">
                      <Award className="h-6 w-6 text-primary" />
                    </div>
                    <h3 className="text-xl font-semibold">Cam kết</h3>
                  </div>
                  <p className="text-muted-foreground">
                    Cam kết hỗ trợ học viên đạt được mục tiêu học tập và phát triển sự nghiệp của mình.
                  </p>
                </div>
              </div>
            </div>

            {/* Story */}
            <div>
              <h2 className="text-3xl font-bold font-poppins mb-4">Câu chuyện của chúng tôi</h2>
              <div className="space-y-4 text-muted-foreground leading-relaxed">
                <p>
                  E-learning được thành lập vào năm 2024 bởi một nhóm các nhà giáo dục và công nghệ 
                  đam mê, với mong muốn tạo ra một nền tảng học tập trực tuyến có thể tiếp cận được 
                  với mọi người.
                </p>
                <p>
                  Từ những ngày đầu với chỉ vài khóa học, chúng tôi đã phát triển thành một nền tảng 
                  với hàng trăm khóa học chất lượng cao, phục vụ hàng nghìn học viên trên khắp cả nước.
                </p>
                <p>
                  Chúng tôi tự hào về đội ngũ giảng viên chuyên nghiệp, những người không chỉ có 
                  kiến thức chuyên sâu mà còn có khả năng truyền đạt kiến thức một cách dễ hiểu và 
                  thú vị.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}


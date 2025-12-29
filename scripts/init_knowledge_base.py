"""
Script để khởi tạo knowledge base với dữ liệu mẫu
"""

import asyncio
import json
from src.core.rag_system import RAGSystem
from src.core.config import settings

async def initialize_knowledge_base():
    """Khởi tạo knowledge base với dữ liệu mẫu"""
    
    print("🚀 Khởi tạo Knowledge Base cho Elearning Chatbot...")
    
    # Initialize RAG system
    rag_system = RAGSystem()
    await rag_system.initialize()
    
    # Sample courses data
    sample_courses = [
        {
            "id": "course_1",
            "title": "Lập trình Python từ cơ bản đến nâng cao",
            "description": "Khóa học Python toàn diện cho người mới bắt đầu và muốn nâng cao kỹ năng lập trình",
            "instructor": "Nguyễn Văn A",
            "price": 299000,
            "duration": "40 giờ",
            "rating": 4.8,
            "category": "programming"
        },
        {
            "id": "course_2", 
            "title": "Web Development với React và Node.js",
            "description": "Học cách xây dựng ứng dụng web full-stack với React frontend và Node.js backend",
            "instructor": "Trần Thị B",
            "price": 499000,
            "duration": "60 giờ",
            "rating": 4.9,
            "category": "web_development"
        },
        {
            "id": "course_3",
            "title": "Data Science và Machine Learning",
            "description": "Khóa học về phân tích dữ liệu và machine learning sử dụng Python",
            "instructor": "Lê Văn C",
            "price": 799000,
            "duration": "80 giờ", 
            "rating": 4.7,
            "category": "data_science"
        },
        {
            "id": "course_4",
            "title": "UI/UX Design cơ bản",
            "description": "Học thiết kế giao diện người dùng và trải nghiệm người dùng",
            "instructor": "Phạm Thị D",
            "price": 199000,
            "duration": "30 giờ",
            "rating": 4.6,
            "category": "design"
        },
        {
            "id": "course_5",
            "title": "Digital Marketing",
            "description": "Chiến lược marketing số và quảng cáo online",
            "instructor": "Hoàng Văn E",
            "price": 249000,
            "duration": "35 giờ",
            "rating": 4.5,
            "category": "marketing"
        }
    ]
    
    # Add courses to knowledge base
    print("📚 Thêm khóa học vào knowledge base...")
    for course in sample_courses:
        await rag_system.update_course_knowledge(course)
        print(f"✅ Đã thêm: {course['title']}")
    
    # Sample FAQ data
    sample_faqs = [
        {
            "question": "Làm thế nào để đăng ký khóa học?",
            "answer": "Bạn có thể đăng ký khóa học bằng cách: 1) Tạo tài khoản trên website, 2) Chọn khóa học muốn học, 3) Thanh toán học phí, 4) Bắt đầu học ngay lập tức.",
            "category": "registration"
        },
        {
            "question": "Tôi có thể học offline không?",
            "answer": "Hiện tại tất cả khóa học đều được thiết kế để học online. Bạn có thể học mọi lúc, mọi nơi chỉ cần có internet.",
            "category": "learning_format"
        },
        {
            "question": "Có chứng chỉ sau khi hoàn thành khóa học không?",
            "answer": "Có, bạn sẽ nhận được chứng chỉ hoàn thành khóa học sau khi hoàn thành tất cả bài học và đạt điểm yêu cầu.",
            "category": "certificate"
        },
        {
            "question": "Tôi có thể hoàn tiền không?",
            "answer": "Bạn có thể hoàn tiền trong vòng 7 ngày đầu tiên sau khi đăng ký nếu chưa hoàn thành quá 20% khóa học.",
            "category": "refund"
        },
        {
            "question": "Làm sao để liên hệ hỗ trợ?",
            "answer": "Bạn có thể liên hệ hỗ trợ qua: 1) Chat với chatbot AI 24/7, 2) Email: support@elearning.com, 3) Hotline: 1900-xxxx",
            "category": "support"
        },
        {
            "question": "Video không phát được thì làm sao?",
            "answer": "Nếu video không phát được, hãy thử: 1) Refresh trang web, 2) Kiểm tra kết nối internet, 3) Thử trình duyệt khác, 4) Liên hệ hỗ trợ kỹ thuật.",
            "category": "technical"
        },
        {
            "question": "Tôi quên mật khẩu thì làm sao?",
            "answer": "Bạn có thể khôi phục mật khẩu bằng cách: 1) Nhấn 'Quên mật khẩu' trên trang đăng nhập, 2) Nhập email đã đăng ký, 3) Kiểm tra email để nhận link đặt lại mật khẩu.",
            "category": "account"
        },
        {
            "question": "Có thể học trên mobile không?",
            "answer": "Có, bạn có thể học trên điện thoại thông qua ứng dụng mobile hoặc trình duyệt web. Tất cả tính năng đều được tối ưu cho mobile.",
            "category": "mobile"
        }
    ]
    
    # Add FAQs to knowledge base
    print("❓ Thêm FAQ vào knowledge base...")
    for faq in sample_faqs:
        await rag_system.add_faq(
            faq["question"], 
            faq["answer"], 
            faq["category"]
        )
        print(f"✅ Đã thêm FAQ: {faq['question'][:50]}...")
    
    # Additional knowledge items
    additional_knowledge = [
        {
            "content": """
            Hệ thống Elearning cung cấp các tính năng:
            - Học trực tuyến mọi lúc mọi nơi
            - Video bài giảng chất lượng cao
            - Bài tập và kiểm tra tương tác
            - Theo dõi tiến độ học tập
            - Chứng chỉ hoàn thành khóa học
            - Hỗ trợ học viên 24/7
            """,
            "metadata": {
                "title": "Tính năng hệ thống Elearning",
                "category": "system_features",
                "source": "system_docs"
            }
        },
        {
            "content": """
            Phương thức thanh toán được hỗ trợ:
            - Thẻ tín dụng/ghi nợ quốc tế (Visa, Mastercard)
            - Ví điện tử (MoMo, ZaloPay, ViettelPay)
            - Chuyển khoản ngân hàng
            - Thanh toán trả góp (tùy khóa học)
            - Ví điện tử quốc tế (PayPal)
            """,
            "metadata": {
                "title": "Phương thức thanh toán",
                "category": "payment_methods",
                "source": "payment_guide"
            }
        },
        {
            "content": """
            Lộ trình học tập được đề xuất:
            - Người mới bắt đầu: Khóa học cơ bản → Thực hành → Dự án
            - Có kinh nghiệm: Khóa học nâng cao → Chuyên sâu → Chứng chỉ
            - Chuyển đổi nghề: Khóa học foundation → Portfolio → Tìm việc
            """,
            "metadata": {
                "title": "Lộ trình học tập",
                "category": "learning_path",
                "source": "learning_guide"
            }
        }
    ]
    
    # Add additional knowledge
    print("📖 Thêm kiến thức bổ sung...")
    for item in additional_knowledge:
        await rag_system.add_document(
            content=item["content"],
            metadata=item["metadata"]
        )
        print(f"✅ Đã thêm: {item['metadata']['title']}")
    
    # Get final statistics
    stats = rag_system.get_collection_stats()
    print("\n📊 Thống kê Knowledge Base:")
    print(f"- Tổng documents: {stats.get('knowledge_base', {}).get('total_documents', 0)}")
    print(f"- Số khóa học: {stats.get('courses', {}).get('total_courses', 0)}")
    print(f"- Số FAQ: {stats.get('faq', {}).get('total_faqs', 0)}")
    
    print("\n🎉 Hoàn thành khởi tạo Knowledge Base!")
    print("Bạn có thể bắt đầu sử dụng chatbot ngay bây giờ.")

if __name__ == "__main__":
    asyncio.run(initialize_knowledge_base())

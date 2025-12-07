/**
 * Service để gọi Google Gemini API
 * Tích hợp với context từ backend để trả lời dựa trên dữ liệu học tập của user
 */

import { GoogleGenerativeAI } from '@google/generative-ai';
import { resolveGeminiApiKey } from '../utils/geminiKey';
import { AiContextResponse } from './chatContextService';

// System prompt cho chatbot học liệu
const SYSTEM_PROMPT = `Bạn là trợ lý AI chuyên nghiệp cho hệ thống học liệu trực tuyến.

NHIỆM VỤ CỦA BẠN:
1. Giải thích bài học, khái niệm, và nội dung học tập một cách dễ hiểu
2. Gợi ý tài liệu, khóa học phù hợp với nhu cầu học viên
3. Theo dõi và phân tích tiến độ học tập của học viên
4. Hướng dẫn sử dụng các tính năng của hệ thống
5. Hỗ trợ kỹ thuật và giải đáp thắc mắc về khóa học

QUY TẮC TRẢ LỜI:
- Luôn trả lời bằng tiếng Việt, giọng điệu thân thiện và chuyên nghiệp
- Nếu có phần "DỮ LIỆU HỌC TẬP CÁ NHÂN", bạn PHẢI ưu tiên sử dụng thông tin trong đó để trả lời chính xác
- Khi đưa ra lời khuyên, hãy chỉ ra cơ sở dựa trên dữ liệu học tập của học viên
- Nếu không có thông tin, hãy đề xuất cách tìm hiểu thêm hoặc liên hệ admin
- Format câu trả lời rõ ràng, có thể dùng bullet points hoặc số thứ tự khi cần
- Khuyến khích và động viên học viên trong quá trình học tập

CHUYÊN MÔN:
- Giải thích các khái niệm lập trình, công nghệ, và kỹ năng mềm
- Phân tích tiến độ học tập và đưa ra gợi ý cải thiện
- Tư vấn lộ trình học phù hợp với mục tiêu của học viên`;

/**
 * Format context data thành text để đưa vào prompt
 */
const buildContextSection = (context?: AiContextResponse): string => {
  if (!context) {
    return 'Không có dữ liệu học tập cá nhân được cung cấp cho câu hỏi này.';
  }

  const lines: string[] = [];
  lines.push('=== DỮ LIỆU HỌC TẬP CÁ NHÂN ===');
  lines.push(`Học viên: ${context.userName || 'Chưa có tên'}`);

  if (context.summary) {
    const s = context.summary;
    lines.push('\n📊 TỔNG QUAN:');
    lines.push(
      `- Tổng số khóa học: ${s.totalCourses || 0}`
    );
    lines.push(
      `- Đã hoàn thành: ${s.completedCourses || 0} khóa học`
    );
    if (s.averageScore !== undefined) {
      lines.push(`- Điểm trung bình: ${s.averageScore.toFixed(1)}/10`);
    }
    if (s.totalStudyHours !== undefined) {
      lines.push(`- Tổng thời gian học: ${s.totalStudyHours} giờ`);
    }
    if (s.completionRate !== undefined) {
      lines.push(
        `- Tỷ lệ hoàn thành: ${s.completionRate.toFixed(1)}%`
      );
    }
  }

  if (context.enrolledCourses && context.enrolledCourses.length > 0) {
    lines.push('\n📚 CÁC KHÓA HỌC ĐANG HỌC:');
    context.enrolledCourses.forEach((course) => {
      lines.push(
        `- ${course.name}: ${course.progress}% hoàn thành${course.instructor ? ` (Giảng viên: ${course.instructor})` : ''}`
      );
    });
  }

  if (context.learningProgress && context.learningProgress.length > 0) {
    lines.push('\n📈 TIẾN ĐỘ CHI TIẾT:');
    context.learningProgress.forEach((progress) => {
      lines.push(
        `- ${progress.courseName}: ${progress.completedLessons}/${progress.totalLessons} bài học đã hoàn thành`
      );
    });
  }

  if (context.recentActivities && context.recentActivities.length > 0) {
    lines.push('\n🕐 HOẠT ĐỘNG GẦN ĐÂY:');
    context.recentActivities.slice(0, 5).forEach((activity) => {
      lines.push(`- ${activity.description} (${activity.date})`);
    });
  }

  if (context.recommendations && context.recommendations.length > 0) {
    lines.push('\n💡 GỢI Ý:');
    context.recommendations.forEach((rec) => {
      lines.push(`- ${rec}`);
    });
  }

  if (context.lastUpdated) {
    lines.push(`\n(Cập nhật lần cuối: ${context.lastUpdated})`);
  }

  return lines.join('\n');
};

/**
 * Khởi tạo Gemini client
 */
const getGeminiClient = (): GoogleGenerativeAI | null => {
  const apiKey = resolveGeminiApiKey();
  if (!apiKey) {
    console.warn('Gemini API key not found');
    return null;
  }
  return new GoogleGenerativeAI(apiKey);
};

/**
 * Lấy phản hồi nhanh từ Gemini (có thể có context)
 */
export const getQuickResponse = async (
  userMessage: string,
  context?: AiContextResponse
): Promise<string> => {
  const client = getGeminiClient();
  if (!client) {
    return 'Xin lỗi, chưa cấu hình API key cho Gemini. Vui lòng cấu hình trong phần Settings.';
  }

  try {
    const model = client.getGenerativeModel({ model: 'gemini-2.0-flash' });

    // Build prompt với context
    const contextSection = buildContextSection(context);
    const fullPrompt = `${SYSTEM_PROMPT}

${contextSection}

---
CÂU HỎI CỦA HỌC VIÊN: ${userMessage}

Hãy trả lời câu hỏi trên dựa trên thông tin đã cung cấp. Nếu có dữ liệu học tập cá nhân, hãy sử dụng nó để trả lời chính xác và có giá trị.`;

    const result = await model.generateContent(fullPrompt);
    const response = result.response;
    const text = response.text();

    return text || 'Xin lỗi, tôi không thể tạo phản hồi. Vui lòng thử lại.';
  } catch (error: any) {
    console.error('Error calling Gemini API:', error);
    
    // Xử lý các lỗi phổ biến
    const errorMsg = error?.message || String(error);
    if (errorMsg.includes('API_KEY_INVALID') || errorMsg.includes('401')) {
      return 'API key không hợp lệ. Vui lòng kiểm tra lại cấu hình.';
    }
    if (errorMsg.includes('429') || errorMsg.includes('RESOURCE_EXHAUSTED')) {
      return 'Hệ thống đang quá tải. Vui lòng thử lại sau vài phút. 🙏';
    }
    if (errorMsg.includes('503') || errorMsg.includes('UNAVAILABLE')) {
      return 'Dịch vụ AI tạm thời không khả dụng. Vui lòng thử lại sau. ⏳';
    }
    
    return `Xin lỗi, đã xảy ra lỗi: ${errorMsg}. Vui lòng thử lại.`;
  }
};

/**
 * Gửi tin nhắn với lịch sử hội thoại (cho conversation flow)
 */
export const sendMessageToGemini = async (
  userMessage: string,
  history?: Array<{ role: 'user' | 'model'; parts: string }>,
  context?: AiContextResponse
): Promise<string> => {
  const client = getGeminiClient();
  if (!client) {
    return 'Xin lỗi, chưa cấu hình API key cho Gemini.';
  }

  try {
    const model = client.getGenerativeModel({ model: 'gemini-2.0-flash' });

    // Build conversation history
    const chatHistory = history || [];
    
    // Start chat với history
    const chat = model.startChat({
      history: chatHistory.map((h) => ({
        role: h.role,
        parts: [{ text: h.parts }],
      })),
    });

    // Build prompt với context
    const contextSection = buildContextSection(context);
    const systemMessage = `${SYSTEM_PROMPT}

${contextSection}

---
Hãy trả lời câu hỏi tiếp theo của học viên dựa trên thông tin trên và lịch sử hội thoại.`;

    // Gửi system message trước (nếu cần)
    // Sau đó gửi user message
    const result = await chat.sendMessage(userMessage);
    const response = result.response;
    const text = response.text();

    return text || 'Xin lỗi, tôi không thể tạo phản hồi.';
  } catch (error: any) {
    console.error('Error calling Gemini API with history:', error);
    return `Xin lỗi, đã xảy ra lỗi: ${error?.message || String(error)}`;
  }
};


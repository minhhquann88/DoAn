# PHÂN TÍCH CODE CHI TIẾT - 3 MODULE CHÍNH

## 1. RAG AI SYSTEM (Chatbot với Google Gemini)

### 1.1. Sơ đồ Logic

```
User gửi câu hỏi (có thể kèm courseId)
    ↓
ChatbotController nhận request → ChatbotService.processMessage()
    ↓
buildContext(courseId):
    - Nếu có courseId → Lấy thông tin khóa học từ DB (title, description, price, status)
    - Nếu không → Context mặc định về nền tảng E-learning
    ↓
buildPrompt(userMessage, context):
    - Kết hợp context + userMessage thành prompt hoàn chỉnh
    - Format: "{context}\n\nNgười dùng hỏi: {message}\n\nHãy trả lời một cách thân thiện và hữu ích bằng tiếng Việt."
    ↓
callGeminiAPI(prompt):
    - POST đến Google Gemini API (gemini-2.0-flash-exp)
    - URL: https://generativelanguage.googleapis.com/v1beta/models/{model}:generateContent?key={apiKey}
    - Request Body: { contents: [{ parts: [{ text: prompt }] }] }
    ↓
parseGeminiResponse():
    - Parse JSON response từ Gemini
    - Extract text từ: response.candidates[0].content.parts[0].text
    ↓
Trả về ChatResponse cho Frontend
```

### 1.2. Code Highlight

**File chính:** `backend/src/main/java/com/coursemgmt/service/ChatbotService.java`

**Hàm xử lý chính:**
- `processMessage(ChatRequest request, Long userId)` - Entry point
- `buildContext(Long courseId)` - Xây dựng context từ khóa học
- `buildPrompt(String userMessage, String context)` - Tạo prompt cho LLM
- `callGeminiAPI(String prompt)` - Gọi Google Gemini API
- `parseGeminiResponse(Map<String, Object> response)` - Parse response

**Tại sao thiết kế như vậy:**
1. **Tách biệt Service Layer**: Logic xử lý AI tách riêng khỏi Controller, dễ test và maintain
2. **Context-aware RAG**: Không dùng Vector DB phức tạp, mà dùng **Context Injection** đơn giản:
   - Nếu user hỏi về khóa học cụ thể → Inject thông tin khóa học vào prompt
   - Nếu hỏi chung → Dùng context mặc định về nền tảng
3. **Google Gemini thay vì OpenAI**: 
   - Gemini hỗ trợ tốt tiếng Việt
   - Model `gemini-2.0-flash-exp` nhanh và miễn phí cho development
   - API đơn giản hơn OpenAI

**Frontend Integration:**
- File: `frontend/src/services/chatbotService.ts`
- Function: `sendChatMessage(message: string, courseId?: number)`
- Gọi API: `POST /v1/chat/message` với body `{ message, courseId }`

### 1.3. Độ phức tạp/Thách thức

**Thách thức đã giải quyết:**

1. **Xử lý lỗi API:**
   - Gemini API có thể timeout hoặc rate limit
   - **Giải pháp**: Try-catch toàn bộ, trả về message lỗi thân thiện cho user
   - Log lỗi chi tiết để debug

2. **Parse Response phức tạp:**
   - Gemini trả về nested JSON structure
   - **Giải pháp**: Dùng `@SuppressWarnings("unchecked")` và type casting an toàn
   - Kiểm tra null ở mọi level để tránh NullPointerException

3. **Context Management:**
   - Cần context đúng cho từng loại câu hỏi
   - **Giải pháp**: 
     - Nếu có `courseId` → Query DB lấy thông tin khóa học
     - Format context thành string rõ ràng, dễ LLM hiểu

**Hạn chế hiện tại (có thể cải thiện):**
- Chưa có Vector DB để semantic search trong nội dung khóa học
- Chưa có conversation history (mỗi câu hỏi độc lập)
- Chưa có caching để giảm API calls

---

## 2. CHAT REALTIME (WebSocket với STOMP)

### 2.1. Sơ đồ Logic

```
Frontend: useChat hook
    ↓
Kết nối WebSocket:
    - SockJS connection: /ws
    - STOMP Client với JWT token trong headers
    ↓
Backend: WebSocketConfig
    - Enable STOMP message broker: /topic, /queue
    - Application prefix: /app
    - User destination: /user
    - Interceptor: WebSocketAuthInterceptor (xác thực JWT)
    ↓
Subscribe Topics:
    - /topic/conversation/{conversationId} → Nhận messages mới
    - /topic/conversation/{conversationId}/typing → Typing indicator
    - /topic/conversation/{conversationId}/read → Read receipts
    - /topic/conversation/{conversationId}/online → Online status
    ↓
User gửi message:
    Frontend → STOMP send("/app/chat.send", message)
    ↓
Backend: WebSocketChatController.sendMessage()
    - Xác thực user từ JWT
    - ChatService.sendMessage() → Lưu vào DB
    - SimpMessagingTemplate.convertAndSend("/topic/conversation/{id}", message)
    - Gửi notification cho participants khác
    ↓
Tất cả participants nhận message qua WebSocket
    ↓
Frontend: handleWebSocketMessage()
    - Thêm message vào store (Zustand)
    - Update conversation last message
    - Show notification nếu không phải conversation hiện tại
```

### 2.2. Code Highlight

**Backend Files:**
1. **`WebSocketConfig.java`**: Cấu hình STOMP broker, endpoints, interceptors
2. **`WebSocketChatController.java`**: Xử lý các message types:
   - `@MessageMapping("/chat.send")` - Gửi message
   - `@MessageMapping("/chat.typing")` - Typing indicator
   - `@MessageMapping("/chat.read")` - Mark as read
   - `@MessageMapping("/chat.update")` - Edit message
   - `@MessageMapping("/chat.delete")` - Delete message
   - `@MessageMapping("/chat.online")` - Online status
   - `@MessageMapping("/chat.offline")` - Offline status

3. **`ChatService.java`**: Business logic:
   - `sendMessage()` - Lưu message vào DB, update conversation
   - `getMessages()` - Pagination messages
   - `markAsRead()` - Mark messages as read
   - `createConversation()` - Validate enrollment (student phải enrolled mới chat với instructor)

**Frontend Files:**
1. **`useChat.ts`**: Custom hook quản lý WebSocket:
   - `connectWebSocket()` - Kết nối STOMP với SockJS
   - `handleWebSocketMessage()` - Xử lý các event types
   - Auto-reconnect với exponential backoff
   - Optimistic updates (thêm message ngay, chờ server confirm)

2. **`chatStore.ts`** (Zustand): State management:
   - `conversations[]` - Danh sách conversations
   - `messages[conversationId]` - Messages theo conversation
   - `typingUsers` - Set users đang typing
   - `onlineUsers` - Set users online

**Tại sao thiết kế như vậy:**

1. **STOMP Protocol thay vì raw WebSocket:**
   - STOMP là messaging protocol chuẩn, dễ implement pub/sub
   - Spring hỗ trợ tốt STOMP với `SimpMessagingTemplate`
   - Frontend có thư viện `@stomp/stompjs` mature

2. **Topic-based Broadcasting:**
   - Mỗi conversation có topic riêng: `/topic/conversation/{id}`
   - Tất cả participants subscribe cùng topic → Nhận message realtime
   - Không cần maintain connection list thủ công

3. **JWT Authentication trong WebSocket:**
   - `WebSocketAuthInterceptor` extract JWT từ connection headers
   - Validate token và set Authentication vào SecurityContext
   - Đảm bảo chỉ authenticated users mới connect được

4. **Optimistic Updates:**
   - Frontend thêm message ngay khi user gửi (không chờ server)
   - Khi server response về → Replace optimistic message với real message (có ID thật)
   - UX mượt mà, không có delay cảm nhận được

### 2.3. Độ phức tạp/Thách thức

**Thách thức đã giải quyết:**

1. **Connection Management:**
   - WebSocket có thể disconnect bất cứ lúc nào (network, server restart)
   - **Giải pháp**: 
     - Auto-reconnect với `reconnectDelay: 5000`
     - Max reconnect attempts: 5
     - Heartbeat: `heartbeatIncoming: 4000, heartbeatOutgoing: 4000` để detect dead connections

2. **Duplicate Messages:**
   - Optimistic message + Server response có thể trùng
   - **Giải pháp**: 
     - Check duplicate bằng ID hoặc (senderId + content + timestamp)
     - Nếu duplicate → Replace optimistic với real message

3. **Typing Indicator Debouncing:**
   - Typing indicator cần tự động tắt sau 3 giây
   - **Giải pháp**: `setTimeout(() => setTyping(false), 3000)` trong `handleWebSocketMessage`

4. **Online Status Flickering:**
   - User có thể disconnect/reconnect nhanh → Status nhấp nháy
   - **Giải pháp**: 
     - Debounce offline status với 500ms delay
     - Clear timeout nếu user online lại trước khi timeout

5. **Enrollment Validation:**
   - Student chỉ được chat với instructor nếu đã enrolled
   - **Giải pháp**: 
     - `ChatService.createConversation()` check enrollment trước khi tạo conversation
     - Validate courseId nếu có, hoặc check bất kỳ course nào của instructor

**Tối ưu hóa:**
- Pagination messages: Load 50 messages mỗi lần
- Refetch conversations mỗi 30 giây để sync
- Store messages trong Zustand để tránh refetch không cần thiết

---

## 3. HỌC VIÊN HỌC BÀI (Learning Progress Tracking)

### 3.1. Sơ đồ Logic

```
Học viên vào trang học: /learn/[courseId]
    ↓
Frontend: LearningPage component
    ↓
Fetch dữ liệu:
    - getCourseContent(courseId) → Lấy chapters + lessons
    - getEnrollment(courseId, userId) → Lấy progress từ backend
    ↓
Hiển thị:
    - Sidebar: Danh sách chapters/lessons với progress indicators
    - Main content: Video player hoặc content viewer
    ↓
User xem video:
    - Video player track: currentTime, duration
    - Mỗi 10 giây → updateLessonWatchTime(watchedTime, totalDuration)
    ↓
Backend: ContentService.updateLessonWatchTime()
    - Tìm/Create User_Progress record
    - Update: lastWatchedTime, totalDuration
    - Tính: percent = watchedTime / totalDuration
    - Nếu percent >= 90% → Auto-complete lesson
        - Set isCompleted = true
        - Set completedAt = now
        - updateEnrollmentProgress() → Recalculate course progress %
    ↓
User click "Hoàn thành":
    - markLessonAsCompleted(lessonId)
    ↓
Backend: ContentService.markLessonAsCompleted()
    - Tìm/Create User_Progress
    - Set isCompleted = true
    - updateEnrollmentProgress()
    ↓
updateEnrollmentProgress():
    - Count total lessons trong course
    - Count completed lessons
    - progress = (completed / total) * 100
    - Nếu progress >= 100% → Set enrollment.status = COMPLETED
    - Auto-issue certificate nếu chưa có
```

### 3.2. Code Highlight

**Backend Files:**

1. **`ContentService.java`**:
   - `markLessonAsCompleted(Long lessonId, UserDetailsImpl userDetails)`:
     ```java
     // Tìm enrollment của user cho course này
     Enrollment enrollment = enrollmentRepository.findByUserAndCourse(user, course)
         .orElseThrow(() -> new RuntimeException("Bạn chưa đăng ký khóa học này!"));
     
     // Tìm hoặc tạo User_Progress
     User_Progress progress = userProgressRepository.findByEnrollmentAndLesson(enrollment, lesson)
         .orElse(new User_Progress());
     
     progress.setIsCompleted(true);
     progress.setCompletedAt(LocalDateTime.now());
     userProgressRepository.save(progress);
     
     // Recalculate course progress
     updateEnrollmentProgress(enrollment);
     ```

   - `updateLessonWatchTime(Long lessonId, Integer watchedTime, Integer totalDuration, UserDetailsImpl userDetails)`:
     ```java
     // Update watched time
     progress.setLastWatchedTime(watchedTime);
     progress.setTotalDuration(totalDuration);
     
     // Auto-complete nếu watched >= 90%
     double percent = (double) watchedTime / totalDuration;
     if (percent >= 0.9 && !Boolean.TRUE.equals(progress.getIsCompleted())) {
         progress.setIsCompleted(true);
         progress.setCompletedAt(LocalDateTime.now());
         updateEnrollmentProgress(enrollment);
     }
     ```

   - `updateEnrollmentProgress(Enrollment enrollment)`:
     ```java
     long totalLessons = lessonRepository.countByChapter_Course_Id(courseId);
     long completedLessons = userProgressRepository.countCompletedLessons(enrollmentId);
     double progress = totalLessons > 0 ? (completedLessons * 100.0 / totalLessons) : 100.0;
     
     enrollment.setProgress(progress);
     if (progress >= 100.0) {
         enrollment.setStatus(EEnrollmentStatus.COMPLETED);
         // Auto-issue certificate
     }
     ```

2. **`User_Progress.java`** (Model):
   ```java
   @Entity
   @Table(name = "user_progress")
   public class User_Progress {
       private Boolean isCompleted = false;
       private LocalDateTime completedAt;
       private Integer lastWatchedTime; // seconds
       private Integer totalDuration; // seconds
       
       @ManyToOne
       private Enrollment enrollment;
       
       @ManyToOne
       private Lesson lesson;
   }
   ```

**Frontend Files:**

1. **`learn/[id]/page.tsx`**:
   - Video progress tracking:
     ```typescript
     const [videoProgress, setVideoProgress] = useState<{
       watchedTime: number;
       totalDuration: number;
       percentage: number;
     } | null>(null);
     
     // Track video time mỗi 10 giây
     useEffect(() => {
       const interval = setInterval(() => {
         if (videoRef.current && currentLesson?.contentType === 'VIDEO') {
           const watched = videoRef.current.currentTime;
           const total = videoRef.current.duration;
           if (total > 0) {
             updateLessonWatchTime(currentLesson.id, Math.floor(watched), Math.floor(total));
           }
         }
       }, 10000); // Mỗi 10 giây
       return () => clearInterval(interval);
     }, [currentLessonId]);
     ```

   - Complete button logic:
     ```typescript
     // Chỉ hiện nút "Hoàn thành" nếu watched >= 80%
     const canComplete = videoProgress && videoProgress.percentage >= 80;
     
     const handleCompleteLesson = () => {
       if (currentLessonId) {
         completeLessonMutation.mutate(currentLessonId);
       }
     };
     ```

2. **`contentService.ts`**:
   - `updateLessonWatchTime(lessonId, watchedTime, totalDuration)`
   - `markLessonAsCompleted(lessonId)`

**Tại sao thiết kế như vậy:**

1. **Auto-Progress Tracking:**
   - Không cần user phải click "Hoàn thành" thủ công
   - Track video watch time tự động → Nếu >= 90% → Auto-complete
   - UX tốt hơn, giảm friction

2. **Progress Calculation:**
   - Progress được tính từ `User_Progress` records, không phải từ frontend
   - Đảm bảo accuracy và consistency
   - Backend là single source of truth

3. **Optimistic Updates với Refetch:**
   - Sau khi complete lesson → Remove queries từ cache
   - Refetch course content và enrollment để sync ngay
   - Invalidate các queries liên quan (certificates, my-courses, etc.)

4. **Transaction Safety:**
   - `@Transactional` trên các methods quan trọng
   - Đảm bảo atomic operations (complete lesson + update enrollment progress)

### 3.3. Độ phức tạp/Thách thức

**Thách thức đã giải quyết:**

1. **Race Conditions:**
   - Nhiều requests update progress cùng lúc có thể conflict
   - **Giải pháp**: 
     - `@Transactional` đảm bảo atomicity
     - `findByEnrollmentAndLesson().orElse(new User_Progress())` → Upsert pattern

2. **Progress Sync:**
   - Frontend có thể có stale data sau khi complete lesson
   - **Giải pháp**: 
     - `queryClient.removeQueries()` → Force refetch
     - `refetchCourseContent()` và `refetchEnrollment()` ngay sau mutation success
     - Invalidate tất cả related queries

3. **Auto-complete Logic:**
   - Cần đảm bảo chỉ complete 1 lần (không duplicate)
   - **Giải pháp**: 
     - Check `!Boolean.TRUE.equals(progress.getIsCompleted())` trước khi auto-complete
     - Set flag `hasAutoCompleted` ở frontend để prevent multiple calls

4. **Performance:**
   - Update watch time mỗi 10 giây có thể tạo nhiều DB writes
   - **Giải pháp**: 
     - Chỉ update khi có thay đổi đáng kể
     - Backend có thể batch updates nếu cần (chưa implement)

5. **Certificate Auto-issue:**
   - Khi course completed → Tự động tạo certificate
   - **Giải pháp**: 
     - Check trong `updateEnrollmentProgress()` nếu progress >= 100%
     - Gọi certificate service để issue certificate

**Tối ưu hóa có thể làm:**
- Batch update watch time (ví dụ: mỗi 30 giây thay vì 10 giây)
- Cache course content để giảm DB queries
- Use Redis để cache progress nếu scale lớn

---

## TỔNG KẾT

### Điểm mạnh của kiến trúc:

1. **Separation of Concerns**: Mỗi module có trách nhiệm rõ ràng
2. **Real-time Capabilities**: WebSocket cho chat realtime mượt mà
3. **User Experience**: Auto-progress tracking, optimistic updates
4. **Scalability**: Có thể scale từng phần độc lập

### Cải thiện có thể làm:

1. **RAG AI**: Thêm Vector DB (Chroma/Pinecone) để semantic search trong course content
2. **Chat**: Thêm conversation history cho AI chatbot
3. **Progress**: Batch updates để giảm DB load
4. **Caching**: Redis cho frequently accessed data


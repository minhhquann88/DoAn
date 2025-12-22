# E-Learning Platform Frontend

Nền tảng học trực tuyến hiện đại được xây dựng với Next.js 14+, TypeScript, Tailwind CSS và shadcn/ui.

## Tech Stack

- **Framework**: Next.js 14+ (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS 4
- **UI Components**: shadcn/ui
- **State Management**: Zustand
- **Data Fetching**: TanStack Query (React Query)
- **Form Handling**: React Hook Form + Zod
- **Icons**: Lucide React
- **Animations**: Framer Motion

## Features Đã Hoàn Thành

### ✅ Phase 1 - MVP

#### 1. Authentication Module
- **Login Page** (`/auth/login`)
  - Form validation với Zod
  - Password visibility toggle
  - Remember me checkbox
  - Social login UI (Google, Facebook, GitHub)
  - Responsive design
  
- **Register Page** (`/auth/register`)
  - Role selection (Student/Lecturer)
  - Password strength indicator
  - Real-time validation
  - Terms & conditions checkbox
  
- **Forgot Password** (`/auth/forgot-password`)
  - Email verification flow
  - Success confirmation UI
  
- **Reset Password** (`/auth/reset-password`)
  - Token validation
  - Password strength indicator
  - Confirm password matching

#### 2. Home Page (`/`)
- Hero section với search bar
- Statistics section (courses, students, instructors)
- Featured courses carousel
- Popular categories grid
- Call-to-action sections
- Fully responsive

#### 3. Course Listing (`/courses`)
- Advanced filters sidebar
  - Level filter (Beginner, Intermediate, Advanced, Expert)
  - Price filter
  - Rating filter
- Sort options (Popular, Rating, Newest, Price)
- Course grid với pagination
- Search functionality
- Responsive layout

#### 4. Course Detail (`/courses/[id]`)
- Hero section với course info
- Sticky enrollment card
- Tabs navigation
  - Overview (What you'll learn, Requirements, Description)
  - Curriculum (Accordion với sections và lessons)
  - Instructor profile
  - Reviews section
- Mobile-friendly với fixed bottom CTA
- Breadcrumb navigation

#### 5. UI Components
- Navbar với search, notifications, cart, user menu
- Footer với newsletter subscription
- Course cards với hover effects
- Skeleton loading states
- Responsive design cho tất cả screen sizes

## Cấu Trúc Thư Mục

```
frontend/
├── src/
│   ├── app/                      # Next.js App Router
│   │   ├── (auth)/              # Auth routes group
│   │   │   ├── login/
│   │   │   ├── register/
│   │   │   ├── forgot-password/
│   │   │   └── reset-password/
│   │   ├── courses/
│   │   │   ├── [id]/            # Dynamic course detail
│   │   │   └── page.tsx         # Course listing
│   │   ├── layout.tsx
│   │   ├── page.tsx             # Homepage
│   │   └── globals.css
│   │
│   ├── components/
│   │   ├── ui/                  # shadcn/ui components
│   │   ├── layout/
│   │   │   ├── Navbar.tsx
│   │   │   └── Footer.tsx
│   │   └── course/
│   │       ├── CourseCard.tsx
│   │       └── CourseGrid.tsx
│   │
│   ├── hooks/
│   │   ├── useAuth.ts
│   │   └── useCourses.ts
│   │
│   ├── stores/
│   │   ├── authStore.ts         # Zustand auth state
│   │   └── uiStore.ts           # Zustand UI state
│   │
│   ├── lib/
│   │   ├── api.ts               # Axios instance
│   │   ├── constants.ts         # App constants
│   │   ├── providers.tsx        # React Query provider
│   │   └── utils.ts             # Utility functions
│   │
│   └── types/
│       └── index.ts             # TypeScript types
│
├── public/
├── components.json              # shadcn/ui config
├── package.json
├── tsconfig.json
├── next.config.ts
└── postcss.config.mjs
```

## Cài Đặt & Chạy Project

### Prerequisites
- Node.js 18+ 
- npm hoặc yarn

### 1. Clone Repository
```bash
cd frontend
```

### 2. Install Dependencies
```bash
npm install
```

### 3. Environment Variables
Tạo file `.env.local`:

```env
NEXT_PUBLIC_API_BASE_URL=http://localhost:8080/api
NEXT_PUBLIC_CHATBOT_API_URL=http://localhost:8000/api
```

### 4. Run Development Server
```bash
npm run dev
```

Mở [http://localhost:3000](http://localhost:3000)

### 5. Build for Production
```bash
npm run build
npm start
```

## Design System

### Colors
- **Primary**: Indigo (#4F46E5)
- **Secondary**: Purple (#7C3AED)
- **Accent**: Emerald (#10B981)
- **Background**: White/Gray-50
- **Dark mode**: Gray-900/Gray-800

### Typography
- **Headings**: Poppins (Bold)
- **Body**: Inter (Regular/Medium)

### Spacing
- Consistent: 4px, 8px, 16px, 24px, 32px, 48px

## API Integration

### Backend Endpoints
- **Auth**: `/api/auth/*`
- **Courses**: `/api/courses`
- **Users**: `/api/users`
- **Enrollments**: `/api/enrollments`
- **Chat**: `/api/chat`

### API Client
Sử dụng Axios instance với:
- Auto JWT token injection
- Request/Response interceptors
- Error handling
- Token refresh logic

## State Management

### Zustand Stores
- **authStore**: User authentication state
- **uiStore**: UI state (theme, sidebar, toasts, modals)

### React Query
- Course queries với caching
- Mutations cho CRUD operations
- Automatic refetching
- Optimistic updates

## Responsive Breakpoints
- **Mobile**: < 640px
- **Tablet**: 640px - 1024px
- **Desktop**: > 1024px

## To-Do List (Remaining Features)

### Phase 2 - Core Features
- [ ] Student Dashboard
  - [ ] My courses
  - [ ] Progress tracking
  - [ ] Certificates
- [ ] Learning Interface
  - [ ] Video player
  - [ ] Lesson navigation
  - [ ] Notes & bookmarks
  - [ ] Quiz taking
- [ ] Instructor Dashboard
  - [ ] Course creation wizard
  - [ ] Student management
  - [ ] Analytics
- [ ] Admin Dashboard
  - [ ] System overview
  - [ ] Course approval
  - [ ] User management

### Phase 3 - Advanced Features
- [ ] Chatbot widget
- [ ] Payment integration UI
- [ ] Certificate generation
- [ ] Advanced analytics
- [ ] Assignment system
- [ ] Live session UI

### Phase 4 - Polish
- [ ] Animations & transitions
- [ ] Performance optimization
- [ ] Accessibility improvements
- [ ] SEO optimization
- [ ] Testing

## Scripts

```bash
# Development
npm run dev

# Build
npm run build

# Production
npm start

# Lint
npm run lint
```

## Browser Support
- Chrome (latest)
- Firefox (latest)
- Safari (latest)
- Edge (latest)

## Contributing
Dự án được phát triển cho mục đích giáo dục và học tập.

## License
MIT License

---

**Developed with ❤️ using Next.js 14+ and TypeScript**

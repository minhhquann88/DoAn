# 🧪 TESTING GUIDE - Phase 1-3

## 📋 Hướng dẫn test toàn bộ features đã implement

---

## 🚀 Bước 1: Start Frontend

```bash
cd frontend
npm run dev
```

✅ **Expected:** Server chạy tại http://localhost:3000

---

## ✅ Test Checklist

### **Phase 1 - MVP** (8 pages)

#### **1. Homepage (/)** 
**URL:** http://localhost:3000

**Test Cases:**
- [ ] Hero section hiển thị đúng
- [ ] Search bar hoạt động (input text)
- [ ] CTA buttons (Khám phá khóa học, Bắt đầu dạy học)
- [ ] Statistics cards (4 cards với numbers)
- [ ] Featured courses section
  - [ ] Course cards hiển thị
  - [ ] Hover effects
  - [ ] Click vào card → redirect to detail
- [ ] Categories grid (8 categories)
  - [ ] Icons hiển thị
  - [ ] Category names
  - [ ] Course counts
- [ ] Navbar
  - [ ] Logo click → back to home
  - [ ] Search bar
  - [ ] Navigation links
  - [ ] Login/Register buttons
- [ ] Footer
  - [ ] All sections hiển thị
  - [ ] Newsletter form
  - [ ] Social links
- [ ] **Responsive:**
  - [ ] Mobile view (< 640px)
  - [ ] Tablet view (640-1024px)
  - [ ] Desktop view (> 1024px)

---

#### **2. Course Listing (/courses)**
**URL:** http://localhost:3000/courses

**Test Cases:**
- [ ] Header với search results count
- [ ] Search bar hoạt động
- [ ] Sort dropdown
  - [ ] Phổ biến nhất
  - [ ] Đánh giá cao
  - [ ] Mới nhất
  - [ ] Giá thấp
  - [ ] Giá cao
- [ ] Filters sidebar (Desktop)
  - [ ] Level filters (4 checkboxes)
  - [ ] Price range slider
  - [ ] Rating filter
  - [ ] Reset filters button
- [ ] Course grid
  - [ ] 12 courses hiển thị
  - [ ] Course cards đầy đủ info
  - [ ] Hover effects
  - [ ] Click → course detail
- [ ] Loading state (refresh page)
- [ ] Empty state (search không có kết quả)
- [ ] **Responsive:**
  - [ ] Mobile: Filters ở modal/drawer
  - [ ] Grid: 1 column (mobile) → 4 columns (desktop)

---

#### **3. Course Detail (/courses/[id])**
**URL:** http://localhost:3000/courses/1

**Test Cases:**
- [ ] Hero section
  - [ ] Breadcrumb navigation
  - [ ] Course title
  - [ ] Short description
  - [ ] Rating, students, duration
  - [ ] Instructor info
  - [ ] Badges (Bestseller, etc.)
  - [ ] Last updated date
- [ ] Enrollment card (Desktop sticky right)
  - [ ] Thumbnail
  - [ ] Price với discount
  - [ ] "Mua khóa học" button
  - [ ] Wishlist button
  - [ ] Share button
  - [ ] Course includes list
- [ ] Mobile: Fixed bottom bar
  - [ ] Price
  - [ ] "Mua ngay" button
- [ ] Tabs navigation
  - [ ] Overview tab
  - [ ] Curriculum tab
  - [ ] Instructor tab
  - [ ] Reviews tab
- [ ] **Overview tab:**
  - [ ] What you'll learn (6 items)
  - [ ] Requirements (4 items)
  - [ ] Description text
- [ ] **Curriculum tab:**
  - [ ] Accordion sections
  - [ ] Expand/collapse
  - [ ] Lesson list với icons
  - [ ] Duration per lesson
  - [ ] Preview badges
  - [ ] Total sections/lectures count
- [ ] **Instructor tab:**
  - [ ] Avatar
  - [ ] Name & title
  - [ ] Stats (students, courses, rating)
  - [ ] Bio
- [ ] **Reviews tab:**
  - [ ] Course rating summary
  - [ ] Review list (placeholder)
- [ ] **Responsive:** All elements adapt

---

#### **4. Authentication Pages**

##### **Login (/auth/login)**
**URL:** http://localhost:3000/auth/login

**Test Cases:**
- [ ] Form hiển thị
  - [ ] Email field
  - [ ] Password field với show/hide toggle
  - [ ] Remember me checkbox
  - [ ] Forgot password link
- [ ] Validation
  - [ ] Email required
  - [ ] Email format validation
  - [ ] Password required
  - [ ] Password min length (6 chars)
- [ ] Error messages hiển thị dưới fields
- [ ] Submit button
  - [ ] Disabled khi form invalid
  - [ ] Enabled khi form valid
- [ ] Social login buttons (Google, Facebook)
- [ ] "Chưa có tài khoản?" link → register
- [ ] **Mobile:** Form responsive

---

##### **Register (/auth/register)**
**URL:** http://localhost:3000/auth/register

**Test Cases:**
- [ ] Form fields
  - [ ] Full name
  - [ ] Email
  - [ ] Password với show/hide
  - [ ] Confirm password
  - [ ] Role selection (Student/Lecturer)
- [ ] Password strength indicator
  - [ ] Weak → Medium → Strong
  - [ ] Color changes
- [ ] Validation
  - [ ] All fields required
  - [ ] Email format
  - [ ] Password min 6 chars
  - [ ] Passwords match
  - [ ] Terms checkbox required
- [ ] Submit button states
- [ ] "Đã có tài khoản?" link → login
- [ ] Social register buttons

---

##### **Forgot Password (/auth/forgot-password)**
**URL:** http://localhost:3000/auth/forgot-password

**Test Cases:**
- [ ] Email input field
- [ ] Validation (email format)
- [ ] Submit button
- [ ] Success state
  - [ ] Check email message
  - [ ] Green checkmark icon
  - [ ] Back to login link
- [ ] Back to login link

---

##### **Reset Password (/auth/reset-password?token=xxx)**
**URL:** http://localhost:3000/auth/reset-password?token=test123

**Test Cases:**
- [ ] New password field
- [ ] Confirm password field
- [ ] Password strength indicator
- [ ] Validation (match, min length)
- [ ] Submit button
- [ ] Success message (mock)

---

### **Phase 2 - Core Features** (4 pages)

#### **5. Learning Interface (/learn/[id])**
**URL:** http://localhost:3000/learn/1

**Test Cases:**
- [ ] Top bar
  - [ ] Back to courses link
  - [ ] Course title
  - [ ] Overall progress bar
  - [ ] Progress percentage
- [ ] Sidebar (Desktop)
  - [ ] Toggle button
  - [ ] Curriculum accordion
  - [ ] Sections expandable
  - [ ] Lessons list
  - [ ] Active lesson highlighted
  - [ ] Completed checkmarks
  - [ ] Lesson duration
  - [ ] Click lesson → change content
- [ ] Main content area
  - [ ] Lesson title & type badge
  - [ ] **Video lessons:**
    - [ ] YouTube embed
    - [ ] Video plays
  - [ ] **Article lessons:**
    - [ ] Text content
    - [ ] Readable formatting
  - [ ] **Quiz lessons:**
    - [ ] Quiz UI placeholder
    - [ ] "Coming soon" message
  - [ ] **Assignment lessons:**
    - [ ] Assignment UI placeholder
- [ ] Lesson actions
  - [ ] Previous button (disabled on first)
  - [ ] Next button (disabled on last)
  - [ ] Complete lesson button
  - [ ] Progress updates khi click
- [ ] Notes section
  - [ ] Textarea
  - [ ] Save button
  - [ ] Placeholder text
- [ ] **Mobile:**
  - [ ] Sidebar becomes overlay
  - [ ] Toggle button works
  - [ ] Content stacks vertically

---

#### **6. Student Dashboard (/student)**
**URL:** http://localhost:3000/student

**Test Cases:**
- [ ] Dashboard Layout
  - [ ] Sidebar navigation (Desktop)
  - [ ] Hamburger menu (Mobile)
  - [ ] User profile dropdown
  - [ ] Logout button
- [ ] Welcome header
  - [ ] Greeting với user name
  - [ ] Current date
  - [ ] "Khám phá khóa học" button
- [ ] Stats cards (4 cards)
  - [ ] Enrolled courses count
  - [ ] Learning hours
  - [ ] Average progress
  - [ ] Certificates earned
  - [ ] Icons hiển thị
- [ ] Tabs
  - [ ] Continue Learning tab
  - [ ] All Courses tab
  - [ ] Recent Activity tab
- [ ] **Continue Learning tab:**
  - [ ] Course cards với progress bars
  - [ ] "Tiếp tục học" button
  - [ ] Progress percentage
  - [ ] Last watched info
- [ ] **All Courses tab:**
  - [ ] Full list of enrolled courses
  - [ ] Course status badges
  - [ ] View course buttons
- [ ] **Recent Activity tab:**
  - [ ] Activity list
  - [ ] Activity icons
  - [ ] Timestamps
  - [ ] Activity types
- [ ] Quick actions cards (3 cards)
  - [ ] Browse courses
  - [ ] My certificates
  - [ ] Settings
- [ ] **Responsive:** Sidebar collapses, stats stack

---

#### **7. My Courses (/student/my-courses)**
**URL:** http://localhost:3000/student/my-courses

**Test Cases:**
- [ ] Header
  - [ ] Title
  - [ ] "Khám phá" button
  - [ ] Search input
  - [ ] Sort dropdown
  - [ ] View toggles (Grid/List)
- [ ] View modes
  - [ ] Click Grid icon → grid view
  - [ ] Click List icon → list view
  - [ ] Layout changes
- [ ] Tabs
  - [ ] All courses
  - [ ] In Progress
  - [ ] Completed
- [ ] **Grid view:**
  - [ ] Course cards in grid
  - [ ] Progress bars
  - [ ] Status badges
  - [ ] Continue/View buttons
- [ ] **List view:**
  - [ ] Course items in list
  - [ ] More compact layout
  - [ ] Same info displayed
- [ ] Empty states
  - [ ] No courses message
  - [ ] "Browse courses" button
- [ ] Search functionality
  - [ ] Type in search
  - [ ] Courses filter (mock)
- [ ] **Responsive:** Grid columns adjust

---

#### **8. Profile (/student/profile)**
**URL:** http://localhost:3000/student/profile

**Test Cases:**
- [ ] Tabs
  - [ ] Personal Information
  - [ ] Security
  - [ ] Preferences
- [ ] **Personal Info tab:**
  - [ ] Avatar upload
    - [ ] Click to upload
    - [ ] Image preview
    - [ ] Change photo button
  - [ ] Form fields
    - [ ] Full name
    - [ ] Email
    - [ ] Phone
    - [ ] Bio textarea
  - [ ] Validation
    - [ ] Required fields
    - [ ] Email format
  - [ ] Save button
  - [ ] Cancel button
- [ ] **Security tab:**
  - [ ] Current password field
  - [ ] New password field
  - [ ] Confirm password field
  - [ ] Password strength indicator
  - [ ] Validation (match)
  - [ ] Save button
- [ ] **Preferences tab:**
  - [ ] Email notifications toggle
  - [ ] Push notifications toggle
  - [ ] Language selector
  - [ ] Theme toggle (Light/Dark)
  - [ ] Save preferences button
- [ ] **Responsive:** Form stacks on mobile

---

### **Phase 3 - Advanced Features** (3 pages)

#### **9. Instructor Dashboard (/instructor)**
**URL:** http://localhost:3000/instructor

**Test Cases:**
- [ ] Header
  - [ ] Title
  - [ ] Description
  - [ ] "Tạo khóa học mới" button
- [ ] Stats cards (4 cards)
  - [ ] Total courses
  - [ ] Total students
  - [ ] Revenue
  - [ ] Average rating
  - [ ] Growth indicators
- [ ] **Charts:**
  - [ ] Revenue chart (BarChart)
    - [ ] 6 months data
    - [ ] Bars render
    - [ ] X/Y axis
    - [ ] Tooltip on hover
  - [ ] Enrollment chart (LineChart)
    - [ ] Line renders
    - [ ] Data points
    - [ ] Grid background
- [ ] Course management table
  - [ ] Course list (3 courses)
  - [ ] Course info displayed
  - [ ] Status badges
  - [ ] Stats (students, rating, revenue)
  - [ ] Action buttons
    - [ ] View
    - [ ] Edit
    - [ ] Statistics
- [ ] Quick actions (3 cards)
  - [ ] Student Management
  - [ ] Revenue Reports
  - [ ] Instructor Certificates
  - [ ] Hover effects
- [ ] **Responsive:** 
  - [ ] Stats grid adjusts
  - [ ] Charts stack on mobile

---

#### **10. Course Creation (/instructor/courses/create)**
**URL:** http://localhost:3000/instructor/courses/create

**Test Cases:**
- [ ] Header
  - [ ] Back button → dashboard
  - [ ] Title
  - [ ] Description
- [ ] Progress bar
  - [ ] Shows current step
  - [ ] Updates on step change
- [ ] Step indicators (4 steps)
  - [ ] Icons display
  - [ ] Active step highlighted
  - [ ] Completed steps green
  - [ ] Step names
- [ ] **Step 1: Basic Info**
  - [ ] Course title field
  - [ ] Short description textarea
  - [ ] Full description textarea
  - [ ] Category dropdown
  - [ ] Level dropdown
  - [ ] Language dropdown
  - [ ] Price input
  - [ ] Validation messages
- [ ] **Step 2: Media**
  - [ ] Thumbnail upload zone
    - [ ] Click to upload
    - [ ] Drag & drop (UI)
    - [ ] File select
    - [ ] Image preview
    - [ ] Change image button
  - [ ] Video upload zone
    - [ ] Upload button
    - [ ] Instructions
- [ ] **Step 3: Curriculum**
  - [ ] Coming soon badge
  - [ ] Placeholder UI
- [ ] **Step 4: Settings**
  - [ ] Course overview summary
    - [ ] Title displayed
    - [ ] Level displayed
    - [ ] Price displayed
  - [ ] Publish options
    - [ ] Draft card
    - [ ] Publish card
    - [ ] Hover effects
- [ ] Navigation
  - [ ] Previous button
    - [ ] Disabled on step 1
    - [ ] Works on step 2-4
  - [ ] Next button
    - [ ] Works on step 1-3
  - [ ] Save button (step 4)
- [ ] **Responsive:** Form responsive

---

#### **11. Admin Dashboard (/admin)**
**URL:** http://localhost:3000/admin

**Test Cases:**
- [ ] Header
  - [ ] Title
  - [ ] Last updated badge
- [ ] Stats cards (4 cards)
  - [ ] Total courses
  - [ ] Total students
  - [ ] Total instructors
  - [ ] Revenue
  - [ ] Trend indicators (↑↓)
  - [ ] Percentage changes
- [ ] **Charts:**
  - [ ] Revenue & Enrollment (AreaChart)
    - [ ] Dual Y-axis
    - [ ] Two areas (revenue + enrollments)
    - [ ] Legend
    - [ ] Grid
    - [ ] Tooltip
  - [ ] Category Distribution (PieChart)
    - [ ] Pie segments
    - [ ] Labels với percentages
    - [ ] Colors
    - [ ] Tooltip
- [ ] **Tabs:**
  - [ ] Pending (với count)
  - [ ] Activity
  - [ ] Reports
- [ ] **Pending tab:**
  - [ ] Course list (3 courses)
  - [ ] Course info
  - [ ] Instructor name
  - [ ] Submission date
  - [ ] Status badge
  - [ ] Action buttons
    - [ ] View Details
    - [ ] Approve (green)
    - [ ] Reject
- [ ] **Activity tab:**
  - [ ] Activity feed (4 items)
  - [ ] Activity icons
  - [ ] Activity descriptions
  - [ ] Timestamps
  - [ ] Different activity types
- [ ] **Reports tab:**
  - [ ] Report cards (4 cards)
  - [ ] Report titles
  - [ ] Descriptions
  - [ ] Export buttons
  - [ ] Hover effects
- [ ] Quick actions (4 cards)
  - [ ] Course Management
  - [ ] Instructor Management
  - [ ] Student Management
  - [ ] Analytics
  - [ ] Links work
  - [ ] Icons display
  - [ ] Counts show
- [ ] **Responsive:**
  - [ ] Charts stack
  - [ ] Cards grid adjusts

---

### **Global Features**

#### **12. Chatbot Widget**
**Test on:** Any page

**Test Cases:**
- [ ] Floating button
  - [ ] Fixed bottom-right
  - [ ] Circle button
  - [ ] MessageCircle icon
  - [ ] Hover scale effect
  - [ ] Z-index on top
- [ ] Click button → Chat opens
- [ ] **Chat window:**
  - [ ] Card style
  - [ ] 96 width × 600 height
  - [ ] Shadow
  - [ ] Rounded corners
- [ ] **Header:**
  - [ ] Bot avatar
  - [ ] Online indicator (green dot)
  - [ ] Bot name
  - [ ] Status text
  - [ ] Minimize button
  - [ ] Close button
  - [ ] Primary background
- [ ] **Messages area:**
  - [ ] Initial bot message
  - [ ] Scrollable
  - [ ] Message bubbles
    - [ ] Bot: left, muted color
    - [ ] User: right, primary color
  - [ ] Avatars
  - [ ] Timestamps
- [ ] **Quick replies** (first message)
  - [ ] 4 suggestion buttons
  - [ ] Click → populate input
- [ ] **Typing indicator:**
  - [ ] 3 animated dots
  - [ ] Bounce animation
  - [ ] Shows after send
- [ ] **Input area:**
  - [ ] Message input
  - [ ] Send button
  - [ ] Enter key submits
  - [ ] Disabled khi empty
  - [ ] "Powered by Gemini" text
- [ ] **Functionality:**
  - [ ] Type message
  - [ ] Click send
  - [ ] Message appears (user)
  - [ ] Typing indicator shows
  - [ ] Bot response appears (mock)
  - [ ] Auto-scroll to bottom
- [ ] **Minimize:**
  - [ ] Click minimize button
  - [ ] Window collapses to header
  - [ ] Click maximize → expands
- [ ] **Close:**
  - [ ] Click close button
  - [ ] Window closes
  - [ ] Floating button appears
- [ ] **Responsive:**
  - [ ] Mobile: Full width (minus padding)
  - [ ] Desktop: 384px width

---

#### **13. Navigation & Layout**

**Dashboard Layout (All dashboard pages):**
- [ ] **Desktop Sidebar:**
  - [ ] Logo
  - [ ] Collapse button (chevron)
  - [ ] Navigation items
  - [ ] Active item highlighted
  - [ ] Icons + labels
  - [ ] Collapsed state (icons only)
  - [ ] User profile dropdown
    - [ ] Avatar
    - [ ] Name & role
    - [ ] Profile link
    - [ ] Settings link
    - [ ] Logout button
- [ ] **Mobile:**
  - [ ] Top bar
  - [ ] Hamburger menu
  - [ ] Logo
  - [ ] Notifications bell
  - [ ] Sliding sidebar
  - [ ] Overlay khi open
  - [ ] Close button

**Public Navbar (Homepage, Courses):**
- [ ] Logo → home
- [ ] Navigation links
  - [ ] Courses
  - [ ] About (placeholder)
  - [ ] Contact (placeholder)
- [ ] Search bar (Desktop)
- [ ] Auth buttons / User menu
- [ ] Responsive: Hamburger on mobile

**Footer:**
- [ ] 4 columns
- [ ] Newsletter form
- [ ] Quick links
- [ ] Social icons
- [ ] Copyright text
- [ ] Responsive: Stack on mobile

---

## 🎨 Visual & UX Testing

### **Design System:**
- [ ] **Colors:**
  - [ ] Primary (Indigo) used correctly
  - [ ] Secondary (Purple) for accents
  - [ ] Accent (Emerald) for success
  - [ ] Consistent throughout
- [ ] **Typography:**
  - [ ] Headings use Poppins
  - [ ] Body uses Inter
  - [ ] Font sizes consistent
  - [ ] Line heights readable
- [ ] **Spacing:**
  - [ ] Consistent padding/margin
  - [ ] Proper white space
  - [ ] Grid alignment
- [ ] **Shadows:**
  - [ ] Cards have subtle shadows
  - [ ] Hover elevations work
  - [ ] Drop shadows on modals

### **Animations:**
- [ ] Smooth transitions
- [ ] Hover effects
- [ ] Loading skeletons
- [ ] Page transitions
- [ ] Button states
- [ ] Modal open/close

### **Empty States:**
- [ ] No courses enrolled
- [ ] No search results
- [ ] No notifications
- [ ] Proper messages
- [ ] CTAs provided

### **Loading States:**
- [ ] Skeleton loaders
- [ ] Spinner on buttons
- [ ] Loading indicators
- [ ] Disabled states

---

## 📱 Responsive Testing

### **Breakpoints to test:**

**Mobile (375px, 414px):**
- [ ] All pages render
- [ ] Navigation works
- [ ] Forms usable
- [ ] Buttons accessible (44px min)
- [ ] Text readable
- [ ] Images scale

**Tablet (768px, 1024px):**
- [ ] Layout adapts
- [ ] Grids adjust (2-3 columns)
- [ ] Sidebar behavior
- [ ] Charts responsive

**Desktop (1280px, 1920px):**
- [ ] Full layouts
- [ ] Max-width containers
- [ ] Grid systems (4 columns)
- [ ] Sidebar expanded

---

## 🔍 Browser Testing

**Test trên browsers:**
- [ ] Chrome
- [ ] Firefox
- [ ] Safari
- [ ] Edge
- [ ] Mobile Chrome (Android)
- [ ] Mobile Safari (iOS)

---

## ⚡ Performance Checks

**Use Chrome DevTools:**
- [ ] Lighthouse score
  - [ ] Performance > 80
  - [ ] Accessibility > 90
  - [ ] Best Practices > 90
  - [ ] SEO > 80
- [ ] Network tab
  - [ ] Page load < 3s
  - [ ] No 404 errors
  - [ ] Images optimized
- [ ] Console
  - [ ] No errors
  - [ ] No warnings (critical)

---

## 🐛 Bug Reporting Template

Nếu tìm thấy bug:

```
**Bug:** [Mô tả ngắn gọn]

**Page:** [URL]

**Steps to reproduce:**
1. Go to...
2. Click on...
3. See error...

**Expected:** [Hành vi mong đợi]

**Actual:** [Hành vi thực tế]

**Screenshot:** [Nếu có]

**Browser:** [Chrome, Firefox, etc.]

**Device:** [Desktop, Mobile, etc.]
```

---

## ✅ Final Checklist

### **Phase 1 (MVP):**
- [ ] Homepage: 100%
- [ ] Courses Listing: 100%
- [ ] Course Detail: 100%
- [ ] Login: 100%
- [ ] Register: 100%
- [ ] Forgot Password: 100%
- [ ] Reset Password: 100%

### **Phase 2 (Core):**
- [ ] Learning Interface: 100%
- [ ] Student Dashboard: 100%
- [ ] My Courses: 100%
- [ ] Profile: 100%

### **Phase 3 (Advanced):**
- [ ] Instructor Dashboard: 100%
- [ ] Course Creation: 100%
- [ ] Admin Dashboard: 100%
- [ ] Chatbot Widget: 100%

### **Global:**
- [ ] Navigation: 100%
- [ ] Footer: 100%
- [ ] Responsive: 100%
- [ ] Animations: 100%

---

## 🎯 Testing Status

**Overall Progress:** ___/15 pages tested

**Issues Found:** ___

**Critical Bugs:** ___

**Minor Issues:** ___

---

## 📝 Notes

```
[Ghi chú test của bạn ở đây]

Ngày test: ___________
Người test: ___________
Browser: ___________
Device: ___________
```

---

**Happy Testing!** 🎉

Sau khi test xong, bạn sẽ biết:
1. Features nào work perfect
2. Features nào cần fix
3. Sẵn sàng cho Phase 4 chưa

Good luck! 🚀


# ⚡ QUICK TEST GUIDE

## 🚀 Khởi động nhanh

### **Start Frontend:**
```bash
cd frontend
npm run dev
```

Mở: http://localhost:3000

---

## ✅ Test nhanh 5 phút

### **1. Homepage** (30s)
- Mở http://localhost:3000
- ✅ Hero section + search bar
- ✅ Featured courses hiển thị
- ✅ Categories grid
- ✅ Scroll smooth

### **2. Courses** (30s)
- Click "Khám phá khóa học" HOẶC http://localhost:3000/courses
- ✅ Course grid (12 cards)
- ✅ Filters sidebar
- ✅ Search & sort
- ✅ Click một course

### **3. Course Detail** (30s)
- Đang ở course detail page
- ✅ Course info đầy đủ
- ✅ Tabs: Overview, Curriculum, Instructor, Reviews
- ✅ Click tab Curriculum → Accordion mở
- ✅ Enrollment card (desktop) hoặc bottom bar (mobile)

### **4. Authentication** (1 min)
- Mở http://localhost:3000/auth/login
- ✅ Login form
- ✅ Validation (enter invalid email)
- ✅ Click "Đăng ký" → Register page
- ✅ Register form với role selection
- ✅ Password strength indicator
- ✅ Click "Quên mật khẩu?" → Forgot password page

### **5. Student Dashboard** (1 min)
- Mở http://localhost:3000/student
- ✅ Dashboard layout với sidebar
- ✅ Stats cards (4 cards)
- ✅ Tabs: Continue Learning, All Courses, Activity
- ✅ Course cards với progress
- ✅ Click hamburger menu (mobile)
- ✅ Sidebar collapses (desktop)

### **6. Learning Interface** (30s)
- Mở http://localhost:3000/learn/1
- ✅ Video player hiển thị
- ✅ Curriculum sidebar
- ✅ Click lesson → content changes
- ✅ Previous/Next buttons
- ✅ Progress bar update

### **7. Instructor Dashboard** (1 min)
- Mở http://localhost:3000/instructor
- ✅ Stats cards
- ✅ Revenue chart (BarChart)
- ✅ Enrollment chart (LineChart)
- ✅ Course list với actions
- ✅ Click "Tạo khóa học mới"

### **8. Course Creation** (1 min)
- Đang ở course creation page
- ✅ 4-step wizard
- ✅ Progress bar
- ✅ Step 1: Fill form
- ✅ Click "Tiếp theo"
- ✅ Step 2: Upload thumbnail UI
- ✅ Navigate các steps
- ✅ Step 4: Review summary

### **9. Admin Dashboard** (30s)
- Mở http://localhost:3000/admin
- ✅ System stats
- ✅ Revenue/Enrollment chart (AreaChart)
- ✅ Category pie chart
- ✅ Tabs: Pending, Activity, Reports
- ✅ Pending courses list
- ✅ Action buttons

### **10. Chatbot** (30s)
- Ở bất kỳ trang nào
- ✅ Floating button (bottom-right)
- ✅ Click → Chat opens
- ✅ Welcome message
- ✅ Quick replies (4 buttons)
- ✅ Type message + send
- ✅ Typing indicator
- ✅ Bot response
- ✅ Minimize/Maximize
- ✅ Close

---

## 📱 Test Responsive (2 phút)

### **Chrome DevTools:**
1. F12 → Toggle device toolbar (Ctrl+Shift+M)
2. Test devices:
   - iPhone 12 Pro (390px)
   - iPad (768px)
   - Desktop (1280px)

### **Check:**
- ✅ Layout adapts
- ✅ Sidebar becomes hamburger (mobile)
- ✅ Grids stack correctly
- ✅ Text readable
- ✅ Buttons accessible

---

## 🎨 Visual Check (1 phút)

### **Mở các pages:**
- ✅ Colors consistent (Indigo primary)
- ✅ Fonts (Poppins headers, Inter body)
- ✅ Icons hiển thị (Lucide React)
- ✅ Shadows on cards
- ✅ Hover effects
- ✅ Animations smooth
- ✅ No layout shifts
- ✅ No broken images

---

## 🔍 Browser Console (30s)

### **F12 → Console:**
- ✅ No red errors
- ✅ No critical warnings
- ✅ Network requests work

---

## ⚡ Performance (1 phút)

### **Lighthouse (F12 → Lighthouse):**
1. Run audit (Desktop)
2. Check scores:
   - Performance: Should be > 70
   - Accessibility: Should be > 90
   - Best Practices: Should be > 90

---

## ✅ Pass Criteria

**Minimum để pass:**
- [ ] All pages load without errors
- [ ] Navigation works
- [ ] Forms có validation
- [ ] Charts render
- [ ] Chatbot functional
- [ ] Responsive (mobile, tablet, desktop)
- [ ] No console errors
- [ ] Smooth interactions

---

## 🐛 Common Issues & Fixes

### **Issue: Page not loading**
```bash
# Clear cache & restart
cd frontend
rm -rf .next
npm run dev
```

### **Issue: API errors in console**
✅ **Expected!** Mock data được dùng, API chưa connect.

### **Issue: Charts không hiển thị**
- Refresh page
- Check window size (charts responsive)

### **Issue: Sidebar không toggle**
- Check breakpoint (< 1024px for mobile)
- Try hamburger menu

---

## 🎯 Test Status

**Quick Test:** ⬜ Not Started | ⬜ In Progress | ⬜ Complete

**Date:** ___________

**Found Issues:**
```
1. 
2. 
3. 
```

**Overall Status:** ⬜ Pass | ⬜ Fail

---

## 📝 Next Steps

### **If PASS:**
✅ All features working  
✅ Ready for Phase 4 (API integration)  
✅ Can deploy for testing  

### **If FAIL:**
❌ Note issues  
❌ Report bugs  
❌ Fix và test lại  

---

**Test time:** ~10-15 minutes  
**Full test:** See `TESTING_GUIDE.md`

Good luck! 🚀


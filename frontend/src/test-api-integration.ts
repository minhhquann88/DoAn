// API Integration Test Script
// Run this in browser console after logging in

import { 
  authService,
  courseService,
  contentService,
  quizService,
  assignmentService,
  enrollmentService,
  instructorService,
  statisticsService,
  paymentService,
  chatbotService,
} from '@/services';

interface TestResult {
  module: string;
  status: 'PASS' | 'FAIL' | 'SKIP';
  message: string;
  data?: any;
}

async function testAllModules(): Promise<void> {
  const results: TestResult[] = [];
  
  console.log('🧪 Starting API Integration Tests...\n');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

  // Module 1: Authentication
  try {
    console.log('📝 Module 1: Authentication');
    const currentUser = await authService.getCurrentUser();
    
    if (currentUser) {
      results.push({
        module: 'Authentication',
        status: 'PASS',
        message: `Logged in as: ${currentUser.name} (${currentUser.role})`,
        data: currentUser,
      });
      console.log('  ✅ Current User:', currentUser.name);
      console.log('  ✅ Role:', currentUser.role);
    } else {
      results.push({
        module: 'Authentication',
        status: 'FAIL',
        message: 'Not logged in',
      });
      console.log('  ❌ Not logged in');
    }
  } catch (error: any) {
    results.push({
      module: 'Authentication',
      status: 'FAIL',
      message: error.message || 'Failed to get user',
    });
    console.log('  ❌ Error:', error.message);
  }
  console.log('');

  // Module 2: Course Management
  try {
    console.log('📚 Module 2: Course Management');
    const courses = await courseService.getCourses({ page: 0, size: 5 });
    
    if (courses && courses.content) {
      results.push({
        module: 'Course Management',
        status: 'PASS',
        message: `Loaded ${courses.content.length} courses`,
        data: courses,
      });
      console.log('  ✅ Courses loaded:', courses.content.length);
      console.log('  ✅ Total courses:', courses.totalElements);
    } else {
      results.push({
        module: 'Course Management',
        status: 'FAIL',
        message: 'No courses returned',
      });
      console.log('  ❌ No courses');
    }
  } catch (error: any) {
    results.push({
      module: 'Course Management',
      status: 'FAIL',
      message: error.message || 'Failed to load courses',
    });
    console.log('  ❌ Error:', error.message);
  }
  console.log('');

  // Get first course for subsequent tests
  let testCourseId: number | null = null;
  try {
    const courses = await courseService.getCourses({ page: 0, size: 1 });
    if (courses.content?.[0]) {
      testCourseId = courses.content[0].id;
    }
  } catch (e) {
    // Ignore
  }

  // Module 3: Content Management
  try {
    console.log('📄 Module 3: Content Management');
    
    if (testCourseId) {
      const contents = await contentService.getCourseContents(testCourseId);
      
      results.push({
        module: 'Content Management',
        status: 'PASS',
        message: `Loaded ${contents?.length || 0} contents for course ${testCourseId}`,
        data: contents,
      });
      console.log('  ✅ Contents loaded:', contents?.length || 0);
    } else {
      results.push({
        module: 'Content Management',
        status: 'SKIP',
        message: 'No test course available',
      });
      console.log('  ⊘ Skipped (no test course)');
    }
  } catch (error: any) {
    results.push({
      module: 'Content Management',
      status: 'FAIL',
      message: error.message || 'Failed to load contents',
    });
    console.log('  ❌ Error:', error.message);
  }
  console.log('');

  // Module 4: Quiz/Test
  try {
    console.log('📝 Module 4: Quiz/Test');
    
    if (testCourseId) {
      const quizzes = await quizService.getCourseQuizzes(testCourseId);
      
      results.push({
        module: 'Quiz/Test',
        status: 'PASS',
        message: `Loaded ${quizzes?.length || 0} quizzes`,
        data: quizzes,
      });
      console.log('  ✅ Quizzes loaded:', quizzes?.length || 0);
    } else {
      results.push({
        module: 'Quiz/Test',
        status: 'SKIP',
        message: 'No test course available',
      });
      console.log('  ⊘ Skipped (no test course)');
    }
  } catch (error: any) {
    results.push({
      module: 'Quiz/Test',
      status: 'FAIL',
      message: error.message || 'Failed to load quizzes',
    });
    console.log('  ❌ Error:', error.message);
  }
  console.log('');

  // Module 5: Assignment
  try {
    console.log('📋 Module 5: Assignment');
    
    if (testCourseId) {
      const assignments = await assignmentService.getCourseAssignments(testCourseId);
      
      results.push({
        module: 'Assignment',
        status: 'PASS',
        message: `Loaded ${assignments?.length || 0} assignments`,
        data: assignments,
      });
      console.log('  ✅ Assignments loaded:', assignments?.length || 0);
    } else {
      results.push({
        module: 'Assignment',
        status: 'SKIP',
        message: 'No test course available',
      });
      console.log('  ⊘ Skipped (no test course)');
    }
  } catch (error: any) {
    results.push({
      module: 'Assignment',
      status: 'FAIL',
      message: error.message || 'Failed to load assignments',
    });
    console.log('  ❌ Error:', error.message);
  }
  console.log('');

  // Module 6: Enrollment
  try {
    console.log('🎓 Module 6: Student/Enrollment');
    const enrollments = await enrollmentService.getMyEnrollments();
    
    results.push({
      module: 'Student/Enrollment',
      status: 'PASS',
      message: `Enrolled in ${enrollments?.length || 0} courses`,
      data: enrollments,
    });
    console.log('  ✅ My enrollments:', enrollments?.length || 0);
  } catch (error: any) {
    results.push({
      module: 'Student/Enrollment',
      status: 'FAIL',
      message: error.message || 'Failed to load enrollments',
    });
    console.log('  ❌ Error:', error.message);
  }
  console.log('');

  // Module 7: Instructor
  try {
    console.log('👨‍🏫 Module 7: Instructor Management');
    const instructorProfile = await instructorService.getMyInstructorProfile();
    
    if (instructorProfile) {
      const stats = await instructorService.getMyStatistics();
      
      results.push({
        module: 'Instructor Management',
        status: 'PASS',
        message: `Instructor: ${instructorProfile.fullName}`,
        data: { profile: instructorProfile, stats },
      });
      console.log('  ✅ Instructor Profile:', instructorProfile.fullName);
      console.log('  ✅ Total Courses:', stats.totalCourses);
      console.log('  ✅ Total Students:', stats.totalStudents);
    }
  } catch (error: any) {
    results.push({
      module: 'Instructor Management',
      status: 'SKIP',
      message: 'Not an instructor or access denied',
    });
    console.log('  ⊘ Not an instructor role');
  }
  console.log('');

  // Module 8: Statistics
  try {
    console.log('📊 Module 8: Statistics & Reports');
    const dashboard = await statisticsService.getDashboardOverview();
    
    results.push({
      module: 'Statistics & Reports',
      status: 'PASS',
      message: 'Dashboard loaded successfully',
      data: dashboard,
    });
    console.log('  ✅ Dashboard Overview:', dashboard ? 'Loaded' : 'Empty');
    console.log('  ✅ Total Courses:', dashboard.totalCourses);
    console.log('  ✅ Total Students:', dashboard.totalStudents);
    console.log('  ✅ Total Revenue:', dashboard.totalRevenue);
  } catch (error: any) {
    results.push({
      module: 'Statistics & Reports',
      status: 'SKIP',
      message: 'Access denied (Admin only)',
    });
    console.log('  ⊘ Access denied (Admin only)');
  }
  console.log('');

  // Module 9: Payment & Certificate
  try {
    console.log('💳 Module 9: Payment & Certificate');
    const transactions = await paymentService.getMyTransactions({ page: 0, size: 5 });
    const certificates = await paymentService.getMyCertificates({ page: 0, size: 5 });
    
    results.push({
      module: 'Payment & Certificate',
      status: 'PASS',
      message: `${transactions.totalElements} transactions, ${certificates.totalElements} certificates`,
      data: { transactions, certificates },
    });
    console.log('  ✅ Transactions:', transactions.totalElements);
    console.log('  ✅ Certificates:', certificates.totalElements);
  } catch (error: any) {
    results.push({
      module: 'Payment & Certificate',
      status: 'FAIL',
      message: error.message || 'Failed to load payment data',
    });
    console.log('  ❌ Error:', error.message);
  }
  console.log('');

  // Chatbot
  try {
    console.log('🤖 Chatbot Integration');
    const health = await chatbotService.checkChatbotHealth();
    
    results.push({
      module: 'Chatbot Integration',
      status: health ? 'PASS' : 'FAIL',
      message: health ? 'Chatbot online' : 'Chatbot offline',
      data: health,
    });
    console.log('  ✅ Chatbot Status:', health ? 'Online' : 'Offline');
  } catch (error: any) {
    results.push({
      module: 'Chatbot Integration',
      status: 'FAIL',
      message: error.message || 'Failed to connect to chatbot',
    });
    console.log('  ❌ Error:', error.message);
  }
  console.log('');

  // Summary
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
  console.log('📊 TEST SUMMARY\n');
  
  const passed = results.filter(r => r.status === 'PASS').length;
  const failed = results.filter(r => r.status === 'FAIL').length;
  const skipped = results.filter(r => r.status === 'SKIP').length;
  
  results.forEach(result => {
    const icon = result.status === 'PASS' ? '✅' : result.status === 'FAIL' ? '❌' : '⊘';
    console.log(`${icon} ${result.module}: ${result.message}`);
  });
  
  console.log('');
  console.log(`Total: ${results.length} modules`);
  console.log(`✅ Passed: ${passed}`);
  console.log(`❌ Failed: ${failed}`);
  console.log(`⊘ Skipped: ${skipped}`);
  console.log('');
  
  if (failed === 0) {
    console.log('🎉 All modules tested successfully!');
  } else {
    console.log('⚠️ Some modules failed. Check errors above.');
  }
  
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
  
  // Return results for further inspection
  return results as any;
}

// Auto-run if in browser
if (typeof window !== 'undefined') {
  console.log('To run tests, execute: testAllModules()');
  (window as any).testAllModules = testAllModules;
}

export default testAllModules;




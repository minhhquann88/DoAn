package com.coursemgmt.service;

import com.coursemgmt.dto.test.*;
import com.coursemgmt.model.*;
import com.coursemgmt.repository.*;
import com.coursemgmt.security.services.UserDetailsImpl;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
public class TestService {

    @Autowired private TestRepository testRepository;
    @Autowired private TestQuestionRepository testQuestionRepository;
    @Autowired private TestAnswerOptionRepository testAnswerOptionRepository;
    @Autowired private TestResultRepository testResultRepository;
    @Autowired private TestResultAnswerRepository testResultAnswerRepository;
    @Autowired private LessonRepository lessonRepository;
    @Autowired private UserRepository userRepository;
    @Autowired private EnrollmentRepository enrollmentRepository; // Cần cho thống kê

    // 1. Giảng viên tạo bài Test
    @Transactional
    public Test createTest(Long lessonId, TestRequest request) {
        Lesson lesson = lessonRepository.findById(lessonId)
                .orElseThrow(() -> new RuntimeException("Lesson not found!"));

        Test test = new Test();
        test.setTitle(request.getTitle());
        test.setType(request.getType());
        test.setLesson(lesson);
        // Thiết lập thời gian
        test.setOpenTime(request.getOpenTime());
        test.setCloseTime(request.getCloseTime());
        test.setTimeLimitInMinutes(request.getTimeLimitInMinutes());

        Test savedTest = testRepository.save(test);

        // Tạo Câu hỏi và Lựa chọn
        for (QuestionRequest qRequest : request.getQuestions()) {
            Test_Question question = new Test_Question();
            question.setQuestionText(qRequest.getQuestionText());
            question.setQuestionType(qRequest.getQuestionType());
            question.setTest(savedTest);
            Test_Question savedQuestion = testQuestionRepository.save(question);

            if (qRequest.getOptions() != null && !qRequest.getOptions().isEmpty()) {
                for (AnswerOptionRequest oRequest : qRequest.getOptions()) {
                    Test_AnswerOption option = new Test_AnswerOption();
                    option.setOptionText(oRequest.getOptionText());
                    option.setIsCorrect(oRequest.getIsCorrect());
                    option.setQuestion(savedQuestion);
                    testAnswerOptionRepository.save(option);
                }
            }
        }
        return savedTest;
    }

    // 2. Học viên lấy thông tin Test (để bắt đầu làm)
    public Test getTestForStudent(Long testId) {
        Test test = testRepository.findById(testId)
                .orElseThrow(() -> new RuntimeException("Test not found!"));

        // Kiểm tra thời gian mở/đóng
        if (test.getOpenTime() != null && LocalDateTime.now().isBefore(test.getOpenTime())) {
            throw new RuntimeException("Bài kiểm tra chưa mở.");
        }
        if (test.getCloseTime() != null && LocalDateTime.now().isAfter(test.getCloseTime())) {
            throw new RuntimeException("Bài kiểm tra đã đóng.");
        }

        // Quan trọng: Không trả về đáp án đúng (isCorrect) cho học viên
        // (Chúng ta sẽ làm việc này trong DTO response sau, tạm thời trả cả Test)
        return test;
    }

    // 3. Học viên Nộp bài và Tự động chấm điểm
    @Transactional
    public Test_Result submitTest(Long testId, TestSubmissionRequest submissionRequest, UserDetailsImpl userDetails) {
        User user = userRepository.findById(userDetails.getId()).orElseThrow(() -> new RuntimeException("User not found!"));
        Test test = testRepository.findById(testId).orElseThrow(() -> new RuntimeException("Test not found!"));

        // Kiểm tra xem nộp bài lại không?
        if (testResultRepository.findByUserAndTest(user, test).isPresent()) {
            throw new RuntimeException("Bạn đã nộp bài kiểm tra này rồi.");
        }

        Test_Result result = new Test_Result();
        result.setUser(user);
        result.setTest(test);
        result.setSubmittedAt(LocalDateTime.now());

        List<Test_Result_Answer> resultAnswers = new ArrayList<>();
        double totalScore = 0.0;
        int questionCount = test.getQuestions().size();
        double scorePerQuestion = (double) 10 / questionCount; // Giả sử thang điểm 10

        boolean needsManualGrading = false; // Cần giảng viên chấm không?

        for (StudentAnswerRequest ansRequest : submissionRequest.getAnswers()) {
            Test_Question question = testQuestionRepository.findById(ansRequest.getQuestionId())
                    .orElseThrow(() -> new RuntimeException("Câu hỏi không tồn tại: " + ansRequest.getQuestionId()));

            Test_Result_Answer resultAnswer = new Test_Result_Answer();
            resultAnswer.setTestResult(result);
            resultAnswer.setQuestion(question);

            if (question.getQuestionType() == EQuestionType.ESSAY) {
                // Câu tự luận
                resultAnswer.setEssayAnswer(ansRequest.getEssayAnswer());
                needsManualGrading = true;
            } else {
                // Câu trắc nghiệm
                Test_AnswerOption chosenOption = testAnswerOptionRepository.findById(ansRequest.getChosenOptionId())
                        .orElse(null);
                resultAnswer.setChosenOption(chosenOption);

                // Tự động chấm điểm
                if (chosenOption != null && chosenOption.getIsCorrect()) {
                    totalScore += scorePerQuestion;
                }
            }
            resultAnswers.add(resultAnswer);
        }

        result.setScore(totalScore);
        if (needsManualGrading) {
            result.setStatus(ESubmissionStatus.PENDING_GRADING); // Chờ chấm
        } else {
            result.setStatus(ESubmissionStatus.GRADED); // Đã chấm xong
        }

        // Lưu kết quả chính
        Test_Result savedResult = testResultRepository.save(result);

        // Lưu các câu trả lời chi tiết
        for (Test_Result_Answer ra : resultAnswers) {
            ra.setTestResult(savedResult); // Gán ID của Result đã lưu
        }
        testResultAnswerRepository.saveAll(resultAnswers);

        return savedResult;
    }

    // 4. Giảng viên chấm bài tự luận
    @Transactional
    public Test_Result gradeEssay(ManualGradeRequest gradeRequest, double scoreForThisQuestion) {

        Test_Result_Answer resultAnswer = testResultAnswerRepository.findById(gradeRequest.getTestResultAnswerId())
                .orElseThrow(() -> new RuntimeException("Câu trả lời không tìm thấy!"));

        // Cập nhật điểm tổng
        Test_Result mainResult = resultAnswer.getTestResult();
        mainResult.setScore(mainResult.getScore() + scoreForThisQuestion);

        // Gán nhận xét (feedback) vào BÀI NỘP CHUNG (mainResult)
        // Giảng viên chấm, nhận xét
        mainResult.setFeedback(gradeRequest.getFeedback());

        // (Logic kiểm tra xem đã chấm hết các câu tự luận chưa)
        // ... (Bạn sẽ cần thêm logic này) ...

        // Nếu đã chấm xong hết, đổi status
        mainResult.setStatus(ESubmissionStatus.GRADED);

        return testResultRepository.save(mainResult);
        // (Chúng ta không cần save 'resultAnswer' nữa vì không sửa nó)
    }

    // 5. Học viên xem kết quả
    public Test_Result getStudentResult(Long testId, UserDetailsImpl userDetails) {
        User user = userRepository.findById(userDetails.getId()).orElseThrow(() -> new RuntimeException("User not found!"));
        Test test = testRepository.findById(testId).orElseThrow(() -> new RuntimeException("Test not found!"));

        Test_Result result = testResultRepository.findByUserAndTest(user, test)
                .orElseThrow(() -> new RuntimeException("Bạn chưa làm bài kiểm tra này."));

        if(result.getStatus() == ESubmissionStatus.PENDING_GRADING) {
            throw new RuntimeException("Bài của bạn đang chờ giảng viên chấm điểm.");
        }

        return result;
    }

    // 6. Giảng viên xem tất cả bài nộp của 1 Test
    public List<Test_Result> getAllSubmissionsForTest(Long testId) {
        return testResultRepository.findByTestId(testId);
    }

    // 7. Thống kê
    public TestStatisticsResponse getTestStatistics(Long testId) {
        Test test = testRepository.findById(testId).orElseThrow(() -> new RuntimeException("Test not found!"));
        Course course = test.getLesson().getChapter().getCourse();

        Double avgScore = testResultRepository.getAverageScoreByTestId(testId);
        Long totalSubmissions = testResultRepository.countByTestId(testId);
        Long totalEnrollments = enrollmentRepository.countByCourseId(course.getId());

        Double completionRate = (totalEnrollments == 0) ? 0.0 : ((double) totalSubmissions / totalEnrollments) * 100.0;

        return new TestStatisticsResponse(testId, avgScore, totalSubmissions, completionRate);
    }
    // 8. Giảng viên xem chi tiết bài Test (bao gồm đáp án)
    public Test getTestDetailsForManagement(Long testId) {
        // Hàm này đơn giản là lấy Test và trả về
        // Vì đây là Giảng viên, họ CÓ QUYỀN xem đáp án đúng (isCorrect)
        Test test = testRepository.findById(testId)
                .orElseThrow(() -> new RuntimeException("Test not found!"));
        return test;
    }
}
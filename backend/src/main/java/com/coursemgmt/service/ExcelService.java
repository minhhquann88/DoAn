package com.coursemgmt.service;

import com.coursemgmt.dto.RevenueStatsDTO;
import com.coursemgmt.model.*;
import com.coursemgmt.repository.ChapterRepository;
import com.coursemgmt.repository.CourseRepository;
import com.coursemgmt.repository.LessonRepository;
import org.apache.poi.ss.usermodel.*;
import org.apache.poi.xssf.usermodel.XSSFWorkbook;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.io.ByteArrayInputStream;
import java.io.ByteArrayOutputStream;
import java.io.IOException;
import java.io.InputStream;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.ArrayList;
import java.util.Iterator;
import java.util.List;

@Service
public class ExcelService {

    @Autowired
    private CourseRepository courseRepository;
    @Autowired
    private ChapterRepository chapterRepository;
    @Autowired
    private LessonRepository lessonRepository;
    @Autowired
    private StatisticsService statisticsService;

    /**
     * Chức năng EXPORT: Xuất dữ liệu Lessons ra file Excel
     */
    public ByteArrayInputStream exportLessons(Long courseId) throws IOException {
        Course course = courseRepository.findById(courseId)
                .orElseThrow(() -> new RuntimeException("Course not found!"));

        try (XSSFWorkbook workbook = new XSSFWorkbook();
             ByteArrayOutputStream out = new ByteArrayOutputStream();) {

            Sheet sheet = workbook.createSheet("Nội dung khóa học");

            // Tạo Header Row
            Row headerRow = sheet.createRow(0);
            CellStyle headerStyle = workbook.createCellStyle();
            Font font = workbook.createFont();
            font.setBold(true);
            headerStyle.setFont(font);

            String[] headers = {"Chapter (Tên chương)", "Lesson (Tên bài)", "Vị trí (Thứ tự)",
                    "Loại (VIDEO/TEXT...)", "Thời lượng (phút)", "Video URL", "Nội dung (Text)"};
            for (int i = 0; i < headers.length; i++) {
                Cell cell = headerRow.createCell(i);
                cell.setCellValue(headers[i]);
                cell.setCellStyle(headerStyle);
            }

            // Đổ dữ liệu
            int rowIdx = 1;
            List<Chapter> chapters = chapterRepository.findByCourseIdOrderByPositionAsc(courseId);

            for (Chapter chapter : chapters) {
                for (Lesson lesson : chapter.getLessons()) {
                    Row row = sheet.createRow(rowIdx++);
                    row.createCell(0).setCellValue(chapter.getTitle());
                    row.createCell(1).setCellValue(lesson.getTitle());
                    row.createCell(2).setCellValue(lesson.getPosition());
                    row.createCell(3).setCellValue(lesson.getContentType().name());
                    row.createCell(4).setCellValue(lesson.getDurationInMinutes());
                    row.createCell(5).setCellValue(lesson.getVideoUrl());
                    row.createCell(6).setCellValue(lesson.getContent());
                }
            }

            workbook.write(out);
            return new ByteArrayInputStream(out.toByteArray());
        }
    }

    /**
     * Chức năng IMPORT: Đọc file Excel và tạo Lessons
     */
    @Transactional
    public void importLessons(Long courseId, MultipartFile file) throws IOException {
        Course course = courseRepository.findById(courseId)
                .orElseThrow(() -> new RuntimeException("Course not found!"));

        List<Lesson> lessonsToSave = new ArrayList<>();
        Chapter currentChapter = null;

        try (InputStream is = file.getInputStream();
             XSSFWorkbook workbook = new XSSFWorkbook(is)) {

            Sheet sheet = workbook.getSheetAt(0);
            Iterator<Row> rows = sheet.iterator();

            // Bỏ qua hàng header (hàng đầu tiên)
            if (rows.hasNext()) {
                rows.next();
            }

            while (rows.hasNext()) {
                Row currentRow = rows.next();

                // Đọc dữ liệu từ các ô
                String chapterTitle = getCellStringValue(currentRow.getCell(0));
                String lessonTitle = getCellStringValue(currentRow.getCell(1));

                // Nếu không có tên bài học, bỏ qua dòng
                if (lessonTitle == null || lessonTitle.isEmpty()) {
                    continue;
                }

                // Xử lý Chapter: Nếu chapter mới, tạo chapter. Nếu không, dùng chapter cũ.
                if (chapterTitle != null && !chapterTitle.isEmpty() &&
                        (currentChapter == null || !currentChapter.getTitle().equals(chapterTitle))) {

                    // Tìm xem chapter này đã có trong CSDL chưa (theo tên và courseId)
                    // (Đây là logic đơn giản, có thể tối ưu)
                    currentChapter = chapterRepository.findByCourseIdOrderByPositionAsc(courseId).stream()
                            .filter(c -> c.getTitle().equals(chapterTitle))
                            .findFirst()
                            .orElseGet(() -> {
                                // Nếu chưa có, tạo chapter mới
                                Chapter newChapter = new Chapter();
                                newChapter.setTitle(chapterTitle);
                                newChapter.setCourse(course);
                                newChapter.setPosition((int) (chapterRepository.count() + 1)); // Vị trí tạm
                                return chapterRepository.save(newChapter);
                            });
                }

                if (currentChapter == null) {
                    // Nếu không xác định được chapter, không thể tạo lesson
                    throw new RuntimeException("Lỗi file Excel: Lesson '" + lessonTitle + "' không có chapter.");
                }

                // Tạo Lesson
                Lesson lesson = new Lesson();
                lesson.setChapter(currentChapter);
                lesson.setTitle(lessonTitle);
                lesson.setPosition((int) getCellNumericValue(currentRow.getCell(2)));
                lesson.setContentType(EContentType.valueOf(getCellStringValue(currentRow.getCell(3))));
                lesson.setDurationInMinutes((int) getCellNumericValue(currentRow.getCell(4)));
                lesson.setVideoUrl(getCellStringValue(currentRow.getCell(5)));
                lesson.setContent(getCellStringValue(currentRow.getCell(6)));

                lessonsToSave.add(lesson);
            }

            lessonRepository.saveAll(lessonsToSave);
        }
    }

    // --- Hàm tiện ích đọc Cell ---
    private String getCellStringValue(Cell cell) {
        if (cell == null) return null;
        if (cell.getCellType() == CellType.STRING) {
            return cell.getStringCellValue();
        } else if (cell.getCellType() == CellType.NUMERIC) {
            return String.valueOf((int) cell.getNumericCellValue());
        }
        return null;
    }

    private double getCellNumericValue(Cell cell) {
        if (cell == null) return 0;
        if (cell.getCellType() == CellType.NUMERIC) {
            return cell.getNumericCellValue();
        }
        return 0;
    }

    /**
     * Chức năng EXPORT: Xuất báo cáo doanh thu ra file Excel
     */
    public ByteArrayInputStream exportRevenueReport(LocalDateTime startDate, LocalDateTime endDate) throws IOException {
        RevenueStatsDTO report = statisticsService.getRevenueReport(startDate, endDate);

        try (XSSFWorkbook workbook = new XSSFWorkbook();
             ByteArrayOutputStream out = new ByteArrayOutputStream()) {

            // Sheet 1: Overview
            Sheet overviewSheet = workbook.createSheet("Tong quan doanh thu");
            Row headerRow = overviewSheet.createRow(0);
            headerRow.createCell(0).setCellValue("Chi tieu");
            headerRow.createCell(1).setCellValue("Gia tri");
            
            Row totalRow = overviewSheet.createRow(1);
            totalRow.createCell(0).setCellValue("Tong doanh thu");
            totalRow.createCell(1).setCellValue(report.getTotalRevenue());
            
            Row countRow = overviewSheet.createRow(2);
            countRow.createCell(0).setCellValue("Tong so giao dich");
            countRow.createCell(1).setCellValue(report.getTotalTransactions());

            // Sheet 2: Top Selling Courses
            if (report.getTopSellingCourses() != null && !report.getTopSellingCourses().isEmpty()) {
                Sheet topCoursesSheet = workbook.createSheet("Top khoa hoc ban chay");
                Row topHeaderRow = topCoursesSheet.createRow(0);
                topHeaderRow.createCell(0).setCellValue("Ten khoa hoc");
                topHeaderRow.createCell(1).setCellValue("So luong ban");
                topHeaderRow.createCell(2).setCellValue("Doanh thu");
                
                int rowIdx = 1;
                for (var course : report.getTopSellingCourses()) {
                    Row row = topCoursesSheet.createRow(rowIdx++);
                    row.createCell(0).setCellValue(course.getCourseTitle());
                    row.createCell(1).setCellValue(course.getTotalSales());
                    row.createCell(2).setCellValue(course.getRevenue());
                }
            }

            workbook.write(out);
            return new ByteArrayInputStream(out.toByteArray());
        }
    }
}
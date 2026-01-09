package com.coursemgmt.service;

import com.coursemgmt.dto.RevenueStatsDTO;
import com.coursemgmt.model.*;
import org.apache.poi.ss.usermodel.*;
import org.apache.poi.xssf.usermodel.XSSFWorkbook;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.io.ByteArrayInputStream;
import java.io.ByteArrayOutputStream;
import java.io.IOException;
import java.time.LocalDateTime;
import java.util.List;

@Service
public class ExcelService {

    @Autowired
    private StatisticsService statisticsService;

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
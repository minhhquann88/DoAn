//(Output) Dùng cho Thống kê.
package com.coursemgmt.dto.test;

import lombok.AllArgsConstructor;
import lombok.Data;

@Data
@AllArgsConstructor
public class TestStatisticsResponse {
    private Long testId;
    private Double averageScore; // Điểm trung bình
    private Long totalSubmissions; // Tổng số lượt nộp
    private Double completionRate; // Tỷ lệ hoàn thành (ví dụ: % số người đã học và nộp bài)
}
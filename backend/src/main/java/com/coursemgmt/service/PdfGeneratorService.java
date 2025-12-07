package com.coursemgmt.service;

import com.coursemgmt.model.Certificate;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import java.io.File;
import java.io.FileOutputStream;
import java.time.format.DateTimeFormatter;

/**
 * Service để generate PDF certificate
 * Có thể dùng thư viện: iText, Apache PDFBox, hoặc Flying Saucer
 */
@Service
public class PdfGeneratorService {

    @Value("${certificate.storage.path:./certificates}")
    private String storagePath;
    
    @Value("${certificate.base-url:http://localhost:8080/certificates}")
    private String baseUrl;

    /**
     * Generate PDF certificate
     * 
     * Note: Đây là implementation đơn giản
     * Trong production, nên dùng thư viện như iText hoặc template engine
     */
    public String generateCertificatePdf(Certificate certificate) throws Exception {
        // Ensure storage directory exists
        File directory = new File(storagePath);
        if (!directory.exists()) {
            directory.mkdirs();
        }
        
        String filename = "certificate_" + certificate.getCertificateCode() + ".pdf";
        String filepath = storagePath + "/" + filename;
        
        // TODO: Implement actual PDF generation
        // Có thể dùng:
        // 1. iText library
        // 2. Apache PDFBox
        // 3. Flying Saucer (HTML to PDF)
        // 4. Template engine (Thymeleaf + Flying Saucer)
        
        // Placeholder: Create empty file
        try (FileOutputStream fos = new FileOutputStream(filepath)) {
            String content = generateCertificateHtmlContent(certificate);
            fos.write(content.getBytes());
        }
        
        return baseUrl + "/" + filename;
    }

    /**
     * Generate HTML content for certificate
     * Có thể convert sang PDF bằng Flying Saucer
     */
    private String generateCertificateHtmlContent(Certificate certificate) {
        DateTimeFormatter formatter = DateTimeFormatter.ofPattern("dd/MM/yyyy");
        
        String userName = certificate.getEnrollment().getUser().getFullName();
        String courseTitle = certificate.getEnrollment().getCourse().getTitle();
        String instructorName = certificate.getEnrollment()
                .getCourse().getInstructor().getFullName();
        String issuedDate = certificate.getIssuedAt().format(formatter);
        String certificateCode = certificate.getCertificateCode();
        
        return """
<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <style>
        @page {
            size: A4 landscape;
            margin: 0;
        }
        body {
            font-family: Arial, sans-serif;
            margin: 0;
            padding: 40px;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
        }
        .certificate {
            background: white;
            padding: 60px;
            border: 10px solid #667eea;
            text-align: center;
            min-height: 500px;
        }
        h1 {
            font-size: 48px;
            color: #667eea;
            margin-bottom: 20px;
        }
        h2 {
            font-size: 24px;
            color: #333;
            margin-bottom: 40px;
        }
        .recipient {
            font-size: 36px;
            color: #764ba2;
            margin: 30px 0;
            font-weight: bold;
        }
        .course {
            font-size: 28px;
            color: #333;
            margin: 20px 0;
        }
        .instructor {
            font-size: 18px;
            color: #666;
            margin-top: 40px;
        }
        .date {
            font-size: 16px;
            color: #999;
            margin-top: 20px;
        }
        .code {
            font-size: 14px;
            color: #999;
            margin-top: 30px;
            font-family: monospace;
        }
    </style>
</head>
<body>
    <div class="certificate">
        <h1>CHỨNG CHỈ HOÀN THÀNH</h1>
        <h2>Certificate of Completion</h2>
        
        <p>Chứng nhận rằng / This is to certify that</p>
        
        <div class="recipient">%s</div>
        
        <p>đã hoàn thành xuất sắc khóa học<br>has successfully completed the course</p>
        
        <div class="course">%s</div>
        
        <div class="instructor">
            Giảng viên / Instructor: %s
        </div>
        
        <div class="date">
            Ngày cấp / Issue Date: %s
        </div>
        
        <div class="code">
            Mã chứng chỉ / Certificate Code: %s
        </div>
    </div>
</body>
</html>
                """.formatted(userName, courseTitle, instructorName, issuedDate, certificateCode);
    }
}


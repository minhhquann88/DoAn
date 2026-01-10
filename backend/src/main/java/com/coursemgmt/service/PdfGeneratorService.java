package com.coursemgmt.service;

import com.coursemgmt.model.Certificate;
import com.openhtmltopdf.pdfboxout.PdfRendererBuilder;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.core.io.ClassPathResource;
import org.springframework.core.io.Resource;
import org.springframework.stereotype.Service;

import java.io.ByteArrayOutputStream;
import java.io.File;
import java.io.FileOutputStream;
import java.io.IOException;
import java.io.InputStream;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.StandardCopyOption;
import java.time.format.DateTimeFormatter;

/**
 * Service để tạo file PDF chứng chỉ
 * Sử dụng OpenHTMLToPDF để chuyển đổi HTML sang PDF
 */
@Service
public class PdfGeneratorService {

    @Value("${certificate.storage.path:./certificates}")
    private String storagePath;
    
    @Value("${certificate.base-url:http://localhost:8080/certificates}")
    private String baseUrl;

    // Tạo file PDF chứng chỉ từ thông tin certificate và trả về dạng byte array
    public byte[] generateCertificatePdf(Certificate certificate) throws IOException {
        String htmlContent = generateCertificateHtmlContent(certificate);
        return convertHtmlToPdf(htmlContent);
    }

    // Chuyển đổi nội dung HTML sang PDF dạng byte array
    private byte[] convertHtmlToPdf(String htmlContent) throws IOException {
        try (ByteArrayOutputStream outputStream = new ByteArrayOutputStream()) {
            PdfRendererBuilder builder = new PdfRendererBuilder();
            
            // Load font hỗ trợ tiếng Việt từ hệ thống hoặc classpath
            loadVietnameseFont(builder);
            
            // Set UTF-8 encoding explicitly
            // OpenHTMLToPDF will automatically handle UTF-8 if HTML has proper charset declaration
            builder.withHtmlContent(htmlContent, null);
            
            builder.toStream(outputStream);
            builder.run();
            
            return outputStream.toByteArray();
        }
    }
    
    // Tải font hỗ trợ tiếng Việt cho OpenHTMLToPDF
    // Ưu tiên: Noto Sans > Arial Unicode MS > DejaVu Sans > Arial > Times New Roman
    private void loadVietnameseFont(PdfRendererBuilder builder) throws IOException {
        // Danh sách các font có thể hỗ trợ tiếng Việt
        String[] fontPaths = {
            // Windows fonts (thử cả chữ hoa và chữ thường)
            "C:/Windows/Fonts/NotoSans-Regular.ttf",
            "C:/Windows/Fonts/NOTOSANS-REGULAR.TTF",
            "C:/Windows/Fonts/NotoSansCJK-Regular.ttc",
            "C:/Windows/Fonts/arialuni.ttf", // Arial Unicode MS
            "C:/Windows/Fonts/ARIALUNI.TTF",
            "C:/Windows/Fonts/arial.ttf",
            "C:/Windows/Fonts/ARIAL.TTF",
            "C:/Windows/Fonts/times.ttf",
            "C:/Windows/Fonts/TIMES.TTF",
            // Linux fonts
            "/usr/share/fonts/truetype/noto/NotoSans-Regular.ttf",
            "/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf",
            "/usr/share/fonts/truetype/liberation/LiberationSans-Regular.ttf",
            // macOS fonts
            "/Library/Fonts/Arial Unicode.ttf",
            "/System/Library/Fonts/Supplemental/Arial Unicode.ttf",
        };
        
        boolean fontLoaded = false;
        
        // Thử load font từ hệ thống
        for (String fontPath : fontPaths) {
            File fontFile = new File(fontPath);
            if (fontFile.exists() && fontFile.isFile()) {
                try {
                    String fontName = getFontName(fontPath);
                    builder.useFont(fontFile, fontName);
                    fontLoaded = true;
                    break;
                } catch (Exception e) {
                    // Bỏ qua nếu không load được font này, thử font tiếp theo
                }
            }
        }
        
        // Nếu không tìm thấy font từ hệ thống, thử tìm trong thư mục Fonts trên Windows
        if (!fontLoaded) {
            String windowsFontsDir = "C:/Windows/Fonts";
            File fontsDir = new File(windowsFontsDir);
            if (fontsDir.exists() && fontsDir.isDirectory()) {
                File[] fontFiles = fontsDir.listFiles((dir, name) -> {
                    String lowerName = name.toLowerCase();
                    return (lowerName.contains("noto") || 
                            lowerName.contains("arial") || 
                            lowerName.contains("dejavu")) && 
                           (lowerName.endsWith(".ttf") || lowerName.endsWith(".ttc"));
                });
                
                if (fontFiles != null && fontFiles.length > 0) {
                    // Ưu tiên Noto Sans
                    for (File fontFile : fontFiles) {
                        String fileName = fontFile.getName().toLowerCase();
                        if (fileName.contains("noto") && !fileName.contains("cjk")) {
                            try {
                                String fontName = getFontName(fontFile.getAbsolutePath());
                                builder.useFont(fontFile, fontName);
                                fontLoaded = true;
                                break;
                            } catch (Exception e) {
                                // Bỏ qua nếu không load được font này, thử font tiếp theo
                            }
                        }
                    }
                    
                    // Nếu không có Noto Sans, thử Arial Unicode MS
                    if (!fontLoaded) {
                        for (File fontFile : fontFiles) {
                            String fileName = fontFile.getName().toLowerCase();
                            if (fileName.contains("arial") && fileName.contains("uni")) {
                                try {
                                    builder.useFont(fontFile, "Arial Unicode MS");
                                    fontLoaded = true;
                                    break;
                                } catch (Exception e) {
                                    // Bỏ qua nếu không load được font này, thử font tiếp theo
                                }
                            }
                        }
                    }
                }
            }
        }
        
        // Nếu không tìm thấy font từ hệ thống, thử load từ classpath
        if (!fontLoaded) {
            try {
                Resource fontResource = new ClassPathResource("fonts/NotoSans-Regular.ttf");
                if (fontResource.exists()) {
                    InputStream fontStream = fontResource.getInputStream();
                    Path tempFont = Files.createTempFile("noto-sans-", ".ttf");
                    Files.copy(fontStream, tempFont, StandardCopyOption.REPLACE_EXISTING);
                    builder.useFont(tempFont.toFile(), "Noto Sans");
                    fontLoaded = true;
                }
            } catch (Exception e) {
                // Bỏ qua nếu không load được font từ classpath
            }
        }
    }
    
    // Lấy tên font từ đường dẫn file
    private String getFontName(String fontPath) {
        String fileName = new File(fontPath).getName().toLowerCase();
        if (fileName.contains("noto")) {
            return "Noto Sans";
        } else if (fileName.contains("arial") && fileName.contains("uni")) {
            return "Arial Unicode MS";
        } else if (fileName.contains("arial")) {
            return "Arial";
        } else if (fileName.contains("dejavu")) {
            return "DejaVu Sans";
        } else if (fileName.contains("liberation")) {
            return "Liberation Sans";
        } else if (fileName.contains("times")) {
            return "Times New Roman";
        }
        return "Noto Sans"; // Default
    }
    
    // Tạo file PDF chứng chỉ và lưu vào thư mục, trả về URL của file
    public String generateCertificatePdfAndSave(Certificate certificate) throws IOException {
        // Convert to absolute path to match WebMvcConfig
        java.nio.file.Path storageDir = java.nio.file.Paths.get(storagePath).toAbsolutePath().normalize();
        
        // Ensure storage directory exists
        File directory = storageDir.toFile();
        if (!directory.exists()) {
            directory.mkdirs();
        }
        
        String filename = "certificate_" + certificate.getCertificateCode() + ".pdf";
        java.nio.file.Path filepath = storageDir.resolve(filename);
        
        // Generate PDF bytes
        byte[] pdfBytes = generateCertificatePdf(certificate);
        
        // Save PDF to file
        try (FileOutputStream fos = new FileOutputStream(filepath.toFile())) {
            fos.write(pdfBytes);
            fos.flush();
        }
        
        // Return URL that matches the resource handler pattern
        return baseUrl + "/" + filename;
    }

    // Tạo nội dung HTML cho chứng chỉ
    private String generateCertificateHtmlContent(Certificate certificate) {
        DateTimeFormatter formatter = DateTimeFormatter.ofPattern("dd/MM/yyyy");
        
        String userName = certificate.getEnrollment().getUser().getFullName();
        String courseTitle = certificate.getEnrollment().getCourse().getTitle();
        String instructorName = certificate.getEnrollment()
                .getCourse().getInstructor().getFullName();
        String issuedDate = certificate.getIssuedAt().format(formatter);
        String certificateCode = certificate.getCertificateCode();
        
        // Escape HTML entities to prevent XSS and ensure proper encoding
        String safeUserName = escapeHtml(userName);
        String safeCourseTitle = escapeHtml(courseTitle);
        String safeInstructorName = escapeHtml(instructorName);
        String safeIssuedDate = escapeHtml(issuedDate);
        String safeCertificateCode = escapeHtml(certificateCode);
        
        // Use String.format() instead of .formatted() to avoid conflict with # in CSS
        // Ensure UTF-8 encoding is properly declared
        return String.format("""
<!DOCTYPE html>
<html lang="vi">
<head>
    <meta http-equiv="Content-Type" content="text/html; charset=UTF-8" />
    <meta charset="UTF-8" />
    <style>
        @page {
            size: A4 landscape;
            margin: 0;
        }
        body {
            font-family: "Noto Sans", "Arial Unicode MS", "DejaVu Sans", Arial, sans-serif;
            margin: 0;
            padding: 40px;
            background: linear-gradient(135deg, #667eea 0%%, #764ba2 100%%);
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
            font-family: "Noto Sans", "Arial Unicode MS", "DejaVu Sans", Arial, sans-serif;
        }
        h2 {
            font-size: 24px;
            color: #333;
            margin-bottom: 40px;
            font-family: "Noto Sans", "Arial Unicode MS", "DejaVu Sans", Arial, sans-serif;
        }
        .recipient {
            font-size: 36px;
            color: #764ba2;
            margin: 30px 0;
            font-weight: bold;
            font-family: "Noto Sans", "Arial Unicode MS", "DejaVu Sans", Arial, sans-serif;
        }
        .course {
            font-size: 28px;
            color: #333;
            margin: 20px 0;
            font-family: "Noto Sans", "Arial Unicode MS", "DejaVu Sans", Arial, sans-serif;
        }
        .instructor {
            font-size: 18px;
            color: #666;
            margin-top: 40px;
            font-family: "Noto Sans", "Arial Unicode MS", "DejaVu Sans", Arial, sans-serif;
        }
        .date {
            font-size: 16px;
            color: #999;
            margin-top: 20px;
            font-family: "Noto Sans", "Arial Unicode MS", "DejaVu Sans", Arial, sans-serif;
        }
        .code {
            font-size: 14px;
            color: #999;
            margin-top: 30px;
            font-family: "Noto Sans", "Arial Unicode MS", "DejaVu Sans", "Courier New", monospace;
        }
        p {
            font-family: "Noto Sans", "Arial Unicode MS", "DejaVu Sans", Arial, sans-serif;
        }
    </style>
</head>
<body>
    <div class="certificate">
        <h1>CHỨNG CHỈ HOÀN THÀNH</h1>
        <h2>Certificate of Completion</h2>
        
        <p>Chứng nhận rằng / This is to certify that</p>
        
        <div class="recipient">%s</div>
        
        <p>đã hoàn thành xuất sắc khóa học<br />has successfully completed the course</p>
        
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
                """, safeUserName, safeCourseTitle, safeInstructorName, safeIssuedDate, safeCertificateCode);
    }
    
    // Chuyển đổi các ký tự đặc biệt HTML để tránh XSS và đảm bảo hiển thị đúng
    private String escapeHtml(String text) {
        if (text == null) {
            return "";
        }
        return text
                .replace("&", "&amp;")
                .replace("<", "&lt;")
                .replace(">", "&gt;")
                .replace("\"", "&quot;")
                .replace("'", "&#39;");
    }
}


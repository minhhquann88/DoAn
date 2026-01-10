package com.coursemgmt.service;

import org.apache.pdfbox.pdmodel.PDDocument;
import org.apache.pdfbox.pdmodel.PDPage;
import org.apache.pdfbox.pdmodel.PDPageContentStream;
import org.apache.pdfbox.pdmodel.common.PDRectangle;
import org.apache.pdfbox.pdmodel.graphics.image.LosslessFactory;
import org.apache.pdfbox.pdmodel.graphics.image.PDImageXObject;
import org.apache.poi.hslf.usermodel.HSLFSlide;
import org.apache.poi.hslf.usermodel.HSLFSlideShow;
import org.apache.poi.xslf.usermodel.XMLSlideShow;
import org.apache.poi.xslf.usermodel.XSLFSlide;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;

import java.awt.*;
import java.awt.geom.Rectangle2D;
import java.awt.image.BufferedImage;
import java.io.*;
import java.nio.file.Files;
import java.nio.file.Path;

// Service để chuyển đổi file PowerPoint (PPT, PPTX) sang định dạng PDF
// Sử dụng Apache POI để đọc slide và PDFBox để tạo PDF
@Service
public class SlideConversionService {

    private static final Logger logger = LoggerFactory.getLogger(SlideConversionService.class);

    // Tỷ lệ phóng to cho hình ảnh slide (1.0 = gốc, cao hơn = chất lượng tốt hơn nhưng chậm hơn)
    // Sử dụng 1.5 để cân bằng giữa chất lượng và tốc độ
    private static final double SCALE = 1.5;

    // Chuyển đổi file slide sang định dạng PDF, hỗ trợ .pptx và .ppt
    public boolean convertToPdf(Path inputFile, Path outputFile) {
        String fileName = inputFile.getFileName().toString().toLowerCase();
        
        try {
            if (fileName.endsWith(".pptx")) {
                return convertPptxToPdf(inputFile, outputFile);
            } else if (fileName.endsWith(".ppt")) {
                return convertPptToPdf(inputFile, outputFile);
            } else if (fileName.endsWith(".odp")) {
                // Chuyển đổi ODP phức tạp hơn, hiện tại chưa hỗ trợ đầy đủ
                logger.warn("ODP conversion not fully supported. Please use PDF format directly.");
                return false;
            } else {
                logger.warn("Unsupported slide format: {}", fileName);
                return false;
            }
        } catch (Exception e) {
            logger.error("Error converting slide to PDF: {}", e.getMessage(), e);
            return false;
        }
    }

    // Chuyển đổi file PPTX (PowerPoint 2007+) sang PDF
    private boolean convertPptxToPdf(Path inputFile, Path outputFile) throws IOException {
        logger.info("Starting PPTX to PDF conversion: {}", inputFile.getFileName());
        long startTime = System.currentTimeMillis();
        
        try (InputStream is = Files.newInputStream(inputFile);
             XMLSlideShow pptx = new XMLSlideShow(is);
             PDDocument pdf = new PDDocument()) {
            
            Dimension pageSize = pptx.getPageSize();
            double width = pageSize.getWidth() * SCALE;
            double height = pageSize.getHeight() * SCALE;
            
            int totalSlides = pptx.getSlides().size();
            logger.info("Processing {} slides...", totalSlides);
            
            int slideIndex = 0;
            for (XSLFSlide slide : pptx.getSlides()) {
                slideIndex++;
                logger.debug("Converting slide {}/{}", slideIndex, totalSlides);
                
                // Tạo hình ảnh buffer cho slide
                BufferedImage img = new BufferedImage(
                    (int) width, 
                    (int) height, 
                    BufferedImage.TYPE_INT_RGB
                );
                
                Graphics2D graphics = img.createGraphics();
                
                // Thiết lập rendering hints để tối ưu tốc độ
                graphics.setRenderingHint(RenderingHints.KEY_ANTIALIASING, RenderingHints.VALUE_ANTIALIAS_ON);
                graphics.setRenderingHint(RenderingHints.KEY_RENDERING, RenderingHints.VALUE_RENDER_SPEED);
                graphics.setRenderingHint(RenderingHints.KEY_TEXT_ANTIALIASING, RenderingHints.VALUE_TEXT_ANTIALIAS_ON);
                
                // Tô nền màu trắng
                graphics.setPaint(Color.WHITE);
                graphics.fill(new Rectangle2D.Double(0, 0, width, height));
                
                // Phóng to và vẽ slide
                graphics.scale(SCALE, SCALE);
                try {
                    slide.draw(graphics);
                } catch (Exception e) {
                    logger.warn("Error rendering slide {}: {}", slideIndex, e.getMessage());
                }
                graphics.dispose();
                
                // Thêm hình ảnh vào PDF như một trang mới
                addImageToPdf(pdf, img);
            }
            
            // Lưu file PDF
            pdf.save(outputFile.toFile());
            long duration = System.currentTimeMillis() - startTime;
            logger.info("Successfully converted PPTX to PDF: {} slides in {}ms", totalSlides, duration);
            return true;
        } catch (Exception e) {
            logger.error("Error converting PPTX: {}", e.getMessage(), e);
            throw new IOException("Failed to convert PPTX: " + e.getMessage(), e);
        }
    }

    // Chuyển đổi file PPT (PowerPoint 97-2003) sang PDF
    private boolean convertPptToPdf(Path inputFile, Path outputFile) throws IOException {
        logger.info("Starting PPT to PDF conversion: {}", inputFile.getFileName());
        long startTime = System.currentTimeMillis();
        
        try (InputStream is = Files.newInputStream(inputFile);
             HSLFSlideShow ppt = new HSLFSlideShow(is);
             PDDocument pdf = new PDDocument()) {
            
            Dimension pageSize = ppt.getPageSize();
            double width = pageSize.getWidth() * SCALE;
            double height = pageSize.getHeight() * SCALE;
            
            int totalSlides = ppt.getSlides().size();
            logger.info("Processing {} slides...", totalSlides);
            
            int slideIndex = 0;
            for (HSLFSlide slide : ppt.getSlides()) {
                slideIndex++;
                logger.debug("Converting slide {}/{}", slideIndex, totalSlides);
                
                // Tạo hình ảnh buffer cho slide
                BufferedImage img = new BufferedImage(
                    (int) width, 
                    (int) height, 
                    BufferedImage.TYPE_INT_RGB
                );
                
                Graphics2D graphics = img.createGraphics();
                
                // Thiết lập rendering hints để tối ưu tốc độ
                graphics.setRenderingHint(RenderingHints.KEY_ANTIALIASING, RenderingHints.VALUE_ANTIALIAS_ON);
                graphics.setRenderingHint(RenderingHints.KEY_RENDERING, RenderingHints.VALUE_RENDER_SPEED);
                graphics.setRenderingHint(RenderingHints.KEY_TEXT_ANTIALIASING, RenderingHints.VALUE_TEXT_ANTIALIAS_ON);
                
                // Tô nền màu trắng
                graphics.setPaint(Color.WHITE);
                graphics.fill(new Rectangle2D.Double(0, 0, width, height));
                
                // Phóng to và vẽ slide
                graphics.scale(SCALE, SCALE);
                try {
                    slide.draw(graphics);
                } catch (Exception e) {
                    logger.warn("Error rendering slide {}: {}", slideIndex, e.getMessage());
                }
                graphics.dispose();
                
                // Thêm hình ảnh vào PDF như một trang mới
                addImageToPdf(pdf, img);
            }
            
            // Lưu file PDF
            pdf.save(outputFile.toFile());
            long duration = System.currentTimeMillis() - startTime;
            logger.info("Successfully converted PPT to PDF: {} slides in {}ms", totalSlides, duration);
            return true;
        } catch (Exception e) {
            logger.error("Error converting PPT: {}", e.getMessage(), e);
            throw new IOException("Failed to convert PPT: " + e.getMessage(), e);
        }
    }

    // Thêm hình ảnh BufferedImage vào PDF như một trang mới
    private void addImageToPdf(PDDocument pdf, BufferedImage image) throws IOException {
        // Tạo trang với tỷ lệ khung hình giống với hình ảnh
        float imageWidth = image.getWidth();
        float imageHeight = image.getHeight();
        
        // Tạo kích thước trang phù hợp với hình ảnh
        PDRectangle pageSize = new PDRectangle(imageWidth, imageHeight);
        PDPage page = new PDPage(pageSize);
        pdf.addPage(page);
        
        // Chuyển đổi BufferedImage sang PDImageXObject
        PDImageXObject pdImage = LosslessFactory.createFromImage(pdf, image);
        
        // Vẽ hình ảnh lên trang
        try (PDPageContentStream contentStream = new PDPageContentStream(pdf, page)) {
            contentStream.drawImage(pdImage, 0, 0, imageWidth, imageHeight);
        }
    }

    // Kiểm tra xem file có cần chuyển đổi sang PDF không
    public boolean needsConversion(String fileName) {
        String lower = fileName.toLowerCase();
        return lower.endsWith(".ppt") || lower.endsWith(".pptx");
    }

    // Kiểm tra xem file đã là PDF chưa
    public boolean isPdf(String fileName) {
        return fileName.toLowerCase().endsWith(".pdf");
    }

    // Chuyển đổi file slide sang PDF và trả về đường dẫn file PDF
    // Nếu file đã là PDF thì trả về đường dẫn gốc
    public Path convertAndGetPdfPath(Path inputPath) throws IOException {
        String fileName = inputPath.getFileName().toString();
        
        if (isPdf(fileName)) {
            return inputPath;
        }
        
        if (!needsConversion(fileName)) {
            throw new IOException("Unsupported file format: " + fileName);
        }
        
        // Tạo đường dẫn output với đuôi .pdf
        String baseName = fileName.substring(0, fileName.lastIndexOf('.'));
        Path outputPath = inputPath.getParent().resolve(baseName + ".pdf");
        
        boolean success = convertToPdf(inputPath, outputPath);
        
        if (success) {
            // Xóa file gốc sau khi chuyển đổi thành công
            try {
                Files.delete(inputPath);
                logger.info("Deleted original file after conversion: {}", inputPath.getFileName());
            } catch (IOException e) {
                logger.warn("Could not delete original file: {}", e.getMessage());
            }
            return outputPath;
        } else {
            throw new IOException("Failed to convert slide to PDF: " + fileName);
        }
    }
}

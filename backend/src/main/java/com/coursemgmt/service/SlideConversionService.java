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

/**
 * Service to convert PowerPoint slides (PPT, PPTX) to PDF format.
 * Uses Apache POI to read slides and PDFBox to generate PDF.
 */
@Service
public class SlideConversionService {

    private static final Logger logger = LoggerFactory.getLogger(SlideConversionService.class);

    // Target resolution for slide images (1.0 = original, higher = better quality but slower)
    // Using 1.5 for balance between quality and speed
    private static final double SCALE = 1.5;

    /**
     * Convert a slide file to PDF format.
     * Supports: .pptx, .ppt
     * 
     * @param inputFile Path to the input slide file
     * @param outputFile Path where the PDF will be saved
     * @return true if conversion successful, false otherwise
     */
    public boolean convertToPdf(Path inputFile, Path outputFile) {
        String fileName = inputFile.getFileName().toString().toLowerCase();
        
        try {
            if (fileName.endsWith(".pptx")) {
                return convertPptxToPdf(inputFile, outputFile);
            } else if (fileName.endsWith(".ppt")) {
                return convertPptToPdf(inputFile, outputFile);
            } else if (fileName.endsWith(".odp")) {
                // ODP conversion is more complex, for now just copy the file
                // and let the user know PDF is recommended
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

    /**
     * Convert PPTX (PowerPoint 2007+) to PDF
     */
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
                
                // Create buffered image for the slide
                BufferedImage img = new BufferedImage(
                    (int) width, 
                    (int) height, 
                    BufferedImage.TYPE_INT_RGB
                );
                
                Graphics2D graphics = img.createGraphics();
                
                // Set rendering hints for speed (not max quality)
                graphics.setRenderingHint(RenderingHints.KEY_ANTIALIASING, RenderingHints.VALUE_ANTIALIAS_ON);
                graphics.setRenderingHint(RenderingHints.KEY_RENDERING, RenderingHints.VALUE_RENDER_SPEED);
                graphics.setRenderingHint(RenderingHints.KEY_TEXT_ANTIALIASING, RenderingHints.VALUE_TEXT_ANTIALIAS_ON);
                
                // Fill background with white
                graphics.setPaint(Color.WHITE);
                graphics.fill(new Rectangle2D.Double(0, 0, width, height));
                
                // Scale and draw the slide
                graphics.scale(SCALE, SCALE);
                try {
                    slide.draw(graphics);
                } catch (Exception e) {
                    logger.warn("Error rendering slide {}: {}", slideIndex, e.getMessage());
                    // Continue with blank slide if rendering fails
                }
                graphics.dispose();
                
                // Add the image as a PDF page
                addImageToPdf(pdf, img);
            }
            
            // Save PDF
            pdf.save(outputFile.toFile());
            long duration = System.currentTimeMillis() - startTime;
            logger.info("Successfully converted PPTX to PDF: {} slides in {}ms", totalSlides, duration);
            return true;
        } catch (Exception e) {
            logger.error("Error converting PPTX: {}", e.getMessage(), e);
            throw new IOException("Failed to convert PPTX: " + e.getMessage(), e);
        }
    }

    /**
     * Convert PPT (PowerPoint 97-2003) to PDF
     */
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
                
                // Create buffered image for the slide
                BufferedImage img = new BufferedImage(
                    (int) width, 
                    (int) height, 
                    BufferedImage.TYPE_INT_RGB
                );
                
                Graphics2D graphics = img.createGraphics();
                
                // Set rendering hints for speed
                graphics.setRenderingHint(RenderingHints.KEY_ANTIALIASING, RenderingHints.VALUE_ANTIALIAS_ON);
                graphics.setRenderingHint(RenderingHints.KEY_RENDERING, RenderingHints.VALUE_RENDER_SPEED);
                graphics.setRenderingHint(RenderingHints.KEY_TEXT_ANTIALIASING, RenderingHints.VALUE_TEXT_ANTIALIAS_ON);
                
                // Fill background with white
                graphics.setPaint(Color.WHITE);
                graphics.fill(new Rectangle2D.Double(0, 0, width, height));
                
                // Scale and draw the slide
                graphics.scale(SCALE, SCALE);
                try {
                    slide.draw(graphics);
                } catch (Exception e) {
                    logger.warn("Error rendering slide {}: {}", slideIndex, e.getMessage());
                }
                graphics.dispose();
                
                // Add the image as a PDF page
                addImageToPdf(pdf, img);
            }
            
            // Save PDF
            pdf.save(outputFile.toFile());
            long duration = System.currentTimeMillis() - startTime;
            logger.info("Successfully converted PPT to PDF: {} slides in {}ms", totalSlides, duration);
            return true;
        } catch (Exception e) {
            logger.error("Error converting PPT: {}", e.getMessage(), e);
            throw new IOException("Failed to convert PPT: " + e.getMessage(), e);
        }
    }

    /**
     * Add a BufferedImage as a new page in the PDF document
     */
    private void addImageToPdf(PDDocument pdf, BufferedImage image) throws IOException {
        // Create a page with the same aspect ratio as the image
        float imageWidth = image.getWidth();
        float imageHeight = image.getHeight();
        
        // Scale to fit standard page while maintaining aspect ratio
        PDRectangle pageSize = new PDRectangle(imageWidth, imageHeight);
        PDPage page = new PDPage(pageSize);
        pdf.addPage(page);
        
        // Convert BufferedImage to PDImageXObject
        PDImageXObject pdImage = LosslessFactory.createFromImage(pdf, image);
        
        // Draw the image on the page
        try (PDPageContentStream contentStream = new PDPageContentStream(pdf, page)) {
            contentStream.drawImage(pdImage, 0, 0, imageWidth, imageHeight);
        }
    }

    /**
     * Check if a file needs conversion to PDF
     */
    public boolean needsConversion(String fileName) {
        String lower = fileName.toLowerCase();
        return lower.endsWith(".ppt") || lower.endsWith(".pptx");
    }

    /**
     * Check if a file is already a PDF
     */
    public boolean isPdf(String fileName) {
        return fileName.toLowerCase().endsWith(".pdf");
    }

    /**
     * Convert slide file to PDF and return the PDF path.
     * If already PDF, returns the input path.
     * 
     * @param inputPath Path to the input slide file
     * @return Path to the PDF file (converted or original)
     */
    public Path convertAndGetPdfPath(Path inputPath) throws IOException {
        String fileName = inputPath.getFileName().toString();
        
        if (isPdf(fileName)) {
            return inputPath;
        }
        
        if (!needsConversion(fileName)) {
            throw new IOException("Unsupported file format: " + fileName);
        }
        
        // Create output path with .pdf extension
        String baseName = fileName.substring(0, fileName.lastIndexOf('.'));
        Path outputPath = inputPath.getParent().resolve(baseName + ".pdf");
        
        boolean success = convertToPdf(inputPath, outputPath);
        
        if (success) {
            // Delete original file after successful conversion
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


package com.coursemgmt.service;

import org.springframework.stereotype.Service;
import org.springframework.web.reactive.function.client.WebClient;

import java.time.Duration;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

/**
 * Service để extract và làm tròn duration từ video
 * Hỗ trợ cả video upload và YouTube links
 */
@Service
public class VideoDurationService {

    private final WebClient webClient;
    private static final Pattern YOUTUBE_ID_PATTERN = Pattern.compile(
        "(?:youtube\\.com\\/(?:[^\\/]+\\/.+\\/|(?:v|e(?:mbed)?)\\/|.*[?&]v=)|youtu\\.be\\/)([^\"&?\\s]{11})"
    );
    
    public VideoDurationService() {
        this.webClient = WebClient.builder()
            .baseUrl("https://www.youtube.com")
            .build();
    }

    /**
     * Extract duration từ video file (seconds)
     * Note: Cần thư viện để đọc metadata, tạm thời return null
     * Frontend có thể gửi duration khi upload
     */
    public Integer extractDurationFromVideoFile(byte[] videoData) {
        // TODO: Implement video metadata extraction
        // Có thể dùng thư viện như JAVE (cần FFmpeg) hoặc Apache Tika
        // Tạm thời return null, frontend sẽ gửi duration
        return null;
    }

    /**
     * Extract duration từ YouTube URL (seconds)
     * Sử dụng YouTube oEmbed API
     */
    public Integer extractDurationFromYouTubeUrl(String youtubeUrl) {
        try {
            String videoId = extractYouTubeVideoId(youtubeUrl);
            if (videoId == null) {
                return null;
            }

            // oEmbed API không trả về duration, cần dùng YouTube Data API v3
            // Tạm thời return null, sẽ implement với API key
            return null;
        } catch (Exception e) {
            System.err.println("Error extracting YouTube video ID: " + e.getMessage());
            return null;
        }
    }

    /**
     * Extract duration từ YouTube URL bằng cách parse HTML
     * Hoặc sử dụng YouTube Data API v3 (cần API key)
     */
    public Integer extractDurationFromYouTubeUrlWithAPI(String youtubeUrl, String apiKey) {
        try {
            String videoId = extractYouTubeVideoId(youtubeUrl);
            if (videoId == null || apiKey == null || apiKey.isEmpty()) {
                return null;
            }

            String apiUrl = "https://www.googleapis.com/youtube/v3/videos?id=" + videoId + "&part=contentDetails&key=" + apiKey;
            
            try {
                String response = webClient.get()
                    .uri(apiUrl)
                    .retrieve()
                    .bodyToMono(String.class)
                    .block(Duration.ofSeconds(10));

                // Parse ISO 8601 duration (PT6M18S -> 378 seconds)
                if (response != null && response.contains("\"duration\"")) {
                    Pattern durationPattern = Pattern.compile("\"duration\":\"([^\"]+)\"");
                    Matcher matcher = durationPattern.matcher(response);
                    if (matcher.find()) {
                        String isoDuration = matcher.group(1);
                        return parseISO8601Duration(isoDuration);
                    }
                }
            } catch (Exception e) {
                System.err.println("Error fetching YouTube duration from API: " + e.getMessage());
                return null;
            }
        } catch (Exception e) {
            System.err.println("Error extracting YouTube video ID: " + e.getMessage());
            return null;
        }
        return null;
    }

    /**
     * Extract YouTube video ID từ URL
     */
    private String extractYouTubeVideoId(String url) {
        if (url == null || url.isEmpty()) {
            return null;
        }
        
        Matcher matcher = YOUTUBE_ID_PATTERN.matcher(url);
        if (matcher.find()) {
            return matcher.group(1);
        }
        return null;
    }

    /**
     * Parse ISO 8601 duration (PT6M18S) thành seconds
     */
    private Integer parseISO8601Duration(String isoDuration) {
        try {
            // PT6M18S -> 6 minutes 18 seconds = 378 seconds
            int totalSeconds = 0;
            
            // Extract hours
            Pattern hoursPattern = Pattern.compile("(\\d+)H");
            Matcher hoursMatcher = hoursPattern.matcher(isoDuration);
            if (hoursMatcher.find()) {
                totalSeconds += Integer.parseInt(hoursMatcher.group(1)) * 3600;
            }
            
            // Extract minutes
            Pattern minutesPattern = Pattern.compile("(\\d+)M");
            Matcher minutesMatcher = minutesPattern.matcher(isoDuration);
            if (minutesMatcher.find()) {
                totalSeconds += Integer.parseInt(minutesMatcher.group(1)) * 60;
            }
            
            // Extract seconds
            Pattern secondsPattern = Pattern.compile("(\\d+)S");
            Matcher secondsMatcher = secondsPattern.matcher(isoDuration);
            if (secondsMatcher.find()) {
                totalSeconds += Integer.parseInt(secondsMatcher.group(1));
            }
            
            return totalSeconds;
        } catch (Exception e) {
            System.err.println("Error parsing ISO 8601 duration: " + e.getMessage());
            return null;
        }
    }

    /**
     * Làm tròn duration (seconds) thành minutes
     * Quy tắc: >= 30 giây thì làm tròn lên, < 30 giây thì làm tròn xuống
     * Ví dụ: 6:18 (378s) -> 6 phút, 5:49 (349s) -> 6 phút
     */
    public Integer roundDurationToMinutes(Integer durationInSeconds) {
        if (durationInSeconds == null || durationInSeconds <= 0) {
            return null;
        }
        
        // Chuyển seconds thành minutes (làm tròn)
        // 378 seconds = 6.3 minutes -> 6 minutes
        // 349 seconds = 5.82 minutes -> 6 minutes (vì >= 5.5)
        double minutes = durationInSeconds / 60.0;
        return (int) Math.round(minutes);
    }

    /**
     * Làm tròn duration từ format MM:SS hoặc HH:MM:SS
     * Ví dụ: "6:18" -> 6 phút, "5:49" -> 6 phút
     */
    public Integer roundDurationFromString(String durationString) {
        if (durationString == null || durationString.isEmpty()) {
            return null;
        }
        
        try {
            String[] parts = durationString.split(":");
            int totalSeconds = 0;
            
            if (parts.length == 2) {
                // MM:SS
                int minutes = Integer.parseInt(parts[0]);
                int seconds = Integer.parseInt(parts[1]);
                totalSeconds = minutes * 60 + seconds;
            } else if (parts.length == 3) {
                // HH:MM:SS
                int hours = Integer.parseInt(parts[0]);
                int minutes = Integer.parseInt(parts[1]);
                int seconds = Integer.parseInt(parts[2]);
                totalSeconds = hours * 3600 + minutes * 60 + seconds;
            } else {
                return null;
            }
            
            return roundDurationToMinutes(totalSeconds);
        } catch (Exception e) {
            System.err.println("Error parsing duration string: " + e.getMessage());
            return null;
        }
    }

    /**
     * Kiểm tra xem URL có phải YouTube không
     */
    public boolean isYouTubeUrl(String url) {
        if (url == null || url.isEmpty()) {
            return false;
        }
        return url.contains("youtube.com") || url.contains("youtu.be");
    }
}


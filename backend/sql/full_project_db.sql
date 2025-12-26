-- MySQL dump 10.13  Distrib 8.0.44, for Win64 (x86_64)
--
-- Host: 127.0.0.1    Database: coursemgmt_test
-- ------------------------------------------------------
-- Server version	9.5.0

/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!50503 SET NAMES utf8 */;
/*!40103 SET @OLD_TIME_ZONE=@@TIME_ZONE */;
/*!40103 SET TIME_ZONE='+00:00' */;
/*!40014 SET @OLD_UNIQUE_CHECKS=@@UNIQUE_CHECKS, UNIQUE_CHECKS=0 */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;
/*!40111 SET @OLD_SQL_NOTES=@@SQL_NOTES, SQL_NOTES=0 */;
SET @MYSQLDUMP_TEMP_LOG_BIN = @@SESSION.SQL_LOG_BIN;
SET @@SESSION.SQL_LOG_BIN= 0;

--
-- GTID state at the beginning of the backup 
--

SET @@GLOBAL.GTID_PURGED=/*!80000 '+'*/ '251037d9-bec9-11f0-b95e-902e16672253:1-715';

--
-- Table structure for table `categories`
--

DROP TABLE IF EXISTS `categories`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `categories` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `name` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `description` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `name` (`name`)
) ENGINE=InnoDB AUTO_INCREMENT=7 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `categories`
--

LOCK TABLES `categories` WRITE;
/*!40000 ALTER TABLE `categories` DISABLE KEYS */;
INSERT INTO `categories` VALUES (1,'Lập trình','Các khóa học về lập trình và phát triển phần mềm'),(2,'Web Development','Phát triển ứng dụng web'),(3,'Mobile Development','Phát triển ứng dụng di động'),(4,'Data Science','Khoa học dữ liệu và phân tích'),(5,'Miễn phí','Các khóa học nền tảng miễn phí cho người mới'),(6,'Pro/Trả phí','Các khóa học chuyên sâu có tính phí');
/*!40000 ALTER TABLE `categories` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `certificates`
--

DROP TABLE IF EXISTS `certificates`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `certificates` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `certificate_code` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `pdf_url` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `issued_at` datetime DEFAULT CURRENT_TIMESTAMP,
  `enrollment_id` bigint NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `certificate_code` (`certificate_code`),
  UNIQUE KEY `enrollment_id` (`enrollment_id`),
  CONSTRAINT `certificates_ibfk_1` FOREIGN KEY (`enrollment_id`) REFERENCES `enrollments` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=3 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `certificates`
--

LOCK TABLES `certificates` WRITE;
/*!40000 ALTER TABLE `certificates` DISABLE KEYS */;
INSERT INTO `certificates` VALUES (1,'CERT-2024-001','/certificates/cert-2024-001.pdf','2025-12-03 00:54:39',2),(2,'CERT-2024-002','/certificates/cert-2024-002.pdf','2025-12-06 00:54:39',5);
/*!40000 ALTER TABLE `certificates` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `chapters`
--

DROP TABLE IF EXISTS `chapters`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `chapters` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `title` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `position` int DEFAULT NULL,
  `course_id` bigint NOT NULL,
  PRIMARY KEY (`id`),
  KEY `course_id` (`course_id`),
  CONSTRAINT `chapters_ibfk_1` FOREIGN KEY (`course_id`) REFERENCES `courses` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=33 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `chapters`
--

LOCK TABLES `chapters` WRITE;
/*!40000 ALTER TABLE `chapters` DISABLE KEYS */;
INSERT INTO `chapters` VALUES (1,'Giới thiệu Spring Boot',1,1),(2,'Spring Boot Core',2,1),(3,'Spring Data JPA',3,1),(4,'Spring Security',4,1),(5,'React Fundamentals',1,2),(6,'Components & Props',2,2),(7,'State & Hooks',3,2),(8,'Routing & Navigation',4,2),(9,'Node.js Basics',1,3),(10,'Express Framework',2,3),(11,'Database Integration',3,3),(12,'Python Basics',1,4),(13,'NumPy & Pandas',2,4),(14,'Data Visualization',3,4),(15,'Flutter Introduction',1,5),(16,'Widgets & Layouts',2,5),(17,'State Management',3,5),(18,'Chương 1: Giới thiệu tổng quan',1,6),(19,'Chương 1: Giới thiệu tổng quan',1,7),(20,'Chương 1: Giới thiệu tổng quan',1,8),(21,'Chương 1: Giới thiệu tổng quan',1,9),(22,'Chương 1: Giới thiệu tổng quan',1,10),(23,'Chương 1: Giới thiệu tổng quan',1,11),(24,'Chương 1: Giới thiệu tổng quan',1,12),(25,'Chương 1: Giới thiệu tổng quan',1,13),(26,'Chương 1: Giới thiệu tổng quan',1,14),(27,'Chương 1: Giới thiệu tổng quan',1,15),(28,'Chương 1: Giới thiệu tổng quan',1,16),(29,'Chương 1: Giới thiệu tổng quan',1,17),(30,'Chương 1: Giới thiệu tổng quan',1,18),(31,'Chương 1: Giới thiệu tổng quan',1,19);
/*!40000 ALTER TABLE `chapters` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `chat_messages`
--

DROP TABLE IF EXISTS `chat_messages`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `chat_messages` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `created_at` datetime(6) DEFAULT NULL,
  `feedback_rating` int DEFAULT NULL,
  `message_content` tinytext COLLATE utf8mb4_unicode_ci NOT NULL,
  `response_content` longtext COLLATE utf8mb4_unicode_ci,
  `session_id` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `user_id` bigint NOT NULL,
  PRIMARY KEY (`id`),
  KEY `FK6f0y4l43ihmgfswkgy9yrtjkh` (`user_id`),
  CONSTRAINT `FK6f0y4l43ihmgfswkgy9yrtjkh` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `chat_messages`
--

LOCK TABLES `chat_messages` WRITE;
/*!40000 ALTER TABLE `chat_messages` DISABLE KEYS */;
/*!40000 ALTER TABLE `chat_messages` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `courses`
--

DROP TABLE IF EXISTS `courses`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `courses` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `title` varchar(200) COLLATE utf8mb4_unicode_ci NOT NULL,
  `description` longtext COLLATE utf8mb4_unicode_ci,
  `price` double NOT NULL,
  `image_url` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `total_duration_in_hours` int DEFAULT NULL,
  `status` varchar(30) COLLATE utf8mb4_unicode_ci DEFAULT 'DRAFT',
  `created_at` datetime DEFAULT CURRENT_TIMESTAMP,
  `updated_at` datetime DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `instructor_id` bigint DEFAULT NULL,
  `category_id` bigint DEFAULT NULL,
  `is_featured` tinyint(1) DEFAULT '0',
  `is_published` tinyint(1) DEFAULT '1',
  PRIMARY KEY (`id`),
  KEY `idx_courses_instructor` (`instructor_id`),
  KEY `idx_courses_category` (`category_id`),
  CONSTRAINT `courses_ibfk_1` FOREIGN KEY (`instructor_id`) REFERENCES `users` (`id`) ON DELETE SET NULL,
  CONSTRAINT `courses_ibfk_2` FOREIGN KEY (`category_id`) REFERENCES `categories` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB AUTO_INCREMENT=20 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `courses`
--

LOCK TABLES `courses` WRITE;
/*!40000 ALTER TABLE `courses` DISABLE KEYS */;
INSERT INTO `courses` VALUES (1,'Java Spring Boot Cơ bản','Khóa học về Spring Boot framework cho Java',500000,'https://files.f8.edu.vn/f8-prod/courses/7.png',40,'PUBLISHED','2025-11-08 00:54:39','2025-12-26 19:27:49',2,1,0,1),(2,'React.js từ Zero đến Hero','Học React.js từ cơ bản đến nâng cao',600000,'https://files.f8.edu.vn/f8-prod/courses/7.png',50,'PUBLISHED','2025-11-13 00:54:39','2025-12-26 19:27:49',3,2,0,1),(3,'Node.js Backend Development','Xây dựng backend với Node.js và Express',550000,'https://files.f8.edu.vn/f8-prod/courses/7.png',45,'PUBLISHED','2025-11-18 00:54:39','2025-12-26 19:27:49',3,2,0,1),(4,'Python cho Data Science','Phân tích dữ liệu với Python',700000,'https://files.f8.edu.vn/f8-prod/courses/7.png',60,'PUBLISHED','2025-11-23 00:54:39','2025-12-26 19:06:16',2,4,0,1),(5,'Flutter Mobile App','Phát triển ứng dụng di động với Flutter',650000,'https://files.f8.edu.vn/f8-prod/courses/7.png',55,'PUBLISHED','2025-11-28 00:54:39','2025-12-26 17:43:03',3,3,0,1),(6,'Kiến Thức Nhập Môn IT','Để có cái nhìn tổng quan về ngành IT - Lập trình web các bạn nên xem các videos tại khóa này trước nhé.',0,'https://files.f8.edu.vn/f8-prod/courses/7.png',3,'PUBLISHED','2025-12-26 16:39:38','2025-12-26 19:27:49',1,5,1,1),(7,'Lập trình C++ cơ bản, nâng cao','Khóa học lập trình C++ từ cơ bản tới nâng cao dành cho người mới bắt đầu.',0,'https://files.f8.edu.vn/f8-prod/courses/21/63e1bcbaed1dd.png',10,'PUBLISHED','2025-12-26 16:39:38','2025-12-26 19:27:49',1,5,1,1),(8,'HTML CSS từ Zero đến Hero','Trong khóa này chúng ta sẽ cùng nhau xây dựng giao diện 2 trang web là The Band & Shopee.',0,'https://files.f8.edu.vn/f8-prod/courses/2.png',29,'PUBLISHED','2025-12-26 16:39:38','2025-12-26 19:27:49',1,5,1,1),(9,'Responsive Với Grid System','Trong khóa này chúng ta sẽ học về cách xây dựng giao diện web responsive với Grid System.',0,'https://files.f8.edu.vn/f8-prod/courses/3.png',6,'PUBLISHED','2025-12-26 16:39:38','2025-12-26 19:27:49',1,5,1,1),(10,'Lập Trình JavaScript Cơ Bản','Học Javascript cơ bản phù hợp cho người chưa từng học lập trình.',0,'https://files.f8.edu.vn/f8-prod/courses/1.png',24,'PUBLISHED','2025-12-26 16:39:38','2025-12-26 16:39:38',1,5,0,1),(11,'Lập Trình JavaScript Nâng Cao','Hiểu sâu hơn về cách Javascript hoạt động, tìm hiểu về IIFE, closure, reference types...',0,'https://files.f8.edu.vn/f8-prod/courses/12.png',8,'PUBLISHED','2025-12-26 16:39:38','2025-12-26 16:39:38',1,5,0,1),(12,'Làm việc với Terminal & Ubuntu','Sở hữu một Terminal hiện đại, mạnh mẽ trong tùy biến và học cách làm việc với Ubuntu.',0,'https://files.f8.edu.vn/f8-prod/courses/14/624faac11d109.png',4,'PUBLISHED','2025-12-26 16:39:38','2025-12-26 16:39:38',1,5,0,1),(13,'Xây Dựng Website với ReactJS','Khóa học ReactJS từ cơ bản tới nâng cao, làm dự án giống Tiktok.com.',0,'https://files.f8.edu.vn/f8-prod/courses/13/13.png',27,'PUBLISHED','2025-12-26 16:39:38','2025-12-26 16:39:38',1,5,0,1),(14,'Node & ExpressJS','Học Back-end với Node & ExpressJS framework, xây dựng RESTful API.',0,'https://files.f8.edu.vn/f8-prod/courses/6.png',12,'PUBLISHED','2025-12-26 16:39:38','2025-12-26 16:39:38',1,5,0,1),(15,'App \"Đừng Chạm Tay Lên Mặt\"','Xây dựng ứng dụng AI cảnh báo sờ tay lên mặt với ReactJS & Tensorflow.',0,'https://files.f8.edu.vn/f8-prod/courses/4/61a9e9e701506.png',1,'PUBLISHED','2025-12-26 16:39:38','2025-12-26 16:39:38',1,5,0,1),(16,'HTML CSS Pro','Khóa học HTML CSS Pro phù hợp cho cả người mới bắt đầu, lên tới 8 dự án trên Figma.',1299000,'https://files.f8.edu.vn/f8-prod/courses/15/62f13d2424a47.png',116,'PUBLISHED','2025-12-26 16:39:38','2025-12-26 16:39:38',1,6,0,1),(17,'JavaScript Pro','Khóa học JavaScript Pro này là nền tảng vững chắc để học tiếp React, Vue.js, Node.js.',1399000,'https://files.f8.edu.vn/f8-prod/courses/19/66aa28194b52b.png',49,'PUBLISHED','2025-12-26 16:39:38','2025-12-26 16:39:38',1,6,0,1),(18,'Ngôn ngữ Sass','Kiến thức về Sass trong khóa này bạn có thể áp dụng ngay vào các dự án của bạn.',299000,'https://files.f8.edu.vn/f8-prod/courses/27/64e184ee5d7a2.png',6,'PUBLISHED','2025-12-26 16:39:38','2025-12-26 16:39:38',1,6,0,1),(19,'Fullstack Web','Lớp học Fullstack Zoom Online chuyên sâu.',18900000,'https://files.f8.edu.vn/f8-prod/courses/31/67f4c93c28d4b.png',222,'PUBLISHED','2025-12-26 16:39:38','2025-12-26 16:39:38',1,6,0,1);
/*!40000 ALTER TABLE `courses` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `enrollments`
--

DROP TABLE IF EXISTS `enrollments`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `enrollments` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `enrolled_at` datetime DEFAULT CURRENT_TIMESTAMP,
  `progress` double DEFAULT '0',
  `status` varchar(20) COLLATE utf8mb4_unicode_ci DEFAULT 'IN_PROGRESS',
  `user_id` bigint NOT NULL,
  `course_id` bigint NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `unique_enrollment` (`user_id`,`course_id`),
  KEY `idx_enrollments_user` (`user_id`),
  KEY `idx_enrollments_course` (`course_id`),
  CONSTRAINT `enrollments_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE,
  CONSTRAINT `enrollments_ibfk_2` FOREIGN KEY (`course_id`) REFERENCES `courses` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=11 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `enrollments`
--

LOCK TABLES `enrollments` WRITE;
/*!40000 ALTER TABLE `enrollments` DISABLE KEYS */;
INSERT INTO `enrollments` VALUES (1,'2025-11-18 00:54:39',45.5,'IN_PROGRESS',4,1),(2,'2025-11-23 00:54:39',100,'COMPLETED',4,2),(3,'2025-11-28 00:54:39',30,'IN_PROGRESS',4,3),(4,'2025-11-20 00:54:39',75,'IN_PROGRESS',5,1),(5,'2025-11-26 00:54:39',100,'COMPLETED',5,4),(6,'2025-11-30 00:54:39',20,'IN_PROGRESS',6,2),(7,'2025-12-03 00:54:39',10,'IN_PROGRESS',6,5),(8,'2025-12-22 13:39:40',0,'IN_PROGRESS',8,1),(9,'2025-12-22 13:40:45',0,'IN_PROGRESS',9,1),(10,'2025-12-22 13:41:20',0,'IN_PROGRESS',10,1);
/*!40000 ALTER TABLE `enrollments` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `lessons`
--

DROP TABLE IF EXISTS `lessons`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `lessons` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `title` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `content_type` varchar(20) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `video_url` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `document_url` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `content` longtext COLLATE utf8mb4_unicode_ci,
  `position` int DEFAULT NULL,
  `duration_in_minutes` int DEFAULT NULL,
  `chapter_id` bigint NOT NULL,
  `is_preview` tinyint(1) DEFAULT '0',
  PRIMARY KEY (`id`),
  KEY `chapter_id` (`chapter_id`),
  CONSTRAINT `lessons_ibfk_1` FOREIGN KEY (`chapter_id`) REFERENCES `chapters` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=71 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `lessons`
--

LOCK TABLES `lessons` WRITE;
/*!40000 ALTER TABLE `lessons` DISABLE KEYS */;
INSERT INTO `lessons` VALUES (1,'Bài 1: Tổng quan Spring Boot','VIDEO','/videos/intro.mp4',NULL,'Nội dung bài học về Spring Boot',1,30,1,1),(2,'Bài 2: Cài đặt môi trường','TEXT','/videos/intro.mp4',NULL,'Hướng dẫn cài đặt JDK, Maven, IDE',2,20,1,1),(3,'Bài 3: Dependency Injection','VIDEO','/videos/intro.mp4',NULL,'Tìm hiểu về DI trong Spring',1,45,2,1),(4,'Bài 4: Configuration','TEXT','/videos/intro.mp4',NULL,'Cấu hình ứng dụng Spring Boot',2,25,2,1),(5,'Bài 1: Giới thiệu React','VIDEO','/videos/intro.mp4',NULL,'Tổng quan về React.js',1,40,5,1),(6,'Bài 2: JSX Syntax','TEXT','/videos/intro.mp4',NULL,'Học về JSX trong React',2,30,5,1),(7,'Bài 1: Node.js là gì?','VIDEO','/videos/intro.mp4',NULL,'Giới thiệu Node.js',1,35,9,1),(8,'Bài 2: NPM và Modules','TEXT','/videos/intro.mp4',NULL,'Quản lý packages với NPM',2,25,9,1),(9,'Bài 1: Giới thiệu khóa học','VIDEO','/videos/intro.mp4',NULL,NULL,1,5,1,1),(10,'Bài 1: Giới thiệu khóa học','VIDEO','/videos/intro.mp4',NULL,NULL,1,5,2,1),(11,'Bài 1: Giới thiệu khóa học','VIDEO','/videos/intro.mp4',NULL,NULL,1,5,3,1),(12,'Bài 1: Giới thiệu khóa học','VIDEO','/videos/intro.mp4',NULL,NULL,1,5,4,1),(13,'Bài 1: Giới thiệu khóa học','VIDEO','/videos/intro.mp4',NULL,NULL,1,5,5,1),(14,'Bài 1: Giới thiệu khóa học','VIDEO','/videos/intro.mp4',NULL,NULL,1,5,6,1),(15,'Bài 1: Giới thiệu khóa học','VIDEO','/videos/intro.mp4',NULL,NULL,1,5,7,1),(16,'Bài 1: Giới thiệu khóa học','VIDEO','/videos/intro.mp4',NULL,NULL,1,5,8,1),(17,'Bài 1: Giới thiệu khóa học','VIDEO','/videos/intro.mp4',NULL,NULL,1,5,9,1),(18,'Bài 1: Giới thiệu khóa học','VIDEO','/videos/intro.mp4',NULL,NULL,1,5,10,1),(19,'Bài 1: Giới thiệu khóa học','VIDEO','/videos/intro.mp4',NULL,NULL,1,5,11,1),(20,'Bài 1: Giới thiệu khóa học','VIDEO','/videos/intro.mp4',NULL,NULL,1,5,12,1),(21,'Bài 1: Giới thiệu khóa học','VIDEO','/videos/intro.mp4',NULL,NULL,1,5,13,1),(22,'Bài 1: Giới thiệu khóa học','VIDEO','/videos/intro.mp4',NULL,NULL,1,5,14,1),(23,'Bài 1: Giới thiệu khóa học','VIDEO','/videos/intro.mp4',NULL,NULL,1,5,15,1),(24,'Bài 1: Giới thiệu khóa học','VIDEO','/videos/intro.mp4',NULL,NULL,1,5,16,1),(25,'Bài 1: Giới thiệu khóa học','VIDEO','/videos/intro.mp4',NULL,NULL,1,5,17,1),(26,'Bài 1: Giới thiệu khóa học','VIDEO','/videos/intro.mp4',NULL,NULL,1,5,18,1),(27,'Bài 1: Giới thiệu khóa học','VIDEO','/videos/intro.mp4',NULL,NULL,1,5,19,1),(28,'Bài 1: Giới thiệu khóa học','VIDEO','/videos/intro.mp4',NULL,NULL,1,5,20,1),(29,'Bài 1: Giới thiệu khóa học','VIDEO','/videos/intro.mp4',NULL,NULL,1,5,21,1),(30,'Bài 1: Giới thiệu khóa học','VIDEO','/videos/intro.mp4',NULL,NULL,1,5,22,1),(31,'Bài 1: Giới thiệu khóa học','VIDEO','/videos/intro.mp4',NULL,NULL,1,5,23,1),(32,'Bài 1: Giới thiệu khóa học','VIDEO','/videos/intro.mp4',NULL,NULL,1,5,24,1),(33,'Bài 1: Giới thiệu khóa học','VIDEO','/videos/intro.mp4',NULL,NULL,1,5,25,1),(34,'Bài 1: Giới thiệu khóa học','VIDEO','/videos/intro.mp4',NULL,NULL,1,5,26,1),(35,'Bài 1: Giới thiệu khóa học','VIDEO','/videos/intro.mp4',NULL,NULL,1,5,27,1),(36,'Bài 1: Giới thiệu khóa học','VIDEO','/videos/intro.mp4',NULL,NULL,1,5,28,1),(37,'Bài 1: Giới thiệu khóa học','VIDEO','/videos/intro.mp4',NULL,NULL,1,5,29,1),(38,'Bài 1: Giới thiệu khóa học','VIDEO','/videos/intro.mp4',NULL,NULL,1,5,30,1),(39,'Bài 1: Giới thiệu khóa học','VIDEO','/videos/intro.mp4',NULL,NULL,1,5,31,1),(40,'Bài 2: Cài đặt môi trường','VIDEO','/videos/intro.mp4',NULL,NULL,2,10,1,1),(41,'Bài 2: Cài đặt môi trường','VIDEO','/videos/intro.mp4',NULL,NULL,2,10,2,1),(42,'Bài 2: Cài đặt môi trường','VIDEO','/videos/intro.mp4',NULL,NULL,2,10,3,1),(43,'Bài 2: Cài đặt môi trường','VIDEO','/videos/intro.mp4',NULL,NULL,2,10,4,1),(44,'Bài 2: Cài đặt môi trường','VIDEO','/videos/intro.mp4',NULL,NULL,2,10,5,1),(45,'Bài 2: Cài đặt môi trường','VIDEO','/videos/intro.mp4',NULL,NULL,2,10,6,1),(46,'Bài 2: Cài đặt môi trường','VIDEO','/videos/intro.mp4',NULL,NULL,2,10,7,1),(47,'Bài 2: Cài đặt môi trường','VIDEO','/videos/intro.mp4',NULL,NULL,2,10,8,1),(48,'Bài 2: Cài đặt môi trường','VIDEO','/videos/intro.mp4',NULL,NULL,2,10,9,1),(49,'Bài 2: Cài đặt môi trường','VIDEO','/videos/intro.mp4',NULL,NULL,2,10,10,1),(50,'Bài 2: Cài đặt môi trường','VIDEO','/videos/intro.mp4',NULL,NULL,2,10,11,1),(51,'Bài 2: Cài đặt môi trường','VIDEO','/videos/intro.mp4',NULL,NULL,2,10,12,1),(52,'Bài 2: Cài đặt môi trường','VIDEO','/videos/intro.mp4',NULL,NULL,2,10,13,1),(53,'Bài 2: Cài đặt môi trường','VIDEO','/videos/intro.mp4',NULL,NULL,2,10,14,1),(54,'Bài 2: Cài đặt môi trường','VIDEO','/videos/intro.mp4',NULL,NULL,2,10,15,1),(55,'Bài 2: Cài đặt môi trường','VIDEO','/videos/intro.mp4',NULL,NULL,2,10,16,1),(56,'Bài 2: Cài đặt môi trường','VIDEO','/videos/intro.mp4',NULL,NULL,2,10,17,1),(57,'Bài 2: Cài đặt môi trường','VIDEO','/videos/intro.mp4',NULL,NULL,2,10,18,1),(58,'Bài 2: Cài đặt môi trường','VIDEO','/videos/intro.mp4',NULL,NULL,2,10,19,1),(59,'Bài 2: Cài đặt môi trường','VIDEO','/videos/intro.mp4',NULL,NULL,2,10,20,1),(60,'Bài 2: Cài đặt môi trường','VIDEO','/videos/intro.mp4',NULL,NULL,2,10,21,1),(61,'Bài 2: Cài đặt môi trường','VIDEO','/videos/intro.mp4',NULL,NULL,2,10,22,1),(62,'Bài 2: Cài đặt môi trường','VIDEO','/videos/intro.mp4',NULL,NULL,2,10,23,1),(63,'Bài 2: Cài đặt môi trường','VIDEO','/videos/intro.mp4',NULL,NULL,2,10,24,1),(64,'Bài 2: Cài đặt môi trường','VIDEO','/videos/intro.mp4',NULL,NULL,2,10,25,1),(65,'Bài 2: Cài đặt môi trường','VIDEO','/videos/intro.mp4',NULL,NULL,2,10,26,1),(66,'Bài 2: Cài đặt môi trường','VIDEO','/videos/intro.mp4',NULL,NULL,2,10,27,1),(67,'Bài 2: Cài đặt môi trường','VIDEO','/videos/intro.mp4',NULL,NULL,2,10,28,1),(68,'Bài 2: Cài đặt môi trường','VIDEO','/videos/intro.mp4',NULL,NULL,2,10,29,1),(69,'Bài 2: Cài đặt môi trường','VIDEO','/videos/intro.mp4',NULL,NULL,2,10,30,1),(70,'Bài 2: Cài đặt môi trường','VIDEO','/videos/intro.mp4',NULL,NULL,2,10,31,1);
/*!40000 ALTER TABLE `lessons` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `password_reset_token`
--

DROP TABLE IF EXISTS `password_reset_token`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `password_reset_token` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `expiry_date` datetime(6) NOT NULL,
  `token` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `user_id` bigint NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `UKg0guo4k8krgpwuagos61oc06j` (`token`),
  UNIQUE KEY `UKf90ivichjaokvmovxpnlm5nin` (`user_id`),
  CONSTRAINT `FK83nsrttkwkb6ym0anu051mtxn` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=11 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `password_reset_token`
--

LOCK TABLES `password_reset_token` WRITE;
/*!40000 ALTER TABLE `password_reset_token` DISABLE KEYS */;
INSERT INTO `password_reset_token` VALUES (1,'2025-12-23 13:38:50.738825','2d531717-1382-4984-a98f-f8eb8a8a6b72',1),(5,'2025-12-27 15:04:28.705593','6d22fac5-c820-4116-9a52-02bf5f5c08e2',11);
/*!40000 ALTER TABLE `password_reset_token` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `recommendations`
--

DROP TABLE IF EXISTS `recommendations`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `recommendations` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `generated_at` datetime(6) DEFAULT NULL,
  `reason` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `recommendation_score` double DEFAULT NULL,
  `course_id` bigint NOT NULL,
  `user_id` bigint NOT NULL,
  PRIMARY KEY (`id`),
  KEY `FKnc0purpvedykwqq5b77vi9kik` (`course_id`),
  KEY `FK3c9w1lipqdutm65a9inevwfp0` (`user_id`),
  CONSTRAINT `FK3c9w1lipqdutm65a9inevwfp0` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`),
  CONSTRAINT `FKnc0purpvedykwqq5b77vi9kik` FOREIGN KEY (`course_id`) REFERENCES `courses` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `recommendations`
--

LOCK TABLES `recommendations` WRITE;
/*!40000 ALTER TABLE `recommendations` DISABLE KEYS */;
/*!40000 ALTER TABLE `recommendations` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `roles`
--

DROP TABLE IF EXISTS `roles`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `roles` (
  `id` int NOT NULL AUTO_INCREMENT,
  `name` varchar(20) COLLATE utf8mb4_unicode_ci NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `name` (`name`)
) ENGINE=InnoDB AUTO_INCREMENT=4 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `roles`
--

LOCK TABLES `roles` WRITE;
/*!40000 ALTER TABLE `roles` DISABLE KEYS */;
INSERT INTO `roles` VALUES (1,'ROLE_ADMIN'),(2,'ROLE_LECTURER'),(3,'ROLE_STUDENT');
/*!40000 ALTER TABLE `roles` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `transactions`
--

DROP TABLE IF EXISTS `transactions`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `transactions` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `amount` double NOT NULL,
  `status` varchar(20) COLLATE utf8mb4_unicode_ci DEFAULT 'PENDING',
  `payment_gateway` varchar(20) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `transaction_code` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `created_at` datetime DEFAULT CURRENT_TIMESTAMP,
  `user_id` bigint NOT NULL,
  `course_id` bigint NOT NULL,
  PRIMARY KEY (`id`),
  KEY `idx_transactions_user` (`user_id`),
  KEY `idx_transactions_course` (`course_id`),
  KEY `idx_transactions_status` (`status`),
  CONSTRAINT `transactions_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE,
  CONSTRAINT `transactions_ibfk_2` FOREIGN KEY (`course_id`) REFERENCES `courses` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=13 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `transactions`
--

LOCK TABLES `transactions` WRITE;
/*!40000 ALTER TABLE `transactions` DISABLE KEYS */;
INSERT INTO `transactions` VALUES (1,500000,'SUCCESS','VNPAY','VNPAY123456','2025-11-18 00:54:39',4,1),(2,600000,'SUCCESS','MOMO','MOMO789012','2025-11-23 00:54:39',4,2),(3,550000,'PENDING','VNPAY','VNPAY345678','2025-11-28 00:54:39',4,3),(4,500000,'SUCCESS','VNPAY','VNPAY901234','2025-11-20 00:54:39',5,1),(5,700000,'SUCCESS','MOMO','MOMO567890','2025-11-26 00:54:39',5,4),(6,600000,'SUCCESS','VNPAY','VNPAY111222','2025-11-30 00:54:39',6,2),(7,650000,'FAILED','MOMO','MOMO333444','2025-12-03 00:54:39',6,5),(8,299000,'PENDING','VNPAY','TXN17657915960946561','2025-12-15 09:39:56',1,1),(9,299000,'PENDING','VNPAY','TXN17657958289100387','2025-12-15 10:50:29',1,1),(10,299000,'PENDING','VNPAY','TXN17657958458891223','2025-12-15 10:50:46',1,1),(11,299000,'PENDING','VNPAY','TXN17657964853340017','2025-12-15 11:01:25',1,1),(12,299000,'PENDING','VNPAY','TXN17658991694582834','2025-12-16 15:32:49',1,1);
/*!40000 ALTER TABLE `transactions` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `user_progress`
--

DROP TABLE IF EXISTS `user_progress`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `user_progress` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `is_completed` tinyint(1) DEFAULT '0',
  `completed_at` datetime DEFAULT NULL,
  `enrollment_id` bigint NOT NULL,
  `lesson_id` bigint NOT NULL,
  `last_watched_time` int DEFAULT NULL,
  `total_duration` int DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `idx_user_progress_enrollment` (`enrollment_id`),
  KEY `idx_user_progress_lesson` (`lesson_id`),
  CONSTRAINT `user_progress_ibfk_1` FOREIGN KEY (`enrollment_id`) REFERENCES `enrollments` (`id`) ON DELETE CASCADE,
  CONSTRAINT `user_progress_ibfk_2` FOREIGN KEY (`lesson_id`) REFERENCES `lessons` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=11 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `user_progress`
--

LOCK TABLES `user_progress` WRITE;
/*!40000 ALTER TABLE `user_progress` DISABLE KEYS */;
INSERT INTO `user_progress` VALUES (1,1,'2025-11-20 00:54:39',1,1,NULL,NULL),(2,1,'2025-11-21 00:54:39',1,2,NULL,NULL),(3,1,'2025-11-22 00:54:39',1,3,NULL,NULL),(4,0,NULL,1,4,NULL,NULL),(5,1,'2025-11-26 00:54:39',2,5,NULL,NULL),(6,1,'2025-11-27 00:54:39',2,6,NULL,NULL),(7,1,'2025-11-23 00:54:39',4,1,NULL,NULL),(8,1,'2025-11-24 00:54:39',4,2,NULL,NULL),(9,1,'2025-11-25 00:54:39',4,3,NULL,NULL),(10,1,'2025-11-26 00:54:39',4,4,NULL,NULL);
/*!40000 ALTER TABLE `user_progress` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `user_roles`
--

DROP TABLE IF EXISTS `user_roles`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `user_roles` (
  `user_id` bigint NOT NULL,
  `role_id` int NOT NULL,
  PRIMARY KEY (`user_id`,`role_id`),
  KEY `role_id` (`role_id`),
  CONSTRAINT `user_roles_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE,
  CONSTRAINT `user_roles_ibfk_2` FOREIGN KEY (`role_id`) REFERENCES `roles` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `user_roles`
--

LOCK TABLES `user_roles` WRITE;
/*!40000 ALTER TABLE `user_roles` DISABLE KEYS */;
INSERT INTO `user_roles` VALUES (1,1),(2,2),(3,2),(12,2),(4,3),(5,3),(6,3),(7,3),(8,3),(9,3),(10,3),(11,3);
/*!40000 ALTER TABLE `user_roles` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `users`
--

DROP TABLE IF EXISTS `users`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `users` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `username` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `password` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL COMMENT 'BCrypt encoded',
  `email` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `full_name` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `avatar_url` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `bio` longtext COLLATE utf8mb4_unicode_ci,
  `created_at` datetime DEFAULT CURRENT_TIMESTAMP,
  `is_enabled` tinyint(1) DEFAULT '0',
  PRIMARY KEY (`id`),
  UNIQUE KEY `username` (`username`),
  UNIQUE KEY `email` (`email`)
) ENGINE=InnoDB AUTO_INCREMENT=13 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `users`
--

LOCK TABLES `users` WRITE;
/*!40000 ALTER TABLE `users` DISABLE KEYS */;
INSERT INTO `users` VALUES (1,'admin','$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy','admin@example.com','Quản trị viên',NULL,'Quản trị hệ thống','2025-12-08 00:54:39',1),(2,'lecturer1','$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy','lecturer1@example.com','Nguyễn Văn A',NULL,'Giảng viên Lập trình Java','2025-12-08 00:54:39',1),(3,'lecturer2','$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy','lecturer2@example.com','Trần Thị B',NULL,'Giảng viên Web Development','2025-12-08 00:54:39',1),(4,'student1','$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy','student1@example.com','Lê Văn C',NULL,'Học viên','2025-12-08 00:54:39',1),(5,'student2','$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy','student2@example.com','Phạm Thị D',NULL,'Học viên','2025-12-08 00:54:39',1),(6,'student3','$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy','student3@example.com','Hoàng Văn E',NULL,'Học viên','2025-12-08 00:54:39',1),(7,'apitest_567596424','$2a$10$822JAe9EnJi.jmOvLo1Zx.JYvEBtz7anfJ2KUAFDjZ7zolWQklIJG','apitest_567596424@test.com','API Test User',NULL,NULL,'2025-12-22 13:38:50',1),(8,'apitest_1721497716','$2a$10$PQoczjO2JtR6bbx8ZG0Ule.ba.Ea8zJF27Zi9FXdMX6000P3mZ0Xq','apitest_1721497716@test.com','API Test User',NULL,NULL,'2025-12-22 13:39:39',1),(9,'apitest_43622775','$2a$10$MF9M45piMAAf5xLYNH3NxuCxKrZTqJEw8aduvznwPR1ihi2JECoQu','apitest_43622775@test.com','API Test User',NULL,NULL,'2025-12-22 13:40:45',1),(10,'apitest_1383010479','$2a$10$PbYbQ8ZPX.Fp7XATOznKQeJkG2XbWk58R3QL6PlXCWReeKJzyJpo.','apitest_1383010479@test.com','API Test User',NULL,NULL,'2025-12-22 13:41:19',1),(11,'B21DCCN595','$2a$10$5n8EowEAygo/4Cjh8GAhOewDqRjvRvgt8IH.uI1hQ5/L2AnNNGSTi','baophuc2712003@gmail.com','aaa',NULL,NULL,'2025-12-23 02:46:54',1),(12,'aaa','$2a$10$oRrprfjlwZBk9pRQ7DmEc.H3Nrjl5xxBw9e6pTfDbUkzckRVI2hO2','aa@example.com','aaa',NULL,NULL,'2025-12-25 17:04:37',1);
/*!40000 ALTER TABLE `users` ENABLE KEYS */;
UNLOCK TABLES;
SET @@SESSION.SQL_LOG_BIN = @MYSQLDUMP_TEMP_LOG_BIN;
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

-- Dump completed on 2025-12-26 22:47:31

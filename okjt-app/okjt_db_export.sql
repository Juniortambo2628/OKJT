-- MySQL dump 10.13  Distrib 9.1.0, for Win64 (x86_64)
--
-- Host: localhost    Database: okjt_db
-- ------------------------------------------------------
-- Server version	9.1.0

/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!50503 SET NAMES utf8mb4 */;
/*!40103 SET @OLD_TIME_ZONE=@@TIME_ZONE */;
/*!40103 SET TIME_ZONE='+00:00' */;
/*!40014 SET @OLD_UNIQUE_CHECKS=@@UNIQUE_CHECKS, UNIQUE_CHECKS=0 */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;
/*!40111 SET @OLD_SQL_NOTES=@@SQL_NOTES, SQL_NOTES=0 */;

--
-- Table structure for table `activity_log`
--

DROP TABLE IF EXISTS `activity_log`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `activity_log` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `log_name` varchar(191) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `description` text COLLATE utf8mb4_unicode_ci NOT NULL,
  `subject_type` varchar(191) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `event` varchar(191) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `subject_id` bigint unsigned DEFAULT NULL,
  `causer_type` varchar(191) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `causer_id` bigint unsigned DEFAULT NULL,
  `properties` json DEFAULT NULL,
  `batch_uuid` char(36) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `subject` (`subject_type`,`subject_id`),
  KEY `causer` (`causer_type`,`causer_id`),
  KEY `activity_log_log_name_index` (`log_name`)
) ENGINE=MyISAM AUTO_INCREMENT=21 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `activity_log`
--

LOCK TABLES `activity_log` WRITE;
/*!40000 ALTER TABLE `activity_log` DISABLE KEYS */;
INSERT INTO `activity_log` VALUES (1,'default','created','App\\Models\\PortfolioProject','created',1,NULL,NULL,'{\"attributes\": {\"title\": \"E-Commerce Platform\", \"status\": \"completed\", \"category\": \"Web Development\", \"featured\": true, \"sort_order\": 1, \"description\": \"A full-featured e-commerce platform with inventory management, payment processing, and order tracking.\"}}',NULL,'2026-01-07 09:22:13','2026-01-07 09:22:13'),(2,'default','created','App\\Models\\PortfolioProject','created',2,NULL,NULL,'{\"attributes\": {\"title\": \"Corporate Website Redesign\", \"status\": \"completed\", \"category\": \"Web Design\", \"featured\": true, \"sort_order\": 2, \"description\": \"Complete redesign of a corporate website with modern UI/UX, responsive design, and CMS integration.\"}}',NULL,'2026-01-07 09:22:13','2026-01-07 09:22:13'),(3,'default','created','App\\Models\\PortfolioProject','created',3,NULL,NULL,'{\"attributes\": {\"title\": \"Real Estate Portal\", \"status\": \"completed\", \"category\": \"Web Application\", \"featured\": false, \"sort_order\": 3, \"description\": \"Property listing platform with advanced search, virtual tours, and agent management system.\"}}',NULL,'2026-01-07 09:22:13','2026-01-07 09:22:13'),(4,'default','created','App\\Models\\PortfolioProject','created',4,NULL,NULL,'{\"attributes\": {\"title\": \"Restaurant Booking System\", \"status\": \"completed\", \"category\": \"Web Application\", \"featured\": true, \"sort_order\": 4, \"description\": \"Online reservation system with table management, menu display, and customer notifications.\"}}',NULL,'2026-01-07 09:22:13','2026-01-07 09:22:13'),(5,'default','created','App\\Models\\PortfolioProject','created',5,NULL,NULL,'{\"attributes\": {\"title\": \"Healthcare Dashboard\", \"status\": \"in_progress\", \"category\": \"Dashboard\", \"featured\": false, \"sort_order\": 5, \"description\": \"Admin dashboard for healthcare facility with patient management and appointment scheduling.\"}}',NULL,'2026-01-07 09:22:13','2026-01-07 09:22:13'),(6,'default','created','App\\Models\\PortfolioProject','created',6,NULL,NULL,'{\"attributes\": {\"title\": \"Event Management Platform\", \"status\": \"completed\", \"category\": \"Web Application\", \"featured\": false, \"sort_order\": 6, \"description\": \"Comprehensive event planning and ticketing platform with attendee management.\"}}',NULL,'2026-01-07 09:22:13','2026-01-07 09:22:13'),(7,'default','created','App\\Models\\ContactSubmission','created',1,NULL,NULL,'{\"attributes\": {\"name\": \"John Doe\", \"email\": \"john@example.com\", \"status\": \"pending\", \"admin_message\": null, \"consultation_date\": \"2026-01-10T00:00:00.000000Z\", \"consultation_time\": \"10:00:00\"}}',NULL,'2026-01-07 09:22:13','2026-01-07 09:22:13'),(8,'default','created','App\\Models\\ContactSubmission','created',2,NULL,NULL,'{\"attributes\": {\"name\": \"Jane Smith\", \"email\": \"jane@company.com\", \"status\": \"accepted\", \"admin_message\": null, \"consultation_date\": null, \"consultation_time\": null}}',NULL,'2026-01-07 09:22:13','2026-01-07 09:22:13'),(9,'default','created','App\\Models\\ContactSubmission','created',3,NULL,NULL,'{\"attributes\": {\"name\": \"Mike Johnson\", \"email\": \"mike@startup.io\", \"status\": \"completed\", \"admin_message\": null, \"consultation_date\": null, \"consultation_time\": null}}',NULL,'2026-01-07 09:22:13','2026-01-07 09:22:13'),(10,'default','created','App\\Models\\HeroSlide','created',1,NULL,NULL,'{\"attributes\": {\"text\": \"Design first. Function always.\", \"label\": \"Design\", \"subtitle\": \"Simple, purposeful interfaces.\", \"image_url\": \"/images/hero/1.jpg\", \"sort_order\": 1, \"overlay_opacity\": 0.4}}',NULL,'2026-01-07 09:41:30','2026-01-07 09:41:30'),(11,'default','created','App\\Models\\HeroSlide','created',2,NULL,NULL,'{\"attributes\": {\"text\": \"Smart, stylish, purposeful.\", \"label\": \"Style\", \"subtitle\": \"Aesthetic clarity that supports goals.\", \"image_url\": \"/images/hero/2.jpg\", \"sort_order\": 2, \"overlay_opacity\": 0.4}}',NULL,'2026-01-07 09:41:30','2026-01-07 09:41:30'),(12,'default','created','App\\Models\\HeroSlide','created',3,NULL,NULL,'{\"attributes\": {\"text\": \"Human‑centered UX.\", \"label\": \"Interactive\", \"subtitle\": \"Guided by empathy and behavior.\", \"image_url\": \"/images/hero/3.jpg\", \"sort_order\": 3, \"overlay_opacity\": 0.4}}',NULL,'2026-01-07 09:41:30','2026-01-07 09:41:30'),(13,'default','created','App\\Models\\HeroSlide','created',4,NULL,NULL,'{\"attributes\": {\"text\": \"Fast, responsive, accessible.\", \"label\": \"Speed\", \"subtitle\": \"Performance and accessibility first.\", \"image_url\": \"/images/hero/4.jpg\", \"sort_order\": 4, \"overlay_opacity\": 0.4}}',NULL,'2026-01-07 09:41:31','2026-01-07 09:41:31'),(14,'default','created','App\\Models\\HeroSlide','created',5,NULL,NULL,'{\"attributes\": {\"text\": \"From idea to launch.\", \"label\": \"Deploy\", \"subtitle\": \"From code to production with confidence.\", \"image_url\": \"/images/hero/5.jpg\", \"sort_order\": 5, \"overlay_opacity\": 0.4}}',NULL,'2026-01-07 09:41:31','2026-01-07 09:41:31'),(15,'default','created','App\\Models\\HeroSlide','created',6,NULL,NULL,'{\"attributes\": {\"text\": \"Built to scale.\", \"label\": \"Scale\", \"subtitle\": \"Built for growth and maintainability.\", \"image_url\": \"/images/hero/6.jpg\", \"sort_order\": 6, \"overlay_opacity\": 0.4}}',NULL,'2026-01-07 09:41:31','2026-01-07 09:41:31'),(16,'default','created','App\\Models\\HeroSlide','created',7,NULL,NULL,'{\"attributes\": {\"text\": \"Meet the Developer.\", \"label\": \"Bookings\", \"subtitle\": \"\", \"image_url\": \"/images/hero/7.jpg\", \"sort_order\": 7, \"overlay_opacity\": 0.4}}',NULL,'2026-01-07 09:41:31','2026-01-07 09:41:31'),(17,'default','updated','App\\Models\\HeroSlide','updated',7,'App\\Models\\User',1,'{\"old\": {\"subtitle\": \"\", \"overlay_opacity\": 0.4}, \"attributes\": {\"subtitle\": null, \"overlay_opacity\": 0.2}}',NULL,'2026-01-07 09:50:16','2026-01-07 09:50:16'),(18,'default','updated','App\\Models\\HeroSlide','updated',7,NULL,NULL,'{\"old\": {\"subtitle\": null}, \"attributes\": {\"subtitle\": \"\"}}',NULL,'2026-01-07 10:50:23','2026-01-07 10:50:23'),(19,'default','created','App\\Models\\TrustedClient','created',1,'App\\Models\\User',1,'{\"attributes\": {\"name\": \"OKJSyle\", \"logo_url\": null, \"is_active\": true, \"sort_order\": 1, \"website_url\": \"http://www.okjstyle.co.ke\"}}',NULL,'2026-01-07 11:07:50','2026-01-07 11:07:50'),(20,'default','updated','App\\Models\\TrustedClient','updated',1,'App\\Models\\User',1,'{\"old\": {\"logo_url\": null}, \"attributes\": {\"logo_url\": \"http://localhost:8000/storage/trusted-clients/mE7kronGaDMIToWRrTdmaRXTRvAFl5IrqgsZQ2Oq.png\"}}',NULL,'2026-01-07 11:08:12','2026-01-07 11:08:12');
/*!40000 ALTER TABLE `activity_log` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `analytics_clicks`
--

DROP TABLE IF EXISTS `analytics_clicks`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `analytics_clicks` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `element_id` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `element_type` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `page` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `ip_address` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `session_id` varchar(191) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `x_position` int DEFAULT NULL,
  `y_position` int DEFAULT NULL,
  `clicked_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `analytics_clicks_page_clicked_at_index` (`page`,`clicked_at`)
) ENGINE=MyISAM DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `analytics_clicks`
--

LOCK TABLES `analytics_clicks` WRITE;
/*!40000 ALTER TABLE `analytics_clicks` DISABLE KEYS */;
/*!40000 ALTER TABLE `analytics_clicks` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `analytics_form_submissions`
--

DROP TABLE IF EXISTS `analytics_form_submissions`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `analytics_form_submissions` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `form_type` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `success` tinyint(1) NOT NULL DEFAULT '0',
  `page` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `ip_address` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `session_id` varchar(191) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `submitted_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=MyISAM DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `analytics_form_submissions`
--

LOCK TABLES `analytics_form_submissions` WRITE;
/*!40000 ALTER TABLE `analytics_form_submissions` DISABLE KEYS */;
/*!40000 ALTER TABLE `analytics_form_submissions` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `analytics_page_visits`
--

DROP TABLE IF EXISTS `analytics_page_visits`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `analytics_page_visits` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `page` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `ip_address` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `user_agent` text COLLATE utf8mb4_unicode_ci,
  `referrer` varchar(191) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `session_id` varchar(191) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `visited_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `analytics_page_visits_page_visited_at_index` (`page`,`visited_at`),
  KEY `analytics_page_visits_session_id_index` (`session_id`)
) ENGINE=MyISAM AUTO_INCREMENT=75 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `analytics_page_visits`
--

LOCK TABLES `analytics_page_visits` WRITE;
/*!40000 ALTER TABLE `analytics_page_visits` DISABLE KEYS */;
INSERT INTO `analytics_page_visits` VALUES (1,'/','127.0.0.1','Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/143.0.0.0 Safari/537.36','http://localhost:3000/',NULL,'2026-01-07 09:23:10','2026-01-07 09:23:10','2026-01-07 09:23:10'),(2,'/','127.0.0.1','Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/143.0.0.0 Safari/537.36','http://localhost:3000/',NULL,'2026-01-07 09:23:10','2026-01-07 09:23:10','2026-01-07 09:23:10'),(3,'/','127.0.0.1','Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/143.0.0.0 Safari/537.36','http://localhost:3000/',NULL,'2026-01-07 09:24:12','2026-01-07 09:24:12','2026-01-07 09:24:12'),(4,'/','127.0.0.1','Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/143.0.0.0 Safari/537.36','http://localhost:3000/',NULL,'2026-01-07 09:24:12','2026-01-07 09:24:12','2026-01-07 09:24:12'),(5,'/','127.0.0.1','Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/143.0.0.0 Safari/537.36','http://localhost:3000/',NULL,'2026-01-07 09:32:05','2026-01-07 09:32:05','2026-01-07 09:32:05'),(6,'/','127.0.0.1','Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/143.0.0.0 Safari/537.36','http://localhost:3000/',NULL,'2026-01-07 09:32:05','2026-01-07 09:32:05','2026-01-07 09:32:05'),(7,'/','127.0.0.1','Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/143.0.0.0 Safari/537.36','http://localhost:3000/',NULL,'2026-01-07 09:50:28','2026-01-07 09:50:28','2026-01-07 09:50:28'),(8,'/','127.0.0.1','Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/143.0.0.0 Safari/537.36','http://localhost:3000/',NULL,'2026-01-07 09:50:28','2026-01-07 09:50:28','2026-01-07 09:50:28'),(9,'/contact','127.0.0.1','Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/143.0.0.0 Safari/537.36','http://localhost:3000/',NULL,'2026-01-07 09:54:28','2026-01-07 09:54:28','2026-01-07 09:54:28'),(10,'/contact','127.0.0.1','Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/143.0.0.0 Safari/537.36','http://localhost:3000/',NULL,'2026-01-07 09:54:28','2026-01-07 09:54:28','2026-01-07 09:54:28'),(11,'/portfolio','127.0.0.1','Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/143.0.0.0 Safari/537.36','http://localhost:3000/',NULL,'2026-01-07 09:56:04','2026-01-07 09:56:04','2026-01-07 09:56:04'),(12,'/portfolio','127.0.0.1','Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/143.0.0.0 Safari/537.36','http://localhost:3000/',NULL,'2026-01-07 09:56:04','2026-01-07 09:56:04','2026-01-07 09:56:04'),(13,'/contact','127.0.0.1','Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/143.0.0.0 Safari/537.36','http://localhost:3000/',NULL,'2026-01-07 09:56:17','2026-01-07 09:56:17','2026-01-07 09:56:17'),(14,'/contact','127.0.0.1','Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/143.0.0.0 Safari/537.36','http://localhost:3000/',NULL,'2026-01-07 09:56:17','2026-01-07 09:56:17','2026-01-07 09:56:17'),(15,'/portfolio','127.0.0.1','Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/143.0.0.0 Safari/537.36','http://localhost:3000/',NULL,'2026-01-07 09:56:26','2026-01-07 09:56:26','2026-01-07 09:56:26'),(16,'/portfolio','127.0.0.1','Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/143.0.0.0 Safari/537.36','http://localhost:3000/',NULL,'2026-01-07 09:56:27','2026-01-07 09:56:27','2026-01-07 09:56:27'),(17,'/','127.0.0.1','Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/143.0.0.0 Safari/537.36','http://localhost:3000/',NULL,'2026-01-07 09:57:56','2026-01-07 09:57:56','2026-01-07 09:57:56'),(18,'/','127.0.0.1','Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/143.0.0.0 Safari/537.36','http://localhost:3000/',NULL,'2026-01-07 09:57:56','2026-01-07 09:57:56','2026-01-07 09:57:56'),(19,'/contact','127.0.0.1','Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/143.0.0.0 Safari/537.36','http://localhost:3000/',NULL,'2026-01-07 10:06:30','2026-01-07 10:06:30','2026-01-07 10:06:30'),(20,'/contact','127.0.0.1','Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/143.0.0.0 Safari/537.36','http://localhost:3000/',NULL,'2026-01-07 10:06:30','2026-01-07 10:06:30','2026-01-07 10:06:30'),(21,'/','127.0.0.1','Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/143.0.0.0 Safari/537.36','http://localhost:3000/',NULL,'2026-01-07 10:06:43','2026-01-07 10:06:43','2026-01-07 10:06:43'),(22,'/','127.0.0.1','Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/143.0.0.0 Safari/537.36','http://localhost:3000/',NULL,'2026-01-07 10:06:43','2026-01-07 10:06:43','2026-01-07 10:06:43'),(23,'/','127.0.0.1','Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/143.0.0.0 Safari/537.36','http://localhost:3000/',NULL,'2026-01-07 10:10:12','2026-01-07 10:10:12','2026-01-07 10:10:12'),(24,'/','127.0.0.1','Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/143.0.0.0 Safari/537.36','http://localhost:3000/',NULL,'2026-01-07 10:10:12','2026-01-07 10:10:12','2026-01-07 10:10:12'),(25,'/','127.0.0.1','Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/143.0.0.0 Safari/537.36','http://localhost:3000/',NULL,'2026-01-07 10:12:52','2026-01-07 10:12:52','2026-01-07 10:12:52'),(26,'/','127.0.0.1','Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/143.0.0.0 Safari/537.36','http://localhost:3000/',NULL,'2026-01-07 10:12:52','2026-01-07 10:12:52','2026-01-07 10:12:52'),(27,'/','127.0.0.1','Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/143.0.0.0 Safari/537.36','http://localhost:3000/',NULL,'2026-01-07 10:14:27','2026-01-07 10:14:27','2026-01-07 10:14:27'),(28,'/','127.0.0.1','Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/143.0.0.0 Safari/537.36','http://localhost:3000/',NULL,'2026-01-07 10:14:28','2026-01-07 10:14:28','2026-01-07 10:14:28'),(29,'/','127.0.0.1','Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/143.0.0.0 Safari/537.36','http://localhost:3000/',NULL,'2026-01-07 10:18:50','2026-01-07 10:18:50','2026-01-07 10:18:50'),(30,'/','127.0.0.1','Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/143.0.0.0 Safari/537.36','http://localhost:3000/',NULL,'2026-01-07 10:18:50','2026-01-07 10:18:50','2026-01-07 10:18:50'),(31,'/','127.0.0.1','Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/143.0.0.0 Safari/537.36','http://localhost:3000/',NULL,'2026-01-07 10:20:52','2026-01-07 10:20:52','2026-01-07 10:20:52'),(32,'/','127.0.0.1','Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/143.0.0.0 Safari/537.36','http://localhost:3000/',NULL,'2026-01-07 10:20:52','2026-01-07 10:20:52','2026-01-07 10:20:52'),(33,'/','127.0.0.1','Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/143.0.0.0 Safari/537.36','http://localhost:3000/',NULL,'2026-01-07 10:53:50','2026-01-07 10:53:50','2026-01-07 10:53:50'),(34,'/','127.0.0.1','Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/143.0.0.0 Safari/537.36','http://localhost:3000/',NULL,'2026-01-07 10:53:50','2026-01-07 10:53:50','2026-01-07 10:53:50'),(35,'/portfolio','127.0.0.1','Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/143.0.0.0 Safari/537.36','http://localhost:3000/',NULL,'2026-01-07 10:54:34','2026-01-07 10:54:34','2026-01-07 10:54:34'),(36,'/portfolio','127.0.0.1','Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/143.0.0.0 Safari/537.36','http://localhost:3000/',NULL,'2026-01-07 10:54:34','2026-01-07 10:54:34','2026-01-07 10:54:34'),(37,'/','127.0.0.1','Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/143.0.0.0 Safari/537.36','http://localhost:3000/',NULL,'2026-01-07 11:08:29','2026-01-07 11:08:29','2026-01-07 11:08:29'),(38,'/','127.0.0.1','Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/143.0.0.0 Safari/537.36','http://localhost:3000/',NULL,'2026-01-07 11:08:29','2026-01-07 11:08:29','2026-01-07 11:08:29'),(39,'/portfolio','127.0.0.1','Mozilla/5.0 (Linux; Android 6.0; Nexus 5 Build/MRA58N) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/143.0.0.0 Mobile Safari/537.36','http://localhost:3000/',NULL,'2026-01-07 11:15:41','2026-01-07 11:15:41','2026-01-07 11:15:41'),(40,'/portfolio','127.0.0.1','Mozilla/5.0 (Linux; Android 6.0; Nexus 5 Build/MRA58N) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/143.0.0.0 Mobile Safari/537.36','http://localhost:3000/',NULL,'2026-01-07 11:15:41','2026-01-07 11:15:41','2026-01-07 11:15:41'),(41,'/contact','127.0.0.1','Mozilla/5.0 (Linux; Android 6.0; Nexus 5 Build/MRA58N) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/143.0.0.0 Mobile Safari/537.36','http://localhost:3000/',NULL,'2026-01-07 11:15:58','2026-01-07 11:15:58','2026-01-07 11:15:58'),(42,'/contact','127.0.0.1','Mozilla/5.0 (Linux; Android 6.0; Nexus 5 Build/MRA58N) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/143.0.0.0 Mobile Safari/537.36','http://localhost:3000/',NULL,'2026-01-07 11:15:58','2026-01-07 11:15:58','2026-01-07 11:15:58'),(43,'/','127.0.0.1','Mozilla/5.0 (Linux; Android 6.0; Nexus 5 Build/MRA58N) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/143.0.0.0 Mobile Safari/537.36','http://localhost:3000/',NULL,'2026-01-07 11:17:24','2026-01-07 11:17:24','2026-01-07 11:17:24'),(44,'/','127.0.0.1','Mozilla/5.0 (Linux; Android 6.0; Nexus 5 Build/MRA58N) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/143.0.0.0 Mobile Safari/537.36','http://localhost:3000/',NULL,'2026-01-07 11:17:24','2026-01-07 11:17:24','2026-01-07 11:17:24'),(45,'/portfolio','127.0.0.1','Mozilla/5.0 (Linux; Android 6.0; Nexus 5 Build/MRA58N) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/143.0.0.0 Mobile Safari/537.36','http://localhost:3000/',NULL,'2026-01-07 11:17:44','2026-01-07 11:17:44','2026-01-07 11:17:44'),(46,'/portfolio','127.0.0.1','Mozilla/5.0 (Linux; Android 6.0; Nexus 5 Build/MRA58N) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/143.0.0.0 Mobile Safari/537.36','http://localhost:3000/',NULL,'2026-01-07 11:17:44','2026-01-07 11:17:44','2026-01-07 11:17:44'),(47,'/portfolio','127.0.0.1','Mozilla/5.0 (Linux; Android 6.0; Nexus 5 Build/MRA58N) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/143.0.0.0 Mobile Safari/537.36','http://localhost:3000/',NULL,'2026-01-07 11:23:27','2026-01-07 11:23:27','2026-01-07 11:23:27'),(48,'/portfolio','127.0.0.1','Mozilla/5.0 (Linux; Android 6.0; Nexus 5 Build/MRA58N) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/143.0.0.0 Mobile Safari/537.36','http://localhost:3000/',NULL,'2026-01-07 11:23:28','2026-01-07 11:23:28','2026-01-07 11:23:28'),(49,'/','127.0.0.1','Mozilla/5.0 (Linux; Android 6.0; Nexus 5 Build/MRA58N) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/143.0.0.0 Mobile Safari/537.36','http://localhost:3000/',NULL,'2026-01-07 11:23:44','2026-01-07 11:23:44','2026-01-07 11:23:44'),(50,'/','127.0.0.1','Mozilla/5.0 (Linux; Android 6.0; Nexus 5 Build/MRA58N) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/143.0.0.0 Mobile Safari/537.36','http://localhost:3000/',NULL,'2026-01-07 11:23:44','2026-01-07 11:23:44','2026-01-07 11:23:44'),(51,'/portfolio','127.0.0.1','Mozilla/5.0 (Linux; Android 6.0; Nexus 5 Build/MRA58N) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/143.0.0.0 Mobile Safari/537.36','http://localhost:3000/',NULL,'2026-01-07 11:23:52','2026-01-07 11:23:52','2026-01-07 11:23:52'),(52,'/portfolio','127.0.0.1','Mozilla/5.0 (Linux; Android 6.0; Nexus 5 Build/MRA58N) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/143.0.0.0 Mobile Safari/537.36','http://localhost:3000/',NULL,'2026-01-07 11:23:53','2026-01-07 11:23:53','2026-01-07 11:23:53'),(53,'/','127.0.0.1','Mozilla/5.0 (Linux; Android 6.0; Nexus 5 Build/MRA58N) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/143.0.0.0 Mobile Safari/537.36','http://localhost:3000/',NULL,'2026-01-07 11:24:06','2026-01-07 11:24:06','2026-01-07 11:24:06'),(54,'/','127.0.0.1','Mozilla/5.0 (Linux; Android 6.0; Nexus 5 Build/MRA58N) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/143.0.0.0 Mobile Safari/537.36','http://localhost:3000/',NULL,'2026-01-07 11:24:06','2026-01-07 11:24:06','2026-01-07 11:24:06'),(55,'/contact','127.0.0.1','Mozilla/5.0 (Linux; Android 6.0; Nexus 5 Build/MRA58N) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/143.0.0.0 Mobile Safari/537.36','http://localhost:3000/',NULL,'2026-01-07 11:25:26','2026-01-07 11:25:26','2026-01-07 11:25:26'),(56,'/contact','127.0.0.1','Mozilla/5.0 (Linux; Android 6.0; Nexus 5 Build/MRA58N) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/143.0.0.0 Mobile Safari/537.36','http://localhost:3000/',NULL,'2026-01-07 11:25:26','2026-01-07 11:25:26','2026-01-07 11:25:26'),(57,'/portfolio','127.0.0.1','Mozilla/5.0 (Linux; Android 6.0; Nexus 5 Build/MRA58N) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/143.0.0.0 Mobile Safari/537.36','http://localhost:3000/',NULL,'2026-01-07 11:25:39','2026-01-07 11:25:39','2026-01-07 11:25:39'),(58,'/portfolio','127.0.0.1','Mozilla/5.0 (Linux; Android 6.0; Nexus 5 Build/MRA58N) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/143.0.0.0 Mobile Safari/537.36','http://localhost:3000/',NULL,'2026-01-07 11:25:39','2026-01-07 11:25:39','2026-01-07 11:25:39'),(59,'/','127.0.0.1','Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/143.0.0.0 Safari/537.36','http://localhost:3000/',NULL,'2026-01-07 11:26:57','2026-01-07 11:26:57','2026-01-07 11:26:57'),(60,'/','127.0.0.1','Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/143.0.0.0 Safari/537.36','http://localhost:3000/',NULL,'2026-01-07 11:26:57','2026-01-07 11:26:57','2026-01-07 11:26:57'),(61,'/portfolio','127.0.0.1','Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/143.0.0.0 Safari/537.36','http://localhost:3000/',NULL,'2026-01-07 11:30:43','2026-01-07 11:30:43','2026-01-07 11:30:43'),(62,'/portfolio','127.0.0.1','Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/143.0.0.0 Safari/537.36','http://localhost:3000/',NULL,'2026-01-07 11:30:43','2026-01-07 11:30:43','2026-01-07 11:30:43'),(63,'/','127.0.0.1','Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/143.0.0.0 Safari/537.36','http://localhost:3000/',NULL,'2026-01-07 11:30:59','2026-01-07 11:30:59','2026-01-07 11:30:59'),(64,'/','127.0.0.1','Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/143.0.0.0 Safari/537.36','http://localhost:3000/',NULL,'2026-01-07 11:30:59','2026-01-07 11:30:59','2026-01-07 11:30:59'),(65,'/portfolio','127.0.0.1','Mozilla/5.0 (Linux; Android 6.0; Nexus 5 Build/MRA58N) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/143.0.0.0 Mobile Safari/537.36','http://localhost:3000/',NULL,'2026-01-07 11:31:21','2026-01-07 11:31:21','2026-01-07 11:31:21'),(66,'/portfolio','127.0.0.1','Mozilla/5.0 (Linux; Android 6.0; Nexus 5 Build/MRA58N) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/143.0.0.0 Mobile Safari/537.36','http://localhost:3000/',NULL,'2026-01-07 11:31:22','2026-01-07 11:31:22','2026-01-07 11:31:22'),(67,'/','127.0.0.1','Mozilla/5.0 (Linux; Android 6.0; Nexus 5 Build/MRA58N) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/143.0.0.0 Mobile Safari/537.36','http://localhost:3000/',NULL,'2026-01-07 11:32:02','2026-01-07 11:32:02','2026-01-07 11:32:02'),(68,'/','127.0.0.1','Mozilla/5.0 (Linux; Android 6.0; Nexus 5 Build/MRA58N) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/143.0.0.0 Mobile Safari/537.36','http://localhost:3000/',NULL,'2026-01-07 11:32:02','2026-01-07 11:32:02','2026-01-07 11:32:02'),(69,'/portfolio','127.0.0.1','Mozilla/5.0 (Linux; Android 6.0; Nexus 5 Build/MRA58N) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/143.0.0.0 Mobile Safari/537.36','http://localhost:3000/',NULL,'2026-01-07 11:48:24','2026-01-07 11:48:24','2026-01-07 11:48:24'),(70,'/portfolio','127.0.0.1','Mozilla/5.0 (Linux; Android 6.0; Nexus 5 Build/MRA58N) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/143.0.0.0 Mobile Safari/537.36','http://localhost:3000/',NULL,'2026-01-07 11:48:24','2026-01-07 11:48:24','2026-01-07 11:48:24'),(71,'/','127.0.0.1','Mozilla/5.0 (Linux; Android 6.0; Nexus 5 Build/MRA58N) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/143.0.0.0 Mobile Safari/537.36','http://localhost:3000/',NULL,'2026-01-07 11:48:34','2026-01-07 11:48:34','2026-01-07 11:48:34'),(72,'/','127.0.0.1','Mozilla/5.0 (Linux; Android 6.0; Nexus 5 Build/MRA58N) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/143.0.0.0 Mobile Safari/537.36','http://localhost:3000/',NULL,'2026-01-07 11:48:34','2026-01-07 11:48:34','2026-01-07 11:48:34'),(73,'/','127.0.0.1','Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/143.0.0.0 Safari/537.36','http://localhost:3000/',NULL,'2026-01-07 12:08:58','2026-01-07 12:08:58','2026-01-07 12:08:58'),(74,'/','127.0.0.1','Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/143.0.0.0 Safari/537.36','http://localhost:3000/',NULL,'2026-01-07 12:08:58','2026-01-07 12:08:58','2026-01-07 12:08:58');
/*!40000 ALTER TABLE `analytics_page_visits` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `analytics_sessions`
--

DROP TABLE IF EXISTS `analytics_sessions`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `analytics_sessions` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `session_id` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `ip_address` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `user_agent` text COLLATE utf8mb4_unicode_ci,
  `start_time` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `end_time` timestamp NULL DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `analytics_sessions_session_id_unique` (`session_id`),
  KEY `analytics_sessions_session_id_index` (`session_id`)
) ENGINE=MyISAM DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `analytics_sessions`
--

LOCK TABLES `analytics_sessions` WRITE;
/*!40000 ALTER TABLE `analytics_sessions` DISABLE KEYS */;
/*!40000 ALTER TABLE `analytics_sessions` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `cache`
--

DROP TABLE IF EXISTS `cache`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `cache` (
  `key` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `value` mediumtext COLLATE utf8mb4_unicode_ci NOT NULL,
  `expiration` int NOT NULL,
  PRIMARY KEY (`key`)
) ENGINE=MyISAM DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `cache`
--

LOCK TABLES `cache` WRITE;
/*!40000 ALTER TABLE `cache` DISABLE KEYS */;
/*!40000 ALTER TABLE `cache` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `cache_locks`
--

DROP TABLE IF EXISTS `cache_locks`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `cache_locks` (
  `key` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `owner` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `expiration` int NOT NULL,
  PRIMARY KEY (`key`)
) ENGINE=MyISAM DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `cache_locks`
--

LOCK TABLES `cache_locks` WRITE;
/*!40000 ALTER TABLE `cache_locks` DISABLE KEYS */;
/*!40000 ALTER TABLE `cache_locks` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `comments`
--

DROP TABLE IF EXISTS `comments`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `comments` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `commentable_type` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `commentable_id` bigint unsigned NOT NULL,
  `body` text COLLATE utf8mb4_unicode_ci NOT NULL,
  `author_name` varchar(191) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `author_email` varchar(191) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `created_by` bigint unsigned DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `comments_commentable_type_commentable_id_index` (`commentable_type`,`commentable_id`),
  KEY `comments_created_by_foreign` (`created_by`)
) ENGINE=MyISAM DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `comments`
--

LOCK TABLES `comments` WRITE;
/*!40000 ALTER TABLE `comments` DISABLE KEYS */;
/*!40000 ALTER TABLE `comments` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `contact_submissions`
--

DROP TABLE IF EXISTS `contact_submissions`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `contact_submissions` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `name` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `email` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `phone` varchar(191) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `country_code` varchar(191) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `phone_number` varchar(191) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `contact_method` enum('email','whatsapp') COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'email',
  `online_consultation` tinyint(1) NOT NULL DEFAULT '0',
  `consultation_date` date DEFAULT NULL,
  `consultation_time` time DEFAULT NULL,
  `message` text COLLATE utf8mb4_unicode_ci,
  `consent` tinyint(1) NOT NULL DEFAULT '0',
  `ip_address` varchar(191) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `processed` tinyint(1) NOT NULL DEFAULT '0',
  `status` enum('pending','accepted','postponed','cancelled','completed') COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'pending',
  `admin_message` text COLLATE utf8mb4_unicode_ci,
  `status_updated_at` timestamp NULL DEFAULT NULL,
  `updated_by` varchar(191) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `submitted_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=MyISAM AUTO_INCREMENT=4 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `contact_submissions`
--

LOCK TABLES `contact_submissions` WRITE;
/*!40000 ALTER TABLE `contact_submissions` DISABLE KEYS */;
INSERT INTO `contact_submissions` VALUES (1,'John Doe','john@example.com',NULL,NULL,NULL,'email',1,'2026-01-10','10:00:00','I need a website for my new startup. Looking for modern design with e-commerce functionality.',1,NULL,0,'pending',NULL,NULL,NULL,'2026-01-07 12:22:13','2026-01-07 09:22:13','2026-01-07 09:22:13'),(2,'Jane Smith','jane@company.com',NULL,'+254','0712345678','whatsapp',0,NULL,NULL,'Interested in a portfolio website redesign. Current site needs a refresh.',1,NULL,0,'accepted',NULL,NULL,NULL,'2026-01-07 12:22:13','2026-01-07 09:22:13','2026-01-07 09:22:13'),(3,'Mike Johnson','mike@startup.io',NULL,NULL,NULL,'email',0,NULL,NULL,'Looking for a full-stack developer for a 3-month project. Budget is flexible.',1,NULL,0,'completed',NULL,NULL,NULL,'2026-01-07 12:22:13','2026-01-07 09:22:13','2026-01-07 09:22:13');
/*!40000 ALTER TABLE `contact_submissions` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `failed_jobs`
--

DROP TABLE IF EXISTS `failed_jobs`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `failed_jobs` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `uuid` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `connection` text COLLATE utf8mb4_unicode_ci NOT NULL,
  `queue` text COLLATE utf8mb4_unicode_ci NOT NULL,
  `payload` longtext COLLATE utf8mb4_unicode_ci NOT NULL,
  `exception` longtext COLLATE utf8mb4_unicode_ci NOT NULL,
  `failed_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `failed_jobs_uuid_unique` (`uuid`)
) ENGINE=MyISAM DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `failed_jobs`
--

LOCK TABLES `failed_jobs` WRITE;
/*!40000 ALTER TABLE `failed_jobs` DISABLE KEYS */;
/*!40000 ALTER TABLE `failed_jobs` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `hero_slides`
--

DROP TABLE IF EXISTS `hero_slides`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `hero_slides` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `label` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT '',
  `text` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `subtitle` varchar(191) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `testimonial_text` text COLLATE utf8mb4_unicode_ci,
  `testimonial_author` varchar(191) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `testimonial_company` varchar(191) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `overlay_opacity` double NOT NULL DEFAULT '0.4',
  `sort_order` int NOT NULL DEFAULT '0',
  `image_url` varchar(191) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=MyISAM AUTO_INCREMENT=8 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `hero_slides`
--

LOCK TABLES `hero_slides` WRITE;
/*!40000 ALTER TABLE `hero_slides` DISABLE KEYS */;
INSERT INTO `hero_slides` VALUES (1,'Design','Design first. Function always.','Simple, purposeful interfaces.','Absolutely breathtaking interfaces. Unique and not like anything that exists','Luigi Sewe','Obam & Sewe Advocates',0.4,1,'/images/hero/1.jpg','2026-01-07 09:41:30','2026-01-07 10:20:39'),(2,'Style','Smart, stylish, purposeful.','Aesthetic clarity that supports goals.','Aesthetic clarity is their hallmark. They don\'t just build sites; they craft visual identities that resonate deeply.','Sarah Jenkins','Creative Director at Nexus',0.4,2,'/images/hero/2.jpg','2026-01-07 09:41:30','2026-01-07 10:50:23'),(3,'Interactive','Human‑centered UX.','Guided by empathy and behavior.','Our user engagement went up by 40% thanks to the intuitive flow designed by the team. Truly human-centered.','Michael Chen','CTO at FinStream',0.4,3,'/images/hero/3.jpg','2026-01-07 09:41:30','2026-01-07 10:50:23'),(4,'Speed','Fast, responsive, accessible.','Performance and accessibility first.','We needed lightning-fast load times for our global audience, and they delivered. The performance is seamless.','James Klovsky','Lead Developer at Velocita',0.4,4,'/images/hero/4.jpg','2026-01-07 09:41:31','2026-01-07 10:50:23'),(5,'Deploy','From idea to launch.','From code to production with confidence.','The transition from concept to live production was flawless. Exceptional confidence in their deployment pipelines.','Elena Rodriguez','Founder of StartupX',0.4,5,'/images/hero/5.jpg','2026-01-07 09:41:31','2026-01-07 10:50:23'),(6,'Scale','Built to scale.','Built for growth and maintainability.','Our platform grew from 1k to 100k users without a hitch. The architecture implemented is rock solid.','David Okafor','CEO at Scalable Systems',0.4,6,'/images/hero/6.jpg','2026-01-07 09:41:31','2026-01-07 10:50:23'),(7,'Bookings','Meet the Developer.','','Working with him was a breeze. Professional, punctual, and highly skilled. Highly recommend for any serious project.','Amanda Lee','Project Manager',0.2,7,'/images/hero/7.jpg','2026-01-07 09:41:31','2026-01-07 10:50:23');
/*!40000 ALTER TABLE `hero_slides` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `job_batches`
--

DROP TABLE IF EXISTS `job_batches`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `job_batches` (
  `id` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `name` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `total_jobs` int NOT NULL,
  `pending_jobs` int NOT NULL,
  `failed_jobs` int NOT NULL,
  `failed_job_ids` longtext COLLATE utf8mb4_unicode_ci NOT NULL,
  `options` mediumtext COLLATE utf8mb4_unicode_ci,
  `cancelled_at` int DEFAULT NULL,
  `created_at` int NOT NULL,
  `finished_at` int DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=MyISAM DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `job_batches`
--

LOCK TABLES `job_batches` WRITE;
/*!40000 ALTER TABLE `job_batches` DISABLE KEYS */;
/*!40000 ALTER TABLE `job_batches` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `jobs`
--

DROP TABLE IF EXISTS `jobs`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `jobs` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `queue` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `payload` longtext COLLATE utf8mb4_unicode_ci NOT NULL,
  `attempts` tinyint unsigned NOT NULL,
  `reserved_at` int unsigned DEFAULT NULL,
  `available_at` int unsigned NOT NULL,
  `created_at` int unsigned NOT NULL,
  PRIMARY KEY (`id`),
  KEY `jobs_queue_index` (`queue`)
) ENGINE=MyISAM DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `jobs`
--

LOCK TABLES `jobs` WRITE;
/*!40000 ALTER TABLE `jobs` DISABLE KEYS */;
/*!40000 ALTER TABLE `jobs` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `media`
--

DROP TABLE IF EXISTS `media`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `media` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `model_type` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `model_id` bigint unsigned NOT NULL,
  `uuid` char(36) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `collection_name` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `name` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `file_name` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `mime_type` varchar(191) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `disk` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `conversions_disk` varchar(191) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `size` bigint unsigned NOT NULL,
  `manipulations` json NOT NULL,
  `custom_properties` json NOT NULL,
  `generated_conversions` json NOT NULL,
  `responsive_images` json NOT NULL,
  `order_column` int unsigned DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `media_uuid_unique` (`uuid`),
  KEY `media_model_type_model_id_index` (`model_type`,`model_id`)
) ENGINE=MyISAM DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `media`
--

LOCK TABLES `media` WRITE;
/*!40000 ALTER TABLE `media` DISABLE KEYS */;
/*!40000 ALTER TABLE `media` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `migrations`
--

DROP TABLE IF EXISTS `migrations`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `migrations` (
  `id` int unsigned NOT NULL AUTO_INCREMENT,
  `migration` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `batch` int NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=MyISAM AUTO_INCREMENT=19 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `migrations`
--

LOCK TABLES `migrations` WRITE;
/*!40000 ALTER TABLE `migrations` DISABLE KEYS */;
INSERT INTO `migrations` VALUES (1,'0001_01_01_000000_create_users_table',1),(2,'0001_01_01_000001_create_cache_table',1),(3,'0001_01_01_000002_create_jobs_table',1),(4,'2024_01_01_000001_create_portfolio_projects_table',1),(5,'2024_01_01_000002_create_contact_submissions_table',1),(6,'2024_01_01_000003_create_analytics_tables',1),(7,'2024_01_01_000004_create_notifications_table',1),(8,'2025_12_22_020624_create_personal_access_tokens_table',1),(9,'2026_01_06_144116_create_activity_log_table',1),(10,'2026_01_06_144117_add_event_column_to_activity_log_table',1),(11,'2026_01_06_144118_add_batch_uuid_column_to_activity_log_table',1),(12,'2026_01_06_144131_create_tag_tables',1),(13,'2026_01_06_144154_create_media_table',1),(14,'2026_01_07_000001_create_comments_table',1),(15,'2026_01_07_020000_create_hero_slides_table',1),(16,'2026_01_07_100001_create_site_settings_table',1),(17,'2026_01_07_100002_create_trusted_clients_table',1),(18,'2026_01_07_100003_add_testimonials_to_hero_slides_table',1);
/*!40000 ALTER TABLE `migrations` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `notifications`
--

DROP TABLE IF EXISTS `notifications`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `notifications` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `type` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `title` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `message` text COLLATE utf8mb4_unicode_ci NOT NULL,
  `link` varchar(191) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `is_read` tinyint(1) NOT NULL DEFAULT '0',
  `read_at` timestamp NULL DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `notifications_is_read_created_at_index` (`is_read`,`created_at`)
) ENGINE=MyISAM DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `notifications`
--

LOCK TABLES `notifications` WRITE;
/*!40000 ALTER TABLE `notifications` DISABLE KEYS */;
/*!40000 ALTER TABLE `notifications` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `password_reset_tokens`
--

DROP TABLE IF EXISTS `password_reset_tokens`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `password_reset_tokens` (
  `email` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `token` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`email`)
) ENGINE=MyISAM DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `password_reset_tokens`
--

LOCK TABLES `password_reset_tokens` WRITE;
/*!40000 ALTER TABLE `password_reset_tokens` DISABLE KEYS */;
/*!40000 ALTER TABLE `password_reset_tokens` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `personal_access_tokens`
--

DROP TABLE IF EXISTS `personal_access_tokens`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `personal_access_tokens` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `tokenable_type` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `tokenable_id` bigint unsigned NOT NULL,
  `name` text COLLATE utf8mb4_unicode_ci NOT NULL,
  `token` varchar(64) COLLATE utf8mb4_unicode_ci NOT NULL,
  `abilities` text COLLATE utf8mb4_unicode_ci,
  `last_used_at` timestamp NULL DEFAULT NULL,
  `expires_at` timestamp NULL DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `personal_access_tokens_token_unique` (`token`),
  KEY `personal_access_tokens_tokenable_type_tokenable_id_index` (`tokenable_type`,`tokenable_id`),
  KEY `personal_access_tokens_expires_at_index` (`expires_at`)
) ENGINE=MyISAM AUTO_INCREMENT=2 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `personal_access_tokens`
--

LOCK TABLES `personal_access_tokens` WRITE;
/*!40000 ALTER TABLE `personal_access_tokens` DISABLE KEYS */;
INSERT INTO `personal_access_tokens` VALUES (1,'App\\Models\\User',1,'auth_token','ae8e496c4f93ed641a89559b2fb71a5f19910e9c60e4bd743f1713936a1642b2','[\"*\"]','2026-01-07 17:24:28',NULL,'2026-01-07 09:23:52','2026-01-07 17:24:28');
/*!40000 ALTER TABLE `personal_access_tokens` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `portfolio_projects`
--

DROP TABLE IF EXISTS `portfolio_projects`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `portfolio_projects` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `title` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `description` text COLLATE utf8mb4_unicode_ci NOT NULL,
  `category` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `client_name` varchar(191) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `client_logo` varchar(191) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `image_url` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `project_url` varchar(191) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `status` enum('completed','in_progress','pending') COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'completed',
  `featured` tinyint(1) NOT NULL DEFAULT '0',
  `sort_order` int NOT NULL DEFAULT '0',
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=MyISAM AUTO_INCREMENT=7 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `portfolio_projects`
--

LOCK TABLES `portfolio_projects` WRITE;
/*!40000 ALTER TABLE `portfolio_projects` DISABLE KEYS */;
INSERT INTO `portfolio_projects` VALUES (1,'E-Commerce Platform','A full-featured e-commerce platform with inventory management, payment processing, and order tracking.','Web Development','Retail Solutions Ltd',NULL,'https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?w=800','https://example.com','completed',1,1,'2026-01-07 09:22:13','2026-01-07 09:22:13'),(2,'Corporate Website Redesign','Complete redesign of a corporate website with modern UI/UX, responsive design, and CMS integration.','Web Design','Tech Corp International',NULL,'https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=800','https://example.com','completed',1,2,'2026-01-07 09:22:13','2026-01-07 09:22:13'),(3,'Real Estate Portal','Property listing platform with advanced search, virtual tours, and agent management system.','Web Application','Prime Properties Kenya',NULL,'https://images.unsplash.com/photo-1560518883-ce09059eeffa?w=800','https://example.com','completed',0,3,'2026-01-07 09:22:13','2026-01-07 09:22:13'),(4,'Restaurant Booking System','Online reservation system with table management, menu display, and customer notifications.','Web Application','Savannah Grill',NULL,'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=800','https://example.com','completed',1,4,'2026-01-07 09:22:13','2026-01-07 09:22:13'),(5,'Healthcare Dashboard','Admin dashboard for healthcare facility with patient management and appointment scheduling.','Dashboard','MediCare Clinics',NULL,'https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?w=800',NULL,'in_progress',0,5,'2026-01-07 09:22:13','2026-01-07 09:22:13'),(6,'Event Management Platform','Comprehensive event planning and ticketing platform with attendee management.','Web Application','Events Kenya',NULL,'https://images.unsplash.com/photo-1492684223066-81342ee5ff30?w=800',NULL,'completed',0,6,'2026-01-07 09:22:13','2026-01-07 09:22:13');
/*!40000 ALTER TABLE `portfolio_projects` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `sessions`
--

DROP TABLE IF EXISTS `sessions`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `sessions` (
  `id` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `user_id` bigint unsigned DEFAULT NULL,
  `ip_address` varchar(45) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `user_agent` text COLLATE utf8mb4_unicode_ci,
  `payload` longtext COLLATE utf8mb4_unicode_ci NOT NULL,
  `last_activity` int NOT NULL,
  PRIMARY KEY (`id`),
  KEY `sessions_user_id_index` (`user_id`),
  KEY `sessions_last_activity_index` (`last_activity`)
) ENGINE=MyISAM DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `sessions`
--

LOCK TABLES `sessions` WRITE;
/*!40000 ALTER TABLE `sessions` DISABLE KEYS */;
/*!40000 ALTER TABLE `sessions` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `site_settings`
--

DROP TABLE IF EXISTS `site_settings`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `site_settings` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `key` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `value` text COLLATE utf8mb4_unicode_ci,
  `type` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'string',
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `site_settings_key_unique` (`key`)
) ENGINE=MyISAM AUTO_INCREMENT=3 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `site_settings`
--

LOCK TABLES `site_settings` WRITE;
/*!40000 ALTER TABLE `site_settings` DISABLE KEYS */;
INSERT INTO `site_settings` VALUES (1,'linkedin_url',NULL,'string','2026-01-07 09:22:12','2026-01-07 09:22:12'),(2,'portfolio_file_url',NULL,'file','2026-01-07 09:22:12','2026-01-07 09:22:12');
/*!40000 ALTER TABLE `site_settings` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `taggables`
--

DROP TABLE IF EXISTS `taggables`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `taggables` (
  `tag_id` bigint unsigned NOT NULL,
  `taggable_type` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `taggable_id` bigint unsigned NOT NULL,
  UNIQUE KEY `taggables_tag_id_taggable_id_taggable_type_unique` (`tag_id`,`taggable_id`,`taggable_type`),
  KEY `taggables_taggable_type_taggable_id_index` (`taggable_type`,`taggable_id`)
) ENGINE=MyISAM DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `taggables`
--

LOCK TABLES `taggables` WRITE;
/*!40000 ALTER TABLE `taggables` DISABLE KEYS */;
/*!40000 ALTER TABLE `taggables` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `tags`
--

DROP TABLE IF EXISTS `tags`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `tags` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `name` json NOT NULL,
  `slug` json NOT NULL,
  `type` varchar(191) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `order_column` int DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=MyISAM DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `tags`
--

LOCK TABLES `tags` WRITE;
/*!40000 ALTER TABLE `tags` DISABLE KEYS */;
/*!40000 ALTER TABLE `tags` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `trusted_clients`
--

DROP TABLE IF EXISTS `trusted_clients`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `trusted_clients` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `name` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `logo_url` varchar(191) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `website_url` varchar(191) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `sort_order` int NOT NULL DEFAULT '0',
  `is_active` tinyint(1) NOT NULL DEFAULT '1',
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=MyISAM AUTO_INCREMENT=2 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `trusted_clients`
--

LOCK TABLES `trusted_clients` WRITE;
/*!40000 ALTER TABLE `trusted_clients` DISABLE KEYS */;
INSERT INTO `trusted_clients` VALUES (1,'OKJSyle','http://localhost:8000/storage/trusted-clients/mE7kronGaDMIToWRrTdmaRXTRvAFl5IrqgsZQ2Oq.png','http://www.okjstyle.co.ke',1,1,'2026-01-07 11:07:50','2026-01-07 11:08:12');
/*!40000 ALTER TABLE `trusted_clients` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `users`
--

DROP TABLE IF EXISTS `users`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `users` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `name` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `email` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `email_verified_at` timestamp NULL DEFAULT NULL,
  `password` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `remember_token` varchar(100) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `users_email_unique` (`email`)
) ENGINE=MyISAM AUTO_INCREMENT=2 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `users`
--

LOCK TABLES `users` WRITE;
/*!40000 ALTER TABLE `users` DISABLE KEYS */;
INSERT INTO `users` VALUES (1,'Admin','admin@okjtech.co.ke',NULL,'$2y$12$HIqduPQkI03XoKO63fxP8uSZPhAnjVWB3bTI7iYCGyRepWW9Urxea',NULL,'2026-01-07 09:22:12','2026-01-07 09:22:12');
/*!40000 ALTER TABLE `users` ENABLE KEYS */;
UNLOCK TABLES;
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

-- Dump completed on 2026-01-07 23:24:56

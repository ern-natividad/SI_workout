-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Host: 127.0.0.1
-- Generation Time: Nov 21, 2025 at 04:46 PM
-- Server version: 10.4.32-MariaDB
-- PHP Version: 8.2.12

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Database: `workout_app`
--

-- --------------------------------------------------------

--
-- Table structure for table `bmi_records`
--

CREATE TABLE `bmi_records` (
  `id` int(11) NOT NULL,
  `user_id` int(11) NOT NULL,
  `height_cm` decimal(5,2) NOT NULL,
  `weight_kg` decimal(5,2) NOT NULL,
  `bmi_value` decimal(5,2) DEFAULT NULL,
  `recorded_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `categories`
--

CREATE TABLE `categories` (
  `id` int(11) NOT NULL,
  `name` varchar(100) NOT NULL,
  `description` text DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `categories`
--

INSERT INTO `categories` (`id`, `name`, `description`) VALUES
(4, 'General', 'General exercises'),
(6, 'Weighted', NULL);

-- --------------------------------------------------------

--
-- Table structure for table `plan_workouts`
--

CREATE TABLE `plan_workouts` (
  `id` int(11) NOT NULL,
  `plan_id` int(11) NOT NULL,
  `workout_id` int(11) NOT NULL,
  `day_of_week` enum('Monday','Tuesday','Wednesday','Thursday','Friday','Saturday','Sunday') DEFAULT NULL,
  `sets` int(11) DEFAULT NULL,
  `reps` int(11) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `plan_workouts`
--

INSERT INTO `plan_workouts` (`id`, `plan_id`, `workout_id`, `day_of_week`, `sets`, `reps`) VALUES
(4, 8, 11, 'Monday', 3, 10),
(5, 8, 12, 'Monday', 3, 10),
(6, 9, 13, 'Monday', 3, 10),
(7, 10, 11, 'Monday', 3, 10),
(8, 10, 14, 'Monday', 3, 10),
(9, 10, 15, 'Monday', 3, 10),
(13, 15, 17, 'Monday', 3, 10),
(14, 16, 11, 'Monday', 3, 10),
(15, 16, 14, 'Tuesday', 3, 10),
(16, 17, 18, 'Monday', 3, 10),
(17, 18, 19, 'Monday', 3, 10),
(18, 19, 19, 'Monday', 3, 10),
(19, 20, 20, 'Monday', 3, 10),
(20, 21, 21, 'Monday', 3, 10),
(21, 22, 22, 'Monday', 3, 10),
(22, 22, 20, 'Tuesday', 3, 10),
(23, 22, 23, 'Wednesday', 3, 10),
(24, 23, 24, 'Monday', 3, 10),
(25, 24, 21, 'Monday', 3, 10),
(26, 25, 21, 'Monday', 3, 10),
(27, 26, 25, 'Monday', 3, 10),
(28, 27, 21, 'Monday', 3, 10),
(29, 28, 26, 'Monday', 3, 10),
(30, 29, 27, 'Monday', 3, 10),
(31, 29, 28, 'Tuesday', 3, 10),
(33, 31, 30, 'Monday', 3, 10),
(34, 32, 27, 'Monday', 3, 10),
(35, 33, 24, 'Monday', 3, 10),
(36, 34, 16, 'Monday', 3, 10),
(37, 34, 31, 'Tuesday', 3, 10),
(38, 35, 11, 'Monday', 3, 10),
(39, 35, 19, 'Tuesday', 3, 10),
(40, 36, 30, 'Monday', 3, 10),
(41, 36, 18, 'Tuesday', 3, 10),
(42, 37, 24, 'Monday', 3, 10),
(43, 38, 32, 'Monday', 3, 10),
(44, 38, 33, 'Tuesday', 3, 10),
(45, 38, 34, 'Wednesday', 3, 10),
(46, 39, 35, 'Monday', 3, 10),
(47, 40, 11, 'Monday', 3, 10),
(48, 40, 36, 'Tuesday', 3, 10),
(49, 40, 37, 'Wednesday', 3, 10),
(50, 41, 19, 'Monday', 3, 10),
(51, 42, 38, 'Monday', 3, 10),
(52, 42, 39, 'Tuesday', 3, 10),
(53, 43, 40, 'Monday', 3, 10),
(54, 43, 41, 'Tuesday', 3, 10),
(55, 43, 42, 'Wednesday', 3, 10),
(56, 44, 43, 'Monday', 3, 10),
(57, 44, 30, 'Tuesday', 3, 10),
(58, 44, 18, 'Wednesday', 3, 10),
(59, 45, 17, 'Monday', 3, 10),
(60, 45, 32, 'Tuesday', 3, 10),
(61, 45, 33, 'Wednesday', 3, 10),
(62, 46, 44, 'Monday', 3, 10),
(63, 46, 45, 'Tuesday', 3, 10),
(64, 47, 46, 'Monday', 3, 10),
(65, 48, 11, 'Monday', 3, 10),
(66, 49, 29, 'Monday', 3, 10),
(67, 49, 47, 'Tuesday', 3, 10),
(68, 49, 43, 'Wednesday', 3, 10),
(69, 50, 48, 'Monday', 3, 10),
(70, 51, 22, 'Monday', 3, 10),
(71, 51, 24, 'Tuesday', 3, 10),
(72, 51, 49, 'Wednesday', 3, 10);

-- --------------------------------------------------------

--
-- Table structure for table `progress`
--

CREATE TABLE `progress` (
  `id` int(11) NOT NULL,
  `user_id` int(11) NOT NULL,
  `plan_id` int(11) NOT NULL,
  `completed_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `weight_kg` decimal(5,2) DEFAULT NULL,
  `calories_burned` int(11) DEFAULT NULL,
  `notes` text DEFAULT NULL,
  `deleted_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `progress`
--

INSERT INTO `progress` (`id`, `user_id`, `plan_id`, `completed_at`, `weight_kg`, `calories_burned`, `notes`, `deleted_at`) VALUES
(3, 3, 8, '2025-11-19 21:13:32', NULL, NULL, NULL, NULL),
(4, 3, 9, '2025-11-19 21:14:21', NULL, NULL, NULL, NULL),
(5, 3, 10, '2025-11-19 21:26:25', NULL, NULL, NULL, NULL),
(6, 3, 16, '2025-11-19 21:26:40', NULL, NULL, NULL, NULL),
(7, 3, 17, '2025-11-19 21:26:50', NULL, NULL, NULL, NULL),
(8, 3, 18, '2025-11-19 21:27:03', NULL, NULL, NULL, NULL),
(10, 3, 25, '2025-11-19 21:33:10', NULL, NULL, NULL, NULL),
(11, 3, 26, '2025-11-19 21:33:35', NULL, NULL, NULL, NULL),
(12, 3, 29, '2025-11-19 21:34:40', NULL, NULL, NULL, NULL),
(13, 3, 31, '2025-11-19 21:35:22', NULL, NULL, NULL, NULL),
(14, 3, 32, '2025-11-19 21:37:07', NULL, NULL, NULL, NULL),
(15, 3, 33, '2025-11-20 05:53:01', 75.00, 0, NULL, NULL),
(16, 3, 34, '2025-11-20 05:55:32', 75.00, 0, NULL, NULL),
(17, 3, 35, '2025-11-20 06:10:24', 75.00, 0, NULL, NULL),
(18, 3, 35, '2025-11-20 06:10:57', 75.00, 0, NULL, NULL),
(19, 11, 15, '2025-11-20 06:11:53', 98.00, 0, NULL, NULL),
(20, 11, 20, '2025-11-20 06:12:07', 98.00, 0, NULL, NULL),
(21, 11, 21, '2025-11-20 06:13:46', 98.00, 0, NULL, NULL),
(22, 11, 22, '2025-11-20 06:26:29', 98.00, 6, NULL, NULL),
(23, 11, 22, '2025-11-20 06:27:00', 98.00, 3, NULL, NULL),
(24, 11, 23, '2025-11-20 06:27:24', 98.00, 0, NULL, NULL),
(25, 11, 24, '2025-11-20 06:27:51', 98.00, 4, NULL, NULL),
(26, 11, 27, '2025-11-20 06:28:07', 98.00, 2, NULL, NULL),
(27, 11, 28, '2025-11-20 06:28:53', 98.00, 17, NULL, NULL),
(28, 11, 36, '2025-11-20 06:29:14', 98.00, 0, NULL, NULL),
(29, 11, 36, '2025-11-20 06:29:30', 98.00, 0, NULL, NULL),
(30, 11, 37, '2025-11-20 06:30:24', 98.00, 24, NULL, NULL),
(31, 11, 38, '2025-11-20 06:31:29', 98.00, 12, NULL, NULL),
(32, 11, 38, '2025-11-20 06:37:57', 98.00, 1, NULL, NULL),
(33, 11, 38, '2025-11-20 06:39:00', 98.00, 1, NULL, NULL),
(34, 11, 38, '2025-11-20 06:39:13', 98.00, 0, NULL, NULL),
(35, 11, 39, '2025-11-20 06:47:20', 98.00, 6, NULL, NULL),
(36, 11, 40, '2025-11-20 06:48:01', 98.00, 4, NULL, '2025-11-21 12:01:39'),
(37, 11, 40, '2025-11-20 06:48:22', 98.00, 3, NULL, NULL),
(38, 11, 40, '2025-11-20 06:52:02', 98.00, 5, NULL, NULL),
(39, 11, 40, '2025-11-20 17:25:16', 98.00, 0, NULL, NULL),
(40, 11, 40, '2025-11-20 17:25:26', 98.00, 0, NULL, NULL),
(41, 11, 40, '2025-11-20 17:25:31', 98.00, 0, NULL, NULL),
(42, 11, 42, '2025-11-20 18:15:53', 98.00, 12, NULL, NULL),
(43, 11, 42, '2025-11-20 18:16:18', 98.00, 6, NULL, NULL),
(44, 11, 42, '2025-11-20 18:16:53', 98.00, 8, NULL, NULL),
(45, 11, 42, '2025-11-20 18:17:51', 98.00, 0, NULL, NULL),
(46, 11, 43, '2025-11-20 18:23:54', 98.00, 353, NULL, NULL),
(47, 11, 44, '2025-11-20 18:30:22', 98.00, 12, NULL, NULL),
(48, 3, 41, '2025-11-20 21:30:38', 75.00, 6, NULL, NULL),
(49, 3, 45, '2025-11-20 23:01:25', 75.00, 12, NULL, NULL),
(50, 3, 45, '2025-11-20 23:05:41', 75.00, 0, NULL, NULL),
(51, 3, 46, '2025-11-21 00:58:20', 75.00, 0, NULL, NULL),
(52, 11, 44, '2025-11-21 01:15:38', 98.00, 0, NULL, NULL),
(53, 11, 44, '2025-11-21 02:59:41', 98.00, 25, NULL, '2025-11-21 12:52:27'),
(56, 11, 50, '2025-11-21 03:04:11', 98.00, 5594, NULL, NULL),
(57, 3, 46, '2025-11-21 07:16:01', 75.00, 12, NULL, NULL),
(58, 3, 47, '2025-11-21 07:16:34', 75.00, 0, NULL, NULL);

-- --------------------------------------------------------

--
-- Table structure for table `users`
--

CREATE TABLE `users` (
  `id` int(11) NOT NULL,
  `username` varchar(50) NOT NULL,
  `email` varchar(100) NOT NULL,
  `password` varchar(255) NOT NULL,
  `age` int(11) DEFAULT NULL,
  `gender` enum('Male','Female','Other') DEFAULT NULL,
  `height_cm` decimal(5,2) DEFAULT NULL,
  `weight_kg` decimal(5,2) DEFAULT NULL,
  `profile_image` varchar(255) DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `users`
--

INSERT INTO `users` (`id`, `username`, `email`, `password`, `age`, `gender`, `height_cm`, `weight_kg`, `profile_image`, `created_at`) VALUES
(3, 'ern', 'ernnatividad10@gmail.com', '$2y$10$kYHrSJwBb/hI7/Hg0c4m9.Sj1I.6KkHAcZncNTL7LxfpIOHHZsXEK', 25, 'Male', 175.00, 75.00, NULL, '2025-10-24 13:33:51'),
(8, 'testuser', 'test@example.com', '$2a$10$dfnWAsiIJnR0ra1fAf1.budYkBgvRcxfarYl7l8Goz3Gd/ifXkBF6', NULL, NULL, NULL, NULL, NULL, '2025-11-19 04:16:28'),
(11, 'asd', 'rod20@gmail.com', '$2a$10$DWv4Ceqi3A4xZm7A/.II9efC3gDvL5phDcDcZIotzkSDWjbbXBEo.', 20, 'Male', 170.00, 98.00, NULL, '2025-11-19 15:07:28');

-- --------------------------------------------------------

--
-- Table structure for table `workouts`
--

CREATE TABLE `workouts` (
  `id` int(11) NOT NULL,
  `category_id` int(11) NOT NULL,
  `name` varchar(100) NOT NULL,
  `description` text DEFAULT NULL,
  `equipment` varchar(100) DEFAULT NULL,
  `muscle_group` varchar(100) DEFAULT NULL,
  `difficulty` enum('Beginner','Intermediate','Advanced') DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `workouts`
--

INSERT INTO `workouts` (`id`, `category_id`, `name`, `description`, `equipment`, `muscle_group`, `difficulty`) VALUES
(11, 4, 'band alternating biceps curl', NULL, 'band', 'upper arms', 'Beginner'),
(12, 4, 'band assisted wheel rollerout', NULL, 'band', 'waist', 'Beginner'),
(13, 4, 'tire flip', NULL, 'tire', 'upper legs', 'Beginner'),
(14, 4, 'band assisted pull-up', NULL, 'band', 'back', 'Beginner'),
(15, 4, 'band close-grip pulldown', NULL, 'band', 'back', 'Beginner'),
(16, 6, 'assisted hanging knee raise with throw down', NULL, 'assisted', 'waist', 'Advanced'),
(17, 6, 'ski ergometer', NULL, 'skierg machine', 'upper arms', 'Beginner'),
(18, 6, 'dumbbell bench press', NULL, 'dumbbell', 'chest', 'Beginner'),
(19, 6, 'band alternating v-up', NULL, 'band', 'waist', 'Intermediate'),
(20, 6, 'barbell close-grip bench press', NULL, 'barbell', 'upper arms', 'Intermediate'),
(21, 6, 'walk elliptical cross trainer', NULL, 'elliptical machine', 'cardio', 'Beginner'),
(22, 6, 'barbell alternate biceps curl', NULL, 'barbell', 'upper arms', 'Beginner'),
(23, 6, 'barbell curl', NULL, 'barbell', 'upper arms', 'Beginner'),
(24, 6, 'barbell bench press', NULL, 'barbell', 'chest', 'Intermediate'),
(25, 6, 'assisted triceps dip (kneeling)', NULL, 'leverage machine', 'upper arms', 'Beginner'),
(26, 6, 'stationary bike run v. 3', NULL, 'stationary bike', 'cardio', 'Beginner'),
(27, 6, 'push-up medicine ball', NULL, 'medicine ball', 'chest', 'Advanced'),
(28, 6, 'medicine ball chest pass', NULL, 'medicine ball', 'chest', 'Beginner'),
(29, 6, 'dumbbell alternate biceps curl', NULL, 'dumbbell', 'upper arms', 'Beginner'),
(30, 6, 'dumbbell around pullover', NULL, 'dumbbell', 'chest', 'Intermediate'),
(31, 6, 'assisted hanging knee raise', NULL, 'assisted', 'waist', 'Beginner'),
(32, 6, 'weighted bench dip', NULL, 'weighted', 'upper arms', 'Intermediate'),
(33, 6, 'weighted front raise', NULL, 'weighted', 'shoulders', 'Beginner'),
(34, 6, 'weighted round arm', NULL, 'weighted', 'shoulders', 'Intermediate'),
(35, 6, 'walking on stepmill', NULL, 'stepmill machine', 'cardio', 'Beginner'),
(36, 6, 'band close-grip push-up', NULL, 'band', 'upper arms', 'Intermediate'),
(37, 6, 'band concentration curl', NULL, 'band', 'upper arms', 'Beginner'),
(38, 6, 'kettlebell alternating hang clean', NULL, 'kettlebell', 'lower arms', 'Intermediate'),
(39, 6, 'kettlebell alternating press', NULL, 'kettlebell', 'shoulders', 'Intermediate'),
(40, 6, 'balance board', NULL, 'body weight', 'upper legs', 'Intermediate'),
(41, 6, 'bench dip (knees bent)', NULL, 'body weight', 'upper arms', 'Beginner'),
(42, 6, 'bench hip extension', NULL, 'body weight', 'upper legs', 'Beginner'),
(43, 6, 'dumbbell arnold press v. 2', NULL, 'dumbbell', 'shoulders', 'Intermediate'),
(44, 6, 'cable bench press', NULL, 'cable', 'chest', 'Intermediate'),
(45, 6, 'cable cross-over variation', NULL, 'cable', 'chest', 'Intermediate'),
(46, 6, 'dumbbell biceps curl', NULL, 'dumbbell', 'upper arms', 'Beginner'),
(47, 6, 'dumbbell alternate side press', NULL, 'dumbbell', 'shoulders', 'Intermediate'),
(48, 6, 'jump rope', NULL, 'rope', 'cardio', 'Beginner'),
(49, 6, 'barbell bench squat', NULL, 'barbell', 'upper legs', 'Intermediate');

-- --------------------------------------------------------

--
-- Table structure for table `workout_plans`
--

CREATE TABLE `workout_plans` (
  `id` int(11) NOT NULL,
  `user_id` int(11) NOT NULL,
  `title` varchar(100) NOT NULL,
  `goal` varchar(255) DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `end_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `workout_plans`
--

INSERT INTO `workout_plans` (`id`, `user_id`, `title`, `goal`, `created_at`, `end_at`) VALUES
(8, 3, 'My Workout Plan', 'Custom workout plan', '2025-11-18 12:55:37', '2025-11-19 21:13:32'),
(9, 3, 'My Workout Plan', 'Custom workout plan', '2025-11-18 13:11:19', '2025-11-19 21:14:21'),
(10, 3, 'My Workout Plan', 'Custom workout plan', '2025-11-18 14:31:51', '2025-11-19 21:26:25'),
(15, 11, 'My Workout Plan', 'Custom workout plan', '2025-11-19 16:21:51', '2025-11-20 06:11:53'),
(16, 3, 'My Workout Plan', 'Custom workout plan', '2025-11-20 02:57:23', '2025-11-19 21:26:40'),
(17, 3, 'My Workout Plan', 'Custom workout plan', '2025-11-20 02:57:46', '2025-11-19 21:26:50'),
(18, 3, 'My Workout Plan', 'Custom workout plan', '2025-11-20 03:00:05', '2025-11-19 21:27:03'),
(19, 3, 'My Workout Plan', 'Custom workout plan', '2025-11-20 03:01:18', '2025-11-19 21:27:49'),
(20, 11, 'My Workout Plan', 'Custom workout plan', '2025-11-20 03:04:19', '2025-11-20 06:12:07'),
(21, 11, 'My Workout Plan', 'Custom workout plan', '2025-11-20 03:06:23', '2025-11-20 06:13:46'),
(22, 11, 'My Workout Plan', 'Custom workout plan', '2025-11-20 03:09:42', '2025-11-20 06:27:00'),
(23, 11, 'My Workout Plan', 'Custom workout plan', '2025-11-20 03:12:43', '2025-11-20 06:27:24'),
(24, 11, 'My Workout Plan', 'Custom workout plan', '2025-11-20 03:17:58', '2025-11-20 06:27:51'),
(25, 3, 'My Workout Plan', 'Custom workout plan', '2025-11-20 03:28:34', '2025-11-19 21:33:10'),
(26, 3, 'My Workout Plan', 'Custom workout plan', '2025-11-20 03:38:06', '2025-11-19 21:33:35'),
(27, 11, 'My Workout Plan', 'Custom workout plan', '2025-11-20 03:53:02', '2025-11-20 06:28:07'),
(28, 11, 'My Workout Plan', 'Custom workout plan', '2025-11-20 04:11:10', '2025-11-20 06:28:53'),
(29, 3, 'My Workout Plan', 'Custom workout plan', '2025-11-20 05:27:20', '2025-11-19 21:34:40'),
(31, 3, 'My Workout Plan', 'Custom workout plan', '2025-11-20 05:35:03', '2025-11-19 21:35:22'),
(32, 3, 'My Workout Plan', 'Custom workout plan', '2025-11-20 05:36:51', '2025-11-19 21:37:07'),
(33, 3, 'My Workout Plan', 'Custom workout plan', '2025-11-20 13:52:46', '2025-11-20 05:53:01'),
(34, 3, 'My Workout Plan', 'Custom workout plan', '2025-11-20 13:54:43', '2025-11-20 05:55:32'),
(35, 3, 'My Workout Plan', 'Custom workout plan', '2025-11-20 14:10:03', '2025-11-20 06:10:57'),
(36, 11, 'My Workout Plan', 'Custom workout plan', '2025-11-20 14:28:33', '2025-11-20 06:29:30'),
(37, 11, 'My Workout Plan', 'Custom workout plan', '2025-11-20 14:30:07', '2025-11-20 06:30:24'),
(38, 11, 'My Workout Plan', 'Custom workout plan', '2025-11-20 14:31:10', '2025-11-20 06:39:13'),
(39, 11, 'My Workout Plan', 'Custom workout plan', '2025-11-20 14:40:57', '2025-11-20 06:47:20'),
(40, 11, 'My Workout Plan', 'Custom workout plan', '2025-11-20 14:47:44', '2025-11-20 17:25:31'),
(41, 3, 'My Workout Plan', 'Custom workout plan', '2025-11-20 23:56:52', '2025-11-20 21:30:38'),
(42, 11, 'My Workout Plan', 'Custom workout plan', '2025-11-21 01:24:06', '2025-11-20 18:17:51'),
(43, 11, 'My Workout Plan', 'Custom workout plan', '2025-11-21 02:18:37', '2025-11-20 18:23:54'),
(44, 11, 'My Workout Plan', 'Custom workout plan', '2025-11-21 02:24:42', '2025-11-21 02:59:41'),
(45, 3, 'My Workout Plan', 'Custom workout plan', '2025-11-21 05:30:59', '2025-11-20 23:05:41'),
(46, 3, 'My Workout Plan', 'Custom workout plan', '2025-11-21 07:18:53', '2025-11-21 07:16:01'),
(47, 3, 'My Workout Plan', 'Custom workout plan', '2025-11-21 07:53:39', '2025-11-21 07:16:34'),
(48, 11, 'My Workout Plan', 'Custom workout plan', '2025-11-21 10:38:33', '2025-11-21 03:00:01'),
(49, 11, 'My Workout Plan', 'Custom workout plan', '2025-11-21 10:49:43', '2025-11-21 03:00:17'),
(50, 11, 'My Workout Plan', 'Custom workout plan', '2025-11-21 11:00:34', '2025-11-21 03:04:11'),
(51, 3, 'My Workout Plan', 'Custom workout plan', '2025-11-21 15:24:30', NULL);

--
-- Indexes for dumped tables
--

--
-- Indexes for table `bmi_records`
--
ALTER TABLE `bmi_records`
  ADD PRIMARY KEY (`id`),
  ADD KEY `user_id` (`user_id`);

--
-- Indexes for table `categories`
--
ALTER TABLE `categories`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `plan_workouts`
--
ALTER TABLE `plan_workouts`
  ADD PRIMARY KEY (`id`),
  ADD KEY `plan_id` (`plan_id`),
  ADD KEY `workout_id` (`workout_id`);

--
-- Indexes for table `progress`
--
ALTER TABLE `progress`
  ADD PRIMARY KEY (`id`),
  ADD KEY `user_id` (`user_id`),
  ADD KEY `plan_id` (`plan_id`);

--
-- Indexes for table `users`
--
ALTER TABLE `users`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `username` (`username`),
  ADD UNIQUE KEY `email` (`email`);

--
-- Indexes for table `workouts`
--
ALTER TABLE `workouts`
  ADD PRIMARY KEY (`id`),
  ADD KEY `category_id` (`category_id`);

--
-- Indexes for table `workout_plans`
--
ALTER TABLE `workout_plans`
  ADD PRIMARY KEY (`id`),
  ADD KEY `user_id` (`user_id`);

--
-- AUTO_INCREMENT for dumped tables
--

--
-- AUTO_INCREMENT for table `bmi_records`
--
ALTER TABLE `bmi_records`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=2;

--
-- AUTO_INCREMENT for table `categories`
--
ALTER TABLE `categories`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=7;

--
-- AUTO_INCREMENT for table `plan_workouts`
--
ALTER TABLE `plan_workouts`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=73;

--
-- AUTO_INCREMENT for table `progress`
--
ALTER TABLE `progress`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=59;

--
-- AUTO_INCREMENT for table `users`
--
ALTER TABLE `users`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=12;

--
-- AUTO_INCREMENT for table `workouts`
--
ALTER TABLE `workouts`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=50;

--
-- AUTO_INCREMENT for table `workout_plans`
--
ALTER TABLE `workout_plans`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=52;

--
-- Constraints for dumped tables
--

--
-- Constraints for table `bmi_records`
--
ALTER TABLE `bmi_records`
  ADD CONSTRAINT `bmi_records_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `plan_workouts`
--
ALTER TABLE `plan_workouts`
  ADD CONSTRAINT `plan_workouts_ibfk_1` FOREIGN KEY (`plan_id`) REFERENCES `workout_plans` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `plan_workouts_ibfk_2` FOREIGN KEY (`workout_id`) REFERENCES `workouts` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `progress`
--
ALTER TABLE `progress`
  ADD CONSTRAINT `progress_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `progress_ibfk_2` FOREIGN KEY (`plan_id`) REFERENCES `workout_plans` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `workouts`
--
ALTER TABLE `workouts`
  ADD CONSTRAINT `workouts_ibfk_1` FOREIGN KEY (`category_id`) REFERENCES `categories` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `workout_plans`
--
ALTER TABLE `workout_plans`
  ADD CONSTRAINT `workout_plans_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE;
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;

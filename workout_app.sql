-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Host: 127.0.0.1
-- Generation Time: Nov 20, 2025 at 05:40 AM
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
(29, 28, 26, 'Monday', 3, 10);

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
  `notes` text DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

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
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `users`
--

INSERT INTO `users` (`id`, `username`, `email`, `password`, `age`, `gender`, `height_cm`, `weight_kg`, `created_at`) VALUES
(3, 'ern', 'ernnatividad10@gmail.com', '$2y$10$kYHrSJwBb/hI7/Hg0c4m9.Sj1I.6KkHAcZncNTL7LxfpIOHHZsXEK', 25, 'Male', 175.00, 75.00, '2025-10-24 13:33:51'),
(8, 'testuser', 'test@example.com', '$2a$10$dfnWAsiIJnR0ra1fAf1.budYkBgvRcxfarYl7l8Goz3Gd/ifXkBF6', NULL, NULL, NULL, NULL, '2025-11-19 04:16:28'),
(11, 'asd', 'rod20@gmail.com', '$2a$10$DWv4Ceqi3A4xZm7A/.II9efC3gDvL5phDcDcZIotzkSDWjbbXBEo.', 20, 'Male', 170.00, 98.00, '2025-11-19 15:07:28');

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
(26, 6, 'stationary bike run v. 3', NULL, 'stationary bike', 'cardio', 'Beginner');

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
(8, 3, 'My Workout Plan', 'Custom workout plan', '2025-11-18 12:55:37', NULL),
(9, 3, 'My Workout Plan', 'Custom workout plan', '2025-11-18 13:11:19', NULL),
(10, 3, 'My Workout Plan', 'Custom workout plan', '2025-11-18 14:31:51', NULL),
(15, 11, 'My Workout Plan', 'Custom workout plan', '2025-11-19 16:21:51', NULL),
(16, 3, 'My Workout Plan', 'Custom workout plan', '2025-11-20 02:57:23', NULL),
(17, 3, 'My Workout Plan', 'Custom workout plan', '2025-11-20 02:57:46', NULL),
(18, 3, 'My Workout Plan', 'Custom workout plan', '2025-11-20 03:00:05', NULL),
(19, 3, 'My Workout Plan', 'Custom workout plan', '2025-11-20 03:01:18', NULL),
(20, 11, 'My Workout Plan', 'Custom workout plan', '2025-11-20 03:04:19', NULL),
(21, 11, 'My Workout Plan', 'Custom workout plan', '2025-11-20 03:06:23', NULL),
(22, 11, 'My Workout Plan', 'Custom workout plan', '2025-11-20 03:09:42', NULL),
(23, 11, 'My Workout Plan', 'Custom workout plan', '2025-11-20 03:12:43', NULL),
(24, 11, 'My Workout Plan', 'Custom workout plan', '2025-11-20 03:17:58', NULL),
(25, 3, 'My Workout Plan', 'Custom workout plan', '2025-11-20 03:28:34', NULL),
(26, 3, 'My Workout Plan', 'Custom workout plan', '2025-11-20 03:38:06', NULL),
(27, 11, 'My Workout Plan', 'Custom workout plan', '2025-11-20 03:53:02', NULL),
(28, 11, 'My Workout Plan', 'Custom workout plan', '2025-11-20 04:11:10', NULL);

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
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=30;

--
-- AUTO_INCREMENT for table `progress`
--
ALTER TABLE `progress`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=3;

--
-- AUTO_INCREMENT for table `users`
--
ALTER TABLE `users`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=12;

--
-- AUTO_INCREMENT for table `workouts`
--
ALTER TABLE `workouts`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=27;

--
-- AUTO_INCREMENT for table `workout_plans`
--
ALTER TABLE `workout_plans`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=29;

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

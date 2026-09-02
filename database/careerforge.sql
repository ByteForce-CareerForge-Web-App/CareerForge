-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Host: 127.0.0.1
-- Generation Time: Sep 02, 2026 at 11:23 PM
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
-- Database: `careerforge`
--

-- --------------------------------------------------------

--
-- Table structure for table `ai_assessments`
--

CREATE TABLE `ai_assessments` (
  `id` int(10) UNSIGNED NOT NULL,
  `user_id` int(10) UNSIGNED NOT NULL,
  `target_role` varchar(150) NOT NULL,
  `score` decimal(5,2) DEFAULT 0.00,
  `analysis` text DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `alumni_profiles`
--

CREATE TABLE `alumni_profiles` (
  `id` int(10) UNSIGNED NOT NULL,
  `user_id` int(10) UNSIGNED NOT NULL,
  `qualification` varchar(150) DEFAULT NULL,
  `graduation_year` year(4) DEFAULT NULL,
  `company` varchar(150) DEFAULT NULL,
  `position` varchar(150) DEFAULT NULL,
  `verified` tinyint(1) DEFAULT 0,
  `certificate_path` varchar(500) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `api_tokens`
--

CREATE TABLE `api_tokens` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `user_id` int(10) UNSIGNED NOT NULL,
  `token_hash` char(64) NOT NULL,
  `expires_at` datetime DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `api_tokens`
--

INSERT INTO `api_tokens` (`id`, `user_id`, `token_hash`, `expires_at`, `created_at`) VALUES
(1, 3, '890ce8cd1446ce55812ed13d4c3ca67269e441b339ba3116822c38c5d2181a78', '2026-09-08 03:01:55', '2026-09-01 01:01:55'),
(2, 3, '05d5d637a251e2506e87554ad0c3de3a2217895dc3688f8f6f37aca95ea32bdf', '2026-09-08 03:09:18', '2026-09-01 01:09:18'),
(3, 3, 'fec2a13fd3491dd4ed8f5b1505c73fc72eee0854334b339fbf1f667c6c520186', '2026-09-08 23:53:18', '2026-09-01 21:53:18'),
(4, 3, 'd7741601c2152c3a1a7dd0bbbe33e16037506e506205a3d18f0119fa4acc121d', '2026-09-09 00:56:38', '2026-09-01 22:56:38'),
(5, 3, '38fe30b11f911919c542b99b38ac8026bfc7ab99e2d1165ce7edb2cb95346d2f', '2026-09-09 01:01:06', '2026-09-01 23:01:06'),
(6, 3, '08d2c5990e3d310db6b9eccbecf98474539f0033dce49826126fd0cc4b85d3d3', '2026-09-09 01:47:52', '2026-09-01 23:47:52'),
(7, 4, '3009dec363d295eb1fe824c6cb27f44a453574fb5fbd03a96ffed2e6309b3f7e', '2026-09-09 19:34:17', '2026-09-02 17:34:17'),
(8, 4, 'd122ce00b138b3935fc1cbcb18261ec7bc24b53d521697f125dd581e129f1137', '2026-09-09 19:34:47', '2026-09-02 17:34:47'),
(9, 4, '2752669a07b08215ba36b22d0227686b4a0e2d864da77eab5ac1365d27f1b2fe', '2026-09-09 19:47:35', '2026-09-02 17:47:35'),
(10, 5, 'b09bd948398bc6e7c91715e57d6cf49196b2269b77adcdbc433c3cb7c9514602', '2026-09-09 19:49:41', '2026-09-02 17:49:41'),
(11, 4, '9fe9207b67cc7d373c29a510f64d02432baaf9ea16a807d58c88b90ffd7c8b6e', '2026-09-09 20:17:01', '2026-09-02 18:17:01'),
(12, 4, '19aac875f23b668b2e09cdc3ba266ab485251349a322dae65a7082e6d6e017b8', '2026-09-09 20:24:39', '2026-09-02 18:24:39'),
(13, 4, '4811e8822f57e13f0078a5779d50d894dc12a92da6adc7125c12842748a12a95', '2026-09-09 20:26:40', '2026-09-02 18:26:40'),
(14, 4, 'c40bf33e9e74d2c3a17d9a39d9bb9faf25764007aa5670960fd014c06ca85e8f', '2026-09-09 20:30:03', '2026-09-02 18:30:03'),
(15, 4, '5ef2e1ea10e7530c82ea1a2cb909186a32e37d31a4b7363cce5ec30dae846014', '2026-09-09 20:30:25', '2026-09-02 18:30:25');

-- --------------------------------------------------------

--
-- Table structure for table `applications`
--

CREATE TABLE `applications` (
  `id` int(10) UNSIGNED NOT NULL,
  `opportunity_id` int(10) UNSIGNED NOT NULL,
  `student_id` int(10) UNSIGNED NOT NULL,
  `status` enum('submitted','reviewing','shortlisted','rejected','accepted','withdrawn') DEFAULT 'submitted',
  `applied_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `business_profiles`
--

CREATE TABLE `business_profiles` (
  `id` int(10) UNSIGNED NOT NULL,
  `user_id` int(10) UNSIGNED NOT NULL,
  `company_name` varchar(200) NOT NULL,
  `registration_number` varchar(100) DEFAULT NULL,
  `website` varchar(255) DEFAULT NULL,
  `industry` varchar(150) DEFAULT NULL,
  `description` text DEFAULT NULL,
  `verification_status` enum('pending','verified','rejected') DEFAULT 'pending'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `business_profiles`
--

INSERT INTO `business_profiles` (`id`, `user_id`, `company_name`, `registration_number`, `website`, `industry`, `description`, `verification_status`) VALUES
(1, 4, 'Nam Tech', '2026/08/07', NULL, 'Information Technology', 'I build game changing websites using ChatGPT.', 'pending'),
(2, 5, 'Gareeb Tech', '2026/24/86', NULL, 'Information Technology', 'We make software and develop website.', 'pending');

-- --------------------------------------------------------

--
-- Table structure for table `career_credits`
--

CREATE TABLE `career_credits` (
  `id` int(10) UNSIGNED NOT NULL,
  `user_id` int(10) UNSIGNED NOT NULL,
  `action` varchar(150) NOT NULL,
  `points` int(11) NOT NULL DEFAULT 0,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `career_goals`
--

CREATE TABLE `career_goals` (
  `id` int(10) UNSIGNED NOT NULL,
  `name` varchar(150) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `career_goals`
--

INSERT INTO `career_goals` (`id`, `name`) VALUES
(3, 'Build My Career'),
(7, 'Change Careers'),
(1, 'Find a job'),
(5, 'Find A Mentor'),
(2, 'Find an internship'),
(6, 'Improve my CV'),
(4, 'Improve My Skills'),
(10, 'Plan my career path'),
(9, 'Prepare for interviews'),
(8, 'Start A Business');

-- --------------------------------------------------------

--
-- Table structure for table `connections`
--

CREATE TABLE `connections` (
  `id` int(10) UNSIGNED NOT NULL,
  `requester_id` int(10) UNSIGNED NOT NULL,
  `receiver_id` int(10) UNSIGNED NOT NULL,
  `status` enum('pending','accepted','rejected','blocked') DEFAULT 'pending'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `notifications`
--

CREATE TABLE `notifications` (
  `id` int(10) UNSIGNED NOT NULL,
  `user_id` int(10) UNSIGNED NOT NULL,
  `type` varchar(50) NOT NULL,
  `message` text NOT NULL,
  `read_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `opportunities`
--

CREATE TABLE `opportunities` (
  `id` int(10) UNSIGNED NOT NULL,
  `business_id` int(10) UNSIGNED NOT NULL,
  `title` varchar(200) NOT NULL,
  `description` text DEFAULT NULL,
  `type` enum('internship','graduate_program','job','learnership','volunteer','other') NOT NULL,
  `location` varchar(200) DEFAULT NULL,
  `deadline` date DEFAULT NULL,
  `status` enum('open','closed','draft') DEFAULT 'open',
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `opportunity_skills`
--

CREATE TABLE `opportunity_skills` (
  `opportunity_id` int(10) UNSIGNED NOT NULL,
  `skill_id` int(10) UNSIGNED NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `projects`
--

CREATE TABLE `projects` (
  `id` int(10) UNSIGNED NOT NULL,
  `user_id` int(10) UNSIGNED NOT NULL,
  `title` varchar(200) NOT NULL,
  `description` text DEFAULT NULL,
  `github_url` varchar(500) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `roadmaps`
--

CREATE TABLE `roadmaps` (
  `id` int(10) UNSIGNED NOT NULL,
  `user_id` int(10) UNSIGNED NOT NULL,
  `target_role` varchar(150) NOT NULL,
  `content` longtext DEFAULT NULL,
  `progress` decimal(5,2) DEFAULT 0.00
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `skills`
--

CREATE TABLE `skills` (
  `id` int(10) UNSIGNED NOT NULL,
  `name` varchar(100) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `student_career_goals`
--

CREATE TABLE `student_career_goals` (
  `id` int(10) UNSIGNED NOT NULL,
  `student_profile_id` int(10) UNSIGNED NOT NULL,
  `career_goal_id` int(10) UNSIGNED NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `student_profiles`
--

CREATE TABLE `student_profiles` (
  `id` int(10) UNSIGNED NOT NULL,
  `user_id` int(10) UNSIGNED NOT NULL,
  `student_number` varchar(50) DEFAULT NULL,
  `qualification` varchar(150) DEFAULT NULL,
  `year_of_study` int(11) NOT NULL,
  `graduation_year` year(4) DEFAULT NULL,
  `campus` varchar(100) DEFAULT NULL,
  `bio` text DEFAULT NULL,
  `current_company` varchar(150) DEFAULT NULL,
  `current_position` varchar(150) DEFAULT NULL,
  `employability_score` decimal(5,2) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `student_profiles`
--

INSERT INTO `student_profiles` (`id`, `user_id`, `student_number`, `qualification`, `year_of_study`, `graduation_year`, `campus`, `bio`, `current_company`, `current_position`, `employability_score`) VALUES
(1, 3, '402312084', 'BSc in IT', 2, NULL, 'Musgrave', NULL, NULL, NULL, NULL);

-- --------------------------------------------------------

--
-- Table structure for table `users`
--

CREATE TABLE `users` (
  `id` int(10) UNSIGNED NOT NULL,
  `name` varchar(150) NOT NULL,
  `email` varchar(255) NOT NULL,
  `password` varchar(255) NOT NULL,
  `role` enum('student','alumni','business','admin') NOT NULL DEFAULT 'student',
  `status` enum('active','inactive','suspended','pending') NOT NULL DEFAULT 'active',
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `users`
--

INSERT INTO `users` (`id`, `name`, `email`, `password`, `role`, `status`, `created_at`) VALUES
(3, 'Darian Mark Gareeb', 'gareebdm26@gmail.com', '$2y$10$oH5k5kut.Vaf4lI0KcPoHeSW89H5F9b2tu.nBWKvRz7L9YCeUd/GC', 'student', 'active', '2026-09-01 00:15:06'),
(4, 'Arunkumar', 'namtech@gmail.com', '$2y$10$WEVtKdTO2.T.aqIhiOHFnu/ZzeCB42aSvgfYR7du22WUmt9ewrtEG', 'business', 'active', '2026-09-01 23:31:35'),
(5, 'Gareeb', 'gareebtech@gmail.com', '$2y$10$gBqGazc9PvQMQIQmP4bXuuphxz3J6TzXk0J2aF82UI5DdSqoAMKTO', 'business', 'active', '2026-09-02 17:47:01');

-- --------------------------------------------------------

--
-- Table structure for table `user_skills`
--

CREATE TABLE `user_skills` (
  `user_id` int(10) UNSIGNED NOT NULL,
  `skill_id` int(10) UNSIGNED NOT NULL,
  `level` enum('beginner','intermediate','advanced','expert') NOT NULL DEFAULT 'beginner'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `verification_requests`
--

CREATE TABLE `verification_requests` (
  `id` int(10) UNSIGNED NOT NULL,
  `user_id` int(10) UNSIGNED NOT NULL,
  `document_path` varchar(500) NOT NULL,
  `status` enum('pending','approved','rejected') DEFAULT 'pending',
  `ai_confidence` decimal(5,2) DEFAULT NULL,
  `admin_decision` text DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Indexes for dumped tables
--

--
-- Indexes for table `ai_assessments`
--
ALTER TABLE `ai_assessments`
  ADD PRIMARY KEY (`id`),
  ADD KEY `fk_ai_assessments_user` (`user_id`);

--
-- Indexes for table `alumni_profiles`
--
ALTER TABLE `alumni_profiles`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `user_id` (`user_id`);

--
-- Indexes for table `api_tokens`
--
ALTER TABLE `api_tokens`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `unique_token_hash` (`token_hash`),
  ADD KEY `idx_api_tokens_user` (`user_id`);

--
-- Indexes for table `applications`
--
ALTER TABLE `applications`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `unique_application` (`opportunity_id`,`student_id`),
  ADD KEY `fk_applications_student` (`student_id`);

--
-- Indexes for table `business_profiles`
--
ALTER TABLE `business_profiles`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `user_id` (`user_id`),
  ADD UNIQUE KEY `registration_number` (`registration_number`);

--
-- Indexes for table `career_credits`
--
ALTER TABLE `career_credits`
  ADD PRIMARY KEY (`id`),
  ADD KEY `fk_career_credits_user` (`user_id`);

--
-- Indexes for table `career_goals`
--
ALTER TABLE `career_goals`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `unique_career_goal_name` (`name`);

--
-- Indexes for table `connections`
--
ALTER TABLE `connections`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `unique_connection` (`requester_id`,`receiver_id`),
  ADD KEY `fk_connections_receiver` (`receiver_id`);

--
-- Indexes for table `notifications`
--
ALTER TABLE `notifications`
  ADD PRIMARY KEY (`id`),
  ADD KEY `fk_notifications_user` (`user_id`);

--
-- Indexes for table `opportunities`
--
ALTER TABLE `opportunities`
  ADD PRIMARY KEY (`id`),
  ADD KEY `fk_opportunities_business` (`business_id`);

--
-- Indexes for table `opportunity_skills`
--
ALTER TABLE `opportunity_skills`
  ADD PRIMARY KEY (`opportunity_id`,`skill_id`),
  ADD KEY `fk_opportunity_skills_skill` (`skill_id`);

--
-- Indexes for table `projects`
--
ALTER TABLE `projects`
  ADD PRIMARY KEY (`id`),
  ADD KEY `fk_projects_user` (`user_id`);

--
-- Indexes for table `roadmaps`
--
ALTER TABLE `roadmaps`
  ADD PRIMARY KEY (`id`),
  ADD KEY `fk_roadmaps_user` (`user_id`);

--
-- Indexes for table `skills`
--
ALTER TABLE `skills`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `name` (`name`);

--
-- Indexes for table `student_career_goals`
--
ALTER TABLE `student_career_goals`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `unique_student_career_goal` (`student_profile_id`,`career_goal_id`),
  ADD KEY `idx_student_profile` (`student_profile_id`),
  ADD KEY `idx_career_goal` (`career_goal_id`);

--
-- Indexes for table `student_profiles`
--
ALTER TABLE `student_profiles`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `user_id` (`user_id`),
  ADD UNIQUE KEY `student_number` (`student_number`);

--
-- Indexes for table `users`
--
ALTER TABLE `users`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `email` (`email`);

--
-- Indexes for table `user_skills`
--
ALTER TABLE `user_skills`
  ADD PRIMARY KEY (`user_id`,`skill_id`),
  ADD KEY `fk_user_skills_skill` (`skill_id`);

--
-- Indexes for table `verification_requests`
--
ALTER TABLE `verification_requests`
  ADD PRIMARY KEY (`id`),
  ADD KEY `fk_verification_user` (`user_id`);

--
-- AUTO_INCREMENT for dumped tables
--

--
-- AUTO_INCREMENT for table `ai_assessments`
--
ALTER TABLE `ai_assessments`
  MODIFY `id` int(10) UNSIGNED NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `alumni_profiles`
--
ALTER TABLE `alumni_profiles`
  MODIFY `id` int(10) UNSIGNED NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `api_tokens`
--
ALTER TABLE `api_tokens`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=16;

--
-- AUTO_INCREMENT for table `applications`
--
ALTER TABLE `applications`
  MODIFY `id` int(10) UNSIGNED NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `business_profiles`
--
ALTER TABLE `business_profiles`
  MODIFY `id` int(10) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=3;

--
-- AUTO_INCREMENT for table `career_credits`
--
ALTER TABLE `career_credits`
  MODIFY `id` int(10) UNSIGNED NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `career_goals`
--
ALTER TABLE `career_goals`
  MODIFY `id` int(10) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=11;

--
-- AUTO_INCREMENT for table `connections`
--
ALTER TABLE `connections`
  MODIFY `id` int(10) UNSIGNED NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `notifications`
--
ALTER TABLE `notifications`
  MODIFY `id` int(10) UNSIGNED NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `opportunities`
--
ALTER TABLE `opportunities`
  MODIFY `id` int(10) UNSIGNED NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `projects`
--
ALTER TABLE `projects`
  MODIFY `id` int(10) UNSIGNED NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `roadmaps`
--
ALTER TABLE `roadmaps`
  MODIFY `id` int(10) UNSIGNED NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `skills`
--
ALTER TABLE `skills`
  MODIFY `id` int(10) UNSIGNED NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `student_career_goals`
--
ALTER TABLE `student_career_goals`
  MODIFY `id` int(10) UNSIGNED NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `student_profiles`
--
ALTER TABLE `student_profiles`
  MODIFY `id` int(10) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=2;

--
-- AUTO_INCREMENT for table `users`
--
ALTER TABLE `users`
  MODIFY `id` int(10) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=6;

--
-- AUTO_INCREMENT for table `verification_requests`
--
ALTER TABLE `verification_requests`
  MODIFY `id` int(10) UNSIGNED NOT NULL AUTO_INCREMENT;

--
-- Constraints for dumped tables
--

--
-- Constraints for table `ai_assessments`
--
ALTER TABLE `ai_assessments`
  ADD CONSTRAINT `fk_ai_assessments_user` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE ON UPDATE CASCADE;

--
-- Constraints for table `alumni_profiles`
--
ALTER TABLE `alumni_profiles`
  ADD CONSTRAINT `fk_alumni_user` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE ON UPDATE CASCADE;

--
-- Constraints for table `api_tokens`
--
ALTER TABLE `api_tokens`
  ADD CONSTRAINT `fk_api_token_user` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE ON UPDATE CASCADE;

--
-- Constraints for table `applications`
--
ALTER TABLE `applications`
  ADD CONSTRAINT `fk_applications_opportunity` FOREIGN KEY (`opportunity_id`) REFERENCES `opportunities` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `fk_applications_student` FOREIGN KEY (`student_id`) REFERENCES `users` (`id`) ON DELETE CASCADE ON UPDATE CASCADE;

--
-- Constraints for table `business_profiles`
--
ALTER TABLE `business_profiles`
  ADD CONSTRAINT `fk_business_user` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE ON UPDATE CASCADE;

--
-- Constraints for table `career_credits`
--
ALTER TABLE `career_credits`
  ADD CONSTRAINT `fk_career_credits_user` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE ON UPDATE CASCADE;

--
-- Constraints for table `connections`
--
ALTER TABLE `connections`
  ADD CONSTRAINT `fk_connections_receiver` FOREIGN KEY (`receiver_id`) REFERENCES `users` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `fk_connections_requester` FOREIGN KEY (`requester_id`) REFERENCES `users` (`id`) ON DELETE CASCADE ON UPDATE CASCADE;

--
-- Constraints for table `notifications`
--
ALTER TABLE `notifications`
  ADD CONSTRAINT `fk_notifications_user` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE ON UPDATE CASCADE;

--
-- Constraints for table `opportunities`
--
ALTER TABLE `opportunities`
  ADD CONSTRAINT `fk_opportunities_business` FOREIGN KEY (`business_id`) REFERENCES `business_profiles` (`id`) ON DELETE CASCADE ON UPDATE CASCADE;

--
-- Constraints for table `opportunity_skills`
--
ALTER TABLE `opportunity_skills`
  ADD CONSTRAINT `fk_opportunity_skills_opportunity` FOREIGN KEY (`opportunity_id`) REFERENCES `opportunities` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `fk_opportunity_skills_skill` FOREIGN KEY (`skill_id`) REFERENCES `skills` (`id`) ON DELETE CASCADE ON UPDATE CASCADE;

--
-- Constraints for table `projects`
--
ALTER TABLE `projects`
  ADD CONSTRAINT `fk_projects_user` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE ON UPDATE CASCADE;

--
-- Constraints for table `roadmaps`
--
ALTER TABLE `roadmaps`
  ADD CONSTRAINT `fk_roadmaps_user` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE ON UPDATE CASCADE;

--
-- Constraints for table `student_career_goals`
--
ALTER TABLE `student_career_goals`
  ADD CONSTRAINT `fk_student_career_goal_goal` FOREIGN KEY (`career_goal_id`) REFERENCES `career_goals` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `fk_student_career_goal_profile` FOREIGN KEY (`student_profile_id`) REFERENCES `student_profiles` (`id`) ON DELETE CASCADE ON UPDATE CASCADE;

--
-- Constraints for table `student_profiles`
--
ALTER TABLE `student_profiles`
  ADD CONSTRAINT `fk_student_user` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE ON UPDATE CASCADE;

--
-- Constraints for table `user_skills`
--
ALTER TABLE `user_skills`
  ADD CONSTRAINT `fk_user_skills_skill` FOREIGN KEY (`skill_id`) REFERENCES `skills` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `fk_user_skills_user` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE ON UPDATE CASCADE;

--
-- Constraints for table `verification_requests`
--
ALTER TABLE `verification_requests`
  ADD CONSTRAINT `fk_verification_user` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE ON UPDATE CASCADE;
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;

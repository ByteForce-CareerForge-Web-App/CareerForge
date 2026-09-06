-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Host: 127.0.0.1
-- Generation Time: Sep 06, 2026 at 02:05 AM
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
(15, 4, '5ef2e1ea10e7530c82ea1a2cb909186a32e37d31a4b7363cce5ec30dae846014', '2026-09-09 20:30:25', '2026-09-02 18:30:25'),
(16, 3, 'ba429cf580006e86f3aba66cd8e65ce0d5e3f77d45a29fa4744456dac438aa93', '2026-09-12 03:34:50', '2026-09-05 01:34:50'),
(17, 3, '52cae5f020f242bd73de078f8f303b60eff920d0536ad3c8a3f893943331803f', '2026-09-12 04:36:03', '2026-09-05 02:36:03'),
(18, 3, '58c54700ff637bcaf5dfa2e8d9d0a92bec591addd821deebb544c879bffd1a14', '2026-09-12 04:37:07', '2026-09-05 02:37:07'),
(19, 3, 'b0e0e8050339fa0f5e0a0de8f842e59d0428a9ec13d8bed94f2fa3baa0e28bc0', '2026-09-12 04:50:58', '2026-09-05 02:50:58'),
(20, 3, '977e14b9e9670a65d498692c3f29c53f800b2d04904ba870fe49189eb105815e', '2026-09-12 21:32:13', '2026-09-05 19:32:13'),
(21, 3, '00e4b2a4173d63b679c87ac4e8d9372dc6eb3d35776d9afa5983ecf734a379fa', '2026-09-12 22:21:57', '2026-09-05 20:21:57'),
(22, 3, '4b4f8c4f4fb8909870ebe5909e7129eb64f06822358d6d695f35ff6c737a7db7', '2026-09-12 23:08:01', '2026-09-05 21:08:01'),
(23, 3, 'e7ba153b5166b616f53cc1001876a4fb735c9fe8773906485483ab0aa8c6cf44', '2026-09-12 23:47:20', '2026-09-05 21:47:20'),
(24, 3, '473c05e27787f83c1c338e45ec78713a6c6592a04ae4d35e3e4d200c9029efb5', '2026-09-13 00:19:27', '2026-09-05 22:19:27'),
(25, 3, '47a2ef1b3ec49a5d9c011276b188ca66b804832bf4687368c1cd5ba7928403fe', '2026-09-13 00:42:06', '2026-09-05 22:42:06'),
(26, 3, 'a1e8be062d969eb79a1eaf2fb4b508ca1863ab3a104572bd02380daceb5d03bd', '2026-09-13 00:50:18', '2026-09-05 22:50:18'),
(27, 3, 'a8949d5d93ab562807a3294d2884acda5c39fc80b4dc932017c2845f461004d2', '2026-09-13 01:10:40', '2026-09-05 23:10:40'),
(28, 3, 'c1dfafbdffc9af32358cdbd7837fbebfe6e86d30e7b0e899c6e497bb3db98a73', '2026-09-13 01:11:06', '2026-09-05 23:11:06'),
(29, 4, 'f79460ba8f74f03baf13fd3eea3a9ba51ef18cb65507b13986c7b35d038e84d7', '2026-09-13 01:12:54', '2026-09-05 23:12:54'),
(30, 3, '04f973e5e093bdc97f872046382cb52bc207512ce7b07049c1187f1d18d4b013', '2026-09-13 01:16:30', '2026-09-05 23:16:30'),
(31, 3, '59d02de4d5f6ca3366cbfe4965482cad065fe7ad4832999ddb68c76772fdad4f', '2026-09-13 01:24:58', '2026-09-05 23:24:58'),
(32, 3, '5eb643e32e4a43846b6f3a0230416dc44b3e0c33d39ae1ffb9c62d540010bab2', '2026-09-13 01:38:42', '2026-09-05 23:38:42'),
(33, 3, '51ea2152d2bbe938958d6b5f2375ada4bf63d22e52bf56797a0bbac3147f1301', '2026-09-13 01:51:49', '2026-09-05 23:51:49'),
(34, 3, '9797bd0d4d44f64e1ad3047673d911fb57573aa89360884ad880da701dffc2d2', '2026-09-13 02:00:13', '2026-09-06 00:00:13'),
(35, 3, 'dfd01b0e1e5ef07698a636d037fcaef8f65c02b9804d232518229728fd74f17d', '2026-09-13 02:00:35', '2026-09-06 00:00:35'),
(36, 3, '3a21e7a2bf02c677851d70a55d21e07a5bcf0a1728392b6714fb5e644d812184', '2026-09-13 02:01:36', '2026-09-06 00:01:36');

-- --------------------------------------------------------

--
-- Table structure for table `applications`
--

CREATE TABLE `applications` (
  `id` int(10) UNSIGNED NOT NULL,
  `opportunity_id` int(10) UNSIGNED NOT NULL,
  `student_id` int(10) UNSIGNED NOT NULL,
  `status` enum('submitted','reviewing','shortlisted','rejected','accepted','withdrawn') DEFAULT 'submitted',
  `cv_path` varchar(255) DEFAULT NULL,
  `cover_letter` text DEFAULT NULL,
  `notes` text DEFAULT NULL,
  `applied_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `applications`
--

INSERT INTO `applications` (`id`, `opportunity_id`, `student_id`, `status`, `cv_path`, `cover_letter`, `notes`, `applied_at`) VALUES
(1, 1, 3, 'submitted', NULL, NULL, NULL, '2026-09-05 23:30:24');

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

--
-- Dumping data for table `opportunities`
--

INSERT INTO `opportunities` (`id`, `business_id`, `title`, `description`, `type`, `location`, `deadline`, `status`, `created_at`) VALUES
(1, 1, 'Junior Software Developer', 'Graduate opportunity for a junior software developer to gain practical experience in software development.', 'job', 'Durban, KwaZulu-Natal', '2026-09-30', 'open', '2026-09-05 22:32:59');

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
  `skill_code` varchar(10) NOT NULL,
  `name` varchar(100) NOT NULL,
  `category` varchar(100) NOT NULL,
  `description` text DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `skills`
--

INSERT INTO `skills` (`id`, `skill_code`, `name`, `category`, `description`) VALUES
(1, 'S001', 'Python', 'Programming', 'Standardised skill used for career matching, gap analysis and roadmap generation.'),
(2, 'S002', 'Java', 'Programming', 'Standardised skill used for career matching, gap analysis and roadmap generation.'),
(3, 'S003', 'C++', 'Programming', 'Standardised skill used for career matching, gap analysis and roadmap generation.'),
(4, 'S004', 'C#', 'Programming', 'Standardised skill used for career matching, gap analysis and roadmap generation.'),
(5, 'S005', 'JavaScript', 'Programming', 'Standardised skill used for career matching, gap analysis and roadmap generation.'),
(6, 'S006', 'TypeScript', 'Programming', 'Standardised skill used for career matching, gap analysis and roadmap generation.'),
(7, 'S007', 'PHP', 'Programming', 'Standardised skill used for career matching, gap analysis and roadmap generation.'),
(8, 'S008', 'R', 'Programming', 'Standardised skill used for career matching, gap analysis and roadmap generation.'),
(9, 'S009', 'Kotlin', 'Programming', 'Standardised skill used for career matching, gap analysis and roadmap generation.'),
(10, 'S010', 'Swift', 'Programming', 'Standardised skill used for career matching, gap analysis and roadmap generation.'),
(11, 'S011', 'Dart', 'Programming', 'Standardised skill used for career matching, gap analysis and roadmap generation.'),
(12, 'S012', 'Object-Oriented Programming', 'Programming', 'Standardised skill used for career matching, gap analysis and roadmap generation.'),
(13, 'S013', 'Data Structures & Algorithms', 'Programming', 'Standardised skill used for career matching, gap analysis and roadmap generation.'),
(14, 'S014', 'Git', 'Programming', 'Standardised skill used for career matching, gap analysis and roadmap generation.'),
(15, 'S015', 'REST APIs', 'Programming', 'Standardised skill used for career matching, gap analysis and roadmap generation.'),
(16, 'S016', 'Software Development', 'Programming', 'Standardised skill used for career matching, gap analysis and roadmap generation.'),
(17, 'S017', 'Debugging', 'Programming', 'Standardised skill used for career matching, gap analysis and roadmap generation.'),
(18, 'S018', 'Version Control', 'Programming', 'Standardised skill used for career matching, gap analysis and roadmap generation.'),
(19, 'S019', 'HTML', 'Web Development', 'Standardised skill used for career matching, gap analysis and roadmap generation.'),
(20, 'S020', 'CSS', 'Web Development', 'Standardised skill used for career matching, gap analysis and roadmap generation.'),
(21, 'S021', 'React', 'Web Development', 'Standardised skill used for career matching, gap analysis and roadmap generation.'),
(22, 'S022', 'Angular', 'Web Development', 'Standardised skill used for career matching, gap analysis and roadmap generation.'),
(23, 'S023', 'Node.js', 'Web Development', 'Standardised skill used for career matching, gap analysis and roadmap generation.'),
(24, 'S024', 'Responsive Web Design', 'Web Development', 'Standardised skill used for career matching, gap analysis and roadmap generation.'),
(25, 'S025', 'Web APIs', 'Web Development', 'Standardised skill used for career matching, gap analysis and roadmap generation.'),
(26, 'S026', 'Web Accessibility', 'Web Development', 'Standardised skill used for career matching, gap analysis and roadmap generation.'),
(27, 'S027', 'SQL', 'Databases', 'Standardised skill used for career matching, gap analysis and roadmap generation.'),
(28, 'S028', 'MySQL', 'Databases', 'Standardised skill used for career matching, gap analysis and roadmap generation.'),
(29, 'S029', 'PostgreSQL', 'Databases', 'Standardised skill used for career matching, gap analysis and roadmap generation.'),
(30, 'S030', 'Microsoft SQL Server', 'Databases', 'Standardised skill used for career matching, gap analysis and roadmap generation.'),
(31, 'S031', 'SQLite', 'Databases', 'Standardised skill used for career matching, gap analysis and roadmap generation.'),
(32, 'S032', 'Database Design', 'Databases', 'Standardised skill used for career matching, gap analysis and roadmap generation.'),
(33, 'S033', 'Database Normalisation', 'Databases', 'Standardised skill used for career matching, gap analysis and roadmap generation.'),
(34, 'S034', 'Data Modelling', 'Databases', 'Standardised skill used for career matching, gap analysis and roadmap generation.'),
(35, 'S035', 'Database Administration', 'Databases', 'Standardised skill used for career matching, gap analysis and roadmap generation.'),
(36, 'S036', 'Stored Procedures', 'Databases', 'Standardised skill used for career matching, gap analysis and roadmap generation.'),
(37, 'S037', 'Database Security', 'Databases', 'Standardised skill used for career matching, gap analysis and roadmap generation.'),
(38, 'S038', 'Backup & Recovery', 'Databases', 'Standardised skill used for career matching, gap analysis and roadmap generation.'),
(39, 'S039', 'Data Analysis', 'Data & Analytics', 'Standardised skill used for career matching, gap analysis and roadmap generation.'),
(40, 'S040', 'Statistics', 'Data & Analytics', 'Standardised skill used for career matching, gap analysis and roadmap generation.'),
(41, 'S041', 'Probability', 'Data & Analytics', 'Standardised skill used for career matching, gap analysis and roadmap generation.'),
(42, 'S042', 'Data Cleaning', 'Data & Analytics', 'Standardised skill used for career matching, gap analysis and roadmap generation.'),
(43, 'S043', 'Exploratory Data Analysis', 'Data & Analytics', 'Standardised skill used for career matching, gap analysis and roadmap generation.'),
(44, 'S044', 'Data Visualisation', 'Data & Analytics', 'Standardised skill used for career matching, gap analysis and roadmap generation.'),
(45, 'S045', 'Pandas', 'Data & Analytics', 'Standardised skill used for career matching, gap analysis and roadmap generation.'),
(46, 'S046', 'NumPy', 'Data & Analytics', 'Standardised skill used for career matching, gap analysis and roadmap generation.'),
(47, 'S047', 'Matplotlib', 'Data & Analytics', 'Standardised skill used for career matching, gap analysis and roadmap generation.'),
(48, 'S048', 'Power BI', 'Data & Analytics', 'Standardised skill used for career matching, gap analysis and roadmap generation.'),
(49, 'S049', 'Tableau', 'Data & Analytics', 'Standardised skill used for career matching, gap analysis and roadmap generation.'),
(50, 'S050', 'Excel', 'Data & Analytics', 'Standardised skill used for career matching, gap analysis and roadmap generation.'),
(51, 'S051', 'Business Intelligence', 'Data & Analytics', 'Standardised skill used for career matching, gap analysis and roadmap generation.'),
(52, 'S052', 'Data Storytelling', 'Data & Analytics', 'Standardised skill used for career matching, gap analysis and roadmap generation.'),
(53, 'S053', 'Machine Learning', 'AI & Machine Learning', 'Standardised skill used for career matching, gap analysis and roadmap generation.'),
(54, 'S054', 'Supervised Learning', 'AI & Machine Learning', 'Standardised skill used for career matching, gap analysis and roadmap generation.'),
(55, 'S055', 'Unsupervised Learning', 'AI & Machine Learning', 'Standardised skill used for career matching, gap analysis and roadmap generation.'),
(56, 'S056', 'Deep Learning', 'AI & Machine Learning', 'Standardised skill used for career matching, gap analysis and roadmap generation.'),
(57, 'S057', 'Neural Networks', 'AI & Machine Learning', 'Standardised skill used for career matching, gap analysis and roadmap generation.'),
(58, 'S058', 'Natural Language Processing', 'AI & Machine Learning', 'Standardised skill used for career matching, gap analysis and roadmap generation.'),
(59, 'S059', 'Computer Vision', 'AI & Machine Learning', 'Standardised skill used for career matching, gap analysis and roadmap generation.'),
(60, 'S060', 'Scikit-learn', 'AI & Machine Learning', 'Standardised skill used for career matching, gap analysis and roadmap generation.'),
(61, 'S061', 'TensorFlow', 'AI & Machine Learning', 'Standardised skill used for career matching, gap analysis and roadmap generation.'),
(62, 'S062', 'PyTorch', 'AI & Machine Learning', 'Standardised skill used for career matching, gap analysis and roadmap generation.'),
(63, 'S063', 'Model Evaluation', 'AI & Machine Learning', 'Standardised skill used for career matching, gap analysis and roadmap generation.'),
(64, 'S064', 'Feature Engineering', 'AI & Machine Learning', 'Standardised skill used for career matching, gap analysis and roadmap generation.'),
(65, 'S065', 'Generative AI', 'AI & Machine Learning', 'Standardised skill used for career matching, gap analysis and roadmap generation.'),
(66, 'S066', 'Prompt Engineering', 'AI & Machine Learning', 'Standardised skill used for career matching, gap analysis and roadmap generation.'),
(67, 'S067', 'Cloud Computing', 'Cloud Computing', 'Standardised skill used for career matching, gap analysis and roadmap generation.'),
(68, 'S068', 'Amazon Web Services (AWS)', 'Cloud Computing', 'Standardised skill used for career matching, gap analysis and roadmap generation.'),
(69, 'S069', 'Microsoft Azure', 'Cloud Computing', 'Standardised skill used for career matching, gap analysis and roadmap generation.'),
(70, 'S070', 'Google Cloud Platform', 'Cloud Computing', 'Standardised skill used for career matching, gap analysis and roadmap generation.'),
(71, 'S071', 'Cloud Architecture', 'Cloud Computing', 'Standardised skill used for career matching, gap analysis and roadmap generation.'),
(72, 'S072', 'Cloud Security', 'Cloud Computing', 'Standardised skill used for career matching, gap analysis and roadmap generation.'),
(73, 'S073', 'Cloud Storage', 'Cloud Computing', 'Standardised skill used for career matching, gap analysis and roadmap generation.'),
(74, 'S074', 'Serverless Computing', 'Cloud Computing', 'Standardised skill used for career matching, gap analysis and roadmap generation.'),
(75, 'S075', 'Infrastructure as Code', 'Cloud Computing', 'Standardised skill used for career matching, gap analysis and roadmap generation.'),
(76, 'S076', 'Terraform', 'Cloud Computing', 'Standardised skill used for career matching, gap analysis and roadmap generation.'),
(77, 'S077', 'DevOps', 'DevOps', 'Standardised skill used for career matching, gap analysis and roadmap generation.'),
(78, 'S078', 'CI/CD', 'DevOps', 'Standardised skill used for career matching, gap analysis and roadmap generation.'),
(79, 'S079', 'Docker', 'DevOps', 'Standardised skill used for career matching, gap analysis and roadmap generation.'),
(80, 'S080', 'Kubernetes', 'DevOps', 'Standardised skill used for career matching, gap analysis and roadmap generation.'),
(81, 'S081', 'Jenkins', 'DevOps', 'Standardised skill used for career matching, gap analysis and roadmap generation.'),
(82, 'S082', 'GitHub Actions', 'DevOps', 'Standardised skill used for career matching, gap analysis and roadmap generation.'),
(83, 'S083', 'Linux', 'DevOps', 'Standardised skill used for career matching, gap analysis and roadmap generation.'),
(84, 'S084', 'Infrastructure Automation', 'DevOps', 'Standardised skill used for career matching, gap analysis and roadmap generation.'),
(85, 'S085', 'Monitoring & Logging', 'DevOps', 'Standardised skill used for career matching, gap analysis and roadmap generation.'),
(86, 'S086', 'Computer Networking', 'Networking', 'Standardised skill used for career matching, gap analysis and roadmap generation.'),
(87, 'S087', 'TCP/IP', 'Networking', 'Standardised skill used for career matching, gap analysis and roadmap generation.'),
(88, 'S088', 'DNS', 'Networking', 'Standardised skill used for career matching, gap analysis and roadmap generation.'),
(89, 'S089', 'DHCP', 'Networking', 'Standardised skill used for career matching, gap analysis and roadmap generation.'),
(90, 'S090', 'Routing', 'Networking', 'Standardised skill used for career matching, gap analysis and roadmap generation.'),
(91, 'S091', 'Switching', 'Networking', 'Standardised skill used for career matching, gap analysis and roadmap generation.'),
(92, 'S092', 'Network Troubleshooting', 'Networking', 'Standardised skill used for career matching, gap analysis and roadmap generation.'),
(93, 'S093', 'VPN', 'Networking', 'Standardised skill used for career matching, gap analysis and roadmap generation.'),
(94, 'S094', 'Firewalls', 'Networking', 'Standardised skill used for career matching, gap analysis and roadmap generation.'),
(95, 'S095', 'Network Security', 'Networking', 'Standardised skill used for career matching, gap analysis and roadmap generation.'),
(96, 'S096', 'Cybersecurity', 'Cybersecurity', 'Standardised skill used for career matching, gap analysis and roadmap generation.'),
(97, 'S097', 'Information Security', 'Cybersecurity', 'Standardised skill used for career matching, gap analysis and roadmap generation.'),
(98, 'S098', 'Threat Detection', 'Cybersecurity', 'Standardised skill used for career matching, gap analysis and roadmap generation.'),
(99, 'S099', 'Vulnerability Assessment', 'Cybersecurity', 'Standardised skill used for career matching, gap analysis and roadmap generation.'),
(100, 'S100', 'Security Monitoring', 'Cybersecurity', 'Standardised skill used for career matching, gap analysis and roadmap generation.'),
(101, 'S101', 'SIEM', 'Cybersecurity', 'Standardised skill used for career matching, gap analysis and roadmap generation.'),
(102, 'S102', 'Incident Response', 'Cybersecurity', 'Standardised skill used for career matching, gap analysis and roadmap generation.'),
(103, 'S103', 'Risk Management', 'Cybersecurity', 'Standardised skill used for career matching, gap analysis and roadmap generation.'),
(104, 'S104', 'Security Policies', 'Cybersecurity', 'Standardised skill used for career matching, gap analysis and roadmap generation.'),
(105, 'S105', 'Identity & Access Management', 'Cybersecurity', 'Standardised skill used for career matching, gap analysis and roadmap generation.'),
(106, 'S106', 'Ethical Hacking', 'Cybersecurity', 'Standardised skill used for career matching, gap analysis and roadmap generation.'),
(107, 'S107', 'Digital Forensics', 'Cybersecurity', 'Standardised skill used for career matching, gap analysis and roadmap generation.'),
(108, 'S108', 'UI Design', 'UI/UX', 'Standardised skill used for career matching, gap analysis and roadmap generation.'),
(109, 'S109', 'UX Design', 'UI/UX', 'Standardised skill used for career matching, gap analysis and roadmap generation.'),
(110, 'S110', 'Figma', 'UI/UX', 'Standardised skill used for career matching, gap analysis and roadmap generation.'),
(111, 'S111', 'Wireframing', 'UI/UX', 'Standardised skill used for career matching, gap analysis and roadmap generation.'),
(112, 'S112', 'Prototyping', 'UI/UX', 'Standardised skill used for career matching, gap analysis and roadmap generation.'),
(113, 'S113', 'User Research', 'UI/UX', 'Standardised skill used for career matching, gap analysis and roadmap generation.'),
(114, 'S114', 'Usability Testing', 'UI/UX', 'Standardised skill used for career matching, gap analysis and roadmap generation.'),
(115, 'S115', 'Design Thinking', 'UI/UX', 'Standardised skill used for career matching, gap analysis and roadmap generation.'),
(116, 'S116', 'Information Architecture', 'UI/UX', 'Standardised skill used for career matching, gap analysis and roadmap generation.'),
(117, 'S117', 'Business Analysis', 'Business & Systems Analysis', 'Standardised skill used for career matching, gap analysis and roadmap generation.'),
(118, 'S118', 'Requirements Gathering', 'Business & Systems Analysis', 'Standardised skill used for career matching, gap analysis and roadmap generation.'),
(119, 'S119', 'Requirements Analysis', 'Business & Systems Analysis', 'Standardised skill used for career matching, gap analysis and roadmap generation.'),
(120, 'S120', 'Process Modelling', 'Business & Systems Analysis', 'Standardised skill used for career matching, gap analysis and roadmap generation.'),
(121, 'S121', 'UML', 'Business & Systems Analysis', 'Standardised skill used for career matching, gap analysis and roadmap generation.'),
(122, 'S122', 'Systems Analysis', 'Business & Systems Analysis', 'Standardised skill used for career matching, gap analysis and roadmap generation.'),
(123, 'S123', 'Systems Design', 'Business & Systems Analysis', 'Standardised skill used for career matching, gap analysis and roadmap generation.'),
(124, 'S124', 'Documentation', 'Business & Systems Analysis', 'Standardised skill used for career matching, gap analysis and roadmap generation.'),
(125, 'S125', 'Stakeholder Management', 'Business & Systems Analysis', 'Standardised skill used for career matching, gap analysis and roadmap generation.'),
(126, 'S126', 'Problem Solving', 'Business & Systems Analysis', 'Standardised skill used for career matching, gap analysis and roadmap generation.'),
(127, 'S127', 'Project Management', 'Project Management', 'Standardised skill used for career matching, gap analysis and roadmap generation.'),
(128, 'S128', 'Agile', 'Project Management', 'Standardised skill used for career matching, gap analysis and roadmap generation.'),
(129, 'S129', 'Scrum', 'Project Management', 'Standardised skill used for career matching, gap analysis and roadmap generation.'),
(130, 'S130', 'Kanban', 'Project Management', 'Standardised skill used for career matching, gap analysis and roadmap generation.'),
(131, 'S131', 'Project Planning', 'Project Management', 'Standardised skill used for career matching, gap analysis and roadmap generation.'),
(132, 'S132', 'Time Management', 'Project Management', 'Standardised skill used for career matching, gap analysis and roadmap generation.'),
(133, 'S133', 'Team Collaboration', 'Project Management', 'Standardised skill used for career matching, gap analysis and roadmap generation.'),
(134, 'S134', 'Communication', 'Professional & Employability', 'Standardised skill used for career matching, gap analysis and roadmap generation.'),
(135, 'S135', 'Written Communication', 'Professional & Employability', 'Standardised skill used for career matching, gap analysis and roadmap generation.'),
(136, 'S136', 'Verbal Communication', 'Professional & Employability', 'Standardised skill used for career matching, gap analysis and roadmap generation.'),
(137, 'S137', 'Presentation Skills', 'Professional & Employability', 'Standardised skill used for career matching, gap analysis and roadmap generation.'),
(138, 'S138', 'Teamwork', 'Professional & Employability', 'Standardised skill used for career matching, gap analysis and roadmap generation.'),
(139, 'S139', 'Leadership', 'Professional & Employability', 'Standardised skill used for career matching, gap analysis and roadmap generation.'),
(140, 'S140', 'Critical Thinking', 'Professional & Employability', 'Standardised skill used for career matching, gap analysis and roadmap generation.'),
(141, 'S141', 'Adaptability', 'Professional & Employability', 'Standardised skill used for career matching, gap analysis and roadmap generation.'),
(142, 'S142', 'Professionalism', 'Professional & Employability', 'Standardised skill used for career matching, gap analysis and roadmap generation.'),
(143, 'S143', 'Interview Skills', 'Professional & Employability', 'Standardised skill used for career matching, gap analysis and roadmap generation.'),
(144, 'S144', 'CV Writing', 'Professional & Employability', 'Standardised skill used for career matching, gap analysis and roadmap generation.'),
(145, 'S145', 'Networking', 'Professional & Employability', 'Standardised skill used for career matching, gap analysis and roadmap generation.'),
(146, 'S146', 'Portfolio Development', 'Professional & Employability', 'Standardised skill used for career matching, gap analysis and roadmap generation.'),
(147, 'S147', 'Customer Service', 'Professional & Employability', 'Standardised skill used for career matching, gap analysis and roadmap generation.'),
(148, 'S148', 'Windows', 'Professional & Employability', 'Standardised skill used for career matching, gap analysis and roadmap generation.'),
(149, 'S149', 'Hardware Troubleshooting', 'Professional & Employability', 'Standardised skill used for career matching, gap analysis and roadmap generation.'),
(150, 'S150', 'Test Planning', 'Professional & Employability', 'Standardised skill used for career matching, gap analysis and roadmap generation.');

-- --------------------------------------------------------

--
-- Table structure for table `skills_import`
--

CREATE TABLE `skills_import` (
  `Skill_ID` varchar(10) NOT NULL,
  `Skill_Name` varchar(100) NOT NULL,
  `Skill_Category` varchar(100) NOT NULL,
  `Skill_Description` text DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `skills_import`
--

INSERT INTO `skills_import` (`Skill_ID`, `Skill_Name`, `Skill_Category`, `Skill_Description`) VALUES
('S001', 'Python', 'Programming', 'Standardised skill used for career matching, gap analysis and roadmap generation.'),
('S002', 'Java', 'Programming', 'Standardised skill used for career matching, gap analysis and roadmap generation.'),
('S003', 'C++', 'Programming', 'Standardised skill used for career matching, gap analysis and roadmap generation.'),
('S004', 'C#', 'Programming', 'Standardised skill used for career matching, gap analysis and roadmap generation.'),
('S005', 'JavaScript', 'Programming', 'Standardised skill used for career matching, gap analysis and roadmap generation.'),
('S006', 'TypeScript', 'Programming', 'Standardised skill used for career matching, gap analysis and roadmap generation.'),
('S007', 'PHP', 'Programming', 'Standardised skill used for career matching, gap analysis and roadmap generation.'),
('S008', 'R', 'Programming', 'Standardised skill used for career matching, gap analysis and roadmap generation.'),
('S009', 'Kotlin', 'Programming', 'Standardised skill used for career matching, gap analysis and roadmap generation.'),
('S010', 'Swift', 'Programming', 'Standardised skill used for career matching, gap analysis and roadmap generation.'),
('S011', 'Dart', 'Programming', 'Standardised skill used for career matching, gap analysis and roadmap generation.'),
('S012', 'Object-Oriented Programming', 'Programming', 'Standardised skill used for career matching, gap analysis and roadmap generation.'),
('S013', 'Data Structures & Algorithms', 'Programming', 'Standardised skill used for career matching, gap analysis and roadmap generation.'),
('S014', 'Git', 'Programming', 'Standardised skill used for career matching, gap analysis and roadmap generation.'),
('S015', 'REST APIs', 'Programming', 'Standardised skill used for career matching, gap analysis and roadmap generation.'),
('S016', 'Software Development', 'Programming', 'Standardised skill used for career matching, gap analysis and roadmap generation.'),
('S017', 'Debugging', 'Programming', 'Standardised skill used for career matching, gap analysis and roadmap generation.'),
('S018', 'Version Control', 'Programming', 'Standardised skill used for career matching, gap analysis and roadmap generation.'),
('S019', 'HTML', 'Web Development', 'Standardised skill used for career matching, gap analysis and roadmap generation.'),
('S020', 'CSS', 'Web Development', 'Standardised skill used for career matching, gap analysis and roadmap generation.'),
('S021', 'React', 'Web Development', 'Standardised skill used for career matching, gap analysis and roadmap generation.'),
('S022', 'Angular', 'Web Development', 'Standardised skill used for career matching, gap analysis and roadmap generation.'),
('S023', 'Node.js', 'Web Development', 'Standardised skill used for career matching, gap analysis and roadmap generation.'),
('S024', 'Responsive Web Design', 'Web Development', 'Standardised skill used for career matching, gap analysis and roadmap generation.'),
('S025', 'Web APIs', 'Web Development', 'Standardised skill used for career matching, gap analysis and roadmap generation.'),
('S026', 'Web Accessibility', 'Web Development', 'Standardised skill used for career matching, gap analysis and roadmap generation.'),
('S027', 'SQL', 'Databases', 'Standardised skill used for career matching, gap analysis and roadmap generation.'),
('S028', 'MySQL', 'Databases', 'Standardised skill used for career matching, gap analysis and roadmap generation.'),
('S029', 'PostgreSQL', 'Databases', 'Standardised skill used for career matching, gap analysis and roadmap generation.'),
('S030', 'Microsoft SQL Server', 'Databases', 'Standardised skill used for career matching, gap analysis and roadmap generation.'),
('S031', 'SQLite', 'Databases', 'Standardised skill used for career matching, gap analysis and roadmap generation.'),
('S032', 'Database Design', 'Databases', 'Standardised skill used for career matching, gap analysis and roadmap generation.'),
('S033', 'Database Normalisation', 'Databases', 'Standardised skill used for career matching, gap analysis and roadmap generation.'),
('S034', 'Data Modelling', 'Databases', 'Standardised skill used for career matching, gap analysis and roadmap generation.'),
('S035', 'Database Administration', 'Databases', 'Standardised skill used for career matching, gap analysis and roadmap generation.'),
('S036', 'Stored Procedures', 'Databases', 'Standardised skill used for career matching, gap analysis and roadmap generation.'),
('S037', 'Database Security', 'Databases', 'Standardised skill used for career matching, gap analysis and roadmap generation.'),
('S038', 'Backup & Recovery', 'Databases', 'Standardised skill used for career matching, gap analysis and roadmap generation.'),
('S039', 'Data Analysis', 'Data & Analytics', 'Standardised skill used for career matching, gap analysis and roadmap generation.'),
('S040', 'Statistics', 'Data & Analytics', 'Standardised skill used for career matching, gap analysis and roadmap generation.'),
('S041', 'Probability', 'Data & Analytics', 'Standardised skill used for career matching, gap analysis and roadmap generation.'),
('S042', 'Data Cleaning', 'Data & Analytics', 'Standardised skill used for career matching, gap analysis and roadmap generation.'),
('S043', 'Exploratory Data Analysis', 'Data & Analytics', 'Standardised skill used for career matching, gap analysis and roadmap generation.'),
('S044', 'Data Visualisation', 'Data & Analytics', 'Standardised skill used for career matching, gap analysis and roadmap generation.'),
('S045', 'Pandas', 'Data & Analytics', 'Standardised skill used for career matching, gap analysis and roadmap generation.'),
('S046', 'NumPy', 'Data & Analytics', 'Standardised skill used for career matching, gap analysis and roadmap generation.'),
('S047', 'Matplotlib', 'Data & Analytics', 'Standardised skill used for career matching, gap analysis and roadmap generation.'),
('S048', 'Power BI', 'Data & Analytics', 'Standardised skill used for career matching, gap analysis and roadmap generation.'),
('S049', 'Tableau', 'Data & Analytics', 'Standardised skill used for career matching, gap analysis and roadmap generation.'),
('S050', 'Excel', 'Data & Analytics', 'Standardised skill used for career matching, gap analysis and roadmap generation.'),
('S051', 'Business Intelligence', 'Data & Analytics', 'Standardised skill used for career matching, gap analysis and roadmap generation.'),
('S052', 'Data Storytelling', 'Data & Analytics', 'Standardised skill used for career matching, gap analysis and roadmap generation.'),
('S053', 'Machine Learning', 'AI & Machine Learning', 'Standardised skill used for career matching, gap analysis and roadmap generation.'),
('S054', 'Supervised Learning', 'AI & Machine Learning', 'Standardised skill used for career matching, gap analysis and roadmap generation.'),
('S055', 'Unsupervised Learning', 'AI & Machine Learning', 'Standardised skill used for career matching, gap analysis and roadmap generation.'),
('S056', 'Deep Learning', 'AI & Machine Learning', 'Standardised skill used for career matching, gap analysis and roadmap generation.'),
('S057', 'Neural Networks', 'AI & Machine Learning', 'Standardised skill used for career matching, gap analysis and roadmap generation.'),
('S058', 'Natural Language Processing', 'AI & Machine Learning', 'Standardised skill used for career matching, gap analysis and roadmap generation.'),
('S059', 'Computer Vision', 'AI & Machine Learning', 'Standardised skill used for career matching, gap analysis and roadmap generation.'),
('S060', 'Scikit-learn', 'AI & Machine Learning', 'Standardised skill used for career matching, gap analysis and roadmap generation.'),
('S061', 'TensorFlow', 'AI & Machine Learning', 'Standardised skill used for career matching, gap analysis and roadmap generation.'),
('S062', 'PyTorch', 'AI & Machine Learning', 'Standardised skill used for career matching, gap analysis and roadmap generation.'),
('S063', 'Model Evaluation', 'AI & Machine Learning', 'Standardised skill used for career matching, gap analysis and roadmap generation.'),
('S064', 'Feature Engineering', 'AI & Machine Learning', 'Standardised skill used for career matching, gap analysis and roadmap generation.'),
('S065', 'Generative AI', 'AI & Machine Learning', 'Standardised skill used for career matching, gap analysis and roadmap generation.'),
('S066', 'Prompt Engineering', 'AI & Machine Learning', 'Standardised skill used for career matching, gap analysis and roadmap generation.'),
('S067', 'Cloud Computing', 'Cloud Computing', 'Standardised skill used for career matching, gap analysis and roadmap generation.'),
('S068', 'Amazon Web Services (AWS)', 'Cloud Computing', 'Standardised skill used for career matching, gap analysis and roadmap generation.'),
('S069', 'Microsoft Azure', 'Cloud Computing', 'Standardised skill used for career matching, gap analysis and roadmap generation.'),
('S070', 'Google Cloud Platform', 'Cloud Computing', 'Standardised skill used for career matching, gap analysis and roadmap generation.'),
('S071', 'Cloud Architecture', 'Cloud Computing', 'Standardised skill used for career matching, gap analysis and roadmap generation.'),
('S072', 'Cloud Security', 'Cloud Computing', 'Standardised skill used for career matching, gap analysis and roadmap generation.'),
('S073', 'Cloud Storage', 'Cloud Computing', 'Standardised skill used for career matching, gap analysis and roadmap generation.'),
('S074', 'Serverless Computing', 'Cloud Computing', 'Standardised skill used for career matching, gap analysis and roadmap generation.'),
('S075', 'Infrastructure as Code', 'Cloud Computing', 'Standardised skill used for career matching, gap analysis and roadmap generation.'),
('S076', 'Terraform', 'Cloud Computing', 'Standardised skill used for career matching, gap analysis and roadmap generation.'),
('S077', 'DevOps', 'DevOps', 'Standardised skill used for career matching, gap analysis and roadmap generation.'),
('S078', 'CI/CD', 'DevOps', 'Standardised skill used for career matching, gap analysis and roadmap generation.'),
('S079', 'Docker', 'DevOps', 'Standardised skill used for career matching, gap analysis and roadmap generation.'),
('S080', 'Kubernetes', 'DevOps', 'Standardised skill used for career matching, gap analysis and roadmap generation.'),
('S081', 'Jenkins', 'DevOps', 'Standardised skill used for career matching, gap analysis and roadmap generation.'),
('S082', 'GitHub Actions', 'DevOps', 'Standardised skill used for career matching, gap analysis and roadmap generation.'),
('S083', 'Linux', 'DevOps', 'Standardised skill used for career matching, gap analysis and roadmap generation.'),
('S084', 'Infrastructure Automation', 'DevOps', 'Standardised skill used for career matching, gap analysis and roadmap generation.'),
('S085', 'Monitoring & Logging', 'DevOps', 'Standardised skill used for career matching, gap analysis and roadmap generation.'),
('S086', 'Computer Networking', 'Networking', 'Standardised skill used for career matching, gap analysis and roadmap generation.'),
('S087', 'TCP/IP', 'Networking', 'Standardised skill used for career matching, gap analysis and roadmap generation.'),
('S088', 'DNS', 'Networking', 'Standardised skill used for career matching, gap analysis and roadmap generation.'),
('S089', 'DHCP', 'Networking', 'Standardised skill used for career matching, gap analysis and roadmap generation.'),
('S090', 'Routing', 'Networking', 'Standardised skill used for career matching, gap analysis and roadmap generation.'),
('S091', 'Switching', 'Networking', 'Standardised skill used for career matching, gap analysis and roadmap generation.'),
('S092', 'Network Troubleshooting', 'Networking', 'Standardised skill used for career matching, gap analysis and roadmap generation.'),
('S093', 'VPN', 'Networking', 'Standardised skill used for career matching, gap analysis and roadmap generation.'),
('S094', 'Firewalls', 'Networking', 'Standardised skill used for career matching, gap analysis and roadmap generation.'),
('S095', 'Network Security', 'Networking', 'Standardised skill used for career matching, gap analysis and roadmap generation.'),
('S096', 'Cybersecurity', 'Cybersecurity', 'Standardised skill used for career matching, gap analysis and roadmap generation.'),
('S097', 'Information Security', 'Cybersecurity', 'Standardised skill used for career matching, gap analysis and roadmap generation.'),
('S098', 'Threat Detection', 'Cybersecurity', 'Standardised skill used for career matching, gap analysis and roadmap generation.'),
('S099', 'Vulnerability Assessment', 'Cybersecurity', 'Standardised skill used for career matching, gap analysis and roadmap generation.'),
('S100', 'Security Monitoring', 'Cybersecurity', 'Standardised skill used for career matching, gap analysis and roadmap generation.'),
('S101', 'SIEM', 'Cybersecurity', 'Standardised skill used for career matching, gap analysis and roadmap generation.'),
('S102', 'Incident Response', 'Cybersecurity', 'Standardised skill used for career matching, gap analysis and roadmap generation.'),
('S103', 'Risk Management', 'Cybersecurity', 'Standardised skill used for career matching, gap analysis and roadmap generation.'),
('S104', 'Security Policies', 'Cybersecurity', 'Standardised skill used for career matching, gap analysis and roadmap generation.'),
('S105', 'Identity & Access Management', 'Cybersecurity', 'Standardised skill used for career matching, gap analysis and roadmap generation.'),
('S106', 'Ethical Hacking', 'Cybersecurity', 'Standardised skill used for career matching, gap analysis and roadmap generation.'),
('S107', 'Digital Forensics', 'Cybersecurity', 'Standardised skill used for career matching, gap analysis and roadmap generation.'),
('S108', 'UI Design', 'UI/UX', 'Standardised skill used for career matching, gap analysis and roadmap generation.'),
('S109', 'UX Design', 'UI/UX', 'Standardised skill used for career matching, gap analysis and roadmap generation.'),
('S110', 'Figma', 'UI/UX', 'Standardised skill used for career matching, gap analysis and roadmap generation.'),
('S111', 'Wireframing', 'UI/UX', 'Standardised skill used for career matching, gap analysis and roadmap generation.'),
('S112', 'Prototyping', 'UI/UX', 'Standardised skill used for career matching, gap analysis and roadmap generation.'),
('S113', 'User Research', 'UI/UX', 'Standardised skill used for career matching, gap analysis and roadmap generation.'),
('S114', 'Usability Testing', 'UI/UX', 'Standardised skill used for career matching, gap analysis and roadmap generation.'),
('S115', 'Design Thinking', 'UI/UX', 'Standardised skill used for career matching, gap analysis and roadmap generation.'),
('S116', 'Information Architecture', 'UI/UX', 'Standardised skill used for career matching, gap analysis and roadmap generation.'),
('S117', 'Business Analysis', 'Business & Systems Analysis', 'Standardised skill used for career matching, gap analysis and roadmap generation.'),
('S118', 'Requirements Gathering', 'Business & Systems Analysis', 'Standardised skill used for career matching, gap analysis and roadmap generation.'),
('S119', 'Requirements Analysis', 'Business & Systems Analysis', 'Standardised skill used for career matching, gap analysis and roadmap generation.'),
('S120', 'Process Modelling', 'Business & Systems Analysis', 'Standardised skill used for career matching, gap analysis and roadmap generation.'),
('S121', 'UML', 'Business & Systems Analysis', 'Standardised skill used for career matching, gap analysis and roadmap generation.'),
('S122', 'Systems Analysis', 'Business & Systems Analysis', 'Standardised skill used for career matching, gap analysis and roadmap generation.'),
('S123', 'Systems Design', 'Business & Systems Analysis', 'Standardised skill used for career matching, gap analysis and roadmap generation.'),
('S124', 'Documentation', 'Business & Systems Analysis', 'Standardised skill used for career matching, gap analysis and roadmap generation.'),
('S125', 'Stakeholder Management', 'Business & Systems Analysis', 'Standardised skill used for career matching, gap analysis and roadmap generation.'),
('S126', 'Problem Solving', 'Business & Systems Analysis', 'Standardised skill used for career matching, gap analysis and roadmap generation.'),
('S127', 'Project Management', 'Project Management', 'Standardised skill used for career matching, gap analysis and roadmap generation.'),
('S128', 'Agile', 'Project Management', 'Standardised skill used for career matching, gap analysis and roadmap generation.'),
('S129', 'Scrum', 'Project Management', 'Standardised skill used for career matching, gap analysis and roadmap generation.'),
('S130', 'Kanban', 'Project Management', 'Standardised skill used for career matching, gap analysis and roadmap generation.'),
('S131', 'Project Planning', 'Project Management', 'Standardised skill used for career matching, gap analysis and roadmap generation.'),
('S132', 'Time Management', 'Project Management', 'Standardised skill used for career matching, gap analysis and roadmap generation.'),
('S133', 'Team Collaboration', 'Project Management', 'Standardised skill used for career matching, gap analysis and roadmap generation.'),
('S134', 'Communication', 'Professional & Employability', 'Standardised skill used for career matching, gap analysis and roadmap generation.'),
('S135', 'Written Communication', 'Professional & Employability', 'Standardised skill used for career matching, gap analysis and roadmap generation.'),
('S136', 'Verbal Communication', 'Professional & Employability', 'Standardised skill used for career matching, gap analysis and roadmap generation.'),
('S137', 'Presentation Skills', 'Professional & Employability', 'Standardised skill used for career matching, gap analysis and roadmap generation.'),
('S138', 'Teamwork', 'Professional & Employability', 'Standardised skill used for career matching, gap analysis and roadmap generation.'),
('S139', 'Leadership', 'Professional & Employability', 'Standardised skill used for career matching, gap analysis and roadmap generation.'),
('S140', 'Critical Thinking', 'Professional & Employability', 'Standardised skill used for career matching, gap analysis and roadmap generation.'),
('S141', 'Adaptability', 'Professional & Employability', 'Standardised skill used for career matching, gap analysis and roadmap generation.'),
('S142', 'Professionalism', 'Professional & Employability', 'Standardised skill used for career matching, gap analysis and roadmap generation.'),
('S143', 'Interview Skills', 'Professional & Employability', 'Standardised skill used for career matching, gap analysis and roadmap generation.'),
('S144', 'CV Writing', 'Professional & Employability', 'Standardised skill used for career matching, gap analysis and roadmap generation.'),
('S145', 'Networking', 'Professional & Employability', 'Standardised skill used for career matching, gap analysis and roadmap generation.'),
('S146', 'Portfolio Development', 'Professional & Employability', 'Standardised skill used for career matching, gap analysis and roadmap generation.'),
('S147', 'Customer Service', 'Professional & Employability', 'Standardised skill used for career matching, gap analysis and roadmap generation.'),
('S148', 'Windows', 'Professional & Employability', 'Standardised skill used for career matching, gap analysis and roadmap generation.'),
('S149', 'Hardware Troubleshooting', 'Professional & Employability', 'Standardised skill used for career matching, gap analysis and roadmap generation.'),
('S150', 'Test Planning', 'Professional & Employability', 'Standardised skill used for career matching, gap analysis and roadmap generation.');

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

--
-- Dumping data for table `user_skills`
--

INSERT INTO `user_skills` (`user_id`, `skill_id`, `level`) VALUES
(3, 7, 'beginner'),
(3, 21, 'beginner'),
(3, 23, 'beginner'),
(3, 28, 'beginner'),
(3, 53, 'beginner'),
(3, 66, 'beginner');

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
  ADD UNIQUE KEY `name` (`name`),
  ADD UNIQUE KEY `uq_skills_skill_code` (`skill_code`);

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
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=37;

--
-- AUTO_INCREMENT for table `applications`
--
ALTER TABLE `applications`
  MODIFY `id` int(10) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=2;

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
  MODIFY `id` int(10) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=2;

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
  MODIFY `id` int(10) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=151;

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

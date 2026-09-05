# CareerForge – Backend

CareerForge is a graduate employability platform designed to connect **students, alumni, and businesses** while helping graduates improve their employability through digital tools and AI-powered career support.

This repository contains the **PHP backend/API** for the CareerForge mobile application.

> **Status:** Work in Progress 🚧

The backend is currently being developed and integrated with the CareerForge React Native/Expo mobile application.

---

## 📌 Project Overview

The CareerForge backend provides the server-side functionality required by the mobile application, including:

* User registration and authentication
* Student and business profiles
* Career goals
* Skills management
* Career opportunities
* Job/opportunity applications
* AI career assistance
* Authentication and authorization
* Database connectivity
* API request handling
* Cross-Origin Resource Sharing (CORS)

The backend is built using **PHP** and connects to a **MySQL database** running through XAMPP during development.

---

## 🛠️ Technologies Used

| Technology          | Purpose                                      |
| ------------------- | -------------------------------------------- |
| PHP                 | Backend/API development                      |
| MySQL               | Database management                          |
| XAMPP               | Local development server                     |
| REST-style API      | Communication between mobile app and backend |
| JSON                | API request and response format              |
| React Native / Expo | Frontend mobile application                  |
| GitHub              | Version control and collaboration            |

---

## 📂 Backend Structure

```text
CareerForge/
│
├── api/
│   │
│   ├── ai-career-assistant.php
│   ├── applications.php
│   ├── career-goals.php
│   ├── opportunities.php
│   ├── profiles.php
│   └── skills.php
│
│   ├── config/
│   │   ├── application.php
│   │   ├── auth.php
│   │   ├── cors.php
│   │   ├── database.php
│   │   ├── opportunities.php
│   │   └── profiles.php
│   │
│   └── profiles/
│       ├── business.php
│       └── student.php
│
└── views/
    │
    └── auth/
        ├── login.php
        └── register.php
```

---

# 📁 Directory and File Descriptions

## `api/`

The `api` directory contains the main backend endpoints used by the CareerForge mobile application.

### `ai-career-assistant.php`

Handles functionality related to the CareerForge **AI Career Assistant**.

The intended purpose of this endpoint is to support AI-powered career guidance based on information such as a user's profile, skills, career goals, and employability-related information.

> **Status:** Work in Progress 🚧

---

### `applications.php`

Handles functionality related to applications for career opportunities.

Potential functionality includes:

* Submitting applications
* Retrieving applications
* Checking application status
* Managing applications associated with opportunities

> **Status:** Work in Progress 🚧

---

### `career-goals.php`

Handles career goal information associated with users.

Career goals are intended to help CareerForge understand what type of career a student or graduate is working towards.

This information can also be used by future AI functionality to provide more relevant career recommendations.

---

### `opportunities.php`

Handles career opportunities posted on the CareerForge platform.

Opportunities may include:

* Internships
* Graduate programmes
* Jobs
* Other employment-related opportunities

The endpoint communicates with the database to retrieve and manage opportunity information.

---

### `profiles.php`

Provides general profile-related API functionality.

It acts as a central endpoint for profile operations while more specific student and business profile functionality is handled within the `api/profiles/` directory.

---

### `skills.php`

Handles skills-related functionality.

The CareerForge platform uses skills to help connect users with relevant career opportunities and support future employability analysis.

---

# 📁 `api/config/`

The `config` directory contains reusable backend configuration and helper files.

These files are used by multiple API endpoints.

---

### `application.php`

Contains application-level configuration and/or functionality used by the CareerForge backend.

---

### `auth.php`

Handles authentication-related functionality.

This includes functionality used to verify authenticated users and work with authentication tokens.

Authenticated API requests can use a token-based authentication system to identify the currently logged-in user.

---

### `cors.php`

Handles **Cross-Origin Resource Sharing (CORS)** configuration.

This is necessary because the CareerForge frontend and backend may run from different origins during development.

For example:

```text
React Native / Expo Application
              │
              │ HTTP Request
              ▼
       CareerForge PHP API
              │
              ▼
          MySQL Database
```

---

### `database.php`

Responsible for establishing the connection between the PHP backend and the CareerForge MySQL database.

The database connection is shared by API endpoints that need to read or modify database information.

During local development, the database is hosted through **XAMPP**.

---

### `opportunities.php`

Contains reusable configuration or helper functionality related to career opportunities.

This allows opportunity-related logic to be shared across relevant API endpoints.

---

### `profiles.php`

Contains reusable functionality related to user profiles.

This supports profile-related operations across the backend.

---

# 📁 `api/profiles/`

This directory contains profile-specific API endpoints.

---

### `business.php`

Handles business/employer profile functionality.

The business profile system is intended to allow companies to maintain information that can be used when posting opportunities and interacting with candidates.

---

### `student.php`

Handles student profile functionality.

Student profiles can contain information such as:

* Qualification
* Graduation year
* Campus
* Career goals
* Skills
* Biography
* Employability-related information

This information can later be used by CareerForge's recommendation and AI features.

---

# 📁 `views/auth/`

The `views/auth` directory contains authentication-related PHP files.

---

### `login.php`

Handles user login functionality.

The login process validates the user's credentials and allows the application to authenticate the user before accessing protected functionality.

The mobile application can then use the authentication information when making requests to protected API endpoints.

---

### `register.php`

Handles user registration.

The registration process creates a user account and stores the required information in the CareerForge database.

Different user roles can be supported by the platform, including:

* Student
* Business/Employer
* Alumni
* Administrator

---

# 🔐 Authentication

CareerForge uses authentication to protect API functionality that should only be accessible to logged-in users.

The general authentication flow is:

```text
User
 │
 ▼
Mobile Application
 │
 │ Login credentials
 ▼
PHP Backend
 │
 │ Validate credentials
 ▼
MySQL Database
 │
 │ User verified
 ▼
Authentication Token
 │
 ▼
Mobile Application
 │
 │ Authenticated API requests
 ▼
Protected CareerForge Endpoints
```

Protected endpoints can verify the authentication token before processing requests.

---

# 🗄️ Database

The CareerForge backend uses **MySQL** as its database system.

During development, the database is hosted locally using **XAMPP**.

The database contains information supporting areas such as:

* Users
* Student profiles
* Alumni profiles
* Business profiles
* Skills
* User skills
* Projects
* Opportunities
* Applications
* Connections
* Notifications
* Career credits

The database structure may continue to change as development progresses.

---

# 🚀 Local Development Setup

## 1. Install XAMPP

Install XAMPP and start:

```text
Apache
MySQL
```

---

## 2. Place the Backend in `htdocs`

Copy the CareerForge backend into the XAMPP `htdocs` directory.

Example:

```text
C:\xampp\htdocs\CareerForge\
```

The API can then be accessed through:

```text
http://localhost/CareerForge/
```

---

## 3. Create the Database

Open:

```text
http://localhost/phpmyadmin
```

Create the CareerForge database and import the project's SQL database structure.

Make sure the database name matches the configuration used by:

```text
api/config/database.php
```

---

## 4. Configure the Database Connection

Open:

```text
api/config/database.php
```

Update the database connection settings for the local development environment.

Typical development settings may include:

```text
Host: localhost
Username: root
Password: 
Database: CareerForge
```

> Do not commit production database credentials or passwords to GitHub.

---

# 📱 Connecting the Mobile Application

The CareerForge mobile application is built using **React Native with Expo**.

The mobile application communicates with the PHP backend using HTTP requests.

For example:

```text
React Native / Expo
        │
        │ HTTP / JSON
        ▼
CareerForge PHP API
        │
        │ SQL
        ▼
    MySQL Database
```

When testing with a physical mobile device, `localhost` refers to the **phone itself**, not the computer running XAMPP.

Therefore, the mobile application should use the computer's local network IP address when communicating with the development server.

Example:

```text
http://192.168.x.x/CareerForge/api/
```

The computer and mobile device must generally be connected to the same local network.

---

# 🔗 API Endpoints

The backend is organised around several API areas.

| Endpoint                       | Purpose                  |
| ------------------------------ | ------------------------ |
| `/api/ai-career-assistant.php` | AI career assistance     |
| `/api/applications.php`        | Opportunity applications |
| `/api/career-goals.php`        | Career goals             |
| `/api/opportunities.php`       | Career opportunities     |
| `/api/profiles.php`            | Profile functionality    |
| `/api/skills.php`              | Skills                   |
| `/api/profiles/student.php`    | Student profiles         |
| `/api/profiles/business.php`   | Business profiles        |
| `/views/auth/login.php`        | Login                    |
| `/views/auth/register.php`     | Registration             |

> Endpoint functionality is still being developed and may change during the project.

---

# 🧪 Testing

API endpoints can be tested using tools such as:

* Postman
* Browser requests for applicable `GET` endpoints
* React Native/Expo application requests

When testing API endpoints, ensure that:

1. Apache is running.
2. MySQL is running.
3. The CareerForge database exists.
4. The PHP backend is located inside `htdocs`.
5. The API URL is correct.
6. The correct HTTP method is being used.
7. Authentication tokens are included where required.

Example request:

```text
GET /api/profiles/student.php
```

Authenticated requests may require:

```text
Authorization: Bearer <token>
```

---

# ⚠️ Current Development Status

CareerForge is currently a **work in progress**.

Some backend functionality is implemented and connected to the mobile application, while other functionality is still under development.

Current development areas include:

* [x] PHP backend structure
* [x] Database connectivity
* [x] User registration
* [x] User login
* [x] Authentication
* [x] Student profile API
* [x] Business profile API
* [ ] Complete opportunity management
* [ ] Complete application management
* [ ] Complete skills functionality
* [ ] Complete career goal functionality
* [ ] AI Career Assistant
* [ ] AI-powered employability analysis
* [ ] AI career roadmap
* [ ] Final API testing
* [ ] Production deployment

The checklist should be updated as development progresses.

---

# 🔒 Security Notes

For development purposes, the backend may use local XAMPP configuration.

Before production deployment, additional security measures should be implemented, including:

* Secure password hashing
* Environment-based configuration
* Protection of database credentials
* Input validation
* SQL injection prevention
* Authentication and authorization checks
* Secure token management
* HTTPS
* Proper CORS configuration
* Error handling that does not expose sensitive information

**Never commit passwords, API keys, database credentials, or authentication secrets to GitHub.**

---

# 👥 CareerForge Team

CareerForge is being developed as a collaborative project.

The project includes:

* Backend development
* Mobile application development
* UI/UX design
* Research and domain analysis
* Presentation and project development

The backend works together with the CareerForge React Native/Expo mobile application.

---

# 🎯 Project Goal

The goal of CareerForge is to **empower graduate employability through AI and digital innovation**.

The platform aims to help students and graduates:

* Build professional profiles
* Identify career goals
* Develop relevant skills
* Discover career opportunities
* Apply for opportunities
* Connect with businesses
* Receive personalised career guidance
* Improve their employability

The long-term vision is to combine user data, skills, career goals, opportunities, and AI to provide graduates with more personalised career development support.

---

# 📌 Future Development

Future backend development may include:

1. Completing all API endpoints.
2. Improving authentication and authorization.
3. Completing student, alumni, and business profile functionality.
4. Implementing opportunity management.
5. Implementing application tracking.
6. Expanding skills and career-goal functionality.
7. Integrating the AI Career Assistant.
8. Developing AI-powered employability scoring.
9. Developing personalised career roadmaps.
10. Connecting users with relevant opportunities based on their skills and career goals.
11. Performing complete integration and security testing.
12. Preparing the backend for production deployment.

---

## 📄 License

This project is currently being developed as part of the CareerForge project and is not currently intended for unrestricted redistribution.

---

**CareerForge — Empowering Graduate Employability through AI and Digital Innovation.**

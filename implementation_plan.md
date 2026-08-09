# Implementation Plan - Mastery Quiz Portal (Node.js + Express + MySQL + Vite)

Build an advanced, full-stack practice and mastery quiz portal utilizing **Vite + Vanilla JavaScript + Glassmorphic Vanilla CSS** for the frontend, and a **Node.js + Express + MySQL** backend server. This portal incorporates the active learning & repetition algorithm from `quiz_logic.html` alongside enterprise features such as PDF activity report generation, 3-tier role hierarchy (`super_admin`, `admin`, `user`), KaTeX math/image rendering, live admin preview editor, protected image uploads, and data-driven weak area analytics.

---

## User Review Required

> [!IMPORTANT]
> 1. **Core Mastery Quiz Logic Integration**:
>    - Incorporates the complete repetition algorithm from `quiz_logic.html`:
>      - **Mastery Required (1–5)**: Questions remain in the active pool until answered correctly $N$ times.
>      - **Pool Management**: Incorrect answers keep the question in the active pool and trigger a pool shuffle so questions reappear.
>      - **Instant Feedback**: Highlight correct/wrong choices immediately, display full explanation, and auto-advance after 1.5 seconds.
>      - **Live Telemetry & Timer**: Tracks overall time spent as well as per-question time telemetry.
> 
> 2. **3-Tier Role Hierarchy & Authentication**:
>    - **`super_admin`**: Seeded with default credentials (`alams1983@gmail.com` / `vanilamaam@2026`). Possesses full system rights + **User Role Management** (can list users, promote to `admin`, demote to `user`). Password reset disabled for Super Admin.
>    - **`admin`**: Promoted by Super Admin. Manages quizzes, question bank, categories, tags, bulk uploader (CSV/JSON), and views platform analytics.
>    - **`user`**: Self-registration capturing `full_name`, `email`, and `password`. Takes quizzes in standard or mastery mode, views personal analytics, practices weak areas, and downloads PDF activity reports.
> 
> 3. **PDF Activity Report Engine (`pdfGenerator.js`)**:
>    - Allows users to download a branded PDF report on quiz completion or from attempt history.
>    - Contains Student Profile details, Quiz & Mode configuration, Performance Overview Grid, and a detailed per-question telemetry table with rendered formulas.
> 
> 4. **LaTeX Math Equation & Media Support (KaTeX)**:
>    - Dynamic client-side math parsing (`$...$` inline, `$$...$$` block) across question cards, explanations, admin split-screen preview editor, and generated PDF reports.
> 
> 5. **Protected Image File Storage (`uploads/`)**:
>    - Question images are stored on the server under `uploads/`. Direct static directory listing is blocked; access requires authentication via `GET /api/images/:filename`.

---

## Proposed Architecture & Directory Structure

```
/Users/sarfaraj/EdutorAi_Quiz_Mock/
├── package.json               # express, mysql2, bcryptjs, jsonwebtoken, multer, csv-parser, katex, jspdf, html2canvas, vite
├── vite.config.js             # Vite configuration with API proxy (/api -> http://localhost:5000)
├── schema.sql                 # Complete MySQL Schema (users, categories, tags, quizzes, quiz_tags, questions, activity logs, attempts)
├── .env.example               # Environment variables (PORT, DB_HOST, DB_USER, DB_PASS, DB_NAME, JWT_SECRET, UPLOAD_DIR)
├── server/
├── index.js                   # Express server entry point & middleware setup
├── db.js                      # MySQL connection pool & automatic table initialization
├── middleware/
│   └── auth.js                # JWT authentication middleware & role guards (requireSuperAdmin, requireAdmin)
└── routes/
    ├── auth.js                # Registration, login, password reset, and Super Admin user management API
    ├── categories.js          # Hierarchical category tree CRUD API
    ├── tags.js                # Tag dictionary & search API
    ├── quizzes.js             # Quiz & Question CRUD, CSV/JSON bulk upload handler
    ├── images.js              # Protected image streaming endpoint GET /api/images/:filename
    └── analytics.js           # Question activity logging, attempt stats, and Weak Area practice generator
├── uploads/                   # Protected local disk directory for question images
├── index.html                 # Single Page Application shell (KaTeX CSS/JS and font links included)
├── src/
│   ├── style.css              # Glassmorphic Design System (CSS tokens, dark/light themes, animations, PDF template styles)
│   ├── main.js                # App Router, global state management, theme toggle, and route protection
│   ├── services/
│   │   ├── api.js             # Centralized fetch client handling JWT auth headers and error handling
│   │   ├── katexRenderer.js   # Client-side helper for rendering LaTeX equations safely
│   │   ├── pdfGenerator.js    # Client-side PDF generation script for quiz activity reports
│   │   └── csvJsonParser.js   # Client-side validation and parsing helper for CSV/JSON question import
│   ├── components/
│   │   ├── Navbar.js          # Top navigation bar with user profile, role badge, and theme switcher
│   │   ├── CategoryTree.js    # Collapsible hierarchical category sidebar/tree component
│   │   ├── Modal.js           # Reusable glassmorphic modal component
│   │   ├── BulkUploadModal.js # CSV/JSON question bulk uploader modal with preview table
│   │   └── MathLiveEditor.js  # Admin split-screen preview editor for LaTeX and image previews
│   └── views/
│       ├── LoginView.js       # Authentication view (Login, User Signup with Full Name, Password Reset Request)
│       ├── UserDashboard.js   # Main user hub (Quiz catalogue, Taxonomy filter, Tag search, Weak Area launcher)
│       ├── QuizView.js        # Mastery Quiz Engine (incorporates quiz_logic.html repetition pool, timer, KaTeX, PDF export)
│       ├── AnalyticsView.js   # Detailed personal activity metrics, attempt history, per-question weakness breakdown
│       └── AdminDashboard.js  # Admin & Super Admin panel (Quiz/Question management, Categories, Tags, User Role Management)
```

---

## Detailed Component Specifications

### 1. MySQL Database Schema (`schema.sql`)

- **`users`**:
  - `id` INT AUTO_INCREMENT PRIMARY KEY
  - `full_name` VARCHAR(255) NOT NULL
  - `email` VARCHAR(255) UNIQUE NOT NULL
  - `password_hash` VARCHAR(255) NOT NULL
  - `role` ENUM('super_admin', 'admin', 'user') DEFAULT 'user'
  - `reset_token` VARCHAR(255) NULL
  - `reset_expires` DATETIME NULL
  - `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP

- **`categories`**:
  - `id` INT AUTO_INCREMENT PRIMARY KEY
  - `name` VARCHAR(100) NOT NULL
  - `parent_id` INT NULL (Self-referencing foreign key for infinite nested subcategories)
  - `description` TEXT
  - `icon` VARCHAR(50) DEFAULT 'folder'

- **`tags`**:
  - `id` INT AUTO_INCREMENT PRIMARY KEY
  - `name` VARCHAR(50) UNIQUE NOT NULL

- **`quizzes`**:
  - `id` INT AUTO_INCREMENT PRIMARY KEY
  - `title` VARCHAR(255) NOT NULL
  - `description` TEXT
  - `category_id` INT FOREIGN KEY -> `categories(id)` ON DELETE SET NULL
  - `created_by` INT FOREIGN KEY -> `users(id)`
  - `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP

- **`quiz_tags`**:
  - `quiz_id` INT FOREIGN KEY -> `quizzes(id)` ON DELETE CASCADE
  - `tag_id` INT FOREIGN KEY -> `tags(id)` ON DELETE CASCADE
  - PRIMARY KEY (`quiz_id`, `tag_id`)

- **`questions`**:
  - `id` INT AUTO_INCREMENT PRIMARY KEY
  - `quiz_id` INT FOREIGN KEY -> `quizzes(id)` ON DELETE CASCADE
  - `question_text` TEXT NOT NULL
  - `options_json` JSON NOT NULL (Array of string options, e.g. `["Joule", "Newton", "Pascal", "Watt"]`)
  - `correct_answer_index` INT NOT NULL (0-based index)
  - `explanation` TEXT
  - `tags_json` JSON (Array of string tags)
  - `image_path` VARCHAR(255) NULL

- **`question_activity_logs`**:
  - `id` INT AUTO_INCREMENT PRIMARY KEY
  - `user_id` INT FOREIGN KEY -> `users(id)` ON DELETE CASCADE
  - `question_id` INT FOREIGN KEY -> `questions(id)` ON DELETE CASCADE
  - `quiz_id` INT FOREIGN KEY -> `quizzes(id)` ON DELETE CASCADE
  - `is_correct` BOOLEAN NOT NULL
  - `time_spent_sec` INT DEFAULT 0
  - `selected_option_index` INT NOT NULL
  - `attempt_timestamp` TIMESTAMP DEFAULT CURRENT_TIMESTAMP

- **`quiz_attempts`**:
  - `id` INT AUTO_INCREMENT PRIMARY KEY
  - `user_id` INT FOREIGN KEY -> `users(id)` ON DELETE CASCADE
  - `quiz_id` INT FOREIGN KEY -> `quizzes(id)` ON DELETE CASCADE
  - `score` INT NOT NULL
  - `total_questions` INT NOT NULL
  - `accuracy_pct` INT NOT NULL
  - `time_taken_sec` INT NOT NULL
  - `mastery_level` INT DEFAULT 1
  - `details_json` JSON NOT NULL (Stores question-level statistics, counts, and timings)
  - `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP

---

### 2. Mastery Quiz Engine Implementation (`QuizView.js` & Backend Sync)

Derived directly from `quiz_logic.html` with full-stack synchronization:

1. **State Initialization**:
   - `masteryLevel`: Configurable by user (1 to 5) or 1 for standard mode.
   - `pool`: Array of question IDs where `correctCounts[qId] < masteryLevel`.
   - `correctCounts`: Object tracking correct responses per question ID.
   - `wrongCounts`: Object tracking wrong responses per question ID.
   - `itemStartTime`: Timestamp recorded when a question is displayed to calculate exact `time_spent_sec` per item.

2. **Question Lifecycle & Feedback**:
   - Selecting an option locks buttons, evaluates `selectedIdx === correct_answer_index`.
   - On **Correct**: Increments `correctCounts[qId]` and `totalCorrect`. If `correctCounts[qId] >= masteryLevel`, removes `qId` from `pool`.
   - On **Incorrect**: Increments `wrongCounts[qId]` and `totalWrong`. Question remains in `pool`; `pool` is randomly shuffled.
   - Displays animated glassmorphic feedback block (`fbHead`, `fbCorrectAnswer`, `fbExplain`).
   - Logs individual attempt telemetry asynchronously via `POST /api/analytics/question-log`.
   - Auto-advances to `loadNextQuestion()` after 1500ms delay.

3. **Completion & Analytics Recording**:
   - When `pool.length === 0`, stops quiz timer.
   - Computes total questions, total attempts, accuracy %, and time taken.
   - Sends full payload to `POST /api/analytics/quiz-attempt`.
   - Displays completion summary grid and detailed per-question attempt summary table.
   - Enables **"📄 Download PDF Report"** button.

---

### 3. Role-Based Access Control & User Management API

- **Hardcoded Super Admin Seeding**:
  - On backend pool initialization (`server/db.js`), check if user `alams1983@gmail.com` exists. If not, auto-create account with `role = 'super_admin'` and hashed password for `vanilamaam@2026`.
- **Protected Endpoints**:
  - `requireAuth`: Validates JWT token.
  - `requireAdmin`: Validates `role === 'admin' || role === 'super_admin'`.
  - `requireSuperAdmin`: Validates `role === 'super_admin'`.
- **Super Admin Panel Actions**:
  - `GET /api/auth/users`: List all users with name, email, role, and registration date.
  - `PUT /api/auth/users/:id/role`: Change user role between `'user'` and `'admin'`. (Super Admin role cannot be demoted or changed).

---

### 4. Shareable PDF Activity Report Engine (`pdfGenerator.js`)

- Built using `jsPDF` + `html2canvas`.
- Renders an off-screen, perfectly styled HTML report template:
  - **Header**: EdutorAI Logo, Document Title ("Quiz Performance Activity Report"), Report ID, Timestamp.
  - **Student Card**: Full Name, Email, User ID, Role.
  - **Quiz Meta**: Quiz Title, Category Taxonomy Path, Selected Mastery Mode.
  - **Performance Scorecard**: Score, Accuracy %, Time Taken, Total Questions, Total Attempt Cycles.
  - **Per-Question Breakdown Table**: Question Number & Text, Rendered KaTeX Formulas, Selected Option, Correct Answer, Explanation, Time Spent, and Attempt Count Badge.
- Downloads PDF directly with name `Quiz_Report_[QuizTitle]_[UserName]_[Date].pdf`.

---

### 5. Admin Live Math Editor & Bulk Upload

- **MathLiveEditor Component**:
  - Split-screen workspace for creating and updating questions.
  - Left pane: Inputs for Question Text (with LaTeX markdown), Options A-E, Correct Choice, Explanation, Tag selection, and Image Upload.
  - Right pane: Real-time rendered HTML preview powered by KaTeX and blob/image stream preview.
- **Bulk Upload Handler**:
  - Upload CSV or JSON files.
  - Client-side validation (`csvJsonParser.js`) previews parsed data in a data grid before committing.
  - Server endpoint `POST /api/quizzes/:id/questions/bulk` validates schema, inserts questions, and links tags inside a MySQL transaction.

---

## Proposed Changes & File Checklist

### Server Components
#### [NEW] [server/index.js](file:///Users/sarfaraj/EdutorAi_Quiz_Mock/server/index.js)
#### [NEW] [server/db.js](file:///Users/sarfaraj/EdutorAi_Quiz_Mock/server/db.js)
#### [NEW] [server/middleware/auth.js](file:///Users/sarfaraj/EdutorAi_Quiz_Mock/server/middleware/auth.js)
#### [NEW] [server/routes/auth.js](file:///Users/sarfaraj/EdutorAi_Quiz_Mock/server/routes/auth.js)
#### [NEW] [server/routes/categories.js](file:///Users/sarfaraj/EdutorAi_Quiz_Mock/server/routes/categories.js)
#### [NEW] [server/routes/tags.js](file:///Users/sarfaraj/EdutorAi_Quiz_Mock/server/routes/tags.js)
#### [NEW] [server/routes/quizzes.js](file:///Users/sarfaraj/EdutorAi_Quiz_Mock/server/routes/quizzes.js)
#### [NEW] [server/routes/images.js](file:///Users/sarfaraj/EdutorAi_Quiz_Mock/server/routes/images.js)
#### [NEW] [server/routes/analytics.js](file:///Users/sarfaraj/EdutorAi_Quiz_Mock/server/routes/analytics.js)
#### [NEW] [schema.sql](file:///Users/sarfaraj/EdutorAi_Quiz_Mock/schema.sql)

### Frontend Components
#### [NEW] [package.json](file:///Users/sarfaraj/EdutorAi_Quiz_Mock/package.json)
#### [NEW] [vite.config.js](file:///Users/sarfaraj/EdutorAi_Quiz_Mock/vite.config.js)
#### [NEW] [index.html](file:///Users/sarfaraj/EdutorAi_Quiz_Mock/index.html)
#### [NEW] [src/style.css](file:///Users/sarfaraj/EdutorAi_Quiz_Mock/src/style.css)
#### [NEW] [src/main.js](file:///Users/sarfaraj/EdutorAi_Quiz_Mock/src/main.js)
#### [NEW] [src/services/api.js](file:///Users/sarfaraj/EdutorAi_Quiz_Mock/src/services/api.js)
#### [NEW] [src/services/katexRenderer.js](file:///Users/sarfaraj/EdutorAi_Quiz_Mock/src/services/katexRenderer.js)
#### [NEW] [src/services/pdfGenerator.js](file:///Users/sarfaraj/EdutorAi_Quiz_Mock/src/services/pdfGenerator.js)
#### [NEW] [src/services/csvJsonParser.js](file:///Users/sarfaraj/EdutorAi_Quiz_Mock/src/services/csvJsonParser.js)
#### [NEW] [src/components/Navbar.js](file:///Users/sarfaraj/EdutorAi_Quiz_Mock/src/components/Navbar.js)
#### [NEW] [src/components/CategoryTree.js](file:///Users/sarfaraj/EdutorAi_Quiz_Mock/src/components/CategoryTree.js)
#### [NEW] [src/components/Modal.js](file:///Users/sarfaraj/EdutorAi_Quiz_Mock/src/components/Modal.js)
#### [NEW] [src/components/BulkUploadModal.js](file:///Users/sarfaraj/EdutorAi_Quiz_Mock/src/components/BulkUploadModal.js)
#### [NEW] [src/views/LoginView.js](file:///Users/sarfaraj/EdutorAi_Quiz_Mock/src/views/LoginView.js)
#### [NEW] [src/views/UserDashboard.js](file:///Users/sarfaraj/EdutorAi_Quiz_Mock/src/views/UserDashboard.js)
#### [NEW] [src/views/QuizView.js](file:///Users/sarfaraj/EdutorAi_Quiz_Mock/src/views/QuizView.js)
#### [NEW] [src/views/AnalyticsView.js](file:///Users/sarfaraj/EdutorAi_Quiz_Mock/src/views/AnalyticsView.js)
#### [NEW] [src/views/AdminDashboard.js](file:///Users/sarfaraj/EdutorAi_Quiz_Mock/src/views/AdminDashboard.js)

---

## Verification Plan

### Automated & Integration Tests
1. **Schema & Seed Verification**:
   - Verify DB creation script `schema.sql` syntax and initial Super Admin seed (`alams1983@gmail.com`).
2. **API Endpoint Testing**:
   - User Auth: Registration with `full_name`, Login token validation, Super Admin role assignment.
   - Question API: Bulk upload CSV/JSON endpoint schema validation.
   - Protected Image streaming: Unauthenticated GET returns 401; Authenticated GET streams image file.
3. **Quiz Mastery Logic Verification**:
   - Verify mastery levels 1-5 pool decrement on correct answers and shuffle on wrong answers.
   - Verify calculation of total attempts, accuracy, and question timings.

### Manual Verification
1. **User Flow**:
   - Register account as a standard user ("Alice Smith").
   - Select a quiz and choose **Mastery Level 2**.
   - Intentionally fail a question; verify feedback pops up, question stays in pool, pool shuffles, and question reappears later.
   - Complete quiz and click **"📄 Download PDF Report"**. Inspect PDF for user details, accuracy metrics, and rendered LaTeX equations.
2. **Admin & Super Admin Flow**:
   - Login as Super Admin (`alams1983@gmail.com`).
   - Open User Role Management tab and promote "Alice Smith" to `admin`.
   - Log out and log in as "Alice Smith" (now Admin); access Admin Dashboard, use Live Math Editor to create a question with LaTeX formulas (`$$\int_0^1 x^2 dx = \frac{1}{3}$$`), and upload a question image.

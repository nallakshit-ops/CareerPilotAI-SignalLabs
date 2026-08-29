# CareerPilot AI - Tech Stack and Feature Usage Mapping

## 1) Core Platform Stack

| Technology         | Package / Tool             | Used For                                      | Feature(s)                                               | Main Usage Files                                                                                                                                     |
| ------------------ | -------------------------- | --------------------------------------------- | -------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------- |
| Next.js App Router | next                       | Full-stack framework (UI routes + API routes) | Entire app, Career Simulator, Skill APIs, Interview APIs | app/layout.js, app/(main)/career-simulator/page.jsx, app/api/career-simulate/route.js, app/api/career-compare/route.js, app/api/career-risk/route.js |
| React              | react, react-dom           | UI rendering and state management             | All front-end features                                   | app/(main)/_, components/_                                                                                                                           |
| Tailwind CSS       | tailwindcss                | Utility-first styling and responsive design   | Entire UI                                                | app/globals.css, tailwind.config.mjs, components/ui/\*                                                                                               |
| ESLint             | eslint, eslint-config-next | Code quality and lint checks                  | Entire codebase                                          | eslint.config.mjs                                                                                                                                    |

## 2) Authentication and User Identity

| Technology | Package                      | Used For                                                            | Feature(s)                                                             | Main Usage Files                                                                                                                                                                                                                                    |
| ---------- | ---------------------------- | ------------------------------------------------------------------- | ---------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Clerk      | @clerk/nextjs, @clerk/themes | Authentication, session-aware UI, protected server actions and APIs | Sign-in/sign-up, user profile, protected dashboard/resume/skill routes | app/layout.js, components/header.jsx, app/(auth)/sign-in/[[...sign-in]]/page.jsx, app/(auth)/sign-up/[[...sign-up]]/page.jsx, actions/dashboard.js, actions/cover-letter.js, app/api/skill/analyze/route.js, app/api/skill/recommendations/route.js |

## 3) Database and Persistence

| Technology                   | Package                          | Used For                                         | Feature(s)                                                                                            | Main Usage Files                                          |
| ---------------------------- | -------------------------------- | ------------------------------------------------ | ----------------------------------------------------------------------------------------------------- | --------------------------------------------------------- |
| Prisma ORM                   | prisma, @prisma/client           | Type-safe DB access, schema modeling, migrations | User profiles, resumes, assessments, cover letters, skill analysis/recommendations, industry insights | prisma/schema.prisma, lib/prisma.js, prisma/migrations/\* |
| PostgreSQL (Neon-compatible) | DATABASE_URL + Prisma datasource | Relational data storage                          | All persisted features                                                                                | prisma/schema.prisma                                      |

## 4) AI and Inference Stack

| Technology | Package               | Used For                                                 | Feature(s)                                                                                                                               | Main Usage Files                                                                                                                                                                                                                                                                |
| ---------- | --------------------- | -------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Gemini API | @google/generative-ai | Content generation, analysis, structured JSON generation | Career simulation, career comparison, risk prediction, interview questions, live interview evaluation, cover letters, dashboard insights | lib/career-ai.js, app/api/career-simulate/route.js, app/api/career-compare/route.js, app/api/career-risk/route.js, app/api/generate-interview-questions/route.js, app/api/evaluate-live-interview/route.js, actions/interview.js, actions/cover-letter.js, actions/dashboard.js |

## 5) Forms, Validation, and Input Processing

| Technology             | Package             | Used For                           | Feature(s)                                          | Main Usage Files                                                                                                                                                                                                             |
| ---------------------- | ------------------- | ---------------------------------- | --------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| React Hook Form        | react-hook-form     | Form state, controlled inputs      | Onboarding, Resume builder, Cover letter generation | app/(main)/onboarding/\_components/onboarding-form.jsx, app/(main)/resume/\_components/entry-form.jsx, app/(main)/resume/\_components/resume-builder.jsx, app/(main)/ai-cover-letter/\_components/cover-letter-generator.jsx |
| Zod                    | zod                 | Runtime schema validation          | Form and payload validation                         | app/lib/schema.js                                                                                                                                                                                                            |
| Hook Form + Zod bridge | @hookform/resolvers | Zod resolver integration for forms | Resume, cover letter, onboarding forms              | app/(main)/resume/\_components/resume-builder.jsx, app/(main)/resume/\_components/entry-form.jsx, app/(main)/ai-cover-letter/\_components/cover-letter-generator.jsx, app/(main)/onboarding/\_components/onboarding-form.jsx |

## 6) UI Component System and Design Layer

| Technology                  | Package                                        | Used For                                                                   | Feature(s)                                                | Main Usage Files                                                                                                                                                                                                                    |
| --------------------------- | ---------------------------------------------- | -------------------------------------------------------------------------- | --------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Radix UI primitives         | @radix-ui/react-\*                             | Accessible UI primitives (dialog, select, tabs, dropdowns, progress, etc.) | Reusable app-wide components                              | components/ui/accordion.jsx, components/ui/alert-dialog.jsx, components/ui/dialog.jsx, components/ui/dropdown-menu.jsx, components/ui/select.jsx, components/ui/tabs.jsx, components/ui/progress.jsx, components/ui/radio-group.jsx |
| CVA + clsx + tailwind-merge | class-variance-authority, clsx, tailwind-merge | Variant-based component styling and class merging                          | Shared UI components                                      | components/ui/button.jsx, lib/utils.js                                                                                                                                                                                              |
| Lucide Icons                | lucide-react                                   | Iconography                                                                | Header, analytics cards, webcam analyzer, dashboard cards | components/header.jsx, components/WebcamAnalyzer.jsx, app/(main)/\*                                                                                                                                                                 |
| Theme support               | next-themes                                    | Dark/light/system theme handling                                           | Entire UI theming                                         | components/theme-provider.jsx, app/layout.js, components/ui/sonner.jsx                                                                                                                                                              |

## 7) Data Visualization and Analytics UI

| Technology | Package  | Used For                                    | Feature(s)                                                                                   | Main Usage Files                                                                                                                                                                      |
| ---------- | -------- | ------------------------------------------- | -------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Recharts   | recharts | Interactive charts and trend visualizations | Career simulator charts, dashboard insights, interview performance, live interview analytics | app/(main)/career-simulator/page.jsx, app/(main)/dashboard/\_component/dashboard-view.jsx, app/(main)/interview/\_components/performace-chart.jsx, app/(main)/live-interview/page.jsx |

## 8) Document Editing and PDF Workflows

| Technology      | Package              | Used For                                 | Feature(s)                                 | Main Usage Files                                                                                                    |
| --------------- | -------------------- | ---------------------------------------- | ------------------------------------------ | ------------------------------------------------------------------------------------------------------------------- |
| Markdown editor | @uiw/react-md-editor | Resume and cover letter markdown editing | Resume builder, cover letter preview/edit  | app/(main)/resume/\_components/resume-builder.jsx, app/(main)/ai-cover-letter/\_components/cover-letter-preview.jsx |
| PDF export      | html2pdf.js          | Client-side PDF generation               | Resume PDF export, cover letter PDF export | app/(main)/resume/\_components/resume-builder.jsx, app/(main)/ai-cover-letter/\_components/cover-letter-preview.jsx |
| PDF parsing     | pdfjs-dist           | Read uploaded PDF text for analysis      | Skill gap / TalentSync workflows           | app/(main)/dashboard/\_component/skill-gap-view.jsx, app/(main)/growth-tools/\_components/talentsync-tool.jsx       |

## 9) Notifications, Animations, and UX Enhancements

| Technology           | Package  | Used For                              | Feature(s)                                                                | Main Usage Files                                                                                                                                                                                                                                                           |
| -------------------- | -------- | ------------------------------------- | ------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Toast notifications  | sonner   | Success/error/status notifications    | Resume, onboarding, interview, cover letter, shared hooks                 | app/layout.js, hooks/use-fetch.js, app/(main)/resume/\_components/resume-builder.jsx, app/(main)/onboarding/\_components/onboarding-form.jsx, app/(main)/interview/\_components/quiz.jsx, app/(main)/ai-cover-letter/\_components/\*                                       |
| Motion animations    | motion   | Hero and reveal animations            | Landing page visual effects, background effects                           | components/hero.jsx, components/ui/reveal.jsx, components/ui/background-boxes.jsx                                                                                                                                                                                          |
| Date/time formatting | date-fns | Formatting timestamps and date ranges | Dashboard timelines, interview history, cover letter list, resume entries | app/(main)/dashboard/\_component/dashboard-view.jsx, app/(main)/interview/\_components/quiz-list.jsx, app/(main)/interview/\_components/performace-chart.jsx, app/(main)/ai-cover-letter/\_components/cover-letter-list.jsx, app/(main)/resume/\_components/entry-form.jsx |

## 10) Background Jobs and Event Processing

| Technology | Package               | Used For                            | Feature(s)                                           | Main Usage Files                                                         |
| ---------- | --------------------- | ----------------------------------- | ---------------------------------------------------- | ------------------------------------------------------------------------ |
| Inngest    | inngest, inngest/next | Background workflow/event execution | Industry insight generation and scheduled processing | app/api/inngest/route.js, lib/inngest/client.js, lib/inngest/function.js |

## 11) Face Detection and Webcam Analysis Stack (Exact Model Files)

This section answers exactly which model assets are used (no shorthand):

### 11.1 Runtime Library

- face-api.js package: face-api.js
- Loader and setup file: utils/faceApiConfig.js
- Consumer component: components/WebcamAnalyzer.jsx

### 11.2 Exact Model Families Loaded

From utils/faceApiConfig.js:

1. tinyFaceDetector
2. faceLandmark68Net
3. faceExpressionNet

### 11.3 Exact Model Artifact Files Used

All of the following files are required and loaded from the same model directory:

- public/models/face-api/tiny_face_detector_model-weights_manifest.json
- public/models/face-api/tiny_face_detector_model-shard1
- public/models/face-api/face_landmark_68_model-weights_manifest.json
- public/models/face-api/face_landmark_68_model-shard1
- public/models/face-api/face_expression_model-weights_manifest.json
- public/models/face-api/face_expression_model-shard1

### 11.4 What Each Model Does in the Feature

1. tinyFaceDetector

- Purpose: detects whether a face is present in webcam frames and returns the face bounding box.
- Used in: components/WebcamAnalyzer.jsx via TinyFaceDetectorOptions.

2. faceLandmark68Net

- Purpose: predicts 68 facial landmark points for the detected face.
- Used in: components/WebcamAnalyzer.jsx with .withFaceLandmarks().

3. faceExpressionNet

- Purpose: classifies expression scores (for example happy, neutral, fearful, sad, angry).
- Used in: components/WebcamAnalyzer.jsx with .withFaceExpressions().

### 11.5 Where This Is Used as a Product Feature

- Feature: AI Camera Feedback in live interview context
- UI component: components/WebcamAnalyzer.jsx
- Related page integration: app/(main)/live-interview/page.jsx
- Behavior: face detection, eye-contact estimate, emotion state mapping, confidence score calculation.

## 12) Environment and Runtime Configuration

| Configuration              | Purpose                          | Typical Usage                 |
| -------------------------- | -------------------------------- | ----------------------------- |
| GEMINI_API_KEY             | Authenticate Gemini API calls    | AI routes and actions         |
| DATABASE_URL               | PostgreSQL connection for Prisma | DB access via Prisma          |
| Clerk keys and auth config | Identity/session management      | App auth and protected routes |

## 13) Feature-to-Stack Quick Index

| Feature                          | Main Stack                                                                      |
| -------------------------------- | ------------------------------------------------------------------------------- |
| Career Simulator                 | Next.js, React, Recharts, Gemini, Tailwind, Radix UI                            |
| Skill Gap Analysis               | Next.js API routes, Prisma/PostgreSQL, PDF.js, deterministic skill engine       |
| Resume Builder                   | React Hook Form, Zod, MDEditor, html2pdf.js, Prisma                             |
| AI Cover Letter                  | Gemini, React Hook Form, Zod, html2pdf.js, Prisma                               |
| Interview Quiz + Analytics       | Gemini, Recharts, Prisma, date-fns, sonner                                      |
| Live Interview + Camera Feedback | Gemini (transcript evaluation), face-api.js (webcam analysis), Recharts, sonner |
| Auth and User Session            | Clerk                                                                           |
| Background Insights Pipeline     | Inngest + Prisma + Gemini                                                       |

## 14) Notes

- Shard files are binary weight chunks of the same model, not separate models.
- Manifest files describe how weight tensors map to shard files.
- For face analysis to work, each model must have both the manifest and shard file present.

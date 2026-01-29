# System Architecture & Flow Diagrams

## 1. High-Level System Architecture

```
┌─────────────────────────────────────────────────────────────────────┐
│                          FRONTEND (React)                           │
├──────────────────┬──────────────────────────┬──────────────────────┤
│   STUDENT SIDE   │      TEACHER SIDE        │    ADMIN SIDE       │
├──────────────────┼──────────────────────────┼──────────────────────┤
│ • Dashboard      │ • Dashboard              │ • Dashboard         │
│ • Quiz List      │ • Results Page           │ • Management        │
│ • Quiz Attempt   │ • Attempts List          │ • Reports           │
│ • Results View   │ • Marking Interface      │ • Analytics         │
│                  │ • Publish Controls       │                     │
└──────────────────┴──────────────────────────┴──────────────────────┘
                                   │
                        ┌──────────┴──────────┐
                        │   API / HTTP        │
                        │  (Port 4000)        │
                        └──────────┬──────────┘
                                   │
┌──────────────────────────────────▼───────────────────────────────────┐
│                          BACKEND (Node.js)                           │
├────────────────┬────────────────┬────────────────┬──────────────────┤
│   ROUTES       │   CONTROLLERS  │    MODELS     │   MIDDLEWARE     │
├────────────────┼────────────────┼────────────────┼──────────────────┤
│ • resultRoutes │ • resultCtrl   │ • resultModel │ • authMiddleware │
│   (NEW routes) │   (4 NEW)      │   (5 NEW)     │ • teacherAuth    │
│ • quizRoutes   │ • quizCtrl     │ • quizModel   │                  │
│ • userRoutes   │ • userCtrl     │ • userModel   │                  │
│ • teacher...   │ • teacherCtrl  │ • teacherModel│                  │
└────────────────┴────────────────┴────────────────┴──────────────────┘
                                   │
                        ┌──────────┴──────────┐
                        │  Database Driver   │
                        │  (MongoDB)         │
                        └──────────┬──────────┘
                                   │
                ┌──────────────────▼──────────────────┐
                │       MongoDB Database             │
                ├───────────────────────────────────┤
                │ Collections:                       │
                │ • results (SCHEMA UPDATED)        │
                │ • quizzes                         │
                │ • questions                       │
                │ • users                           │
                │ • teachers                        │
                │ • classes                         │
                │ • subjects                        │
                └───────────────────────────────────┘
```

---

## 2. Data Flow Diagram

```
STUDENT                          SYSTEM                            TEACHER
─────────                        ──────                            ───────

Attempts Quiz
    │
    ├─→ POST /result/submit ──→ ┌─────────────────┐
                                 │ Create Result   │
                                 │ ┌─────────────┐ │
                                 │ │ review      │ │
                                 │ │ status:     │ │
                                 │ │ "pending"   │ │
                                 │ └─────────────┘ │
                                 └────────┬────────┘
                                          │
                                     Save to DB
                                          │
                                          ├─→ Dashboard Check
                                               (polls /teacher/...)
                                          │
    Sees "Under Review"          ← Status shown
         in My Results
                                          │
                                     Teacher Dashboard
                                     "Quizzes Awaiting
                                      Review" section
                                          │
                                   Click "Review Now"
                                          │
                                 GET /teacher/quiz/:id
                                          │
                                 ┌────────▼────────┐
                                 │ Returns all     │
                                 │ attempts for    │
                                 │ this quiz       │
                                 └────────┬────────┘
                                          │
                              TeacherQuizAttempts
                              Displays table
                                          │
                            Click specific attempt
                                          │
                         GET /teacher/attempt/:id
                                          │
                                 ┌────────▼────────┐
                                 │ Fetch full      │
                                 │ answer details  │
                                 │ with questions  │
                                 └────────┬────────┘
                                          │
                             TeacherMarkQuiz page
                             Shows all questions
                                          │
                          Teacher awards marks
                          Adds comments
                                          │
                         PUT /teacher/:id/mark
                                          │
                                 ┌────────▼────────┐
                                 │ Update Result:  │
                                 │ • markedBy      │
                                 │ • markedAt      │
                                 │ • marks         │
                                 │ • status:marked │
                                 └────────┬────────┘
                                          │
                             Checkbox: "Publish?"
                                          │
                         PUT /teacher/:id/publish
                                          │
                                 ┌────────▼────────┐
                                 │ Result status:  │
                                 │ "published"     │
                                 └────────┬────────┘
                                          │
                                     Save to DB
                                          │
    GET /result/user/:id ← ────────────────┘
         │
         ├─→ Filter: "published"
         │
    Sees marks,
    percentage,
    feedback
```

---

## 3. Component Hierarchy

```
App.js (Main Router)
│
├─ TeacherDashboard ──────────────────┐
│  ├─ Pending Quizzes Section          │
│  │  ├─ Stat Cards                    │
│  │  └─ Pending Quiz Cards ─→ Link    │
│  │                                    │
│  └─ Batch Selection                   │
│                                       │
├─ TeacherResults ◄──────────────────┘
│  ├─ Batch Selector
│  └─ Quiz Cards Grid ──→ Link to Attempts
│
├─ TeacherQuizAttempts (NEW)
│  ├─ Quiz Header
│  ├─ Stats Grid
│  ├─ Attempts Table
│  └─ Each Row ──→ Link to Marking
│
├─ TeacherMarkQuiz (NEW)
│  ├─ Student Info Header
│  ├─ Marks Summary
│  ├─ Questions Display
│  │  ├─ MCQ Questions
│  │  ├─ Text Questions
│  │  └─ Mark Input Fields
│  ├─ Comments Section
│  └─ Action Buttons
│
└─ UserResults
   ├─ Filter Tabs
   ├─ Results Cards (Published only)
   └─ Result Details
      ├─ Score Display
      └─ Answer Review
```

---

## 4. State Flow Diagram

```
┌─────────────────────────────────────────────────────────────┐
│             RESULT LIFECYCLE                                │
└─────────────────────────────────────────────────────────────┘

Created by submitQuiz()
│
▼
┌──────────────────────────────────────────┐
│ PENDING                                  │
│ ─────────────────────────────────────── │
│ • reviewStatus: "pending"                │
│ • markedBy: null                         │
│ • markedAt: null                         │
│ • Hidden from student                    │
│ • Visible to teacher: "Awaiting Review" │
└────────┬─────────────────────────────────┘
         │
         │ Teacher starts reviewing
         ▼
┌──────────────────────────────────────────┐
│ IN-PROGRESS (optional)                   │
│ ─────────────────────────────────────── │
│ • reviewStatus: "in-progress"            │
│ • Teacher actively marking               │
│ • Status shows: "Being Evaluated"        │
└────────┬─────────────────────────────────┘
         │
         │ Teacher saves marks
         ▼
┌──────────────────────────────────────────┐
│ MARKED                                   │
│ ─────────────────────────────────────── │
│ • reviewStatus: "marked"                 │
│ • markedBy: [Teacher ID]                 │
│ • markedAt: [Timestamp]                  │
│ • obtainedMarks: [Updated]               │
│ • Hidden from student                    │
│ • Status shows: "Being Evaluated"        │
└────────┬─────────────────────────────────┘
         │
         │ Teacher publishes result
         ▼
┌──────────────────────────────────────────┐
│ PUBLISHED                                │
│ ─────────────────────────────────────── │
│ • reviewStatus: "published"              │
│ • Visible to student                     │
│ • Status shows: "Passed"/"Failed"        │
│ • Marks displayed                        │
│ • Feedback visible                       │
│ • Cannot be hidden again                 │
└──────────────────────────────────────────┘
```

---

## 5. API Call Sequence

```
SEQUENCE: Teacher Reviews and Publishes Student Quiz

Teacher                 Frontend                 Backend              Database
───────                ────────                 ────────             ────────
  │                       │                         │                    │
  ├─ Click Review Now ──→  │                         │                    │
  │                        │                         │                    │
  │                        ├─ GET /teacher/quiz/id ──→                    │
  │                        │                         │                    │
  │                        │                         ├─ Verify owner
  │                        │                         │                    │
  │                        │                         ├─ Find attempts ──→ │
  │                        │                         │                    │
  │                        │                    ← results array ◄─        │
  │                        │ ← JSON response ◄─┤                          │
  │ ← Attempts table ◄─────┤                         │                    │
  │                        │                         │                    │
  ├─ Click attempt ──────→ │                         │                    │
  │                        │                         │                    │
  │                        ├─ GET /teacher/attempt/id ─→                  │
  │                        │                         │                    │
  │                        │                         ├─ Populate questions
  │                        │                         │                    │
  │                        │                         ├─ Populate answers ─→
  │                        │                         │                    │
  │                        │                    ← full result ◄────────   │
  │                        │ ← Detailed data ◄─┤                          │
  │ ← Marking page ◄───────┤                         │                    │
  │                        │                         │                    │
  ├─ Enter marks ─────────→ │                         │                    │
  │ ─ Add comments         │                         │                    │
  │ ─ Check publish ──────→ │                         │                    │
  │                        │                         │                    │
  ├─ Click Save & Mark ──→ │                         │                    │
  │                        │                         │                    │
  │                        ├─ PUT /teacher/:id/mark ─→                    │
  │                        │    {answers, comments}  │                    │
  │                        │                         ├─ Calculate totals
  │                        │                         │  Update status:
  │                        │                         │  "marked" ────────→ │
  │                        │                         │                    │
  │                        │                    ← Updated result ◄────    │
  │                        │ ← Success ◄───────┤                          │
  │                        │                         │                    │
  │                    [If publish checked]          │                    │
  │                        │                         │                    │
  │                        ├─ PUT /teacher/:id/publish ─→                │
  │                        │                         │                    │
  │                        │                         ├─ Update status:
  │                        │                         │  "published" ─────→ │
  │                        │                         │                    │
  │                        │                    ← Updated ◄─────────       │
  │                        │ ← Success ◄───────┤                          │
  │ ← Published! ◄─────────┤                         │                    │
  │                        │                         │                    │

STUDENT (Meanwhile)
───────
  │
  ├─ Check My Results
  │
  │                 Frontend                 Backend              Database
  │                ────────                 ────────             ────────
  │
  ├─ GET /result/user/:id ─→ [filtered results]
  │
  │ ← Results with status "published"
  │
  └─ Sees marks, percentage, pass/fail, feedback
```

---

## 6. Authorization Flow

```
Request to Teacher Endpoint
    │
    ▼
┌─────────────────────────────┐
│ Check Authorization Header  │
│ Extract JWT Token           │
└─────────┬───────────────────┘
          │
          ├─ Token valid?
          │
          ├─ NO → 401 Unauthorized
          │
          └─ YES
             │
             ▼
       ┌──────────────────────┐
       │ Decode Token        │
       │ Get: teacherId,role │
       └──────┬───────────────┘
              │
              ├─ role === "teacher"?
              │
              ├─ NO → 403 Forbidden
              │
              └─ YES
                 │
                 ▼
          ┌──────────────────────────┐
          │ Check Resource Ownership  │
          │ Get Quiz by ID            │
          └──────┬───────────────────┘
                 │
                 ├─ quiz.createdBy === teacherId?
                 │
                 ├─ NO → 403 Forbidden
                 │
                 └─ YES
                    │
                    ▼
           ┌────────────────────┐
           │ Grant Access      │
           │ Proceed with logic │
           └────────────────────┘
```

---

## 7. UI Navigation Map

```
┌─────────────────────────────────────────────────────────────┐
│                    TEACHER PATHS                             │
└─────────────────────────────────────────────────────────────┘

/teacher/login
    │
    └─→ /teacher/dashboard (Main entry)
         │
         ├─→ "Quizzes Awaiting Review" section
         │   └─→ Quiz Card
         │       └─→ "Review Now" button
         │           │
         │           └─→ /teacher/quiz/:quizId/attempts
         │               └─→ Student Attempt Row
         │                   └─→ "Review & Mark" button
         │                       │
         │                       └─→ /teacher/result/:resultId/mark
         │                           └─→ "Save & Mark"
         │                               └─→ "Publish" (optional)
         │
         ├─→ "Recent Quizzes" section
         │   └─→ Quiz Row
         │       └─→ "Edit" button
         │
         ├─→ Dashboard Link → stays here
         │
         ├─→ "Create Quiz" Link → /teacher/create-quiz
         │
         ├─→ "Results" Link → /teacher/results
         │   │
         │   ├─→ Select Batch
         │   │
         │   └─→ Quiz Cards appear
         │       └─→ "Review & Mark" button
         │           └─→ /teacher/quiz/:quizId/attempts
         │
         └─→ "Logout" Button → /teacher/login


┌─────────────────────────────────────────────────────────────┐
│                    STUDENT PATHS                             │
└─────────────────────────────────────────────────────────────┘

/user/login
    │
    └─→ /user/dashboard (Main entry)
         │
         ├─→ "Start New Quiz" button → /user/quizzes
         │   │
         │   └─→ Quiz Card
         │       └─→ "Attempt" button
         │           └─→ /quiz/attempt/:quizId
         │               └─→ Answer questions
         │                   └─→ "Submit"
         │
         ├─→ "My Results" button → /user/results
         │   │
         │   ├─→ Filter tabs: All, Pending, Passed, Failed
         │   │
         │   └─→ Result Card (Published only)
         │       └─→ Click to see details
         │           ├─→ Score display
         │           ├─→ Percentage
         │           ├─→ Pass/Fail status
         │           └─→ Question review
         │               └─→ Marks per question
         │                   └─→ Teacher feedback
         │
         └─→ Dashboard Link → stays here
```

---

## 8. Database Schema Relationships

```
┌──────────────┐
│    User      │
├──────────────┤
│ _id          │
│ name         │
│ email        │
│ password     │
└──────┬───────┘
       │ userId
       │
       ▼
┌──────────────────────┐     ┌──────────────┐
│     Result           │────→│    Quiz      │
├──────────────────────┤     ├──────────────┤
│ _id                  │     │ _id          │
│ userId (FK)          │     │ title        │
│ quizId (FK)      ────┼────→│ totalMarks   │
│ totalMarks           │     │ createdBy    │
│ obtainedMarks        │     └──────┬───────┘
│ percentage           │            │
│ isPassed             │            ▼
│ submittedAt          │     ┌──────────────┐
│ markedBy (FK)    ────┼────→│   Teacher    │
│ markedAt        ─┐   │     ├──────────────┤
│ reviewStatus     │   │     │ _id          │
│ reviewComments   │   │     │ name         │
│ answers[]        │   │     │ email        │
└──────────────────────┘     └──────────────┘
        │                            │
        │ questionId                 │
        ▼                            │
┌──────────────────────┐       createdBy
│    Question          │
├──────────────────────┤
│ _id                  │
│ quizId (FK)      ────┼────→ (back to Quiz)
│ questionText         │
│ questionType         │
│ marks                │
│ options[]            │
└──────────────────────┘
```

---

## 9. Mark Calculation Flow

```
INPUT: Student Attempt with Answers
    │
    ▼
┌─────────────────────────────────┐
│ For Each Question:              │
│ ─────────────────────────────── │
│ 1. Get question details         │
│ 2. Check question type          │
└─────────┬───────────────────────┘
          │
    ┌─────┴─────┐
    │           │
    ▼           ▼
┌─────────┐  ┌──────────┐
│ MCQ     │  │ Text     │
├─────────┤  ├──────────┤
│Compare  │  │Pending   │
│selected │  │manual    │
│vs       │  │review    │
│correct  │  │          │
│→ marks  │  │          │
│0 or max │  │→ 0 marks │
└────┬────┘  │(until)   │
     │       │awarded   │
     │       └────┬─────┘
     │            │
     └─────┬──────┘
           │
           ▼
   ┌───────────────────────┐
   │ Sum all marks         │
   │ totalAwarded = Σ marks│
   └───────┬───────────────┘
           │
           ▼
   ┌───────────────────────┐
   │ Calculate percentage  │
   │ pct = (awarded / max) │
   │     * 100             │
   └───────┬───────────────┘
           │
           ▼
   ┌───────────────────────┐
   │ Determine pass/fail   │
   │ isPassed = (awarded   │
   │    >= passingMarks)   │
   └───────┬───────────────┘
           │
           ▼
   ┌───────────────────────┐
   │ Save to database      │
   │ • obtainedMarks       │
   │ • percentage          │
   │ • isPassed            │
   │ • status = "marked"   │
   └───────────────────────┘
```

---

This comprehensive architecture provides a clear visual understanding of how all the components, data flows, and user interactions work together in the Quiz Marking System.

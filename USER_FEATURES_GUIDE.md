# User Features Implementation - Complete Guide

## Overview

A comprehensive user management system has been successfully added to the Quiz Application. Users can now register, login, attempt quizzes, submit answers, and view their results.

---

## 🔐 User Authentication

### User Registration

- **Route**: `POST /api/user/register`
- **Features**:
  - Full name, email, and password required
  - Email validation and uniqueness check
  - Password hashing with bcryptjs
  - JWT token generation on successful registration
  - Automatic login after registration

### User Login

- **Route**: `POST /api/user/login`
- **Features**:
  - Email and password authentication
  - Secure password comparison
  - JWT token generation (7 days expiry)
  - User info stored in localStorage

### User Profile

- **Route**: `GET /api/user/profile` (Protected)
- **Features**:
  - Get authenticated user's profile
  - Returns user ID, name, and email

---

## 🎯 Quiz Management for Users

### View Available Quizzes

- **Route**: `GET /api/quiz/all` (Protected)
- **Features**:
  - Display all available quizzes
  - Filter by status (available, upcoming, expired, completed)
  - Show quiz details: title, description, duration, marks
  - Display passing marks and dates
  - Show user's previous score if already attempted
  - Only show quizzes within the active date range

### Quiz Status Determination

- **Available**: Quiz is open and current time is between start and expiry date
- **Upcoming**: Quiz hasn't started yet
- **Expired**: Quiz end date has passed
- **Completed**: User has already submitted this quiz

### Get Quiz Details

- **Route**: `GET /api/quiz/:id` (Protected)
- **Features**:
  - Fetch full quiz information
  - Validate quiz is available before attempting
  - Accessible to both admin and users

### Get Quiz Questions

- **Route**: `GET /api/question/quiz/:quizId` (Protected)
- **Features**:
  - Retrieve all questions for a specific quiz
  - Display question text, marks, and options
  - Randomize or display in order
  - Accessible to both admin and users

---

## 📝 Quiz Attempt & Submission

### Start Quiz Attempt

- **Feature**:
  - User navigates to /user/quiz/:quizId
  - Quiz timer starts (based on quiz duration in minutes)
  - Displays all questions one by one
  - Shows current question number and total marks

### Answer Questions

- **Features**:
  - Multiple choice options (radio buttons)
  - Visual feedback on selected answer
  - Answer saving in component state
  - Question navigation (previous/next)
  - Question summary sidebar showing:
    - All question numbers in grid
    - Color-coded: Answered (green), Unanswered (grey), Current (blue)
    - Quick navigation to any question

### Quiz Timer

- **Features**:
  - Countdown timer in header
  - Color warning when time < 5 minutes
  - Auto-submit when time runs out
  - HH:MM format display

### Submit Quiz

- **Route**: `POST /api/result/submit` (Protected)
- **Features**:
  - Confirmation dialog before submission
  - Shows number of answered questions
  - Prevents accidental submission
  - Validates quiz is still active
  - Calculates results automatically

---

## 📊 Result Generation & Display

### Result Calculation

- **Automatic Scoring**:
  - Compares selected answers with correct options
  - Calculates marks obtained
  - Computes percentage
  - Determines pass/fail status
  - Stores detailed answer history

### Result Model

- Stores userId, quizId, and timestamp
- Contains array of answers with:
  - Question ID
  - Selected answer
  - Correctness status
  - Marks obtained
- Total marks vs obtained marks
- Percentage score
- Pass/fail flag

### View User Results

- **Route**: `GET /api/result/user/:userId` (Protected)
- **Features**:
  - User can view all their quiz results
  - Shows score, percentage, pass/fail status
  - Sorted by submission date (newest first)
  - Filtered by result status (all, passed, failed)

### Get User Statistics

- **Route**: `GET /api/result/user-stats/:userId` (Protected)
- **Features**:
  - Total quizzes attempted
  - Completed quizzes count
  - Passed quizzes count
  - Average score calculation
  - Displayed on dashboard

### View Detailed Result

- **Route**: `GET /api/result/:resultId` (Protected)
- **Features**:
  - Full result details with question information
  - Answer review section
  - Shows correct/incorrect status for each answer
  - Marks obtained per question
  - Quiz metadata (title, total marks)

---

## 🏠 User Dashboard

### Dashboard Overview

- **Route**: `/user/dashboard` (Protected)
- **Sidebar Navigation**:

  - Dashboard (active indicator)
  - Available Quizzes
  - My Results

- **Statistics Cards**:

  - Total Quizzes attempted
  - Completed Quizzes count
  - Average Score percentage

- **Quick Actions**:

  - Start New Quiz button → navigates to quiz list
  - View Results button → navigates to results

- **Instructions Section**:
  - How to attempt quizzes
  - Quiz availability info
  - Results display timing
  - Attempt policy

---

## 📋 Quiz List Page

### Features

- **Filter Tabs**:

  - Available (count) - Can be attempted now
  - Upcoming (count) - Not yet started
  - Completed (count) - Already submitted
  - Expired (count) - Past end date

- **Quiz Card Display**:

  - Quiz title and description
  - Status badge (color-coded)
  - Duration and marks
  - Passing marks threshold
  - Start and end dates/times
  - Previous score (if completed)

- **Actions**:
  - "Start Quiz" button for available quizzes
  - "View Result" button for completed quizzes
  - "Coming Soon" disabled button for upcoming/expired

---

## 🎮 Quiz Attempt Page

### Layout

- **Header Section**:

  - Quiz title and description
  - Countdown timer (color-coded warning)

- **Main Content** (Two-column layout):
  - Left: Question display
  - Right: Question summary grid

### Question Display

- Question number and total
- Marks for current question
- Question text
- Multiple choice options (radio buttons)
- Previous/Next navigation
- Submit button on last question

### Question Summary Sidebar

- Grid of question numbers (4 columns)
- Color coding: Answered, Unanswered, Current
- Quick navigation by clicking number
- Legend showing color meanings
- Answered count display

### Features

- Auto-save answers in state
- Timer auto-submit on expiry
- Confirmation before final submission
- Question preview without entering
- Estimated time tracking

---

## 📈 Results Page

### Results List Section

- **Filter Tabs**:

  - All (total count)
  - Passed (with count)
  - Failed (with count)

- **Result Cards**:
  - Quiz title
  - Pass/Fail badge
  - Score display with percentage circle
  - Date of submission
  - Click to view detailed results

### Results Details Section

- **Header**: Quiz name and status
- **Score Overview** (4 columns):

  - Total Score (obtained/total)
  - Percentage
  - Pass/Fail Status
  - Submission Date

- **Answer Review**:

  - Each answer displayed as numbered item
  - Correct/Incorrect indicator
  - Selected answer shown
  - Marks obtained per question
  - Color-coded background (green/red)

- **Actions**:
  - Take Another Quiz
  - Back to Dashboard

---

## 🔒 Security & Authorization

### Protected Routes

- All user routes require valid JWT token in Authorization header
- Token stored in localStorage as `userToken`
- User can only access their own results and statistics
- Admin pages are protected from user access (redirect to user dashboard)

### Route Protection

- User routes check `authMiddleware` for valid JWT
- Admin routes check `adminAuthMiddleware` for admin role
- Cross-role prevention: If admin logged in, can't access user pages
- Cross-role prevention: If user logged in, can't access admin pages

### Token Format

```
Authorization: Bearer <JWT_TOKEN>
```

---

## 🗂️ Frontend File Structure

```
frontend/src/components/
├── UserLogin.js                    # Login/Register component
├── UserLogin.css                   # Login/Register styles
├── UserDashboard.js                # Main dashboard
├── Dashboard.css                   # Dashboard styles
├── QuizList.js                     # Available quizzes
├── QuizList.css                    # Quiz list styles
├── QuizAttempt.js                  # Quiz attempt page
├── QuizAttempt.css                 # Quiz attempt styles
├── UserResults.js                  # Results display
└── UserResults.css                 # Results styles
```

---

## 🔌 Backend API Routes

### User Routes

```
POST   /api/user/register           # User registration
POST   /api/user/login              # User login
GET    /api/user/profile            # Get user profile (Protected)
```

### Quiz Routes (User Access)

```
GET    /api/quiz/all                # Get all quizzes (Protected)
GET    /api/quiz/:id                # Get quiz details (Protected)
GET    /api/question/quiz/:quizId   # Get questions (Protected)
```

### Result Routes (User Access)

```
POST   /api/result/submit           # Submit quiz (Protected)
GET    /api/result/user/:userId     # Get user's results (Protected)
GET    /api/result/user-stats/:userId # Get stats (Protected)
GET    /api/result/:id              # Get result details (Protected)
```

---

## 📊 Data Flow

### Registration/Login Flow

1. User enters credentials on UserLogin page
2. Submitted to backend via axios
3. Backend validates and creates/verifies user
4. JWT token returned
5. Token and user info stored in localStorage
6. Redirected to /user/dashboard

### Quiz Attempt Flow

1. User selects quiz from QuizList
2. Navigates to QuizAttempt with quizId
3. Quiz questions loaded from backend
4. Timer starts based on quiz duration
5. User answers questions
6. Submits answers to /api/result/submit
7. Backend calculates results
8. Result ID returned
9. Redirected to UserResults page

### Results Viewing Flow

1. User navigates to /user/results
2. Fetches all results for userId
3. Displays result cards with filtering
4. Clicking result shows detailed view
5. Shows answer-by-answer review

---

## 🎨 UI/UX Features

### Responsive Design

- Mobile-first approach
- Tablet and desktop layouts
- Sidebar collapses on mobile
- Touch-friendly buttons and spacing

### Visual Feedback

- Color-coded status badges
- Progress indicators
- Hover effects on interactive elements
- Smooth transitions and animations
- Loading states

### Accessibility

- Clear typography hierarchy
- High contrast colors
- Logical tab order
- Descriptive button labels
- Emoji icons for quick recognition

---

## 🧪 Testing Checklist

- [ ] User can register with valid data
- [ ] User cannot register with existing email
- [ ] User can login with correct credentials
- [ ] User cannot login with wrong password
- [ ] User dashboard displays statistics
- [ ] Quiz list shows all available quizzes
- [ ] Quiz filters work correctly
- [ ] Quiz attempt page loads questions
- [ ] Timer counts down correctly
- [ ] User can navigate between questions
- [ ] User can submit quiz
- [ ] Results are calculated correctly
- [ ] User results page shows all results
- [ ] Result filtering works (passed/failed)
- [ ] Admin cannot access user pages
- [ ] User cannot access admin pages
- [ ] Logout clears all user data

---

## 🚀 Future Enhancements

- [ ] Quiz bookmarking/favorites
- [ ] Performance analytics graphs
- [ ] Detailed performance reports
- [ ] Export results as PDF
- [ ] Quiz discussion/forum
- [ ] Leaderboard
- [ ] Achievement badges
- [ ] Attempt history with timestamps
- [ ] Time spent per question analytics
- [ ] Question difficulty ratings
- [ ] Similar questions recommendations

---

## 📝 Notes

- All API calls use axios for better error handling
- Timestamps are handled by MongoDB
- Secure password hashing with bcryptjs
- JWT tokens expire after 7 days
- All sensitive routes protected with authentication
- Comprehensive error handling on frontend and backend

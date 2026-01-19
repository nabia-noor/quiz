# Testing Guide - User Features

## Prerequisites

- Node.js and npm installed
- MongoDB running locally
- Backend and frontend servers running

---

## 🧪 Test Scenario 1: User Registration & Login

### Test 1.1: Register New User

**Steps:**

1. Navigate to `http://localhost:3000`
2. You'll be redirected to `/user/login`
3. Click "Register here" link
4. Enter details:
   - Name: "Test User"
   - Email: "testuser@example.com"
   - Password: "TestPassword123"
5. Click "Register" button

**Expected Result:**

- ✅ No error message appears
- ✅ Automatically logged in
- ✅ Redirected to `/user/dashboard`
- ✅ User name displayed in header

---

### Test 1.2: Register with Existing Email

**Steps:**

1. On Register page, enter:
   - Name: "Another User"
   - Email: "testuser@example.com" (same as before)
   - Password: "Password123"
2. Click "Register"

**Expected Result:**

- ✅ Error message: "Email already in use"
- ✅ Not logged in
- ✅ Stays on register page

---

### Test 1.3: Login with Correct Credentials

**Steps:**

1. If logged in, click Logout
2. Click "Login here" link
3. Enter:
   - Email: "testuser@example.com"
   - Password: "TestPassword123"
4. Click "Login"

**Expected Result:**

- ✅ Successfully logged in
- ✅ Redirected to dashboard
- ✅ User name shown in header

---

### Test 1.4: Login with Wrong Password

**Steps:**

1. On login page, enter:
   - Email: "testuser@example.com"
   - Password: "WrongPassword"
2. Click "Login"

**Expected Result:**

- ✅ Error message: "Invalid credentials"
- ✅ Not logged in
- ✅ Stays on login page

---

## 🏠 Test Scenario 2: Dashboard

### Test 2.1: Dashboard Loads

**Steps:**

1. Login successfully
2. Observe dashboard page

**Expected Result:**

- ✅ Dashboard loads without errors
- ✅ Three stat cards visible
- ✅ Quick actions section visible
- ✅ Instructions section visible
- ✅ Sidebar with navigation visible

---

### Test 2.2: Dashboard Statistics

**Steps:**

1. On dashboard, check statistics
2. Compare with database if possible

**Expected Result:**

- ✅ Total Quizzes shows correct count
- ✅ Completed Quizzes shows correct count
- ✅ Average Score shows percentage

---

### Test 2.3: Navigation Buttons

**Steps:**

1. Click "📝 Available Quizzes" button
2. Verify page loads

**Expected Result:**

- ✅ Navigates to `/user/quizzes`
- ✅ Quiz list page loads

---

## 📋 Test Scenario 3: Quiz List & Filtering

### Test 3.1: View All Quizzes

**Steps:**

1. Navigate to quiz list page
2. Observe quiz cards

**Expected Result:**

- ✅ Quiz cards display with titles
- ✅ Descriptions visible
- ✅ Status badges show correct status
- ✅ Marks and duration visible
- ✅ Dates and times displayed

---

### Test 3.2: Filter by Available

**Steps:**

1. On quiz list, click "Available" tab

**Expected Result:**

- ✅ Only available quizzes shown
- ✅ Count updates correctly
- ✅ Tab highlighted

---

### Test 3.3: Filter by Upcoming

**Steps:**

1. Click "Upcoming" tab

**Expected Result:**

- ✅ Only quizzes with future start dates shown
- ✅ Status badge shows "Upcoming"
- ✅ "Coming Soon" button disabled

---

### Test 3.4: Filter by Completed

**Steps:**

1. (Requires completing a quiz first)
2. Click "Completed" tab

**Expected Result:**

- ✅ Only completed quizzes shown
- ✅ Shows previous scores
- ✅ "View Result" button instead of "Start Quiz"

---

### Test 3.5: Filter by Expired

**Steps:**

1. Click "Expired" tab

**Expected Result:**

- ✅ Only past-date quizzes shown
- ✅ Status badge shows "Expired"
- ✅ "Coming Soon" button disabled

---

## 🎮 Test Scenario 4: Quiz Attempt

### Test 4.1: Start Quiz

**Steps:**

1. On quiz list, click "Start Quiz" on available quiz
2. Wait for quiz page to load

**Expected Result:**

- ✅ Redirected to quiz attempt page
- ✅ First question displays
- ✅ All questions visible in summary grid
- ✅ Timer starts counting down
- ✅ Questions show all options

---

### Test 4.2: Timer Display

**Steps:**

1. On quiz page, check timer in header

**Expected Result:**

- ✅ Timer shows MM:SS format
- ✅ Counts down each second
- ✅ Color is blue (normal) or red (< 5 minutes)

---

### Test 4.3: Answer Question

**Steps:**

1. Click radio button for an option
2. Verify it's selected

**Expected Result:**

- ✅ Radio button checked
- ✅ Option highlighted
- ✅ Question appears answered in summary grid (green)

---

### Test 4.4: Navigate Questions

**Steps:**

1. On question 1, click "Next"
2. On question 2, click "Previous"

**Expected Result:**

- ✅ Navigation works smoothly
- ✅ Correct question displays
- ✅ Previous answer is saved
- ✅ Current question highlighted in grid

---

### Test 4.5: Quick Navigation

**Steps:**

1. On quiz page, click question 5 in summary grid

**Expected Result:**

- ✅ Jumps to question 5
- ✅ Question 5 highlighted (blue)
- ✅ Previous answers preserved

---

### Test 4.6: Submit Quiz

**Steps:**

1. On last question, click "Submit Quiz"
2. Confirmation dialog appears
3. Click "Confirm Submit"

**Expected Result:**

- ✅ Confirmation dialog shows answered count
- ✅ After confirming, quiz submitted
- ✅ Redirected to results page
- ✅ Results displayed immediately

---

## 📊 Test Scenario 5: Results Display

### Test 5.1: View Results

**Steps:**

1. After submitting quiz, results page loads

**Expected Result:**

- ✅ Result card shown in list
- ✅ Score displays correctly
- ✅ Percentage correct
- ✅ Pass/Fail status correct
- ✅ Submission date shown

---

### Test 5.2: Result Filters

**Steps:**

1. Click "Passed" filter tab

**Expected Result:**

- ✅ Only passing results shown
- ✅ Count updates
- ✅ All shown results have "Passed" badge

---

### Test 5.3: View Detailed Result

**Steps:**

1. Click on result card

**Expected Result:**

- ✅ Card becomes selected/highlighted
- ✅ Details section shows:
  - Quiz title
  - Total score
  - Percentage
  - Pass/Fail status
  - Submission date
  - Answer review

---

### Test 5.4: Answer Review

**Steps:**

1. Scroll through answer review section

**Expected Result:**

- ✅ Each answer shows:
  - Question number
  - Correct/Incorrect badge
  - User's selected answer
  - Marks obtained
  - Color-coded (green=correct, red=incorrect)

---

## 🔒 Test Scenario 6: Security & Access Control

### Test 6.1: Admin Cannot Access User Pages

**Steps:**

1. Login as admin
2. Try to navigate to `/user/dashboard`

**Expected Result:**

- ✅ Redirected to `/admin/dashboard`
- ✅ User pages not accessible

---

### Test 6.2: User Cannot Access Admin Pages

**Steps:**

1. Login as user
2. Try to navigate to `/admin/dashboard`

**Expected Result:**

- ✅ Redirected to `/user/dashboard`
- ✅ Admin pages not accessible

---

### Test 6.3: Unauthenticated Access Prevented

**Steps:**

1. Clear localStorage
2. Try to access `/user/dashboard`

**Expected Result:**

- ✅ Redirected to `/user/login`
- ✅ Cannot access dashboard without token

---

### Test 6.4: Token Expiration

**Steps:**

1. (Requires waiting 7 days or modifying token)
2. Use expired token in API call

**Expected Result:**

- ✅ API returns 401 Unauthorized
- ✅ User redirected to login

---

## 🧪 Test Scenario 7: Error Handling

### Test 7.1: Network Error

**Steps:**

1. Stop backend server
2. Try to load quiz list

**Expected Result:**

- ✅ Error message displayed
- ✅ No crash
- ✅ User can retry

---

### Test 7.2: Invalid Quiz ID

**Steps:**

1. Navigate to `/user/quiz/invalid123`

**Expected Result:**

- ✅ Error handling works
- ✅ User sees error message
- ✅ Can navigate back

---

### Test 7.3: Quiz No Longer Available

**Steps:**

1. Start quiz attempt
2. Wait for expiry time to pass (or modify date)
3. Try to submit

**Expected Result:**

- ✅ Error: "Quiz is not available"
- ✅ Cannot submit
- ✅ Cannot complete quiz

---

## 📱 Test Scenario 8: Responsive Design

### Test 8.1: Mobile View (< 768px)

**Steps:**

1. Open DevTools (F12)
2. Toggle device toolbar
3. Select "iPhone X" or similar
4. Navigate through app

**Expected Result:**

- ✅ Sidebar collapses to horizontal
- ✅ Buttons stack vertically
- ✅ Text readable without zoom
- ✅ No horizontal scroll
- ✅ Touch-friendly spacing

---

### Test 8.2: Tablet View (768px - 1024px)

**Steps:**

1. Select tablet device in DevTools

**Expected Result:**

- ✅ Layout adapts to tablet size
- ✅ Good spacing and readability
- ✅ All features accessible

---

### Test 8.3: Desktop View (> 1024px)

**Steps:**

1. Set viewport to full screen

**Expected Result:**

- ✅ Optimal layout for desktop
- ✅ Two-column layouts where appropriate
- ✅ Full navigation visible

---

## ⚙️ Test Scenario 9: Data Persistence

### Test 9.1: Data Survives Page Reload

**Steps:**

1. Start quiz attempt
2. Answer few questions
3. Refresh page (F5)
4. Check quiz attempt page

**Expected Result:**

- ✅ Login maintained via token
- ✅ Quiz page reloads with answered questions preserved
- ✅ No loss of data

---

### Test 9.2: Results Persist

**Steps:**

1. Submit a quiz
2. View results
3. Navigate away and back

**Expected Result:**

- ✅ Results still visible
- ✅ Scores unchanged
- ✅ Database persistence works

---

## 🎯 Performance Testing

### Test 9.1: Page Load Time

**Steps:**

1. Open DevTools > Network tab
2. Navigate to each page
3. Check load times

**Expected Result:**

- ✅ Dashboard: < 2 seconds
- ✅ Quiz List: < 2 seconds
- ✅ Quiz Attempt: < 2 seconds
- ✅ Results: < 2 seconds

---

### Test 9.2: API Response Times

**Steps:**

1. Check Network tab during API calls

**Expected Result:**

- ✅ Most requests complete in < 500ms
- ✅ No hanging requests
- ✅ Proper error handling

---

## ✅ Test Results Template

```
Test ID: 1.1
Test Name: Register New User
Status: ✅ PASS / ❌ FAIL / ⚠️ PARTIAL
Notes:
Date:
Tester:
```

---

## 🐛 Bug Reporting

If you find issues:

1. **Document the issue**

   - What were you doing?
   - What did you expect?
   - What actually happened?

2. **Collect information**

   - Browser console errors
   - Network tab responses
   - Screenshots/video

3. **Report the bug**
   - Reference the test scenario
   - Include reproduction steps
   - Attach supporting files

---

## 📊 Test Summary

| Test Scenario | Tests | Expected | Actual | Status |
| ------------- | ----- | -------- | ------ | ------ |
| Auth          | 4     | 4        | -      | -      |
| Dashboard     | 3     | 3        | -      | -      |
| Quiz List     | 5     | 5        | -      | -      |
| Quiz Attempt  | 6     | 6        | -      | -      |
| Results       | 4     | 4        | -      | -      |
| Security      | 4     | 4        | -      | -      |
| Errors        | 3     | 3        | -      | -      |
| Responsive    | 3     | 3        | -      | -      |
| Data          | 2     | 2        | -      | -      |
| Performance   | 2     | 2        | -      | -      |

**Total: 36 Test Cases**

---

## 🎉 Success Criteria

Project is ready for deployment when:

- ✅ All 36 test cases pass
- ✅ No critical bugs found
- ✅ Performance acceptable
- ✅ Security verified
- ✅ Responsive design works on all devices
- ✅ Error handling comprehensive

---

Happy Testing! 🚀

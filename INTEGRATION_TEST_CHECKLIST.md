# Quiz Marking System - Integration Test Checklist

## Pre-Test Setup
- [ ] Backend server running on port 4000
- [ ] Frontend dev server running on port 3000
- [ ] MongoDB database connected
- [ ] Both admin and teacher users created
- [ ] Quiz created by teacher with questions
- [ ] At least one active/published quiz available to students

---

## Test Case 1: Student Submits Quiz

### Steps
1. Log in as student
2. Navigate to "Available Quizzes"
3. Find an active quiz
4. Click to attempt
5. Answer some questions
6. Submit quiz

### Expected Results
- ✅ Quiz submission successful
- ✅ Student receives confirmation
- ✅ Result created in database with `reviewStatus: "pending"`
- ✅ "Marks Obtained" shows as 0 initially
- ✅ Student can navigate back to results

### Database Check
```
Result created with:
- userId: [student ID]
- quizId: [quiz ID]
- reviewStatus: "pending"
- submittedAt: [current date]
- obtainedMarks: 0
- answers: [array of answers]
```

---

## Test Case 2: Attempt Appears on Teacher Dashboard

### Prerequisites
- ✅ Student has submitted quiz

### Steps
1. Log in as teacher (who created the quiz)
2. Go to `/teacher/dashboard`
3. Look for "⏳ Quizzes Awaiting Review" section

### Expected Results
- ✅ Section visible if there are pending attempts
- ✅ Quiz card shows with title
- ✅ Red badge shows pending count
- ✅ "Review Now" button visible
- ✅ Stat shows "Pending Reviews: 1"

### Not Visible If
- ❌ Quiz created by different teacher
- ❌ All attempts already published
- ❌ No quiz attempts yet

---

## Test Case 3: Access Quiz Attempts List

### Prerequisites
- ✅ Student submitted quiz
- ✅ Teacher sees pending quiz on dashboard

### Steps
1. From dashboard, click "Review Now" OR
2. Navigate to `/teacher/results`
3. Select Batch dropdown
4. See quiz card appear
5. Click "Review & Mark" button

### Navigation Path A (Dashboard)
```
Dashboard
→ "Quizzes Awaiting Review" section
→ "Review Now" button
→ TeacherQuizAttempts page
```

### Navigation Path B (Results)
```
Results Page
→ Select Batch
→ Quiz Cards appear
→ "Review & Mark" button
→ TeacherQuizAttempts page
```

### Expected Results at `/teacher/quiz/:quizId/attempts`
- ✅ Quiz title displayed
- ✅ Stats grid shows:
  - Total Attempts: 1
  - Submitted: 1
  - Pending Review: 1
  - Marked: 0
- ✅ Table shows student row with:
  - Student Name: [correct name]
  - Email: [correct email]
  - Marks Obtained: 0
  - Total Marks: [quiz total]
  - Percentage: 0.00%
  - Pass/Fail: ✗ Fail
  - Submitted Date: [correct date]
  - Status: Pending
  - Button: "Review & Mark"

---

## Test Case 4: Teacher Reviews Student Answers

### Prerequisites
- ✅ Teacher on attempts list page

### Steps
1. Click "Review & Mark" button on student attempt
2. Page navigates to `/teacher/result/:resultId/mark`

### Expected Results
- ✅ Student info header shows:
  - Name: [student name]
  - Email: [student email]
  - Quiz: [quiz title]
  - Submitted: [date and time]
- ✅ Marks summary shows:
  - Original Score: 0 / [total]
  - Current Marks: 0 / [total]
  - Status: Pending
- ✅ Questions displayed with:
  - Question number (Q1, Q2, etc.)
  - Question text
  - Question type badge (MCQ, Text, etc.)
  - Student's answer
  - Input field for marks (labeled "Marks: *")
  - Max marks hint
- ✅ For MCQ questions:
  - All options shown
  - Selected option highlighted in blue
  - Correct option highlighted in green
- ✅ For text questions:
  - Student's typed answer in box
  - Input field to award marks
- ✅ Comments textarea visible
- ✅ Checkbox: "Publish result immediately after marking"
- ✅ Buttons: "Cancel" and "Save & Mark"

---

## Test Case 5: Teacher Awards Marks

### Prerequisites
- ✅ Teacher on marking page

### Steps
1. For each question, enter marks in input field
2. Enter marks less than or equal to max marks
3. Observe marks calculation in real-time
4. See "Current Marks" update automatically
5. Optionally add comments in textarea
6. Click "Save & Mark"

### Expected Results
- ✅ Marks input accepts numeric values
- ✅ Cannot enter more than max marks (capped)
- ✅ Current Marks value updates immediately
- ✅ Percentage recalculates in real-time
- ✅ Pass/Fail status updates based on marks
- ✅ Comments textarea accepts text
- ✅ "Save & Mark" button clickable
- ✅ Loading state appears while saving
- ✅ Success message or redirect

### Database Check After Save
```
Result updated with:
- markedBy: [teacher ID]
- markedAt: [current date]
- obtainedMarks: [calculated total]
- percentage: [calculated percentage]
- isPassed: [true/false based on marks]
- reviewStatus: "marked"
- reviewComments: [optional feedback]
- answers[*].marksObtained: [awarded marks]
```

---

## Test Case 6: Teacher Publishes Result

### Prerequisites
- ✅ Quiz marked successfully

### Steps - Option A (Publish During Marking)
1. Before saving, check "Publish immediately"
2. Click "Save & Mark"
3. Wait for completion

### Steps - Option B (Publish After Marking)
1. From attempts list, after marking, status shows "Marked"
2. Different button appears (could be "Publish")
3. Click to publish

### Expected Results
- ✅ Success message appears
- ✅ Redirected back to attempts list OR stays on page
- ✅ Status changes from "Marked" to "Published"
- ✅ In database: `reviewStatus: "published"`

### Not Visible Until Published
- ❌ Student cannot see result yet if not published
- ❌ Marks remain hidden

---

## Test Case 7: Result Visible to Student

### Prerequisites
- ✅ Teacher published result

### Steps
1. Log in as student (different browser or logout/login)
2. Navigate to `/user/results`
3. Look for quiz result

### Expected Results at User Results
- ✅ Quiz appears in results list
- ✅ Status badge shows "✅ Passed" or "❌ Failed"
- ✅ NOT showing "Under Review" or "Being Evaluated"
- ✅ Can click to see details

### Detailed View - Expected
- ✅ Shows final marks: [obtained] / [total]
- ✅ Shows percentage: [calculated]%
- ✅ Shows overall status: Passed/Failed
- ✅ Shows submission date
- ✅ Can view each question:
  - Question text
  - Student's answer
  - Marks obtained for that question
  - Whether correct/incorrect/manual score
- ✅ Can see teacher's comments (if provided)

---

## Test Case 8: Unpublished Results Hidden

### Prerequisites
- ✅ Mark a quiz but DON'T publish it

### Steps
1. Log in as student
2. Navigate to `/user/results`
3. Look for the quiz

### Expected Results
- ❌ Unpublished quiz should NOT appear in list
- ❌ Cannot see marks
- ❌ Cannot view details
- ✅ Student doesn't know it was marked yet

---

## Test Case 9: Multiple Students - Independent Marking

### Prerequisites
- ✅ 2+ students submitted same quiz

### Steps
1. Teacher goes to attempts list
2. See multiple student rows
3. Mark first student - "Save & Mark"
4. Go back to attempts list
5. Mark second student differently
6. Publish one, keep other as "marked"

### Expected Results
- ✅ Each student row independent
- ✅ Marks for student 1 ≠ marks for student 2
- ✅ Can publish one without affecting other
- ✅ Each student only sees their own result
- ✅ Student 1 sees published result
- ✅ Student 2 doesn't see unpublished result

---

## Test Case 10: Authorization - Can Only Access Own Quiz

### Prerequisites
- ✅ 2 teachers created different quizzes

### Steps
1. Log in as Teacher A
2. Try to access quizzes created by Teacher B
3. Navigate to `/teacher/quiz/[teacher-b-quiz-id]/attempts`

### Expected Results
- ✅ Get 403 Forbidden error
- ✅ Cannot see other teacher's attempts
- ✅ Cannot modify other teacher's results
- ✅ Proper error message shown

---

## Test Case 11: Filter Tabs in Student Results

### Prerequisites
- ✅ Multiple results with different statuses

### Steps
1. Student navigates to `/user/results`
2. Click "All" tab
3. Click "Pending" tab
4. Click "Passed" tab
5. Click "Failed" tab

### Expected Results
- ✅ "All" shows all published results
- ✅ "Pending" shows unpublished (if any visible)
- ✅ "Passed" shows only passing results
- ✅ "Failed" shows only failing results
- ✅ Counts update correctly
- ✅ Tab highlighting works

---

## Test Case 12: UI Responsiveness

### Desktop (1920x1080)
- ✅ All elements visible
- ✅ Tables properly formatted
- ✅ Cards in grid layout
- ✅ No horizontal scroll needed

### Tablet (768x1024)
- ✅ Layout adapts to width
- ✅ Grid becomes 2 columns
- ✅ Tables may scroll but content readable
- ✅ Buttons properly spaced

### Mobile (375x667)
- ✅ Grid becomes 1 column
- ✅ Tables are readable (may require scroll)
- ✅ Buttons full width
- ✅ Header responsive
- ✅ All navigation accessible

---

## Test Case 13: Error Handling

### Scenario A: Network Error During Save
- ✅ Error message displays
- ✅ Data not saved
- ✅ Can retry

### Scenario B: Quiz Not Found
- ✅ Friendly error message
- ✅ Link to go back
- ✅ No crash

### Scenario C: Invalid Marks Input
- ✅ Input capped at maximum
- ✅ Cannot enter non-numeric
- ✅ Clear feedback to user

### Scenario D: Unauthorized Access
- ✅ 403 error shown
- ✅ Cannot access forbidden resource
- ✅ Redirected appropriately

---

## Test Case 14: Marks Calculation

### Setup
- Quiz with 3 questions
- Q1: MCQ, 10 marks (auto-marked)
- Q2: Text, 15 marks (manual)
- Q3: MCQ, 5 marks (auto-marked)
- Total: 30 marks

### Student Answers
- Q1: Correct → 10 marks
- Q2: Some answer → 0 marks initially
- Q3: Wrong → 0 marks

### Teacher Awards
- Q1: Already 10 (auto)
- Q2: Awards 12 marks
- Q3: Already 0 (auto)

### Expected Calculation
- ✅ Total: 10 + 12 + 0 = 22 marks
- ✅ Percentage: (22/30) * 100 = 73.33%
- ✅ Pass status: Depends on passing marks threshold
- ✅ All updates in real-time as teacher types

---

## Test Case 15: Data Persistence

### Steps
1. Mark a quiz
2. Leave page without saving (accidentally)
3. Return to attempts list
4. Click same quiz again

### Expected Results
- ❌ Changes NOT saved
- ✅ Marks show as they were before
- ✅ No data loss message needed (user action)

### Steps - Correct Flow
1. Mark a quiz
2. Click "Save & Mark"
3. Wait for success
4. Return to attempts list
5. Click same quiz again

### Expected Results
- ✅ Changes ARE saved
- ✅ Marks show the updated values
- ✅ Database persists changes

---

## Test Case 16: Status Transitions

### Status Flow
```
Student Submits
    ↓
Result: status = "pending"
    ↓
Teacher Reviews
    ↓
Result: status = "in-progress" (optional)
    ↓
Teacher Marks & Saves
    ↓
Result: status = "marked"
    ↓
Teacher Publishes
    ↓
Result: status = "published"
    ↓
Student Sees Result
```

### Verification
- ✅ Each transition occurs
- ✅ Correct order maintained
- ✅ No status skipping
- ✅ Database reflects changes

---

## Test Case 17: Comments & Feedback

### Steps
1. Teacher marking quiz
2. In Comments textarea, write feedback: "Good effort, work on Q2"
3. Award marks
4. Publish result

### Expected Results
- ✅ Comments saved in database
- ✅ Comments visible in teacher's record
- ✅ Student can see comments after publishing (if shown)

---

## Test Case 18: Date/Time Tracking

### Verification
- ✅ `submittedAt` - When student submitted
- ✅ `markedAt` - When teacher marked (populated after marking)
- ✅ Dates displayed correctly in UI
- ✅ Timezone handling correct

---

## Summary Dashboard

| Test Case | Status | Notes |
|-----------|--------|-------|
| 1. Submit Quiz | [ ] | |
| 2. Attempt on Dashboard | [ ] | |
| 3. Access Attempts List | [ ] | |
| 4. Review Answers | [ ] | |
| 5. Award Marks | [ ] | |
| 6. Publish Result | [ ] | |
| 7. Visible to Student | [ ] | |
| 8. Unpublished Hidden | [ ] | |
| 9. Multiple Students | [ ] | |
| 10. Authorization | [ ] | |
| 11. Filter Tabs | [ ] | |
| 12. Responsiveness | [ ] | |
| 13. Error Handling | [ ] | |
| 14. Calculations | [ ] | |
| 15. Persistence | [ ] | |
| 16. Status Flow | [ ] | |
| 17. Comments | [ ] | |
| 18. Dates | [ ] | |

---

## Notes
- Run tests in order for best results
- Test on different browsers (Chrome, Firefox, Safari)
- Check network tab in DevTools for API calls
- Verify database records after each major action
- Check console for any errors/warnings

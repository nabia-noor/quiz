# Quiz Marking System - Quick Start Guide

## System Overview
The quiz marking system enables a complete workflow where:
1. Students attempt quizzes
2. Attempts appear on teacher dashboard
3. Teachers review and mark student answers
4. Results are published to students

---

## For Teachers

### Accessing the Marking System

1. **From Dashboard**
   - Log in as teacher at `/teacher/login`
   - Go to Dashboard at `/teacher/dashboard`
   - Look for "⏳ Quizzes Awaiting Review" section
   - Click "Review Now" on any quiz with pending reviews

2. **From Results Page**
   - Navigate to `/teacher/results`
   - Select a Batch from dropdown
   - Quiz cards display with attempt stats
   - Click blue "Review & Mark" button

### Reviewing Quiz Attempts

**Page**: `/teacher/quiz/:quizId/attempts`

**What You See**:
- Quiz title and total marks
- Statistics: Total attempts, Submitted, Pending, Marked
- Table with all student attempts

**Column Information**:
- **Student Name**: Link to identify which student
- **Marks Obtained**: Current marks (0 if not yet marked)
- **Total Marks**: Out of this many points
- **Percentage**: Score percentage
- **Pass/Fail**: Green checkmark or red X
- **Status**: Pending, In Progress, Marked, or Published
- **Action**: "Review & Mark" or "View" button

### Marking Individual Attempt

**Page**: `/teacher/result/:resultId/mark`

**Steps**:
1. Review student's answers (MCQ options shown, text answers in box)
2. For each question, enter marks in the input field
3. Current marks calculation updates in real-time
4. Add optional comments in the Comments section
5. Check "Publish result immediately" if you want students to see it now
6. Click "Save & Mark" button

**Mark Entry**:
- Input field shows max marks available
- Can't enter more than max marks
- Marks auto-calculate for MCQ (already done)
- Only edit for manual/text questions

**Information Shown**:
- Student info (name, email, submission date)
- Original vs. Current marks
- Status badge (Pending/In Progress/Marked/Published)
- Each question with student's answer
- Correct answer highlighted for MCQ

### Publishing Results

**Option 1**: During Marking
- Check "Publish result immediately after marking"
- Click "Save & Mark"

**Option 2**: After Marking
- Student status will show "Marked"
- Can come back and publish later
- Publish button appears after marking

**Result**: Student will see result in their "My Results" section

---

## For Students

### Attempting a Quiz

1. Log in at `/user/login`
2. Go to Dashboard
3. Click "Available Quizzes" or "Start New Quiz"
4. Select a quiz and click to attempt
5. Answer all questions
6. Submit when ready

### Viewing Results

1. Log in to your account
2. Navigate to "My Results" section
3. Your quiz attempts will show with status

**Status Meanings**:
- **Under Review**: Teacher received your attempt, starting to mark
- **Being Evaluated**: Teacher is actively marking your quiz
- **Passed** ✅: Published result - you passed!
- **Failed** ❌: Published result - you didn't pass

**What You Can See**:
- Quiz title
- Your marks (hidden until published)
- Submission date and time
- Each question's result (once published)

---

## Status Workflow

```
STUDENT SUBMITS QUIZ
        ↓
   Status: "Under Review"
   (Result created, pending evaluation)
        ↓
TEACHER BEGINS MARKING
        ↓
   Status: "Being Evaluated"
   (Teacher is actively reviewing)
        ↓
TEACHER MARKS & SAVES
        ↓
   Status: "Marked"
   (Scores finalized, not yet published)
        ↓
TEACHER PUBLISHES
        ↓
   Status: "Published"
   (Student can see results)
```

---

## Feature Checklist

### Teacher Features
- ✅ View all quiz attempts for each quiz
- ✅ See student name, email, submission time
- ✅ Review each student's answers
- ✅ See MCQ options with correct answer marked
- ✅ Read student's typed answers for manual questions
- ✅ Award marks for each question
- ✅ Add comments/feedback
- ✅ Publish results to make visible to students
- ✅ See real-time mark calculations
- ✅ Filter attempts by submission status

### Student Features
- ✅ Submit quiz attempts
- ✅ See attempt submission status
- ✅ View published results only
- ✅ See marks for each question (when published)
- ✅ Understand pass/fail status
- ✅ Review teacher feedback
- ✅ See submission date and time

---

## Dashboard Indicators

### Teacher Dashboard
**Stat Card**: "Pending Reviews" (orange/yellow)
- Shows total number of unpublished attempts across all quizzes
- Alerts teacher to pending work

**Section**: "Quizzes Awaiting Review"
- Only shows quizzes with pending or in-progress attempts
- Each card shows pending count in red badge
- Quick link to review attempts

### Student Dashboard
**Section**: "My Results"
- Tab filters: All, Under Review, Passed, Failed
- Shows submission date
- Color-coded by status

---

## Troubleshooting

**Q: I don't see any attempts on my quiz**
- A: Make sure the quiz is active and students have attempted it
- Check the Batch/Class is correctly assigned

**Q: My marks aren't being saved**
- A: Check all required fields are filled
- Ensure marks don't exceed maximum for each question
- Check you have permission (must be quiz creator)

**Q: Student can't see results**
- A: Results must be published first (status = "Published")
- Check teacher published the quiz
- Student must look in "My Results" section

**Q: Why does it say "Being Evaluated"?**
- A: Teacher has marked it but not yet published
- Once teacher publishes, status will change to Pass/Fail

---

## Best Practices

### For Teachers
1. Review all attempts for a quiz before publishing
2. Add helpful comments on difficult questions
3. Check calculations are correct before saving
4. Publish results promptly so students know status
5. Use batch marking if many similar responses

### For Students
1. Attempt quizzes within the valid date range
2. Check results section regularly for published results
3. Read teacher feedback carefully
4. Note which question types you struggled with

---

## Technical Details

### API Endpoints Used
- `GET /api/result/teacher/quiz/:quizId` - Get attempts
- `GET /api/result/teacher/attempt/:resultId` - Get details
- `PUT /api/result/teacher/:resultId/mark` - Save marks
- `PUT /api/result/teacher/:resultId/publish` - Publish result

### Authorization
- Teachers: Must own the quiz (created by them)
- Students: Can only see published results for quizzes they attempted
- Role-based access control enforced

---

## Data Fields

### Result Object
```javascript
{
  _id: ObjectId,
  userId: ObjectId,
  quizId: ObjectId,
  totalMarks: Number,
  obtainedMarks: Number,
  percentage: Number,
  isPassed: Boolean,
  reviewStatus: "pending" | "in-progress" | "marked" | "published",
  submittedAt: Date,
  markedBy: ObjectId,           // Teacher who marked
  markedAt: Date,
  reviewComments: String,
  answers: [
    {
      questionId: ObjectId,
      selectedAnswer: String,
      typedAnswer: String,
      marksObtained: Number,
      isCorrect: Boolean,
      requiresManualReview: Boolean
    }
  ]
}
```

---

## Support

For issues or feature requests related to the marking system, ensure:
1. All backend endpoints are running
2. Teacher has valid authentication token
3. Quiz has questions before attempting
4. Database is properly connected

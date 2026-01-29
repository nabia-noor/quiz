# Teacher Quiz Management - Quick Reference

## User Workflow

### Step 1: Teacher Login
- Navigate to `/teacher/login`
- Enter email and password
- JWT token stored in localStorage

### Step 2: Dashboard
- View assigned batches and recent quizzes
- Click "Edit" button on any quiz to manage it

### Step 3: Create New Quiz
- Click "Create Quiz" button on dashboard
- Fill form:
  - Quiz Title
  - Description
  - Select Course
  - Duration (minutes)
  - Total Marks
  - Passing Marks
  - Start Date
  - End Date
- Save quiz (creates in Draft status)

### Step 4: Add Questions
- From dashboard, click "Edit" on quiz
- On TeacherQuizManagement page:
  - Click "Add Question" button
  - Select question type:
    - **MCQ**: Provide 4 options, mark correct answer
    - **True/False**: Two options, mark correct
    - **Short Answer**: No options needed
  - Enter question text
  - Enter marks (1-100)
  - Save question

### Step 5: Manage Questions
- **Edit Question**: Click "Edit" on question card
  - Modify text, type, options, or marks
  - Save changes
  - Only possible before publishing

- **Delete Question**: Click "Delete" on question card
  - Confirms deletion
  - Only possible before publishing

### Step 6: Publish Quiz
- When ready and quiz has ≥1 question
- Click "Publish Quiz" button
- Confirm publication
- Quiz becomes active for students
- Questions locked from editing

### Step 7: Delete Quiz (Optional)
- Click "Delete Quiz" button
- Confirm irreversible deletion
- Quiz removed from system

## API Endpoints Used

### Teacher Authentication
```
POST /api/teacher/login
Body: { email, password }
```

### Quiz Management
```
POST /api/quiz/teacher/create        - Create quiz
GET  /api/quiz/teacher/my-quizzes    - List teacher's quizzes
GET  /api/quiz/{id}                  - Get quiz details
PUT  /api/quiz/teacher/{id}          - Update quiz (publish)
DELETE /api/quiz/teacher/{id}        - Delete quiz
```

### Question Management
```
POST /api/question                   - Create question
GET  /api/question/quiz/{quizId}     - Get all questions for quiz
PUT  /api/question/{id}              - Update question
DELETE /api/question/{id}            - Delete question
```

## Component Structure

```
App.js
├── /teacher/login → TeacherLogin.js
├── /teacher/dashboard → TeacherDashboard.js
│   └── [Edit button] → TeacherQuizManagement.js
├── /teacher/create-quiz → TeacherCreateQuiz.js
├── /teacher/quiz/{quizId} → TeacherQuizManagement.js ← NEW
├── /teacher/batch/{classId} → TeacherBatchCourses.js
└── /teacher/results → TeacherResults.js
```

## Question Type Reference

### MCQ (Multiple Choice Question)
- Max 4 options
- Exactly 1 correct answer
- Format:
  ```json
  {
    "questionType": "mcq",
    "questionText": "What is 2+2?",
    "options": [
      { "optionText": "3", "isCorrect": false },
      { "optionText": "4", "isCorrect": true },
      { "optionText": "5", "isCorrect": false },
      { "optionText": "6", "isCorrect": false }
    ],
    "marks": 1
  }
  ```

### True/False
- Always 2 options
- Exactly 1 correct answer
- Format:
  ```json
  {
    "questionType": "truefalse",
    "questionText": "The Earth is flat.",
    "options": [
      { "optionText": "True", "isCorrect": false },
      { "optionText": "False", "isCorrect": true }
    ],
    "marks": 1
  }
  ```

### Short Answer
- No options
- Student types free-form response
- Format:
  ```json
  {
    "questionType": "shortanswer",
    "questionText": "What is the capital of France?",
    "options": [],
    "marks": 2
  }
  ```

## Status Indicators

### Quiz Status
- **Draft** (Yellow): Freshly created, can edit questions
- **Published** (Green): Active for students, questions locked

## Navigation

### From TeacherQuizManagement:
- "Back to Dashboard" → `/teacher/dashboard`
- "Create Quiz" → `/teacher/create-quiz`
- "My Results" → `/teacher/results`
- "Logout" → `/teacher/login`

### From TeacherDashboard:
- "Edit" on quiz row → `/teacher/quiz/{quizId}`
- "View Courses" → `/teacher/batch/{classId}`
- "My Results" → `/teacher/results`

## Authentication Headers

All requests include:
```
Authorization: Bearer {teacherToken}
```

Where teacherToken is the JWT received from teacher login.

## Error Handling

### Common Errors
1. **"Quiz not found"**
   - Quiz may have been deleted
   - Go back to dashboard and refresh

2. **"Unauthorized - This is not your quiz"**
   - Trying to edit another teacher's quiz
   - Check URL quizId

3. **"Cannot add questions - Quiz already published"**
   - Quiz is active, delete and recreate if needed
   - Or contact admin to unpublish

4. **"Question requires at least one correct answer"**
   - For MCQ/True-False, mark checkbox on correct option

5. **"Cannot publish - Quiz needs at least 1 question"**
   - Add a question first before publishing

## Storage

Teacher data stored in localStorage:
```javascript
{
  teacherToken: "jwt_token_here",
  teacherId: "mongodb_id",
  teacherName: "John Doe",
  teacherEmail: "john@example.com"
}
```

## File Locations

### New Files
- `frontend/src/components/TeacherQuizManagement.js` - Main component
- `frontend/src/components/TeacherQuizManagement.css` - Styling

### Modified Files
- `frontend/src/App.js` - Added route and import
- `frontend/src/api.js` - Updated authentication handling

## Keyboard Shortcuts

None implemented yet. Consider:
- `Ctrl+S` to save question
- `Esc` to cancel editing
- `Delete` to delete question (with confirmation)

## Accessibility

- All forms have proper labels
- Buttons have descriptive text
- Status indicators use color + text
- Confirmation dialogs for destructive actions
- Proper ARIA attributes recommended

## Mobile Responsiveness

- Grid layouts adjust to screen size
- Buttons stack on small screens
- Forms are single-column
- Cards are responsive

## Rate Limiting

No rate limiting implemented. Consider adding for production:
- 100 quizzes per teacher per semester
- 500 questions per quiz
- 10 requests per second API limit

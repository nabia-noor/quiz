# Quiz Application - Architecture Guide

## Frontend State Management (React)

### کیسے کام کرتا ہے؟

React میں **useState** استعمال ہو رہی ہے state management کے لیے۔ ہر component میں اپنا state ہے۔

### State کیا ہے؟

State = Component کی current information (ڈیٹا)
جب state تبدیل ہو تو component خود بخود update ہو جاتا ہے۔

**مثال:**

```javascript
const [quizzes, setQuizzes] = useState([]); // خالی array سے شروع
// جب API response آئے تو setQuizzes کے ذریعے update کریں
```

---

## API CALLS - کون سا page کون سی API call کرتا ہے

### 1. **User Login Page** (`UserLogin.js`)

```
API CALL:
POST /api/user/login
Body: { email, password }

STATE UPDATES:
- token کو localStorage میں save کرنا
- user data store کرنا
- redirect to /user/dashboard
```

### 2. **Admin Login Page** (`AdminLogin.js`)

```
API CALL:
POST /api/admin/login
Body: { email, password }

STATE UPDATES:
- adminToken کو localStorage میں save
- adminData store کرنا
- redirect to /admin/dashboard
```

### 3. **User Dashboard** (`UserDashboard.js`)

```
API CALLS:
1. GET /api/user/profile (profile fetch کرنے کے لیے)
2. GET /api/quiz/available (دستیاب quizzes دیکھنے کے لیے)

STATE:
- [userProfile, setUserProfile] = user کی معلومات
- [quizzes, setQuizzes] = quizzes کی list
```

### 4. **Quiz Attempt** (`QuizAttempt.js`)

```
API CALLS:
1. GET /api/quiz/:id (quiz details لینا)
2. GET /api/question/quiz/:id (تمام questions لینا)
3. POST /api/result/submit (جواب submit کرنا)

STATE:
- [currentQuestion, setCurrentQuestion] = موجودہ سوال
- [answers, setAnswers] = user کے جوابات
- [timeLeft, setTimeLeft] = بقایا وقت
```

### 5. **Quiz Management (Admin)** (`QuizManagement.js`)

```
API CALLS:
1. GET /api/quiz/all (تمام quizzes لینا)
2. GET /api/class/all (classes لینا)
3. POST /api/quiz/create (نیا quiz بنانا)
4. PUT /api/quiz/:id (quiz update کرنا)
5. DELETE /api/quiz/:id (quiz ڈیلیٹ کرنا)

STATE:
- [quizzes, setQuizzes]
- [classes, setClasses]
- [formData, setFormData]
- [editingId, setEditingId]
```

### 6. **Question Management (Admin)** (`QuestionManagement.js`)

```
API CALLS:
1. GET /api/quiz/all (quizzes list)
2. GET /api/class/all (classes list)
3. GET /api/question/quiz/:quizId (quiz کے questions)
4. POST /api/question/create (نیا question)
5. PUT /api/question/:id (question edit)
6. DELETE /api/question/:id (question delete)

STATE:
- [quizzes, setQuizzes]
- [classes, setClasses]
- [questions, setQuestions]
- [formData, setFormData] (question form data)
- [selectedQuizId, setSelectedQuizId]
```

### 7. **Results Management (Admin)** (`ResultManagement.js`)

```
API CALLS:
1. GET /api/result/all (تمام results لینا)
2. GET /api/result/:id (ایک result کی details)
3. PUT /api/result/:id/review (typed answer کو mark کرنا)

STATE:
- [results, setResults]
- [filters, setFilters]
```

### 8. **User Results Page** (`UserResults.js`)

```
API CALLS:
1. GET /api/result/user-results (user کے تمام results)

STATE:
- [results, setResults]
- [selectedResult, setSelectedResult]
```

---

## Data Flow (ڈیٹا کا بہاؤ)

```
USER INTERACTION
    ↓
    ↓ (user button دبائے)
    ↓
FUNCTION CALL (handleSubmit, handleEdit, etc.)
    ↓
    ↓ (API request بھیجنا)
    ↓
API.js (axios سے backend کو call)
    ↓
    ↓ (backend جواب دے)
    ↓
STATE UPDATE (setData استعمال کریں)
    ↓
    ↓ (component دوبارہ render ہو)
    ↓
SCREEN UPDATE (صارف کو نیا data نظر آئے)
```

---

## LocalStorage میں کیا Save ہے؟

```javascript
// User
localStorage.userToken; // JWT token
localStorage.userData; // { id, name, email, classId }

// Admin
localStorage.adminToken; // JWT token
localStorage.adminData; // { id, name, email }
```

---

## API Calls کا Pattern

### ہر API call میں یہ ہوتا ہے:

```javascript
try {
  // 1. Loading state set کریں
  setLoading(true);

  // 2. API call کریں
  const response = await axios.post("/api/endpoint", data);

  // 3. Response چیک کریں
  if (response.data.success) {
    // Success - data update کریں
    setData(response.data.data);
  } else {
    // Error message دکھائیں
    setError(response.data.message);
  }
} catch (error) {
  // Network error یا کوئی مسئلہ
  setError("کوئی خرابی ہوگئی");
} finally {
  // Loading state ختم کریں
  setLoading(false);
}
```

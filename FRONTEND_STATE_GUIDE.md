# Frontend State Management - تفصیل سے

## useState Hook - سب سے سادہ طریقہ

### کیا ہے State؟

State = Component کے ہاں موجود موجودہ ڈیٹا

مثال:

```javascript
// یہ ہے state declaration
const [quizzes, setQuizzes] = useState([]);

// quizzes = موجودہ value (خالی array سے شروع)
// setQuizzes = اس کو تبدیل کرنے کا function
```

### کیسے کام کرتا ہے؟

```javascript
// شروع میں
const [count, setCount] = useState(0);
// count = 0

// جب user button دبائے
setCount(count + 1);
// اب count = 1
// اور component دوبارہ render ہوتا ہے
```

---

## Page-by-Page State Breakdown

### 1. UserLogin.js

```javascript
// Form data store کرنا
const [formData, setFormData] = useState({
  email: "",
  password: "",
});

// Loading state
const [isLoading, setIsLoading] = useState(false);

// Error message
const [error, setError] = useState("");

// جب user type کرے
const handleChange = (e) => {
  setFormData({
    ...formData,
    [e.target.name]: e.target.value,
  });
};

// جب user submit کرے
const handleSubmit = async (e) => {
  setIsLoading(true);

  try {
    const response = await axios.post("/api/user/login", formData);

    // Token save کرو
    localStorage.userToken = response.data.token;
    localStorage.userData = JSON.stringify(response.data.user);

    // Redirect
    navigate("/user/dashboard");
  } catch (err) {
    setError(err.response.data.message);
  } finally {
    setIsLoading(false);
  }
};
```

---

### 2. QuizAttempt.js (سب سے ضرور state والا)

```javascript
// موجودہ سوال کے لیے state
const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);

// تمام سوالات
const [questions, setQuestions] = useState([]);

// صارف کے جوابات
const [answers, setAnswers] = useState({
  // Structure:
  // {
  //   "question1_id": "option_text"  (MCQ کے لیے)
  //   "question2_id": "typed answer" (Typed کے لیے)
  // }
});

// بقایا وقت (سیکنڈز میں)
const [timeLeft, setTimeLeft] = useState(1800); // 30 منٹ

// Timer - ہر سیکنڈ چلے
useEffect(() => {
  const timer = setInterval(() => {
    setTimeLeft((prev) => prev - 1);
  }, 1000);

  return () => clearInterval(timer);
}, []);

// جواب save کرنا
const handleAnswerChange = (questionId, answer) => {
  setAnswers({
    ...answers,
    [questionId]: answer,
  });
};

// اگلے سوال پر جانا
const handleNext = () => {
  if (currentQuestionIndex < questions.length - 1) {
    setCurrentQuestionIndex(currentQuestionIndex + 1);
  }
};

// پچھلے سوال پر جانا
const handlePrevious = () => {
  if (currentQuestionIndex > 0) {
    setCurrentQuestionIndex(currentQuestionIndex - 1);
  }
};
```

---

### 3. QuizManagement.js (Admin)

```javascript
// تمام quizzes
const [quizzes, setQuizzes] = useState([]);

// تمام classes
const [classes, setClasses] = useState([]);

// Form دکھانا یا نہیں
const [showForm, setShowForm] = useState(false);

// اگر editing ہو تو ID
const [editingId, setEditingId] = useState(null);

// Form data
const [formData, setFormData] = useState({
  title: "",
  description: "",
  classId: "",
  duration: 30,
  totalMarks: 100,
  passingMarks: 40,
  startDate: "",
  expiryDate: "",
  isActive: true,
});

// Component load ہو تو quizzes fetch کرو
useEffect(() => {
  fetchQuizzes();
  fetchClasses();
}, []);

// Quizzes fetch کرنا
const fetchQuizzes = async () => {
  try {
    const result = await quizAPI.getAll();
    setQuizzes(result.quizzes);
  } catch (error) {
    console.error("Error:", error);
  }
};

// Create/Update
const handleSubmit = async (e) => {
  e.preventDefault();

  try {
    if (editingId) {
      // Update
      await quizAPI.update(editingId, formData);
    } else {
      // Create
      await quizAPI.create(formData);
    }

    // دوبارہ fetch کرو
    fetchQuizzes();

    // Form بند کرو
    setShowForm(false);
  } catch (error) {
    alert("Error: " + error.message);
  }
};

// Edit شروع کرنا
const handleEdit = (quiz) => {
  setFormData({
    title: quiz.title,
    description: quiz.description,
    // ... دوسری fields
  });
  setEditingId(quiz._id);
  setShowForm(true);
};

// Delete کرنا
const handleDelete = async (id) => {
  if (window.confirm("کیا واقعی ڈیلیٹ کرنا ہے؟")) {
    await quizAPI.delete(id);
    fetchQuizzes(); // دوبارہ fetch
  }
};

// Reset form
const resetForm = () => {
  setFormData({
    title: "",
    description: "",
    classId: "",
    duration: 30,
    totalMarks: 100,
    passingMarks: 40,
    startDate: "",
    expiryDate: "",
    isActive: true,
  });
  setEditingId(null);
  setShowForm(false);
};
```

---

### 4. QuestionManagement.js

```javascript
// Selected quiz
const [selectedQuizId, setSelectedQuizId] = useState("");

// Quiz details
const [quiz, setQuiz] = useState(null);

// تمام questions
const [questions, setQuestions] = useState([]);

// تمام quizzes
const [quizzes, setQuizzes] = useState([]);

// تمام classes
const [classes, setClasses] = useState([]);

// Form دکھایا یا نہیں
const [showForm, setShowForm] = useState(false);

// Editing ID
const [editingId, setEditingId] = useState(null);

// Question form
const [formData, setFormData] = useState({
  questionType: "mcq",
  questionText: "",
  classId: "",
  options: [
    { optionText: "", isCorrect: false },
    { optionText: "", isCorrect: false },
    { optionText: "", isCorrect: false },
    { optionText: "", isCorrect: false },
  ],
  marks: 1,
  startDate: "",
  expiryDate: "",
  isActive: true,
});

// جب quiz select ہو
useEffect(() => {
  if (selectedQuizId) {
    fetchQuiz(selectedQuizId);
    fetchQuestions(selectedQuizId);
  }
}, [selectedQuizId]);

// Option change
const handleOptionChange = (index, field, value) => {
  const newOptions = [...formData.options];
  newOptions[index][field] = value;
  setFormData({ ...formData, options: newOptions });
};

// Option شامل کرنا
const addOption = () => {
  setFormData({
    ...formData,
    options: [...formData.options, { optionText: "", isCorrect: false }],
  });
};

// Option نکالنا
const removeOption = (index) => {
  if (formData.options.length > 2) {
    const newOptions = formData.options.filter((_, i) => i !== index);
    setFormData({ ...formData, options: newOptions });
  }
};
```

---

## Data Flow - Visual

```
┌─────────────────────┐
│   User Action       │  (button click, form submit, etc.)
└──────────┬──────────┘
           │
           ↓
┌─────────────────────┐
│  Event Handler      │  (handleSubmit, handleChange, etc.)
└──────────┬──────────┘
           │
           ↓
┌─────────────────────┐
│   setState Call     │  (setQuizzes, setFormData, etc.)
└──────────┬──────────┘
           │
           ↓
┌─────────────────────┐
│   State Updated     │
└──────────┬──────────┘
           │
           ↓
┌─────────────────────┐
│  Component Re-Render│
└──────────┬──────────┘
           │
           ↓
┌─────────────────────┐
│   UI Update         │  (صارف کو نیا ڈیٹا نظر آتا ہے)
└─────────────────────┘
```

---

## State Management Best Practices

### ✅ ٹھیک ہے:

```javascript
// State کو direct modify نہ کریں
setData({
  ...data,
  name: "نیا نام",
});

// Arrays میں:
setArray([...array, newItem]);
```

### ❌ غلط ہے:

```javascript
// Direct modification
data.name = "نیا نام";
setData(data); // ❌ React کو پتا نہیں چلے گا

// Array میں push:
array.push(newItem);
setArray(array); // ❌ Re-render نہیں ہوگا
```

---

## useEffect - جب component load ہو

```javascript
// Component load ہو تو ایک بار چلے
useEffect(() => {
  fetchData();
}, []); // Empty dependency array = صرف ایک بار

// جب بھی dependency تبدیل ہو
useEffect(() => {
  fetchData();
}, [selectedQuizId]); // جب selectedQuizId تبدیل ہو تو چلے

// Cleanup function
useEffect(() => {
  const timer = setInterval(() => {
    // timer چلے
  }, 1000);

  return () => clearInterval(timer); // Cleanup - component unmount ہو تو timer روک دو
}, []);
```

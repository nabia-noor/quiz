# Backend Error Handling & Authentication

## Error Handling - کیسے کام کرتا ہے؟

### 1. **Try-Catch Blocks**

ہر API endpoint میں error handling ہے:

```javascript
export const loginUser = async (req, res) => {
  try {
    // Code یہاں چلتا ہے
    const user = await User.findOne({ email });

    if (!user) {
      // اگر کوئی problem ہو تو error بھیجو
      return res.status(404).json({
        success: false,
        message: "صارف نہیں ملا",
      });
    }

    // Success response
    return res.status(200).json({
      success: true,
      token: token,
      user: user,
    });
  } catch (error) {
    // اگر کوئی unexpected error آئے
    return res.status(500).json({
      success: false,
      message: "سرور میں خرابی ہے",
      error: error.message,
    });
  }
};
```

### 2. **HTTP Status Codes** کا مطلب:

| Code    | مطلب         | مثال                       |
| ------- | ------------ | -------------------------- |
| **200** | سب ٹھیک ہے   | Login successful           |
| **400** | خراب request | Invalid email format       |
| **401** | بغیر اختیار  | Token expired              |
| **403** | اختیار نہیں  | Admin-only endpoint        |
| **404** | نہیں ملا     | Quiz not found             |
| **500** | سرور error   | Database connection failed |

### 3. **Validation Errors**

```javascript
if (!email || !password) {
  return res.status(400).json({
    success: false,
    message: "ای میل اور پاس ورڈ ضروری ہیں",
  });
}
```

---

## Authentication & Token - سادہ الفاظ میں

### کیا ہے Token؟

Token = ایک خفیہ چھوٹا کوڈ جو user کو دیا جاتا ہے
یہ کہتا ہے: "ہاں، یہ صارف لاگ ان ہے"

### کیسے کام کرتا ہے؟

```
STEP 1: USER LOGIN
━━━━━━━━━━━━━━━━━
صارف: "میرا email ہے xyz@gmail.com اور password ہے 123"
           ↓
Backend: "ٹھیک ہے، چیک کر رہے ہیں..."
           ↓
Backend: "ہاں، صحیح ہے!"
           ↓
Backend: صارف کو ایک JWT Token دیتا ہے
Token = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."


STEP 2: TOKEN SAVE
━━━━━━━━━━━━━━━━━
Frontend: localStorage میں token save کرتا ہے
localStorage.userToken = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."


STEP 3: PROTECTED REQUEST
━━━━━━━━━━━━━━━━━━━━━━━━
صارف: "مجھے میرے results دکھاؤ" (GET /api/result)
           ↓
Frontend: Token کے ساتھ request بھیجتا ہے
Headers: {
  Authorization: "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
           ↓
Backend: Middleware token چیک کرتا ہے
           ↓
Middleware: "ہاں، یہ token valid ہے!"
           ↓
Backend: Results دیتا ہے
           ↓
Frontend: Results screen پر دکھاتا ہے
```

---

## Middleware - سیکیورٹی گارڈ

### Middleware کیا ہے؟

Middleware = ایک گارڈ جو ہر request کو چیک کرتا ہے

### authMiddleware.js (User کے لیے)

```javascript
export const authMiddleware = async (req, res, next) => {
  try {
    // STEP 1: Token نکالو Headers سے
    const token = req.headers.authorization?.split(" ")[1];

    if (!token) {
      return res.status(401).json({
        success: false,
        message: "Token نہیں ملا - پہلے لاگ ان کریں",
      });
    }

    // STEP 2: Token کو decode کرو (verify کرو)
    const decoded = jwt.verify(token, "your-secret-key");

    // STEP 3: User کی ID نکالو
    req.userId = decoded.userId;

    // STEP 4: اگلے function کو جائیں
    next();
  } catch (error) {
    return res.status(401).json({
      success: false,
      message: "Token غلط ہے یا ختم ہو گیا ہے",
    });
  }
};
```

### adminAuthMiddleware.js (Admin کے لیے)

```javascript
export const adminAuthMiddleware = async (req, res, next) => {
  try {
    const token = req.headers.authorization?.split(" ")[1];

    if (!token) {
      return res.status(401).json({
        success: false,
        message: "Admin token نہیں ملا",
      });
    }

    const decoded = jwt.verify(token, "admin-secret-key");
    req.adminId = decoded.adminId;

    next();
  } catch (error) {
    return res.status(403).json({
      success: false,
      message: "صرف Admin access کر سکتے ہیں",
    });
  }
};
```

---

## Routes میں Middleware کا استعمال

```javascript
// Protected route - User کے لیے
router.get("/user/profile", authMiddleware, userController.getProfile);
//                           ↑
//                    یہ middleware check کرے گا
//                    کہ token valid ہے یا نہیں

// Protected route - Admin کے لیے
router.post(
  "/admin/create-quiz",
  adminAuthMiddleware,
  quizController.createQuiz,
);
//                                 ↑
//                        Admin middleware check کرے گا
```

---

## JWT Token کیا ہے؟

JWT = JSON Web Token

### تین حصے:

```
HEADER.PAYLOAD.SIGNATURE
───────────────────────

HEADER:   { "alg": "HS256", "typ": "JWT" }
PAYLOAD:  { "userId": "123", "email": "user@gmail.com" }
SIGNATURE: ایک خفیہ کوڈ جو server بناتا ہے
```

### کیوں استعمال ہوتا ہے؟

1. **Stateless**: سرور کو user کی معلومات store کرنی نہیں پڑتی
2. **Secure**: ہر token میں signature ہے
3. **Portable**: ہر request میں بھیجا جا سکتا ہے

---

## Login سے Token بننا تک

```javascript
// backend/controllers/userController.js

export const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;

    // STEP 1: User ڈھونڈو
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ success: false, message: "User نہیں ملا" });
    }

    // STEP 2: Password چیک کرو
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return res.status(400).json({ success: false, message: "غلط پاس ورڈ" });
    }

    // STEP 3: JWT Token بناؤ
    const token = jwt.sign(
      { userId: user._id, email: user.email },
      "your-secret-key",
      { expiresIn: "7d" }, // 7 دن میں expire ہوگا
    );

    // STEP 4: Token واپس دو
    return res.status(200).json({
      success: true,
      token: token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
      },
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: "سرور میں خرابی" });
  }
};
```

---

## Frontend میں Token کا استعمال

```javascript
// frontend/src/api.js

const api = axios.create();

// ہر request میں token لگاؤ
api.interceptors.request.use((config) => {
  const token = localStorage.userToken || localStorage.adminToken;

  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
    //                              ↑
    //                        Token یہاں لگایا
  }

  return config;
});
```

### مثال: protected API call

```javascript
// کسی بھی component میں

const fetchUserProfile = async () => {
  try {
    const response = await axios.get("/api/user/profile");
    // ↑ Backend میں authMiddleware چلے گا
    // ↑ Token automatically Header میں بھیجا جائے گا

    setUserProfile(response.data.user);
  } catch (error) {
    alert("لاگ ان دوبارہ کریں");
  }
};
```

---

## Error Handling سے بہتری

### Good Error Handling:

```javascript
✅ res.status(400).json({
  success: false,
  message: "ای میل غلط ہے",
  details: "ای میل میں @ ہونا لازمی ہے"
});

❌ return res.json({ error: "کوئی مسئلہ ہے" });
```

### اچھے HTTP Codes:

```javascript
✅ res.status(400)  // Bad Request
✅ res.status(401)  // Unauthorized
✅ res.status(403)  // Forbidden
✅ res.status(404)  // Not Found
✅ res.status(500)  // Server Error

❌ res.status(200)  // ہمیشہ 200 نہ دو
```

# User Features API Documentation

## Base URL

```
http://localhost:4000/api
```

## Authentication

Most endpoints require JWT authentication. Send token in header:

```
Authorization: Bearer <JWT_TOKEN>
```

---

## 1. User Authentication Endpoints

### Register New User

```http
POST /user/register
Content-Type: application/json

{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "securePassword123"
}
```

**Response (Success - 201)**

```json
{
  "success": true,
  "message": "account created successfully",
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": "507f1f77bcf86cd799439011",
    "name": "John Doe",
    "email": "john@example.com"
  }
}
```

**Response (Error - 400)**

```json
{
  "success": false,
  "message": "Email already in use"
}
```

---

### User Login

```http
POST /user/login
Content-Type: application/json

{
  "email": "john@example.com",
  "password": "securePassword123"
}
```

**Response (Success - 200)**

```json
{
  "success": true,
  "message": "Login successful",
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": "507f1f77bcf86cd799439011",
    "name": "John Doe",
    "email": "john@example.com"
  }
}
```

**Response (Error - 401)**

```json
{
  "success": false,
  "message": "Invalid credentials"
}
```

---

### Get User Profile

```http
GET /user/profile
Authorization: Bearer <JWT_TOKEN>
```

**Response (Success - 200)**

```json
{
  "success": true,
  "user": {
    "id": "507f1f77bcf86cd799439011",
    "name": "John Doe",
    "email": "john@example.com"
  }
}
```

**Response (Error - 401)**

```json
{
  "success": false,
  "message": "Invalid or expired token."
}
```

---

## 2. Quiz Endpoints

### Get All Available Quizzes (User)

```http
GET /quiz/all
Authorization: Bearer <JWT_TOKEN>
```

**Response (Success - 200)**

```json
{
  "success": true,
  "quizzes": [
    {
      "_id": "507f1f77bcf86cd799439012",
      "title": "JavaScript Basics",
      "description": "Learn JavaScript fundamentals",
      "classId": {
        "_id": "507f1f77bcf86cd799439010",
        "name": "Web Development"
      },
      "duration": 30,
      "totalMarks": 100,
      "passingMarks": 40,
      "startDate": "2024-01-15T10:00:00Z",
      "expiryDate": "2024-01-20T23:59:59Z",
      "isActive": true
    }
  ]
}
```

---

### Get Quiz by ID

```http
GET /quiz/507f1f77bcf86cd799439012
Authorization: Bearer <JWT_TOKEN>
```

**Response (Success - 200)**

```json
{
  "success": true,
  "quiz": {
    "_id": "507f1f77bcf86cd799439012",
    "title": "JavaScript Basics",
    "description": "Learn JavaScript fundamentals",
    "duration": 30,
    "totalMarks": 100,
    "passingMarks": 40,
    "startDate": "2024-01-15T10:00:00Z",
    "expiryDate": "2024-01-20T23:59:59Z",
    "isActive": true
  }
}
```

---

## 3. Question Endpoints

### Get Questions for Quiz

```http
GET /question/quiz/507f1f77bcf86cd799439012
Authorization: Bearer <JWT_TOKEN>
```

**Response (Success - 200)**

```json
{
  "success": true,
  "questions": [
    {
      "_id": "507f1f77bcf86cd799439013",
      "questionText": "What is a variable?",
      "quizId": "507f1f77bcf86cd799439012",
      "marks": 5,
      "options": [
        {
          "optionText": "A named container for data",
          "isCorrect": true
        },
        {
          "optionText": "A function parameter",
          "isCorrect": false
        },
        {
          "optionText": "A loop statement",
          "isCorrect": false
        },
        {
          "optionText": "A conditional statement",
          "isCorrect": false
        }
      ]
    }
  ]
}
```

---

## 4. Result Endpoints

### Submit Quiz (Create Result)

```http
POST /result/submit
Authorization: Bearer <JWT_TOKEN>
Content-Type: application/json

{
  "quizId": "507f1f77bcf86cd799439012",
  "answers": [
    {
      "questionId": "507f1f77bcf86cd799439013",
      "selectedAnswer": "A named container for data"
    },
    {
      "questionId": "507f1f77bcf86cd799439014",
      "selectedAnswer": "const"
    }
  ]
}
```

**Response (Success - 201)**

```json
{
  "success": true,
  "message": "Quiz submitted successfully",
  "result": {
    "totalMarks": 100,
    "obtainedMarks": 95,
    "percentage": 95,
    "isPassed": true,
    "resultId": "507f1f77bcf86cd799439015"
  }
}
```

---

### Get User's Results

```http
GET /result/user/507f1f77bcf86cd799439011
Authorization: Bearer <JWT_TOKEN>
```

**Response (Success - 200)**

```json
{
  "success": true,
  "results": [
    {
      "_id": "507f1f77bcf86cd799439015",
      "userId": "507f1f77bcf86cd799439011",
      "quizId": {
        "_id": "507f1f77bcf86cd799439012",
        "title": "JavaScript Basics",
        "description": "Learn JavaScript fundamentals",
        "totalMarks": 100
      },
      "obtainedMarks": 95,
      "totalMarks": 100,
      "percentage": 95,
      "isPassed": true,
      "submittedAt": "2024-01-16T14:30:00Z"
    }
  ]
}
```

---

### Get User Statistics

```http
GET /result/user-stats/507f1f77bcf86cd799439011
Authorization: Bearer <JWT_TOKEN>
```

**Response (Success - 200)**

```json
{
  "success": true,
  "stats": {
    "totalQuizzes": 5,
    "completedQuizzes": 5,
    "passedQuizzes": 4,
    "averageScore": 82.4
  }
}
```

---

### Get Result Details

```http
GET /result/507f1f77bcf86cd799439015
Authorization: Bearer <JWT_TOKEN>
```

**Response (Success - 200)**

```json
{
  "success": true,
  "result": {
    "_id": "507f1f77bcf86cd799439015",
    "userId": {
      "_id": "507f1f77bcf86cd799439011",
      "name": "John Doe",
      "email": "john@example.com"
    },
    "quizId": {
      "_id": "507f1f77bcf86cd799439012",
      "title": "JavaScript Basics",
      "description": "Learn JavaScript fundamentals",
      "totalMarks": 100
    },
    "answers": [
      {
        "questionId": {
          "_id": "507f1f77bcf86cd799439013",
          "questionText": "What is a variable?"
        },
        "selectedAnswer": "A named container for data",
        "isCorrect": true,
        "marksObtained": 5
      }
    ],
    "totalMarks": 100,
    "obtainedMarks": 95,
    "percentage": 95,
    "isPassed": true,
    "submittedAt": "2024-01-16T14:30:00Z"
  }
}
```

---

## Error Responses

### 400 Bad Request

```json
{
  "success": false,
  "message": "Quiz ID and answers are required"
}
```

### 401 Unauthorized

```json
{
  "success": false,
  "message": "No token provided. Access denied."
}
```

### 403 Forbidden

```json
{
  "success": false,
  "message": "Unauthorized access"
}
```

### 404 Not Found

```json
{
  "success": false,
  "message": "Quiz not found"
}
```

### 500 Server Error

```json
{
  "success": false,
  "message": "Server error",
  "error": "Detailed error message"
}
```

---

## Request/Response Headers

### Request Headers (Protected Routes)

```
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
Content-Type: application/json
```

### Response Headers

```
Content-Type: application/json
X-Content-Type-Options: nosniff
```

---

## Status Codes

| Code | Meaning                         |
| ---- | ------------------------------- |
| 200  | OK - Request successful         |
| 201  | Created - Resource created      |
| 400  | Bad Request - Invalid input     |
| 401  | Unauthorized - No/invalid token |
| 403  | Forbidden - No permission       |
| 404  | Not Found - Resource not found  |
| 500  | Server Error                    |

---

## Example JavaScript Fetch Calls

### Register User

```javascript
const registerUser = async (name, email, password) => {
  const response = await fetch("http://localhost:4000/api/user/register", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ name, email, password }),
  });

  const data = await response.json();
  if (data.success) {
    localStorage.setItem("userToken", data.token);
    localStorage.setItem("userId", data.user.id);
  }
  return data;
};
```

### Get All Quizzes

```javascript
const getAllQuizzes = async () => {
  const token = localStorage.getItem("userToken");
  const response = await fetch("http://localhost:4000/api/quiz/all", {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  return response.json();
};
```

### Submit Quiz

```javascript
const submitQuiz = async (quizId, answers) => {
  const token = localStorage.getItem("userToken");
  const response = await fetch("http://localhost:4000/api/result/submit", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ quizId, answers }),
  });

  return response.json();
};
```

### Get User Results

```javascript
const getUserResults = async () => {
  const token = localStorage.getItem("userToken");
  const userId = localStorage.getItem("userId");
  const response = await fetch(
    `http://localhost:4000/api/result/user/${userId}`,
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  );

  return response.json();
};
```

---

## Rate Limiting

Currently no rate limiting is implemented. Consider adding rate limiting for:

- Login attempts
- Quiz submissions
- Result queries

---

## Version History

| Version | Date       | Changes                              |
| ------- | ---------- | ------------------------------------ |
| 1.0     | 2024-01-15 | Initial user features implementation |

---

## Notes

- All timestamps are in ISO 8601 format (UTC)
- JWT tokens expire after 7 days
- Passwords are hashed with bcryptjs (10 rounds)
- Maximum answer length should be validated on backend
- Consider implementing pagination for large result sets

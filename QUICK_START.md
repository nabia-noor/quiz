# Quick Start Guide - User Features

## Installation & Setup

### 1. Backend Setup

```bash
cd backend
npm install
```

Make sure you have MongoDB running locally or update the connection string in `config/db.js`.

### 2. Start Backend Server

```bash
npm start
```

Server should run on `http://localhost:4000`

### 3. Frontend Setup

```bash
cd frontend
npm install
```

### 4. Start Frontend Server

```bash
npm start
```

Frontend should run on `http://localhost:3000`

---

## First Time User Journey

### Step 1: Register/Login

1. Navigate to `http://localhost:3000`
2. You'll be redirected to `/user/login`
3. Click on "Register here" to create a new account
4. Fill in name, email, and password
5. Click "Register"
6. You'll be automatically logged in and redirected to dashboard

### Step 2: Explore Quizzes

1. On the dashboard, click "📝 Available Quizzes"
2. View all available quizzes with filters
3. Quizzes show status, duration, marks, and dates
4. Click "Start Quiz" on any available quiz

### Step 3: Attempt Quiz

1. Questions appear one by one
2. Select answers using radio buttons
3. Use Previous/Next buttons to navigate
4. Use the question grid on the right for quick navigation
5. Watch the timer in the header
6. Click "Submit Quiz" on the last question
7. Confirm submission in the dialog

### Step 4: View Results

1. After submission, you're redirected to Results page
2. See your score, percentage, and pass/fail status
3. View detailed answer review
4. Use filters to see different results
5. Click "Take Another Quiz" to attempt more

### Step 5: Dashboard

1. Return to dashboard to see your statistics
2. View total quizzes, completed count, and average score
3. Quick action buttons for fast navigation

---

## Environment Variables (if needed)

### Backend (.env file in backend/)

```
PORT=4000
MONGODB_URI=mongodb://localhost:27017/quiz
JWT_SECRET=your_jwt_secret_here
```

---

## API Endpoints Quick Reference

### Authentication

```
POST   /api/user/register
POST   /api/user/login
GET    /api/user/profile
```

### Quizzes (User)

```
GET    /api/quiz/all
GET    /api/quiz/:id
GET    /api/question/quiz/:quizId
```

### Results (User)

```
POST   /api/result/submit
GET    /api/result/user/:userId
GET    /api/result/user-stats/:userId
GET    /api/result/:resultId
```

---

## Key Features Implemented

✅ **User Registration & Login**

- Email validation
- Password hashing
- JWT authentication
- Auto-login after registration

✅ **Quiz Management**

- View all quizzes with filters
- Status tracking (available, upcoming, expired, completed)
- Quiz duration and marks display
- Passing marks visibility

✅ **Quiz Attempt**

- Multiple choice questions
- Countdown timer with auto-submit
- Question navigation
- Question summary grid
- Answer confirmation before submit

✅ **Results Display**

- Automatic scoring
- Percentage calculation
- Pass/Fail determination
- Detailed answer review
- Result filtering (all, passed, failed)

✅ **User Dashboard**

- Statistics overview
- Quick action buttons
- Navigation sidebar
- Usage instructions

✅ **Security**

- JWT token protection
- User data isolation
- Admin/User role separation
- Logout functionality

---

## Troubleshooting

### Port Already in Use

```bash
# Find and kill process on port 3000 or 4000
# On Windows: netstat -ano | findstr :3000
# On Mac/Linux: lsof -i :3000
```

### MongoDB Connection Error

- Ensure MongoDB is running
- Check connection string in `config/db.js`
- Verify database exists

### JWT Token Errors

- Token might be expired (7 days)
- Clear localStorage and login again
- Check if token is properly sent in headers

### Quiz Not Loading

- Ensure quiz exists in database
- Verify quiz date/time is correct
- Check quiz status (active vs inactive)

### Results Not Showing

- Verify result submission was successful
- Check userId matches in database
- Ensure result document was created

---

## File Changes Summary

### Frontend Files Created/Modified

- ✅ App.js - Added user routes and protection
- ✅ UserLogin.js + UserLogin.css - Authentication
- ✅ UserDashboard.js + Dashboard.css - Main dashboard
- ✅ QuizList.js + QuizList.css - Available quizzes
- ✅ QuizAttempt.js + QuizAttempt.css - Quiz attempt
- ✅ UserResults.js + UserResults.css - Results display
- ✅ api.js - User API functions

### Backend Files Modified

- ✅ server.js - Already configured
- ✅ routes/userRoutes.js - Added profile route
- ✅ routes/quizRoutes.js - Added user access
- ✅ routes/questionRoutes.js - Added user access
- ✅ routes/resultRoutes.js - Added user routes and stats
- ✅ controllers/userController.js - Added profile controller
- ✅ controllers/resultController.js - Added stats controller
- ✅ middleware/authMiddleware.js - Already present

---

## Next Steps

1. **Test all features** using the Quick Start Guide
2. **Review the comprehensive guide** in USER_FEATURES_GUIDE.md
3. **Customize styling** if needed (all CSS files provided)
4. **Add more features** from the Future Enhancements section
5. **Deploy to production** when ready

---

## Support & Documentation

- See `USER_FEATURES_GUIDE.md` for comprehensive documentation
- Check API endpoints in backend routes files
- Review component code for implementation details
- Component comments explain key functionality

---

## Feedback & Improvements

All features have been implemented with:

- ✅ Proper error handling
- ✅ Security best practices
- ✅ Responsive design
- ✅ Accessibility considerations
- ✅ Clean code architecture
- ✅ Comprehensive commenting

Feel free to extend and customize as needed!

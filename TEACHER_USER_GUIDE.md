# Teacher Management System - User Guide

## System Overview
This guide explains how the new Teacher Management System works in the Quiz Management application.

---

## For Administrators

### 1. Managing Teachers

#### Creating a New Teacher
1. Login to admin dashboard (`/admin/login`)
2. Click "Teachers" in the navigation menu
3. Click "+ Add New Teacher" button
4. Fill in the form:
   - **Teacher Name**: Full name of the teacher
   - **Email Address**: Unique email (used for login)
   - **Contact Number**: Phone number
   - **Password**: Set a secure password
5. Click "Create Teacher"
6. Teacher account is created and ready to use

#### Viewing Teachers
- All teachers are listed in a table with:
  - Name, Email, Contact Number
  - Account Status (Active/Inactive)
  - Creation Date
  - Action buttons

#### Deleting a Teacher
1. Find the teacher in the list
2. Click "Delete" button
3. Confirm the deletion
4. Teacher and all their course assignments are removed

### 2. Assigning Courses to Teachers

#### Step-by-Step Assignment Process
1. Click "Teachers" in navigation
2. Find the teacher you want to assign courses to
3. Click "View Profile" button
4. On the teacher profile page, click "🎯 Assign Courses" button
5. A modal dialog opens with two dropdowns:
   - **Select Batch**: Choose a batch (class)
   - **Select Course**: Automatically shows courses available in that batch
6. Click "Assign Course" to add this assignment
7. The course appears in the "Assigned Courses" section below

#### Bulk Management
- **Add Multiple Courses**: Repeat steps 5-6 for each course
- **Remove Courses**: Click the "✕" button on any course card to remove it
- **Different Batches**: Teachers can have multiple courses in different batches

#### Course Assignment Rules
- Same teacher can have multiple courses in the same batch
- Same teacher can have multiple courses in different batches
- Each course assignment is unique (no duplicates)
- All courses are pre-created by admin

---

## For Teachers

### 1. Teacher Login

#### Accessing the System
1. Go to teacher login page (`/teacher/login`)
   - Or click "Teacher Login" from admin/student login pages
2. Enter your credentials:
   - **Email**: The email set by administrator
   - **Password**: The password set by administrator
3. Click "Login"
4. You're redirected to your teacher dashboard

### 2. Teacher Dashboard

The dashboard shows:
- **Assigned Batches**: Cards showing all batches you have courses in
- **Statistics**: 
  - Number of assigned batches
  - Number of assigned courses
  - Number of quizzes you've created
  - Number of student results
- **Recent Quizzes**: Table of your 5 most recent quizzes
- **Action Buttons**: Links to create quizzes and view results

### 3. Creating Quizzes

#### Access Quiz Creation
1. Click "Create Quiz" in navigation or on dashboard
2. If no courses are assigned, you'll see a message
3. If you have assigned courses, the form appears

#### Quiz Creation Form

**Section 1: Basic Information**
- **Quiz Title** (required): Name of the quiz, e.g., "Chapter 5 Quiz"
- **Description**: Optional details about the quiz

**Section 2: Batch & Course**
- **Select Batch** (required): Choose from your assigned batches
  - Once selected, see all courses in that batch
  - All shown courses are already assigned to you
- **Assigned Courses**: Shows which courses are in the selected batch

**Section 3: Quiz Settings**
- **Duration** (required): Quiz time in minutes (5-300)
- **Total Marks** (required): Maximum points for the quiz
- **Passing Marks** (required): Minimum points to pass

**Section 4: Schedule**
- **Start Date & Time** (required): When students can start the quiz
- **Expiry Date & Time** (required): When the quiz closes
- Note: Start date must be before expiry date

#### Submitting the Quiz
1. Fill all required fields
2. Verify the dates are in correct order
3. Click "Create Quiz"
4. You're redirected to dashboard on success
5. Quiz appears in your "Recent Quizzes" list

### 4. Viewing Student Results

#### Access Results Page
1. Click "Results" in navigation
2. Or go to `/teacher/results` directly

#### Viewing Results Process
1. **Select Batch**: Choose from your assigned batches
2. **Select Quiz**: Shows only quizzes you created in that batch
3. **View Results**: Table appears with:
   - Student name and email
   - Marks obtained and total marks
   - Percentage score
   - Pass/Fail status
   - Submission date
   - "View Details" button for full result

#### Result Details
- Click "View Details" to see:
  - Individual question scores
  - Student's answers
  - Correct answers
  - Detailed feedback

### 5. Modifying Your Quizzes

#### Edit Quiz
1. Find the quiz in "Recent Quizzes" on dashboard
2. Click "Edit" button
3. Update any quiz details
4. Click "Update" to save changes

#### Delete Quiz
1. Edit the quiz (or find in list)
2. Click "Delete" button
3. Confirm deletion
4. All associated questions are also deleted

---

## For Students (No Changes)

The student experience remains the same:
1. Login with batch credentials
2. See quizzes for your batch
3. Attempt quizzes
4. View your results

Students now see quizzes created by:
- Admin (traditional quizzes)
- Assigned teachers (new teacher-created quizzes)

---

## Login Links Reference

### Main Entry Points
- **Admin Login**: `/admin/login`
- **Teacher Login**: `/teacher/login`
- **Student Login**: `/user/login`

### Cross-Links
All login pages now have links to other login types for easy navigation

---

## Important Rules & Restrictions

### What Teachers CANNOT Do
- Create new batches (classes)
- Create new courses (only admin creates these)
- Access quizzes from other teachers
- Modify student accounts
- Access batches/courses not assigned to them
- Create quizzes for unassigned courses

### What Teachers CAN Do
- Create unlimited quizzes for assigned courses
- Edit and delete own quizzes
- View results for own quizzes
- See only their assigned batches and courses
- View student answers and scores

### What Admins CAN Do
- Create and manage all teachers
- Assign courses to any teacher
- Create batches and courses
- Create quizzes (admin quizzes)
- View all system data
- Delete teachers and their assignments

---

## Troubleshooting

### Issue: Can't see courses to create quiz
**Solution**: Your admin hasn't assigned any courses yet. Contact your administrator.

### Issue: Forgot teacher password
**Solution**: Contact your administrator to create a new account with new credentials.

### Issue: Can't find a quiz I created
**Solution**: Check the correct batch - quizzes are organized by batch.

### Issue: Student results not showing
**Solution**: Wait for students to submit the quiz. Results appear after submission.

### Issue: Can't delete a teacher
**Solution**: The teacher might have important data. Ensure you confirm deletion.

---

## System Workflow Diagram

```
Admin Creates Batches → Admin Creates Courses/Quizzes
        ↓
    Admin Creates Teachers
        ↓
    Admin Assigns Courses to Teachers
        ↓
    Teachers Login & See Assigned Courses
        ↓
    Teachers Create Additional Quizzes
        ↓
    Students See All Available Quizzes (Admin + Teacher)
        ↓
    Students Attempt & Submit Quizzes
        ↓
    Teachers View Student Results for Their Quizzes
        ↓
    Admin Can View All Results in System
```

---

## Key Terminology

| Term | Definition |
|------|-----------|
| **Batch** | A class or group (e.g., "BS 1st Year") |
| **Course** | A subject or topic (stored as Quiz in database) |
| **Course Assignment** | Link between a teacher and course in a specific batch |
| **Teacher-Created Quiz** | A quiz created by an assigned teacher for their course |
| **Admin-Created Quiz** | Original quizzes created directly by admin |

---

## Support & Help

For technical issues or questions:
1. Check this guide for common solutions
2. Contact your system administrator
3. Check application logs for error messages
4. Verify all required fields are filled in forms

---

## Security Reminders

- **Never share your password** with anyone
- **Logout** when finished, especially on shared computers
- **Use strong passwords** when admins set them
- **Verify student email addresses** before releasing results
- **Don't modify** quiz settings after students have started

---

Last Updated: January 26, 2026
System Version: 1.0

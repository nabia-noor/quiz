import mongoose from "mongoose";
import Admin from "./models/adminModel.js";
import Class from "./models/classModel.js";
import Quiz from "./models/quizModel.js";
import Question from "./models/questionModel.js";

// Connect to MongoDB
const connectDB = async () => {
  await mongoose.connect(
    "mongodb+srv://quiz:helloworld123@cluster0.gnw23kh.mongodb.net/Quiz"
  );
  console.log("DB CONNECTED");
};

// Create sample data
const createSampleData = async () => {
  try {
    await connectDB();

    // Get admin
    const admin = await Admin.findOne({ email: "admin@example.com" });
    if (!admin) {
      console.log("Admin not found!");
      process.exit(1);
    }

    // Create or get class
    let classRecord = await Class.findOne({ name: "CS-101" });
    if (!classRecord) {
      classRecord = new Class({
        name: "CS-101",
        semester: "Fall 2024",
        description: "Introduction to Computer Science",
        isActive: true,
      });
      await classRecord.save();
      console.log("✓ Class created: CS-101");
    }

    // Quiz 1
    let quiz1 = await Quiz.findOne({ title: "Programming Basics Quiz" });
    if (!quiz1) {
      quiz1 = new Quiz({
        title: "Programming Basics Quiz",
        description: "Test your knowledge of programming fundamentals",
        classId: classRecord._id,
        duration: 30,
        totalMarks: 100,
        passingMarks: 40,
        startDate: new Date(),
        expiryDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
        isActive: true,
        createdBy: admin._id,
      });
      await quiz1.save();
      console.log("✓ Quiz 1 created: Programming Basics Quiz");

      // Questions for Quiz 1
      const questions1 = [
        {
          quizId: quiz1._id,
          questionText: "What is a variable in programming?",
          options: [
            { optionText: "A container to store data", isCorrect: true },
            { optionText: "A type of loop", isCorrect: false },
            { optionText: "A function declaration", isCorrect: false },
            { optionText: "A mathematical constant", isCorrect: false },
          ],
          marks: 10,
          order: 1,
        },
        {
          quizId: quiz1._id,
          questionText: "Which of the following is a loop statement?",
          options: [
            { optionText: "if-else", isCorrect: false },
            { optionText: "for", isCorrect: true },
            { optionText: "switch", isCorrect: false },
            { optionText: "case", isCorrect: false },
          ],
          marks: 10,
          order: 2,
        },
        {
          quizId: quiz1._id,
          questionText: "What is the purpose of a function?",
          options: [
            { optionText: "To create variables", isCorrect: false },
            {
              optionText: "To reuse code and organize logic",
              isCorrect: true,
            },
            { optionText: "To store data", isCorrect: false },
            { optionText: "To define classes", isCorrect: false },
          ],
          marks: 10,
          order: 3,
        },
        {
          quizId: quiz1._id,
          questionText: "Which is NOT a data type?",
          options: [
            { optionText: "String", isCorrect: false },
            { optionText: "Integer", isCorrect: false },
            { optionText: "Flavour", isCorrect: true },
            { optionText: "Boolean", isCorrect: false },
          ],
          marks: 10,
          order: 4,
        },
        {
          quizId: quiz1._id,
          questionText: "What does OOP stand for?",
          options: [
            { optionText: "Object-Oriented Programming", isCorrect: true },
            { optionText: "Open Operating Protocol", isCorrect: false },
            { optionText: "Output Oriented Process", isCorrect: false },
            { optionText: "Operation Optimization Procedure", isCorrect: false },
          ],
          marks: 10,
          order: 5,
        },
        {
          quizId: quiz1._id,
          questionText: "What is an array?",
          options: [
            { optionText: "A single value", isCorrect: false },
            { optionText: "A collection of elements", isCorrect: true },
            { optionText: "A conditional statement", isCorrect: false },
            { optionText: "A type of loop", isCorrect: false },
          ],
          marks: 10,
          order: 6,
        },
        {
          quizId: quiz1._id,
          questionText: "What is the correct syntax to print in Python?",
          options: [
            { optionText: "echo()", isCorrect: false },
            { optionText: "printf()", isCorrect: false },
            { optionText: "print()", isCorrect: true },
            { optionText: "output()", isCorrect: false },
          ],
          marks: 10,
          order: 7,
        },
        {
          quizId: quiz1._id,
          questionText: "Which operator is used for exponentiation?",
          options: [
            { optionText: "^", isCorrect: false },
            { optionText: "**", isCorrect: true },
            { optionText: "^^", isCorrect: false },
            { optionText: "**^", isCorrect: false },
          ],
          marks: 10,
          order: 8,
        },
        {
          quizId: quiz1._id,
          questionText: "What is a class?",
          options: [
            { optionText: "A blueprint for objects", isCorrect: true },
            { optionText: "A type of variable", isCorrect: false },
            { optionText: "A loop statement", isCorrect: false },
            { optionText: "A function call", isCorrect: false },
          ],
          marks: 10,
          order: 9,
        },
        {
          quizId: quiz1._id,
          questionText: "What is debugging?",
          options: [
            { optionText: "Writing more code", isCorrect: false },
            {
              optionText: "Finding and fixing errors in code",
              isCorrect: true,
            },
            { optionText: "Running the program", isCorrect: false },
            { optionText: "Compiling the code", isCorrect: false },
          ],
          marks: 10,
          order: 10,
        },
      ];

      await Question.insertMany(questions1);
      console.log("✓ 10 questions added to Quiz 1");
    }

    // Quiz 2
    let quiz2 = await Quiz.findOne({ title: "Web Development Fundamentals" });
    if (!quiz2) {
      quiz2 = new Quiz({
        title: "Web Development Fundamentals",
        description: "Test your HTML, CSS, and JavaScript knowledge",
        classId: classRecord._id,
        duration: 45,
        totalMarks: 100,
        passingMarks: 50,
        startDate: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000),
        expiryDate: new Date(Date.now() + 35 * 24 * 60 * 60 * 1000),
        isActive: true,
        createdBy: admin._id,
      });
      await quiz2.save();
      console.log("✓ Quiz 2 created: Web Development Fundamentals");

      // Questions for Quiz 2
      const questions2 = [
        {
          quizId: quiz2._id,
          questionText: "What does HTML stand for?",
          options: [
            {
              optionText: "HyperText Markup Language",
              isCorrect: true,
            },
            { optionText: "High Tech Markup Language", isCorrect: false },
            { optionText: "Home Tool Markup Language", isCorrect: false },
            { optionText: "Hyperlinks and Text Markup Language", isCorrect: false },
          ],
          marks: 10,
          order: 1,
        },
        {
          quizId: quiz2._id,
          questionText: "What does CSS stand for?",
          options: [
            { optionText: "Cascading Style Sheets", isCorrect: true },
            { optionText: "Computer Style Sheets", isCorrect: false },
            { optionText: "Colorful Style System", isCorrect: false },
            { optionText: "Creative Styling Solution", isCorrect: false },
          ],
          marks: 10,
          order: 2,
        },
        {
          quizId: quiz2._id,
          questionText:
            "Which tag is used for the main heading in HTML?",
          options: [
            { optionText: "<h1>", isCorrect: true },
            { optionText: "<heading>", isCorrect: false },
            { optionText: "<head>", isCorrect: false },
            { optionText: "<header>", isCorrect: false },
          ],
          marks: 10,
          order: 3,
        },
        {
          quizId: quiz2._id,
          questionText: "Which property is used to change text color in CSS?",
          options: [
            { optionText: "font-color", isCorrect: false },
            { optionText: "text-color", isCorrect: false },
            { optionText: "color", isCorrect: true },
            { optionText: "text-style", isCorrect: false },
          ],
          marks: 10,
          order: 4,
        },
        {
          quizId: quiz2._id,
          questionText: "What is JavaScript primarily used for?",
          options: [
            { optionText: "Database management", isCorrect: false },
            { optionText: "Making web pages interactive", isCorrect: true },
            { optionText: "Server-side operations only", isCorrect: false },
            { optionText: "Creating styles", isCorrect: false },
          ],
          marks: 10,
          order: 5,
        },
        {
          quizId: quiz2._id,
          questionText: "Which tag creates a clickable link in HTML?",
          options: [
            { optionText: "<link>", isCorrect: false },
            { optionText: "<url>", isCorrect: false },
            { optionText: "<a>", isCorrect: true },
            { optionText: "<click>", isCorrect: false },
          ],
          marks: 10,
          order: 6,
        },
        {
          quizId: quiz2._id,
          questionText: "What is the correct way to include an external CSS file?",
          options: [
            {
              optionText:
                '<link rel="stylesheet" href="style.css">',
              isCorrect: true,
            },
            { optionText: "<css src='style.css'>", isCorrect: false },
            { optionText: "<import style.css>", isCorrect: false },
            { optionText: "<style href='style.css'>", isCorrect: false },
          ],
          marks: 10,
          order: 7,
        },
        {
          quizId: quiz2._id,
          questionText: "What does the <div> tag represent?",
          options: [
            { optionText: "Division/container", isCorrect: true },
            { optionText: "Data input vector", isCorrect: false },
            { optionText: "Dynamic variable", isCorrect: false },
            { optionText: "Display vector", isCorrect: false },
          ],
          marks: 10,
          order: 8,
        },
        {
          quizId: quiz2._id,
          questionText:
            "Which is the correct way to declare a variable in JavaScript?",
          options: [
            { optionText: "var name;", isCorrect: true },
            { optionText: "declare name;", isCorrect: false },
            { optionText: "name: String;", isCorrect: false },
            { optionText: "set name;", isCorrect: false },
          ],
          marks: 10,
          order: 9,
        },
        {
          quizId: quiz2._id,
          questionText: "What is a responsive design?",
          options: [
            { optionText: "Design that responds to clicks", isCorrect: false },
            {
              optionText: "Design that adapts to different screen sizes",
              isCorrect: true,
            },
            { optionText: "Design with animations", isCorrect: false },
            { optionText: "Design with buttons", isCorrect: false },
          ],
          marks: 10,
          order: 10,
        },
      ];

      await Question.insertMany(questions2);
      console.log("✓ 10 questions added to Quiz 2");
    }

    console.log("\n================================");
    console.log("✓ Sample data created successfully!");
    console.log("================================");
    console.log("Quiz 1: Programming Basics Quiz - 10 questions");
    console.log("Quiz 2: Web Development Fundamentals - 10 questions");

    process.exit(0);
  } catch (error) {
    console.error("Error:", error.message);
    process.exit(1);
  }
};

createSampleData();

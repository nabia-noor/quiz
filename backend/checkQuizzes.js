/**
 * Script to check quiz details for debugging
 * Run with: node checkQuizzes.js
 */

import mongoose from "mongoose";
import Quiz from "./models/quizModel.js";

const connectDB = async () => {
  try {
    await mongoose.connect(
      "mongodb+srv://quiz:helloworld123@cluster0.gnw23kh.mongodb.net/Quiz",
    );
    console.log("✓ MongoDB connected\n");
  } catch (error) {
    console.error("MongoDB connection error:", error);
    process.exit(1);
  }
};

const checkQuizzes = async () => {
  try {
    await connectDB();

    const quizzes = await Quiz.find({}).populate("classId");
    const now = new Date();

    console.log(`Current Time: ${now}\n`);
    console.log(`Found ${quizzes.length} quiz(zes):\n`);

    for (const quiz of quizzes) {
      const startDate = new Date(quiz.startDate);
      const expiryDate = new Date(quiz.expiryDate);

      const isStarted = now >= startDate;
      const isExpired = now > expiryDate;
      const isAvailable = quiz.isActive && isStarted && !isExpired;

      console.log("─".repeat(60));
      console.log(`Quiz: ${quiz.title}`);
      console.log(`Class: ${quiz.classId?.name} - ${quiz.classId?.semester}`);
      console.log(`Is Active: ${quiz.isActive}`);
      console.log(`Start Date: ${startDate}`);
      console.log(`Expiry Date: ${expiryDate}`);
      console.log(`\nStatus:`);
      console.log(`  ✓ Has started: ${isStarted}`);
      console.log(`  ✓ Not expired: ${!isExpired}`);
      console.log(
        `  ✓ Available for submission: ${isAvailable ? "YES" : "NO"}`,
      );

      if (!isAvailable) {
        console.log(`\nReasons not available:`);
        if (!quiz.isActive) console.log("  - Quiz is not active");
        if (!isStarted) console.log("  - Quiz has not started yet");
        if (isExpired) console.log("  - Quiz has expired");
      }
      console.log("");
    }

    console.log("─".repeat(60));
    process.exit(0);
  } catch (error) {
    console.error("Error:", error);
    process.exit(1);
  }
};

checkQuizzes();

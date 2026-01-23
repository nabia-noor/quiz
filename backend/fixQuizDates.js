/**
 * Utility script to fix quiz dates for testing
 * Run with: node fixQuizDates.js
 * This will update all quizzes to have valid dates and set them as active
 */

import mongoose from "mongoose";
import Quiz from "./models/quizModel.js";

// MongoDB connection
const connectDB = async () => {
  try {
    await mongoose.connect(
      "mongodb+srv://quiz:helloworld123@cluster0.gnw23kh.mongodb.net/Quiz",
    );
    console.log("✓ MongoDB connected");
  } catch (error) {
    console.error("MongoDB connection error:", error);
    process.exit(1);
  }
};

const fixQuizDates = async () => {
  try {
    await connectDB();

    // Get all quizzes
    const quizzes = await Quiz.find({});
    console.log(`Found ${quizzes.length} quizzes\n`);

    if (quizzes.length === 0) {
      console.log("No quizzes to fix!");
      process.exit(0);
    }

    // Set dates: start Jan 22, 2026, expire Jan 24, 2026
    const startDate = new Date("2026-01-22");
    startDate.setHours(0, 0, 0, 0); // Start of Jan 22

    const expiryDate = new Date("2026-01-24");
    expiryDate.setHours(23, 59, 59, 999); // End of Jan 24

    for (const quiz of quizzes) {
      console.log(`Quiz: ${quiz.title}`);
      console.log(
        `  Current: Active=${quiz.isActive}, Start=${quiz.startDate}, Expire=${quiz.expiryDate}`,
      );

      quiz.isActive = true;
      quiz.startDate = startDate;
      quiz.expiryDate = expiryDate;
      await quiz.save();

      console.log(
        `  Updated: Active=true, Start=${startDate}, Expire=${expiryDate}\n`,
      );
    }

    console.log("✓ All quizzes updated successfully!");
    console.log(`Start Date: ${startDate}`);
    console.log(`Expiry Date: ${expiryDate}`);

    process.exit(0);
  } catch (error) {
    console.error("Error:", error);
    process.exit(1);
  }
};

fixQuizDates();

import mongoose from "mongoose";
import Class from "./models/classModel.js";

// Connect to MongoDB
const connectDB = async () => {
  await mongoose.connect(
    "mongodb+srv://quiz:helloworld123@cluster0.gnw23kh.mongodb.net/Quiz"
  );
  console.log("DB CONNECTED");
};

// Check all classes
const checkClasses = async () => {
  try {
    await connectDB();

    const allClasses = await Class.find();
    console.log("\n📋 All Classes in Database:");
    console.log("================================");
    allClasses.forEach((cls) => {
      console.log(`Name: ${cls.name}, Semester: ${cls.semester}, Active: ${cls.isActive}`);
    });

    const batchClasses = await Class.find({ 
      name: { $in: ["BS", "MS", "PhD"] },
      isActive: true 
    });
    
    console.log("\n✅ Available Batches (BS, MS, PhD):");
    console.log("================================");
    if (batchClasses.length === 0) {
      console.log("⚠️  No batch classes found!");
    } else {
      batchClasses.forEach((cls) => {
        console.log(`✓ ${cls.name} - ${cls.semester}`);
      });
    }

    process.exit(0);
  } catch (error) {
    console.error("Error:", error.message);
    process.exit(1);
  }
};

checkClasses();

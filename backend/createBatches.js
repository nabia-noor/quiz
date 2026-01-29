import mongoose from "mongoose";
import Class from "./models/classModel.js";

// Connect to MongoDB
const connectDB = async () => {
  await mongoose.connect(
    "mongodb+srv://quiz:helloworld123@cluster0.gnw23kh.mongodb.net/Quiz"
  );
  console.log("DB CONNECTED");
};

// Create batches
const createBatches = async () => {
  try {
    await connectDB();

    const batches = [
      { name: "BS", semester: "All", description: "Bachelor of Science" },
      { name: "MS", semester: "All", description: "Master of Science" },
      { name: "PhD", semester: "All", description: "Doctor of Philosophy" },
    ];

    for (const batch of batches) {
      const exists = await Class.findOne({ name: batch.name });
      if (!exists) {
        const newClass = new Class({
          name: batch.name,
          semester: batch.semester,
          description: batch.description,
          isActive: true,
        });
        await newClass.save();
        console.log(`✓ Batch created: ${batch.name}`);
      } else {
        console.log(`✓ Batch already exists: ${batch.name}`);
      }
    }

    console.log("\n✓ All batches are ready!");
    process.exit(0);
  } catch (error) {
    console.error("Error:", error.message);
    process.exit(1);
  }
};

createBatches();

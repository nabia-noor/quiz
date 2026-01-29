import mongoose from "mongoose";
import Class from "./models/classModel.js";

// Connect to MongoDB
const connectDB = async () => {
  await mongoose.connect(
    "mongodb+srv://quiz:helloworld123@cluster0.gnw23kh.mongodb.net/Quiz"
  );
  console.log("DB CONNECTED");
};

// Activate BS, MS, PhD batches
const activateBatches = async () => {
  try {
    await connectDB();

    // Deactivate all other classes except BS, MS, PhD
    await Class.updateMany(
      { name: { $nin: ["BS", "MS", "PhD"] } },
      { isActive: false }
    );

    // Activate BS, MS, PhD batches
    const result = await Class.updateMany(
      { name: { $in: ["BS", "MS", "PhD"] } },
      { isActive: true }
    );

    console.log(`✓ Updated ${result.modifiedCount} batch records`);

    // Show the result
    const batches = await Class.find({ 
      name: { $in: ["BS", "MS", "PhD"] }
    });

    console.log("\n✅ Active Batches:");
    console.log("================================");
    batches.forEach((batch) => {
      console.log(`✓ ${batch.name} - ${batch.semester} - Active: ${batch.isActive}`);
    });

    process.exit(0);
  } catch (error) {
    console.error("Error:", error.message);
    process.exit(1);
  }
};

activateBatches();

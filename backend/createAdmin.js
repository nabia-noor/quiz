import mongoose from "mongoose";
import bcrypt from "bcryptjs";
import Admin from "./models/adminModel.js";

// Connect to MongoDB
const connectDB = async () => {
  await mongoose.connect(
    "mongodb+srv://quiz:helloworld123@cluster0.gnw23kh.mongodb.net/Quiz"
  );
  console.log("DB CONNECTED");
};

// Create first admin
const createAdmin = async () => {
  try {
    await connectDB();

    // NEW ADMIN CREDENTIALS - Change these as needed
    const newAdminEmail = "admin@example.com";
    const newAdminPassword = "password123";
    const newAdminName = "Quiz Admin";

    // Check if admin already exists
    const existingAdmin = await Admin.findOne({ email: newAdminEmail });

    if (existingAdmin) {
      console.log("Admin already exists with this email!");
      console.log("Email:", newAdminEmail);
      console.log(
        "\nTry changing the email in createAdmin.js or use existing credentials"
      );
      process.exit(0);
    }

    // Create new admin
    const hashedPassword = await bcrypt.hash(newAdminPassword, 10);

    const admin = new Admin({
      name: newAdminName,
      email: newAdminEmail,
      password: hashedPassword,
      role: "superadmin",
    });

    await admin.save();

    console.log("✓ Admin created successfully!");
    console.log("================================");
    console.log("Email:", newAdminEmail);
    console.log("Password:", newAdminPassword);
    console.log("================================");
    console.log("Please login with these credentials!");

    process.exit(0);
  } catch (error) {
    console.error("Error creating admin:", error);
    process.exit(1);
  }
};

createAdmin();

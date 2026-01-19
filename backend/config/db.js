import mongoose from "mongoose";

export const connectDB = async () => {
  await mongoose
    .connect(
      "mongodb+srv://quiz:helloworld123@cluster0.gnw23kh.mongodb.net/Quiz"
    )
    .then(() => {
      console.log("DB CONNECTED");
    });
};

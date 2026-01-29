import express from "express";
import cors from "cors";
import "dotenv/config";
import { connectDB } from "./config/db.js";
import userRouter from "./routes/userRoutes.js";
import adminRouter from "./routes/adminRoutes.js";
import classRouter from "./routes/classRoutes.js";
import quizRouter from "./routes/quizRoutes.js";
import questionRouter from "./routes/questionRoutes.js";
import resultRouter from "./routes/resultRoutes.js";
import teacherRouter from "./routes/teacherRoutes.js";
import subjectRouter from "./routes/subjectRoutes.js";

const app = express();
const port = 4000;

//Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

//DB
connectDB();

// Routes
app.get("/", (req, res) => {
  res.send("API is running...");
});

app.use("/api/user", userRouter);
app.use("/api/admin", adminRouter);
app.use("/api/class", classRouter);
app.use("/api/quiz", quizRouter);
app.use("/api/question", questionRouter);
app.use("/api/result", resultRouter);
app.use("/api/teacher", teacherRouter);
app.use("/api/subject", subjectRouter);

app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});

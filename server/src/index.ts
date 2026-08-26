import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import hintRoute from "./routes/hint.route.js";
import dashboardRoute from "./routes/dashboard.route.js";
import mentorRoute from "./routes/mentor.route.js";
import dryrunRoute from "./routes/dryrun.route.js";
import reviewQueueRoute from "./routes/reviewQueue.route.js";
import interviewRoute from "./routes/interview.route.js";
import { clerkMiddleware } from '@clerk/express';
import { connectDB } from './config/db.js';

import { initSocketServer } from "./socket.js";

dotenv.config();
connectDB();

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());    
app.use(express.json());
app.use(clerkMiddleware());

app.use("/hint", hintRoute);
app.use("/api/dashboard", dashboardRoute);
app.use("/api/mentor", mentorRoute);
app.use("/dryrun-visual", dryrunRoute);
app.use("/api/review-queue", reviewQueueRoute);
app.use("/interview", interviewRoute);

app.get("/api/protected", (req, res) => {
    res.json({ message: "You are authenticated!" });
});

app.get("/", (req, res) => {
    res.send("Hello from the server!");
});

const server = app.listen(PORT, () => {
    console.log("Server is running on port", PORT);
});

initSocketServer(server);
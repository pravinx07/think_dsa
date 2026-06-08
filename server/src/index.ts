import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import hintRoute from "./routes/hint.route.js";
import dashboardRoute from "./routes/dashboard.route.js";
import mentorRoute from "./routes/mentor.route.js";
import { clerkMiddleware } from '@clerk/express';
import { connectDB } from './config/db.js';

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

app.get("/api/protected", (req, res) => {
    res.json({ message: "You are authenticated!" });
});

app.get("/", (req, res) => {
    res.send("Hello from the server!");
});

app.listen(PORT, () => {
    console.log("Server is running on port", PORT);
})
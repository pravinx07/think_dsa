import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import hintRoute from "./routes/hint.route.js";
import { clerkMiddleware, requireAuth } from '@clerk/express';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());    
app.use(express.json());
app.use(clerkMiddleware());

app.use("/hint", hintRoute);

app.get("/api/protected", requireAuth(), (req, res) => {
    res.json({ message: "You are authenticated!", userId: req.auth.userId });
});

app.get("/", (req, res) => {
    res.send("Hello from the server!");
});

app.listen(PORT, () => {
    console.log("Server is running on port", PORT);
})
import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import hintRoute from "./routes/hint.route.js";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());    
app.use(express.json());

app.use("/hint", hintRoute);

app.get("/", (req, res) => {
    res.send("Hello from the server!");
});

app.listen(PORT, () => {
    console.log("Server is running on port", PORT);
})
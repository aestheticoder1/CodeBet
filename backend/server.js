import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import connectDB from './config/database.js';
import authRoutes from './routes/auth.js';

const app = express();
dotenv.config();
connectDB(); 
app.use(express.json());

app.use(cors());
app.use(express.json());

app.get("/", (req, res) => {
    res.send("CodeBet API is live 🔥");
});

app.use("/api/auth", authRoutes);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));

import express from "express";
import http from "http";
import { Server } from "socket.io";
import cors from "cors";
import dotenv from "dotenv";
import connectDB from "./config/database.js";
import challengeRoutes from "./routes/challenge.js";
import authRoutes from "./routes/auth.js";
import { initSocket } from "./socket.js";

dotenv.config();
connectDB();

const app = express();
const server = http.createServer(app);

// ✅ CORS Setup (allow frontend domain)
app.use(cors({
  origin: 'https://codebet.vercel.app', // <-- allow only your frontend
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}));

app.use(express.json());

// ✅ API Routes
app.use("/api/auth", authRoutes);
app.use("/api/challenge", challengeRoutes);

// ✅ Initialize Socket.IO
initSocket(server);

// ✅ Start server
const PORT = process.env.PORT || 5000;
server.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));

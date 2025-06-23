import express from "express";
import http from "http";
import { Server } from "socket.io";
import cors from "cors";
import dotenv from "dotenv";
import connectDB from "./config/database.js";
import challengeRoutes from "./routes/challenge.js";
import authRoutes from "./routes/auth.js";

dotenv.config();
connectDB();

const app = express();
const server = http.createServer(app);

// Socket.IO setup
export const io = new Server(server, {
    cors: {
        origin: "*", // for testing only — restrict in production
        methods: ["GET", "POST"],
    },
});

app.use(cors());
app.use(express.json());

app.use("/api/auth", authRoutes);
app.use("/api/challenge", challengeRoutes);

// Socket.IO logic
io.on("connection", (socket) => {
    console.log("User connected:", socket.id);

    // Join room
    socket.on("joinRoom", ({ challengeId, userId }) => {
        socket.join(challengeId);
        console.log(`User ${userId} joined room ${challengeId}`);
    });

    // Start contest (triggered from backend when receiver accepts)
    socket.on("startContest", ({ challengeId, challengeData }) => {
        io.to(challengeId).emit("start-contest", challengeData);
    });

    // Submit result
    socket.on("submitResult", ({ challengeId, winnerId }) => {
        io.to(challengeId).emit("contest-ended", { winnerId });
    });

    socket.on("disconnect", () => {
        console.log("User disconnected:", socket.id);
    });
});

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => console.log(`Server running on port ${PORT}`));

import express from "express";
import http from "http";
import { Server } from "socket.io";
import cors from "cors";
import dotenv from "dotenv";
import connectDB from "./config/database.js";
import challengeRoutes from "./routes/challenge.js";
import authRoutes from "./routes/auth.js";
import Challenge from "./models/Challenge.js";
import { send } from "process";
import { initSocket } from "./socket.js"; // path as needed



dotenv.config();
connectDB();

const app = express();
const server = http.createServer(app);
initSocket(server);

// ✅ Socket.IO setup
// export const io = new Server(server, {
//     cors: {
//         origin: "*", // For development only; restrict in production
//         methods: ["GET", "POST"],
//     },
// });

app.use(cors());
app.use(express.json());

// ✅ Routes
app.use("/api/auth", authRoutes);
app.use("/api/challenge", challengeRoutes);

// ✅ Socket.IO logic
// io.on("connection", (socket) => {
//     console.log("🔌 User connected:", socket.id);

//     // ✅ Join a challenge room
//     socket.on("joinRoom", ({ challengeId, userId }) => {
//         socket.join(challengeId);
//         console.log(`📥 User ${userId} joined room ${challengeId}`);
//     });

//     // ✅ Trigger contest start (from backend emit)
//     socket.on("startContest", ({ challengeId, challengeData }) => {
//         console.log(`🚀 Received startContest for ${challengeId}, delaying emit...`);

//         // ⏳ Delay emit to ensure both users have joined
//         setTimeout(() => {
//             io.to(challengeId).emit("start-contest", challengeData);
//             console.log(`🎯 Emitted start-contest to room ${challengeId}`);
//         }, 500); // delay in milliseconds
//     });

//     // ✅ Handle contest result submission
//     socket.on("submitResult", ({ challengeId, winnerId }) => {
//         io.to(challengeId).emit("contest-ended", { winnerId });
//         console.log(`🏁 Contest ended in ${challengeId}, winner: ${winnerId}`);
//     });

//     socket.on("disconnect", () => {
//         console.log("❌ User disconnected:", socket.id);
//     });
// });
// Track challenges awaiting confirmation
// const pendingChallenges = {};

// io.on("connection", (socket) => {
//     console.log("🔌 User connected:", socket.id);

//     // ✅ Join challenge room
//     socket.on("joinChallenge", ({ challengeId, userId }) => {
//         socket.join(challengeId);
//         console.log(`📥 User ${userId} joined room ${challengeId}`);
//     });

//     // ✅ Start contest when backend emits it explicitly
//     socket.on("startContest", ({ challengeId, challengeData }) => {
//         console.log(`🚀 Starting contest for ${challengeId}`);
//         io.to(challengeId).emit("startContest", challengeData);
//     });

//     // ✅ Receive winner and notify both participants
//     socket.on("submitResult", ({ challengeId, winnerId }) => {
//         io.to(challengeId).emit("contest-ended", { winnerId });
//         console.log(`🏁 Contest ended for ${challengeId}, winner: ${winnerId}`);
//     });

//     socket.on("disconnect", () => {
//         console.log("❌ User disconnected:", socket.id);
//     });
// });



// ✅ Start server
const PORT = process.env.PORT || 5000;
server.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));

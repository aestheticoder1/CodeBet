import express from "express";
import http from "http";
import { Server } from "socket.io";
import cors from "cors";
import dotenv from "dotenv";
import connectDB from "./config/database.js";
import challengeRoutes from "./routes/challenge.js";
import authRoutes from "./routes/auth.js";
import Challenge from "./models/Challenge.js";

dotenv.config();
connectDB();

const app = express();
const server = http.createServer(app);

// ✅ Socket.IO setup
export const io = new Server(server, {
    cors: {
        origin: "*", // For development only; restrict in production
        methods: ["GET", "POST"],
    },
});

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
const pendingChallenges = {};

io.on("connection", (socket) => {
    console.log("🔌 User connected:", socket.id);

    socket.on("joinChallenge", async ({ challengeId, userId }) => {
        try {
            // Join socket room
            socket.join(challengeId);

            // Initialize challenge tracking if needed
            if (!pendingChallenges[challengeId]) {
                pendingChallenges[challengeId] = {
                    users: new Set(),
                    isStarted: false
                };
            }

            pendingChallenges[challengeId].users.add(userId);

            console.log(`📥 User ${userId} joined challenge ${challengeId}`);

            // When both users are present, notify them
            if (pendingChallenges[challengeId].users.size === 2 &&
                !pendingChallenges[challengeId].isStarted) {

                pendingChallenges[challengeId].isStarted = true;
                const challenge = await Challenge.findById(challengeId);
                if (!challenge) return;

                // console.log(challenge)
                challenge.status = "ongoing";
                challenge.problem = {
                    name: "Problem XYZ",
                    url: "https://codeforces.com/problemset/problem/1234/A",
                };
                await challenge.save();

                io.to(challengeId).emit("startContest", {
                    challengeId,
                    timestamp: Date.now(),
                    timeLimit: challenge.timeLimit,
                    problem: challenge.problem
                });

                console.log(`🚀 Starting contest for ${challengeId}`);
            }
        } catch (err) {
            console.error("Join challenge error:", err);
        }
    });

    socket.on("disconnect", () => {
        console.log("❌ User disconnected:", socket.id);
    });
});


// ✅ Start server
const PORT = process.env.PORT || 5000;
server.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));

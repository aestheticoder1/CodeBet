// socket.js
let ioInstance;

export const initSocket = async (server) => {
    const { Server } = await import("socket.io");
    ioInstance = new Server(server, {
        cors: {
            origin: "*",
            methods: ["GET", "POST"]
        }
    });

    ioInstance.on("connection", (socket) => {
        console.log("🔌 User connected:", socket.id);

        socket.on("joinChallenge", ({ challengeId, userId }) => {
            socket.join(challengeId);
            // console.log(`📥 User ${userId} joined room ${challengeId}`);
        });

        socket.on("registerUser", (userId) => {
            socket.join(userId); // user joins their personal room
            // console.log(`✅ User ${userId} joined their personal room`);
        });

        socket.on("submitResult", ({ challengeId, winnerId, isDraw }) => {
            ioInstance.to(challengeId).emit("contestEnded", { winnerId, isDraw });
            // console.log(`🏁 Contest ended for ${challengeId}, winner: ${winnerId}, draw: ${isDraw}`);
        });


        socket.on("disconnect", () => {
            console.log("❌ User disconnected:", socket.id);
        });
    });
};

export const getIO = () => {
    if (!ioInstance) throw new Error("Socket.io not initialized");
    return ioInstance;
};

import express from 'express';
import Challenge from '../models/Challenge.js';
import User from '../models/User.js';
import { verifyToken } from "../middleware/userAuth.js";
import { io } from "../server.js";

const router = express.Router();

// ✅ POST /api/challenges/send — Send a challenge
router.post('/send', verifyToken, async (req, res) => {
    const { receiverUsername, rating, tag, timeLimit } = req.body;

    try {
        const receiver = await User.findOne({ username: receiverUsername });
        if (!receiver) return res.status(404).json({ error: "Receiver not found" });

        const newChallenge = new Challenge({
            sender: req.user._id,
            receiver: receiver._id,
            rating,
            tag,
            timeLimit,
            status: 'pending',
        });

        await newChallenge.save();

        // io.to(req.user._id.toString()).emit("challenge-sent", {
        //     challengeId: newChallenge._id,
        // });

        res.status(201).json({ message: "Challenge sent", challenge: newChallenge });
    } catch (err) {
        res.status(500).json({ error: "Failed to send challenge" });
    }
});


// ✅ GET /api/challenges/received — Pending challenges *sent to* user
router.get('/received', verifyToken, async (req, res) => {
    try {
        const challenges = await Challenge.find({
            receiver: req.user._id,
            status: 'pending',
        })
            .populate('sender', 'username profilePic')
            .sort({ createdAt: -1 });

        res.status(200).json(challenges);
    } catch (err) {
        res.status(500).json({ error: "Failed to fetch received challenges" });
    }
});


// ✅ GET /api/challenges/my — All challenges involving logged-in user
router.get('/my', verifyToken, async (req, res) => {
    try {
        const challenges = await Challenge.find({
            $or: [
                { sender: req.user._id },
                { receiver: req.user._id },
            ],
        })
            .populate('sender', 'username profilePic')
            .populate('receiver', 'username profilePic')
            .sort({ createdAt: -1 });

        res.status(200).json(challenges);
    } catch (err) {
        res.status(500).json({ error: "Failed to fetch your challenges" });
    }
});


// ✅ POST /api/challenges/:id/accept — Accept a challenge
router.post('/:id/accept', verifyToken, async (req, res) => {
    try {
        const challenge = await Challenge.findById(req.params.id)
            .populate("sender", "username profilePic")
            .populate("receiver", "username profilePic");

        if (!challenge || challenge.receiver._id.toString() !== req.user._id.toString()) {
            return res.status(403).json({ error: "Unauthorized or challenge not found" });
        }

        challenge.status = "ongoing";
        challenge.problem = {
            name: "Problem XYZ",
            url: "https://codeforces.com/problemset/problem/1234/A",
        };
        await challenge.save();

        // Notify both users via socket
        io.to(challenge._id.toString()).emit("start-contest", {
            challengeId: challenge._id,
            problem: challenge.problem,
            timeLimit: challenge.timeLimit,
            sender: challenge.sender,
            receiver: challenge.receiver,
        });

        res.status(200).json({ message: "Challenge accepted", challenge });
    } catch (err) {
        res.status(500).json({ error: "Failed to accept challenge" });
    }
});


// ✅ POST /api/challenges/:id/reject — Reject a challenge
router.post('/:id/reject', verifyToken, async (req, res) => {
    try {
        const challenge = await Challenge.findById(req.params.id);

        if (!challenge || challenge.receiver.toString() !== req.user._id.toString()) {
            return res.status(403).json({ error: "Unauthorized or challenge not found" });
        }

        challenge.status = 'rejected';
        await challenge.save();

        res.status(200).json({ message: "Challenge rejected" });
    } catch (err) {
        res.status(500).json({ error: "Failed to reject challenge" });
    }
});

export default router;

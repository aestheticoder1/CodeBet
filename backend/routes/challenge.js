import express from 'express';
import Challenge from '../models/Challenge.js';
import User from '../models/User.js';
import { verifyToken } from "../middleware/userAuth.js";
// import { io } from "../server.js";

const router = express.Router();

// ✅ POST /api/challenges/send — Send a challenge
router.post('/send', verifyToken, async (req, res) => {
    const { receiverUsername, rating, tag, timeLimit } = req.body;

    try {
        const receiver = await User.findOne({ username: receiverUsername });
        if (!receiver) return res.status(404).json({ error: "Receiver not found" });

        const sender = await User.findById(req.user._id); // ✅ Get sender info

        const newChallenge = new Challenge({
            sender: req.user._id,
            receiver: receiver._id,
            rating,
            tag,
            timeLimit,
            status: 'pending',
        });

        const savedChallenge = await newChallenge.save(); // ✅ Rename variable

        // ✅ Emit to the receiver via Socket.IO
        const io = getIO();
        io.to(receiver._id.toString()).emit("newChallenge", {
            _id: savedChallenge._id,
            sender: {
                username: sender.username,
                profilePic: sender.profilePic,
            },
            rating,
            timeLimit,
            tag,
            status: "pending",
            createdAt: savedChallenge.createdAt,
        });

        // console.log("nihal");

        res.status(201).json({ message: "Challenge sent", challenge: savedChallenge });

    } catch (err) {
        console.error("❌ Send challenge error:", err); // ✅ Add logging
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

// ✅ GET /api/challenge/ongoing
router.get("/ongoing", verifyToken, async (req, res) => {
    try {
        const challenges = await Challenge.find({
            status: "ongoing",
            $or: [
                { sender: req.user._id },
                { receiver: req.user._id }
            ]
        }).populate("sender", "username profilePic").populate("receiver", "username profilePic");

        res.status(200).json(challenges);
    } catch (err) {
        res.status(500).json({ error: "Failed to fetch ongoing challenges" });
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
import { getIO } from "../socket.js"; // Adjust path

router.post('/:id/accept', verifyToken, async (req, res) => {
    try {
        const challenge = await Challenge.findById(req.params.id)
            .populate("sender", "username profilePic")
            .populate("receiver", "username profilePic");

        if (!challenge || challenge.receiver._id.toString() !== req.user._id.toString()) {
            return res.status(403).json({ error: "Unauthorized or challenge not found" });
        }

        challenge.status = "ongoing";
        challenge.startTime = new Date();

        const { getRandomProblem } = await import("../utils/getRandomProblem.js");
        const problem = await getRandomProblem(challenge.rating, challenge.tag);
        challenge.problem = problem;
        await challenge.save();

        const io = getIO();
        io.to(challenge._id.toString()).emit("startContest", {
            challengeId: challenge._id.toString(),
            timestamp: Date.now(),
            timeLimit: challenge.timeLimit,
            sender: challenge.sender,
            receiver: challenge.receiver,
            problem: challenge.problem
        });

        // console.log("🚀 Emitted startContest for", challenge._id.toString());

        res.status(200).json({ message: "Challenge accepted", challenge });
    } catch (err) {
        console.error(err);
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

// DELETE /api/challenge/:id/withdraw
router.delete('/:id/withdraw', verifyToken, async (req, res) => {
    const challenge = await Challenge.findById(req.params.id);
    if (!challenge || challenge.sender.toString() !== req.user._id.toString()) {
        return res.status(403).json({ error: 'Unauthorized or challenge not found' });
    }

    if (challenge.status !== 'pending') {
        return res.status(400).json({ error: 'Challenge cannot be withdrawn' });
    }

    await challenge.deleteOne();
    return res.status(200).json({ message: 'Challenge withdrawn successfully' });
});

// routes/challenge.js
router.get('/:id', verifyToken, async (req, res) => {
    try {
        const challenge = await Challenge.findById(req.params.id)
            .populate("sender", "username _id")
            .populate("receiver", "username _id")
            .exec();

        // console.log("Fetching challenge:", challenge);

        if (!challenge) {
            return res.status(404).json({ error: "Challenge not found" });
        }

        const userId = req.user._id.toString();

        if (
            challenge.sender._id.toString() !== userId &&
            challenge.receiver._id.toString() !== userId
        ) {
            return res.status(403).json({ error: "Unauthorized access" });
        }

        res.status(200).json(challenge);
    } catch (err) {
        console.error("Error fetching challenge:", err);
        res.status(500).json({ error: "Failed to fetch challenge" });
    }
});

// POST /api/challenge/:id/submit-result
// POST /api/challenge/:id/submit-result
router.post('/:id/submit-result', verifyToken, async (req, res) => {
    const { winnerId, isDraw } = req.body;

    try {
        const challenge = await Challenge.findById(req.params.id)
            .populate('sender', 'cfUsername')
            .populate('receiver', 'cfUsername');

        if (!challenge) {
            return res.status(404).json({ error: "Challenge not found" });
        }

        if (challenge.status === "completed") {
            // Already completed — check if new winner has earlier AC
            if (isDraw || !winnerId || challenge.draw) {
                return res.status(200).json({ message: "Challenge already completed" });
            }

            if (String(winnerId) === String(challenge.winner)) {
                return res.status(200).json({ message: "Same winner already stored" });
            }

            const getSubmissionTime = async (cfUsername) => {
                const res = await fetch(`https://codeforces.com/api/user.status?handle=${cfUsername}&from=1&count=10`);
                const data = await res.json();
                if (data.status !== "OK") return Infinity;

                const sub = data.result.find(
                    (s) =>
                        s.verdict === "OK" &&
                        s.problem.contestId === challenge.problem.contestId &&
                        s.problem.index === challenge.problem.index &&
                        s.creationTimeSeconds * 1000 >= new Date(challenge.startTime).getTime()
                );

                return sub ? sub.creationTimeSeconds : Infinity;
            };

            const currentWinnerUser = (String(challenge.winner) === String(challenge.sender._id)) ? challenge.sender : challenge.receiver;
            const newWinnerUser = (String(winnerId) === String(challenge.sender._id)) ? challenge.sender : challenge.receiver;

            const currentTime = await getSubmissionTime(currentWinnerUser.cfUsername);
            const newTime = await getSubmissionTime(newWinnerUser.cfUsername);

            if (newTime < currentTime) {
                challenge.winner = winnerId;
                challenge.draw = false;
                await challenge.save();

                await Promise.all([
                    User.findByIdAndUpdate(winnerId, { $inc: { wins: 1 } }),
                    User.findByIdAndUpdate(challenge.winner, { $inc: { wins: -1 } }),
                ]);

                return res.status(200).json({ message: "Winner updated to earlier submission" });
            }

            return res.status(200).json({ message: "Winner remains unchanged" });
        }

        // ✅ First time result submission
        challenge.status = "completed";
        challenge.winner = isDraw ? null : winnerId;
        challenge.draw = isDraw;
        await challenge.save();

        // Update stats
        await Promise.all([
            User.findByIdAndUpdate(challenge.sender._id, { $inc: { matchesPlayed: 1 } }),
            User.findByIdAndUpdate(challenge.receiver._id, { $inc: { matchesPlayed: 1 } }),
            !isDraw && winnerId ? User.findByIdAndUpdate(winnerId, { $inc: { wins: 1 } }) : Promise.resolve()
        ]);

        res.status(200).json({ message: "Result recorded successfully" });
    } catch (err) {
        console.error("Result processing error:", err);
        res.status(500).json({ error: "Internal server error" });
    }
});


export default router;

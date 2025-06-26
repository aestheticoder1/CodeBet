import express from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import User from '../models/User.js';
import upload from '../middleware/upload.js';
import { verifyToken } from '../middleware/userAuth.js';

const router = express.Router();

// Register
router.post('/register', upload.single('profilePic'), async (req, res) => {
    try {
        const { username, cfUsername, email, password } = req.body;
        const hashedPassword = await bcrypt.hash(password, 10);

        const newUser = new User({
            username,
            cfUsername,
            email,
            password: hashedPassword,
            profilePic: req.file?.path,
        });

        await newUser.save();
        return res.status(201).json({ message: 'User registered successfully' });
    } catch (err) {
        res.status(500).json({ error: 'Registration failed' });
    }
});

// Login
router.post('/login', async (req, res) => {
    const { email, password } = req.body;
    try {
        const user = await User.findOne({ email });
        if (!user) return res.status(404).json({ error: 'User not found' });

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) return res.status(401).json({ error: 'Invalid credentials' });
        // console.log('JWT_SECRET:', process.env.JWT_SECRET);
        const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
            expiresIn: '7d',
        });

        res.status(200).json({
            token,
            user: {
                id: user._id,
                username: user.username,
                email: user.email,
                cfUsername: user.cfUsername,
                profilePic: user.profilePic,
                matchesPlayed: user.matchesPlayed,
                wins: user.wins,
            },
        });
    } catch (err) {
        res.status(500).json({ error: 'Login failed' } + err);
    }
});

// GET /api/auth/profile
router.get('/profile', verifyToken, async (req, res) => {
    try {
        res.status(200).json(req.user); // req.user was set in protect middleware
    } catch (err) {
        res.status(500).json({ error: "Failed to fetch profile" });
    }
});

export default router;


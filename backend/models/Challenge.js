import mongoose from 'mongoose';

const allowedRatings = [
    800, 900, 1000, 1100, 1200, 1300, 1400, 1500,
    1600, 1700, 1800, 1900, 2000, 2100, 2200, 2300,
    2400, 2500, 2600, 2700, 2800, 2900, 3000, 3100, 3200, 3300, 3400, 3500
];

const challengeSchema = new mongoose.Schema({
    sender: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    receiver: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },

    rating: {
        type: Number,
        enum: allowedRatings,
        required: true
    },

    tag: {
        type: String,
        enum: [
            "all", "binary search", "bitmasks", "brute force",
            "combinatorics", "constructive algorithms",
            "dfs and similar", "divide and conquer", "dp", "dsu", "games", "geometry",
            "graphs", "greedy", "hashing", "implementation",
            "interactive", "math", "matrices", "number theory",
            "probabilities", "shortest paths", "sortings",
            "strings", "trees", "two pointers"
        ],
        default: 'all'
    },

    timeLimit: {
        type: Number,
        required: true, // in minutes
    },

    problem: {
        contestId: Number,
        index: String,
        name: String,
        tags: [String],
        url: String
    },

    status: {
        type: String,
        enum: ['pending', 'rejected', 'ongoing', 'completed'],
        default: 'pending',
    },
    startTime: {
        type: Date, // Date.now() in milliseconds
        default: null, // Will be set when the challenge starts
    },

    winner: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    draw: {
        type: Boolean,
        default: false
    },
}, { timestamps: true });

export default mongoose.model('Challenge', challengeSchema);

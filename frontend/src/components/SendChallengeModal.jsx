import React, { useState } from 'react';
import axios from '../api/axios.js';
import { toast } from 'react-toastify';
import { useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';

const tagOptions = [
    "all", "binary search", "bitmasks", "brute force",
    "combinatorics", "constructive algorithms",
    "dfs and similar", "divide and conquer", "dp", "dsu", "games", "geometry",
    "graphs", "greedy", "hashing", "implementation",
    "interactive", "math", "matrices", "number theory",
    "probabilities", "shortest paths", "sortings",
    "strings", "trees", "two pointers"
];

const SendChallengeModal = ({ isOpen, onClose, socket }) => {
    const [receiverUsername, setReceiverUsername] = useState('');
    const [rating, setRating] = useState(800);
    const [tag, setTag] = useState("all");
    const [timeLimit, setTimeLimit] = useState(30);
    const [loading, setLoading] = useState(false);
    const [challengeId, setChallengeId] = useState(null);
    const [statusMessage, setStatusMessage] = useState("");

    const user = useSelector((state) => state.user.user);
    const token = localStorage.getItem("token");
    const navigate = useNavigate();

    if (!isOpen) return null;

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setStatusMessage("");

        try {
            // Contest start listener
            const contestHandler = (data) => {
                navigate(`/challenge/${data.challengeId}`, {
                    state: {
                        ...data,
                        isSender: true
                    }
                });
            };
            socket.on("startContest", contestHandler);

            const res = await axios.post('/challenge/send', {
                receiverUsername,
                rating,
                timeLimit,
                tag
            }, {
                headers: { Authorization: `Bearer ${token}` }
            });

            const challenge = res.data.challenge;
            setChallengeId(challenge._id);
            setStatusMessage("✅ Challenge sent! Waiting for opponent to accept...");

            socket.emit("joinChallenge", {
                challengeId: challenge._id,
                userId: user._id
            });

        } catch (err) {
            toast.error(err.response?.data?.error || 'Failed to send challenge');
            setStatusMessage("");
        } finally {
            setLoading(false);
        }
    };

    const handleWithdraw = async () => {
        try {
            await axios.delete(`/challenge/${challengeId}/withdraw`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            toast.success("Challenge withdrawn");
            setChallengeId(null);
            setStatusMessage("");
            onClose();
        } catch (err) {
            toast.error(err.response?.data?.error || 'Failed to withdraw challenge');
        }
    };

    const handleCross = () => {
        setStatusMessage("");
        onClose();
    }
    return (
        <div className="fixed inset-0 bg-background bg-opacity-40 flex items-center justify-center z-50">
            <div className="bg-background p-6 rounded shadow-md w-full max-w-md relative">
                <button
                    onClick={handleCross}
                    className="absolute top-2 right-3 text-gray-600 hover:text-black"
                >
                    ✕
                </button>
                <h2 className="text-xl font-bold mb-4">Send Challenge</h2>

                {!statusMessage ? (
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div>
                            <label className="block mb-1 font-medium">Opponent Username</label>
                            <input
                                type="text"
                                className="w-full px-3 py-2 border rounded bg-card"
                                placeholder="tourist"
                                value={receiverUsername}
                                onChange={(e) => setReceiverUsername(e.target.value)}
                                disabled={loading}
                                required
                            />
                        </div>

                        <div>
                            <label className="block mb-1 font-medium">Rating</label>
                            <select
                                className="w-full px-3 py-2 border rounded bg-card"
                                value={rating}
                                onChange={(e) => setRating(parseInt(e.target.value))}
                                disabled={loading}
                            >
                                {Array.from({ length: (3000 - 800) / 100 + 1 }, (_, i) => 800 + i * 100).map((r) => (
                                    <option key={r} value={r}>{r}</option>
                                ))}
                            </select>
                        </div>

                        <div>
                            <label className="block mb-1 font-medium">Tag</label>
                            <select
                                className="w-full px-3 py-2 border rounded bg-card"
                                value={tag}
                                onChange={(e) => setTag(e.target.value)}
                                disabled={loading}
                            >
                                {tagOptions.map((t) => (
                                    <option key={t} value={t}>{t}</option>
                                ))}
                            </select>
                        </div>

                        <div>
                            <label className="block mb-1 font-medium">Time Limit (minutes)</label>
                            <input
                                type="number"
                                className="w-full px-3 py-2 border rounded bg-card"
                                min="1"
                                max="180"
                                value={timeLimit}
                                onChange={(e) => setTimeLimit(Number(e.target.value))}
                                disabled={loading}
                                required
                            />
                        </div>

                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700"
                        >
                            {loading ? 'Sending...' : 'Send Challenge'}
                        </button>
                    </form>
                ) : (
                    <div className="text-center space-y-4">
                        <p className="text-green-600 font-semibold">{statusMessage}</p>
                        <p className="text-sm text-gray-500">
                            You’ll be redirected once the opponent accepts.
                        </p>
                        <button
                            onClick={handleWithdraw}
                            className="w-full bg-red-600 text-white py-2 rounded hover:bg-red-700"
                        >
                            Withdraw Challenge
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
};

export default SendChallengeModal;

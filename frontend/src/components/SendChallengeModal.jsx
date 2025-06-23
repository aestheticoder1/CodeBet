// src/components/SendChallengeModal.jsx
import React, { useState } from 'react';
import axios from '../api/axios.js';
import { toast } from 'react-toastify';
import { useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';

const SendChallengeModal = ({ isOpen, onClose, socket }) => {
    const [receiverUsername, setReceiverUsername] = useState('');
    const [rating, setRating] = useState(800);
    const [timeLimit, setTimeLimit] = useState(30);
    const [loading, setLoading] = useState(false);
    const user = useSelector((state) => state.user.user);
    const token = localStorage.getItem("token");
    const navigate = useNavigate();

    if (!isOpen) return null;

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);

        try {
            // Setup persistent listener (with cleanup)
            const contestHandler = (data) => {
                console.log("🚀 Contest started with data:", data);
                navigate(`/contest/${data.challengeId}`, {
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
                tag: 'all'
            }, {
                headers: { Authorization: `Bearer ${token}` }
            });

            // Join the challenge room
            socket.emit("joinChallenge", {
                challengeId: res.data.challenge._id,
                userId: user._id
            });

            // Cleanup function
            return () => {
                socket.off("startContest", contestHandler);
            };

        } catch (err) {
            toast.error(err.response?.data?.error || 'Failed to send challenge');
        } finally {
            setLoading(false);
        }
    };





    return (
        <div className="fixed inset-0 bg-background bg-opacity-40 flex items-center justify-center z-50">
            <div className="bg-background p-6 rounded shadow-md w-full max-w-md relative">
                <button
                    onClick={onClose}
                    className="absolute top-2 right-3 text-gray-600 hover:text-black"
                >
                    ✕
                </button>
                <h2 className="text-xl font-bold mb-4">Send Challenge</h2>

                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="block mb-1 font-medium">Opponent Username</label>
                        <input
                            type="text"
                            className="w-full px-3 py-2 border rounded bg-card"
                            placeholder="tourist"
                            value={receiverUsername}
                            onChange={(e) => setReceiverUsername(e.target.value)}
                            required
                        />
                    </div>

                    <div>
                        <label className="block mb-1 font-medium">Rating</label>
                        <select
                            className="w-full px-3 py-2 border rounded bg-card"
                            value={rating}
                            onChange={(e) => setRating(parseInt(e.target.value))}
                        >
                            {Array.from({ length: (3000 - 800) / 100 + 1 }, (_, i) => 800 + i * 100).map((r) => (
                                <option key={r} value={r}>{r}</option>
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
            </div>
        </div>
    );
};

export default SendChallengeModal;

import React, { useEffect, useState } from "react";
import axios from "../api/axios";
import { useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";

const PastHistory = () => {
    const [challenges, setChallenges] = useState([]);
    const [loading, setLoading] = useState(true);

    const user = useSelector((state) => state.user.user);
    const token = localStorage.getItem("token");
    const navigate = useNavigate();

    useEffect(() => {
        const fetchChallenges = async () => {
            try {
                const res = await axios.get("/challenge/my", {
                    headers: { Authorization: `Bearer ${token}` },
                });
                const filtered = res.data.filter(c => c.status === "completed");
                setChallenges(filtered);
            } catch (err) {
                console.error("Failed to fetch past history:", err);
            } finally {
                setLoading(false);
            }
        };

        fetchChallenges();
    }, [token]);

    const getResultLabel = (challenge) => {
        if (challenge.draw) return "Draw 🤝";
        if (challenge.winner === user._id) return "Won 🎉";
        return "Lost 😞";
    };

    const getResultColor = (challenge) => {
        if (challenge.draw) return "text-yellow-400";
        if (challenge.winner === user._id) return "text-green-400";
        return "text-red-400";
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-screen bg-background text-white">
                <div className="border-4 border-blue-500 border-t-transparent rounded-full w-16 h-16 animate-spin"></div>
            </div>
        );
    }

    return (
        <div className="min-h-screen px-4 md:px-28 py-10 bg-background text-white">
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-3xl font-bold text-primary">Past Results</h1>
                <button
                    onClick={() => navigate("/dashboard")}
                    className="bg-primary text-black px-4 py-2 font-semibold rounded hover:bg-secondary transition"
                >
                    Back to Dashboard
                </button>
            </div>

            {challenges.length === 0 ? (
                <p className="text-gray-400 text-lg">You have no completed challenges yet.</p>
            ) : (
                <div className="space-y-4">
                    {challenges.map((challenge) => {
                        const opponent =
                            user._id === challenge.sender._id
                                ? challenge.receiver
                                : challenge.sender;

                        return (
                            <div
                                key={challenge._id}
                                className="border border-gray-700 p-5 rounded-lg bg-card shadow-sm hover:shadow-primary flex flex-col sm:flex-row sm:justify-between sm:items-center transition-all duration-300"
                            >
                                <div className="flex items-center gap-4">
                                    {opponent.profilePic ? (
                                        <img
                                            src={opponent.profilePic}
                                            alt="Opponent"
                                            className="w-12 h-12 rounded-full border"
                                        />
                                    ) : (
                                        <div className="w-12 h-12 rounded-full bg-gray-600 flex items-center justify-center font-bold text-white">
                                            {opponent.username?.charAt(0).toUpperCase()}
                                        </div>
                                    )}

                                    <div>
                                        <p className="font-semibold text-lg">{opponent.username}</p>
                                        <p className="text-sm text-gray-400">
                                            Rating: {challenge.rating} | Tag: {challenge.tag}
                                        </p>
                                    </div>
                                </div>

                                <div className="mt-4 sm:mt-0 sm:text-right">
                                    <p className={`font-bold text-lg ${getResultColor(challenge)}`}>
                                        {getResultLabel(challenge)}
                                    </p>
                                    <p className="text-gray-400 text-sm">
                                        {new Date(challenge.createdAt).toLocaleString()}
                                    </p>
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}
        </div>
    );
};

export default PastHistory;

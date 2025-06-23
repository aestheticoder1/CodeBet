// src/pages/Dashboard.jsx
import React, { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import axios from '../api/axios.js';
import { useNavigate } from 'react-router-dom';
import SendChallengeModal from '../components/SendChallengeModal.jsx';

const Dashboard = ({ socket }) => {
    const user = useSelector((state) => state.user.user);
    const [receivedChallenges, setReceivedChallenges] = useState([]);
    const [modalOpen, setModalOpen] = useState(false);
    const navigate = useNavigate();
    const token = localStorage.getItem("token");

    // Fetch received challenges
    useEffect(() => {
        const fetchReceivedChallenges = async () => {
            try {
                const res = await axios.get('/challenge/received', {
                    headers: { Authorization: `Bearer ${token}` },
                });
                setReceivedChallenges(res.data);
            } catch (err) {
                console.error("Failed to fetch challenges", err);
            }
        };

        if (token) fetchReceivedChallenges();
    }, [token]);


    const handleAccept = async (challenge) => {
        try {
            // Setup persistent listener (with cleanup)
            const contestHandler = (data) => {
                console.log("🎯 Contest started with data:", data);
                navigate(`/contest/${data.challengeId}`, {
                    state: {
                        ...data,
                        isReceiver: true
                    }
                });
            };

            socket.on("startContest", contestHandler);

            // Join the challenge room
            socket.emit("joinChallenge", {
                challengeId: challenge._id,
                userId: user._id
            });

            // Cleanup function
            return () => {
                socket.off("startContest", contestHandler);
            };

        } catch (err) {
            console.error("Challenge accept error:", err);
        }
    };




    const handleReject = async (challenge) => {
        try {
            await axios.post(
                `/challenge/${challenge._id}/reject`,
                {},
                { headers: { Authorization: `Bearer ${token}` } }
            );

            setReceivedChallenges((prev) =>
                prev.filter((c) => c._id !== challenge._id)
            );
        } catch (err) {
            console.error("❌ Failed to reject challenge", err);
        }
    };

    return (
        <div className="min-h-screen p-8 bg-background">
            {/* Profile Section */}
            <div className="flex flex-col md:flex-row items-start bg-card rounded shadow p-6 mb-8">
                <div className="w-full md:w-1/3 flex justify-center mb-4 md:mb-0">
                    {user?.profilePic ? (
                        <img
                            src={user.profilePic}
                            alt="Profile"
                            className="w-40 h-40 rounded-full border"
                        />
                    ) : (
                        <div className="w-40 h-40 rounded-full bg-gray-300 flex items-center justify-center text-xl font-bold">
                            {user?.username?.charAt(0).toUpperCase()}
                        </div>
                    )}
                </div>

                <div className="w-full text-center md:text-left md:w-2/3 pl-0 md:pl-8">
                    <h1 className="text-3xl font-bold mb-2">Welcome, {user?.username} 🎉</h1>
                    <p className="mb-1"><strong>Email:</strong> {user?.email}</p>
                    <p className="mb-1"><strong>Codeforces Username:</strong> {user?.cfUsername}</p>

                    <div className="mt-4 flex justify-center md:justify-start gap-4">
                        <button
                            onClick={() => setModalOpen(true)}
                            className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition"
                        >
                            Send Challenge
                        </button>
                        <button
                            onClick={() => navigate('/challenge/history')}
                            className="bg-gray-800 text-white px-4 py-2 rounded hover:bg-gray-900 transition"
                        >
                            Past History
                        </button>
                    </div>
                </div>
            </div>

            {/* Received Challenges */}
            <div className="bg-card p-6 rounded shadow">
                <h2 className="text-xl font-semibold mb-4">Received Challenges</h2>
                {receivedChallenges.length === 0 ? (
                    <p className="text-gray-500">No pending challenges yet.</p>
                ) : (
                    <ul className="space-y-4">
                        {receivedChallenges.map((challenge) => (
                            <li
                                key={challenge._id}
                                className="border p-4 rounded flex flex-col md:flex-row justify-between items-start md:items-center"
                            >
                                <div>
                                    <p><strong>From:</strong> {challenge.sender.username}</p>
                                    <p><strong>Rating:</strong> {challenge.rating}</p>
                                    <p><strong>Tag:</strong> {challenge.tag}</p>
                                    <p><strong>Time Limit:</strong> {challenge.timeLimit} minutes</p>
                                </div>
                                <div className="mt-4 md:mt-0 flex gap-3">
                                    <button
                                        className="bg-green-600 text-white px-3 py-1 rounded hover:bg-green-700"
                                        onClick={() => handleAccept(challenge)}
                                    >
                                        Accept
                                    </button>
                                    <button
                                        className="bg-red-600 text-white px-3 py-1 rounded hover:bg-red-700"
                                        onClick={() => handleReject(challenge)}
                                    >
                                        Reject
                                    </button>
                                </div>
                            </li>
                        ))}
                    </ul>
                )}
            </div>

            {/* Modal */}
            <SendChallengeModal
                isOpen={modalOpen}
                onClose={() => setModalOpen(false)}
                socket={socket}
            />
        </div>
    );
};

export default Dashboard;

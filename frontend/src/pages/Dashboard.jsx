import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import axios from '../api/axios.js';
import { useNavigate } from 'react-router-dom';
import SendChallengeModal from '../components/SendChallengeModal.jsx';
import { toast } from 'react-toastify';
import { setUser } from '../redux/userSlice.js';

const Dashboard = ({ socket }) => {
    const user = useSelector((state) => state.user.user);
    const [receivedChallenges, setReceivedChallenges] = useState([]);
    const [ongoingChallenges, setOngoingChallenges] = useState([]);
    const [activeTab, setActiveTab] = useState("received");
    const [modalOpen, setModalOpen] = useState(false);
    const [acceptingId, setAcceptingId] = useState(null);
    const [rejectingId, setRejectingId] = useState(null);

    const navigate = useNavigate();
    const token = localStorage.getItem("token");
    const dispatch = useDispatch();

    useEffect(() => {
        if (user?._id && socket) {
            socket.emit("registerUser", user._id);
        }
    }, [user, socket]);

    useEffect(() => {
        const refreshUserStats = async () => {
            try {
                const res = await axios.get("/auth/profile", {
                    headers: { Authorization: `Bearer ${token}` }
                });
                dispatch(setUser(res.data));
            } catch (err) {
                console.error("❌ Could not refresh user stats", err);
            }
        };

        refreshUserStats(); // Call only once when dashboard loads
    }, []);

    useEffect(() => {
        if (!socket) return;
        const handleNewChallenge = (data) => {
            setReceivedChallenges((prev) => [data, ...prev]);
            toast.info("📨 New challenge received!");
        };
        socket.on("newChallenge", handleNewChallenge);
        return () => socket.off("newChallenge", handleNewChallenge);
    }, [socket]);

    useEffect(() => {
        const fetchReceived = async () => {
            try {
                const res = await axios.get('/challenge/received', {
                    headers: { Authorization: `Bearer ${token}` },
                });
                setReceivedChallenges(res.data);
            } catch (err) {
                console.error("❌ Failed to fetch received challenges", err);
            }
        };
        if (activeTab === "received" && token) fetchReceived();
    }, [token, activeTab]);

    useEffect(() => {
        const fetchOngoing = async () => {
            try {
                const res = await axios.get('/challenge/ongoing', {
                    headers: { Authorization: `Bearer ${token}` },
                });
                setOngoingChallenges(res.data);
            } catch (err) {
                console.error("❌ Failed to fetch ongoing challenges", err);
            }
        };
        if (activeTab === "ongoing" && token) fetchOngoing();
    }, [token, activeTab]);

    const handleAccept = async (challenge) => {
        setAcceptingId(challenge._id);
        try {
            const contestHandler = (data) => {
                navigate(`/challenge/${data.challengeId}`);
            };
            socket.on("startContest", contestHandler);

            socket.emit("joinChallenge", {
                challengeId: challenge._id,
                userId: user._id,
            });

            await axios.post(`/challenge/${challenge._id}/accept`, {}, {
                headers: { Authorization: `Bearer ${token}` },
            });
        } catch (err) {
            console.error("❌ Challenge accept error", err);
        } finally {
            setAcceptingId(null);
        }
    };

    const handleReject = async (challenge) => {
        setRejectingId(challenge._id);
        try {
            await axios.post(`/challenge/${challenge._id}/reject`, {}, {
                headers: { Authorization: `Bearer ${token}` },
            });

            setReceivedChallenges((prev) =>
                prev.filter((c) => c._id !== challenge._id)
            );
        } catch (err) {
            console.error("❌ Failed to reject challenge", err);
        } finally {
            setRejectingId(null);
        }
    };

    const handleRejoin = (challengeId) => {
        socket.emit("joinChallenge", {
            challengeId,
            userId: user._id,
        });

        navigate(`/challenge/${challengeId}`);
    };

    return (
        <div className="min-h-screen p-8 bg-background">
            <div className="flex flex-col md:flex-row items-start bg-card rounded shadow p-6 mb-8">
                <div className="w-full md:w-1/3 flex justify-center mb-4 md:mb-0">
                    {user?.profilePic ? (
                        <img src={user.profilePic} alt="Profile" className="w-40 h-40 rounded-full border" />
                    ) : (
                        <div className="w-40 h-40 rounded-full bg-gray-300 flex items-center justify-center text-xl font-bold">
                            {user?.username?.charAt(0).toUpperCase()}
                        </div>
                    )}
                </div>

                <div className="w-full text-center md:text-left md:w-2/3 pl-0 md:pl-8">
                    <h1 className="text-3xl font-bold mb-2">{user?.username}</h1>
                    <p className="mb-1"><strong>Email:</strong> {user?.email}</p>
                    <p className="mb-1"><strong>Codeforces Username:</strong> {user?.cfUsername}</p>
                    <p className="mb-1"><strong>Total Matches:</strong> {user?.matchesPlayed}</p>
                    <p className="mb-1"><strong>Total Wins:</strong> {user?.wins}</p>

                    <div className="mt-4 flex flex-wrap justify-center md:justify-start gap-4">
                        <button
                            onClick={() => setModalOpen(true)}
                            className="inline-block bg-primary text-gray-900 font-bold px-4 py-2 rounded hover:bg-secondary transition"
                        >
                            Send Challenge
                        </button>
                        <button
                            onClick={() => navigate('/past-history')}
                            className="hover:text-secondary border px-4 py-2 font-semibold transition hover:border-secondary rounded"
                        >
                            Past History
                        </button>
                        <button
                            onClick={() => {
                                localStorage.removeItem("token");
                                dispatch(setUser(null));
                                navigate("/login");
                            }}
                            className="bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700 transition"
                        >
                            Logout
                        </button>
                    </div>
                </div>
            </div>

            {/* Toggle Tabs */}
            <div className="bg-card mb-6">
                <div className="flex flex-col md:flex-row md:justify-between space-x-4 py-4 px-8">
                    <button
                        className={`px-4 py-2 font-bold text-xl text-white rounded ${activeTab === 'received' ? 'bg-blue-400 text-black' : 'bg-card text-white'}`}
                        onClick={() => setActiveTab("received")}
                    >
                        Received Challenges
                    </button>
                    <button
                        className={`px-4 py-2 font-bold text-xl text-white rounded ${activeTab === 'ongoing' ? 'bg-secondary text-black' : 'bg-card text-white'}`}
                        onClick={() => setActiveTab("ongoing")}
                    >
                        Ongoing Challenges
                    </button>
                </div>

                {/* Challenge Lists */}
                {activeTab === "received" ? (
                    <div className="bg-card px-12 pb-6 pt-3 rounded shadow">
                        {receivedChallenges.length === 0 ? (
                            <p className="text-gray-400 text-lg">No pending challenges yet.</p>
                        ) : (
                            <ul className="space-y-4">
                                {receivedChallenges.map((challenge) => (
                                    <li key={challenge._id} className="border border-gray-700 shadow-sm transition-all hover:shadow-white bg-background p-4 rounded flex flex-col md:flex-row justify-between items-start md:items-center">
                                        <div>
                                            <p><strong>From:</strong> {challenge.sender.username}</p>
                                            <p><strong>Rating:</strong> {challenge.rating}</p>
                                            <p><strong>Tag:</strong> {challenge.tag}</p>
                                            <p><strong>Time Limit:</strong> {challenge.timeLimit} minutes</p>
                                        </div>
                                        <div className="mt-4 md:mt-0 flex gap-3">
                                            <button
                                                className="bg-green-600 text-white px-3 py-1 rounded hover:bg-green-700"
                                                disabled={acceptingId === challenge._id}
                                                onClick={() => handleAccept(challenge)}
                                            >
                                                {acceptingId === challenge._id ? "Accepting..." : "Accept"}
                                            </button>
                                            <button
                                                className="bg-red-600 text-white px-3 py-1 rounded hover:bg-red-700"
                                                disabled={rejectingId === challenge._id}
                                                onClick={() => handleReject(challenge)}
                                            >
                                                {rejectingId === challenge._id ? "Rejecting..." : "Reject"}
                                            </button>
                                        </div>
                                    </li>
                                ))}
                            </ul>
                        )}
                    </div>
                ) : (
                    <div className="bg-card px-12 pb-6 pt-3 rounded shadow">
                        {ongoingChallenges.length === 0 ? (
                            <p className="text-gray-400 text-lg">No ongoing challenges.</p>
                        ) : (
                            <ul className="space-y-4">
                                {ongoingChallenges.map((challenge) => (
                                    <li key={challenge._id} className="border border-gray-700 shadow-sm transition-all hover:shadow-white bg-background p-4 rounded flex flex-col md:flex-row justify-between items-start md:items-center">
                                        <div>
                                            <p><strong>Opponent:</strong> {
                                                user._id === challenge.sender._id ? challenge.receiver.username : challenge.sender.username
                                            }</p>
                                            <p><strong>Rating:</strong> {challenge.rating}</p>
                                            <p><strong>Tag:</strong> {challenge.tag}</p>
                                            <p><strong>Time Limit:</strong> {challenge.timeLimit} minutes</p>
                                        </div>
                                        <div className="mt-4 md:mt-0">
                                            <button className="bg-indigo-600 text-white px-3 py-1 rounded hover:bg-indigo-700" onClick={() => handleRejoin(challenge._id)}>
                                                Rejoin
                                            </button>
                                        </div>
                                    </li>
                                ))}
                            </ul>
                        )}
                    </div>
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

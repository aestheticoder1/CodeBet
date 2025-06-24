import { useNavigate, useParams } from "react-router-dom";
import { useEffect, useState } from "react";
import axios from "../api/axios";
import { useDispatch, useSelector } from 'react-redux';
import { setUser } from "../redux/userSlice";

const ContestPage = ({ socket }) => {
    const { id } = useParams(); // challengeId from URL
    const [challenge, setChallenge] = useState(null);
    const [timeLeft, setTimeLeft] = useState(0);
    const navigate = useNavigate();
    const dispatch = useDispatch();

    const user = useSelector((state) => state.user.user);
    const token = localStorage.getItem("token");
    // const { challengeId } = useParams();
    const challengeId = id; // Use the id from URL params

    // Example: after user gets AC
    const handleWin = async () => {
        console.log(user._id);
        socket.emit("submitResult", {
            challengeId,
            winnerId: user._id,
            isDraw: false
        });

        try {
            // console.log(challengeId)
            await axios.post(`/challenge/${challengeId}/submit-result`, {
                winnerId: user._id,
                isDraw: false
            }, {
                headers: { Authorization: `Bearer ${token}` }
            });
        } catch (err) {
            console.error("Failed to submit result:", err);
        }
    };

    useEffect(() => {
        if (!socket || !user) return;
        const handleContestEnd = async ({ winnerId, isDraw }) => {
            if (isDraw) {
                alert("⚖️ The contest ended in a draw.");
            } else if (winnerId === user._id) {
                alert("🏆 You won the contest!");
            } else {
                alert("😢 You lost the contest.");
            }

            const res = await axios.get("/auth/profile", {
                headers: { Authorization: `Bearer ${token}` },
            });
            dispatch(setUser(res.data));

            // Redirect after short delay (optional for UX)
            navigate("/dashboard")
        };

        socket.on("contestEnded", handleContestEnd);
        return () => socket.off("contestEnded", handleContestEnd);
    }, [socket, user]);


    // ✅ Fetch challenge data
    useEffect(() => {
        const fetchChallenge = async () => {
            try {
                const res = await axios.get(`/challenge/${id}`, {
                    headers: { Authorization: `Bearer ${token}` }
                });
                setChallenge(res.data);
            } catch (err) {
                console.error("Failed to fetch challenge:", err);
            }
        };
        fetchChallenge();
    }, [id, token]);

    // ✅ Timer logic
    useEffect(() => {
        if (!challenge?.startTime || !challenge?.timeLimit || challenge?.status !== "ongoing") return;

        const startTime = new Date(challenge.startTime).getTime();
        const contestEnd = startTime + challenge.timeLimit * 60 * 1000;

        const updateTimer = () => {
            const now = Date.now();
            const remaining = contestEnd - now;

            if (remaining <= 0) {
                setTimeLeft(0);
                clearInterval(interval);

                // ⏱ Submit as draw only if still ongoing
                socket.emit("submitResult", {
                    challengeId: id,
                    winnerId: null,
                    isDraw: true
                });

                axios.post(`/challenge/${id}/submit-result`, {
                    winnerId: null,
                    isDraw: true
                }, {
                    headers: { Authorization: `Bearer ${token}` }
                }).catch((err) => console.error("❌ Failed to submit draw", err));
            } else {
                setTimeLeft(remaining);
            }
        };

        const interval = setInterval(updateTimer, 1000);
        updateTimer();

        return () => clearInterval(interval);
    }, [challenge]);


    const formatTime = (ms) => {
        const totalSeconds = Math.floor(ms / 1000);
        const minutes = Math.floor(totalSeconds / 60);
        const seconds = totalSeconds % 60;
        return `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
    };

    if (!challenge) return <p className="p-6">Loading challenge...</p>;

    return (
        <div className="p-6">
            <h1 className="text-2xl font-bold mb-2">Contest Started!</h1>
            <p className="text-lg mb-2">Challenge ID: {id}</p>
            <p className="mb-2 font-semibold">
                Problem:{" "}
                <a
                    className="text-blue-500 underline"
                    href={challenge.problem?.url}
                    target="_blank"
                    rel="noreferrer"
                >
                    {challenge.problem?.name}
                </a>
            </p>
            <p className="text-xl font-semibold text-red-600">
                ⏳ Time Left: {formatTime(timeLeft)}
            </p>
            <button
                onClick={handleWin}
                className="mt-6 bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded"
            >
                Simulate AC (Win)
            </button>
        </div>
    );
};

export default ContestPage;

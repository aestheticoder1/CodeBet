import { useNavigate, useParams } from "react-router-dom";
import { useEffect, useState } from "react";
import axios from "../api/axios";
import { useDispatch, useSelector } from 'react-redux';
import { setUser } from "../redux/userSlice";
import {
    CircularProgressbar,
    buildStyles
} from 'react-circular-progressbar';
import 'react-circular-progressbar/dist/styles.css';

const ContestPage = ({ socket }) => {
    const { id } = useParams();
    const [challenge, setChallenge] = useState(null);
    const [timeLeft, setTimeLeft] = useState(0);
    const [result, setResult] = useState(null);
    const [resultFinalized, setResultFinalized] = useState(false);

    const navigate = useNavigate();
    const dispatch = useDispatch();
    const user = useSelector((state) => state.user.user);
    const token = localStorage.getItem("token");
    const challengeId = id;

    const handleWin = async () => {
        socket.emit("submitResult", {
            challengeId,
            winnerId: user._id,
            isDraw: false
        });

        try {
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
            if (resultFinalized) return;
            setResultFinalized(true);

            if (isDraw) setResult("draw");
            else if (winnerId === user._id) setResult("win");
            else setResult("lose");

            const res = await axios.get("/auth/profile", {
                headers: { Authorization: `Bearer ${token}` },
            });
            dispatch(setUser(res.data));
        };

        socket.on("contestEnded", handleContestEnd);
        return () => socket.off("contestEnded", handleContestEnd);
    }, [socket, user]);

    useEffect(() => {
        if (!challenge || !challenge.problem || !user?.cfUsername) return;

        const interval = setInterval(async () => {
            try {
                const res = await fetch(`https://codeforces.com/api/user.status?handle=${user.cfUsername}&from=1&count=5`);
                const data = await res.json();

                if (data.status === "OK") {
                    const submissions = data.result;
                    const acSubmission = submissions.find(
                        (sub) =>
                            sub.verdict === "OK" &&
                            sub.problem.contestId === challenge.problem.contestId &&
                            sub.problem.index === challenge.problem.index &&
                            sub.creationTimeSeconds * 1000 >= new Date(challenge.startTime).getTime()
                    );

                    if (acSubmission) {
                        clearInterval(interval);
                        handleWin();
                    }
                }
            } catch (error) {
                console.error("Failed to fetch Codeforces submissions", error);
            }
        }, 4000);

        return () => clearInterval(interval);
    }, [challenge, user]);

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

    useEffect(() => {
        if (!challenge?.startTime || !challenge?.timeLimit || challenge?.status !== "ongoing") return;

        const startTime = new Date(challenge.startTime).getTime();
        const contestEnd = startTime + challenge.timeLimit * 60 * 1000;

        const interval = setInterval(() => {
            const now = Date.now();
            const remaining = contestEnd - now;

            if (remaining <= 0) {
                clearInterval(interval);
                setTimeLeft(0);

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
        }, 1000);

        return () => clearInterval(interval);
    }, [challenge]);

    const formatTime = (ms) => {
        const totalSeconds = Math.floor(ms / 1000);
        const minutes = Math.floor(totalSeconds / 60);
        const seconds = totalSeconds % 60;
        return `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
    };

    if (!challenge) {
        return (
            <div className="flex items-center justify-center min-h-screen bg-gray-900">
                <div className="border-4 border-blue-500 border-t-transparent rounded-full w-16 h-16 animate-spin"></div>
            </div>
        );
    }

    return (
        <div className="flex flex-col items-center justify-center min-h-screen bg-gray-900 text-white px-4">
            {result ? (
                <div className="w-full max-w-md bg-gray-800 rounded-xl shadow-lg px-10 py-12 text-center">
                    <h2 className="text-2xl font-semibold mb-3">
                        {result === "draw" && (
                            <>
                                <span>{challenge?.sender?.username}</span> 🤝{" "}
                                <span>{challenge?.receiver?.username}</span>
                                <p className="mt-4 text-primary">Match Draw</p>
                            </>
                        )}
                        {result === "win" && (
                            <>
                                <span>{user.username}</span> <span className="text-secondary">smashed</span>{" "}
                                <span>
                                    {user._id === challenge?.sender?._id ? challenge?.receiver?.username : challenge?.sender?.username}
                                </span>
                                <p className="mt-4 text-secondary">Match Won 🎉</p>
                            </>
                        )}
                        {result === "lose" && (
                            <>
                                <span>{user._id === challenge?.sender?._id ? challenge?.receiver?.username : challenge?.sender?.username}</span>{" "}
                                <span className="text-tertiary">smashed</span>{" "}
                                <span>{user.username}</span>
                                <p className="mt-4 text-tertiary">Match Lost 😞</p>
                            </>
                        )}
                    </h2>
                    <button
                        className="mt-6 bg-primary hover:bg-secondary px-6 py-2 text-black font-bold rounded-lg transition duration-500"
                        onClick={() => navigate("/dashboard")}
                    >
                        Go to Dashboard
                    </button>
                </div>
            ) : (
                <div className="w-full max-w-2xl bg-gray-800 rounded-xl shadow-lg px-14 py-10">
                    <h1 className="text-4xl text-primary font-bold mb-4 text-center">
                        <span className="text-white">Code</span>Bet <span className="text-white">Con</span>test
                    </h1>

                    <div className="mb-4 text-center">
                        <p className="text-lg font-semibold mb-1 text-gray-300">
                            Challenge ID: <span className="text-white">{id}</span>
                        </p>
                        <div className="w-32 h-32 mx-auto mt-4">
                            <CircularProgressbar
                                value={(timeLeft / (challenge.timeLimit * 60 * 1000)) * 100}
                                text={`${formatTime(timeLeft)}`}
                                styles={buildStyles({
                                    pathColor: 'lightblue',
                                    textColor: 'white',
                                    trailColor: 'black'
                                })}
                            />
                        </div>
                    </div>

                    <div className="mb-4 flex flex-col sm:flex-row justify-center items-center gap-2 text-xl">
                        <span className="font-semibold text-2xl text-secondary">Problem:</span>
                        <a
                            href={challenge.problem?.url}
                            target="_blank"
                            rel="noreferrer"
                            className="text-blue-400 hover:underline text-2xl"
                        >
                            {challenge.problem?.name}
                        </a>
                    </div>

                    <div className="grid grid-cols-2 gap-4 mb-6 text-sm sm:text-base">
                        <div>
                            <p className="font-semibold text-gray-400">Challenger:</p>
                            <p className="font-bold text-2xl">{challenge.sender?.username}</p>
                        </div>
                        <div>
                            <p className="font-semibold text-gray-400">Opponent:</p>
                            <p className="font-bold text-2xl">{challenge.receiver?.username}</p>
                        </div>
                        <div>
                            <p className="font-semibold text-gray-400">Problem Rating:</p>
                            <p className="font-bold text-2xl">{challenge.rating || "N/A"}</p>
                        </div>
                        <div>
                            <p className="font-semibold text-gray-400">Problem Tag:</p>
                            <p className="font-bold text-2xl">{challenge.tag || "N/A"}</p>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default ContestPage;

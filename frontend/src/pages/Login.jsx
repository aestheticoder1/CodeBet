import React, { useState } from "react";
import image1 from "../assets/image1.png";
import { Link, useNavigate } from "react-router-dom";
import axios from "../api/axios.js";
import { useDispatch } from "react-redux";
import { setUser } from "../redux/userSlice";

const Login = () => {
    const dispatch = useDispatch();
    const navigate = useNavigate();

    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    const handleLogin = async (email, password) => {
        try {
            setLoading(true);
            setError(""); // Clear previous error

            const res = await axios.post("/auth/login", { email, password });

            localStorage.setItem("token", res.data.token);
            // console.log(res);
            dispatch(setUser(res.data.user));
            navigate("/dashboard");
        } catch (err) {
            const msg = err.response?.data?.error || "Login failed. Please try again.";
            setError(msg);
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        handleLogin(email, password);
    };

    return (
        <div className="min-h-screen flex">
            {/* Left - Login Form */}
            <div className="w-full md:w-1/2 flex items-center justify-center p-6 bg-background">
                <div className="w-full max-w-md space-y-6 rounded-lg hover:shadow-lg hover:shadow-gray-500 px-10 pb-8 bg-card transition transform duration-500">
                    <h2 className="text-3xl font-bold pt-10 pb-4 text-center">Welcome Back</h2>

                    {error && (
                        <div className="bg-red-500 text-white px-4 py-2 rounded text-sm text-center">
                            {error}
                        </div>
                    )}

                    <form className="space-y-4" onSubmit={handleSubmit}>
                        <div>
                            <label className="block text-white mb-1">Email</label>
                            <input
                                type="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                required
                                className="w-full px-4 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-500 bg-gray-700"
                                placeholder="you@example.com"
                            />
                        </div>
                        <div>
                            <label className="block text-white mb-1">Password</label>
                            <input
                                type="password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                required
                                className="w-full px-4 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-500 bg-gray-700 mb-2"
                                placeholder="********"
                            />
                        </div>

                        <button
                            type="submit"
                            className="w-full bg-black text-white py-2 rounded-md hover:bg-green-500 transition duration-500 disabled:opacity-50"
                            disabled={loading}
                        >
                            {loading ? "Logging in..." : "Login"}
                        </button>

                        <p className="mt-6 text-center text-sm">
                            Don't have an account?{" "}
                            <Link to="/signup" className="text-primary hover:underline">
                                Register Here
                            </Link>
                        </p>
                    </form>
                </div>
            </div>

            {/* Right - Image */}
            <div className="hidden md:flex w-1/2 h-screen">
                <img
                    src={image1}
                    alt="Login illustration"
                    className="w-full h-full object-cover"
                />
            </div>
        </div>
    );
};

export default Login;

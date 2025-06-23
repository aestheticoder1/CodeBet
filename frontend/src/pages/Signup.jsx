import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import image2 from "../assets/image2.png";
import axios from "../api/axios.js";

const Signup = () => {
    const navigate = useNavigate();

    const [form, setForm] = useState({
        username: "",
        email: "",
        password: "",
        cfUsername: "",
    });
    const [profilePic, setProfilePic] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    const handleChange = (e) => {
        setForm({ ...form, [e.target.name]: e.target.value });
    };

    const handleFileChange = (e) => {
        setProfilePic(e.target.files[0]);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError("");

        const formData = new FormData();
        for (const key in form) {
            formData.append(key, form[key]);
        }
        if (profilePic) {
            formData.append("profilePic", profilePic);
        }

        try {
            await axios.post("/auth/register", formData, {
                headers: { "Content-Type": "multipart/form-data" },
            });

            navigate("/login");
        } catch (err) {
            const msg = err.response?.data?.error || "Signup failed. Please try again.";
            setError(msg);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex">
            {/* Left: Image */}
            <div className="hidden md:flex w-1/2 h-screen">
                <img
                    src={image2}
                    alt="Signup illustration"
                    className="w-full h-full object-cover"
                />
            </div>

            {/* Right: Signup Form */}
            <div className="w-full md:w-1/2 flex items-center justify-center p-6 bg-background">
                <div className="w-full max-w-md space-y-6 rounded-lg hover:shadow-lg hover:shadow-gray-500 px-10 pb-8 bg-card transition duration-500">
                    <h2 className="text-3xl font-bold pt-10 pb-4 text-center">
                        Create Account
                    </h2>

                    {error && (
                        <div className="bg-red-500 text-white px-4 py-2 rounded text-sm text-center">
                            {error}
                        </div>
                    )}

                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div>
                            <label className="block text-white mb-1">Full Name</label>
                            <input
                                type="text"
                                name="username"
                                value={form.username}
                                onChange={handleChange}
                                placeholder="John Doe"
                                required
                                className="w-full px-4 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-500 bg-gray-700"
                            />
                        </div>

                        <div>
                            <label className="block text-white mb-1">Email</label>
                            <input
                                type="email"
                                name="email"
                                value={form.email}
                                onChange={handleChange}
                                placeholder="you@example.com"
                                required
                                className="w-full px-4 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-500 bg-gray-700"
                            />
                        </div>

                        <div>
                            <label className="block text-white mb-1">Password</label>
                            <input
                                type="password"
                                name="password"
                                value={form.password}
                                onChange={handleChange}
                                placeholder="********"
                                required
                                className="w-full px-4 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-500 bg-gray-700"
                            />
                        </div>

                        <div>
                            <label className="block text-white mb-1">Codeforces Username</label>
                            <input
                                type="text"
                                name="cfUsername"
                                value={form.cfUsername}
                                onChange={handleChange}
                                placeholder="tourist"
                                className="w-full px-4 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-500 bg-gray-700"
                            />
                        </div>

                        <div>
                            <label className="block text-white mb-1">Profile Picture</label>
                            <input
                                type="file"
                                accept="image/*"
                                onChange={handleFileChange}
                                className="w-full text-white bg-gray-700 px-4 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-500 file:cursor-pointer file:bg-gray-600 file:text-white file:px-4 file:py-2 file:rounded-lg file:hover:bg-gray-500 mb-2"
                            />
                        </div>

                        <button
                            type="submit"
                            className="w-full bg-black text-white py-2 rounded-md hover:bg-green-500 transition duration-500 disabled:opacity-50"
                            disabled={loading}
                        >
                            {loading ? "Signing up..." : "Sign Up"}
                        </button>

                        <p className="mt-6 text-center text-sm">
                            Already have an account?{" "}
                            <Link to="/login" className="text-primary hover:underline">
                                Login here
                            </Link>
                        </p>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default Signup;

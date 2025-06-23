import { useState } from "react";
import { Menu, X } from "lucide-react";
import { useSelector } from "react-redux";
import { Link } from "react-router-dom";

export default function Navbar() {
    // const dispatch = useDispatch();
    const user = useSelector((state) => state.user.user);
    // console.log("User in Navbar:", user);
    const [isOpen, setIsOpen] = useState(false);

    return (
        <nav className="sticky top-0 z-50 bg-card px-4 sm:px-6 py-4 border-b border-gray-700 shadow-md">
            <div className="max-w-7xl mx-auto flex justify-between items-center">
                {/* Left: Logo */}
                <Link to={"/"}>
                    <div className="text-3xl font-bold tracking-wide">
                        Code<span className="text-primary">Bet</span>
                    </div>
                </Link>

                {/* Right: Avatar always visible if logged in */}
                <div className="flex items-center space-x-4">
                    {user ? (
                        <Link to={"/dashboard"}>
                            <img
                                src={user.profilePic || "https://ui-avatars.com/api/?name=User"}
                                alt="Profile"
                                className="w-9 h-9 rounded-full border-2 border-black"
                            />
                        </Link>
                    ) : (
                        <>
                            {/* Auth Buttons: Show only on sm and above */}
                            <div className="hidden sm:flex items-center space-x-4">
                                <Link
                                    to={"/login"}
                                    className="hover:text-secondary font-medium border px-3 py-1.5 font-semibold transition hover:border-secondary rounded"
                                >
                                    Login
                                </Link>
                                <Link
                                    to={"/signup"}
                                    className="bg-secondary text-gray-900 px-4 py-1.5 rounded font-semibold hover:bg-white transition"
                                >
                                    Sign Up
                                </Link>
                            </div>

                            {/* Hamburger (only for guests) */}
                            <div className="sm:hidden">
                                <button
                                    onClick={() => setIsOpen(!isOpen)}
                                    className="text-yellow-400 focus:outline-none transition-transform duration-200"
                                >
                                    {isOpen ? <X size={26} /> : <Menu size={26} />}
                                </button>
                            </div>
                        </>
                    )}
                </div>
            </div>

            {/* Mobile Dropdown (only for guests) */}
            {!user && (
                <div
                    className={`sm:hidden transition-all duration-300 ease-in-out ${isOpen ? "max-h-40 opacity-100" : "max-h-0 opacity-0 overflow-hidden"
                        }`}
                >
                    <div className="mt-3 px-4 flex flex-col items-center space-y-2">
                        <Link
                            to={"/login"}
                            className="hover:text-secondary font-medium border px-3 py-1.5 font-semibold transition hover:border-secondary rounded"
                        >
                            Login
                        </Link>
                        <Link
                            to={"/signup"}
                            className="bg-secondary text-gray-900 px-4 py-1.5 rounded font-semibold hover:bg-white transition"
                        >
                            Sign Up
                        </Link>
                    </div>
                </div>
            )}
        </nav>
    );
}

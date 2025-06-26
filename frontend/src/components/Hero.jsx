import { useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";

export default function Hero() {
    const navigate = useNavigate();
    const user = useSelector((state) => state.user.user);

    const handleChallengeNow = () => {
        if (user) {
            navigate("/dashboard");
        } else {
            navigate("/signup");
        }
    };

    return (
        <section className="bg-backgroundDark text-white py-12 px-6">
            <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-10">
                {/* Left: Image */}
                <div className="sm:w-1/2 w-full">
                    <img
                        src="/hero1.png"
                        alt="Code battle visual"
                        className="w-full h-auto rounded-xl shadow-lg"
                    />
                </div>

                {/* Right: Text & CTA */}
                <div className="sm:w-1/2 w-full text-center sm:text-left">
                    <h1 className="text-6xl font-bold mb-6 leading-none">
                        <span className="block">One <span className="text-tertiary">Problem</span></span>
                        <span className="block">Two <span className="text-primary">Minds</span></span>
                        <span className="block text-secondary">Winner Takes All</span>
                    </h1>
                    <p className="text-xl text-gray-300 mb-8">
                        It’s not just about solving problems — it’s about solving them faster.
                        Challenge your peers, race against the clock, and prove your coding instincts under pressure.
                    </p>
                    <button
                        onClick={handleChallengeNow}
                        className="inline-block bg-primary text-gray-900 text-xl font-bold px-6 py-3 rounded hover:bg-secondary transition"
                    >
                        Challenge Now
                    </button>
                </div>
            </div>
        </section>
    );
}

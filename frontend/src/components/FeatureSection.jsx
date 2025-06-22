import {
    Users,
    Clock,
    CheckCircle2,
    ListOrdered,
    Rocket,
} from "lucide-react";

export default function Features() {
    const features = [
        {
            icon: <Users size={28} className="text-yellow-400" />,
            title: "Challenge Friends",
            desc: "Start a 1v1 coding battle instantly by entering your friend’s username directly.",
        },
        {
            icon: <Clock size={28} className="text-yellow-400" />,
            title: "Synced Timers",
            desc: "The countdown starts only when both players get the problem, ensuring a fair battle experience.",
        },
        {
            icon: <CheckCircle2 size={28} className="text-yellow-400" />,
            title: "Auto Verdict Detection",
            desc: "Live Codeforces API integration declares winner based on real submissions.",
        },
        {
            icon: <ListOrdered size={28} className="text-yellow-400" />,
            title: "View Match History",
            desc: "Check past duels and results in your profile anytime.",
        },
        {
            icon: <Rocket size={28} className="text-yellow-400" />,
            title: "Boost Problem Solving",
            desc: "Train under pressure and become faster at solving competitive problems.",
        },
    ];

    return (
        <section className="bg-gray text-white py-16 px-6">
            <div className="max-w-7xl mx-auto text-center">
                <h2 className="text-5xl font-bold mb-4 text-primary">
                    What's Inside?
                </h2>
                <p className="text-gray-300 mb-10 text-xl">
                    Everything you need to turn problem-solving into an adrenaline sport.
                </p>

                <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-8">
                    {features.map((feature, idx) => (
                        <div
                            key={idx}
                            className="relative bg-card pt-10 pb-6 rounded-xl shadow hover:shadow-xl transition hover:shadow-gray-700"
                        >
                            <span className="absolute left-[5%] top-[7%]">{feature.icon}</span>
                            <h3 className="px-12 text-3xl font-semibold">
                                {feature.title}
                            </h3>
                            <p className="text-gray-300 text-md w-3/4 mx-auto mt-3">{feature.desc}</p>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
}

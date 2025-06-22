export default function Footer() {
    return (
        <footer className="bg-card text-white py-8 px-6">
            <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center space-y-6 md:space-y-0">
                {/* Left: Logo & Tagline */}
                <div className="text-center md:text-left">
                    <h3 className="text-3xl font-bold">Code<span className="text-primary">Bet</span></h3>
                    <p className="text-lg font-medium mt-1">
                        <span className="text-tertiary">Code</span>. <span className="text-primary">Compile</span>. <span className="text-secondary">Conquer</span>.
                    </p>
                </div>

                {/* Center: Spacer instead of Links */}
                <div className="hidden md:block" />

                {/* Right: Credits */}
                <div className="text-center md:text-right text-md text-gray-400">
                    <p>
                        Made with ❤️‍🔥 and ☕ by <span className="font-semibold text-secondary">Nihal Rawat</span>
                    </p>
                    <p className="mt-1">&copy; {new Date().getFullYear()} CodeBet. All rights reserved.</p>
                </div>
            </div>
        </footer>
    );
}

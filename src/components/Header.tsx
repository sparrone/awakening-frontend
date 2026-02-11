import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext.ts";
import UserDropdown from "../components/UserDropdown.tsx";

export default function Header() {
    const { isLoggedIn, loading } = useAuth();

    return (
        <header className="bg-black bg-opacity-80 text-white fixed top-0 w-full z-50 shadow-md">
            <div className="max-w-7xl mx-auto px-4 h-14 relative flex items-center justify-between">
                {/* Left nav */}
                <nav className="flex gap-6 text-sm font-medium">
                    <Link
                        to="https://separrone.com"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="hover:text-yellow-400"
                    >
                        separrone.com
                    </Link>
                </nav>

                {/* Center Awakening link */}
                <div className="absolute left-1/2 transform -translate-x-1/2 text-lg font-bold">
                    <Link to="/" className="hover:text-yellow-400">
                        Awakening
                    </Link>
                </div>

                {/* Right nav */}
                <div className="flex items-center gap-6 text-sm font-medium relative">
                    <Link to="/forum" className="hover:text-yellow-400">
                        Forum
                    </Link>

                    {loading ? (
                        <div className="flex gap-3">
                            <div className="w-2 h-2 bg-yellow-400 rounded-full animate-pulse"></div>
                            <Link to="/create-account">
                                <button className="btn-primary w-auto">
                                    Create Account
                                </button>
                            </Link>
                            <Link to="/login">
                                <button className="btn-outline">
                                    Log in
                                </button>
                            </Link>
                        </div>
                    ) : isLoggedIn ? (
                        <UserDropdown />
                    ) : (
                        <div className="flex gap-3">
                            <Link to="/create-account">
                                <button className="btn-primary w-auto">
                                    Create Account
                                </button>
                            </Link>
                            <Link to="/login">
                                <button className="btn-outline">
                                    Log in
                                </button>
                            </Link>
                        </div>
                    )}
                </div>
            </div>
        </header>
    );
}

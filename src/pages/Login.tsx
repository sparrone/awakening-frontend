import { useState } from "react";
import * as React from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function Login() {
    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);
    const { login } = useAuth();
    const navigate = useNavigate();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError("");
        setLoading(true);

        try {
            const response = await fetch("/api/auth/login", {
                method: "POST",
                credentials: "include", // ✅ important for cookies
                headers: { "Content-Type": "application/x-www-form-urlencoded" },
                body: new URLSearchParams({ username, password })
            });

            if (response.ok) {
                // Parse JSON returned by Spring Security success handler
                const data = await response.json();
                
                // Cache user settings in localStorage
                if (data.settings) {
                    localStorage.setItem('userSettings', JSON.stringify(data.settings));
                }
                
                login(data.username);
                navigate("/");
            } else {
                // Get error message from backend
                const text = await response.text();
                setError(text || "Login failed. Check your credentials.");
            }
        } catch (err) {
            console.error("Login error:", err);
            setError("Unexpected error occurred.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-gray-900 text-white flex items-center justify-center px-4 pt-20">
            <form
                onSubmit={handleSubmit}
                className="bg-black bg-opacity-70 p-8 rounded-lg shadow-lg w-full max-w-md space-y-6"
            >
                <h1 className="text-2xl font-semibold text-center">Log In</h1>

                <div className="flex flex-col gap-2">
                    <label htmlFor="username" className="text-sm font-medium">Username</label>
                    <input
                        id="username"
                        type="text"
                        value={username}
                        onChange={(e) => setUsername(e.target.value)}
                        required
                        className="px-4 py-2 rounded bg-gray-800 text-white focus:outline-none focus:ring-2 focus:ring-yellow-500"
                    />
                </div>

                <div className="flex flex-col gap-2">
                    <label htmlFor="password" className="text-sm font-medium">Password</label>
                    <input
                        id="password"
                        type="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                        className="px-4 py-2 rounded bg-gray-800 text-white focus:outline-none focus:ring-2 focus:ring-yellow-500"
                    />
                </div>

                {error && (
                    <div className="text-red-400 text-sm -mt-3">{error}</div>
                )}

                <button
                    type="submit"
                    disabled={loading}
                    className={`btn-primary ${loading ? "bg-yellow-300 text-black cursor-not-allowed hover:bg-yellow-300" : ""}`}
                >
                    {loading && (
                        <svg
                            className="animate-spin h-5 w-5 text-black"
                            xmlns="http://www.w3.org/2000/svg"
                            fill="none"
                            viewBox="0 0 24 24"
                        >
                            <circle
                                className="opacity-25"
                                cx="12"
                                cy="12"
                                r="10"
                                stroke="currentColor"
                                strokeWidth="4"
                            />
                            <path
                                className="opacity-75"
                                fill="currentColor"
                                d="M4 12a8 8 0 018-8v4l3-3-3-3v4a8 8 0 100 16 8 8 0 010-16z"
                            />
                        </svg>
                    )}
                    {loading ? "Logging In..." : "Log In"}
                </button>
            </form>
        </div>
    );
}
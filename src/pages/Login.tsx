import { useState } from "react";
import * as React from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function Login() {
    const [email, setEmail] = useState("");
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
            await login(email, password);
            console.log("✅ Login successful, navigating to home");
            navigate("/");
        } catch (err: any) {
            console.error("Login error:", err);
            
            // Handle Firebase Auth errors
            let errorMessage = "Login failed. Please check your credentials.";
            if (err.code === 'auth/user-not-found') {
                errorMessage = "No account found with this email address.";
            } else if (err.code === 'auth/wrong-password') {
                errorMessage = "Incorrect password.";
            } else if (err.code === 'auth/invalid-email') {
                errorMessage = "Please enter a valid email address.";
            } else if (err.code === 'auth/user-disabled') {
                errorMessage = "This account has been disabled.";
            } else if (err.code === 'auth/too-many-requests') {
                errorMessage = "Too many login attempts. Please try again later.";
            } else if (err.message) {
                errorMessage = err.message;
            }
            
            setError(errorMessage);
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
                    <label htmlFor="email" className="text-sm font-medium">Email</label>
                    <input
                        id="email"
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
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
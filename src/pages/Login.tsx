import { useState } from "react";
import * as React from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function Login() {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);
    const { login, loginWithGoogle } = useAuth();
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
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4l3-3-3-3v4a8 8 0 100 16 8 8 0 010-16z" />
                        </svg>
                    )}
                    {loading ? "Logging In..." : "Log In"}
                </button>

                <div className="flex items-center gap-3">
                    <div className="flex-1 h-px bg-gray-700" />
                    <span className="text-gray-500 text-sm">or</span>
                    <div className="flex-1 h-px bg-gray-700" />
                </div>

                <button
                    type="button"
                    disabled={loading}
                    onClick={async () => {
                        setLoading(true);
                        setError("");
                        try {
                            await loginWithGoogle();
                            navigate("/");
                        } catch (err: any) {
                            if (err.code !== 'auth/popup-closed-by-user') {
                                setError("Google sign-in failed. Please try again.");
                            }
                        } finally {
                            setLoading(false);
                        }
                    }}
                    className="w-full flex items-center justify-center gap-3 bg-white text-gray-800 font-medium py-2 px-4 rounded hover:bg-gray-100 transition duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                    <svg className="h-5 w-5" viewBox="0 0 24 24">
                        <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                        <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                        <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z"/>
                        <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                    </svg>
                    Continue with Google
                </button>
            </form>
        </div>
    );
}
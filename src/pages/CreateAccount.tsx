import { useState } from "react";
import * as React from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function CreateAccount() {
    const [email, setEmail] = useState("");
    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [errors, setErrors] = useState<{ email?: string; username?: string; confirmPassword?: string }>({});
    const [loading, setLoading] = useState(false);
    const { register, loginWithGoogle } = useAuth();

    const navigate = useNavigate();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setErrors({});
        setLoading(true);

        const newErrors: typeof errors = {};

        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            newErrors.email = "Please enter a valid email address.";
        }

        if (password.length < 6) {
            newErrors.confirmPassword = "Password must be at least 6 characters long.";
        }

        if (password !== confirmPassword) {
            newErrors.confirmPassword = "Passwords do not match.";
        }

        if (!username.trim()) {
            newErrors.username = "Username is required.";
        }

        if (Object.keys(newErrors).length > 0) {
            setErrors(newErrors);
            setLoading(false);
            return;
        }

        try {
            if (!register) {
                throw new Error("Register function not available");
            }
            
            const user = await register(email, password, username);
            console.log("✅ Registration successful:", user.email);
            
            // Show success message and redirect
            navigate("/registration-success", { 
                state: { 
                    message: `Account created successfully! Please check your email (${email}) to verify your account before logging in.` 
                } 
            });
        } catch (err: any) {
            console.error("Registration error:", err);
            
            // Handle Firebase Auth errors
            let errorMessage = "Registration failed. Please try again.";
            if (err.code === 'auth/email-already-in-use') {
                errorMessage = "An account with this email already exists.";
                newErrors.email = errorMessage;
            } else if (err.code === 'auth/invalid-email') {
                errorMessage = "Please enter a valid email address.";
                newErrors.email = errorMessage;
            } else if (err.code === 'auth/weak-password') {
                errorMessage = "Password is too weak. Please choose a stronger password.";
                newErrors.confirmPassword = errorMessage;
            } else if (err.message) {
                newErrors.email = err.message;
            } else {
                newErrors.email = errorMessage;
            }
            
            setErrors(newErrors);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-gray-900 text-white flex items-center justify-center px-4 pt-20">
            <form
                onSubmit={handleSubmit}
                className="bg-black bg-opacity-70 p-6 rounded-lg shadow-lg w-full max-w-md space-y-4"
            >
                <h1 className="text-2xl font-semibold text-center">Create Your Account</h1>

                <div className="flex flex-col gap-1">
                    <label htmlFor="email" className="text-sm font-medium">Email</label>
                    <input
                        id="email"
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                        className="px-4 py-2 rounded bg-gray-800 text-white focus:outline-none focus:ring-2 focus:ring-yellow-500"
                    />
                    {errors.email && (
                        <div className="text-red-400 text-sm mt-1">{errors.email}</div>
                    )}
                </div>

                <div className="flex flex-col gap-1">
                    <label htmlFor="username" className="text-sm font-medium">Username</label>
                    <input
                        id="username"
                        type="text"
                        value={username}
                        onChange={(e) => setUsername(e.target.value)}
                        required
                        className="px-4 py-2 rounded bg-gray-800 text-white focus:outline-none focus:ring-2 focus:ring-yellow-500"
                    />
                    {errors.username && (
                        <div className="text-red-400 text-sm mt-1">{errors.username}</div>
                    )}
                </div>

                <div className="flex flex-col gap-1">
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

                <div className="flex flex-col gap-1">
                    <label htmlFor="confirmPassword" className="text-sm font-medium">Confirm Password</label>
                    <input
                        id="confirmPassword"
                        type="password"
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        required
                        className="px-4 py-2 rounded bg-gray-800 text-white focus:outline-none focus:ring-2 focus:ring-yellow-500"
                    />
                    {errors.confirmPassword && (
                        <div className="text-red-400 text-sm mt-1">{errors.confirmPassword}</div>
                    )}
                </div>

                <button
                    type="submit"
                    disabled={loading}
                    className={`w-full font-semibold py-2 px-4 rounded flex items-center justify-center gap-2 transition duration-200 ${
                        loading
                            ? "bg-yellow-300 text-black cursor-not-allowed"
                            : "bg-yellow-500 hover:bg-yellow-600 text-black"
                    }`}
                >
                    {loading && (
                        <svg className="animate-spin h-5 w-5 text-black" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4l3-3-3-3v4a8 8 0 100 16 8 8 0 010-16z" />
                        </svg>
                    )}
                    {loading ? "Creating Account..." : "Create Account"}
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
                        setErrors({});
                        try {
                            await loginWithGoogle();
                            navigate("/");
                        } catch (err: any) {
                            if (err.code !== 'auth/popup-closed-by-user') {
                                setErrors({ email: "Google sign-in failed. Please try again." });
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

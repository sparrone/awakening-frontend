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
    const { register } = useAuth();

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
        <div className="min-h-screen bg-gray-900 text-white flex items-center justify-center px-4">
            <form
                onSubmit={handleSubmit}
                className="bg-black bg-opacity-70 p-8 rounded-lg shadow-lg w-full max-w-md space-y-6"
            >
                <h1 className="text-2xl font-semibold text-center">Create Your Account</h1>

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
                    {errors.email && (
                        <div className="text-red-400 text-sm mt-1">{errors.email}</div>
                    )}
                </div>

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
                    {errors.username && (
                        <div className="text-red-400 text-sm mt-1">{errors.username}</div>
                    )}
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

                <div className="flex flex-col gap-2">
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
                    {loading ? "Creating Account..." : "Create Account"}
                </button>
            </form>
        </div>
    );
}

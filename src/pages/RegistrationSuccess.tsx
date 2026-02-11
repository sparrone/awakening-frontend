import { useLocation } from "react-router-dom";
import { useState } from "react";
import { auth } from "../lib/firebase";
import { sendEmailVerification } from "firebase/auth";

export default function RegistrationSuccess() {
    const location = useLocation();
    const message = location.state?.message || "Account created successfully.";
    const [resending, setResending] = useState(false);
    const [resendMessage, setResendMessage] = useState("");

    const handleResendEmail = async () => {
        const user = auth.currentUser;
        if (!user) {
            setResendMessage("❌ No user found. Please try creating account again.");
            return;
        }

        setResending(true);
        setResendMessage("");
        
        try {
            console.log("🔄 Manually resending email verification to:", user.email);
            await sendEmailVerification(user);
            console.log("✅ Manual email verification sent successfully");
            setResendMessage("✅ Verification email sent! Check your inbox and spam folder.");
        } catch (error: any) {
            console.error("❌ Manual email verification failed:", error);
            setResendMessage(`❌ Failed to send email: ${error.message}`);
        } finally {
            setResending(false);
        }
    };

    return (
        <div className="min-h-screen bg-gray-900 text-white flex items-center justify-center px-4">
            <div className="bg-black bg-opacity-70 p-8 rounded-lg shadow-lg w-full max-w-md text-center space-y-4">
                <h1 className="text-2xl font-bold mb-4">Account Created!</h1>
                <p className="text-sm text-gray-300">
                    {message}
                </p>
                
                <div className="pt-4">
                    <button
                        onClick={handleResendEmail}
                        disabled={resending}
                        className={`w-full font-semibold py-2 px-4 rounded transition duration-200 ${
                            resending
                                ? "bg-yellow-300 text-black cursor-not-allowed"
                                : "bg-yellow-500 hover:bg-yellow-600 text-black"
                        }`}
                    >
                        {resending ? "Sending..." : "Resend Verification Email"}
                    </button>
                    
                    {resendMessage && (
                        <p className="text-sm mt-2 text-gray-300">
                            {resendMessage}
                        </p>
                    )}
                </div>
                
                <div className="text-sm text-yellow-400 pt-2 border border-yellow-500 rounded p-3">
                    <p className="font-semibold">📧 Check your spam folder!</p>
                    <p className="text-xs text-gray-300 mt-1">Verification emails often end up in spam. The email may take a few minutes to arrive.</p>
                </div>
            </div>
        </div>
    );
}

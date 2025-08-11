import { Link } from "react-router-dom";

export default function EmailVerified() {
    return (
        <div className="min-h-screen bg-gray-900 text-white flex items-center justify-center px-4">
            <div className="bg-black bg-opacity-70 p-8 rounded-lg shadow-lg w-full max-w-md text-center space-y-6">
                <h1 className="text-2xl font-semibold text-green-400">Email Verified!</h1>
                <p className="text-lg">
                    Thank you for verifying your email. Your account is now active.
                </p>
                <Link
                    to="/login"
                    className="inline-block bg-yellow-500 hover:bg-yellow-600 text-black font-semibold py-2 px-4 rounded"
                >
                    Go to Login
                </Link>
            </div>
        </div>
    );
}

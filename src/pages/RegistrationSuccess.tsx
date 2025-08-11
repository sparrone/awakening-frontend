import { useLocation } from "react-router-dom";

export default function RegistrationSuccess() {
    const location = useLocation();
    const message = location.state?.message || "Account created successfully.";

    return (
        <div className="min-h-screen bg-gray-900 text-white flex items-center justify-center px-4">
            <div className="bg-black bg-opacity-70 p-8 rounded-lg shadow-lg w-full max-w-md text-center">
                <h1 className="text-2xl font-bold mb-4">Account Created!</h1>
                <p className="text-sm text-gray-300">
                    {message}
                </p>
            </div>
        </div>
    );
}

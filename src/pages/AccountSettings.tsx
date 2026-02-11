import { useState, useEffect } from "react";
import * as React from "react";
import { useAuth } from "../context/AuthContext";
import {
    getUserSettings,
    updateUserSettings,
    type UserSettings,
} from "../lib/firestore";
import { auth } from "../lib/firebase";
import {
    EmailAuthProvider,
    reauthenticateWithCredential,
    updatePassword,
    verifyBeforeUpdateEmail,
} from "firebase/auth";

interface PasswordFormData {
    currentPassword: string;
    newPassword: string;
    confirmPassword: string;
}

interface EmailFormData {
    currentPassword: string;
    newEmail: string;
}

export default function AccountSettings() {
    const { username, email, loading } = useAuth();

    // Show loading state while auth is checking
    if (loading) {
        return (
            <div className="min-h-screen bg-gray-900 text-white flex items-center justify-center pt-20">
                <div className="text-center">
                    <div className="w-8 h-8 bg-yellow-400 rounded-full animate-pulse mx-auto mb-4"></div>
                    <p>Loading account...</p>
                </div>
            </div>
        );
    }
    const [activeTab, setActiveTab] = useState('account');

    // Settings state
    const [settings, setSettings] = useState<UserSettings>({
        threadsPerPage: 10,
        postsPerPage: 10,
        profilePostsPerPage: 10
    });
    const [settingsLoading, setSettingsLoading] = useState(false);
    const [settingsSuccess, setSettingsSuccess] = useState("");
    const [settingsError, setSettingsError] = useState("");

    // Password change state
    const [passwordForm, setPasswordForm] = useState<PasswordFormData>({
        currentPassword: "",
        newPassword: "",
        confirmPassword: ""
    });
    const [passwordErrors, setPasswordErrors] = useState<{[key: string]: string}>({});
    const [passwordLoading, setPasswordLoading] = useState(false);
    const [passwordSuccess, setPasswordSuccess] = useState("");

    // Email change state
    const [emailForm, setEmailForm] = useState<EmailFormData>({
        currentPassword: "",
        newEmail: ""
    });
    const [emailErrors, setEmailErrors] = useState<{[key: string]: string}>({});
    const [emailLoading, setEmailLoading] = useState(false);
    const [emailSuccess, setEmailSuccess] = useState("");

    // Load settings on component mount and when switching to settings tab
    useEffect(() => {
        if (activeTab === 'forum') {
            loadSettings();
        }
    }, [activeTab]);

    const loadSettings = async () => {
        try {
            const userSettings = await getUserSettings();
            setSettings(userSettings);
            localStorage.setItem('userSettings', JSON.stringify(userSettings));
        } catch (err) {
            console.error("Failed to load settings:", err);
        }
    };

    const handleSettingsSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setSettingsLoading(true);
        setSettingsSuccess("");
        setSettingsError("");

        try {
            const updatedSettings = await updateUserSettings(settings);
            setSettings(updatedSettings);
            localStorage.setItem('userSettings', JSON.stringify(updatedSettings));
            setSettingsSuccess("Settings updated successfully!");
            setTimeout(() => setSettingsSuccess(""), 3000);
        } catch (err) {
            setSettingsError("Failed to update settings");
        } finally {
            setSettingsLoading(false);
        }
    };

    const refreshSettings = async () => {
        setSettingsLoading(true);
        setSettingsSuccess("");
        setSettingsError("");

        try {
            await loadSettings();
            setSettingsSuccess("Settings refreshed!");
            setTimeout(() => setSettingsSuccess(""), 3000);
        } catch (err) {
            setSettingsError("Failed to refresh settings");
        } finally {
            setSettingsLoading(false);
        }
    };

    const reauthenticate = async (currentPassword: string) => {
        const user = auth.currentUser;
        if (!user || !user.email) throw new Error("Not authenticated");
        const credential = EmailAuthProvider.credential(user.email, currentPassword);
        await reauthenticateWithCredential(user, credential);
    };

    const handlePasswordSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setPasswordErrors({});
        setPasswordSuccess("");
        setPasswordLoading(true);

        const newErrors: {[key: string]: string} = {};

        if (passwordForm.newPassword.length < 8 ||
            !/[A-Z]/.test(passwordForm.newPassword) ||
            !/[0-9]/.test(passwordForm.newPassword)) {
            newErrors.newPassword = "Password must be at least 8 characters long, include an uppercase letter and a number.";
        }

        if (passwordForm.newPassword !== passwordForm.confirmPassword) {
            newErrors.confirmPassword = "Passwords do not match.";
        }

        if (Object.keys(newErrors).length > 0) {
            setPasswordErrors(newErrors);
            setPasswordLoading(false);
            return;
        }

        try {
            await reauthenticate(passwordForm.currentPassword);
            await updatePassword(auth.currentUser!, passwordForm.newPassword);
            setPasswordSuccess("Password updated successfully!");
            setPasswordForm({
                currentPassword: "",
                newPassword: "",
                confirmPassword: ""
            });
        } catch (err: any) {
            if (err.code === 'auth/wrong-password' || err.code === 'auth/invalid-credential') {
                setPasswordErrors({ general: "Current password is incorrect." });
            } else {
                setPasswordErrors({ general: err.message || "Unexpected error occurred." });
            }
        } finally {
            setPasswordLoading(false);
        }
    };

    const handleEmailSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setEmailErrors({});
        setEmailSuccess("");
        setEmailLoading(true);

        const newErrors: {[key: string]: string} = {};

        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(emailForm.newEmail)) {
            newErrors.newEmail = "Please enter a valid email address.";
        }

        if (Object.keys(newErrors).length > 0) {
            setEmailErrors(newErrors);
            setEmailLoading(false);
            return;
        }

        try {
            await reauthenticate(emailForm.currentPassword);
            await verifyBeforeUpdateEmail(auth.currentUser!, emailForm.newEmail);
            setEmailSuccess("Verification email sent to your new address. Please check your inbox.");
            setEmailForm({
                currentPassword: "",
                newEmail: ""
            });
        } catch (err: any) {
            if (err.code === 'auth/wrong-password' || err.code === 'auth/invalid-credential') {
                setEmailErrors({ general: "Current password is incorrect." });
            } else {
                setEmailErrors({ general: err.message || "Unexpected error occurred." });
            }
        } finally {
            setEmailLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-gray-900 text-white pt-20 px-4">
            <div className="max-w-4xl mx-auto">
                <h1 className="text-3xl font-bold mb-8">Settings</h1>

                {/* User Info Section */}
                <div className="bg-black bg-opacity-70 p-6 rounded-lg shadow-lg mb-8">
                    <h2 className="text-xl font-semibold mb-4">Account Information</h2>
                    <div className="space-y-2 text-gray-300">
                        <p><span className="font-medium text-white">Username:</span> {username}</p>
                        <p><span className="font-medium text-white">Current Email:</span> {email}</p>
                    </div>
                </div>

                {/* Minimal Filing Cabinet Style Tabs */}
                <div className="relative mb-8">
                    {/* Tab Headers */}
                    <div className="flex space-x-1 mb-0">
                        <button
                            onClick={() => setActiveTab('account')}
                            className={`px-6 py-3 text-sm font-medium transition-all duration-200 rounded-t-lg ${
                                activeTab === 'account'
                                    ? 'bg-gray-800 bg-opacity-90 text-yellow-400 translate-y-0'
                                    : 'bg-gray-700 bg-opacity-60 text-gray-400 hover:text-gray-300 hover:bg-gray-600 hover:bg-opacity-70 translate-y-1'
                            }`}
                        >
                            Account Settings
                        </button>
                        <button
                            onClick={() => setActiveTab('forum')}
                            className={`px-6 py-3 text-sm font-medium transition-all duration-200 rounded-t-lg ${
                                activeTab === 'forum'
                                    ? 'bg-gray-800 bg-opacity-90 text-yellow-400 translate-y-0'
                                    : 'bg-gray-700 bg-opacity-60 text-gray-400 hover:text-gray-300 hover:bg-gray-600 hover:bg-opacity-70 translate-y-1'
                            }`}
                        >
                            Forum Settings
                        </button>
                    </div>

                    {/* Tab Content */}
                    <div className="bg-gray-800 bg-opacity-90 rounded-lg rounded-tl-none shadow-xl p-8">
                        {activeTab === 'account' && (
                            <div className="grid md:grid-cols-2 gap-8">
                                {/* Change Password Form */}
                                <div className="bg-black bg-opacity-70 p-6 rounded-lg shadow-lg">
                        <h2 className="text-xl font-semibold mb-6">Change Password</h2>

                        <form onSubmit={handlePasswordSubmit} className="space-y-4">
                            <div className="flex flex-col gap-2">
                                <label htmlFor="currentPassword" className="text-sm font-medium">
                                    Current Password
                                </label>
                                <input
                                    id="currentPassword"
                                    type="password"
                                    value={passwordForm.currentPassword}
                                    onChange={(e) => setPasswordForm(prev => ({
                                        ...prev,
                                        currentPassword: e.target.value
                                    }))}
                                    required
                                    className="px-4 py-2 rounded bg-gray-800 text-white focus:outline-none focus:ring-2 focus:ring-yellow-500"
                                />
                            </div>

                            <div className="flex flex-col gap-2">
                                <label htmlFor="newPassword" className="text-sm font-medium">
                                    New Password
                                </label>
                                <input
                                    id="newPassword"
                                    type="password"
                                    value={passwordForm.newPassword}
                                    onChange={(e) => setPasswordForm(prev => ({
                                        ...prev,
                                        newPassword: e.target.value
                                    }))}
                                    required
                                    className="px-4 py-2 rounded bg-gray-800 text-white focus:outline-none focus:ring-2 focus:ring-yellow-500"
                                />
                                {passwordErrors.newPassword && (
                                    <div className="text-red-400 text-sm">{passwordErrors.newPassword}</div>
                                )}
                            </div>

                            <div className="flex flex-col gap-2">
                                <label htmlFor="confirmNewPassword" className="text-sm font-medium">
                                    Confirm New Password
                                </label>
                                <input
                                    id="confirmNewPassword"
                                    type="password"
                                    value={passwordForm.confirmPassword}
                                    onChange={(e) => setPasswordForm(prev => ({
                                        ...prev,
                                        confirmPassword: e.target.value
                                    }))}
                                    required
                                    className="px-4 py-2 rounded bg-gray-800 text-white focus:outline-none focus:ring-2 focus:ring-yellow-500"
                                />
                                {passwordErrors.confirmPassword && (
                                    <div className="text-red-400 text-sm">{passwordErrors.confirmPassword}</div>
                                )}
                            </div>

                            {passwordErrors.general && (
                                <div className="text-red-400 text-sm">{passwordErrors.general}</div>
                            )}

                            {passwordSuccess && (
                                <div className="text-green-400 text-sm">{passwordSuccess}</div>
                            )}

                            <button
                                type="submit"
                                disabled={passwordLoading}
                                className={`btn-primary ${passwordLoading ? "bg-yellow-300 text-black cursor-not-allowed hover:bg-yellow-300" : ""}`}
                            >
                                {passwordLoading && (
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
                                {passwordLoading ? "Updating Password..." : "Update Password"}
                            </button>
                        </form>
                    </div>

                    {/* Change Email Form */}
                    <div className="bg-black bg-opacity-70 p-6 rounded-lg shadow-lg">
                        <h2 className="text-xl font-semibold mb-6">Change Email</h2>

                        <form onSubmit={handleEmailSubmit} className="space-y-4">
                            <div className="flex flex-col gap-2">
                                <label htmlFor="emailCurrentPassword" className="text-sm font-medium">
                                    Current Password
                                </label>
                                <input
                                    id="emailCurrentPassword"
                                    type="password"
                                    value={emailForm.currentPassword}
                                    onChange={(e) => setEmailForm(prev => ({
                                        ...prev,
                                        currentPassword: e.target.value
                                    }))}
                                    required
                                    className="px-4 py-2 rounded bg-gray-800 text-white focus:outline-none focus:ring-2 focus:ring-yellow-500"
                                />
                            </div>

                            <div className="flex flex-col gap-2">
                                <label htmlFor="newEmail" className="text-sm font-medium">
                                    New Email Address
                                </label>
                                <input
                                    id="newEmail"
                                    type="email"
                                    value={emailForm.newEmail}
                                    onChange={(e) => setEmailForm(prev => ({
                                        ...prev,
                                        newEmail: e.target.value
                                    }))}
                                    required
                                    className="px-4 py-2 rounded bg-gray-800 text-white focus:outline-none focus:ring-2 focus:ring-yellow-500"
                                />
                                {emailErrors.newEmail && (
                                    <div className="text-red-400 text-sm">{emailErrors.newEmail}</div>
                                )}
                            </div>

                            {emailErrors.general && (
                                <div className="text-red-400 text-sm">{emailErrors.general}</div>
                            )}

                            {emailSuccess && (
                                <div className="text-green-400 text-sm">{emailSuccess}</div>
                            )}

                            <button
                                type="submit"
                                disabled={emailLoading}
                                className={`btn-primary ${emailLoading ? "bg-yellow-300 text-black cursor-not-allowed hover:bg-yellow-300" : ""}`}
                            >
                                {emailLoading && (
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
                                {emailLoading ? "Updating Email..." : "Update Email"}
                            </button>
                        </form>

                        <div className="mt-4 p-3 bg-gray-800 rounded text-sm text-gray-300">
                            <p className="font-medium text-yellow-400 mb-1">Note:</p>
                            <p>You'll receive a verification link at your new email address. Your email won't be changed until you verify it.</p>
                        </div>
                                </div>
                            </div>
                        )}

                        {activeTab === 'forum' && (
                            <div>
                                <div className="flex justify-between items-center mb-6">
                                    <h2 className="text-2xl font-semibold text-yellow-400">
                                        Forum Settings
                                    </h2>
                                    <button
                                        onClick={refreshSettings}
                                        disabled={settingsLoading}
                                        className="px-4 py-2 text-sm bg-gray-700 hover:bg-gray-600 text-white rounded transition-colors disabled:opacity-50"
                                    >
                                        {settingsLoading ? "Refreshing..." : "Refresh Settings"}
                                    </button>
                                </div>

                                <form onSubmit={handleSettingsSubmit} className="space-y-6">
                                    <div className="grid md:grid-cols-3 gap-6">
                                        {/* Threads per page */}
                                        <div className="flex flex-col gap-2">
                                            <label htmlFor="threadsPerPage" className="text-sm font-medium text-white">
                                                Threads per Category Page
                                            </label>
                                            <select
                                                id="threadsPerPage"
                                                value={settings.threadsPerPage}
                                                onChange={(e) => setSettings(prev => ({
                                                    ...prev,
                                                    threadsPerPage: parseInt(e.target.value)
                                                }))}
                                                className="px-4 py-2 rounded bg-gray-700 text-white focus:outline-none focus:ring-2 focus:ring-yellow-500"
                                            >
                                                <option value={5}>5</option>
                                                <option value={10}>10</option>
                                                <option value={15}>15</option>
                                                <option value={20}>20</option>
                                                <option value={25}>25</option>
                                                <option value={30}>30</option>
                                                <option value={40}>40</option>
                                                <option value={50}>50</option>
                                            </select>
                                            <p className="text-xs text-gray-400">
                                                How many threads to show when browsing categories
                                            </p>
                                        </div>

                                        {/* Posts per thread page */}
                                        <div className="flex flex-col gap-2">
                                            <label htmlFor="postsPerPage" className="text-sm font-medium text-white">
                                                Posts per Thread Page
                                            </label>
                                            <select
                                                id="postsPerPage"
                                                value={settings.postsPerPage}
                                                onChange={(e) => setSettings(prev => ({
                                                    ...prev,
                                                    postsPerPage: parseInt(e.target.value)
                                                }))}
                                                className="px-4 py-2 rounded bg-gray-700 text-white focus:outline-none focus:ring-2 focus:ring-yellow-500"
                                            >
                                                <option value={5}>5</option>
                                                <option value={10}>10</option>
                                                <option value={15}>15</option>
                                                <option value={20}>20</option>
                                                <option value={25}>25</option>
                                            </select>
                                            <p className="text-xs text-gray-400">
                                                How many posts to show per page in threads
                                            </p>
                                        </div>

                                        {/* Posts per profile page */}
                                        <div className="flex flex-col gap-2">
                                            <label htmlFor="profilePostsPerPage" className="text-sm font-medium text-white">
                                                Posts per Profile Page
                                            </label>
                                            <select
                                                id="profilePostsPerPage"
                                                value={settings.profilePostsPerPage}
                                                onChange={(e) => setSettings(prev => ({
                                                    ...prev,
                                                    profilePostsPerPage: parseInt(e.target.value)
                                                }))}
                                                className="px-4 py-2 rounded bg-gray-700 text-white focus:outline-none focus:ring-2 focus:ring-yellow-500"
                                            >
                                                <option value={5}>5</option>
                                                <option value={10}>10</option>
                                                <option value={15}>15</option>
                                                <option value={20}>20</option>
                                                <option value={25}>25</option>
                                            </select>
                                            <p className="text-xs text-gray-400">
                                                How many posts to show per page on user profiles
                                            </p>
                                        </div>
                                    </div>

                                    {settingsError && (
                                        <div className="text-red-400 text-sm">{settingsError}</div>
                                    )}

                                    {settingsSuccess && (
                                        <div className="text-green-400 text-sm">{settingsSuccess}</div>
                                    )}

                                    <button
                                        type="submit"
                                        disabled={settingsLoading}
                                        className={`btn-primary ${settingsLoading ? "bg-yellow-300 text-black cursor-not-allowed hover:bg-yellow-300" : ""}`}
                                    >
                                        {settingsLoading ? "Saving..." : "Save Settings"}
                                    </button>
                                </form>

                                <div className="mt-6 p-4 bg-gray-700 rounded text-sm text-gray-300">
                                    <p className="font-medium text-yellow-400 mb-2">Note:</p>
                                    <ul className="space-y-1 list-disc list-inside">
                                        <li>These settings control how many items you see per page across the forum</li>
                                        <li>Changes apply immediately to your browsing experience</li>
                                        <li>Use "Refresh Settings" to sync with latest settings if using multiple devices</li>
                                    </ul>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}

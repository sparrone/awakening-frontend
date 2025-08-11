import React, { useEffect, useState } from "react";
import { AuthContext, type AuthContextType } from "./AuthContext";

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
    const [isLoggedIn, setIsLoggedIn] = useState(false);
    const [username, setUsername] = useState("");
    const [email, setEmail] = useState("");
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const checkSession = async () => {
            console.log("🔍 Checking session...");

            try {
                const res = await fetch("/api/me", {
                    method: "GET",
                    credentials: "include",
                });

                console.log("📡 Response from /api/me:", res.status);

                if (res.ok) {
                    const data = await res.json();
                    console.log("✅ Session valid. Logged in as:", data.username);
                    setUsername(data.username);
                    setEmail(data.email);
                    setIsLoggedIn(true);
                } else {
                    console.log("🚫 No valid session found.");
                    setIsLoggedIn(false);
                    setUsername("");
                    setEmail("");
                }
            } catch (err) {
                console.error("⚠️ Session check failed:", err);
                setIsLoggedIn(false);
                setUsername("");
                setEmail("");
            } finally {
                console.log("🔄 Finished session check. Setting loading to false.");
                setLoading(false);
            }
        };

        checkSession();
    }, []);

    const login = (username: string) => {
        console.log("👤 Login called. Setting username:", username);

        // Optimistic update only — trust backend set cookie
        // Note: We'll need to fetch user data after login to get email
        setIsLoggedIn(true);
        setUsername(username);

        // Fetch complete user data including email after login
        fetchUserData();
    };

    const fetchUserData = async () => {
        try {
            const res = await fetch("/api/me", {
                method: "GET",
                credentials: "include",
            });

            if (res.ok) {
                const data = await res.json();
                setEmail(data.email);
            }
        } catch (err) {
            console.error("⚠️ Failed to fetch user data after login:", err);
        }
    };

    const logout = async () => {
        console.log("👋 Logout called.");

        try {
            const res = await fetch("/api/auth/logout", {
                method: "POST",
                credentials: "include",
            });

            if (res.ok) {
                console.log("✅ Session successfully invalidated on backend.");
            } else {
                console.warn("⚠️ Logout request sent, but server responded with:", res.status);
            }
        } catch (err) {
            console.error("❌ Logout request failed:", err);
        }

        setIsLoggedIn(false);
        setUsername("");
        setEmail("");
        
        // Clear cached settings
        localStorage.removeItem('userSettings');
    };

    const value: AuthContextType = {
        isLoggedIn,
        username,
        email,
        loading,
        login,
        logout,
    };

    return (
        <AuthContext.Provider value={value}>
            {!loading && children}
        </AuthContext.Provider>
    );
};
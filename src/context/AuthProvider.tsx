import React from "react";
import { AuthContext, type AuthContextType } from "./AuthContext";
import { useFirebaseAuth } from "../hooks/useFirebaseAuth";
import { setupUserProfile } from "../lib/firestore";

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
    const {
        user,
        loading,
        login: firebaseLogin,
        register: firebaseRegister,
        logout: firebaseLogout,
        getIdToken,
        isAuthenticated
    } = useFirebaseAuth();

    const login = async (email: string, password: string) => {
        console.log("Login called for email:", email);

        try {
            const user = await firebaseLogin(email, password);
            console.log("Firebase login successful for:", user.email);

            // Ensure user profile exists in Firestore
            await setupUserProfile(user.displayName || "");

            return user;
        } catch (error) {
            console.error("Firebase login failed:", error);
            throw error;
        }
    };

    const register = async (email: string, password: string, username: string) => {
        console.log("Register called for email:", email);

        try {
            const user = await firebaseRegister(email, password, username);
            console.log("Firebase registration successful for:", user.email);

            // Create user profile in Firestore
            await setupUserProfile(username);

            return user;
        } catch (error) {
            console.error("Firebase registration failed:", error);
            throw error;
        }
    };

    const logout = async () => {
        console.log("Logout called.");

        try {
            await firebaseLogout();
            console.log("Firebase logout successful");
        } catch (error) {
            console.error("Firebase logout failed:", error);
        }

        // Clear cached settings
        localStorage.removeItem('userSettings');
    };

    const value: AuthContextType = {
        isLoggedIn: isAuthenticated,
        username: user?.displayName || "",
        email: user?.email || "",
        loading,
        login,
        logout,
        register,
        getIdToken
    };

    return (
        <AuthContext.Provider value={value}>
            {children}
        </AuthContext.Provider>
    );
};

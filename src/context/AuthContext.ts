// src/context/AuthContext.ts
import { createContext, useContext } from "react";

export interface AuthContextType {
    isLoggedIn: boolean;
    username: string;
    email: string;
    loading: boolean;
    login: (username: string) => void;
    logout: () => void;
}

// Initial dummy context (overridden in AuthProvider)
export const AuthContext = createContext<AuthContextType>({
    isLoggedIn: false,
    username: "",
    email: "",
    loading: true,
    login: () => {},
    logout: () => {},
});

export const useAuth = () => useContext(AuthContext);
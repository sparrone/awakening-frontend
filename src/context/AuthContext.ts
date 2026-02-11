// src/context/AuthContext.ts
import { createContext, useContext } from "react";

export interface AuthContextType {
    isLoggedIn: boolean;
    username: string;
    email: string;
    loading: boolean;
    login: (email: string, password: string) => Promise<any>;
    logout: () => Promise<void>;
    register?: (email: string, password: string, username: string) => Promise<any>;
    getIdToken?: () => Promise<string | null>;
}

// Initial dummy context (overridden in AuthProvider)
export const AuthContext = createContext<AuthContextType>({
    isLoggedIn: false,
    username: "",
    email: "",
    loading: true,
    login: async () => {},
    logout: async () => {},
});

export const useAuth = () => useContext(AuthContext);
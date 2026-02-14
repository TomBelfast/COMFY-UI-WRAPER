"use client";

import React, { createContext, useContext, useState, useEffect, useCallback } from "react";
import {
    AuthUser,
    login as apiLogin,
    register as apiRegister,
    fetchMe,
    setToken,
    clearToken,
    getToken,
} from "@/lib/api";

interface AuthContextType {
    user: AuthUser | null;
    loading: boolean;
    login: (username: string, password: string) => Promise<void>;
    register: (username: string, password: string, displayName?: string) => Promise<void>;
    logout: () => void;
}

const AuthContext = createContext<AuthContextType>({
    user: null,
    loading: true,
    login: async () => {},
    register: async () => {},
    logout: () => {},
});

export const useAuth = () => useContext(AuthContext);

export default function AuthProvider({ children }: { children: React.ReactNode }) {
    const [user, setUser] = useState<AuthUser | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        // On mount: check if user is authenticated (Tailscale headers or JWT)
        fetchMe()
            .then((u) => {
                setUser(u);
            })
            .catch(() => {
                setUser(null);
            })
            .finally(() => {
                setLoading(false);
            });
    }, []);

    const login = useCallback(async (username: string, password: string) => {
        const result = await apiLogin(username, password);
        setToken(result.token);
        setUser(result.user);
    }, []);

    const register = useCallback(async (username: string, password: string, displayName?: string) => {
        const result = await apiRegister(username, password, displayName);
        setToken(result.token);
        setUser(result.user);
    }, []);

    const logout = useCallback(() => {
        clearToken();
        setUser(null);
    }, []);

    return (
        <AuthContext.Provider value={{ user, loading, login, register, logout }}>
            {children}
        </AuthContext.Provider>
    );
}

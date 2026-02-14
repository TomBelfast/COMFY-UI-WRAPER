"use client";

import { useState } from "react";
import { useAuth } from "@/components/AuthProvider";
import { useRouter } from "next/navigation";

export default function LoginPage() {
    const { login, register, user } = useAuth();
    const router = useRouter();
    const [isRegister, setIsRegister] = useState(false);
    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");
    const [displayName, setDisplayName] = useState("");
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);

    // If already logged in, redirect
    if (user) {
        router.replace("/");
        return null;
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError("");
        setLoading(true);

        try {
            if (isRegister) {
                await register(username, password, displayName || undefined);
            } else {
                await login(username, password);
            }
            router.replace("/");
        } catch (err: any) {
            setError(err.message || "Authentication failed");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center p-4">
            <div className="glass-card p-8 w-full max-w-md">
                <div className="text-center mb-8">
                    <h1 className="text-2xl font-bold text-white mb-2">ComfyUI Wrapper</h1>
                    <p className="text-[10px] font-black uppercase tracking-[0.3em] text-emerald-500/70">
                        {isRegister ? "Create Account" : "Sign In"}
                    </p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="text-label !tracking-widest !text-[9px] mb-1.5 block text-white/50">
                            Username
                        </label>
                        <input
                            type="text"
                            value={username}
                            onChange={(e) => setUsername(e.target.value)}
                            className="w-full px-4 py-2.5 bg-white/5 border border-white/10 rounded-lg text-white placeholder-white/20 focus:outline-none focus:border-emerald-500/50 transition-colors"
                            placeholder="Enter username"
                            required
                            autoFocus
                        />
                    </div>

                    <div>
                        <label className="text-label !tracking-widest !text-[9px] mb-1.5 block text-white/50">
                            Password
                        </label>
                        <input
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            className="w-full px-4 py-2.5 bg-white/5 border border-white/10 rounded-lg text-white placeholder-white/20 focus:outline-none focus:border-emerald-500/50 transition-colors"
                            placeholder="Enter password"
                            required
                        />
                    </div>

                    {isRegister && (
                        <div>
                            <label className="text-label !tracking-widest !text-[9px] mb-1.5 block text-white/50">
                                Display Name
                            </label>
                            <input
                                type="text"
                                value={displayName}
                                onChange={(e) => setDisplayName(e.target.value)}
                                className="w-full px-4 py-2.5 bg-white/5 border border-white/10 rounded-lg text-white placeholder-white/20 focus:outline-none focus:border-emerald-500/50 transition-colors"
                                placeholder="How should we call you?"
                            />
                        </div>
                    )}

                    {error && (
                        <div className="px-4 py-2 bg-red-500/10 border border-red-500/30 rounded-lg">
                            <span className="text-xs text-red-400">{error}</span>
                        </div>
                    )}

                    <button
                        type="submit"
                        disabled={loading}
                        className={`w-full py-2.5 rounded-lg font-bold text-sm uppercase tracking-widest transition-all ${
                            loading
                                ? "bg-emerald-500/20 text-emerald-500/50 cursor-not-allowed"
                                : "bg-emerald-500/20 border border-emerald-500/30 text-emerald-400 hover:bg-emerald-500/30 hover:border-emerald-500/60 shadow-[0_0_15px_rgba(16,185,129,0.1)]"
                        }`}
                    >
                        {loading ? (
                            <span className="flex items-center justify-center gap-2">
                                <div className="w-4 h-4 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin" />
                                Processing
                            </span>
                        ) : isRegister ? (
                            "Create Account"
                        ) : (
                            "Sign In"
                        )}
                    </button>
                </form>

                <div className="mt-6 text-center">
                    <button
                        onClick={() => {
                            setIsRegister(!isRegister);
                            setError("");
                        }}
                        className="text-xs text-white/40 hover:text-emerald-400 transition-colors"
                    >
                        {isRegister
                            ? "Already have an account? Sign in"
                            : "No account? Create one"}
                    </button>
                </div>
            </div>
        </div>
    );
}

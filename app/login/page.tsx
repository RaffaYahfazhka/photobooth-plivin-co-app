"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Mail, Lock, Eye, EyeOff, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { createClient } from "@/lib/supabase/client";

export default function LoginPage() {
    const router = useRouter();
    const [showPassword, setShowPassword] = useState(false);
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setError("");
        setLoading(true);

        try {
            const supabase = createClient();

            const { error } = await supabase.auth.signInWithPassword({
                email,
                password,
            });

            if (error) {
                setError(error.message === "Invalid login credentials"
                    ? "Email atau password salah. Coba lagi ya!"
                    : error.message
                );
                setLoading(false);
                return;
            }

            router.push("/dashboard");
            router.refresh();
        } catch (err) {
            setError("Terjadi kesalahan. Coba lagi nanti.");
            setLoading(false);
        }
    };

    const handleGoogleLogin = async () => {
        const supabase = createClient();
        await supabase.auth.signInWithOAuth({
            provider: "google",
            options: {
                redirectTo: `${window.location.origin}/auth/callback`,
                queryParams: {
                    prompt: 'select_account', // Memastikan user bisa memilih akun jika ada banyak, tapi tetap mulus jika cuma satu
                    access_type: 'offline',
                }
            },
        });
    };

    return (
        <div className="wave-bg-light dark:wave-bg-dark flex flex-col min-h-screen relative overflow-hidden">
            {/* Background Decoration (Subtle Gradient) */}
            <div className="absolute inset-0 z-0 opacity-40">
                <div className="absolute top-[-10%] left-[-10%] w-64 h-64 bg-primary/10 rounded-full blur-3xl animate-pulse"></div>
                <div className="absolute bottom-[-10%] right-[-10%] w-64 h-64 bg-primary/5 rounded-full blur-3xl animate-pulse delay-1000"></div>
            </div>

            <div className="relative z-10 flex-1 flex flex-col w-full max-w-md mx-auto">
                {/* Header / Logo Area */}
                <header className="flex items-center justify-center pt-16 pb-8">
                    <div className="flex items-center gap-2 text-primary dark:text-white">
                        <div className="size-8 bg-primary dark:bg-indigo-600 rounded-full flex items-center justify-center shadow-sm">
                            <svg className="size-5 text-white" fill="none" viewBox="0 0 48 48" xmlns="http://www.w3.org/2000/svg">
                                <path d="M8.57829 8.57829C5.52816 11.6284 3.451 15.5145 2.60947 19.7452C1.76794 23.9758 2.19984 28.361 3.85056 32.3462C5.50128 36.3314 8.29667 39.7376 11.8832 42.134C15.4698 44.5305 19.6865 45.8096 24 45.8096C28.3135 45.8096 32.5302 44.5305 36.1168 42.134C39.7033 39.7375 42.4987 36.3314 44.1494 32.3462C45.8002 28.361 46.2321 23.9758 45.3905 19.7452C44.549 15.5145 42.4718 11.6284 39.4217 8.57829L24 24L8.57829 8.57829Z" fill="currentColor"></path>
                            </svg>
                        </div>
                        <h2 className="text-2xl font-bold leading-tight tracking-tight">plivin.co</h2>
                    </div>
                </header>

                {/* Hero Illustration / Image Area */}
                <div className="px-8 pb-4">
                    <div className="w-full aspect-video bg-primary/5 dark:bg-primary/20 rounded-xl overflow-hidden relative backdrop-blur-sm">
                        <div className="absolute inset-0 flex items-center justify-center p-6">
                            <div className="w-full h-full bg-gradient-to-br from-zinc-200 to-zinc-400 dark:from-zinc-700 dark:to-zinc-900 rounded-lg shadow-inner flex flex-col justify-end p-4">
                                <div className="w-1/2 h-2 bg-white/30 rounded-full mb-2"></div>
                                <div className="w-2/3 h-2 bg-white/30 rounded-full"></div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Content Body */}
                <main className="flex-1 px-8 py-6">
                    <div className="mb-8 text-center">
                        <h1 className="text-3xl font-bold text-slate-900 dark:text-white mb-2">Welcome Back</h1>
                        <p className="text-slate-500 dark:text-slate-400 text-sm">Log in to manage your finances and track your growth.</p>
                    </div>

                    {/* Error Message */}
                    {error && (
                        <div className="mb-4 p-3 rounded-xl bg-rose-50 dark:bg-rose-900/20 border border-rose-200 dark:border-rose-800/50 text-rose-600 dark:text-rose-400 text-sm text-center font-medium">
                            {error}
                        </div>
                    )}

                    <form className="space-y-5" onSubmit={handleLogin}>
                        {/* Email Field */}
                        <div className="space-y-2">
                            <Label className="text-sm font-semibold text-slate-700 dark:text-slate-300 ml-1">Email</Label>
                            <div className="relative">
                                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 w-5 h-5 pointer-events-none" />
                                <Input
                                    type="email"
                                    placeholder="hello@example.com"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    className="w-full pl-12 pr-4 h-14 rounded-full border border-slate-200/50 dark:border-zinc-700/50 bg-white/70 dark:bg-zinc-800/70 backdrop-blur-md focus-visible:ring-primary/20 focus-visible:border-primary transition-all text-slate-900 dark:text-white text-base shadow-sm"
                                    required
                                    disabled={loading}
                                />
                            </div>
                        </div>

                        {/* Password Field */}
                        <div className="space-y-2">
                            <Label className="text-sm font-semibold text-slate-700 dark:text-slate-300 ml-1">Password</Label>
                            <div className="relative">
                                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 w-5 h-5 pointer-events-none" />
                                <Input
                                    type={showPassword ? "text" : "password"}
                                    placeholder="••••••••"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    className="w-full pl-12 pr-12 h-14 rounded-full border border-slate-200/50 dark:border-zinc-700/50 bg-white/70 dark:bg-zinc-800/70 backdrop-blur-md focus-visible:ring-primary/20 focus-visible:border-primary transition-all text-slate-900 dark:text-white text-base shadow-sm"
                                    required
                                    disabled={loading}
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 focus:outline-none"
                                >
                                    {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                                </button>
                            </div>
                        </div>

                        {/* Utilities */}
                        <div className="flex items-center justify-between px-1">
                            <div className="flex items-center space-x-2">
                                <Checkbox id="remember" className="rounded-md border-slate-300 dark:border-zinc-600 data-[state=checked]:bg-primary data-[state=checked]:border-primary" />
                                <label
                                    htmlFor="remember"
                                    className="text-sm font-medium leading-none text-slate-600 dark:text-slate-400 peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer hover:text-primary transition-colors"
                                >
                                    Remember me
                                </label>
                            </div>
                            <Link href="#" className="text-sm font-semibold text-primary dark:text-slate-300 hover:underline">
                                Forgot Password?
                            </Link>
                        </div>

                        {/* Primary Login Button */}
                        <Button
                            type="submit"
                            disabled={loading}
                            className="w-full bg-primary hover:bg-primary/90 dark:bg-indigo-600 dark:hover:bg-indigo-500 text-white font-bold h-14 rounded-full transition-all shadow-lg shadow-primary/10 dark:shadow-none mt-4 text-base disabled:opacity-70"
                        >
                            {loading ? (
                                <>
                                    <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                                    Memproses...
                                </>
                            ) : (
                                "Login"
                            )}
                        </Button>

                        {/* Divider */}
                        <div className="relative flex items-center py-4">
                            <div className="flex-grow border-t border-slate-300 dark:border-zinc-700"></div>
                            <span className="flex-shrink mx-4 text-xs font-medium text-slate-500 uppercase tracking-widest">or continue with</span>
                            <div className="flex-grow border-t border-slate-300 dark:border-zinc-700"></div>
                        </div>

                        {/* Google Login Button */}
                        <Button
                            type="button"
                            variant="outline"
                            onClick={handleGoogleLogin}
                            disabled={loading}
                            className="w-full flex items-center justify-center gap-3 border-slate-200 dark:border-zinc-700/80 bg-white/70 dark:bg-zinc-900/60 backdrop-blur-md text-slate-700 dark:text-slate-200 font-bold h-14 rounded-full hover:bg-slate-50 dark:hover:bg-zinc-800 transition-colors text-base shadow-sm dark:shadow-none"
                        >
                            <svg className="w-5 h-5" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"></path>
                                <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"></path>
                                <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"></path>
                                <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"></path>
                            </svg>
                            Login with Google
                        </Button>
                    </form>
                </main>

                {/* Footer */}
                <footer className="p-8 pb-12 text-center mt-auto">
                    <p className="text-sm text-slate-500 dark:text-slate-400">
                        Don't have an account?{" "}
                        <Link href="/signup" className="font-bold text-primary dark:text-white hover:underline">
                            Sign up for free
                        </Link>
                    </p>
                </footer>
            </div>
        </div>
    );
}

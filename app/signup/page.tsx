"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { User, Mail, Lock, Eye, EyeOff, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { createClient } from "@/lib/supabase/client";
import { Logo, LogoText } from "@/components/Logo";

export default function SignUpPage() {
    const router = useRouter();
    const [showPassword, setShowPassword] = useState(false);
    const [fullName, setFullName] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);
    const [success, setSuccess] = useState(false);

    const handleSignUp = async (e: React.FormEvent) => {
        e.preventDefault();
        setError("");
        setLoading(true);

        if (password.length < 6) {
            setError("Password minimal 6 karakter ya!");
            setLoading(false);
            return;
        }

        try {
            const supabase = createClient();

            const { error } = await supabase.auth.signUp({
                email,
                password,
                options: {
                    data: {
                        full_name: fullName,
                    },
                },
            });

            if (error) {
                if (error.message.includes("already registered")) {
                    setError("Email ini sudah terdaftar. Coba login ya!");
                } else {
                    setError(error.message);
                }
                setLoading(false);
                return;
            }

            setSuccess(true);
            setLoading(false);
        } catch (err) {
            setError("Terjadi kesalahan. Coba lagi nanti.");
            setLoading(false);
        }
    };

    const handleGoogleSignUp = async () => {
        const supabase = createClient();
        await supabase.auth.signInWithOAuth({
            provider: "google",
            options: {
                redirectTo: `${window.location.origin}/auth/callback`,
                queryParams: {
                    prompt: 'select_account',
                    access_type: 'offline',
                }
            },
        });
    };

    if (success) {
        return (
            <div className="wave-bg-light dark:wave-bg-dark flex flex-col min-h-screen relative overflow-hidden">
                <div className="relative z-10 flex-1 flex flex-col items-center justify-center w-full max-w-md mx-auto px-8">
                    <div className="text-center space-y-4">
                        <div className="size-20 bg-emerald-100 dark:bg-emerald-900/30 rounded-full flex items-center justify-center mx-auto">
                            <Mail className="w-10 h-10 text-emerald-600 dark:text-emerald-400" />
                        </div>
                        <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Cek Email Kamu!</h1>
                        <p className="text-slate-500 dark:text-slate-400 text-sm leading-relaxed">
                            Kami sudah mengirimkan link verifikasi ke <strong className="text-primary dark:text-white">{email}</strong>.
                            Klik link tersebut untuk mengaktifkan akunmu.
                        </p>
                        <Link href="/login">
                            <Button className="mt-6 bg-primary dark:bg-indigo-600 text-white font-bold h-14 rounded-full w-full text-base">
                                Kembali ke Login
                            </Button>
                        </Link>
                    </div>
                </div>
            </div>
        );
    }

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
                    <div className="flex items-center gap-2 text-black dark:text-white">
                        <Logo />
                        <LogoText />
                    </div>
                </header>

                {/* Content Body */}
                <main className="flex-1 px-8 py-2">
                    <div className="mb-8 text-center">
                        <h1 className="text-3xl font-bold text-slate-900 dark:text-white mb-2 leading-tight">Create account</h1>
                        <p className="text-slate-500 dark:text-slate-400 text-sm font-medium">Join plivin.co today and start building.</p>
                    </div>

                    {/* Error Message */}
                    {error && (
                        <div className="mb-4 p-3 rounded-xl bg-rose-50 dark:bg-rose-900/20 border border-rose-200 dark:border-rose-800/50 text-rose-600 dark:text-rose-400 text-sm text-center font-medium">
                            {error}
                        </div>
                    )}

                    <form className="space-y-5" onSubmit={handleSignUp}>
                        {/* Full Name Field */}
                        <div className="space-y-2">
                            <Label className="text-sm font-semibold text-slate-700 dark:text-slate-300 ml-1">Full Name</Label>
                            <div className="relative">
                                <User className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 w-5 h-5 pointer-events-none" />
                                <Input
                                    type="text"
                                    placeholder="Enter your full name"
                                    value={fullName}
                                    onChange={(e) => setFullName(e.target.value)}
                                    className="w-full pl-12 pr-4 h-14 rounded-full border border-slate-200/50 dark:border-zinc-700/50 bg-white/70 dark:bg-zinc-800/70 backdrop-blur-md focus-visible:ring-primary/20 focus-visible:border-primary transition-all text-slate-900 dark:text-white text-base shadow-sm"
                                    required
                                    disabled={loading}
                                />
                            </div>
                        </div>

                        {/* Email Field */}
                        <div className="space-y-2">
                            <Label className="text-sm font-semibold text-slate-700 dark:text-slate-300 ml-1">Email</Label>
                            <div className="relative">
                                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 w-5 h-5 pointer-events-none" />
                                <Input
                                    type="email"
                                    placeholder="name@example.com"
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
                                    placeholder="Create a password (min 6 chars)"
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

                        {/* Primary Sign Up Button */}
                        <Button
                            type="submit"
                            disabled={loading}
                            className="w-full bg-primary hover:bg-primary/90 dark:bg-indigo-600 dark:hover:bg-indigo-500 text-white font-bold h-14 rounded-full transition-all shadow-lg shadow-primary/10 dark:shadow-none mt-6 text-base disabled:opacity-70"
                        >
                            {loading ? (
                                <>
                                    <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                                    Memproses...
                                </>
                            ) : (
                                "Create Account"
                            )}
                        </Button>

                        {/* Divider */}
                        <div className="relative flex items-center py-4">
                            <div className="flex-grow border-t border-slate-300 dark:border-zinc-700"></div>
                            <span className="flex-shrink mx-4 text-xs font-medium text-slate-500 uppercase tracking-widest">or</span>
                            <div className="flex-grow border-t border-slate-300 dark:border-zinc-700"></div>
                        </div>

                        {/* Google Sign Up Button */}
                        <Button
                            type="button"
                            variant="outline"
                            onClick={handleGoogleSignUp}
                            disabled={loading}
                            className="w-full flex items-center justify-center gap-3 border-slate-200 dark:border-zinc-700/80 bg-white/70 dark:bg-zinc-900/60 backdrop-blur-md text-slate-700 dark:text-slate-200 font-bold h-14 rounded-full hover:bg-slate-50 dark:hover:bg-zinc-800 transition-colors text-base shadow-sm dark:shadow-none"
                        >
                            <svg className="w-5 h-5" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"></path>
                                <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"></path>
                                <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"></path>
                                <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"></path>
                            </svg>
                            Sign up with Google
                        </Button>
                    </form>
                </main>

                {/* Footer */}
                <footer className="p-8 pb-12 text-center mt-auto">
                    <p className="text-sm text-slate-500 dark:text-slate-400">
                        Already have an account?{" "}
                        <Link href="/login" className="font-bold text-primary dark:text-white hover:underline">
                            Login
                        </Link>
                    </p>
                    <div className="mt-6 flex justify-center gap-6 text-xs text-slate-400 font-medium">
                        <Link href="#" className="hover:text-primary transition-colors">Privacy Policy</Link>
                        <Link href="#" className="hover:text-primary transition-colors">Terms of Service</Link>
                    </div>
                </footer>
            </div>
        </div>
    );
}

"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Lock } from "lucide-react";
import { Logo, LogoText } from "@/components/Logo";

export default function SplashPage() {
    const router = useRouter();
    const [progress, setProgress] = useState(0);

    useEffect(() => {
        const timer = setInterval(() => {
            setProgress((oldProgress) => {
                if (oldProgress === 100) {
                    clearInterval(timer);
                    setTimeout(() => {
                        router.push("/login");
                    }, 500);
                    return 100;
                }
                const diff = Math.random() * 20;
                return Math.min(oldProgress + diff, 100);
            });
        }, 300);

        return () => {
            clearInterval(timer);
        };
    }, [router]);

    return (
        <div className="wave-bg-light dark:wave-bg-dark flex flex-col min-h-screen relative overflow-hidden">
            <div className="relative flex-1 flex flex-col items-center justify-between py-20 px-10">
                {/* Background Decoration (Subtle Gradient) */}
                <div className="absolute inset-0 z-0 opacity-40">
                    <div className="absolute top-[-10%] left-[-10%] w-64 h-64 bg-primary/10 rounded-full blur-3xl animate-pulse"></div>
                    <div className="absolute bottom-[-10%] right-[-10%] w-64 h-64 bg-primary/5 rounded-full blur-3xl animate-pulse delay-1000"></div>
                </div>

                <div className="z-10 flex flex-col items-center gap-6 mt-20">
                    <Logo className="size-20 text-5xl border-2" />
                    <div className="text-center mt-4">
                        <LogoText className="text-4xl text-black dark:text-white" />
                        <p className="text-slate-500 dark:text-slate-400 text-sm font-medium mt-2">Your Smart Finance Partner</p>
                    </div>
                </div>

                <div className="z-10 w-full flex flex-col items-center gap-8 mb-10">
                    {/* Loading State */}
                    <div className="w-full flex flex-col gap-4 max-w-[240px]">
                        <div className="flex justify-between items-center mb-1">
                            <span className="text-slate-500 dark:text-slate-400 text-xs font-semibold uppercase tracking-widest text-left">
                                {progress < 50 ? "Encrypting data" : progress < 90 ? "Syncing data" : "Ready"}
                            </span>
                            <span className="text-primary dark:text-slate-100 text-xs font-bold text-right w-10">
                                {Math.round(progress)}%
                            </span>
                        </div>
                        <div className="h-1.5 w-full bg-slate-300/50 dark:bg-slate-800 rounded-full overflow-hidden">
                            <div
                                className="h-full bg-primary dark:bg-slate-100 rounded-full relative overflow-hidden transition-all duration-300 ease-out"
                                style={{ width: `${progress}%` }}
                            >
                                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent bg-[length:200%_100%] animate-[shimmer_1.5s_infinite]"></div>
                            </div>
                        </div>
                    </div>
                    {/* Footer Text */}
                    <div className="flex items-center gap-2 text-slate-500 dark:text-slate-500">
                        <Lock className="w-3.5 h-3.5" />
                        <span className="text-[10px] font-bold uppercase tracking-[0.2em]">Secure Cloud Connection</span>
                    </div>
                </div>

                {/* Visual Hero Backdrop Image */}
                <div className="absolute bottom-0 left-0 w-full h-[30%] opacity-5 pointer-events-none">
                    <div
                        className="w-full h-full bg-cover bg-center"
                        style={{ backgroundImage: "url('https://lh3.googleusercontent.com/aida-public/AB6AXuB3D9Bjz7PjWzCAeOHWPnA3_ca6vxHcg9VyB-awv9YqiZKqX5jnfUsXg4O4ABIeBwUjXiwityIUE0Z2cuAoTRmQy27r9ZYdhQ_p-OAXhC51olSNzyTubAi4Cb252g1RzimsSc1rGx7wm7V-klEHaNnuvbSFd-fcHnGlBB3kR54cR1r6zWix6K6A8o38AUyJX2UQXNki5XKGMrnZYdHpnYRN4klW3ijl0wO45Wc8-u5oN21OmMfqaS_jmAciIJo1jYaET2cZ9-yS1JT2')" }}
                    />
                </div>
            </div>
        </div>
    );
}

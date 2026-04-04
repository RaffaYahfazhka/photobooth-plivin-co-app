"use client";

import { ArrowLeft, Monitor, Moon, Sun } from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { useTheme } from "next-themes";
import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";

export default function AppearancePage() {
    const { theme, setTheme } = useTheme();
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
    }, []);

    if (!mounted) {
        return null;
    }

    return (
        <div className="flex flex-col min-h-screen pb-8">
            <div className="sticky top-0 z-40 bg-white/80 dark:bg-background-dark/80 backdrop-blur-md px-6 py-4 flex items-center justify-between border-b border-slate-100 dark:border-zinc-800">
                <div className="flex items-center gap-3">
                    <Link href="/dashboard/profile">
                        <Button variant="ghost" size="icon" className="h-10 w-10 shrink-0 rounded-full hover:bg-slate-100 dark:hover:bg-zinc-800">
                            <ArrowLeft className="w-5 h-5 text-slate-700 dark:text-slate-300" />
                        </Button>
                    </Link>
                    <div>
                        <h1 className="text-lg font-black text-slate-900 dark:text-white">Tema Tampilan</h1>
                        <p className="text-xs text-slate-500 font-medium">Atur gaya visual app</p>
                    </div>
                </div>
            </div>

            <div className="flex-1 px-6 py-8 space-y-6">
                <div className="space-y-4">
                    <button
                        onClick={() => setTheme("light")}
                        className={cn(
                            "w-full flex items-center gap-4 p-4 rounded-2xl border-2 transition-all",
                            theme === "light"
                                ? "border-primary bg-primary/5 dark:bg-primary/10"
                                : "border-slate-100 dark:border-zinc-800 bg-slate-50 dark:bg-zinc-900 hover:border-slate-300 dark:hover:border-zinc-700"
                        )}
                    >
                        <div className="size-12 bg-amber-100 text-amber-500 rounded-full flex items-center justify-center shrink-0">
                            <Sun className="w-6 h-6" />
                        </div>
                        <div className="flex-1 text-left">
                            <p className={cn("font-bold text-base", theme === "light" ? "text-primary dark:text-white" : "text-slate-700 dark:text-slate-300")}>Light Mode</p>
                            <p className="text-xs text-slate-500 mt-0.5">Tampilan terang dan bersih</p>
                        </div>
                        {theme === "light" && (
                            <div className="size-6 bg-primary rounded-full border-4 border-white dark:border-zinc-900 shrink-0" />
                        )}
                    </button>

                    <button
                        onClick={() => setTheme("dark")}
                        className={cn(
                            "w-full flex items-center gap-4 p-4 rounded-2xl border-2 transition-all",
                            theme === "dark"
                                ? "border-primary bg-primary/5 dark:bg-primary/10"
                                : "border-slate-100 dark:border-zinc-800 bg-slate-50 dark:bg-zinc-900 hover:border-slate-300 dark:hover:border-zinc-700"
                        )}
                    >
                        <div className="size-12 bg-slate-100 dark:bg-zinc-800 text-slate-500 dark:text-zinc-400 rounded-full flex items-center justify-center shrink-0">
                            <Moon className="w-6 h-6" />
                        </div>
                        <div className="flex-1 text-left">
                            <p className={cn("font-bold text-base", theme === "dark" ? "text-primary dark:text-white" : "text-slate-700 dark:text-slate-300")}>Dark Mode</p>
                            <p className="text-xs text-slate-500 mt-0.5">Nyaman untuk mata di malam hari</p>
                        </div>
                        {theme === "dark" && (
                            <div className="size-6 bg-primary rounded-full border-4 border-white dark:border-zinc-900 shrink-0" />
                        )}
                    </button>

                    <button
                        onClick={() => setTheme("system")}
                        className={cn(
                            "w-full flex items-center gap-4 p-4 rounded-2xl border-2 transition-all",
                            theme === "system"
                                ? "border-primary bg-primary/5 dark:bg-primary/10"
                                : "border-slate-100 dark:border-zinc-800 bg-slate-50 dark:bg-zinc-900 hover:border-slate-300 dark:hover:border-zinc-700"
                        )}
                    >
                        <div className="size-12 bg-slate-200 dark:bg-zinc-800 text-slate-600 dark:text-slate-400 rounded-full flex items-center justify-center shrink-0">
                            <Monitor className="w-6 h-6" />
                        </div>
                        <div className="flex-1 text-left">
                            <p className={cn("font-bold text-base", theme === "system" ? "text-primary dark:text-white" : "text-slate-700 dark:text-slate-300")}>Sinkron Sistem</p>
                            <p className="text-xs text-slate-500 mt-0.5">Ikuti pengaturan HP kamu otomatis</p>
                        </div>
                        {theme === "system" && (
                            <div className="size-6 bg-primary rounded-full border-4 border-white dark:border-zinc-900 shrink-0" />
                        )}
                    </button>
                </div>

                <div className="bg-blue-50 dark:bg-blue-900/20 rounded-2xl p-5 border border-blue-100 dark:border-blue-900/30">
                    <p className="text-sm text-blue-700 dark:text-blue-300 font-medium leading-relaxed">
                        Saat ini kamu sedang menggunakan <strong>{theme === "dark" ? "Dark Mode" : theme === "light" ? "Light Mode" : "Sistem"}</strong>.
                        Warna aplikasi akan mengikuti pengaturan tema pilihanmu.
                    </p>
                </div>
            </div>
        </div>
    );
}

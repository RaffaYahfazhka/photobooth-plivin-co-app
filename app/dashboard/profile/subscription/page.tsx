"use client";

import { ArrowLeft, Check, Sparkles, Zap } from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { cn } from "@/lib/utils";

const plans = [
    {
        id: "free",
        name: "Santuy Basic",
        price: "Gratis",
        period: "Selamanya",
        description: "Cukup buat mulai atur uang santuy.",
        features: [
            "Catat transaksi tanpa batas",
            "Maksimal 2 akun dompet",
            "Maksimal 3 kategori kustom",
            "Laporan ringkasan bulanan",
        ],
        buttonText: "Paket Saat Ini",
        isPro: false,
    },
    {
        id: "pro",
        name: "Santuy Pro",
        price: "Rp29.000",
        period: "/bulan",
        description: "Fitur lengkap untuk manajemen santuy.",
        features: [
            "Semua fitur Basic",
            "Akun dompet & kategori tak terbatas",
            "Bikin target Milestone impian",
            "Laporan analitik mendalam",
            "Tanpa iklan sama sekali",
            "Ekspor data ke Excel/PDF",
        ],
        buttonText: "Upgrade ke Pro",
        isPro: true,
    }
];

export default function SubscriptionPage() {
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
                        <h1 className="text-lg font-black text-slate-900 dark:text-white">Paket Langganan</h1>
                        <p className="text-xs text-slate-500 font-medium">Pilih paket yang pas buatmu</p>
                    </div>
                </div>
            </div>

            <div className="flex-1 px-6 py-8 space-y-6">
                {/* Header Icon */}
                <div className="flex justify-center mb-8">
                    <div className="size-20 bg-amber-100 dark:bg-amber-900/30 text-amber-500 rounded-full flex items-center justify-center animate-pulse">
                        <Sparkles className="w-10 h-10" />
                    </div>
                </div>

                <div className="space-y-6">
                    {plans.map((plan) => (
                        <div
                            key={plan.id}
                            className={cn(
                                "rounded-3xl p-6 border-2 relative overflow-hidden transition-all",
                                plan.isPro
                                    ? "bg-slate-900 dark:bg-zinc-900 border-slate-900 dark:border-zinc-800 shadow-2xl shadow-primary/20"
                                    : "bg-white dark:bg-zinc-950 border-slate-200 dark:border-zinc-800"
                            )}
                        >
                            {plan.isPro && (
                                <div className="absolute top-0 right-0 bg-primary text-white text-[10px] font-bold uppercase tracking-widest px-4 py-1.5 rounded-bl-xl">
                                    Paling Populer
                                </div>
                            )}

                            <div className="mb-6">
                                <h3 className={cn("text-xl font-black mb-1", plan.isPro ? "text-white" : "text-slate-900 dark:text-white")}>
                                    {plan.name}
                                </h3>
                                <div className="flex items-baseline gap-1 mb-2">
                                    <span className={cn("text-3xl font-black", plan.isPro ? "text-white" : "text-slate-900 dark:text-white")}>{plan.price}</span>
                                    <span className={cn("text-sm font-bold", plan.isPro ? "text-white/60" : "text-slate-500")}>{plan.period}</span>
                                </div>
                                <p className={cn("text-sm font-medium", plan.isPro ? "text-white/80" : "text-slate-600 dark:text-slate-400")}>
                                    {plan.description}
                                </p>
                            </div>

                            <ul className="space-y-3 mb-8">
                                {plan.features.map((feature, i) => (
                                    <li key={i} className="flex items-center gap-3">
                                        <div className={cn("size-5 rounded-full flex items-center justify-center shrink-0", plan.isPro ? "bg-primary/20 text-primary" : "bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600")}>
                                            <Check className="w-3 h-3 font-bold" />
                                        </div>
                                        <span className={cn("text-sm font-medium", plan.isPro ? "text-white/90" : "text-slate-700 dark:text-slate-300")}>{feature}</span>
                                    </li>
                                ))}
                            </ul>

                            <Button
                                variant={plan.isPro ? "default" : "outline"}
                                className={cn(
                                    "w-full h-12 rounded-xl font-bold text-base",
                                    plan.isPro
                                        ? "bg-primary text-white hover:bg-primary/90"
                                        : "border-slate-300 dark:border-zinc-700 text-slate-600 dark:text-slate-400 cursor-default hover:bg-transparent"
                                )}
                            >
                                {plan.isPro && <Zap className="w-4 h-4 mr-2" />}
                                {plan.buttonText}
                            </Button>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}

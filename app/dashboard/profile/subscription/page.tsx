"use client";

import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { ArrowLeft, Check, Sparkles, Zap, Lock, Crown, Loader2, X, PartyPopper } from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { createClient } from "@/lib/supabase/client";
import { PLAN_DETAILS, normalizePlan } from "@/lib/subscription";

const BASIC_FEATURES = [
    "Catat transaksi tanpa batas",
    "Maksimal 2 akun dompet",
    "Maksimal 3 kategori kustom",
    "Maksimal 2 anggaran bulanan",
    "Laporan ringkasan bulanan",
];

const PRO_FEATURES = [
    "Semua fitur Basic",
    "Akun dompet tak terbatas",
    "Kategori kustom tak terbatas",
    "Anggaran bulanan tak terbatas",
    "Bikin target Milestone impian",
    "Laporan analitik mendalam",
    "Ekspor data ke Excel/PDF",
    "Tanpa iklan sama sekali",
    "Support prioritas",
];

export default function SubscriptionPage() {
    const searchParams = useSearchParams();
    const paymentStatus = searchParams.get("status");

    const [userPlan, setUserPlan] = useState<"basic" | "pro">("basic");
    const [subscriptionEnd, setSubscriptionEnd] = useState<string | null>(null);
    const [loading, setLoading] = useState(true);
    const [upgrading, setUpgrading] = useState(false);

    useEffect(() => {
        const fetchPlan = async () => {
            const supabase = createClient();
            const { data: { user } } = await supabase.auth.getUser();

            if (user) {
                const { data: profile } = await supabase
                    .from("profiles")
                    .select("plan")
                    .eq("id", user.id)
                    .single();

                setUserPlan(normalizePlan(profile?.plan));

                const { data: sub } = await supabase
                    .from("subscriptions")
                    .select("current_period_end, status")
                    .eq("user_id", user.id)
                    .eq("status", "active")
                    .single();

                if (sub?.current_period_end) {
                    setSubscriptionEnd(new Date(sub.current_period_end).toLocaleDateString("id-ID", {
                        day: "numeric", month: "long", year: "numeric"
                    }));
                }
            }
            setLoading(false);
        };

        fetchPlan();
    }, []);

    const handleUpgrade = async () => {
        setUpgrading(true);
        try {
            const res = await fetch("/api/xendit/create-invoice", { method: "POST" });
            const data = await res.json();

            if (data.invoiceUrl) {
                window.location.href = data.invoiceUrl;
            } else {
                alert(data.error || "Gagal membuat invoice. Coba lagi.");
                setUpgrading(false);
            }
        } catch (err) {
            alert("Terjadi kesalahan. Coba lagi nanti.");
            setUpgrading(false);
        }
    };

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
                {/* Payment Status Banner */}
                {paymentStatus === "success" && (
                    <div className="flex items-center gap-3 p-4 rounded-2xl bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-200 dark:border-emerald-800/50">
                        <PartyPopper className="w-6 h-6 text-emerald-600 shrink-0" />
                        <div>
                            <p className="font-bold text-emerald-800 dark:text-emerald-300 text-sm">Pembayaran berhasil!</p>
                            <p className="text-xs text-emerald-600 dark:text-emerald-400">Fitur Pro kamu akan segera aktif. Tunggu beberapa saat ya.</p>
                        </div>
                    </div>
                )}
                {paymentStatus === "failed" && (
                    <div className="flex items-center gap-3 p-4 rounded-2xl bg-rose-50 dark:bg-rose-900/20 border border-rose-200 dark:border-rose-800/50">
                        <X className="w-6 h-6 text-rose-600 shrink-0" />
                        <div>
                            <p className="font-bold text-rose-800 dark:text-rose-300 text-sm">Pembayaran gagal</p>
                            <p className="text-xs text-rose-600 dark:text-rose-400">Coba lagi atau pilih metode pembayaran lain.</p>
                        </div>
                    </div>
                )}

                {/* Active Subscription Info */}
                {userPlan === "pro" && subscriptionEnd && (
                    <div className="flex items-center gap-3 p-4 rounded-2xl bg-white/5 dark:bg-white/10 border border-primary/20 dark:border-white/20">
                        <Crown className="w-6 h-6 text-primary dark:text-white shrink-0" />
                        <div>
                            <p className="font-bold text-primary dark:text-white text-sm">Santuy Pro Aktif</p>
                            <p className="text-xs text-primary/70 dark:text-white/60">Berlaku sampai {subscriptionEnd}</p>
                        </div>
                    </div>
                )}

                {/* Header Icon */}
                <div className="flex justify-center mb-4">
                    <div className="size-20 bg-amber-100 dark:bg-amber-900/30 text-amber-500 rounded-full flex items-center justify-center animate-pulse">
                        <Sparkles className="w-10 h-10" />
                    </div>
                </div>

                {loading ? (
                    <div className="flex justify-center py-12">
                        <Loader2 className="w-8 h-8 animate-spin text-primary" />
                    </div>
                ) : (
                    <div className="space-y-6">
                        {/* BASIC PLAN */}
                        <div className={cn(
                            "rounded-3xl p-6 border-2 relative overflow-hidden transition-all",
                            userPlan === "basic"
                                ? "bg-white dark:bg-zinc-950 border-primary dark:border-white"
                                : "bg-white dark:bg-zinc-950 border-slate-200 dark:border-zinc-800"
                        )}>
                            {userPlan === "basic" && (
                                <div className="absolute top-0 right-0 bg-primary text-white text-[10px] font-bold uppercase tracking-widest px-4 py-1.5 rounded-bl-xl">
                                    Paket Kamu
                                </div>
                            )}

                            <div className="mb-6">
                                <h3 className="text-xl font-black mb-1 text-slate-900 dark:text-white">
                                    {PLAN_DETAILS.basic.name}
                                </h3>
                                <div className="flex items-baseline gap-1 mb-2">
                                    <span className="text-3xl font-black text-slate-900 dark:text-white">{PLAN_DETAILS.basic.priceLabel}</span>
                                    <span className="text-sm font-bold text-slate-500">{PLAN_DETAILS.basic.period}</span>
                                </div>
                                <p className="text-sm font-medium text-slate-600 dark:text-slate-400">
                                    {PLAN_DETAILS.basic.description}
                                </p>
                            </div>

                            <ul className="space-y-3 mb-8">
                                {BASIC_FEATURES.map((feature, i) => (
                                    <li key={i} className="flex items-center gap-3">
                                        <div className="size-5 rounded-full flex items-center justify-center shrink-0 bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600">
                                            <Check className="w-3 h-3" />
                                        </div>
                                        <span className="text-sm font-medium text-slate-700 dark:text-slate-300">{feature}</span>
                                    </li>
                                ))}
                            </ul>

                            <Button
                                variant="outline"
                                disabled
                                className="w-full h-12 rounded-xl font-bold text-base border-slate-300 dark:border-zinc-700 text-slate-500 dark:text-slate-500 cursor-default hover:bg-transparent"
                            >
                                {userPlan === "basic" ? "Paket Saat Ini" : "Paket Dasar"}
                            </Button>
                        </div>

                        {/* PRO PLAN */}
                        <div className={cn(
                            "rounded-3xl p-6 border-2 relative overflow-hidden transition-all",
                            userPlan === "pro"
                                ? "bg-slate-900 dark:bg-zinc-900 border-primary dark:border-white shadow-2xl shadow-primary/20"
                                : "bg-slate-900 dark:bg-zinc-900 border-slate-900 dark:border-zinc-800 shadow-2xl shadow-primary/20"
                        )}>
                            <div className="absolute top-0 right-0 bg-primary text-white text-[10px] font-bold uppercase tracking-widest px-4 py-1.5 rounded-bl-xl">
                                {userPlan === "pro" ? "Paket Kamu" : "Paling Populer"}
                            </div>

                            <div className="mb-6">
                                <h3 className="text-xl font-black mb-1 text-white">
                                    {PLAN_DETAILS.pro.name}
                                </h3>
                                <div className="flex items-baseline gap-1 mb-2">
                                    <span className="text-3xl font-black text-white">{PLAN_DETAILS.pro.priceLabel}</span>
                                    <span className="text-sm font-bold text-white/60">{PLAN_DETAILS.pro.period}</span>
                                </div>
                                <p className="text-sm font-medium text-white/80">
                                    {PLAN_DETAILS.pro.description}
                                </p>
                            </div>

                            <ul className="space-y-3 mb-8">
                                {PRO_FEATURES.map((feature, i) => (
                                    <li key={i} className="flex items-center gap-3">
                                        <div className="size-5 rounded-full flex items-center justify-center shrink-0 bg-primary/20 text-primary">
                                            <Check className="w-3 h-3 font-bold" />
                                        </div>
                                        <span className="text-sm font-medium text-white/90">{feature}</span>
                                    </li>
                                ))}
                            </ul>

                            {userPlan === "pro" ? (
                                <Button
                                    disabled
                                    className="w-full h-12 rounded-xl font-bold text-base bg-white/10 text-white/70 cursor-default hover:bg-white/10"
                                >
                                    <Crown className="w-4 h-4 mr-2" />
                                    Paket Saat Ini
                                </Button>
                            ) : (
                                <Button
                                    onClick={handleUpgrade}
                                    disabled={upgrading}
                                    className="w-full h-12 rounded-xl font-bold text-base bg-primary text-white hover:bg-primary/90 disabled:opacity-70"
                                >
                                    {upgrading ? (
                                        <>
                                            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                            Memproses...
                                        </>
                                    ) : (
                                        <>
                                            <Zap className="w-4 h-4 mr-2" />
                                            Upgrade ke Pro — Rp29.000/bln
                                        </>
                                    )}
                                </Button>
                            )}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}

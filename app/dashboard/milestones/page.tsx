"use client";

import { useState, useEffect } from "react";
import {
    Sparkles, Wand2, Home, Heart, PlaneTakeoff, PlusCircle,
    Trophy, TrendingUp, Target, CheckCircle2, BarChart3,
    Wallet, Calendar, Laptop, Gamepad, Smartphone, GraduationCap,
    Loader2
} from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { createClient } from "@/lib/supabase/client";

const ICONS: Record<string, any> = {
    target: Target,
    home: Home,
    car: Car, // wait, Car is not imported. Let me add it.
    heart: Heart,
    plane: PlaneTakeoff,
    wallet: Wallet,
    laptop: Laptop,
    gamepad: Gamepad,
    smartphone: Smartphone,
    graduation: GraduationCap,
};

// Also let's fix the Car import right below
import { Car } from "lucide-react";

const COLORS: Record<string, { main: string, light: string }> = {
    blue: { main: "bg-blue-500", light: "bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400" },
    rose: { main: "bg-rose-500", light: "bg-rose-100 dark:bg-rose-900/30 text-rose-600 dark:text-rose-400" },
    emerald: { main: "bg-emerald-500", light: "bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400" },
    amber: { main: "bg-amber-500", light: "bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400" },
    purple: { main: "bg-purple-500", light: "bg-purple-100 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400" },
    teal: { main: "bg-teal-500", light: "bg-teal-100 dark:bg-teal-900/30 text-teal-600 dark:text-teal-400" },
};

function formatRp(n: number) {
    if (n >= 1000000) return `Rp${(n / 1000000).toFixed(1)}jt`;
    if (n >= 1000) return `Rp${(n / 1000).toFixed(0)}rb`;
    return `Rp${n}`;
}

export default function MilestonesPage() {
    const [currentEffectIndex, setCurrentEffectIndex] = useState(0);
    const [currentTipIndex, setCurrentTipIndex] = useState(0);

    const [milestones, setMilestones] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    const fetchData = async () => {
        setLoading(true);
        const supabase = createClient();
        const { data: { user } } = await supabase.auth.getUser();

        if (user) {
            const { data } = await supabase
                .from("milestones")
                .select("*")
                .eq("user_id", user.id)
                .order("created_at", { ascending: false });
            
            if (data) setMilestones(data);
        }
        setLoading(false);
    };

    useEffect(() => {
        fetchData();
    }, []);

    const butterflyEffects = [
        {
            title: "Skip 1 Kopi Tiap Hari",
            description: <>Bisa hemat <strong>Rp1.050.000</strong>/bulan. Jika dialokasikan, mimpimu bisa lebih cepat tercapai!</>
        },
        {
            title: "Bawa Bekal ke Kantor",
            description: <>Bisa hemat <strong>Rp1.500.000</strong>/bulan. Beban milestone-mu akan jauh lebih ringan kedepannya!</>
        },
        {
            title: "Kurangi Langganan Streaming",
            description: <>Bisa hemat <strong>Rp150.000</strong>/bulan. Setidaknya ada progres konstan setiap minggunya.</>
        }
    ];

    const tipsCerdas = [
        <>Kalau kamu menabung konstan sesuai jadwal, target mimpimu bisa tercapai jauh lebih cepat dan terprediksi.</>,
        <>Gunakan aturan <strong>50/30/20</strong>: 50% Kebutuhan, 30% Keinginan, 20% Tabungan untuk mengelola budget secara sehat.</>,
        <>Sisihkan uang kaget/bonus <strong>langsung ke tabungan Milestone</strong> sebelum kamu tergoda membelanjakannya!</>
    ];

    const nextEffect = () => {
        setCurrentEffectIndex((prev) => (prev + 1) % butterflyEffects.length);
    };

    useEffect(() => {
        const interval = setInterval(() => {
            setCurrentTipIndex((prev) => (prev + 1) % tipsCerdas.length);
        }, 8000); 
        return () => clearInterval(interval);
    }, []);

    const getStatus = (pct: number, dateStr: string) => {
        if (pct >= 100) return { label: "Tercapai 🎉", color: "bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400" };
        if (pct >= 80) return { label: "Hampir Tercapai!", color: "bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400" };
        if (pct > 0) return { label: "On Progress", color: "bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400" };
        return { label: "Baru Mulai", color: "bg-slate-200 dark:bg-zinc-800 text-slate-600 dark:text-slate-400" };
    };

    const activeMilestones = milestones.filter(m => !m.is_completed && m.saved_amount < m.target_amount);
    const completedMilestones = milestones.filter(m => m.is_completed || m.saved_amount >= m.target_amount);

    const totalTarget = milestones.reduce((s, m) => s + m.target_amount, 0);
    const totalSaved = milestones.reduce((s, m) => s + m.saved_amount, 0);

    return (
        <div className="flex flex-col pb-24 bg-slate-50/50 dark:bg-background-dark min-h-screen">
            {/* Header */}
            <div className="px-6 pt-6 pb-2 mt-4">
                <p className="text-slate-500 dark:text-slate-400 text-sm font-bold">Yo, pantau terus targetmu!</p>
                <h1 className="text-3xl font-black leading-tight tracking-tight mt-1">Milestone Tracker</h1>
            </div>

            {/* Butterfly Effect Card */}
            <div className="px-6 py-4">
                <div className="bg-primary dark:bg-zinc-800 border border-transparent dark:border-zinc-700/80 rounded-2xl p-5 text-white shadow-lg shadow-primary/20 dark:shadow-none overflow-hidden relative">
                    <div className="absolute -right-4 -top-4 opacity-10">
                        <Sparkles className="w-32 h-32" />
                    </div>
                    <div className="flex items-center gap-2 mb-3">
                        <Wand2 className="text-white w-5 h-5" />
                        <span className="text-xs font-bold uppercase tracking-widest text-white/70">Efek Kupu-kupu</span>
                    </div>
                    <h3 className="text-xl font-bold mb-2 transition-all">{butterflyEffects[currentEffectIndex].title}</h3>
                    <p className="text-sm text-white/80 leading-relaxed mb-4 transition-all min-h-[40px]">
                        {butterflyEffects[currentEffectIndex].description}
                    </p>
                    <button onClick={nextEffect} className="bg-white/20 hover:bg-white/30 transition-colors px-4 py-2 rounded-full text-xs font-bold">Lihat Perubahan Lain</button>
                </div>
            </div>

            {/* Tabs */}
            <Tabs defaultValue="active" className="w-full">
                <div className="px-6">
                    <TabsList className="w-full bg-white shadow-sm dark:bg-zinc-800 border dark:border-zinc-800 rounded-full h-14 p-1">
                        <TabsTrigger value="active" className="flex-1 rounded-full font-bold h-full data-[state=active]:bg-slate-100 dark:data-[state=active]:bg-zinc-700 gap-1.5 transition-all">
                            <Target className="w-4 h-4" /> Aktif
                        </TabsTrigger>
                        <TabsTrigger value="completed" className="flex-1 rounded-full font-bold h-full data-[state=active]:bg-emerald-100 dark:data-[state=active]:bg-emerald-900/30 data-[state=active]:text-emerald-700 transition-all gap-1.5">
                            <CheckCircle2 className="w-4 h-4" /> Selesai
                        </TabsTrigger>
                        <TabsTrigger value="insights" className="flex-1 rounded-full font-bold h-full data-[state=active]:bg-slate-100 dark:data-[state=active]:bg-zinc-700 transition-all gap-1.5">
                            <BarChart3 className="w-4 h-4" /> Insight
                        </TabsTrigger>
                    </TabsList>
                </div>

                {/* Active Tab */}
                <TabsContent value="active">
                    <div className="px-6 py-6 space-y-4">
                        <h2 className="text-lg font-bold">Milestone Aktif</h2>
                        
                        {loading ? (
                            <div className="flex justify-center p-8"><Loader2 className="w-8 h-8 animate-spin text-primary" /></div>
                        ) : activeMilestones.length === 0 ? (
                            <div className="text-center py-10 bg-white dark:bg-zinc-800/50 rounded-2xl border border-slate-100 dark:border-zinc-700/50">
                                <Target className="w-12 h-12 mx-auto text-slate-300 dark:text-slate-600 mb-3" />
                                <p className="font-bold text-slate-700 dark:text-slate-200">Tidak ada milestone aktif</p>
                                <p className="text-xs text-slate-400 mt-1 mb-4">Mulai tetapkan impian pertamamu hari ini!</p>
                            </div>
                        ) : (
                            activeMilestones.map((ms) => {
                                const Icon = ICONS[ms.icon] || Target;
                                const colorTheme = COLORS[ms.color] || COLORS.blue;
                                const pct = Math.min(Math.round((ms.saved_amount / ms.target_amount) * 100), 100);
                                const status = getStatus(pct, ms.target_date);
                                
                                return (
                                    <Link key={ms.id} href={`/dashboard/milestones/${ms.id}`} className="block">
                                        <div className="bg-white shadow-sm dark:bg-zinc-900 border border-slate-100 dark:border-zinc-800 rounded-2xl p-5 hover:border-primary/20 transition-colors cursor-pointer group">
                                            <div className="flex justify-between items-start mb-4">
                                                <div className="flex items-center gap-3">
                                                    <div className={cn("size-12 rounded-xl flex items-center justify-center transition-transform group-hover:scale-105", colorTheme.light)}>
                                                        <Icon className="w-6 h-6" />
                                                    </div>
                                                    <div>
                                                        <h4 className="font-bold">{ms.name}</h4>
                                                        <p className="text-xs font-bold text-slate-400">Target: {formatRp(ms.target_amount)}</p>
                                                    </div>
                                                </div>
                                                <span className="text-sm font-black">{pct}%</span>
                                            </div>
                                            <Progress value={pct} className="bg-slate-100 dark:bg-zinc-800 [&>div]:bg-primary dark:[&>div]:bg-white h-2 mb-4" />
                                            <div className="flex justify-between items-center text-xs">
                                                <span className="text-slate-500 dark:text-slate-400 font-bold">{formatRp(ms.saved_amount)} terkumpul</span>
                                                <span className={cn("px-2.5 py-1 rounded-full font-bold", status.color)}>{status.label}</span>
                                            </div>
                                        </div>
                                    </Link>
                                );
                            })
                        )}

                        <Link href="/dashboard/milestones/create" className="block">
                            <button className="w-full border-2 border-dashed border-slate-200 dark:border-zinc-700 rounded-2xl p-5 flex flex-col items-center justify-center gap-2 hover:bg-slate-50 dark:hover:bg-zinc-900 transition-colors">
                                <PlusCircle className="text-slate-400 w-6 h-6" />
                                <span className="text-sm font-bold text-slate-500 dark:text-slate-400">Buat Milestone Baru</span>
                            </button>
                        </Link>
                    </div>
                </TabsContent>

                {/* Completed Tab */}
                <TabsContent value="completed">
                    <div className="px-6 py-6 space-y-4">
                        <div className="flex items-center gap-2 mb-2">
                            <Trophy className="w-5 h-5 text-amber-500" />
                            <h2 className="text-lg font-bold">Milestone Selesai</h2>
                        </div>
                        
                        {loading ? (
                            <div className="flex justify-center p-8"><Loader2 className="w-8 h-8 animate-spin text-primary" /></div>
                        ) : completedMilestones.length === 0 ? (
                            <div className="text-center py-12 text-slate-400 bg-white dark:bg-zinc-800/50 rounded-2xl shadow-sm border border-slate-100 dark:border-zinc-700/50">
                                <Trophy className="w-12 h-12 mx-auto mb-4 opacity-30 text-slate-300" />
                                <p className="font-bold text-slate-600 dark:text-slate-300">Belum ada milestone selesai</p>
                                <p className="text-sm mt-1">Terus semangat nabungnya ya! 💪</p>
                            </div>
                        ) : (
                            completedMilestones.map((ms) => {
                                const Icon = ICONS[ms.icon] || Target;
                                const colorTheme = COLORS[ms.color] || COLORS.blue;
                                
                                return (
                                    <Link key={ms.id} href={`/dashboard/milestones/${ms.id}`} className="block">
                                        <div className="bg-emerald-50/50 dark:bg-emerald-900/10 border border-emerald-100 dark:border-emerald-900/30 rounded-2xl p-5 relative overflow-hidden shadow-sm hover:border-emerald-300 dark:hover:border-emerald-700 transition-colors">
                                            <div className="absolute top-3 right-3">
                                                <CheckCircle2 className="w-6 h-6 text-emerald-500" />
                                            </div>
                                            <div className="flex items-center gap-3 mb-3">
                                                <div className={cn("size-12 rounded-xl flex items-center justify-center", colorTheme.light)}>
                                                    <Icon className="w-6 h-6" />
                                                </div>
                                                <div>
                                                    <h4 className="font-bold">{ms.name}</h4>
                                                    <p className="text-[10px] text-emerald-600 dark:text-emerald-400 font-bold tracking-wider uppercase mt-0.5">{formatRp(ms.target_amount)} — Tercapai! 🎉</p>
                                                </div>
                                            </div>
                                            <Progress value={100} className="bg-emerald-200 dark:bg-emerald-900/40 [&>div]:bg-emerald-500 h-2 mb-3" />
                                        </div>
                                    </Link>
                                );
                            })
                        )}
                    </div>
                </TabsContent>

                {/* Insights Tab */}
                <TabsContent value="insights">
                    <div className="px-6 py-6 space-y-6">
                        <h2 className="text-lg font-bold flex items-center gap-2">
                            <TrendingUp className="w-5 h-5 text-primary dark:text-white" />
                            Insight Keuanganmu
                        </h2>

                        <div className="grid grid-cols-2 gap-3">
                            <div className="bg-white shadow-sm dark:bg-zinc-900/50 border border-slate-100 dark:border-zinc-800 rounded-2xl p-4">
                                <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mb-1">Total Target</p>
                                <p className="text-lg font-black">{formatRp(totalTarget)}</p>
                            </div>
                            <div className="bg-white shadow-sm dark:bg-zinc-900/50 border border-slate-100 dark:border-zinc-800 rounded-2xl p-4">
                                <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mb-1">Terkumpul</p>
                                <p className="text-lg font-black text-emerald-500 dark:text-emerald-400">{formatRp(totalSaved)}</p>
                            </div>
                            <div className="bg-white shadow-sm dark:bg-zinc-900/50 border border-slate-100 dark:border-zinc-800 rounded-2xl p-4">
                                <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mb-1">Milestone Aktif</p>
                                <p className="text-xl font-black">{activeMilestones.length}</p>
                            </div>
                            <div className="bg-white shadow-sm dark:bg-zinc-900/50 border border-slate-100 dark:border-zinc-800 rounded-2xl p-4">
                                <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mb-1">Milestone Selesai</p>
                                <p className="text-xl font-black text-blue-500 dark:text-blue-400">{completedMilestones.length}</p>
                            </div>
                        </div>

                        <div className="bg-primary dark:bg-zinc-800 border border-transparent dark:border-zinc-700/80 rounded-2xl p-5 text-white shadow-lg shadow-primary/20 dark:shadow-none">
                            <h3 className="font-bold mb-4 text-white/90">Progress Mini</h3>
                            <div className="space-y-4">
                                {activeMilestones.slice(0, 3).map((ms) => {
                                    const pct = Math.min(Math.round((ms.saved_amount / ms.target_amount) * 100), 100);
                                    return (
                                        <div key={ms.id} className="flex items-center gap-3">
                                            <span className="text-[10px] font-bold uppercase tracking-wider text-white/80 w-24 truncate">{ms.name}</span>
                                            <div className="flex-1 bg-white/20 rounded-full h-1.5">
                                                <div className="bg-white h-1.5 rounded-full transition-all" style={{ width: `${pct}%` }} />
                                            </div>
                                            <span className="text-xs font-bold w-10 text-right">{pct}%</span>
                                        </div>
                                    );
                                })}
                                {activeMilestones.length === 0 && <p className="text-xs text-white/50">Belum ada data progress</p>}
                            </div>
                        </div>

                        <div className="bg-amber-50 dark:bg-amber-900/10 border border-amber-100 dark:border-amber-900/30 rounded-2xl p-5 shadow-sm">
                            <h4 className="font-bold text-amber-800 dark:text-amber-400 mb-2 flex items-center gap-2">💡 Tips Cerdas</h4>
                            <p className="text-sm font-medium text-amber-700 dark:text-amber-300 leading-relaxed transition-all min-h-[40px]">
                                {tipsCerdas[currentTipIndex]}
                            </p>
                        </div>
                    </div>
                </TabsContent>
            </Tabs>
        </div>
    );
}

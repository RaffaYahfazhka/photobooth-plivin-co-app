"use client";

import { useState, useEffect, use } from "react";
import { ArrowLeft, Target, Home, Car, Heart, PlaneTakeoff, Wallet, Laptop, Gamepad, Smartphone, GraduationCap, Loader2, Plus, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Progress } from "@/components/ui/progress";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { cn } from "@/lib/utils";

const ICONS: Record<string, any> = {
    target: Target,
    home: Home,
    car: Car,
    heart: Heart,
    plane: PlaneTakeoff,
    wallet: Wallet,
    laptop: Laptop,
    gamepad: Gamepad,
    smartphone: Smartphone,
    graduation: GraduationCap,
};

const COLORS: Record<string, { main: string, light: string }> = {
    blue: { main: "bg-blue-500", light: "bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400" },
    rose: { main: "bg-rose-500", light: "bg-rose-100 dark:bg-rose-900/30 text-rose-600 dark:text-rose-400" },
    emerald: { main: "bg-emerald-500", light: "bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400" },
    amber: { main: "bg-amber-500", light: "bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400" },
    slate: { main: "bg-slate-700", light: "bg-slate-100 dark:bg-zinc-800 text-slate-700 dark:text-slate-300" },
    teal: { main: "bg-teal-500", light: "bg-teal-100 dark:bg-teal-900/30 text-teal-600 dark:text-teal-400" },
};

function formatRp(n: number) {
    if (n >= 1000000) return `Rp${(n / 1000000).toFixed(1)}jt`;
    if (n >= 1000) return `Rp${(n / 1000).toFixed(0)}rb`;
    return `Rp${n}`;
}

export default function MilestoneDetail({ params }: { params: Promise<{ id: string }> }) {
    const { id } = use(params);
    const router = useRouter();
    
    const [milestone, setMilestone] = useState<any>(null);
    const [balance, setBalance] = useState<number>(0);
    const [loading, setLoading] = useState(true);
    
    // Tabungan State
    const [isSavingDialog, setIsSavingDialog] = useState(false);
    const [saveAmount, setSaveAmount] = useState("");
    const [isSaving, setIsSaving] = useState(false);
    const [errorMsg, setErrorMsg] = useState<string | null>(null);

    const fetchData = async () => {
        setLoading(true);
        const supabase = createClient();
        
        // Ambil data milestone
        const { data: mData } = await supabase.from("milestones").select("*").eq("id", id).single();
        if (mData) setMilestone(mData);

        // Ambil kalkulasi saldo balance terkini pengguna
        const { data: { user } } = await supabase.auth.getUser();
        if (user) {
            const { data: allTxs } = await supabase.from("transactions").select("amount, type").eq("user_id", user.id);
            let totalBalance = 0;
            allTxs?.forEach(t => {
                if (t.type === 'income') totalBalance += t.amount;
                else totalBalance -= t.amount;
            });
            setBalance(totalBalance);
        }

        setLoading(false);
    };

    useEffect(() => {
        fetchData();
    }, [id]);

    const formatRupiah = (value: string) => {
        const numberString = value.replace(/[^,\d]/g, "").toString();
        const split = numberString.split(",");
        const sisa = split[0].length % 3;
        let rupiah = split[0].substr(0, sisa);
        const ribuan = split[0].substr(sisa).match(/\d{3}/gi);

        if (ribuan) {
            const separator = sisa ? "." : "";
            rupiah += separator + ribuan.join(".");
        }
        return split[1] !== undefined ? rupiah + "," + split[1] : rupiah;
    };

    const handleAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setErrorMsg(null);
        setSaveAmount(formatRupiah(e.target.value));
    };

    const handleAddSavings = async () => {
        if (!saveAmount || !milestone) return;

        const numericAmount = parseFloat(saveAmount.replace(/\./g, ""));
        
        // Validasi saldo
        if (numericAmount > balance) {
            setErrorMsg("Saldo akhir kamu tidak mencukupi untuk setor tabungan sebesar ini!");
            return;
        }

        setIsSaving(true);
        const newSaved = milestone.saved_amount + numericAmount;
        const isCompleted = newSaved >= milestone.target_amount;

        const supabase = createClient();
        const { data: { user } } = await supabase.auth.getUser();

        // 1. Update progres milestone
        const { error: mError } = await supabase
            .from("milestones")
            .update({ 
                saved_amount: newSaved,
                is_completed: isCompleted 
            })
            .eq("id", id);

        // 2. Insert transaksi pengeluaran sebagai "Tabungan Milestone" ke dalam riwayat Aktivitas
        if (!mError && user) {
            await supabase.from("transactions").insert({
                user_id: user.id,
                type: "expense",
                amount: numericAmount,
                category: "other", // Tetap dimasukkan kategori lain-lain
                note: `Nabung Target: ${milestone.name}` // Note ini yang akan dibaca di list aktivitas
            });

            setIsSavingDialog(false);
            setSaveAmount("");
            fetchData();
        }
        setIsSaving(false);
    };

    if (loading) {
        return (
            <div className="flex-1 flex items-center justify-center min-h-screen bg-slate-50/50 dark:bg-background-dark">
                <Loader2 className="w-8 h-8 text-primary animate-spin" />
            </div>
        );
    }

    if (!milestone) {
        return (
            <div className="flex-1 flex flex-col items-center justify-center min-h-screen bg-slate-50/50 dark:bg-background-dark px-6">
                <h2 className="text-xl font-bold mb-2">Milestone tidak ditemukan</h2>
                <Button onClick={() => router.push("/dashboard/milestones")}>Kembali</Button>
            </div>
        );
    }

    const Icon = ICONS[milestone.icon] || Target;
    const colorTheme = COLORS[milestone.color] || COLORS.blue;
    const pctRaw = (milestone.saved_amount / milestone.target_amount) * 100;
    const pct = Math.min(Math.round(pctRaw), 100);

    const deadline = new Date(milestone.target_date);
    const today = new Date();
    const isOverdue = today > deadline && !milestone.is_completed;
    const monthsDiff = (deadline.getFullYear() - today.getFullYear()) * 12 + (deadline.getMonth() - today.getMonth());

    return (
        <div className="flex flex-col min-h-screen pb-8 bg-slate-50/50 dark:bg-background-dark">
            {/* Header */}
            <div className="sticky top-0 z-40 bg-white/80 dark:bg-background-dark/80 backdrop-blur-md px-6 py-4 flex items-center justify-between border-b border-slate-100 dark:border-zinc-800">
                <div className="flex items-center gap-3">
                    <Link href="/dashboard/milestones">
                        <Button variant="ghost" size="icon" className="h-10 w-10 shrink-0 rounded-full hover:bg-slate-100 dark:hover:bg-zinc-800">
                            <ArrowLeft className="w-5 h-5 text-slate-700 dark:text-slate-300" />
                        </Button>
                    </Link>
                    <div>
                        <h1 className="text-lg font-black text-slate-900 dark:text-white capitalize truncate max-w-[200px]">{milestone.name}</h1>
                        <p className="text-xs text-slate-500 font-medium">Detail Impian</p>
                    </div>
                </div>
            </div>

            <div className="px-6 py-6 space-y-6">
                {/* Hero Data */}
                <div className="bg-white dark:bg-zinc-900 border border-slate-100 dark:border-zinc-800 rounded-3xl p-6 shadow-sm flex flex-col items-center text-center">
                    <div className={cn("size-20 rounded-full flex items-center justify-center mb-4", colorTheme.light)}>
                        <Icon className="w-10 h-10" />
                    </div>
                    <h2 className="text-xl font-bold mb-1 capitalize">{milestone.name}</h2>
                    <p className="text-sm text-slate-500 font-medium mb-6">🎯 Target: {new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", minimumFractionDigits: 0 }).format(milestone.target_amount)}</p>

                    {/* Circular Progress (fallback to large bar) */}
                    <div className="w-full">
                        <div className="flex justify-between items-end mb-2">
                            <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">Terkumpul</span>
                            <span className="text-3xl font-black text-primary dark:text-white">{pct}%</span>
                        </div>
                        <Progress value={pct} className="h-4 rounded-full bg-slate-100 dark:bg-zinc-800 [&>div]:bg-primary dark:[&>div]:bg-white mb-2" />
                        <div className="flex justify-between text-xs font-bold mt-2">
                            <span className="text-primary dark:text-emerald-400">{new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", minimumFractionDigits: 0 }).format(milestone.saved_amount)}</span>
                            <span className="text-slate-400">Sisa {formatRp(Math.max(0, milestone.target_amount - milestone.saved_amount))}</span>
                        </div>
                    </div>
                </div>

                {/* Info Cards */}
                <div className="grid grid-cols-2 gap-3">
                    <div className="bg-white dark:bg-zinc-900 border border-slate-100 dark:border-zinc-800 rounded-2xl p-4 shadow-sm">
                        <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mb-1">Tenggat Waktu</p>
                        <p className="text-sm font-bold">{deadline.toLocaleDateString("id-ID", { day: 'numeric', month: 'short', year: 'numeric' })}</p>
                    </div>
                    <div className="bg-white dark:bg-zinc-900 border border-slate-100 dark:border-zinc-800 rounded-2xl p-4 shadow-sm">
                        <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mb-1">Status Kecepatan</p>
                        <p className={cn("text-sm font-bold", isOverdue ? "text-rose-500" : "text-emerald-500")}>
                            {milestone.is_completed ? "Tercapai! 🎉" : isOverdue ? "Terlambat" : `Sisa ${Math.max(0, monthsDiff)} Bulan`}
                        </p>
                    </div>
                </div>

                {/* Add Savings Action */}
                {!milestone.is_completed && (
                    <Button 
                        onClick={() => setIsSavingDialog(true)}
                        className="w-full h-14 rounded-2xl font-bold text-base bg-primary text-white hover:bg-primary/90 flex items-center justify-center shadow-lg shadow-primary/25 gap-2"
                    >
                        <Plus className="w-5 h-5" /> Tambah Tabungan
                    </Button>
                )}
                
                {milestone.is_completed && (
                    <div className="bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-100 dark:border-emerald-900/50 rounded-2xl p-6 text-center text-emerald-700 dark:text-emerald-400 font-bold">
                        🎉 Selamat! Detail impian ini sudah sepenuhnya tercapai!
                    </div>
                )}
            </div>

            {/* Dialog Tabungan */}
            <Dialog open={isSavingDialog} onOpenChange={setIsSavingDialog}>
                <DialogContent className="sm:max-w-[425px]">
                    <DialogHeader>
                        <DialogTitle className="text-center font-black text-xl">Setor Tabungan Impian</DialogTitle>
                    </DialogHeader>
                    <div className="py-2 space-y-4">
                        <div className="bg-slate-50 dark:bg-zinc-800/50 p-4 rounded-xl flex justify-between items-center border border-slate-100 dark:border-zinc-700/50">
                            <span className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wide">Saldo Tersedia</span>
                            <span className="font-black text-emerald-600 dark:text-emerald-400">
                                {new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", minimumFractionDigits: 0 }).format(balance)}
                            </span>
                        </div>
                        
                        <div className="relative pt-2">
                            <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 font-bold mt-1">
                                Rp
                            </div>
                            <Input
                                value={saveAmount}
                                onChange={handleAmountChange}
                                placeholder="0"
                                className={cn(
                                    "pl-12 h-14 bg-white dark:bg-zinc-900 border-2 rounded-2xl text-xl font-bold focus-visible:ring-primary shadow-sm",
                                    errorMsg ? "border-rose-500 focus-visible:ring-rose-500" : "border-slate-100 dark:border-zinc-800"
                                )}
                                autoFocus
                            />
                        </div>

                        {errorMsg && (
                            <div className="flex items-center gap-1.5 text-rose-500 text-xs font-bold mt-1 animate-in fade-in">
                                <AlertCircle className="w-4 h-4" />
                                <span>{errorMsg}</span>
                            </div>
                        )}

                        <Button 
                            onClick={handleAddSavings} 
                            disabled={isSaving || !saveAmount}
                            className="w-full h-14 mt-2 rounded-2xl font-bold text-base bg-primary hover:bg-black/90 dark:hover:bg-white/90 text-white dark:text-black shadow-lg shadow-primary/20"
                        >
                            {isSaving ? <Loader2 className="w-5 h-5 animate-spin" /> : "Setor & Simpan"}
                        </Button>
                    </div>
                </DialogContent>
            </Dialog>
        </div>
    );
}

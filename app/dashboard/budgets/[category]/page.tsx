"use client";

import { useState, useEffect, use } from "react";
import { ArrowLeft, Loader2, Home, Car, Plane, Gift, CreditCard, ShoppingBag, Utensils, MoreHorizontal, Zap, Film, Coffee, Calendar } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import { format } from "date-fns";
import { id } from "date-fns/locale";
import { cn } from "@/lib/utils";

const defaultCategories = [
    { value: "food", label: "Makan & Minum", icon: Utensils },
    { value: "transport", label: "Transportasi", icon: Car },
    { value: "shopping", label: "Belanja", icon: ShoppingBag },
    { value: "utilities", label: "Tagihan Listrik/Air", icon: Zap },
    { value: "entertainment", label: "Hiburan", icon: Film },
    { value: "home", label: "Kebutuhan Rumah", icon: Home },
    { value: "travel", label: "Jalan-jalan", icon: Plane },
    { value: "coffee", label: "Ngopi", icon: Coffee },
    { value: "gift", label: "Hadiah", icon: Gift },
    { value: "other", label: "Lain-lain", icon: MoreHorizontal },
];

const iconMap: Record<string, any> = {
    home: Home, car: Car, plane: Plane, gift: Gift, card: CreditCard, bag: ShoppingBag, food: Utensils, more: MoreHorizontal
};

function formatRp(n: number) {
    return new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", minimumFractionDigits: 0 }).format(n);
}

export default function BudgetDetail({ params }: { params: Promise<{ category: string }> }) {
    const { category } = use(params);
    
    const [year, setYear] = useState(new Date().getFullYear());
    const [txs, setTxs] = useState<any[]>([]);
    const [catInfo, setCatInfo] = useState<{label: string, icon: any}>({ label: "Memuat...", icon: MoreHorizontal });
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchTxs = async () => {
            setLoading(true);
            const supabase = createClient();
            const { data: { user } } = await supabase.auth.getUser();
            if (user) {
                // Tentukan Info Kategori
                const def = defaultCategories.find(c => c.value === category);
                if (def) {
                    setCatInfo({ label: def.label, icon: def.icon });
                } else {
                    const { data: custom } = await supabase.from("custom_categories").select("*").eq("user_id", user.id).eq("value", category).single();
                    if (custom) setCatInfo({ label: custom.name, icon: iconMap[custom.icon] || MoreHorizontal });
                    else setCatInfo({ label: "Kategori Dihapus", icon: MoreHorizontal });
                }

                // Get transaksi untuk kategori tsb di tahun terpilih
                const start = new Date(year, 0, 1).toISOString();
                const end = new Date(year, 11, 31, 23, 59, 59).toISOString();

                const { data: tData } = await supabase.from("transactions")
                    .select("*").eq("user_id", user.id).eq("category", category).eq("type", "expense")
                    .gte("created_at", start).lte("created_at", end)
                    .order("created_at", { ascending: false });
                
                if (tData) setTxs(tData);
            }
            setLoading(false);
        };
        fetchTxs();
    }, [year, category]);

    const Icon = catInfo.icon;
    const totalSpent = txs.reduce((s, t) => s + t.amount, 0);

    return (
        <div className="flex flex-col pb-32 min-h-screen bg-slate-50/50 dark:bg-background-dark">
            <div className="px-6 pt-6 mb-6 flex items-center justify-between">
                <div className="flex items-center gap-4">
                    <Link href="/dashboard/budgets">
                        <Button variant="ghost" size="icon" className="rounded-full size-10 bg-slate-100 dark:bg-zinc-800 hover:bg-slate-200">
                            <ArrowLeft className="w-5 h-5" />
                        </Button>
                    </Link>
                    <div>
                        <h1 className="text-xl font-black truncate max-w-[150px]">{catInfo.label}</h1>
                    </div>
                </div>
                <Select value={String(year)} onValueChange={(v) => setYear(Number(v))}>
                    <SelectTrigger className="h-10 rounded-xl bg-white dark:bg-zinc-800 border-0 shadow-sm w-[90px]">
                        <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                        {[2024, 2025, 2026, 2027].map(y => (
                            <SelectItem key={y} value={String(y)}>{y}</SelectItem>
                        ))}
                    </SelectContent>
                </Select>
            </div>

            <div className="px-6 mb-8">
                <div className="bg-primary rounded-2xl p-6 text-white shadow-xl shadow-primary/20 flex flex-col items-center text-center relative overflow-hidden">
                    <div className="relative z-10">
                        <div className="size-16 rounded-2xl bg-white/20 flex items-center justify-center mb-4 mx-auto">
                            <Icon className="w-8 h-8" />
                        </div>
                        <p className="text-white/60 text-xs font-medium uppercase tracking-wider mb-1">Total Pengeluaran ({year})</p>
                        <p className="text-3xl font-black">{formatRp(totalSpent)}</p>
                    </div>
                    <div className="absolute -left-10 -bottom-10 size-40 bg-white/5 rounded-full blur-3xl pointer-events-none" />
                </div>
            </div>

            <div className="px-6 space-y-4">
                <h3 className="font-bold text-sm text-slate-400 uppercase tracking-widest">Riwayat Transaksi</h3>
                
                {loading ? (
                    <div className="flex justify-center p-8"><Loader2 className="w-6 h-6 animate-spin text-primary" /></div>
                ) : txs.length === 0 ? (
                    <div className="text-center p-8 text-slate-400 text-sm">Belum ada transaksi di tahun {year}.</div>
                ) : (
                    txs.map((tx) => (
                        <div key={tx.id} className="flex items-center justify-between p-4 bg-white dark:bg-zinc-800/80 rounded-2xl shadow-sm border border-slate-100 dark:border-zinc-700">
                            <div className="flex items-center gap-4">
                                <div className="size-10 rounded-xl bg-slate-100 dark:bg-zinc-700 flex items-center justify-center text-primary dark:text-white">
                                    <Icon className="w-5 h-5" />
                                </div>
                                <div>
                                    <p className="font-bold text-sm text-slate-800 dark:text-slate-100 truncate max-w-[140px] capitalize">
                                        {tx.note || catInfo.label}
                                    </p>
                                    <p className="text-slate-400 dark:text-slate-500 text-[10px] font-bold uppercase tracking-widest mt-0.5">
                                        {format(new Date(tx.created_at), "d MMM yyyy, HH:mm", { locale: id })}
                                    </p>
                                </div>
                            </div>
                            <span className="font-black text-sm text-rose-500 dark:text-rose-400">
                                -{formatRp(tx.amount)}
                            </span>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
}

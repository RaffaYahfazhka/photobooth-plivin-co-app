"use client";

import { useState, useEffect } from "react";
import { ArrowLeft, ShoppingCart, Utensils, Film, Coffee, Car, Zap, Home, Gift, Plane, ShoppingBag, Plus, MoreHorizontal, CreditCard, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Dialog, DialogContent, DialogTrigger, DialogTitle, DialogDescription, DialogHeader, DialogFooter } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { createClient } from "@/lib/supabase/client";

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
    if (n >= 1000000) return `Rp${(n / 1000000).toFixed(1)}jt`;
    return `Rp${(n / 1000).toFixed(0)}rb`;
}

function getStatus(spent: number, limit: number) {
    if (limit === 0) return { label: "Tidak Dibatasi", color: "text-slate-400" };
    const pct = (spent / limit) * 100;
    if (pct >= 100) return { label: "Over Budget 🔴", color: "text-rose-500" };
    if (pct >= 80) return { label: "Hampir Habis ⚠️", color: "text-amber-500" };
    return { label: "Aman ✅", color: "text-emerald-500" };
}

export default function BudgetsPage() {
    const today = new Date();
    const [month, setMonth] = useState(today.getMonth() + 1);
    const [year, setYear] = useState(today.getFullYear());
    
    const [budgets, setBudgets] = useState<any[]>([]);
    const [customCats, setCustomCats] = useState<any[]>([]);
    const [txs, setTxs] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    const [isAddOpen, setIsAddOpen] = useState(false);
    const [newCat, setNewCat] = useState("");
    const [newAmount, setNewAmount] = useState("");
    const [saving, setSaving] = useState(false);

    const fetchData = async () => {
        setLoading(true);
        const supabase = createClient();
        const { data: { user } } = await supabase.auth.getUser();
        if (user) {
            const { data: catData } = await supabase.from("custom_categories").select("*").eq("user_id", user.id);
            if (catData) setCustomCats(catData);

            const { data: bData } = await supabase.from("budgets")
                .select("*").eq("user_id", user.id).eq("month", month).eq("year", year);
            if (bData) setBudgets(bData);

            const start = new Date(year, month - 1, 1).toISOString();
            const end = new Date(year, month, 0, 23, 59, 59).toISOString();

            const { data: tData } = await supabase.from("transactions")
                .select("*").eq("user_id", user.id).eq("type", "expense")
                .gte("created_at", start).lte("created_at", end);
            if (tData) setTxs(tData);
        }
        setLoading(false);
    };

    useEffect(() => { fetchData(); }, [month, year]);

    const handleSaveBudget = async () => {
        if (!newCat || !newAmount) return;
        setSaving(true);
        const supabase = createClient();
        const { data: { user } } = await supabase.auth.getUser();
        if (user) {
            const numAmount = parseFloat(newAmount);
            // UPSERT strategy: check if exists to update, or just insert (trigger unique violation if constraint exists).
            const { data: existing } = await supabase.from("budgets").select("id").eq("user_id", user.id).eq("category", newCat).eq("month", month).eq("year", year).single();
            if (existing) {
                await supabase.from("budgets").update({ amount: numAmount }).eq("id", existing.id);
            } else {
                await supabase.from("budgets").insert({ user_id: user.id, category: newCat, amount: numAmount, month, year });
            }
            setIsAddOpen(false);
            setNewCat("");
            setNewAmount("");
            await fetchData();
        }
        setSaving(false);
    };

    const combinedOptions = [...defaultCategories, ...customCats.map(c => ({
        value: c.value, label: c.name, icon: iconMap[c.icon] || MoreHorizontal
    }))];

    // Build unified list of expenses by category
    const activeData = combinedOptions.map(cat => {
        const spent = txs.filter(t => t.category === cat.value).reduce((s, t) => s + t.amount, 0);
        const b = budgets.find(b => b.category === cat.value);
        return {
            ...cat,
            spent,
            limit: b ? b.amount : 0,
        };
    }).filter(d => d.spent > 0 || d.limit > 0).sort((a,b) => b.spent - a.spent); // Hide if 0 spent and 0 budget

    const totalSpent = activeData.reduce((s, b) => s + b.spent, 0);
    const totalLimit = activeData.reduce((s, b) => s + b.limit, 0);
    const totalPct = totalLimit > 0 ? Math.round((totalSpent / totalLimit) * 100) : 0;

    const monthNames = ["Januari", "Februari", "Maret", "April", "Mei", "Juni", "Juli", "Agustus", "September", "Oktober", "November", "Desember"];

    return (
        <div className="flex flex-col pb-32 min-h-screen bg-slate-50/50 dark:bg-background-dark">
            {/* Header */}
            <div className="px-6 pt-6 mb-6 flex items-center justify-between">
                <div className="flex items-center gap-4">
                    <Link href="/dashboard">
                        <Button variant="ghost" size="icon" className="rounded-full size-10 bg-slate-100 dark:bg-zinc-800 hover:bg-slate-200">
                            <ArrowLeft className="w-5 h-5" />
                        </Button>
                    </Link>
                    <div>
                        <h1 className="text-2xl font-black">Anggaran Bulanan</h1>
                    </div>
                </div>
                {/* Year/Month Selector */}
                <div className="flex gap-2">
                    <Select value={String(month)} onValueChange={(v) => setMonth(Number(v))}>
                        <SelectTrigger className="h-10 rounded-xl bg-white dark:bg-zinc-800 border-0 shadow-sm w-[110px]">
                            <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                            {monthNames.map((m, i) => (
                                <SelectItem key={i+1} value={String(i+1)}>{m}</SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                    <Select value={String(year)} onValueChange={(v) => setYear(Number(v))}>
                        <SelectTrigger className="h-10 rounded-xl bg-white dark:bg-zinc-800 border-0 shadow-sm w-[90px]">
                            <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                            {[2024,2025,2026,2027].map(y => (
                                <SelectItem key={y} value={String(y)}>{y}</SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </div>
            </div>

            {/* Summary Card */}
            <div className="px-6 mb-8">
                <div className="bg-primary rounded-2xl p-6 text-white shadow-xl shadow-primary/20 relative overflow-hidden">
                    <div className="relative z-10">
                        <div className="flex justify-between items-center mb-4">
                            <div>
                                <p className="text-white/60 text-xs font-medium uppercase tracking-wider">Total Terpakai</p>
                                <p className="text-3xl font-black mt-1">{formatRp(totalSpent)}</p>
                            </div>
                            <div className="text-right">
                                <p className="text-white/60 text-xs font-medium uppercase tracking-wider">Total Anggaran</p>
                                <p className="text-xl font-bold mt-1">{totalLimit > 0 ? formatRp(totalLimit) : 'Belum diatur'}</p>
                            </div>
                        </div>
                        <div className="bg-white/20 rounded-full h-3 overflow-hidden">
                            <div className="bg-white h-full rounded-full transition-all" style={{ width: `${Math.min(totalPct, 100)}%` }} />
                        </div>
                        <p className="text-white/70 text-xs mt-2 font-medium">{totalLimit > 0 ? `${totalPct}% dari total anggaran sudah terpakai` : 'Atur anggaran per kategori untuk melihat persentase'}</p>
                    </div>
                    <div className="absolute -right-10 -bottom-10 size-40 bg-white/5 rounded-full blur-3xl" />
                </div>
            </div>

            {/* Budget List */}
            <div className="px-6 space-y-4">
                <div className="flex items-center justify-between mb-2">
                    <h3 className="font-bold text-sm text-slate-400 uppercase tracking-widest">Kategori Transaksi</h3>
                    <Dialog open={isAddOpen} onOpenChange={setIsAddOpen}>
                        <DialogTrigger asChild>
                            <Button variant="outline" size="sm" className="rounded-full text-xs font-bold gap-1 h-8 px-3 border-slate-200 shadow-sm">
                                <Plus className="w-3.5 h-3.5" /> Atur Anggaran
                            </Button>
                        </DialogTrigger>
                        <DialogContent className="max-w-[400px] w-[90%]">
                            <DialogHeader>
                                <DialogTitle>Atur Batas Anggaran</DialogTitle>
                                <DialogDescription>Tentukan batas dana bulanan untuk kategori pengeluaran ini.</DialogDescription>
                            </DialogHeader>
                            <div className="space-y-4 pt-2">
                                <div className="space-y-2">
                                    <label className="text-xs font-bold uppercase tracking-wider text-slate-500">Pilih Kategori</label>
                                    <Select value={newCat} onValueChange={setNewCat}>
                                        <SelectTrigger className="w-full h-12 rounded-xl bg-slate-50 dark:bg-zinc-800 border-0">
                                            <SelectValue placeholder="Pilih..." />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {combinedOptions.map(c => (
                                                <SelectItem key={c.value} value={c.value}>{c.label}</SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>
                                <div className="space-y-2">
                                    <label className="text-xs font-bold uppercase tracking-wider text-slate-500">Batas Anggaran (Rp)</label>
                                    <Input 
                                        type="number" 
                                        placeholder="Misal: 500000" 
                                        value={newAmount}
                                        onChange={(e) => setNewAmount(e.target.value)}
                                        className="h-12 rounded-xl bg-slate-50 dark:bg-zinc-800 border-0 text-lg font-bold" 
                                    />
                                </div>
                                <Button className="w-full h-12 rounded-xl font-bold" disabled={saving} onClick={handleSaveBudget}>
                                    {saving ? <Loader2 className="w-5 h-5 animate-spin" /> : "Simpan Anggaran"}
                                </Button>
                            </div>
                        </DialogContent>
                    </Dialog>
                </div>

                {loading ? (
                    <div className="flex justify-center p-8"><Loader2 className="w-6 h-6 animate-spin text-primary" /></div>
                ) : activeData.length === 0 ? (
                    <div className="text-center p-8 text-slate-400 text-sm">Belum ada aktivitas dan anggaran di bulan ini.</div>
                ) : (
                    activeData.map((data, i) => {
                        const Icon = data.icon;
                        const pct = data.limit > 0 ? Math.round((data.spent / data.limit) * 100) : 0;
                        const status = getStatus(data.spent, data.limit);
                        return (
                            <Link key={i} href={`/dashboard/budgets/${data.value}`}>
                                <div className="bg-white dark:bg-zinc-800/80 rounded-2xl p-4 space-y-3 shadow-sm border border-slate-100 dark:border-zinc-700 hover:border-primary/20 transition-all block mb-4 group cursor-pointer">
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-3">
                                            <div className="size-10 rounded-xl bg-slate-100 dark:bg-zinc-700 flex items-center justify-center text-primary dark:text-white transition-transform group-hover:scale-105">
                                                <Icon className="w-5 h-5" />
                                            </div>
                                            <div>
                                                <p className="font-bold text-sm">{data.label}</p>
                                                <p className={cn("text-xs font-bold", status.color)}>{status.label}</p>
                                            </div>
                                        </div>
                                        <div className="text-right">
                                            <p className="font-bold text-sm text-slate-800 dark:text-slate-100">{formatRp(data.spent)}</p>
                                            <p className="text-slate-400 text-xs">dari {data.limit > 0 ? formatRp(data.limit) : '∞'}</p>
                                        </div>
                                    </div>
                                    {data.limit > 0 && (
                                        <Progress value={Math.min(pct, 100)} className="bg-slate-100 dark:bg-slate-700 h-2" />
                                    )}
                                </div>
                            </Link>
                        );
                    })
                )}
            </div>
        </div>
    );
}

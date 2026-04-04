"use client";

import { useEffect, useState } from "react";
import {
    Wallet,
    Info,
    PlusCircle,
    ShoppingBag,
    CircleDollarSign,
    Coffee,
    Utensils,
    Car,
    Zap,
    Film,
    Home,
    Plane,
    Gift,
    CreditCard,
    MoreHorizontal,
    Loader2,
    Landmark,
    Smartphone
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { createClient } from "@/lib/supabase/client";
import { format } from "date-fns";
import { id } from "date-fns/locale";

type Transaction = {
    id: string;
    type: "expense" | "income";
    amount: number;
    category: string;
    note: string | null;
    created_at: string;
};

const categoryIcons: Record<string, any> = {
    food: Utensils,
    transport: Car,
    shopping: ShoppingBag,
    utilities: Zap,
    entertainment: Film,
    home: Home,
    travel: Plane,
    coffee: Coffee,
    gift: Gift,
    other: MoreHorizontal,
    income_source: CircleDollarSign, // Default for income if not specified
};

const iconMap: Record<string, any> = {
    home: Home,
    car: Car,
    plane: Plane,
    gift: Gift,
    card: CreditCard,
    bag: ShoppingBag,
    food: Utensils,
    more: MoreHorizontal
};

const categoryLabels: Record<string, string> = {
    food: "Makan & Minum",
    transport: "Transportasi",
    shopping: "Belanja",
    utilities: "Tagihan",
    entertainment: "Hiburan",
    home: "Kebutuhan Rumah",
    travel: "Jalan-jalan",
    coffee: "Ngopi",
    gift: "Hadiah",
    other: "Lain-lain",
};

const ACCOUNT_ICONS: Record<string, any> = {
    bank: Landmark,
    ewallet: Smartphone,
    credit: CreditCard,
    cash: Wallet,
};

export default function DashboardPage() {
    const [transactions, setTransactions] = useState<Transaction[]>([]);
    const [customCategories, setCustomCategories] = useState<any[]>([]);
    const [dashBudgets, setDashBudgets] = useState<any[]>([]);
    const [userAccounts, setUserAccounts] = useState<any[]>([]);
    const [userName, setUserName] = useState("Alex");
    const [stats, setStats] = useState({ balance: 0, income: 0, expense: 0 });
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchData = async () => {
            setLoading(true);
            try {
                const supabase = createClient();
                const { data: { user } } = await supabase.auth.getUser();

                if (!user) {
                    setLoading(false);
                    return;
                }

                // Get profile
                const { data: profile } = await supabase
                    .from("profiles")
                    .select("full_name")
                    .eq("id", user.id)
                    .single();

                if (profile?.full_name) {
                    setUserName(profile.full_name.split(" ")[0]);
                }

                // Fetch everything in parallel for better performance
                const [
                    { data: catData },
                    { data: txs },
                    { data: allAccs },
                    { data: bData }
                ] = await Promise.all([
                    supabase.from("custom_categories").select("*").eq("user_id", user.id),
                    supabase.from("transactions").select("*").eq("user_id", user.id).order("created_at", { ascending: false }).limit(10),
                    supabase.from("accounts").select("*").eq("user_id", user.id),
                    supabase.from("budgets").select("*").eq("user_id", user.id).eq("month", new Date().getMonth() + 1).eq("year", new Date().getFullYear())
                ]);

                if (catData) setCustomCategories(catData);
                if (txs) setTransactions(txs);
                if (allAccs) setUserAccounts(allAccs);

                // Calculate total balance from accounts
                let totalBalance = 0;
                if (allAccs) {
                    allAccs.forEach(a => {
                        totalBalance += Number(a.balance) || 0;
                    });
                }

                // Fetch monthly transactions for stats
                const now = new Date();
                const firstDay = new Date(now.getFullYear(), now.getMonth(), 1).toISOString();
                
                const { data: monthTxs, error: monthError } = await supabase
                    .from("transactions")
                    .select("amount, type, category")
                    .eq("user_id", user.id)
                    .gte("created_at", firstDay);

                if (monthError) {
                    console.error("Error fetching monthly transactions:", monthError);
                }

                let income = 0;
                let expense = 0;
                
                if (monthTxs) {
                    monthTxs.forEach(t => {
                        const amount = Number(t.amount) || 0;
                        if (t.type === 'income') income += amount;
                        else expense += amount;
                    });
                }

                setStats({ balance: totalBalance, income, expense });

                // Calculate budgets
                if (bData) {
                    const monthExpenses = monthTxs ? monthTxs.filter((t: any) => t.type === "expense") : [];
                    const calculatedBudgets = bData.map((b: any) => {
                        const spent = monthExpenses
                            .filter((t: any) => t.category === b.category)
                            .reduce((sum: number, t: any) => sum + (Number(t.amount) || 0), 0);
                        return { ...b, spent };
                    }).sort((a, b) => (b.spent / b.amount) - (a.spent / a.amount));

                    setDashBudgets(calculatedBudgets.slice(0, 5));
                }

            } catch (err) {
                console.error("Dashboard fetchData error:", err);
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, []);

    const formatCurrency = (amount: number) => {
        return new Intl.NumberFormat("id-ID", {
            style: "currency",
            currency: "IDR",
            minimumFractionDigits: 0,
        }).format(amount);
    };

    if (loading) {
        return (
            <div className="flex-1 flex items-center justify-center min-h-screen">
                <Loader2 className="w-8 h-8 text-primary animate-spin" />
            </div>
        );
    }

    return (
        <div className="flex flex-col pb-32">
            {/* Welcome Header */}
            <div className="px-6 pt-6 mb-8">
                <p className="text-slate-500 text-sm font-medium">Yo {userName}, selamat datang kembali!</p>
                <h1 className="text-3xl font-black mt-1">Dasbor Utama</h1>
            </div>

            {/* Total Balance Card */}
            <div className="px-6 mb-8">
                <div className="bg-primary dark:bg-zinc-800 border border-transparent dark:border-zinc-700/80 rounded-xl p-6 text-white shadow-xl shadow-primary/20 dark:shadow-none relative overflow-hidden">
                    <div className="relative z-10">
                        <div className="flex justify-between items-start mb-4">
                            <p className="text-white/70 text-sm font-medium">Total Saldo Kamu</p>
                            <Dialog>
                                <DialogTrigger asChild>
                                    <button className="p-1 hover:bg-white/10 rounded-full transition-colors">
                                        <Info className="text-white/50 w-5 h-5 cursor-help" />
                                    </button>
                                </DialogTrigger>
                                <DialogContent className="sm:max-w-md">
                                    <DialogHeader>
                                        <DialogTitle className="text-xl font-black">Rincian Saldo</DialogTitle>
                                    </DialogHeader>
                                    <div className="space-y-4 pt-4">
                                        <p className="text-sm text-slate-500 dark:text-slate-400 font-medium">Berikut adalah rincian saldo dari seluruh akun dan kartu yang kamu hubungkan:</p>
                                        <div className="grid gap-2">
                                            {userAccounts.length === 0 ? (
                                                <div className="p-8 text-center bg-slate-50 dark:bg-zinc-900 rounded-2xl border border-dashed border-slate-200 dark:border-zinc-800">
                                                    <p className="text-xs text-slate-400 font-bold uppercase tracking-widest">Belum ada akun</p>
                                                </div>
                                            ) : (
                                                userAccounts.map((acc, i) => {
                                                    const Icon = ACCOUNT_ICONS[acc.icon] || Landmark;
                                                    return (
                                                        <div key={i} className="flex items-center justify-between p-3.5 bg-slate-50/50 dark:bg-zinc-900 rounded-2xl border border-slate-100/50 dark:border-zinc-800">
                                                            <div className="flex items-center gap-3">
                                                                <div className={cn("size-10 rounded-xl flex items-center justify-center border border-slate-100 dark:border-zinc-700/50 shadow-sm", acc.color || "bg-white dark:bg-zinc-800 text-primary")}>
                                                                    <Icon className="w-5 h-5 shadow-sm" />
                                                                </div>
                                                                <div>
                                                                    <p className="text-sm font-black text-slate-900 dark:text-white capitalize">{acc.name}</p>
                                                                    <p className="text-[10px] text-slate-400 dark:text-slate-500 uppercase font-black tracking-widest leading-none mt-0.5">{acc.type}</p>
                                                                </div>
                                                            </div>
                                                            <p className="text-sm font-black text-slate-900 dark:text-white">{formatCurrency(Number(acc.balance) || 0)}</p>
                                                        </div>
                                                    );
                                                })
                                            )}
                                        </div>
                                        <div className="pt-4 border-t border-slate-100 dark:border-zinc-800 flex justify-between items-center text-slate-900 dark:text-white mt-2">
                                            <span className="font-bold text-sm uppercase tracking-widest text-slate-400">Total Akumulasi</span>
                                            <span className="font-black text-xl text-primary dark:text-white">{formatCurrency(stats.balance)}</span>
                                        </div>
                                        <div className="pt-2">
                                            <Link href="/dashboard/wallet" className="block">
                                                <Button className="w-full h-12 rounded-xl font-bold bg-slate-100 dark:bg-zinc-800 text-slate-900 dark:text-white hover:bg-slate-200 dark:hover:bg-zinc-700 transition-all border-none">
                                                    <Wallet className="w-4 h-4 mr-2" />
                                                    Kelola Dompet
                                                </Button>
                                            </Link>
                                        </div>
                                    </div>
                                </DialogContent>
                            </Dialog>
                        </div>
                        <h2 className="text-3xl font-bold mb-6">{formatCurrency(stats.balance)}</h2>
                        <div className="flex gap-4">
                            <div className="flex flex-col">
                                <span className="text-white/50 text-[10px] uppercase tracking-wider">Pemasukan Bulan Ini</span>
                                <span className="font-bold text-emerald-400">+{formatCurrency(stats.income)}</span>
                            </div>
                            <div className="w-px h-8 bg-white/10"></div>
                            <div className="flex flex-col">
                                <span className="text-white/50 text-[10px] uppercase tracking-wider">Pengeluaran Bulan Ini</span>
                                <span className="font-bold text-rose-400">-{formatCurrency(stats.expense)}</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Quick Actions */}
            <div className="px-6 mb-10 grid grid-cols-2 gap-3">
                <Link href="/dashboard/transactions/create">
                    <Button className="w-full bg-primary dark:bg-white text-white dark:text-black py-4 rounded-xl font-bold flex flex-col items-center justify-center gap-1.5 hover:opacity-90 transition-all h-auto shadow-md">
                        <PlusCircle className="w-5 h-5 mb-0.5" />
                        <span className="text-xs">Catat Transaksi</span>
                    </Button>
                </Link>
                <Link href="/dashboard/categories/create">
                    <Button variant="outline" className="w-full py-4 rounded-xl font-bold border-slate-200 dark:border-zinc-800 hover:bg-slate-50 dark:hover:bg-zinc-800/50 flex flex-col items-center justify-center gap-1.5 h-auto text-primary dark:text-white shadow-sm font-black">
                        <div className="size-6 bg-primary dark:bg-white rounded-lg flex items-center justify-center">
                            <PlusCircle className="w-4 h-4 text-white dark:text-black" />
                        </div>
                        <span className="text-xs">Buat Kategori</span>
                    </Button>
                </Link>
            </div>

            {/* Budget Management Section */}
            <section className="px-6 mb-10">
                <div className="flex items-center justify-between mb-6">
                    <h3 className="text-xl font-bold">Anggaran Bulanan</h3>
                    <Link href="/dashboard/budgets">
                        <Button variant="link" className="text-sm font-bold text-primary/60 dark:text-white/60 hover:text-primary dark:hover:text-white p-0 h-auto">Lihat Semua</Button>
                    </Link>
                </div>
                <div className="space-y-4">
                    {dashBudgets.length === 0 ? (
                        <div className="p-6 bg-slate-50 dark:bg-zinc-800/50 rounded-2xl text-center">
                            <p className="text-sm text-slate-500">Mulai buat anggaran untuk mengatur keuanganmu lebih baik!</p>
                        </div>
                    ) : (
                        dashBudgets.map((budget) => {
                            const customCat = customCategories.find(c => c.value === budget.category);

                            let Icon = categoryIcons.other;
                            let label = budget.category;

                            if (customCat) {
                                Icon = iconMap[customCat.icon] || categoryIcons.other;
                                label = customCat.name;
                            } else {
                                Icon = categoryIcons[budget.category] || categoryIcons.other;
                                label = categoryLabels[budget.category] || budget.category;
                            }

                            const pct = Math.min(Math.round((budget.spent / budget.amount) * 100), 100);

                            let progressColor = "[&>div]:bg-primary dark:[&>div]:bg-white";
                            if (pct >= 100) progressColor = "[&>div]:bg-rose-500";
                            else if (pct >= 80) progressColor = "[&>div]:bg-amber-500";

                            return (
                                <Link href={`/dashboard/budgets/${budget.category}`} key={budget.id} className="block">
                                    <div className="bg-white dark:bg-zinc-800/30 p-4 rounded-xl shadow-sm border border-slate-100 dark:border-zinc-800 hover:border-primary/20 transition-all group">
                                        <div className="flex items-center gap-3 mb-3">
                                            <div className="w-10 h-10 rounded-lg bg-slate-50 dark:bg-zinc-800 flex items-center justify-center group-hover:bg-primary/10 transition-colors">
                                                <Icon className="w-5 h-5 text-slate-500 dark:text-slate-400 group-hover:text-primary transition-colors" />
                                            </div>
                                            <div className="flex-1">
                                                <div className="flex justify-between items-center mb-1">
                                                    <span className="font-bold text-sm capitalize">{label}</span>
                                                    <span className="text-xs font-black">{pct}%</span>
                                                </div>
                                                <p className="text-[10px] text-slate-400 font-bold tracking-wider uppercase">
                                                    {formatCurrency(budget.spent)} / {formatCurrency(budget.amount)}
                                                </p>
                                            </div>
                                        </div>
                                        <Progress value={pct} className={cn("h-1.5 bg-slate-100 dark:bg-zinc-800/50", progressColor)} />
                                    </div>
                                </Link>
                            );
                        })
                    )}
                </div>
            </section>

            {/* Real Transaction List */}
            <section className="px-6">
                <div className="flex items-center justify-between mb-6">
                    <h3 className="text-xl font-bold">Aktivitas Terakhir</h3>
                    <Link href="/dashboard/activities">
                        <Button variant="link" className="text-sm font-bold text-primary/60 dark:text-white/60 hover:text-primary dark:hover:text-white p-0 h-auto">Lihat Detail</Button>
                    </Link>
                </div>
                <div className="space-y-4">
                    {transactions.length === 0 ? (
                        <div className="p-8 text-center bg-slate-50 dark:bg-zinc-800/20 rounded-2xl">
                            <CircleDollarSign className="w-10 h-10 text-slate-300 mx-auto mb-2" />
                            <p className="text-slate-500 text-sm font-medium">Belum ada transaksi</p>
                        </div>
                    ) : (
                        <>
                            {transactions.slice(0, 5).map((tx) => {
                                const customCat = customCategories.find(c => c.value === tx.category);

                                let Icon = categoryIcons.other;
                                let label = tx.note || tx.category;

                                if (customCat) {
                                    Icon = iconMap[customCat.icon] || categoryIcons.other;
                                    label = tx.note || customCat.name;
                                } else {
                                    Icon = categoryIcons[tx.category] || categoryIcons.other;
                                    label = tx.note || categoryLabels[tx.category] || tx.category;
                                }

                                const date = format(new Date(tx.created_at), "d MMM, HH:mm", { locale: id });

                                return (
                                    <Link key={tx.id} href={`/dashboard/activities/${tx.id}`} className="block">
                                        <div className="flex items-center justify-between p-4 bg-slate-50 dark:bg-zinc-800/50 rounded-xl hover:bg-slate-100 dark:hover:bg-zinc-800 transition-colors border border-transparent dark:border-zinc-700/50">
                                            <div className="flex items-center gap-4">
                                                <div className="size-10 bg-white dark:bg-zinc-700/80 rounded-lg flex items-center justify-center shadow-sm">
                                                    <Icon className="text-primary dark:text-white w-5 h-5" />
                                                </div>
                                                <div>
                                                    <p className="font-bold text-sm text-slate-900 dark:text-white truncate max-w-[150px] capitalize">
                                                        {label}
                                                    </p>
                                                    <p className="text-slate-400 dark:text-slate-500 text-[10px] font-bold uppercase tracking-wider">
                                                        {date}
                                                    </p>
                                                </div>
                                            </div>
                                            <span className={cn(
                                                "font-black text-sm",
                                                tx.type === 'income' ? "text-emerald-500 dark:text-emerald-400" : "text-rose-500 dark:text-rose-400"
                                            )}>
                                                {tx.type === 'income' ? "+" : "-"}{formatCurrency(tx.amount)}
                                            </span>
                                        </div>
                                    </Link>
                                );
                            })}
                            {transactions.length > 0 && (
                                <Link href="/dashboard/activities" className="block pt-2">
                                    <Button variant="ghost" className="w-full text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-zinc-800/50 rounded-xl h-12 font-bold transition-all border border-dashed border-slate-200 dark:border-zinc-800">
                                        Lihat Selengkapnya
                                    </Button>
                                </Link>
                            )}
                        </>
                    )}
                </div>
            </section>
        </div>
    );
}

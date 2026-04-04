"use client";

import { useEffect, useState } from "react";
import { ArrowLeft, Plus, Landmark, Smartphone, Banknote, CreditCard, ArrowDownRight, ArrowUpRight, Loader2, Wallet } from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { createClient } from "@/lib/supabase/client";

const ICONS: Record<string, any> = {
    bank: Landmark,
    ewallet: Smartphone,
    credit: CreditCard,
    cash: Wallet,
};

function formatRp(n: number) {
    return new Intl.NumberFormat("id-ID", {
        style: "currency",
        currency: "IDR",
        minimumFractionDigits: 0,
    }).format(n);
}

export default function WalletPage() {
    const [accounts, setAccounts] = useState<any[]>([]);
    const [totalIncome, setTotalIncome] = useState(0);
    const [totalExpense, setTotalExpense] = useState(0);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchWalletData = async () => {
            setLoading(true);
            const supabase = createClient();
            const { data: { user } } = await supabase.auth.getUser();

            if (user) {
                // 1. Fetch Accounts
                const { data: accData } = await supabase
                    .from("accounts")
                    .select("*")
                    .eq("user_id", user.id)
                    .order("created_at", { ascending: true });
                if (accData) setAccounts(accData);

                // 2. Fetch Tx for In/Out stats
                const { data: txData } = await supabase
                    .from("transactions")
                    .select("amount, type")
                    .eq("user_id", user.id);

                if (txData) {
                    let income = 0;
                    let expense = 0;
                    txData.forEach(tx => {
                        if (tx.type === "income") income += tx.amount;
                        else if (tx.type === "expense") expense += tx.amount;
                    });
                    setTotalIncome(income);
                    setTotalExpense(expense);
                }
            }
            setLoading(false);
        };
        fetchWalletData();
    }, []);

    const accountsTotal = accounts.reduce((sum, acc) => sum + (Number(acc.balance) || 0), 0);
    const totalBalance = accountsTotal;

    return (
        <div className="flex flex-col pb-32 min-h-screen bg-slate-50/50 dark:bg-background-dark">
            {/* Header */}
            <div className="px-6 pt-6 mb-6">
                <h1 className="text-2xl font-black">Dompet Kamu</h1>
                <p className="text-slate-400 text-sm mt-1">Kelola semua akun & saldo kamu</p>
            </div>

            {/* Total Balance */}
            <div className="px-6 mb-8">
                <div className="bg-slate-900 dark:bg-zinc-800 border border-transparent dark:border-zinc-700/80 rounded-3xl p-6 text-white shadow-xl shadow-slate-900/20 dark:shadow-none relative overflow-hidden">
                    <div className="relative z-10">
                        <p className="text-white/50 text-[10px] font-bold uppercase tracking-widest mb-1">Total Limit / Saldo</p>
                        <h2 className="text-3xl font-black">{formatRp(totalBalance)}</h2>
                        <div className="flex gap-6 mt-6">
                            <div className="flex items-center gap-2">
                                <div className="size-8 bg-white/10 rounded-xl flex items-center justify-center backdrop-blur-md">
                                    <ArrowDownRight className="w-4 h-4 text-emerald-400" />
                                </div>
                                <div>
                                    <p className="text-[10px] text-white/50 uppercase font-bold tracking-wider mb-0.5">Uang Masuk</p>
                                    <p className="text-sm font-bold text-emerald-400">+{formatRp(totalIncome)}</p>
                                </div>
                            </div>
                            <div className="flex items-center gap-2">
                                <div className="size-8 bg-white/10 rounded-xl flex items-center justify-center backdrop-blur-md">
                                    <ArrowUpRight className="w-4 h-4 text-rose-400" />
                                </div>
                                <div>
                                    <p className="text-[10px] text-white/50 uppercase font-bold tracking-wider mb-0.5">Uang Keluar</p>
                                    <p className="text-sm font-bold text-rose-400">-{formatRp(totalExpense)}</p>
                                </div>
                            </div>
                        </div>
                    </div>
                    {/* Decor */}
                    <div className="absolute -right-10 -bottom-10 size-40 bg-white/5 rounded-full blur-3xl pointer-events-none" />
                    <div className="absolute right-16 top-4 size-20 bg-white/5 rounded-full blur-2xl pointer-events-none" />
                </div>
            </div>

            {/* Accounts */}
            <section className="px-6 space-y-4">
                <div className="flex items-center justify-between">
                    <h3 className="font-bold text-sm text-slate-500 uppercase tracking-widest">Akun & Kartu</h3>
                    <Link href="/dashboard/wallet/add">
                        <Button variant="outline" size="sm" className="rounded-full text-xs font-bold gap-1 h-8 px-3 border-transparent bg-slate-100 dark:bg-zinc-800 hover:bg-slate-200 dark:hover:bg-zinc-700">
                            <Plus className="w-3.5 h-3.5" />
                            Tambah
                        </Button>
                    </Link>
                </div>
                
                {loading ? (
                    <div className="flex justify-center p-8">
                        <Loader2 className="w-6 h-6 animate-spin text-primary" />
                    </div>
                ) : accounts.length === 0 ? (
                    <div className="p-6 bg-white dark:bg-zinc-800/80 rounded-3xl text-center border border-slate-100 dark:border-zinc-800 shadow-sm">
                        <p className="text-slate-500 font-medium text-sm">Belum ada kartu atau dompet tercatat. Yuk tambahkan saldo pertamamu!</p>
                    </div>
                ) : (
                    <div className="grid gap-3">
                        {accounts.map((acc) => {
                            const Icon = ICONS[acc.icon] || Landmark;
                            return (
                                <div key={acc.id} className="flex items-center justify-between p-4 bg-white dark:bg-zinc-800/80 rounded-[1.25rem] border border-slate-100 dark:border-zinc-800 shadow-sm hover:border-primary/20 transition-all cursor-pointer">
                                    <div className="flex items-center gap-4">
                                        <div className={cn("size-12 rounded-xl flex items-center justify-center shadow-sm", acc.color || "text-slate-500 bg-slate-50")}>
                                            <Icon className="w-6 h-6" />
                                        </div>
                                        <div>
                                            <p className="font-bold text-sm text-slate-900 dark:text-white">{acc.name}</p>
                                            <p className="text-slate-400 dark:text-slate-500 text-xs font-medium mt-0.5">{acc.type}</p>
                                        </div>
                                    </div>
                                    <p className="font-black text-sm text-slate-900 dark:text-white">
                                        Rp{(Number(acc.balance)).toLocaleString("id-ID")}
                                    </p>
                                </div>
                            );
                        })}
                    </div>
                )}
            </section>
        </div>
    );
}

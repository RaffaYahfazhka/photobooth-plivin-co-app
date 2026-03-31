"use client";

import { useState, useEffect } from "react";
import { ArrowLeft, ShoppingBag, CircleDollarSign, Coffee, Car, Utensils, Zap, Film, Gift, Plane, Filter, Home, CreditCard, MoreHorizontal, Loader2, Search, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogTrigger, DialogTitle, DialogDescription, DialogHeader, DialogFooter } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { createClient } from "@/lib/supabase/client";
import { format, isAfter, isBefore, startOfDay, endOfDay } from "date-fns";
import { id } from "date-fns/locale";

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
    home: Home,
    car: Car,
    plane: Plane,
    gift: Gift,
    card: CreditCard,
    bag: ShoppingBag,
    food: Utensils,
    more: MoreHorizontal
};

function formatRp(amount: number) {
    return new Intl.NumberFormat("id-ID", {
        style: "currency",
        currency: "IDR",
        minimumFractionDigits: 0,
    }).format(amount);
}

export default function ActivitiesPage() {
    const [transactions, setTransactions] = useState<any[]>([]);
    const [customCategories, setCustomCategories] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    // Filters state
    const [activeTab, setActiveTab] = useState("all");
    const [searchName, setSearchName] = useState("");
    const [filterCategory, setFilterCategory] = useState("all");
    const [filterMin, setFilterMin] = useState("");
    const [filterMax, setFilterMax] = useState("");
    const [filterStart, setFilterStart] = useState("");
    const [filterEnd, setFilterEnd] = useState("");
    const [isFilterOpen, setIsFilterOpen] = useState(false);

    useEffect(() => {
        const fetchData = async () => {
            const supabase = createClient();
            const { data: { user } } = await supabase.auth.getUser();
            if (user) {
                // Get custom categories
                const { data: catData } = await supabase
                    .from("custom_categories")
                    .select("*")
                    .eq("user_id", user.id);
                if (catData) setCustomCategories(catData);

                // Get transactions
                const { data: txs } = await supabase
                    .from("transactions")
                    .select("*")
                    .eq("user_id", user.id)
                    .order("created_at", { ascending: false });
                if (txs) setTransactions(txs);
            }
            setLoading(false);
        };
        fetchData();
    }, []);

    const allCategoriesOptions = [...defaultCategories, ...customCategories.map(c => ({
        value: c.value, label: c.name, icon: iconMap[c.icon] || MoreHorizontal
    }))];

    let filteredTransactions = transactions.filter(tx => {
        // Tab Filter
        if (activeTab !== "all" && tx.type !== activeTab) return false;

        // Custom Category mapper for display vs search
        const customCat = customCategories.find(c => c.value === tx.category);
        const mappedLabel = tx.note || (customCat ? customCat.name : defaultCategories.find(d => d.value === tx.category)?.label) || tx.category;

        // Search Filter (by note or category name)
        if (searchName && !mappedLabel.toLowerCase().includes(searchName.toLowerCase())) {
            return false;
        }

        // Category Select Filter
        if (filterCategory !== "all" && tx.category !== filterCategory) return false;

        // Amount Filter
        if (filterMin && tx.amount < Number(filterMin)) return false;
        if (filterMax && tx.amount > Number(filterMax)) return false;

        // Date Filter
        if (filterStart) {
            const sDate = startOfDay(new Date(filterStart));
            if (isBefore(new Date(tx.created_at), sDate)) return false;
        }
        if (filterEnd) {
            const eDate = endOfDay(new Date(filterEnd));
            if (isAfter(new Date(tx.created_at), eDate)) return false;
        }

        return true;
    });

    const resetFilters = () => {
        setSearchName("");
        setFilterCategory("all");
        setFilterMin("");
        setFilterMax("");
        setFilterStart("");
        setFilterEnd("");
        setIsFilterOpen(false);
    };

    const totalIncome = filteredTransactions.filter(t => t.type === "income").reduce((s, t) => s + t.amount, 0);
    const totalExpense = filteredTransactions.filter(t => t.type === "expense").reduce((s, t) => s + t.amount, 0);

    return (
        <div className="flex flex-col pb-32 min-h-screen bg-slate-50/50 dark:bg-background-dark">
            {/* Header */}
            <div className="px-6 pt-6 mb-4 flex items-center gap-4">
                <Link href="/dashboard">
                    <Button variant="ghost" size="icon" className="rounded-full size-10 bg-slate-100 dark:bg-zinc-800 hover:bg-slate-200">
                        <ArrowLeft className="w-5 h-5" />
                    </Button>
                </Link>
                <h1 className="text-2xl font-black flex-1">Semua Aktivitas</h1>
                
                {/* Filter Dialog */}
                <Dialog open={isFilterOpen} onOpenChange={setIsFilterOpen}>
                    <DialogTrigger asChild>
                        <Button variant={filterCategory !== "all" || filterStart || filterMin ? "default" : "outline"} size="icon" className="rounded-full size-10 border-slate-200 relative">
                            <Filter className="w-4 h-4" />
                            {(filterCategory !== "all" || filterStart || filterMin) && (
                                <span className="absolute -top-1 -right-1 size-2.5 bg-rose-500 rounded-full border-2 border-white dark:border-zinc-900" />
                            )}
                        </Button>
                    </DialogTrigger>
                    <DialogContent className="max-w-[400px] w-[90%]">
                        <DialogHeader className="mb-4">
                            <DialogTitle className="text-xl font-bold">Filter Transaksi</DialogTitle>
                            <DialogDescription>Kostumisasi pencarian aktivitas data mu.</DialogDescription>
                        </DialogHeader>
                        
                        <div className="space-y-4 max-h-[60vh] overflow-y-auto pb-4 pr-1">
                            <div className="space-y-2">
                                <label className="text-xs font-bold uppercase tracking-wider text-slate-500">Pencarian Nama/Catatan</label>
                                <div className="relative">
                                    <Search className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
                                    <Input 
                                        placeholder="Cari transaksi..." 
                                        value={searchName}
                                        onChange={(e) => setSearchName(e.target.value)}
                                        className="pl-9 h-10 rounded-xl bg-slate-50 dark:bg-zinc-800 border-0" 
                                    />
                                    {searchName && (
                                        <button onClick={() => setSearchName("")} className="absolute right-3 top-3 text-slate-400 hover:text-rose-500">
                                            <X className="w-4 h-4" />
                                        </button>
                                    )}
                                </div>
                            </div>
                            
                            <div className="space-y-2">
                                <label className="text-xs font-bold uppercase tracking-wider text-slate-500">Kategori</label>
                                <Select value={filterCategory} onValueChange={setFilterCategory}>
                                    <SelectTrigger className="w-full h-10 rounded-xl bg-slate-50 dark:bg-zinc-800 border-0">
                                        <SelectValue placeholder="Pilih Kategori" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="all">Semua Kategori</SelectItem>
                                        {allCategoriesOptions.map(c => (
                                            <SelectItem key={c.value} value={c.value}>{c.label}</SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>

                            <div className="grid grid-cols-2 gap-3">
                                <div className="space-y-2">
                                    <label className="text-xs font-bold uppercase tracking-wider text-slate-500">Mulai Tanggal</label>
                                    <Input 
                                        type="date" 
                                        value={filterStart}
                                        onChange={(e) => setFilterStart(e.target.value)}
                                        className="h-10 rounded-xl bg-slate-50 dark:bg-zinc-800 border-0 text-sm" 
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-xs font-bold uppercase tracking-wider text-slate-500">Sampai Tanggal</label>
                                    <Input 
                                        type="date" 
                                        value={filterEnd}
                                        onChange={(e) => setFilterEnd(e.target.value)}
                                        className="h-10 rounded-xl bg-slate-50 dark:bg-zinc-800 border-0 text-sm" 
                                    />
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-3">
                                <div className="space-y-2">
                                    <label className="text-xs font-bold uppercase tracking-wider text-slate-500">Min. Amount</label>
                                    <Input 
                                        type="number" 
                                        placeholder="0" 
                                        value={filterMin}
                                        onChange={(e) => setFilterMin(e.target.value)}
                                        className="h-10 rounded-xl bg-slate-50 dark:bg-zinc-800 border-0" 
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-xs font-bold uppercase tracking-wider text-slate-500">Max. Amount</label>
                                    <Input 
                                        type="number" 
                                        placeholder="Tdk terhingga" 
                                        value={filterMax}
                                        onChange={(e) => setFilterMax(e.target.value)}
                                        className="h-10 rounded-xl bg-slate-50 dark:bg-zinc-800 border-0" 
                                    />
                                </div>
                            </div>
                        </div>
                        
                        <div className="pt-2 flex gap-3">
                            <Button variant="outline" className="flex-1 rounded-xl h-12" onClick={resetFilters}>
                                Reset
                            </Button>
                            <Button className="flex-1 rounded-xl h-12 font-bold" onClick={() => setIsFilterOpen(false)}>
                                Terapkan Filter
                            </Button>
                        </div>
                    </DialogContent>
                </Dialog>
            </div>

            {/* Summary Cards */}
            <div className="px-6 mb-6 flex gap-3">
                <div className="flex-1 bg-emerald-50 dark:bg-emerald-900/20 rounded-2xl p-4 border border-emerald-100 dark:border-emerald-800/30">
                    <p className="text-emerald-600 dark:text-emerald-400 text-[10px] font-bold uppercase tracking-wider mb-1">Pemasukan</p>
                    <p className="text-emerald-700 dark:text-emerald-300 text-lg font-black truncate">+{formatRp(totalIncome)}</p>
                </div>
                <div className="flex-1 bg-rose-50 dark:bg-rose-900/20 rounded-2xl p-4 border border-rose-100 dark:border-rose-800/30">
                    <p className="text-rose-600 dark:text-rose-400 text-[10px] font-bold uppercase tracking-wider mb-1">Pengeluaran</p>
                    <p className="text-rose-700 dark:text-rose-300 text-lg font-black truncate">-{formatRp(totalExpense)}</p>
                </div>
            </div>

            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                <div className="px-6 mb-4">
                    <TabsList className="w-full bg-white dark:bg-zinc-800 rounded-full h-14 p-1 shadow-sm border border-slate-100 dark:border-zinc-700">
                        <TabsTrigger value="all" className="flex-1 rounded-full font-bold h-full data-[state=active]:bg-slate-100 dark:data-[state=active]:bg-zinc-700 transition-all">Semua</TabsTrigger>
                        <TabsTrigger value="income" className="flex-1 rounded-full font-bold h-full data-[state=active]:bg-emerald-100 dark:data-[state=active]:bg-emerald-900/30 data-[state=active]:text-emerald-700 dark:data-[state=active]:text-emerald-400 transition-all">Masuk</TabsTrigger>
                        <TabsTrigger value="expense" className="flex-1 rounded-full font-bold h-full data-[state=active]:bg-rose-100 dark:data-[state=active]:bg-rose-900/30 data-[state=active]:text-rose-700 dark:data-[state=active]:text-rose-400 transition-all">Keluar</TabsTrigger>
                    </TabsList>
                </div>
                
                <div className="px-6 space-y-3 mt-4">
                    {loading ? (
                        <div className="flex items-center justify-center p-12">
                            <Loader2 className="w-8 h-8 text-primary animate-spin" />
                        </div>
                    ) : filteredTransactions.length === 0 ? (
                        <div className="flex flex-col items-center justify-center p-12 text-center bg-white dark:bg-zinc-800/50 rounded-2xl shadow-sm border border-slate-100 dark:border-zinc-700">
                            <div className="size-16 bg-slate-100 dark:bg-zinc-800 rounded-full flex items-center justify-center mb-4">
                                <Search className="w-8 h-8 text-slate-400" />
                            </div>
                            <p className="font-bold text-slate-700 dark:text-slate-300">Data Tidak Ditemukan</p>
                            <p className="text-slate-400 text-xs mt-1">Coba sesuaikan lagi filter pencarianmu.</p>
                            {(searchName || filterCategory !== "all" || filterStart) && (
                                <Button variant="link" onClick={resetFilters} className="text-primary text-xs font-bold mt-2">Reset Filter</Button>
                            )}
                        </div>
                    ) : (
                        filteredTransactions.map((tx) => {
                            const isIncome = tx.type === "income";
                            const customCat = customCategories.find(c => c.value === tx.category);
                            const defCat = defaultCategories.find(d => d.value === tx.category);
                            
                            let Icon = MoreHorizontal;
                            let label = tx.note || tx.category;

                            if (customCat) {
                                Icon = iconMap[customCat.icon] || MoreHorizontal;
                                label = tx.note || customCat.name;
                            } else if (defCat) {
                                Icon = defCat.icon;
                                label = tx.note || defCat.label;
                            } else if (tx.category === "income_source") {
                                Icon = CircleDollarSign;
                                label = tx.note || "Pendapatan";
                            }

                            const formattedDate = format(new Date(tx.created_at), "d MMM yyyy, HH:mm", { locale: id });

                            return (
                                <Link key={tx.id} href={`/dashboard/activities/${tx.id}`} className="block">
                                    <div className="flex items-center justify-between p-4 bg-white dark:bg-zinc-800/80 rounded-2xl shadow-sm border border-slate-100 dark:border-zinc-700 hover:border-primary/20 transition-all group">
                                        <div className="flex items-center gap-4">
                                            <div className={cn(
                                                "size-12 rounded-xl flex items-center justify-center shadow-sm transition-transform group-hover:scale-105",
                                                isIncome ? "bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400" : "bg-rose-50 dark:bg-rose-500/10 text-rose-600 dark:text-rose-400"
                                            )}>
                                                <Icon className="w-6 h-6" />
                                            </div>
                                            <div>
                                                <p className="font-bold text-sm text-slate-800 dark:text-slate-100 truncate max-w-[140px] capitalize">{label}</p>
                                                <p className="text-slate-400 dark:text-slate-500 text-[10px] font-bold uppercase tracking-widest mt-0.5">{formattedDate}</p>
                                            </div>
                                        </div>
                                        <span className={cn("font-black text-sm", isIncome ? "text-emerald-500 dark:text-emerald-400" : "text-rose-500 dark:text-rose-400")}>
                                            {isIncome ? "+" : "-"}{formatRp(tx.amount)}
                                        </span>
                                    </div>
                                </Link>
                            );
                        })
                    )}
                </div>
            </Tabs>
        </div>
    );
}

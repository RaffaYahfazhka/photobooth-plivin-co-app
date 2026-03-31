"use client";

import { useState, useEffect, use } from "react";
import { ArrowLeft, ShoppingBag, CircleDollarSign, Coffee, Car, Utensils, Zap, Film, Gift, Plane, Home, CreditCard, MoreHorizontal, Loader2, Calendar, FileText, Tag, Banknote, Trash2, AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import { format } from "date-fns";
import { id as indonesianLocale } from "date-fns/locale";
import { cn } from "@/lib/utils";
import { useRouter } from "next/navigation";

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

export default function TransactionDetail({ params }: { params: Promise<{ id: string }> }) {
    const { id } = use(params);
    const router = useRouter();
    
    const [transaction, setTransaction] = useState<any>(null);
    const [categoryDetails, setCategoryDetails] = useState<{ label: string, Icon: any }>({ label: "", Icon: MoreHorizontal });
    const [loading, setLoading] = useState(true);
    const [isDeleting, setIsDeleting] = useState(false);
    const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);

    useEffect(() => {
        const fetchData = async () => {
            setLoading(true);
            const supabase = createClient();
            
            const { data: txData } = await supabase.from("transactions").select("*").eq("id", id).single();
            
            if (txData) {
                setTransaction(txData);
                
                // Get custom category context if needed
                const { data: { user } } = await supabase.auth.getUser();
                let customCatData = null;
                if (user) {
                    const { data } = await supabase.from("custom_categories").select("*").eq("user_id", user.id).eq("value", txData.category).single();
                    customCatData = data;
                }

                const defCat = defaultCategories.find(d => d.value === txData.category);
                
                let Icon = MoreHorizontal;
                let label = txData.category;

                if (customCatData) {
                    Icon = iconMap[customCatData.icon] || MoreHorizontal;
                    label = customCatData.name;
                } else if (defCat) {
                    Icon = defCat.icon;
                    label = defCat.label;
                } else if (txData.category === "income_source") {
                    Icon = CircleDollarSign;
                    label = "Pendapatan";
                } else if (txData.category === "gift") {
                    Icon = Gift;
                    label = "Hadiah / Hibah";
                }

                setCategoryDetails({ label, Icon });
            }
            
            setLoading(false);
        };
        fetchData();
    }, [id]);

    const handleDelete = async () => {
        
        setIsDeleting(true);
        const supabase = createClient();

        // Cek jika ini transaksi tabungan milestone, update progres milestone
        if (transaction.note && transaction.note.startsWith("Nabung Target: ")) {
            const milestoneName = transaction.note.replace("Nabung Target: ", "").trim();
            const { data: { user } } = await supabase.auth.getUser();
            
            if (user) {
                // Cari milestone yang namanya sama milik user tersebut
                const { data: milestones } = await supabase
                    .from("milestones")
                    .select("*")
                    .eq("user_id", user.id)
                    .ilike("name", milestoneName)
                    .limit(1);

                if (milestones && milestones.length > 0) {
                    const milestone = milestones[0];
                    const newSaved = Math.max(0, milestone.saved_amount - transaction.amount);
                    const isCompleted = newSaved >= milestone.target_amount;
                    
                    // Kembalikan progress saved_amount milestone
                    await supabase
                        .from("milestones")
                        .update({ saved_amount: newSaved, is_completed: isCompleted })
                        .eq("id", milestone.id);
                }
            }
        }

        // Eksekusi penghapusan transaksi
        await supabase.from("transactions").delete().eq("id", id);
        setIsDeleting(false);
        router.back(); 
    };

    if (loading) {
        return (
            <div className="flex-1 flex items-center justify-center min-h-screen bg-slate-50/50 dark:bg-background-dark">
                <Loader2 className="w-8 h-8 text-primary animate-spin" />
            </div>
        );
    }

    if (!transaction) {
        return (
            <div className="flex-1 flex flex-col items-center justify-center min-h-screen bg-slate-50/50 dark:bg-background-dark px-6">
                <h2 className="text-xl font-bold mb-2">Transaksi tidak ditemukan</h2>
                <Button onClick={() => router.back()}>Kembali</Button>
            </div>
        );
    }

    const { label, Icon } = categoryDetails;
    const isIncome = transaction.type === "income";
    const formattedDate = format(new Date(transaction.created_at), "dd MMMM yyyy", { locale: indonesianLocale });
    const formattedTime = format(new Date(transaction.created_at), "HH:mm", { locale: indonesianLocale });

    return (
        <div className="flex flex-col min-h-screen bg-slate-50/50 dark:bg-zinc-950 pb-8">
            {/* Header */}
            <div className="sticky top-0 z-40 bg-white/80 dark:bg-zinc-950/80 backdrop-blur-md px-6 py-4 flex items-center justify-between border-b border-slate-100 dark:border-zinc-800">
                <div className="flex items-center gap-3">
                    <Button variant="ghost" size="icon" onClick={() => router.back()} className="h-10 w-10 shrink-0 rounded-full hover:bg-slate-100 dark:hover:bg-zinc-800">
                        <ArrowLeft className="w-5 h-5 text-slate-700 dark:text-slate-300" />
                    </Button>
                    <div>
                        <h1 className="text-lg font-black text-slate-900 dark:text-white">Detail Transaksi</h1>
                        <p className="text-xs text-slate-500 font-medium">Informasi Aktivitas</p>
                    </div>
                </div>
            </div>

            <div className="px-6 py-6 space-y-4 max-w-lg mx-auto w-full">
                
                {/* Hero Header Card */}
                <div className="bg-white dark:bg-zinc-900 border border-slate-100 dark:border-zinc-800 shadow-sm rounded-3xl p-6 flex flex-col items-center text-center relative overflow-hidden">
                    <div className={cn(
                        "size-20 rounded-full flex items-center justify-center mb-4 z-10 mx-auto",
                        isIncome ? "bg-emerald-100 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400" : "bg-rose-100 dark:bg-rose-500/10 text-rose-600 dark:text-rose-400"
                    )}>
                        <Icon className="w-10 h-10" />
                    </div>
                    
                    <h2 className={cn("text-3xl font-black mb-1 z-10", isIncome ? "text-emerald-500 dark:text-emerald-400" : "text-slate-900 dark:text-white")}>
                        {isIncome ? "+" : "-"}{formatRp(transaction.amount)}
                    </h2>
                    <p className="text-slate-500 dark:text-slate-400 font-bold capitalize z-10">{transaction.note || label}</p>
                    
                    <div className={cn("absolute inset-x-0 -bottom-10 h-24 blur-3xl rounded-full opacity-20 dark:opacity-10", isIncome ? "bg-emerald-500" : "bg-rose-500")} />
                </div>

                {/* Details Card */}
                <div className="bg-white dark:bg-zinc-900 border border-slate-100 dark:border-zinc-800 shadow-sm rounded-3xl p-6 space-y-6">
                    <div className="flex items-start gap-4">
                        <div className="size-12 rounded-xl flex items-center justify-center bg-slate-50 dark:bg-zinc-800 shrink-0">
                            <Banknote className="w-5 h-5 text-slate-400" />
                        </div>
                        <div className="flex-1 pb-4 border-b border-slate-100 dark:border-zinc-800">
                            <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-1">Tipe Aktivitas</p>
                            <p className="font-bold text-slate-900 dark:text-white">{isIncome ? "Pemasukan (Income)" : "Pengeluaran (Expense)"}</p>
                        </div>
                    </div>

                    <div className="flex items-start gap-4">
                        <div className="size-12 rounded-xl flex items-center justify-center bg-slate-50 dark:bg-zinc-800 shrink-0">
                            <Tag className="w-5 h-5 text-slate-400" />
                        </div>
                        <div className="flex-1 pb-4 border-b border-slate-100 dark:border-zinc-800">
                            <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-1">Kategori</p>
                            <p className="font-bold text-slate-900 dark:text-white capitalize">{label}</p>
                        </div>
                    </div>

                    <div className="flex items-start gap-4">
                        <div className="size-12 rounded-xl flex items-center justify-center bg-slate-50 dark:bg-zinc-800 shrink-0">
                            <Calendar className="w-5 h-5 text-slate-400" />
                        </div>
                        <div className="flex-1 pb-4 border-b border-slate-100 dark:border-zinc-800">
                            <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-1">Tanggal Waktu</p>
                            <p className="font-bold text-slate-900 dark:text-white">{formattedDate}</p>
                            <p className="text-sm font-medium text-slate-500">{formattedTime} WIB</p>
                        </div>
                    </div>

                    <div className="flex items-start gap-4">
                        <div className="size-12 rounded-xl flex items-center justify-center bg-slate-50 dark:bg-zinc-800 shrink-0">
                            <FileText className="w-5 h-5 text-slate-400" />
                        </div>
                        <div className="flex-1">
                            <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-1">Catatan</p>
                            <p className="font-bold text-slate-900 dark:text-white italic">{transaction.note || "Tidak ada catatan."}</p>
                        </div>
                    </div>
                </div>

                <div className="pt-4">
                    <Button 
                        onClick={() => setIsDeleteDialogOpen(true)}
                        className="w-full h-14 rounded-2xl font-bold gap-2 text-base shadow-lg shadow-rose-500/20 bg-rose-500/10 text-rose-600 dark:bg-rose-500/10 dark:text-rose-400 hover:bg-rose-500 hover:text-white transition-colors border border-rose-100 dark:border-rose-900/50"
                    >
                        <Trash2 className="w-5 h-5" />
                        Hapus Transaksi Ini
                    </Button>
                </div>
            </div>

            {/* Custom Glassmorphism Dialog */}
            <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
                <DialogContent className="sm:max-w-[360px]">
                    <div className="flex flex-col items-center text-center space-y-4">
                        <div className="size-16 rounded-full bg-rose-100 dark:bg-rose-500/20 flex items-center justify-center mt-2 border-4 border-white/50 dark:border-zinc-800">
                            <AlertTriangle className="w-8 h-8 text-rose-500" />
                        </div>
                        <div className="space-y-1">
                            <DialogTitle className="text-xl font-black text-slate-900 dark:text-white tracking-tight">Hapus Aktivitas?</DialogTitle>
                            <p className="text-sm text-slate-500 dark:text-slate-400 font-medium px-2 leading-relaxed">Data yang dihapus tidak bisa dikembalikan. Progres impian tabungan juga otomatis akan disesuaikan kembali.</p>
                        </div>
                        <div className="flex flex-col gap-2 w-full pt-4">
                            <Button 
                                variant="destructive" 
                                onClick={handleDelete}
                                disabled={isDeleting}
                                className="w-full h-12 rounded-xl font-bold shadow-lg shadow-rose-500/20 transition-all text-sm bg-rose-500 hover:bg-rose-600 text-white"
                            >
                                {isDeleting ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : null}
                                {isDeleting ? "Menghapus..." : "Ya, Hapus Saja"}
                            </Button>
                            <Button 
                                variant="outline" 
                                onClick={() => setIsDeleteDialogOpen(false)}
                                disabled={isDeleting}
                                className="w-full h-12 rounded-xl font-bold border-slate-200 dark:border-zinc-800 bg-transparent hover:bg-slate-100 dark:hover:bg-zinc-800 transition-all text-sm text-slate-600 dark:text-slate-300"
                            >
                                Batal
                            </Button>
                        </div>
                    </div>
                </DialogContent>
            </Dialog>
        </div>
    );
}

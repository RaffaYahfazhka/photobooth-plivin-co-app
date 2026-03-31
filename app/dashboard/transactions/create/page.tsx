"use client";

import { useState, useCallback, useEffect } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import {
    X,
    Delete,
    Check,
    ShoppingCart,
    Utensils,
    Car,
    Home,
    Zap,
    ShoppingBag,
    Plane,
    Film,
    Coffee,
    Gift,
    CreditCard,
    MoreHorizontal,
    FileText,
    Tag,
    AlertCircle,
    Loader2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";
import Link from "next/link";

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

export default function CreateTransactionPage() {
    const router = useRouter();
    const [type, setType] = useState<"expense" | "income">("expense");
    const [amount, setAmount] = useState("0");
    const [category, setCategory] = useState("");
    const [note, setNote] = useState("");
    const [saving, setSaving] = useState(false);
    const [status, setStatus] = useState<{ type: 'success' | 'error', message: string } | null>(null);
    const [categories, setCategories] = useState<any[]>(defaultCategories);

    useEffect(() => {
        const fetchCategories = async () => {
            const supabase = createClient();
            const { data: { user } } = await supabase.auth.getUser();
            if (user) {
                const { data } = await supabase.from('custom_categories').select('*').eq('user_id', user.id);
                if (data && data.length > 0) {
                    const customCats = data.map(c => ({
                        value: c.value,
                        label: c.name,
                        icon: iconMap[c.icon] || MoreHorizontal,
                    }));
                    setCategories([...defaultCategories, ...customCats]);
                }
            }
        };
        fetchCategories();
    }, []);

    const handleNumPad = useCallback((val: string) => {
        setAmount((prev) => {
            if (val === "backspace") {
                const next = prev.slice(0, -1);
                return next || "0";
            }
            if (val === "." && prev.includes(".")) return prev;
            if (prev === "0" && val !== ".") return val;
            return prev + val;
        });
    }, []);

    const formattedAmount = (() => {
        if (amount === "0") return "0";
        const parts = amount.split(".");
        const integerPart = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ".");
        return parts.length > 1 ? `${integerPart},${parts[1]}` : integerPart;
    })();

    const handleSave = async () => {
        setStatus(null);
        if (amount === "0" || amount === "") {
            setStatus({ type: 'error', message: "Jumlah transaksi harus lebih dari 0!" });
            return;
        }
        if (type === "expense" && !category) {
            setStatus({ type: 'error', message: "Harap pilih kategori transaksi!" });
            return;
        }
        if (type === "income" && !note.trim()) {
            setStatus({ type: 'error', message: "Catatan wajib diisi sebagai Sumber Pemasukan!" });
            return;
        }

        setSaving(true);
        try {
            const supabase = createClient();
            const { data: { user } } = await supabase.auth.getUser();

            if (!user) {
                setStatus({ type: 'error', message: "Sesi berakhir. Silakan login ulang." });
                setSaving(false);
                return;
            }

            const numericAmount = parseFloat(amount);
            const finalCategory = type === "income" ? "gift" : category;

            // 1. Simpan transaksi
            const { error: txError } = await supabase
                .from("transactions")
                .insert({
                    user_id: user.id,
                    type,
                    amount: numericAmount,
                    category: finalCategory,
                    note,
                });

            if (txError) throw txError;

            // 2. Tambah notifikasi
            const verb = type === 'income' ? 'Pemasukan' : 'Pengeluaran';
            const catLabel = categories.find(c => c.value === category)?.label || category;

            await supabase
                .from("notifications")
                .insert({
                    user_id: user.id,
                    title: `${verb} Baru Dicatat`,
                    message: `Kamu mencatat ${verb.toLowerCase()} sebesar Rp ${formattedAmount} untuk ${catLabel}.`,
                });

            setStatus({ type: 'success', message: "Transaksi berhasil dicatat! Mengalihkan..." });

            setTimeout(() => {
                router.push("/dashboard");
                router.refresh();
            }, 1000);
        } catch (error: any) {
            setStatus({ type: 'error', message: "Gagal menyimpan: " + error.message });
            setSaving(false);
        }
    };

    return (
        <div className="flex flex-col min-h-screen bg-white dark:bg-background-dark">
            {/* Header */}
            <header className="flex items-center justify-between px-6 py-4 pt-8">
                <Link href="/dashboard">
                    <Button
                        variant="ghost"
                        size="icon"
                        className="rounded-full size-10 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                    >
                        <X className="w-6 h-6" />
                    </Button>
                </Link>
                <h2 className="text-lg font-bold tracking-tight">Transaksi Baru</h2>
                <div className="w-10" />
            </header>

            {/* Type Toggle */}
            <div className="flex px-6 py-4">
                <div className="flex h-12 flex-1 items-center justify-center rounded-full bg-slate-100 dark:bg-slate-800 p-1">
                    <button
                        onClick={() => setType("expense")}
                        className={cn(
                            "flex h-full grow items-center justify-center rounded-full px-4 text-sm font-semibold transition-all",
                            type === "expense"
                                ? "bg-white dark:bg-slate-700 shadow-sm text-primary dark:text-white"
                                : "text-slate-500 dark:text-slate-400"
                        )}
                    >
                        Pengeluaran
                    </button>
                    <button
                        onClick={() => setType("income")}
                        className={cn(
                            "flex h-full grow items-center justify-center rounded-full px-4 text-sm font-semibold transition-all",
                            type === "income"
                                ? "bg-white dark:bg-slate-700 shadow-sm text-primary dark:text-white"
                                : "text-slate-500 dark:text-slate-400"
                        )}
                    >
                        Pemasukan
                    </button>
                </div>
            </div>

            {/* Status Feedback */}
            {status && (
                <div className="px-6 mb-4 animate-in fade-in slide-in-from-top-2 duration-300">
                    <Alert variant={status.type === 'success' ? 'success' : 'destructive'}>
                        {status.type === 'error' ? <AlertCircle className="h-4 w-4" /> : <Check className="h-4 w-4" />}
                        <AlertTitle>{status.type === 'success' ? "Berhasil!" : "Gagal"}</AlertTitle>
                        <AlertDescription>{status.message}</AlertDescription>
                    </Alert>
                </div>
            )}

            {/* Amount Display */}
            <div className="flex flex-col items-center justify-center flex-1 min-h-[120px] px-6">
                <span className="text-slate-400 dark:text-slate-500 text-sm font-medium mb-2">
                    Jumlah
                </span>
                <h1 className="tracking-tight text-[56px] font-bold leading-none text-center flex items-center text-primary dark:text-white">
                    <span className="text-3xl text-slate-300 dark:text-slate-600 mr-1">
                        Rp
                    </span>
                    {formattedAmount}
                </h1>
            </div>

            {/* Category & Note */}
            <div className="flex flex-col gap-4 px-6 py-4">
                {type === "expense" && (
                    <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none z-10">
                            <Tag className="w-5 h-5 text-slate-400 dark:text-slate-500" />
                        </div>
                        <Select value={category} onValueChange={setCategory}>
                            <SelectTrigger className="w-full h-14 rounded-2xl border-0 bg-slate-50 dark:bg-slate-800 pl-12 pr-4 text-base font-medium cursor-pointer">
                                <SelectValue placeholder="Pilih Kategori" />
                            </SelectTrigger>
                            <SelectContent>
                                {categories.map((cat) => {
                                    const Icon = cat.icon;
                                    return (
                                        <SelectItem key={cat.value} value={cat.value}>
                                            <div className="flex items-center gap-2">
                                                <Icon className="w-4 h-4" />
                                                <span>{cat.label}</span>
                                            </div>
                                        </SelectItem>
                                    );
                                })}
                            </SelectContent>
                        </Select>
                    </div>
                )}

                <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                        <FileText className="w-5 h-5 text-slate-400 dark:text-slate-500" />
                    </div>
                    <Input
                        className="w-full h-14 rounded-2xl border-0 bg-slate-50 dark:bg-slate-800 pl-12 pr-4 text-base font-medium placeholder:text-slate-400"
                        placeholder={type === "income" ? "Sumber Dana (Wajib, cth: Gaji Bulanan)" : "Tambah catatan (opsional)"}
                        value={note}
                        onChange={(e) => setNote(e.target.value)}
                        required={type === "income"}
                    />
                </div>
            </div>

            {/* Numpad & Save */}
            <div className="mt-auto bg-slate-50 dark:bg-slate-800/50 rounded-t-3xl pt-6 pb-8 px-6 border-t border-slate-100 dark:border-slate-800">
                <div className="grid grid-cols-3 gap-y-3 gap-x-6 text-2xl font-semibold text-primary dark:text-white">
                    {["1", "2", "3", "4", "5", "6", "7", "8", "9", ".", "0", "backspace"].map(
                        (key) => (
                            <button
                                key={key}
                                onClick={() => handleNumPad(key)}
                                className={cn(
                                    "h-14 flex items-center justify-center rounded-full hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors active:scale-95",
                                    key === "backspace" && "text-slate-400 dark:text-slate-500"
                                )}
                            >
                                {key === "backspace" ? (
                                    <Delete className="w-7 h-7" />
                                ) : key === "." ? (
                                    <span className="text-lg">,</span>
                                ) : (
                                    key
                                )}
                            </button>
                        )
                    )}
                </div>

                <div className="mt-5">
                    <Button
                        onClick={handleSave}
                        disabled={saving}
                        className="w-full h-14 rounded-full bg-primary dark:bg-slate-100 text-white dark:text-primary font-bold text-lg shadow-lg shadow-primary/20 dark:shadow-white/10 hover:opacity-90 transition-opacity flex items-center justify-center gap-2 disabled:opacity-70"
                    >
                        {saving ? "Menyimpan..." : "Simpan"}
                        {!saving && <Check className="w-5 h-5" />}
                    </Button>
                </div>
            </div>
        </div>
    );
}

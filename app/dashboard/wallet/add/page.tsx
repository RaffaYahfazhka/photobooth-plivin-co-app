"use client";

import { useState } from "react";
import { ArrowLeft, Wallet, Building2, Smartphone, CreditCard, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { cn } from "@/lib/utils";
import { createClient } from "@/lib/supabase/client";

const accountTypes = [
    { id: "bank", label: "Bank", icon: Building2, color: "text-blue-500", bg: "bg-blue-50 dark:bg-blue-900/20" },
    { id: "ewallet", label: "E-Wallet", icon: Smartphone, color: "text-emerald-500", bg: "bg-emerald-50 dark:bg-emerald-900/20" },
    { id: "credit", label: "Kartu Kredit", icon: CreditCard, color: "text-purple-500", bg: "bg-purple-50 dark:bg-purple-900/20" },
    { id: "cash", label: "Tunai", icon: Wallet, color: "text-amber-500", bg: "bg-amber-50 dark:bg-amber-900/20" },
];

export default function AddWalletPage() {
    const router = useRouter();
    const [name, setName] = useState("");
    const [balance, setBalance] = useState("");
    const [selectedType, setSelectedType] = useState("bank");
    const [isSaving, setIsSaving] = useState(false);

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

    const handleBalanceChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setBalance(formatRupiah(e.target.value));
    };

    const handleSave = async (e: React.FormEvent) => {
        e.preventDefault();
        const finalName = selectedType === "cash" ? "Tunai" : name;
        if (!finalName) return;

        setIsSaving(true);
        const supabase = createClient();
        const { data: { user } } = await supabase.auth.getUser();

        if (user) {
            const numericBalance = balance ? parseFloat(balance.replace(/\./g, "")) : 0;
            const typeInfo = accountTypes.find(t => t.id === selectedType);

            await supabase.from("accounts").insert({
                user_id: user.id,
                name: finalName,
                type: typeInfo?.label || "Bank",
                balance: numericBalance,
                icon: typeInfo?.icon.displayName || typeInfo?.id, // fallback identifier
                color: typeInfo?.color || "text-slate-500",
            });
        }
        
        setIsSaving(false);
        router.push("/dashboard/wallet");
    };

    return (
        <div className="flex flex-col min-h-screen pb-8">
            <div className="sticky top-0 z-40 bg-white/80 dark:bg-background-dark/80 backdrop-blur-md px-6 py-4 flex items-center justify-between border-b border-slate-100 dark:border-zinc-800">
                <div className="flex items-center gap-3">
                    <Link href="/dashboard/wallet">
                        <Button variant="ghost" size="icon" className="h-10 w-10 shrink-0 rounded-full hover:bg-slate-100 dark:hover:bg-zinc-800">
                            <ArrowLeft className="w-5 h-5 text-slate-700 dark:text-slate-300" />
                        </Button>
                    </Link>
                    <div>
                        <h1 className="text-lg font-black text-slate-900 dark:text-white">Tambah Akun</h1>
                        <p className="text-xs text-slate-500 font-medium">Buat dompet atau kartu baru</p>
                    </div>
                </div>
            </div>

            <form onSubmit={handleSave} className="flex-1 px-6 py-8 space-y-8">
                {/* Account Types */}
                <div className="space-y-3">
                    <Label className="text-sm font-bold text-slate-700 dark:text-slate-300">Pilih Jenis Akun</Label>
                    <div className="grid grid-cols-2 gap-3">
                        {accountTypes.map((type) => {
                            const Icon = type.icon;
                            const isSelected = selectedType === type.id;
                            return (
                                <button
                                    key={type.id}
                                    type="button"
                                    onClick={() => setSelectedType(type.id)}
                                    className={cn(
                                        "flex flex-col items-center justify-center p-4 rounded-2xl border-2 transition-all gap-2",
                                        isSelected
                                            ? "border-primary bg-primary/5 dark:bg-primary/10"
                                            : "border-slate-100 dark:border-zinc-800 bg-slate-50 dark:bg-zinc-900 hover:border-slate-300 dark:hover:border-zinc-700"
                                    )}
                                >
                                    <div className={cn("size-10 rounded-full flex items-center justify-center", type.bg, type.color)}>
                                        <Icon className="w-5 h-5" />
                                    </div>
                                    <span className={cn("text-xs font-bold", isSelected ? "text-primary dark:text-white" : "text-slate-500")}>
                                        {type.label}
                                    </span>
                                </button>
                            );
                        })}
                    </div>
                </div>

                <div className="space-y-6">
                    {selectedType !== "cash" && (
                        <div className="space-y-2 animate-in fade-in slide-in-from-top-2 duration-300">
                            <Label htmlFor="name" className="text-sm font-bold text-slate-700 dark:text-slate-300">
                                {selectedType === "bank" && "Nama Bank"}
                                {selectedType === "ewallet" && "Nama E-Wallet"}
                                {selectedType === "credit" && "Nama Kartu Kredit"}
                            </Label>
                            <Input
                                id="name"
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                placeholder={
                                    selectedType === "bank" ? "Cth: BCA, Bank Jago, Sinarmas..." :
                                    selectedType === "ewallet" ? "Cth: GoPay, OVO, DANA..." :
                                    selectedType === "credit" ? "Cth: Jenius, Mandiri Kartu Kredit..." : ""
                                }
                                className="h-14 bg-slate-50 dark:bg-zinc-900 border-slate-200 dark:border-zinc-800 rounded-2xl text-base font-medium px-4 focus-visible:ring-primary"
                                required={selectedType !== "cash"}
                            />
                        </div>
                    )}

                    <div className="space-y-2">
                        <Label htmlFor="balance" className="text-sm font-bold text-slate-700 dark:text-slate-300">Saldo Awal</Label>
                        <div className="relative">
                            <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 font-bold">
                                Rp
                            </div>
                            <Input
                                id="balance"
                                value={balance}
                                onChange={handleBalanceChange}
                                placeholder="0"
                                className="pl-12 h-14 bg-slate-50 dark:bg-zinc-900 border-slate-200 dark:border-zinc-800 rounded-2xl text-xl font-bold focus-visible:ring-primary"
                                required
                            />
                        </div>
                        <p className="text-xs text-slate-500 font-medium px-1">Saldo bisa diubah kapan saja</p>
                    </div>
                </div>

                <div className="pt-4">
                    <Button type="submit" disabled={isSaving} className="w-full h-14 rounded-2xl font-bold text-base bg-primary text-white hover:bg-primary/90 flex items-center justify-center shadow-lg shadow-primary/25">
                        {isSaving ? <Loader2 className="w-5 h-5 animate-spin mr-2" /> : null}
                        Simpan Akun
                    </Button>
                </div>
            </form>
        </div>
    );
}

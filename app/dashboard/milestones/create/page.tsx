"use client";

import { useState } from "react";
import { ArrowLeft, Target, CalendarDays, Home, Car, Heart, PlaneTakeoff, Wallet, Laptop, Gamepad, Smartphone, GraduationCap, Loader2, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { cn } from "@/lib/utils";

const ICONS = [
    { name: "target", icon: Target },
    { name: "home", icon: Home },
    { name: "car", icon: Car },
    { name: "heart", icon: Heart },
    { name: "plane", icon: PlaneTakeoff },
    { name: "wallet", icon: Wallet },
    { name: "laptop", icon: Laptop },
    { name: "gamepad", icon: Gamepad },
    { name: "smartphone", icon: Smartphone },
    { name: "graduation", icon: GraduationCap },
];

const COLORS = [
    { name: "blue", class: "bg-blue-500", light: "bg-blue-100 text-blue-600" },
    { name: "rose", class: "bg-rose-500", light: "bg-rose-100 text-rose-600" },
    { name: "emerald", class: "bg-emerald-500", light: "bg-emerald-100 text-emerald-600" },
    { name: "amber", class: "bg-amber-500", light: "bg-amber-100 text-amber-600" },
    { name: "purple", class: "bg-primary", light: "bg-purple-100 text-primary" },
    { name: "teal", class: "bg-teal-500", light: "bg-teal-100 text-teal-600" },
];

export default function CreateMilestonePage() {
    const router = useRouter();
    const [name, setName] = useState("");
    const [targetAmount, setTargetAmount] = useState("");
    const [targetDate, setTargetDate] = useState("");
    
    const [selectedIcon, setSelectedIcon] = useState("target");
    const [selectedColor, setSelectedColor] = useState("blue");
    const [loading, setLoading] = useState(false);

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
        setTargetAmount(formatRupiah(e.target.value));
    };

    const handleSave = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!name || !targetAmount || !targetDate) return;
        
        setLoading(true);
        const supabase = createClient();
        const { data: { user } } = await supabase.auth.getUser();

        if (user) {
            const numericAmount = parseFloat(targetAmount.replace(/\./g, ""));
            
            const { error } = await supabase.from("milestones").insert({
                user_id: user.id,
                name: name,
                target_amount: numericAmount,
                target_date: targetDate,
                icon: selectedIcon,
                color: selectedColor,
                saved_amount: 0,
                is_completed: false
            });

            if (!error) {
                router.push("/dashboard/milestones");
            } else {
                console.error("Failed to save milestone", error);
            }
        }
        setLoading(false);
    };

    return (
        <div className="flex flex-col min-h-screen pb-8 bg-slate-50/50 dark:bg-background-dark">
            <div className="sticky top-0 z-40 bg-white/80 dark:bg-background-dark/80 backdrop-blur-md px-6 py-4 flex items-center justify-between border-b border-slate-100 dark:border-zinc-800">
                <div className="flex items-center gap-3">
                    <Link href="/dashboard/milestones">
                        <Button variant="ghost" size="icon" className="h-10 w-10 shrink-0 rounded-full hover:bg-slate-100 dark:hover:bg-zinc-800">
                            <ArrowLeft className="w-5 h-5 text-slate-700 dark:text-slate-300" />
                        </Button>
                    </Link>
                    <div>
                        <h1 className="text-lg font-black text-slate-900 dark:text-white">Buat Milestone Baru</h1>
                        <p className="text-xs text-slate-500 font-medium">Apa impian besarmu?</p>
                    </div>
                </div>
            </div>

            <form onSubmit={handleSave} className="flex-1 px-6 py-8 space-y-8">
                <div className="space-y-6">
                    <div className="space-y-2">
                        <Label htmlFor="name" className="text-sm font-bold text-slate-700 dark:text-slate-300">Nama Impian/Milestone</Label>
                        <div className="relative">
                            <div className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">
                                <Target className="w-5 h-5" />
                            </div>
                            <Input
                                id="name"
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                placeholder="Cth: Liburan ke Jepang, Beli Laptop..."
                                className="pl-10 h-14 bg-white dark:bg-zinc-900 border-slate-200 shadow-sm dark:border-zinc-800 rounded-2xl text-base font-medium focus-visible:ring-primary"
                                required
                            />
                        </div>
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="amount" className="text-sm font-bold text-slate-700 dark:text-slate-300">Target Dana</Label>
                        <div className="relative">
                            <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 font-bold">
                                Rp
                            </div>
                            <Input
                                id="amount"
                                value={targetAmount}
                                onChange={handleAmountChange}
                                placeholder="0"
                                className="pl-12 h-14 bg-white dark:bg-zinc-900 border-slate-200 shadow-sm dark:border-zinc-800 rounded-2xl text-xl font-bold focus-visible:ring-primary"
                                required
                            />
                        </div>
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="date" className="text-sm font-bold text-slate-700 dark:text-slate-300">Target Tercapai (Kapan?)</Label>
                        <div className="relative">
                            <div className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">
                                <CalendarDays className="w-5 h-5" />
                            </div>
                            <Input
                                id="date"
                                type="date"
                                value={targetDate}
                                onChange={(e) => setTargetDate(e.target.value)}
                                className="pl-10 h-14 bg-white dark:bg-zinc-900 border-slate-200 shadow-sm dark:border-zinc-800 rounded-2xl text-base font-medium focus-visible:ring-primary"
                                required
                            />
                        </div>
                    </div>

                    {/* Icon Selection */}
                    <div className="space-y-3 pt-2">
                        <Label className="text-sm font-bold text-slate-700 dark:text-slate-300">Pilih Ikon</Label>
                        <div className="grid grid-cols-5 gap-3">
                            {ICONS.map((item) => {
                                const Icon = item.icon;
                                const isSelected = selectedIcon === item.name;
                                return (
                                    <button
                                        key={item.name}
                                        type="button"
                                        onClick={() => setSelectedIcon(item.name)}
                                        className={cn(
                                            "aspect-square rounded-2xl border-2 flex items-center justify-center transition-all bg-white dark:bg-zinc-800",
                                            isSelected 
                                                ? "border-primary bg-primary/10 text-primary dark:bg-primary/20" 
                                                : "border-slate-100 dark:border-zinc-700 text-slate-400 hover:border-primary/50"
                                        )}
                                    >
                                        <Icon className={cn("w-6 h-6", isSelected && "scale-110")} />
                                    </button>
                                );
                            })}
                        </div>
                    </div>

                    {/* Color Selection */}
                    <div className="space-y-3 pt-2">
                        <Label className="text-sm font-bold text-slate-700 dark:text-slate-300">Warna Aksen</Label>
                        <div className="flex gap-4">
                            {COLORS.map((color) => {
                                const isSelected = selectedColor === color.name;
                                return (
                                    <button
                                        key={color.name}
                                        type="button"
                                        onClick={() => setSelectedColor(color.name)}
                                        className={cn(
                                            "size-10 rounded-full flex items-center justify-center transition-all border-2",
                                            color.class,
                                            isSelected ? "ring-4 ring-offset-2 ring-primary/30 border-white dark:border-zinc-900 scale-110" : "border-transparent"
                                        )}
                                    >
                                        {isSelected && <Check className="w-5 h-5 text-white" />}
                                    </button>
                                );
                            })}
                        </div>
                    </div>
                </div>

                <div className="pt-4">
                    <Button type="submit" disabled={loading} className="w-full h-14 rounded-2xl font-bold text-base bg-primary text-white hover:bg-primary/90 flex items-center justify-center shadow-lg shadow-primary/25">
                        {loading ? <Loader2 className="w-6 h-6 animate-spin" /> : "Simpan Milestone Baru"}
                    </Button>
                </div>
            </form>
        </div>
    );
}

'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import {
    Home,
    Car,
    Plane,
    Gift,
    CreditCard,
    ShoppingBag,
    Utensils,
    MoreHorizontal,
    TrendingUp,
    ArrowLeft,
    X,
    Loader2,
    Sparkles
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { cn } from '@/lib/utils';

const icons = [
    { id: 'home', icon: Home },
    { id: 'car', icon: Car },
    { id: 'plane', icon: Plane },
    { id: 'gift', icon: Gift },
    { id: 'card', icon: CreditCard },
    { id: 'bag', icon: ShoppingBag },
    { id: 'food', icon: Utensils },
    { id: 'more', icon: MoreHorizontal },
];

const colors = [
    { name: 'dark', hex: '#141414', class: 'bg-primary' },
    { name: 'blue', hex: '#3b82f6', class: 'bg-blue-500' },
    { name: 'emerald', hex: '#10b981', class: 'bg-emerald-500' },
    { name: 'orange', hex: '#f97316', class: 'bg-orange-500' },
    { name: 'slate', hex: '#475569', class: 'bg-slate-600' },
    { name: 'rose', hex: '#f43f5e', class: 'bg-rose-500' },
];

export function CreateCategoryForm() {
    const router = useRouter();
    const [selectedIcon, setSelectedIcon] = useState('home');
    const [selectedColor, setSelectedColor] = useState('dark');
    const [name, setName] = useState('Nabung buat nikah');
    const [saving, setSaving] = useState(false);

    const handleSave = async () => {
        if (!name.trim() || saving) return;
        setSaving(true);
        const supabase = createClient();
        const { data: { user } } = await supabase.auth.getUser();
        
        if (user) {
            await supabase.from('custom_categories').insert({
                user_id: user.id,
                name: name,
                value: `custom_${Date.now()}`,
                icon: selectedIcon,
                color: selectedColor,
            });
            router.push('/dashboard');
            router.refresh();
        }
        setSaving(false);
    };

    return (
        <div className="flex flex-col min-h-[calc(100vh-140px)]">
            <div className="space-y-8 pb-32">
                {/* Category Name Input */}
                <div className="space-y-3">
                    <Label className="text-sm font-bold uppercase tracking-wider text-muted-foreground">
                        Nama Kategori
                    </Label>
                    <Input
                        className="h-16 px-5 rounded-xl border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-lg font-medium focus-visible:ring-primary"
                        placeholder="Mau nabung buat apa nih?"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                    />
                </div>

                {/* Icon Selection */}
                <div className="space-y-4">
                    <div className="flex items-center justify-between">
                        <Label className="text-sm font-bold uppercase tracking-wider text-muted-foreground">
                            Pilih Ikon
                        </Label>
                        <span className="text-xs font-medium text-primary bg-primary/10 px-2 py-1 rounded">24 ikon</span>
                    </div>
                    <div className="grid grid-cols-4 gap-3">
                        {icons.map((item) => {
                            const Icon = item.icon;
                            return (
                                <Button
                                    key={item.id}
                                    variant="outline"
                                    type="button"
                                    onClick={() => setSelectedIcon(item.id)}
                                    className={cn(
                                        "h-16 rounded-xl border-slate-200 dark:border-slate-700 hover:border-primary/50 transition-all",
                                        selectedIcon === item.id && "border-2 border-primary bg-primary/5 text-primary hover:bg-primary/5 hover:text-primary"
                                    )}
                                >
                                    <Icon className="w-6 h-6" />
                                </Button>
                            );
                        })}
                    </div>
                </div>

                {/* Color Picking */}
                <div className="space-y-4">
                    <Label className="text-sm font-bold uppercase tracking-wider text-muted-foreground">
                        Pilih Warna
                    </Label>
                    <div className="flex flex-wrap gap-4">
                        {colors.map((color) => (
                            <button
                                key={color.name}
                                type="button"
                                onClick={() => setSelectedColor(color.name)}
                                className={cn(
                                    "size-10 rounded-full transition-all shrink-0",
                                    color.class,
                                    selectedColor === color.name
                                        ? "border-4 border-white dark:border-slate-800 ring-2 ring-primary scale-110"
                                        : "hover:scale-110"
                                )}
                            />
                        ))}
                    </div>
                </div>

                {/* Future Projection Widget */}
                <Card className="rounded-2xl bg-primary text-white border-none shadow-xl shadow-primary/20 overflow-hidden">
                    <CardContent className="p-5 space-y-4">
                        <div className="flex items-center gap-3">
                            <div className="size-10 rounded-full bg-white/20 flex items-center justify-center">
                                <TrendingUp className="w-6 h-6 text-white" />
                            </div>
                            <div>
                                <h4 className="font-bold">Prediksi Masa Depan</h4>
                                <p className="text-xs text-white/70">Otomatis dihitung AI Plivin!</p>
                            </div>
                        </div>

                        <div className="bg-white/10 rounded-xl p-4 space-y-2">
                            <p className="text-sm leading-relaxed">
                                Kalau kamu simpan <span className="font-bold text-white">$250</span> di kategori ini tiap bulan, kamu bakal capai target di <span className="font-bold text-emerald-400">12 Des 2025</span>. Mantap!
                            </p>
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Scrollable Bottom Action */}
            <div className="mt-8">
                    <Button
                        onClick={handleSave}
                        disabled={saving}
                        className={cn(
                            "w-full h-16 rounded-2xl font-black text-lg text-white transition-all shadow-xl active:scale-95 group relative overflow-hidden",
                            "bg-primary hover:bg-black/90 dark:hover:bg-white/90",
                            saving && "opacity-80 cursor-not-allowed"
                        )}
                    >
                    <span className="relative z-10 flex items-center justify-center gap-2">
                        {saving ? (
                            <>
                                <Loader2 className="w-6 h-6 animate-spin" />
                                Menyimpan...
                            </>
                        ) : (
                            <>
                                Sip, Buat Kategori!
                                <Sparkles className="w-6 h-6 group-hover:scale-110 group-hover:rotate-12 transition-transform" />
                            </>
                        )}
                    </span>
                    <div className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-300 rounded-2xl" />
                </Button>
            </div>
        </div>
    );
}

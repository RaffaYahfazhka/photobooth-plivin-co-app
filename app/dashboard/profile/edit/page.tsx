"use client";

import { useState, useEffect } from "react";
import { ArrowLeft, Camera, User, Mail, Phone, Loader2, Check, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

export default function EditProfilePage() {
    const router = useRouter();
    const [name, setName] = useState("");
    const [email, setEmail] = useState("");
    const [phone, setPhone] = useState("");
    const [avatarUrl, setAvatarUrl] = useState("");
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [success, setSuccess] = useState(false);
    const [error, setError] = useState("");

    useEffect(() => {
        const fetchProfile = async () => {
            const supabase = createClient();
            const { data: { user } } = await supabase.auth.getUser();

            if (user) {
                const { data: profile } = await supabase
                    .from("profiles")
                    .select("*")
                    .eq("id", user.id)
                    .single();

                setName(profile?.full_name || user.user_metadata?.full_name || "");
                setEmail(user.email || "");
                setPhone(profile?.phone || "");
                setAvatarUrl(profile?.avatar_url || "");
            }
            setLoading(false);
        };

        fetchProfile();
    }, []);

    const handleSave = async (e: React.FormEvent) => {
        e.preventDefault();
        setError("");
        setSaving(true);

        try {
            const supabase = createClient();
            const { data: { user } } = await supabase.auth.getUser();

            if (!user) {
                setError("Session expired. Silakan login ulang.");
                setSaving(false);
                return;
            }

            // Update profile in database
            const { error: updateError } = await supabase
                .from("profiles")
                .update({
                    full_name: name,
                    phone: phone,
                    avatar_url: avatarUrl || null,
                    updated_at: new Date().toISOString(),
                })
                .eq("id", user.id);

            if (updateError) {
                setError("Gagal menyimpan: " + updateError.message);
                setSaving(false);
                return;
            }

            // Also update user metadata in auth
            await supabase.auth.updateUser({
                data: { full_name: name },
            });

            setSuccess(true);
            setSaving(false);

            setTimeout(() => {
                router.push("/dashboard/profile");
                router.refresh();
            }, 2000);
        } catch (err) {
            setError("Terjadi kesalahan. Coba lagi.");
            setSaving(false);
        }
    };

    const getInitials = (name: string) => {
        if (!name) return "U";
        return name
            .split(" ")
            .map((n) => n[0])
            .join("")
            .toUpperCase()
            .slice(0, 2);
    };

    const handleAvatarChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        try {
            if (!e.target.files || e.target.files.length === 0) return;
            const file = e.target.files[0];

            // validate limit 2MB
            if (file.size > 2 * 1024 * 1024) {
                setError("Ukuran foto maksimal 2MB!");
                return;
            }

            const fileExt = file.name.split('.').pop();
            const fileName = `${Math.random()}.${fileExt}`;
            const filePath = `${fileName}`;
            setSaving(true);
            setError("");

            const supabase = createClient();
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) {
                setError("Silakan login ulang");
                setSaving(false);
                return;
            }

            const { error: uploadError } = await supabase.storage
                .from('avatars')
                .upload(`${user.id}/${filePath}`, file, { upsert: true });

            if (uploadError) {
                setError("Gagal upload foto: " + uploadError.message);
                setSaving(false);
                return;
            }

            const { data } = supabase.storage
                .from('avatars')
                .getPublicUrl(`${user.id}/${filePath}`);

            setAvatarUrl(data.publicUrl);
            setSaving(false);
        } catch (error) {
            setError("Gagal upload gambar. Coba lagi.");
            setSaving(false);
        }
    };

    return (
        <div className="flex flex-col min-h-screen pb-8">
            <div className="sticky top-0 z-40 bg-white/80 dark:bg-background-dark/80 backdrop-blur-md px-6 py-4 flex items-center justify-between border-b border-slate-100 dark:border-zinc-800">
                <div className="flex items-center gap-3">
                    <Link href="/dashboard/profile">
                        <Button variant="ghost" size="icon" className="h-10 w-10 shrink-0 rounded-full hover:bg-slate-100 dark:hover:bg-zinc-800">
                            <ArrowLeft className="w-5 h-5 text-slate-700 dark:text-slate-300" />
                        </Button>
                    </Link>
                    <div>
                        <h1 className="text-lg font-black text-slate-900 dark:text-white">Edit Profil</h1>
                        <p className="text-xs text-slate-500 font-medium">Ubah info akun kamu</p>
                    </div>
                </div>
            </div>

            {loading ? (
                <div className="flex-1 flex items-center justify-center">
                    <Loader2 className="w-8 h-8 text-primary dark:text-indigo-500 animate-spin" />
                </div>
            ) : (
                <form onSubmit={handleSave} className="flex-1 px-6 py-8 space-y-8">
                    {/* Photo Upload */}
                    <div className="flex flex-col items-center justify-center space-y-4">
                        <div className="relative">
                            <Label htmlFor="avatar-upload" className="cursor-pointer">
                                <Avatar className="size-28 border-4 border-white dark:border-zinc-800 shadow-xl hover:opacity-80 transition-opacity">
                                    {avatarUrl ? (
                                        <AvatarImage src={avatarUrl} alt={name} />
                                    ) : (
                                        <AvatarImage
                                            src="https://i.pinimg.com/736x/b1/21/a4/b121a492a7fc993d7a35505e0976b9b2.jpg"
                                            alt={name}
                                        />
                                    )}
                                    <AvatarFallback>{getInitials(name)}</AvatarFallback>
                                </Avatar>
                                <div className="absolute bottom-0 right-0 bg-primary dark:bg-indigo-600 text-white p-2 rounded-full border-2 border-white dark:border-zinc-800 shadow-sm pointer-events-none">
                                    <Camera className="w-5 h-5 flex-shrink-0" />
                                </div>
                            </Label>
                            <Input
                                id="avatar-upload"
                                type="file"
                                accept="image/jpeg, image/png, image/webp"
                                className="hidden"
                                onChange={handleAvatarChange}
                                disabled={saving}
                            />
                        </div>
                        <p className="text-xs font-bold text-slate-400 capitalize bg-slate-100 dark:bg-zinc-800 px-3 py-1 rounded-full">Format JPG/PNG, ukuran maks 2MB</p>
                    </div>

                    {/* Success Message */}
                    {success && (
                        <Alert variant="success" className="animate-in fade-in slide-in-from-top-4 duration-300">
                            <Check className="h-4 h-4" />
                            <AlertTitle>Berhasil!</AlertTitle>
                            <AlertDescription>
                                Profil kamu sudah diperbarui dan akan kembali ke menu pengaturan.
                            </AlertDescription>
                        </Alert>
                    )}

                    {/* Error Message */}
                    {error && (
                        <Alert variant="destructive" className="animate-in fade-in slide-in-from-top-4 duration-300">
                            <X className="h-4 h-4" />
                            <AlertTitle>Gagal</AlertTitle>
                            <AlertDescription>{error}</AlertDescription>
                        </Alert>
                    )}

                    {/* Form Fields */}
                    <div className="space-y-6">
                        <div className="space-y-2">
                            <Label htmlFor="name" className="text-sm font-bold text-slate-700 dark:text-slate-300">Nama Lengkap</Label>
                            <div className="relative">
                                <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400">
                                    <User className="w-5 h-5" />
                                </div>
                                <Input
                                    id="name"
                                    value={name}
                                    onChange={(e) => setName(e.target.value)}
                                    placeholder="Masukkan nama kamu"
                                    className="pl-12 h-14 bg-slate-50 dark:bg-zinc-900 border-slate-200 dark:border-zinc-800 rounded-2xl text-base font-bold focus-visible:ring-primary"
                                    required
                                    disabled={saving}
                                />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="email" className="text-sm font-bold text-slate-700 dark:text-slate-300">Email Utama</Label>
                            <div className="relative">
                                <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400">
                                    <Mail className="w-5 h-5" />
                                </div>
                                <Input
                                    id="email"
                                    type="email"
                                    value={email}
                                    placeholder="contoh@email.com"
                                    className="pl-12 h-14 bg-slate-50 dark:bg-zinc-900 border-slate-200 dark:border-zinc-800 rounded-2xl text-base font-medium focus-visible:ring-primary text-slate-500"
                                    disabled
                                />
                            </div>
                            <p className="text-xs text-slate-400 ml-1">Email tidak bisa diubah dari sini</p>
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="phone" className="text-sm font-bold text-slate-700 dark:text-slate-300">Nomor WhatsApp</Label>
                            <div className="relative">
                                <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400">
                                    <Phone className="w-5 h-5" />
                                </div>
                                <Input
                                    id="phone"
                                    type="tel"
                                    value={phone}
                                    onChange={(e) => setPhone(e.target.value)}
                                    placeholder="08..."
                                    className="pl-12 h-14 bg-slate-50 dark:bg-zinc-900 border-slate-200 dark:border-zinc-800 rounded-2xl text-base font-medium focus-visible:ring-primary"
                                    disabled={saving}
                                />
                            </div>
                        </div>
                    </div>

                    <div className="pt-4">
                        <Button
                            type="submit"
                            disabled={saving || success}
                            className="w-full h-14 rounded-2xl font-bold text-base bg-primary dark:bg-indigo-600 text-white hover:bg-primary/90 dark:hover:bg-indigo-500 flex items-center justify-center shadow-lg shadow-primary/25 dark:shadow-none disabled:opacity-70"
                        >
                            {saving ? (
                                <>
                                    <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                                    Menyimpan...
                                </>
                            ) : success ? (
                                <>
                                    <Check className="w-5 h-5 mr-2" />
                                    Tersimpan!
                                </>
                            ) : (
                                "Simpan Perubahan"
                            )}
                        </Button>
                    </div>
                </form>
            )}
        </div>
    );
}

"use client";

import { useEffect, useState } from "react";
import { User, CreditCard, Shield, HelpCircle, LogOut, ChevronRight, Bell, Moon, Tag, Loader2 } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

type Profile = {
    id: string;
    full_name: string | null;
    email: string | null;
    avatar_url: string | null;
    plan: string;
};

export default function ProfilePage() {
    const router = useRouter();
    const [profile, setProfile] = useState<Profile | null>(null);
    const [loading, setLoading] = useState(true);
    const [loggingOut, setLoggingOut] = useState(false);

    const profileItems = [
        { icon: User, label: "Info Akun Kamu", href: "/dashboard/profile/edit" },
        { icon: Tag, label: "Kelola Kategori", href: "/dashboard/categories/create" },
        { icon: Bell, label: "Pengaturan Notifikasi", href: "/dashboard/notifications" },
        { icon: Moon, label: "Tampilan App", href: "/dashboard/profile/appearance" },
        { icon: CreditCard, label: "Paket Langganan", href: "/dashboard/profile/subscription" },
        { icon: Shield, label: "Privasi & Keamanan", href: "#" },
        { icon: HelpCircle, label: "Bantuan & Support", href: "#" },
    ];

    useEffect(() => {
        const fetchProfile = async () => {
            const supabase = createClient();
            const { data: { user } } = await supabase.auth.getUser();

            if (user) {
                const { data: profileData } = await supabase
                    .from("profiles")
                    .select("*")
                    .eq("id", user.id)
                    .single();

                setProfile({
                    id: user.id,
                    full_name: profileData?.full_name || user.user_metadata?.full_name || "User",
                    email: user.email || null,
                    avatar_url: profileData?.avatar_url || null,
                    plan: profileData?.plan || "free",
                });
            }
            setLoading(false);
        };

        fetchProfile();
    }, []);

    const handleLogout = async () => {
        setLoggingOut(true);
        const supabase = createClient();
        await supabase.auth.signOut();
        router.push("/login");
        router.refresh();
    };

    const getInitials = (name: string | null) => {
        if (!name) return "U";
        return name
            .split(" ")
            .map((n) => n[0])
            .join("")
            .toUpperCase()
            .slice(0, 2);
    };

    return (
        <div className="flex flex-col">
            {/* Profile Header */}
            <div className="px-6 pt-6 mb-8 text-center flex flex-col items-center">
                <Link href="/dashboard/profile/edit" className="relative group">
                    <Avatar className="size-24 border-4 border-white dark:border-zinc-800 shadow-lg mb-4 cursor-pointer">
                        {profile?.avatar_url ? (
                            <AvatarImage src={profile.avatar_url} alt={profile.full_name || "User"} />
                        ) : (
                            <AvatarImage
                                src="https://i.pinimg.com/736x/b1/21/a4/b121a492a7fc993d7a35505e0976b9b2.jpg"
                                alt={profile?.full_name || "User"}
                            />
                        )}
                        <AvatarFallback>{getInitials(profile?.full_name || null)}</AvatarFallback>
                    </Avatar>
                </Link>
                {loading ? (
                    <div className="space-y-2 flex flex-col items-center">
                        <div className="h-7 w-40 bg-slate-200 dark:bg-zinc-800 rounded-lg animate-pulse" />
                        <div className="h-4 w-52 bg-slate-100 dark:bg-zinc-800/60 rounded-lg animate-pulse" />
                    </div>
                ) : (
                    <>
                        <h2 className="text-2xl font-bold text-slate-900 dark:text-white">
                            {profile?.full_name || "User"}
                        </h2>
                        <p className="text-slate-500 text-sm">{profile?.email || ""}</p>
                        <Link href="/dashboard/profile/subscription">
                            <div className="mt-4 inline-flex items-center px-4 py-1.5 rounded-full bg-primary/10 dark:bg-white/10 text-primary dark:text-white text-xs font-bold uppercase tracking-wider cursor-pointer hover:bg-primary/20 dark:hover:bg-white/20 transition-colors border border-primary/20 dark:border-white/20">
                                {profile?.plan === "pro" ? "Member Pro" : "Free Plan"}
                            </div>
                        </Link>
                    </>
                )}
            </div>

            {/* Profile Settings List */}
            <div className="px-6 space-y-2">
                <h3 className="text-sm font-bold text-slate-400 uppercase tracking-widest pl-2 mb-4">Pengaturan</h3>
                {profileItems.map((item, index) => {
                    const Icon = item.icon;
                    return (
                        <Link key={index} href={item.href}>
                            <button
                                className="w-full flex mb-3 items-center justify-between p-4 bg-slate-50 dark:bg-zinc-800/50 rounded-2xl hover:bg-slate-100 dark:hover:bg-zinc-800 transition-colors border border-transparent dark:border-zinc-700/50"
                            >
                                <div className="flex items-center gap-4">
                                    <div className="size-10 bg-white dark:bg-zinc-700/80 rounded-xl flex items-center justify-center shadow-sm">
                                        <Icon className="text-primary dark:text-white w-5 h-5" />
                                    </div>
                                    <span className="font-bold text-sm text-slate-700 dark:text-slate-200">{item.label}</span>
                                </div>
                                <ChevronRight className="w-5 h-5 text-slate-400" />
                            </button>
                        </Link>
                    );
                })}
            </div>

            {/* Logout Button */}
            <div className="px-6 mt-8 mb-12">
                <Separator className="mb-6 opacity-50" />
                <Button
                    onClick={handleLogout}
                    disabled={loggingOut}
                    variant="destructive"
                    className="w-full h-14 rounded-2xl font-bold flex items-center justify-center gap-2 bg-rose-50 dark:bg-rose-900/20 text-rose-600 dark:text-rose-400 hover:bg-rose-100 dark:hover:bg-rose-900/40 disabled:opacity-70"
                >
                    {loggingOut ? (
                        <>
                            <Loader2 className="w-5 h-5 animate-spin" />
                            <span>Memproses...</span>
                        </>
                    ) : (
                        <>
                            <LogOut className="w-5 h-5" />
                            <span>Keluar Sekarang</span>
                        </>
                    )}
                </Button>
            </div>
        </div>
    );
}

"use client";

import { useEffect, useState } from "react";
import { Wallet, Bell } from "lucide-react";
import Link from "next/link";
import { Button } from "./ui/button";
import { createClient } from "@/lib/supabase/client";

export default function Header() {
    const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
    const [initials, setInitials] = useState("U");
    const [unreadCount, setUnreadCount] = useState(0);

    useEffect(() => {
        const supabase = createClient();
        let channel: any;

        const fetchUnreadCount = async (userId: string) => {
            const { count } = await supabase
                .from("notifications")
                .select("*", { count: "exact", head: true })
                .eq("user_id", userId)
                .eq("is_read", false);
            setUnreadCount(count || 0);
        };

        const init = async () => {
            const { data: { user } } = await supabase.auth.getUser();

            if (user) {
                const { data: profile } = await supabase
                    .from("profiles")
                    .select("avatar_url, full_name")
                    .eq("id", user.id)
                    .single();

                setAvatarUrl(profile?.avatar_url || null);
                const name = profile?.full_name || user.user_metadata?.full_name || "User";
                setInitials(name.split(" ").map((n: string) => n[0]).join("").toUpperCase().slice(0, 2));

                fetchUnreadCount(user.id);

                channel = supabase
                    .channel("header_notifs")
                    .on(
                        "postgres_changes",
                        {
                            event: "*",
                            schema: "public",
                            table: "notifications",
                            filter: `user_id=eq.${user.id}`,
                        },
                        () => {
                            fetchUnreadCount(user.id);
                        }
                    )
                    .subscribe();
            }
        };

        init();

        return () => {
            if (channel) supabase.removeChannel(channel);
        };
    }, []);

    return (
        <header className="flex items-center justify-between border-b border-slate-100 dark:border-zinc-800 px-6 py-4 sticky top-0 bg-white/80 dark:bg-background-dark/80 backdrop-blur-md z-50">
            <Link href="/dashboard" className="flex items-center gap-3">
                <div className="size-8 bg-primary dark:bg-indigo-600 text-white flex items-center justify-center rounded-lg shadow-sm">
                    <Wallet className="w-5 h-5" />
                </div>
                <h2 className="text-slate-900 dark:text-slate-100 text-lg font-bold tracking-tight">Plivin.co</h2>
            </Link>
            <div className="flex items-center gap-3">
                <Link href="/dashboard/notifications">
                    <Button variant="ghost" size="icon" className="rounded-full size-10 bg-slate-100 dark:bg-zinc-800 text-slate-700 dark:text-slate-200 relative">
                        <Bell className="w-5 h-5" />
                        {unreadCount > 0 && (
                            <span className="absolute top-1.5 right-1.5 size-2.5 bg-rose-500 rounded-full border-2 border-white dark:border-zinc-800 animate-pulse" />
                        )}
                    </Button>
                </Link>
                <Link href="/dashboard/profile" className="size-10 rounded-full bg-slate-200 dark:bg-zinc-700 overflow-hidden border-2 border-primary/10 dark:border-zinc-600 flex items-center justify-center">
                    {avatarUrl ? (
                        <img
                            alt="Avatar profil"
                            src={avatarUrl}
                            className="w-full h-full object-cover"
                        />
                    ) : (
                        <img
                            alt="Avatar profil"
                            src="https://i.pinimg.com/736x/b1/21/a4/b121a492a7fc993d7a35505e0976b9b2.jpg"
                            className="w-full h-full object-cover"
                        />
                    )}
                </Link>
            </div>
        </header>
    );
}

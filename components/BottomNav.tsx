"use client";

import { Home, PieChart, Wallet, Settings } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";

export default function BottomNav() {
    const pathname = usePathname();
    const [hasUnread, setHasUnread] = useState(false);

    useEffect(() => {
        const supabase = createClient();
        let channel: any;

        const checkUnread = async (userId: string) => {
            const { count } = await supabase
                .from("notifications")
                .select("*", { count: "exact", head: true })
                .eq("user_id", userId)
                .eq("is_read", false);
            setHasUnread((count || 0) > 0);
        };

        const init = async () => {
            const { data: { user } } = await supabase.auth.getUser();
            if (user) {
                checkUnread(user.id);
                channel = supabase
                    .channel("bottom_nav_notifs")
                    .on(
                        "postgres_changes",
                        { event: "*", schema: "public", table: "notifications", filter: `user_id=eq.${user.id}` },
                        () => checkUnread(user.id)
                    )
                    .subscribe();
            }
        };

        init();
        return () => { if (channel) supabase.removeChannel(channel); };
    }, []);

    const navItems = [
        { href: "/dashboard", icon: Home, label: "Beranda" },
        { href: "/dashboard/milestones", icon: PieChart, label: "Milestone" },
        { href: "/dashboard/wallet", icon: Wallet, label: "Dompet" },
        { href: "/dashboard/profile", icon: Settings, label: "Profil", hasDot: hasUnread },
    ];

    return (
        <div className="fixed bottom-6 inset-x-0 z-50 flex justify-center px-4 pointer-events-none">
            <nav className="w-full max-w-[380px] bg-white/30 dark:bg-black/30 backdrop-blur-xl border border-white/40 dark:border-white/10 rounded-full px-4 py-3 flex justify-between items-center shadow-[0_8px_32px_rgba(0,0,0,0.12)] dark:shadow-[0_8px_32px_rgba(0,0,0,0.6)] pointer-events-auto">
                {navItems.map((item) => {
                    const isActive = pathname === item.href;
                    const Icon = item.icon;
                    return (
                        <Link
                            key={item.href}
                            href={item.href}
                            className={cn(
                                "flex flex-col items-center gap-1 min-w-[64px] py-1.5 rounded-2xl transition-all duration-300 relative",
                                isActive
                                    ? "text-primary dark:text-white bg-white/50 dark:bg-white/10 shadow-sm border border-white/50 dark:border-white/5"
                                    : "text-slate-600 dark:text-slate-400 hover:text-primary dark:hover:text-white"
                            )}
                        >
                            <div className="relative">
                                <Icon strokeWidth={isActive ? 2.5 : 2} className={cn("w-5 h-5 transition-transform duration-300", isActive && "scale-110")} />
                                {item.hasDot && (
                                    <span className="absolute -top-1 -right-1 size-2.5 bg-rose-500 rounded-full border-2 border-white dark:border-zinc-900 animate-pulse" />
                                )}
                            </div>
                            <span className={cn("text-[10px] font-bold transition-all duration-300", isActive ? "opacity-100" : "opacity-80 font-medium")}>{item.label}</span>
                        </Link>
                    );
                })}
            </nav>
        </div>
    );
}

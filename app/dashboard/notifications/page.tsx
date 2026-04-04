"use client";

import { useState, useEffect } from "react";
import { ArrowLeft, Bell, AlertTriangle, PartyPopper, Info, Clock, CheckCheck, Loader2, Inbox } from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { createClient } from "@/lib/supabase/client";
import { format, isToday, isYesterday, subDays } from "date-fns";
import { id as idLocale } from "date-fns/locale";

type DBNotification = {
    id: string;
    title: string;
    message: string;
    is_read: boolean;
    created_at: string;
};

const getIconForTitle = (title: string) => {
    const t = title.toLowerCase();
    if (t.includes('berhasil') || t.includes('tercapai') || t.includes('pemasukan')) {
        return { icon: PartyPopper, bg: "bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400" };
    }
    if (t.includes('hampir') || t.includes('bahaya') || t.includes('pengeluaran')) {
        return { icon: AlertTriangle, bg: "bg-amber-100 dark:bg-amber-900/30 text-amber-600 dark:text-amber-400" };
    }
    if (t.includes('jangan lupa') || t.includes('ingat')) {
        return { icon: Bell, bg: "bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400" };
    }
    return { icon: Info, bg: "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300" };
};

export default function NotificationsPage() {
    const [notifs, setNotifs] = useState<DBNotification[]>([]);
    const [loading, setLoading] = useState(true);

    const fetchNotifs = async () => {
        const supabase = createClient();
        const { data: { user } } = await supabase.auth.getUser();
        if (user) {
            const { data } = await supabase
                .from("notifications")
                .select("*")
                .eq("user_id", user.id)
                .order("created_at", { ascending: false });
            if (data) setNotifs(data);
        }
        setLoading(false);
    };

    useEffect(() => {
        fetchNotifs();

        const supabase = createClient();
        const subscribe = async () => {
            const { data: { user } } = await supabase.auth.getUser();
            if (user) {
                const channel = supabase
                    .channel('notif_page_changes')
                    .on(
                        'postgres_changes',
                        { event: '*', schema: 'public', table: 'notifications', filter: `user_id=eq.${user.id}` },
                        () => {
                            fetchNotifs();
                        }
                    )
                    .subscribe();

                return () => supabase.removeChannel(channel);
            }
        };
        const cleanup = subscribe();
        return () => { cleanup.then(cf => cf && cf()); };
    }, []);

    const markAllAsRead = async () => {
        const supabase = createClient();
        const { data: { user } } = await supabase.auth.getUser();
        if (user) {
            await supabase
                .from("notifications")
                .update({ is_read: true })
                .eq("user_id", user.id)
                .eq("is_read", false);
            fetchNotifs();
        }
    };

    const markAsRead = async (id: string, isRead: boolean) => {
        if (isRead) return;
        const supabase = createClient();
        await supabase
            .from("notifications")
            .update({ is_read: true })
            .eq("id", id);
        fetchNotifs();
    };

    const getSection = (dateStr: string) => {
        const date = new Date(dateStr);
        if (isToday(date)) return "Hari Ini";
        if (isYesterday(date)) return "Kemarin";
        return "Sebelumnya";
    };

    const sections = ["Hari Ini", "Kemarin", "Sebelumnya"];
    const unreadCount = notifs.filter(n => !n.is_read).length;

    return (
        <div className="flex flex-col pb-32">
            {/* Header */}
            <div className="px-6 pt-6 mb-6 flex items-center gap-4">
                <Link href="/dashboard">
                    <Button variant="ghost" size="icon" className="rounded-full size-10 bg-slate-50 dark:bg-zinc-800 hover:bg-slate-100">
                        <ArrowLeft className="w-5 h-5" />
                    </Button>
                </Link>
                <div className="flex-1">
                    <h1 className="text-2xl font-black">Notifikasi</h1>
                </div>
                {unreadCount > 0 && (
                    <span className="text-xs font-bold text-white bg-rose-500 px-2.5 py-1 rounded-full">{unreadCount} baru</span>
                )}
            </div>

            {/* Mark All as Read Button */}
            {unreadCount > 0 && (
                <div className="px-6 mb-4">
                    <Button
                        variant="link"
                        onClick={markAllAsRead}
                        className="p-0 h-auto text-xs font-bold text-primary dark:text-white/80 flex items-center gap-1.5"
                    >
                        <CheckCheck className="w-4 h-4" />
                        Tandai semua sudah dibaca
                    </Button>
                </div>
            )}

            {/* Notification List */}
            {loading ? (
                <div className="flex-1 flex items-center justify-center p-20">
                    <Loader2 className="w-8 h-8 text-primary animate-spin" />
                </div>
            ) : notifs.length === 0 ? (
                <div className="flex flex-col items-center justify-center p-12 text-center">
                    <div className="size-20 bg-slate-50 dark:bg-zinc-800/50 rounded-full flex items-center justify-center mb-4">
                        <Inbox className="w-10 h-10 text-slate-300" />
                    </div>
                    <p className="text-slate-500 font-bold">Belum ada notifikasi</p>
                    <p className="text-slate-400 text-xs mt-1">Nanti info transaksi kamu akan muncul di sini!</p>
                </div>
            ) : (
                sections.map((section) => {
                    const items = notifs.filter((n) => getSection(n.created_at) === section);
                    if (items.length === 0) return null;
                    return (
                        <div key={section} className="mb-6">
                            <h3 className="px-6 text-xs font-bold text-slate-400 uppercase tracking-widest mb-3">{section}</h3>
                            <div className="space-y-3 px-4">
                                {items.map((notif) => {
                                    const { icon: Icon, bg } = getIconForTitle(notif.title);
                                    const time = format(new Date(notif.created_at), "HH:mm", { locale: idLocale });
                                    const date = format(new Date(notif.created_at), "d MMM", { locale: idLocale });

                                    return (
                                        <div
                                            key={notif.id}
                                            onClick={() => markAsRead(notif.id, notif.is_read)}
                                            className={cn(
                                                "flex items-start gap-4 p-4 rounded-2xl transition-colors cursor-pointer",
                                                !notif.is_read
                                                    ? "bg-primary/[0.04] dark:bg-white/5 border border-primary/10 dark:border-white/10"
                                                    : "bg-transparent hover:bg-slate-50 dark:hover:bg-white/5"
                                            )}
                                        >
                                            <div className={cn("size-10 rounded-xl flex items-center justify-center shrink-0 shadow-sm", bg)}>
                                                <Icon className="w-5 h-5" />
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <div className="flex items-start justify-between gap-2">
                                                    <p className={cn("font-bold text-sm leading-snug", !notif.is_read && "text-primary dark:text-white")}>
                                                        {notif.title}
                                                    </p>
                                                    {!notif.is_read && (
                                                        <span className="size-2.5 bg-primary dark:bg-white rounded-full shrink-0 mt-1.5 shadow-sm" />
                                                    )}
                                                </div>
                                                <p className="text-slate-500 dark:text-slate-400 text-xs mt-1 leading-relaxed font-medium">
                                                    {notif.message}
                                                </p>
                                                <div className="flex items-center gap-1 mt-2 text-slate-400">
                                                    <Clock className="w-3 h-3" />
                                                    <span className="text-[10px] font-bold tracking-tight">
                                                        {section === 'Sebelumnya' ? `${date}, ` : ''}{time}
                                                    </span>
                                                </div>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    );
                })
            )}
        </div>
    );
}

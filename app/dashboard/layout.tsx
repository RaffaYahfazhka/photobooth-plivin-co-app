import Header from "@/components/Header";
import BottomNav from "@/components/BottomNav";

export default function DashboardLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <div className="flex min-h-screen justify-center items-start wave-bg-light dark:wave-bg-dark font-display text-primary dark:text-slate-100 transition-colors duration-300">
            <div className="relative flex h-full min-h-screen w-full max-w-[480px] flex-col bg-white/80 dark:bg-background-dark/80 backdrop-blur-sm shadow-2xl overflow-x-hidden border-x border-slate-200/50 dark:border-zinc-800/50">
                <Header />
                <main className="flex-1 px-0 overflow-y-auto pb-32">
                    {children}
                </main>
                <BottomNav />
            </div>
        </div>
    );
}

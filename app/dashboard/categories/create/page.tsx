"use client";

import { ArrowLeft, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { CreateCategoryForm } from "@/components/forms/create-category-form";

export default function CreateCategoryPage() {
    return (
        <div className="flex flex-col min-h-screen bg-white dark:bg-background-dark">
            {/* Header / Navigation */}
            <div className="px-6 py-8 flex items-center justify-between">
                <div className="flex items-center gap-4">
                    <Link href="/dashboard">
                        <Button variant="ghost" size="icon" className="rounded-full size-12 bg-slate-50 dark:bg-zinc-800/50 hover:bg-slate-100 dark:hover:bg-zinc-800 transition-all border border-slate-100 dark:border-zinc-700">
                            <ArrowLeft className="w-6 h-6 text-slate-700 dark:text-slate-200" />
                        </Button>
                    </Link>
                    <div>
                        <h1 className="text-2xl font-black text-slate-900 dark:text-white">Kategori Baru</h1>
                        <p className="text-slate-500 text-xs font-medium uppercase tracking-widest mt-0.5">Tambah Anggaran</p>
                    </div>
                </div>
                <Link href="/dashboard">
                    <Button variant="ghost" size="icon" className="rounded-full size-10 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200">
                        <X className="w-6 h-6" />
                    </Button>
                </Link>
            </div>

            {/* Form Content */}
            <div className="px-6 pb-20">
                <CreateCategoryForm />
            </div>
        </div>
    );
}

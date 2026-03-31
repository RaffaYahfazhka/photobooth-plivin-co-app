import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";

export async function POST() {
    try {
        const supabase = await createClient();

        const { error } = await supabase.auth.signOut();

        if (error) {
            return NextResponse.json(
                { error: error.message },
                { status: 500 }
            );
        }

        return NextResponse.json({ message: "Logout berhasil!" });
    } catch (err) {
        return NextResponse.json(
            { error: "Terjadi kesalahan server" },
            { status: 500 }
        );
    }
}

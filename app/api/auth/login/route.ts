import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";

export async function POST(request: Request) {
    try {
        const { email, password } = await request.json();

        const supabase = await createClient();

        const { data, error } = await supabase.auth.signInWithPassword({
            email,
            password,
        });

        if (error) {
            return NextResponse.json(
                { error: error.message },
                { status: 401 }
            );
        }

        return NextResponse.json({
            user: data.user,
            message: "Login berhasil!",
        });
    } catch (err) {
        return NextResponse.json(
            { error: "Terjadi kesalahan server" },
            { status: 500 }
        );
    }
}

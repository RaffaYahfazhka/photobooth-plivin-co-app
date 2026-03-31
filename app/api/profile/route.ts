import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";

// GET profile
export async function GET() {
    try {
        const supabase = await createClient();

        const { data: { user }, error: authError } = await supabase.auth.getUser();

        if (authError || !user) {
            return NextResponse.json(
                { error: "Unauthorized" },
                { status: 401 }
            );
        }

        const { data: profile, error } = await supabase
            .from("profiles")
            .select("*")
            .eq("id", user.id)
            .single();

        if (error) {
            return NextResponse.json(
                { error: error.message },
                { status: 500 }
            );
        }

        return NextResponse.json({
            profile: {
                ...profile,
                email: user.email,
            },
        });
    } catch (err) {
        return NextResponse.json(
            { error: "Terjadi kesalahan server" },
            { status: 500 }
        );
    }
}

// UPDATE profile
export async function PUT(request: Request) {
    try {
        const supabase = await createClient();

        const { data: { user }, error: authError } = await supabase.auth.getUser();

        if (authError || !user) {
            return NextResponse.json(
                { error: "Unauthorized" },
                { status: 401 }
            );
        }

        const body = await request.json();
        const { fullName, phone, avatarUrl } = body;

        // Update profile in database
        const { data: profile, error } = await supabase
            .from("profiles")
            .update({
                full_name: fullName,
                phone: phone,
                avatar_url: avatarUrl,
                updated_at: new Date().toISOString(),
            })
            .eq("id", user.id)
            .select()
            .single();

        if (error) {
            return NextResponse.json(
                { error: error.message },
                { status: 500 }
            );
        }

        // Also update user metadata in auth
        await supabase.auth.updateUser({
            data: {
                full_name: fullName,
            },
        });

        return NextResponse.json({
            profile: {
                ...profile,
                email: user.email,
            },
            message: "Profil berhasil diperbarui!",
        });
    } catch (err) {
        return NextResponse.json(
            { error: "Terjadi kesalahan server" },
            { status: 500 }
        );
    }
}

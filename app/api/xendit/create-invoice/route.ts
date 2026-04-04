import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { Xendit } from "xendit-node";

const xenditClient = new Xendit({
    secretKey: process.env.XENDIT_SECRET_KEY || "",
});

export async function POST(request: NextRequest) {
    try {
        const supabase = await createClient();
        const { data: { user } } = await supabase.auth.getUser();

        if (!user) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const { data: profile } = await supabase
            .from("profiles")
            .select("plan, full_name")
            .eq("id", user.id)
            .single();

        if (profile?.plan === "pro") {
            return NextResponse.json({ error: "Kamu sudah di paket Pro!" }, { status: 400 });
        }

        const externalId = `plivin-pro-${user.id}-${Date.now()}`;
        const appUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";

        const { Invoice } = xenditClient;

        const invoice = await Invoice.createInvoice({
            data: {
                externalId,
                amount: 29000,
                currency: "IDR",
                description: "Langganan Santuy Pro - Plivin.co (1 Bulan)",
                payerEmail: user.email || undefined,
                invoiceDuration: 86400, // 24 jam
                successRedirectUrl: `${appUrl}/dashboard/profile/subscription?status=success`,
                failureRedirectUrl: `${appUrl}/dashboard/profile/subscription?status=failed`,
            },
        });

        // Save pending subscription
        await supabase.from("subscriptions").upsert(
            {
                user_id: user.id,
                plan: "pro",
                status: "pending",
                xendit_invoice_id: invoice.id,
                xendit_external_id: externalId,
                amount: 29000,
                updated_at: new Date().toISOString(),
            },
            { onConflict: "user_id" }
        );

        return NextResponse.json({
            invoiceUrl: invoice.invoiceUrl,
            invoiceId: invoice.id,
        });
    } catch (error: any) {
        console.error("Xendit create invoice error:", error);
        return NextResponse.json(
            { error: error?.message || "Gagal membuat invoice" },
            { status: 500 }
        );
    }
}

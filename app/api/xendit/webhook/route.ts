import { NextRequest, NextResponse } from "next/server";
import { createServerClient } from "@supabase/ssr";

/**
 * Xendit Webhook Handler
 * Receives payment notifications from Xendit and updates subscription status.
 * 
 * Xendit sends a POST request with:
 * - x-callback-token header for verification
 * - JSON body with payment status
 */
export async function POST(request: NextRequest) {
    try {
        // 1. Verify callback token
        const callbackToken = request.headers.get("x-callback-token");
        const expectedToken = process.env.XENDIT_WEBHOOK_TOKEN;

        if (expectedToken && callbackToken !== expectedToken) {
            console.error("Xendit webhook: Invalid callback token");
            return NextResponse.json({ error: "Invalid token" }, { status: 401 });
        }

        // 2. Parse request body
        const body = await request.json();
        const { external_id, status, id: invoiceId } = body;

        if (!external_id || !status) {
            return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
        }

        // 3. Create Supabase client with service role key (bypasses RLS)
        const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
        const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

        const supabase = createServerClient(supabaseUrl, supabaseServiceKey, {
            cookies: {
                getAll: () => [],
                setAll: () => {},
            },
        });

        // 4. Find the subscription by external_id
        const { data: subscription, error: findError } = await supabase
            .from("subscriptions")
            .select("*")
            .eq("xendit_external_id", external_id)
            .single();

        if (findError || !subscription) {
            console.error("Xendit webhook: Subscription not found for", external_id);
            return NextResponse.json({ error: "Subscription not found" }, { status: 404 });
        }

        // 5. Handle payment status
        const now = new Date();

        if (status === "PAID" || status === "SETTLED") {
            // Payment successful → activate Pro
            const periodEnd = new Date(now);
            periodEnd.setMonth(periodEnd.getMonth() + 1); // +1 month

            await supabase
                .from("subscriptions")
                .update({
                    status: "active",
                    xendit_invoice_id: invoiceId || subscription.xendit_invoice_id,
                    current_period_start: now.toISOString(),
                    current_period_end: periodEnd.toISOString(),
                    updated_at: now.toISOString(),
                })
                .eq("user_id", subscription.user_id);

            // Update profiles.plan to 'pro'
            await supabase
                .from("profiles")
                .update({ plan: "pro", updated_at: now.toISOString() })
                .eq("id", subscription.user_id);

            console.log(`✅ Subscription activated for user ${subscription.user_id}`);
        } else if (status === "EXPIRED" || status === "FAILED") {
            // Payment failed/expired → revert to basic
            await supabase
                .from("subscriptions")
                .update({
                    status: "expired",
                    updated_at: now.toISOString(),
                })
                .eq("user_id", subscription.user_id);

            // Revert plan to free
            await supabase
                .from("profiles")
                .update({ plan: "free", updated_at: now.toISOString() })
                .eq("id", subscription.user_id);

            console.log(`⚠️ Subscription expired/failed for user ${subscription.user_id}`);
        }

        return NextResponse.json({ received: true });
    } catch (error: any) {
        console.error("Xendit webhook error:", error);
        return NextResponse.json(
            { error: "Internal server error" },
            { status: 500 }
        );
    }
}

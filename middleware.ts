import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

export async function middleware(request: NextRequest) {
    let supabaseResponse = NextResponse.next({
        request,
    });

    try {
        const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
        const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_DEFAULT_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

        if (!supabaseUrl || !supabaseKey) {
            console.error("Supabase environment variables are missing!");
            return supabaseResponse;
        }

        const supabase = createServerClient(
            supabaseUrl,
            supabaseKey,
            {
                cookies: {
                    getAll() {
                        return request.cookies.getAll();
                    },
                    setAll(cookiesToSet) {
                        cookiesToSet.forEach(({ name, value }) =>
                            request.cookies.set(name, value)
                        );
                        supabaseResponse = NextResponse.next({
                            request,
                        });
                        cookiesToSet.forEach(({ name, value, options }) =>
                            supabaseResponse.cookies.set(name, value, options)
                        );
                    },
                },
            }
        );

        // IMPORTANT: DO NOT use supabase.auth.getSession() here.
        // Use getUser() instead for security.
        const {
            data: { user },
        } = await supabase.auth.getUser();

        // If user is NOT logged in and trying to access /dashboard
        if (
            !user &&
            request.nextUrl.pathname.startsWith("/dashboard")
        ) {
            const url = request.nextUrl.clone();
            url.pathname = "/login";
            return NextResponse.redirect(url);
        }

        // If user IS logged in and trying to access /login or /signup
        if (
            user &&
            (request.nextUrl.pathname === "/login" ||
                request.nextUrl.pathname === "/signup")
        ) {
            const url = request.nextUrl.clone();
            url.pathname = "/dashboard";
            return NextResponse.redirect(url);
        }
    } catch (e) {
        console.error("Middleware Auth Error:", e);
        // Fallback: allow the request to proceed instead of crashing with 500
        return supabaseResponse;
    }

    return supabaseResponse;
}

export const config = {
    matcher: [
        /*
         * Match all request paths except for _next/static, _next/image,
         * favicon.ico, sw.js, and public files.
         */
        "/((?!_next/static|_next/image|favicon.ico|sw\\.js|manifest\\.webmanifest|icons/.*|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
    ],
};

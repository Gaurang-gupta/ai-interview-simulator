import { createServerClient } from "@supabase/ssr";
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export async function proxy(req: NextRequest) {
    const res = NextResponse.next();

    const supabase = createServerClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
        {
            cookies: {
                get(name) {
                    return req.cookies.get(name)?.value;
                },
                set(name, value, options) {
                    res.cookies.set({ name, value, ...options });
                },
                remove(name, options) {
                    res.cookies.set({ name, value: "", ...options });
                },
            },
        }
    );

    const {
        data: { user },
    } = await supabase.auth.getUser();

    const isAuthPage = req.nextUrl.pathname.startsWith("/login") ||
        req.nextUrl.pathname.startsWith("/signup");

    const isProtected = req.nextUrl.pathname.startsWith("/dashboard") ||
        req.nextUrl.pathname.startsWith("/topic") ||
        req.nextUrl.pathname.startsWith("/test") ||
        req.nextUrl.pathname.startsWith("/results") ||
        req.nextUrl.pathname.startsWith("/history");

    // If not logged in and trying to access protected route
    if (!user && isProtected) {
        return NextResponse.redirect(new URL("/login", req.url));
    }

    // If logged in and trying to access auth pages
    if (user && isAuthPage) {
        return NextResponse.redirect(new URL("/dashboard", req.url));
    }

    return res;
}

export const config = {
    matcher: [
        "/dashboard",
        "/topic/:path*",
        "/test/:path*",
        "/results/:path*",
        "/history",
        "/login",
        "/signup",
    ],
};
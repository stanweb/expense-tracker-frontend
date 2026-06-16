// BFF-style proxy: forwards browser requests to the backend server-side, including
// the Authorization header. This eliminates CORS and gives the frontend a stable
// same-origin surface while the backend lives on the internal Docker network.
//
// Excludes /api/ai/* so Next.js route handlers (Groq + internal backend calls)
// are served as normal.
import { NextRequest, NextResponse } from "next/server";

const BACKEND = process.env.INTERNAL_API_BASE_URL || "http://backend:8080/api";

export function middleware(req: NextRequest) {
    const { pathname, search } = req.nextUrl;

    if (!pathname.startsWith("/api/") || pathname.startsWith("/api/ai/")) {
        return NextResponse.next();
    }

    const backendPath = pathname.replace(/^\/api/, "");
    const destination = `${BACKEND}${backendPath}${search}`;

    const requestHeaders = new Headers();
    const auth = req.headers.get("authorization");
    if (auth) requestHeaders.set("authorization", auth);
    const contentType = req.headers.get("content-type");
    if (contentType) requestHeaders.set("content-type", contentType);
    requestHeaders.set("x-forwarded-host", req.nextUrl.host);
    requestHeaders.set("x-forwarded-proto", req.nextUrl.protocol.replace(":", ""));
    requestHeaders.set(
        "x-forwarded-for",
        req.headers.get("x-forwarded-for") || "127.0.0.1"
    );

    return NextResponse.rewrite(new URL(destination), {
        request: { headers: requestHeaders },
    });
}

export const config = {
    matcher: "/api/:path*",
};

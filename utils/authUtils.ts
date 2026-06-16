import { NextRequest, NextResponse } from "next/server";
import serverBackendAxios from "@/utils/serverBackendAxios";

interface AuthenticatedUser {
    userId: number;
    token: string;
}

export async function getAuthenticatedUser(req: NextRequest): Promise<{ user?: AuthenticatedUser; errorResponse?: NextResponse }> {
    const authHeader = req.headers.get("Authorization");
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
        return { errorResponse: NextResponse.json({ error: "Unauthorized: Missing or invalid token" }, { status: 401 }) };
    }

    const token = authHeader.split(" ")[1];
    let userId: number;

    try {
        const userResponse = await serverBackendAxios.get("auth/validate-session", {
            headers: { Authorization: `Bearer ${token}` },
        });
        userId = userResponse.data.userId;
    } catch (error: any) {
        console.error("Token validation failed:", error.response?.data || error.message);
        return { errorResponse: NextResponse.json({ error: "Unauthorized: Invalid token" }, { status: 401 }) };
    }

    if (!userId) {
        return { errorResponse: NextResponse.json({ error: "User identity not found" }, { status: 401 }) };
    }

    return { user: { userId, token } };
}

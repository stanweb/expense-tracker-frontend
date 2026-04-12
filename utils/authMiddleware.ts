import { NextRequest, NextResponse } from "next/server";
import serverBackendAxios from "@/utils/serverBackendAxios"; // Import the new server-side Axios instance

type AuthenticatedHandler = (req: NextRequest) => Promise<NextResponse>;

export function withAuth(handler: AuthenticatedHandler): AuthenticatedHandler {
    return async (req: NextRequest) => {
        const authHeader = req.headers.get("Authorization");

        if (!authHeader || !authHeader.startsWith("Bearer ")) {
            return new NextResponse("Unauthorized: Missing or invalid token", { status: 401 });
        }

        const token = authHeader.split(" ")[1];
        console.log(token) // Keep this for debugging if needed, but remove in production

        try {
            // Validate the token with the backend using the server-side Axios instance
            await serverBackendAxios.get("/auth/validate-session", {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });
        } catch (err) {
            console.error("Token validation failed:", err);
            return new NextResponse("Unauthorized: Invalid token", { status: 401 });
        }

        return handler(req);
    };
}

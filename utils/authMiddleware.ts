import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import axiosClient from "@/utils/axioClient";
import backendAxios from "@/utils/backendAxios";

type AuthenticatedHandler = (req: NextRequest) => Promise<NextResponse>;

export function withAuth(handler: AuthenticatedHandler): AuthenticatedHandler {
    return async (req: NextRequest) => {
        const cookieStore =  await cookies();
        const sessionId = cookieStore.get("JSESSIONID")?.value;

        if (!sessionId) {
            return new NextResponse("Unauthorized", { status: 401 });
        }

        try {
            await backendAxios.get("/auth/validate-session", {
                headers: {
                    Cookie: `JSESSIONID=${sessionId}`,
                },
            });
        } catch (err) {
            return new NextResponse("Unauthorized", { status: 401 });
        }

        return handler(req);
    };
}

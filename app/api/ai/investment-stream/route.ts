import { NextRequest, NextResponse } from "next/server";
import { getAuthenticatedUser } from "@/utils/authUtils";
import { processSmsAsync } from "@/utils/processSmsAsync";

export async function POST(req: NextRequest) {
    try {
        const { user, errorResponse } = await getAuthenticatedUser(req);
        if (errorResponse) return errorResponse;
        const { userId, token } = user!;

        const { smsData } = await req.json();
        if (!smsData) {
            return NextResponse.json({ error: "SMS messages are required" }, { status: 400 });
        }
        
        // Use 'investment' type for this endpoint
        processSmsAsync(smsData, token, userId, 'investment');
        
        return NextResponse.json({ success: "Investment details received successfully" }, { status: 200 });

    } catch (error: any) {
        console.error("Error in investment-stream route:", error);
        return NextResponse.json({ error: error.message || "Internal Server Error" }, { status: 500 });
    }
}
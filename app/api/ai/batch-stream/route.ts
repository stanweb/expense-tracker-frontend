import { NextRequest, NextResponse } from "next/server";
import { loadPrompt } from "@/utils/loadPrompts";
import { MOBILE_RAW_TEXT_PROMPT_GIST_URL } from "@/configs";
import { transactionExtractor } from "@/utils/groqClient";
import backendAxios from "@/utils/backendAxios";
import { getAuthenticatedUser } from "@/utils/authUtils";
import {processSmsAsync} from "@/utils/processSmsAsync";

export async function POST(req: NextRequest) {
    try {
        const { user, errorResponse } = await getAuthenticatedUser(req);
        if (errorResponse) return errorResponse;
        const { userId, token } = user!;

        const { smsData } = await req.json();
        if (!smsData) {
            return NextResponse.json({ error: "SMS messages are required" }, { status: 400 });
        }
        processSmsAsync(smsData, token, userId)
        return NextResponse.json({success: "Details received successfully"}, {status: 200})

    } catch (error: any) {
        console.error("Error in batch-stream route:", error);
        return NextResponse.json({ error: error.message || "Internal Server Error" }, { status: 500 });
    }
}

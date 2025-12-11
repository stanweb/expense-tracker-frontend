import { NextRequest, NextResponse } from "next/server";
import { withAuth } from "@/utils/authMiddleware";
import { smsExtractPrompt } from "@/utils/prompts";
import { transactionExtractor } from "@/utils/groqClient";

async function handler(req: NextRequest) {
    try {
        const { messages } = await req.json();

        if (!messages) {
            return NextResponse.json({ error: "SMS messages are required" }, { status: 400 });
        }
        const prompt = smsExtractPrompt + messages;

        const {data} = await transactionExtractor(prompt);

        return NextResponse.json(data, { status: 200 });
    } catch (error) {
        console.error("Error in AI route:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}

export const POST = withAuth(handler);

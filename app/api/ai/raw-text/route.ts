import { NextRequest, NextResponse } from "next/server";
import { withAuth } from "@/utils/authMiddleware";
import { transactionExtractor } from "@/utils/groqClient";
import {loadPrompt} from "@/utils/loadPrompts";
import {SMS_STATEMENT_PROMPT_GIST_URL} from "@/configs";

async function handler(req: NextRequest) {
    try {
        const { messages } = await req.json();

        if (!messages) {
            return NextResponse.json({ error: "SMS messages are required" }, { status: 400 });
        }
        const gistPrompt = await loadPrompt(SMS_STATEMENT_PROMPT_GIST_URL)
        const prompt = gistPrompt.replace('<<<MESSAGE>>>',  JSON.stringify(messages, null, 2));

        const {data} = await transactionExtractor(prompt);

        return NextResponse.json(data, { status: 200 });
    } catch (error) {
        console.error("Error in AI route:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}

export const POST = withAuth(handler);

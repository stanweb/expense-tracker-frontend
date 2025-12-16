import { NextRequest, NextResponse } from "next/server";
import { withAuth } from "@/utils/authMiddleware";
import {categoryGenerator} from "@/utils/groqClient";
import {loadPrompt} from "@/utils/loadPrompts";
import {CATEGORY_PROMPT_GIST_URL} from "@/configs";


async function handler(req: NextRequest) {
    const requestBody = await req.json();
    try {
        const gistPrompt = await loadPrompt(CATEGORY_PROMPT_GIST_URL)
        const prompt = gistPrompt.replace("<<<USER_FINANCIAL_DATA>>>", requestBody)

        const categories = await categoryGenerator(prompt)
        return NextResponse.json( categories, { status: 200 });

    } catch (error) {
        console.error("PDF error:", error);
        return NextResponse.json({ error: "Failed to generate an Categories" }, { status: 500 });
    }
}

export const POST = withAuth(handler);

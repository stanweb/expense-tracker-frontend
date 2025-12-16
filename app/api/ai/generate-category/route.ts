import { NextRequest, NextResponse } from "next/server";
import { withAuth } from "@/utils/authMiddleware";
import { categoryGenerator } from "@/utils/groqClient";
import { loadPrompt } from "@/utils/loadPrompts";
import { CATEGORY_PROMPT_GIST_URL } from "@/configs";

async function handler(req: NextRequest) {
    try {
        const requestBody = await req.json();

        const gistPrompt = await loadPrompt(CATEGORY_PROMPT_GIST_URL);

        const prompt = gistPrompt.replace(
            "<<<USER_FINANCIAL_DATA>>>",
            JSON.stringify(requestBody, null, 2)
        );

        const categories = await categoryGenerator(prompt);

        return NextResponse.json(categories, { status: 200 });
    } catch (error) {
        console.error("Category generation error:", error);
        return NextResponse.json(
            { error: "Failed to generate categories" },
            { status: 500 }
        );
    }
}

export const POST = withAuth(handler);

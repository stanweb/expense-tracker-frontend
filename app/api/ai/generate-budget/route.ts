import { NextRequest, NextResponse } from "next/server";
import { withAuth } from "@/utils/authMiddleware";
import {budgetGenerator} from "@/utils/groqClient";
import {loadPrompt} from "@/utils/loadPrompts";
import {BUDGET_PROMPT_GIST_URL} from "@/configs";


async function handler(req: NextRequest) {
    const {categories, userFinancialData} = await req.json();
    try {
        const gistPrompt = await loadPrompt(BUDGET_PROMPT_GIST_URL)
        const prompt = gistPrompt.replace("<<<CATEGORIES>>>", categories).replace("<<<USER_FINANCIAL_DATA>>>", userFinancialData )
        const budgets = await budgetGenerator(prompt)

        return NextResponse.json( budgets, { status: 200 });

    } catch (error) {
        console.error("PDF error:", error);
        return NextResponse.json({ error: "Failed to generate an Icon" }, { status: 500 });
    }
}

export const POST = withAuth(handler);

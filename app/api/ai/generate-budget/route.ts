import { NextRequest, NextResponse } from "next/server";
import { withAuth } from "@/utils/authMiddleware";
import { budgetGenerator } from "@/utils/groqClient";
import { loadPrompt } from "@/utils/loadPrompts";
import { BUDGET_PROMPT_GIST_URL } from "@/configs";

async function handler(req: NextRequest) {
    try {
        const { categories, userFinancialData } = await req.json();

        const gistPrompt = await loadPrompt(BUDGET_PROMPT_GIST_URL);

        const prompt = gistPrompt
            .replace(
                "<<<CATEGORIES>>>",
                JSON.stringify(categories, null, 2)
            )
            .replace(
                "<<<USER_FINANCIAL_DATA>>>",
                JSON.stringify(userFinancialData, null, 2)
            );


        const budgets = await budgetGenerator(prompt);

        return NextResponse.json(budgets, { status: 200 });
    } catch (error) {
        console.error("Budget generation error:", error);
        return NextResponse.json(
            { error: "Failed to generate budget" },
            { status: 500 }
        );
    }
}

export const POST = withAuth(handler);

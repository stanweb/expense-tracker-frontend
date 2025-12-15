import { NextRequest, NextResponse } from "next/server";
import { withAuth } from "@/utils/authMiddleware";

import { cookies } from "next/headers";
import axios from "axios";
import {budgetPrompt, iconPrompt} from "@/utils/prompts";
import {budgetGenerator, iconGenerator} from "@/utils/groqClient";


async function handler(req: NextRequest) {
    const {categories, userFinancialData} = await req.json();
    try {

        const prompt = budgetPrompt(categories, userFinancialData)
        const budgets = await budgetGenerator(prompt)

        return NextResponse.json( budgets, { status: 200 });

    } catch (error) {
        console.error("PDF error:", error);
        return NextResponse.json({ error: "Failed to generate an Icon" }, { status: 500 });
    }
}

export const POST = withAuth(handler);

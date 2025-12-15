import { NextRequest, NextResponse } from "next/server";
import { withAuth } from "@/utils/authMiddleware";

import {categoryPrompt} from "@/utils/prompts";
import {categoryGenerator} from "@/utils/groqClient";


async function handler(req: NextRequest) {
    const requestBody = await req.json();
    try {
        const prompt = categoryPrompt(requestBody.toString())

        const categories = await categoryGenerator(prompt)
        return NextResponse.json( categories, { status: 200 });

    } catch (error) {
        console.error("PDF error:", error);
        return NextResponse.json({ error: "Failed to generate an Categories" }, { status: 500 });
    }
}

export const POST = withAuth(handler);

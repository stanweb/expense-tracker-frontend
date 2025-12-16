import { NextRequest, NextResponse } from "next/server";
import { withAuth } from "@/utils/authMiddleware";
import {iconGenerator} from "@/utils/groqClient";
import {loadPrompt} from "@/utils/loadPrompts";
import {ICON_PROMPT_GIST_URL} from "@/configs";


async function handler(req: NextRequest) {
    const { name, description } = await req.json();
    try {
        const gistPrompt = await loadPrompt(ICON_PROMPT_GIST_URL)

        const prompt = gistPrompt.replace('<<<USER_MESSAGE>>>', name + description)
        const {iconName}  = await iconGenerator(prompt)
        return NextResponse.json( {iconName}, { status: 200 });

    } catch (error) {
        console.error("PDF error:", error);
        return NextResponse.json({ error: "Failed to generate an Icon" }, { status: 500 });
    }
}

export const POST = withAuth(handler);

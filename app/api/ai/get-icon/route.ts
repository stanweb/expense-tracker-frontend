import { NextRequest, NextResponse } from "next/server";
import { withAuth } from "@/utils/authMiddleware";

import { cookies } from "next/headers";
import {createJob} from "@/utils/jobHelper";
import axios from "axios";
import {iconPrompt} from "@/utils/prompts";
import {iconGenerator} from "@/utils/groqClient";
import backendAxios from "@/utils/backendAxios";

const GIST_URL = "https://gist.githubusercontent.com/stanweb/2a2ff78133f9e1d39c0f0705833b1dbe/raw/gistfile1.txt"

async function handler(req: NextRequest) {
    const cookieStore =  await cookies();
    const sessionId = cookieStore.get("JSESSIONID")?.value;
    const { name, description } = await req.json();
    try {
        const {data} = await axios.get(GIST_URL)

        const prompt = iconPrompt(data, name + description).toString()
        const {iconName}  = await iconGenerator(prompt)
        return NextResponse.json( {iconName}, { status: 200 });

    } catch (error) {
        console.error("PDF error:", error);
        return NextResponse.json({ error: "Failed to generate an Icon" }, { status: 500 });
    }
}

export const POST = withAuth(handler);

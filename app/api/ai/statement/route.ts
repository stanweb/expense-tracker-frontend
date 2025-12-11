import { NextRequest, NextResponse } from "next/server";
import { withAuth } from "@/utils/authMiddleware";
import {processPdfAsync} from "@/utils/processPdfAsync";

import { cookies } from "next/headers";
import {createJob} from "@/utils/jobHelper";

async function handler(req: NextRequest) {
    const cookieStore =  await cookies();
    const sessionId = cookieStore.get("JSESSIONID")?.value;
    try {
        const formData = await req.formData();
        const file = formData.get("pdfFile") as File;

        if (!file) {
            return NextResponse.json({ error: "No file uploaded" }, { status: 400 });
        }

        const job = await createJob(sessionId || "")

        // Run extraction in background
        processPdfAsync(file, job.jobId, sessionId || "");

        // Return immediately with jobId
        return NextResponse.json(job, { status: 202 });

    } catch (error) {
        console.error("PDF error:", error);
        return NextResponse.json({ error: "Failed to create job" }, { status: 500 });
    }
}

export const POST = withAuth(handler);

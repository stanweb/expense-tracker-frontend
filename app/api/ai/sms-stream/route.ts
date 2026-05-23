import { NextRequest, NextResponse } from "next/server";
import { transactionExtractor } from "@/utils/groqClient";
import { loadPrompt } from "@/utils/loadPrompts";
import { SMS_STATEMENT_PROMPT_GIST_URL } from "@/configs";
import backendAxios from "@/utils/backendAxios";
import { getAuthenticatedUser } from "@/utils/authUtils";

export async function POST(req: NextRequest) {
    try {
        const { user, errorResponse } = await getAuthenticatedUser(req);
        if (errorResponse) return errorResponse;
        const { userId, token } = user!;

        // 1. Parse request body
        const { sender, message } = await req.json();
        if (!sender || !message) {
            return NextResponse.json({ error: "Sender and message are required" }, { status: 400 });
        }

        // 2. Prepare messages for LLM extraction
        const messages = [{ sender, message }];
        const gistPrompt = await loadPrompt(SMS_STATEMENT_PROMPT_GIST_URL);
        const prompt = gistPrompt.replace('<<<MESSAGE>>>', JSON.stringify(messages, null, 2));

        // 3. Extract transaction using LLM
        const { data } = await transactionExtractor(prompt);

        if (!data) {
            return NextResponse.json({ error: "Could not extract transaction data" }, { status: 422 });
        }

        // Handle both array and single object responses from the LLM
        let extractedTransaction;
        if (Array.isArray(data)) {
            if (data.length === 0) {
                return NextResponse.json({ error: "No transactions extracted" }, { status: 422 });
            }
            extractedTransaction = data[0];
        } else if (typeof data === "object") {
            extractedTransaction = data;
        } else {
            return NextResponse.json({ error: "Invalid data format from LLM" }, { status: 422 });
        }

        // 4. Register transaction in the backend
        try {
            // The backend expects an array of transactions: List<CreateTransactionDTO>
            const registerResponse = await backendAxios.post(
                `/users/${userId}/transactions`,
                [extractedTransaction],
                {
                    headers: { Authorization: `Bearer ${token}` },
                }
            );

            return NextResponse.json(registerResponse.data, { status: 201 });
        } catch (error: any) {
            console.error("Error registering transaction:", error.response?.data || error.message);
            return NextResponse.json(
                { error: error.response?.data?.message || "Failed to register transaction" },
                { status: error.response?.status || 500 }
            );
        }

    } catch (error: any) {
        console.error("Error in sms-stream route:", error);
        return NextResponse.json({ error: error.message || "Internal Server Error" }, { status: 500 });
    }
}

import Groq from "groq-sdk";
import { NextResponse } from "next/server";

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

export default groq;

export async function transactionExtractor(prompt: string) {

    let parsed;
    let totalTokens = 0;

    try {
        const chatCompletion = await groq.chat.completions.create({
            messages: [
                {
                    role: "user",
                    content: prompt,
                },
            ],
            response_format: {
                type: "json_schema",
                json_schema: {
                    name: "transaction_list",
                    schema: {
                        type: "array",
                        items: {
                            type: "object",
                            properties: {
                                transactionId: { type: "string" },
                                amount: { type: "number" },
                                transactionCost: { type: "number" },
                                date: { type: "string" },
                                recipient: { type: "string" },
                                type: {
                                    type: "string",
                                    enum: ["paid", "sent", "received"],
                                },
                                rawMessage: { type: "string" },
                            },
                            required: [
                                "transactionId",
                                "amount",
                                "transactionCost",
                                "date",
                                "recipient",
                                "type",
                                "rawMessage",
                            ],
                            additionalProperties: false,
                        },
                    },
                },
            },
            model: "moonshotai/kimi-k2-instruct-0905",
        });

        // Extract actual JSON
        const content = chatCompletion.choices[0]?.message?.content || "";
        parsed = JSON.parse(content);

        // Extract total token usage
        totalTokens = chatCompletion.usage?.total_tokens || 0;

    } catch (err) {
        throw err;
    }

    // ✔ Return both values
    return {
        data: parsed,
        totalTokens,
    };
}

export async function iconGenerator (prompt: string) {
    let parsed
    try {
        const chatCompletion = await groq.chat.completions.create({
            messages: [
                {
                    role: "user",
                    content: prompt,
                },
            ],
            response_format: {
                type: "json_schema",
                json_schema: {
                    name: "transaction_list",
                    schema: {
                        type: "array",
                        items: {
                            type: "object",
                            properties: {
                                iconName: { type: "string" },
                            },
                            required: [
                                "iconName",
                            ],
                            additionalProperties: false,
                        },
                    },
                },
            },
            model: "moonshotai/kimi-k2-instruct-0905",
        });
        // Extract actual JSON
        const content = chatCompletion.choices[0]?.message?.content || "";
        parsed = JSON.parse(content);

    }
    catch (e){
        throw e
    }

    return parsed
}
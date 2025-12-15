import Groq from "groq-sdk";
const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

async function makeGroqRequest(prompt: string, schema: any) {
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
                json_schema: schema,
            },
            model: process.env.GROQ_MODEL || "moonshotai/kimi-k2-instruct-0905",
        });

        const content = chatCompletion.choices[0]?.message?.content || "";
        const parsed = JSON.parse(content);
        const totalTokens = chatCompletion.usage?.total_tokens || 0;

        return { data: parsed, totalTokens };
    } catch (error) {
        console.error("Error in Groq API request:", error);
        throw error;
    }
}

export async function transactionExtractor(prompt: string) {
    const schema = {
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
    };
    return makeGroqRequest(prompt, schema);
}

export async function iconGenerator(prompt: string) {
    const schema = {
        name: "transaction_list",
        schema: {
            type: "array",
            items: {
                type: "object",
                properties: {
                    iconName: { type: "string" },
                },
                required: ["iconName"],
                additionalProperties: false,
            },
        },
    };
    const { data } = await makeGroqRequest(prompt, schema);
    return data;
}

export const categoryGenerator = async (prompt: string) => {
    const schema = {
        name: "category_list",
        schema: {
            type: "array",
            items: {
                type: "object",
                properties: {
                    name: {
                        type: "string",
                        description: "Human-readable category name",
                    },
                    categoryIcon: {
                        type: "string",
                        description: "Icon identifier (e.g., ShoppingCart, PiggyBank, Fuel)",
                    },
                    description: {
                        type: "string",
                        description: "Short, clear financial description of the category",
                    },
                },
                required: ["name", "categoryIcon", "description"],
                additionalProperties: false,
            },
        },
    };
    const { data } = await makeGroqRequest(prompt, schema);
    return data;
};

export const budgetGenerator = async (prompt: string) => {
    const schema = {
        name: "budget_list",
        schema: {
            type: "array",
            items: {
                type: "object",
                properties: {
                    amount: {
                        type: "number",
                        description: "Monthly budgeted amount for the category",
                    },
                    categoryId: {
                        type: "number",
                        description: "Existing category ID provided in the categories input",
                    },
                    categoryName: {
                        type: "string",
                        description: "Exact name of the category",
                    },
                },
                required: ["amount", "categoryId", "categoryName"],
                additionalProperties: false,
            },
        },
    };
    const { data } = await makeGroqRequest(prompt, schema);
    return data;
};

export default groq;

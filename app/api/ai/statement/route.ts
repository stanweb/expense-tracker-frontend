import Groq from "groq-sdk";
import {NextRequest, NextResponse} from "next/server";
import {pdfExtractPrompt} from "@/utils/prompts";
// import {PDFParse} from "pdf-parse";


const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });


export async function parseFile(file: File) {

    const bytes = await  file.bytes()
    // Dynamically import pdf-parse to avoid SSR issues
    const {PDFParse} =  await import("pdf-parse");
    // Extract text
    const data = new PDFParse(bytes);
    const extractedData = await  data.getText()
    let text = ''
    extractedData.pages.forEach(page => {
        text += page.text + '\n'
    })

    return text

}



export async function POST(req: NextRequest) {

    try {
        const formData = await req.formData();
        const file = formData.get('pdfFile') as File;
        if (!file) {
            return NextResponse.json({error: "No file uploaded"}, {status: 400});

        }
        const text = await parseFile(file)

        const prompt = pdfExtractPrompt + text

        const response = await getGroqChatCompletion(prompt)
        const rawData = response.choices[0]?.message?.content || ""
        let data;
        try {
            data = JSON.parse(rawData);
        } catch (err) {
            console.error("Failed to parse model response:");
            return NextResponse.json({ error: "Failed to parse model response" }, { status: 500 });
        }
         return  NextResponse.json(data);
    }
     catch (error) {
         console.error("PDF error:", error);
         return NextResponse.json({ error: "Failed to process PDF" }, { status: 500 });
    }
}

/**
 * Helper: call Groq chat completion
 */
export async function getGroqChatCompletion(prompt: string) {
    return groq.chat.completions.create({
        messages: [
            {
                role: "user",
                content: prompt,
            },
        ],
        "response_format": {
            "type": "json_schema",
            "json_schema": {
                "name": "transaction_list",
                "schema": {
                    "type": "array",
                    "items": {
                        "type": "object",
                        "properties": {
                            "transactionId": { "type": "string" },
                            "amount": { "type": "number" },
                            "transactionCost": { "type": "number" },
                            "date": { "type": "string" },
                            "recipient": { "type": "string" },
                            "type": {
                                "type": "string",
                                "enum": ["paid","sent","received"]
                            },
                            "rawMessage": { "type": "string" }
                        },
                        "required": [
                            "transactionId",
                            "amount",
                            "transactionCost",
                            "date",
                            "recipient",
                            "type",
                            "rawMessage"
                        ],
                        "additionalProperties": false
                    }
                }
            }
        },
        model: "moonshotai/kimi-k2-instruct-0905",
    });
}

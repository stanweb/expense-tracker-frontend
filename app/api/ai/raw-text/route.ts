import Groq from "groq-sdk";
import { NextRequest, NextResponse } from "next/server";

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

export async function POST(req: NextRequest) {
  try {
    const { messages } = await req.json();

    if (!messages) {
      return NextResponse.json({ error: "SMS messages are required" }, { status: 400 });
    }

      const  prompt  = `
        You are an intelligent sms extractor 
        Extract a list of transactions from the following SMS message text.
            For each transaction, extract the following fields:
            - transactionId
            - amount
            - transactionCost
            - date (ISO format yyyy-MM-dd'T'HH:mm:ss)
            - recipient
            - type ("paid","sent" or "received")
            - rawMessage (The actual message sent)

            Return only a valid JSON array of transaction objects:
                    - The root of the response must be a JSON array \`[]\`.
                    - Do NOT include any backticks, quotes, or explanations outside the JSON array.
                    - JSON keys must be quoted.
                    - If no transactions are found, return an empty array \`[]\`.

            Message: ${messages}
      `

      const chatCompletion = await getGroqChatCompletion(prompt);

      const raw = chatCompletion.choices[0]?.message?.content || "";

// Parse the JSON array returned by the model
      let data;
      try {
          data = JSON.parse(raw);
      } catch (err) {
          console.error("Failed to parse model response:", raw);
          return NextResponse.json({ error: "Failed to parse model response" }, { status: 500 });
      }

      return NextResponse.json(data, { status: 200 });
  } catch (error) {
    console.error("Error in AI route:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

export async function getGroqChatCompletion(prompt: string) {
  return groq.chat.completions.create({
    messages: [
      {
        role: "user",
        content: prompt,
      },
    ],
    model: "moonshotai/kimi-k2-instruct-0905",
  });
}

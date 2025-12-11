export const pdfExtractPrompt = `You are an LLM tasked with extracting transactions from an MPESA statement. 
The statement text is provided below.

Extraction Rules

1. Each transaction must populate this JSON DTO: { “transactionId”: “”, “amount”: 0.0, “transactionCost”: 0.0, “date”: “”, “recipient”: “”, “type”: “”, “rawMessage”: “” }

2. transactionId - Use the Receipt No as the transactionId.

3. amount - Use the numeric value under Paid in or Withdrawn. If both exist, the non‑zero one is the amount. Paid in → positive, Withdrawn → positive.

4. transactionCost - If a transaction has a duplicate receipt number, one entry is a charge. Identify the charge line (labels: “Charge”, “Fuliza”, etc.) and set its Withdrawn amount as transactionCost. Otherwise, 0.

5. date - Use Completion Time as-is (YYYY-MM-DDTHH:MM:SS).

6. recipient - Extract from the Details field. Do not include unrelated lines.

7. type - Withdrawn > 0 → "paid", Paid in > 0 → "received".

8. rawMessage - Insert the entire Details text of that entry exactly as it appears.

Output Requirements

- Only output valid JSON array of GeminiTransactionDTO objects.
- No commentary, explanation, or markdown.

MPESA Statement Text:
`


export const smsExtractPrompt = `
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

            Message:`

export const iconPrompt = (icons: string, description:string ) =>{return `
You are an intelligent classification model.
        You are given a list of category icons with descriptions:

        ${icons}

        Your task:
        - Read the user’s transaction description.
        - Select the single most appropriate icon name from the list.
        - Return ONLY the icon name, with no explanation and no extra text.

        User message: ${description}
`}
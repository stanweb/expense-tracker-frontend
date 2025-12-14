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


export const categoryPrompt = ( userFinancialDetails: string,) => {
    return `
    You are a financial planning and budgeting assistant.

You will receive:
1. A stringified JSON object containing a user’s financial data (income, expenses, savings, investments, debt, etc.).
2. A list of allowed category icons.

Your task is to analyze the financial data and generate finance-focused categories suitable for a personal finance application.

INPUT:
- Financial data (stringified JSON), for example:
{
    "income": "5000",
    "hasAdditionalIncome": false,
    "additionalIncome": "",
    "rent": "500",
    "utilities": "200",
    "transportation": "50",
    "groceries": "500",
    "diningOut": "400",
    "shopping": "455",
    "entertainment": "300",
    "travel": "300",
    "subscriptions": "90",
    "savings": "40",
    "investments": "34",
    "debt": "35",
    "extraInfo": "Family and Friend = 500\\nMy Car = 400",
}

- Allowed category icons (example):
["Home", "CookingPot", "Fuel", "ShoppingCart", "Plane", "PiggyBank", "ChartLine", "CreditCard", "Wallet"]

RULES:
1. Parse the financial data and infer logical, high-level financial categories.
2. Group related fields into realistic personal finance categories.
3. Only generate categories that are supported by the input data.
4. Each category must:
   - Have a clear, user-friendly name
   - Use exactly one icon from the allowed icon list
   - Include a short, clear financial description
5. Do not include numbers, totals, or calculations in the output.
6. Do not invent categories not implied by the data.
7. Do not repeat categories or icons unnecessarily.
8. Output valid JSON only — no explanations, no markdown, no extra text.
9. Budget must align with the user's income and be realistic 
10. Always Consider categories that might be in extra info

OUTPUT FORMAT:
Return an array of objects in exactly this structure:

[
  {
    "name": "Category Name",
    "categoryIcon": "ShoppingCart",
    "description": "Short, clear financial description"
  }
]

OUTPUT CONSTRAINTS:
- The response must be valid JSON
- The response must match the structure exactly
- No trailing commas
- No extra properties
- No text outside the JSON array

User Financial Detail ${userFinancialDetails}
`
}

export const budgetPrompt = (categories:string, userFinancialData:string) => {
    return`
    You are a financial budgeting assistant.

You are given:

A list of budget categories as a JSON string. Each category contains a unique id.

A user’s financial data as a JSON string.

Your task is to generate monthly budget allocations for each category based on the user’s income, expenses, savings, and investments.

INPUT

Categories:
${categories}

User Financial Data:
${userFinancialData}

OUTPUT REQUIREMENTS

Return ONLY valid JSON.

The output must be an array of objects. Each object must have exactly the following fields:

amount: number

categoryId: number

categoryName: string

RULES

categoryId must come directly from the id field in the category object. Do not generate or infer IDs.

categoryName must exactly match the category’s name.

amount must be a realistic monthly budget number derived from the user’s financial data.

Include savings and investments if categories exist.

The sum of all amounts must NOT exceed the user’s total income.

Generate exactly one budget entry per category.

Do not invent new categories.

Do not include explanations, comments, markdown, or extra fields.

EXAMPLE OUTPUT

[
{
"amount": 7000,
"categoryId": 12,
"categoryName": "Housing & Utilities"
},
{
"amount": 4000,
"categoryId": 18,
"categoryName": "Food & Groceries"
}
]
    `
}
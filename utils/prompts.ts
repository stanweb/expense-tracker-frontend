export const pdfExtractPrompt = `You are an LLM specialized in extracting structured transactions from raw MPESA statements (PDF or text-converted).

The full MPESA statement text will be provided below.
Your task is to identify, normalize, and extract each financial transaction exactly as it appears, even when transactions span multiple lines or appear as grouped entries (for example: charges, Fuliza, overdraft).

TARGET OUTPUT DTO (STRICT)

Each transaction must be emitted as a JSON object using only this structure:

{
"transactionId": "",
"amount": 0.0,
"transactionCost": 0.0,
"date": "",
"recipient": "",
"type": "",
"rawMessage": ""
}

EXTRACTION RULES (AUTHORITATIVE)

Transaction Identification

Use the Receipt No as transactionId

Multiple rows may share the same Receipt No

Treat all rows with the same Receipt No as one logical transaction group

Amount

Use the numeric value under Paid in or Withdrawn

If both exist, select the non-zero value

Amount is always positive

Do not include charges in amount

Transaction Cost

If a Receipt No appears multiple times:

Identify the row whose Details indicates a charge
(keywords include: Charge, Fuliza, OverDraft, OD Loan, Transfer of Funds Charge, Pay Bill Charge, Pay Merchant Charge)

Set transactionCost to the Withdrawn value of that charge row

If no explicit charge exists for that Receipt No, transactionCost = 0

Date

Use Completion Time

Preserve format exactly as:
YYYY-MM-DDTHH:MM:SS

Recipient

Extract only the recipient or counterparty from the Details field

Exclude status text, balances, and system phrases (for example: Original conversation ID)

Examples:
Customer Transfer to 254712***146 - LUCIAH NJAMBI MUTUA → LUCIAH NJAMBI MUTUA
Merchant Payment to 827803 - ASTROL PETROLEUM- UTAWALA → ASTROL PETROLEUM- UTAWALA
247247 - Equity Paybill Account Acc. 163403-> Equity Paybill Account Acc. 163403
644811 - DTB MOBILE via API. Original conversation ID is PMMP6N2X1765012456571_118XB2T253400010. -> DTB MOBILE via API

Type

If Withdrawn > 0 → "paid"

If Paid in > 0 → "received"

Raw Message

Copy the entire Details field exactly as printed

Preserve line breaks, spacing, and masking (*** characters)

Do not merge, clean, or rewrite the text

SPECIAL HANDLING RULES

Fuliza / Overdraft

Treat overdraft credit rows (OverDraft of Credit Party) as supporting entries

Do not emit them as standalone transactions

Only extract the actual payment or transfer

Charges

Never emit charge-only rows as standalone transactions

Charges only populate transactionCost

Balances

Ignore the balance column entirely

Headers, footers, disclaimers

Ignore all non-transaction text

OUTPUT REQUIREMENTS (STRICT)

Output only a valid JSON array

One object per logical transaction

No comments

No explanations

No markdown

No trailing commas

Preserve numeric precision exactly as shown

MPESA STATEMENT TEXT
(Provided below verbatim — do not infer or hallucinate missing data)

<<<STATEMENT_TEXT>>>
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
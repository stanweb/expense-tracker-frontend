import { transactionExtractor } from "@/utils/groqClient";
import { pdfToText } from "@/utils/pdfToText";
import backendAxios from "@/utils/backendAxios";
import {updateJob} from "@/utils/jobHelper";
import {loadPrompt} from "@/utils/loadPrompts";
import {PDF_STATEMENT_PROMPT_GIST_URL} from "@/configs";
const RPM_LIMIT = 60;
const TPM_LIMIT = 10000;

let tokensThisMinute = 0;
let requestsThisMinute = 0;
let minuteWindowStart = Date.now();

function resetMinuteIfNeeded() {
    const now = Date.now();
    if (now - minuteWindowStart >= 60000) {
        tokensThisMinute = 0;
        requestsThisMinute = 0;
        minuteWindowStart = now;
    }
}

function sleep(ms: number) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

export async function processPdfAsync(file: File, jobId: string, sessionId:string) {
    try {
        const pages = await pdfToText(file);
        let allTransactions: any[] = [];

        for (const pageText of pages) {
            resetMinuteIfNeeded();

            // RATE LIMIT ENFORCEMENT
            if (requestsThisMinute >= RPM_LIMIT) {
                const wait = 60000 - (Date.now() - minuteWindowStart);
                await sleep(wait);
                resetMinuteIfNeeded();
            }

            const SAFE_ESTIMATE = 1500;
            while (tokensThisMinute + SAFE_ESTIMATE >= TPM_LIMIT) {
                await sleep(500);
                resetMinuteIfNeeded();
            }

            const gistPrompt = await loadPrompt(PDF_STATEMENT_PROMPT_GIST_URL)

            const prompt = gistPrompt.replace('<<<STATEMENT_TEXT>>>', pageText);
            const { data, totalTokens } = await transactionExtractor(prompt);

            requestsThisMinute++;
            tokensThisMinute += totalTokens;

            if (data && Array.isArray(data)) {
                allTransactions = allTransactions.concat(data);
            }
        }

        await backendAxios.post('/users/1/transactions', allTransactions,{
            headers: {
                Cookie: `JSESSIONID=${sessionId}`, // add your cookie here
            },
        })

        await updateJob(jobId, "COMPLETED", sessionId);
    } catch (error: any) {
        console.log(error)
        await updateJob(jobId, "FAILED", sessionId, error.message);
    }
}
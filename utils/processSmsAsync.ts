import { transactionExtractor, investmentTransactionExtractor } from "@/utils/groqClient";
import { loadPrompt } from "@/utils/loadPrompts";
import {
    APPROVED_SMS_SENDERS_GIST_URL,
    MOBILE_RAW_TEXT_PROMPT_GIST_URL,
    INVESTMENT_TRANSACTION_EXTRACTION_PROMPT_GIST_URL,
} from "@/configs";
import serverBackendAxios from "@/utils/serverBackendAxios";
import axios from "axios";

const RPM_LIMIT = 60;
const TPM_LIMIT = 8000;
const CONCURRENT_LIMIT = 3;
const UPLOAD_CHUNK_SIZE = 50;

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
    return new Promise((resolve) => setTimeout(resolve, ms));
}

// Rough GPT-style token estimation
function estimateTokens(text: string) {
    return Math.ceil(text.length / 4);
}

export async function processSmsAsync(
    smsData: { [key: string]: any[] },
    token: string,
    userId: number,
    type: 'transactional' | 'investment' = 'transactional'
) {
    try {
        let allTransactions: any[] = [];

        // ✅ Load correct prompt based on type
        const promptUrl = type === 'investment' 
            ? INVESTMENT_TRANSACTION_EXTRACTION_PROMPT_GIST_URL 
            : MOBILE_RAW_TEXT_PROMPT_GIST_URL;
        
        const gistPrompt = await loadPrompt(promptUrl);

        // ✅ Select correct extractor based on type
        const extractor = type === 'investment' ? investmentTransactionExtractor : transactionExtractor;

        // ✅ Fetch approved senders dynamically
        let approvedSenders: string[] = [];
        try {
            const response = await axios.get(APPROVED_SMS_SENDERS_GIST_URL, { timeout: 10000 });
            const approvedSendersConfig = response.data;
            approvedSenders = approvedSendersConfig[type] || [];
        } catch (fetchError: any) {
            console.error(`❌ Error fetching approved senders from Gist: ${fetchError.message}`);
            return;
        }

        const upstreamUrl = type === 'investment' 
            ? `/investment-transactions/bulk`
            : `/users/${userId}/transactions`;

        // ✅ Proper concurrency control
        const executing = new Set<Promise<void>>();

        for (const sender of approvedSenders) {
            const smsMessages = smsData[sender] || [];
            if (!smsMessages.length) continue;

            for (let i = 0; i < smsMessages.length; i += 10) {
                const batch = smsMessages.slice(i, i + 10);

                const taskPromise = (async () => {
                    try {
                        const prompt = gistPrompt.replace(
                            "<<<BATCH_SMS>>>",
                            JSON.stringify(batch, null, 2)
                        );

                        const estimatedTokens = estimateTokens(prompt) + 500;

                        // ⏱️ Rate limiting loop
                        while (true) {
                            resetMinuteIfNeeded();

                            // RPM control
                            if (requestsThisMinute >= RPM_LIMIT) {
                                const wait =
                                    60000 - (Date.now() - minuteWindowStart);
                                await sleep(Math.max(wait, 500));
                                continue;
                            }

                            // TPM control
                            if (tokensThisMinute + estimatedTokens >= TPM_LIMIT) {
                                await sleep(500);
                                continue;
                            }

                            break;
                        }

                        const { data, totalTokens } = await extractor(prompt);

                        requestsThisMinute++;
                        tokensThisMinute += totalTokens || estimatedTokens;

                        if (Array.isArray(data)) {
                            allTransactions.push(...data);
                        }

                        // 📦 Chunk upload to avoid memory issues
                        if (allTransactions.length >= UPLOAD_CHUNK_SIZE) {
                            const chunk = allTransactions.splice(0, UPLOAD_CHUNK_SIZE);
                            console.log(`Uploading ${type} chunk:`, chunk)
                            await serverBackendAxios.post(
                                upstreamUrl,
                                chunk,
                                {
                                    headers: {
                                        Authorization: `Bearer ${token}`,
                                    },
                                }
                            );
                        }
                    } catch (err: any) {
                        console.error(
                            `❌ Batch ${type} processing error:`,
                            err?.response?.data || err.message || err
                        );
                    }
                })();

                // Add to executing set
                executing.add(taskPromise);

                // Remove when done
                taskPromise.finally(() => executing.delete(taskPromise));

                // Enforce concurrency limit
                if (executing.size >= CONCURRENT_LIMIT) {
                    await Promise.race(executing);
                }
            }
        }

        // Wait for remaining tasks
        await Promise.all(executing);

        // 📦 Final flush
        if (allTransactions.length > 0) {
            console.log(`Final ${type} flush:`, allTransactions)
            await serverBackendAxios.post(
                upstreamUrl,
                allTransactions,
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                }
            );
        }

        console.log(`✅ SMS ${type} processing completed successfully`);
    } catch (error: any) {
        console.error(
            `❌ Error processing SMS (${type}):`,
            error?.response?.data || error.message || error
        );
    }
}
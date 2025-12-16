export async function loadPrompt(url: string): Promise<string> {
    // console.log(`Loading prompts: ${url}`);
    const res = await fetch(url, { cache: "no-store" });
    if (!res.ok) throw new Error("Failed to load prompt");
    return res.text();
}

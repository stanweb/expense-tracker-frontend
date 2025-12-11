import backendAxios from "@/utils/backendAxios";

export async function createJob(sessionId: string) {
    try {
        const { data } = await backendAxios.post(
            "jobs",
            { status: "PROCESSING" },
            {
                headers: {
                    Cookie: `JSESSIONID=${sessionId}`, // add your cookie here
                },
            }
        );
        return data; // return the created job data
    } catch (e) {
        console.error("Failed to create job:", e);
        throw e; // rethrow so caller can handle it
    }
}

export async function updateJob(jobId: string, status: string, sessionId: string, error='') {
    try {
        await backendAxios.put(
            `/jobs/${jobId}`,
            { status, error },
            {
                headers: {
                    Cookie: `JSESSIONID=${sessionId}`, // add your cookie here
                },
            }
        );
    } catch (e) {
        console.error("Failed to update job:", e);
        throw e;
    }
}

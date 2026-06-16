import apiClient from "@/utils/apiClient";

export async function createJob() {
    try {
        const { data } = await apiClient.post(
            "jobs",
            { status: "PROCESSING" }
        );
        return data; // return the created job data
    } catch (e) {
        console.error("Failed to create job:", e);
        throw e; // rethrow so caller can handle it
    }
}

export async function updateJob(jobId: string, status: string, error = "") {
    try {
        await apiClient.put(
            `/jobs/${jobId}`,
            { status, error }
        );
    } catch (e) {
        console.error("Failed to update job:", e);
        throw e;
    }
}

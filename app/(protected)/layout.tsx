import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import axiosClient from "@/utils/axioClient";

export default async function ProtectedLayout({
                                                  children,
                                              }: {
    children: React.ReactNode;
}) {

    const cookieStore = await cookies();
    const sessionId = cookieStore.get("JSESSIONID")?.value;

    if (!sessionId) {
        redirect("/login");
    }

    try {
        // Validate session with backend using axios
        await axiosClient.get("http://backend:8080/api/auth/validate-session", {
            headers: {
                Cookie: `JSESSIONID=${sessionId}`,
            },
        });
    } catch (err) {
        // Session is invalid or backend unreachable
        redirect("/login");
    }

    return <>{children}</>;
}

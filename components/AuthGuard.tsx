"use client";

import { useEffect } from "react";
import { useSelector } from "react-redux";
import { useRouter } from "next/navigation";
import { RootState } from "@/store/store"; // Assuming RootState is defined here

interface AuthGuardProps {
    children: React.ReactNode;
}

const AuthGuard: React.FC<AuthGuardProps> = ({ children }) => {
    const router = useRouter();
    const accessToken = useSelector((state: RootState) => state.user.accessToken);
    const userId = useSelector((state: RootState) => state.user.userId);

    useEffect(() => {
        // Redirect to login if no access token or userId is found
        if (!accessToken || !userId) {
            router.replace("/login");
        }
    }, [accessToken, userId, router]);

    // Only render children if authenticated
    if (accessToken && userId) {
        return <>{children}</>;
    }

    // Optionally, render a loading spinner or null while checking auth status
    return null;
};

export default AuthGuard;

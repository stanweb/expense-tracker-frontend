"use client";

import { useEffect } from "react";
import { useSelector } from "react-redux";
import { useRouter } from "next/navigation";
import { RootState } from "@/store/store";

interface AuthGuardProps {
    children: React.ReactNode;
}

const AuthGuard: React.FC<AuthGuardProps> = ({ children }) => {
    const router = useRouter();
    const accessToken = useSelector((state: RootState) => state.user.accessToken);
    const userId = useSelector((state: RootState) => state.user.userId);

    // redux-persist attaches a `_persist` field to the root state. We use
    // its `rehydrated` flag to avoid redirecting on the initial empty state
    // before localStorage has been read. The RootState type doesn't include
    // this field, so we cast through `unknown`.
    const rehydrated = useSelector(
        (state: RootState) => (state as unknown as { _persist: { rehydrated: boolean } })._persist.rehydrated
    );

    useEffect(() => {
        // Skip the redirect until redux-persist has finished hydrating from
        // localStorage. Without this, the guard sees the initial (empty)
        // state for one render and bounces the user to /login even when
        // valid tokens are sitting in localStorage.
        if (!rehydrated) return;
        if (!accessToken || !userId) {
            router.replace("/login");
        }
    }, [rehydrated, accessToken, userId, router]);

    // Only render children once hydration is complete AND we have a token.
    if (!rehydrated) return null;
    if (accessToken && userId) {
        return <>{children}</>;
    }

    // Hydrated but no token — let the redirect effect fire.
    return null;
};

export default AuthGuard;

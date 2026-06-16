// Single axios client for the entire app. All API calls go through Next.js
// rewrites (see next.config.mjs) so the browser stays on the same origin and
// the backend is reached over the internal Docker network at request time.
//
// Auth header is attached from Redux on every request; 401 responses trigger a
// single token refresh and replay, exactly once, before forcing logout.
import axios from "axios";
import { store } from "@/store/store";
import { clearUser, setAccessToken, setRefreshToken } from "@/store/user-slice";

const apiClient = axios.create({
    baseURL: "/api",
    headers: {
        "Content-Type": "application/json",
    },
});

apiClient.interceptors.request.use(
    (config) => {
        const accessToken = store.getState().user.accessToken;
        if (accessToken) {
            config.headers.Authorization = `Bearer ${accessToken}`;
        }
        return config;
    },
    (error) => Promise.reject(error),
);

apiClient.interceptors.response.use(
    (response) => response,
    async (error) => {
        const originalRequest = error.config;

        if (error.response?.status === 401 && !originalRequest._retry) {
            originalRequest._retry = true;

            const refreshToken = store.getState().user.refreshToken;
            if (!refreshToken) {
                forceLogout();
                return Promise.reject(error);
            }

            try {
                const { data } = await axios.post("/api/auth/refresh", { refreshToken });
                store.dispatch(setAccessToken({
                    accessToken: data.accessToken,
                    expiresIn: data.expiresIn,
                }));
                store.dispatch(setRefreshToken({
                    refreshToken: data.refreshToken,
                    refreshExpiresIn: data.refreshExpiresIn,
                }));

                originalRequest.headers.Authorization = `Bearer ${data.accessToken}`;
                return apiClient(originalRequest);
            } catch (refreshError: any) {
                console.error("Token refresh failed:", refreshError.response?.data || refreshError.message);
                forceLogout();
                return Promise.reject(refreshError);
            }
        }

        return Promise.reject(error);
    },
);

function forceLogout() {
    store.dispatch(clearUser());
    if (typeof window !== "undefined" && window.location.pathname !== "/login") {
        window.location.href = "/login";
    }
}

export default apiClient;

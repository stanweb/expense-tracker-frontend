// axiosClient.js
import axios from "axios";
import {NEXT_PUBLIC_AI_API_BASE_URL, NEXT_PUBLIC_BACKEND_API_BASE_URL} from "@/configs";
import {store} from "@/store/store";
import {clearUser, setAccessToken, setRefreshToken} from "@/store/user-slice";

const aiAxiosClient = axios.create({
    baseURL: NEXT_PUBLIC_AI_API_BASE_URL,
    headers: {
        "Content-Type": "application/json",
    },
});

aiAxiosClient.interceptors.request.use(
    (config) => {
        const accessToken = store.getState().user.accessToken; // Get accessToken from Redux store

        if (accessToken) {
            config.headers.Authorization = `Bearer ${accessToken}`;
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

// Response interceptor to handle 401 errors and token refresh
aiAxiosClient.interceptors.response.use(
    (response) => response,
    async (error) => {
        const originalRequest = error.config;

        // If error is 401 and it's not a refresh token request itself
        if (error.response?.status === 401 && !originalRequest._retry) {
            originalRequest._retry = true; // Mark request as retried

            const refreshToken = store.getState().user.refreshToken; // Get refreshToken from Redux store

            if (refreshToken) {
                try {
                    const refreshResponse = await axios.post(
                        `${NEXT_PUBLIC_BACKEND_API_BASE_URL}/auth/refresh`,
                        { refreshToken }
                    );

                    const { accessToken: newAccessToken, refreshToken: newRefreshToken, expiresIn, refreshExpiresIn } = refreshResponse.data;

                    // Update tokens in Redux store
                    store.dispatch(setAccessToken({ accessToken: newAccessToken, expiresIn }));
                    store.dispatch(setRefreshToken({ refreshToken: newRefreshToken, refreshExpiresIn }));

                    // Retry the original request with the new token
                    originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;
                    return aiAxiosClient(originalRequest);

                } catch (refreshError: any) {
                    console.error("Token refresh failed:", refreshError.response?.data || refreshError.message);
                    // Logout user if refresh fails
                    store.dispatch(clearUser());
                    if (typeof window !== "undefined" && window.location.pathname !== "/login") {
                        window.location.href = "/login"; // Redirect to login
                    }
                    return Promise.reject(refreshError);
                }
            } else {
                // No refresh token available, logout user
                store.dispatch(clearUser());
                if (typeof window !== "undefined" && window.location.pathname !== "/login") {
                    window.location.href = "/login"; // Redirect to login
                }
            }
        }

        return Promise.reject(error);
    }
);

export default aiAxiosClient;

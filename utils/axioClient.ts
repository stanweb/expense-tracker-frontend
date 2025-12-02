// axiosClient.js
import axios from "axios";

const axiosClient = axios.create({
    baseURL: "http://localhost:8080/api/",
    headers: {
        "Content-Type": "application/json",
    },
    withCredentials: true, // REQUIRED for sessions
});

// Automatic 401 handler
axiosClient.interceptors.response.use(
    (response) => response,
    (error) => {

        if (typeof window !== "undefined" &&
            error.response &&
            error.response.status === 401) {

            // Avoid infinite redirects from login page
            if (window.location.pathname !== "/login") {
                window.location.href = "/";
            }
        }

        return Promise.reject(error);
    }
);

export default axiosClient;

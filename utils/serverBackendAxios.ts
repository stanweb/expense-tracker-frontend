import axios from "axios";
import { NEXT_PUBLIC_BACKEND_API_BASE_URL } from "@/configs";

const serverBackendAxios = axios.create({
    baseURL: NEXT_PUBLIC_BACKEND_API_BASE_URL,
    headers: {
        "Content-Type": "application/json",
    },
});

export default serverBackendAxios;

import axios from "axios";
import { INTERNAL_API_BASE_URL } from "@/configs";

const serverBackendAxios = axios.create({
    baseURL: INTERNAL_API_BASE_URL,
    headers: {
        "Content-Type": "application/json",
    },
});

export default serverBackendAxios;

import axios from "axios";

export const publicApiClient = axios.create({
  baseURL: import.meta.env.VITE_API_URL ?? "http://localhost:8000/api",

  timeout: 10_000,

  headers: {
    Accept: "application/json",

    "Content-Type": "application/json",
  },
});

import axios from "axios";

const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || "https://career-navigator-backend-7hhk.onrender.com",
});

export default api;

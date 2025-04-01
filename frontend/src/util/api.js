import axios from "axios";

const API = axios.create({
    baseURL: import.meta.env.BACKEND_URL || "http://localhost:5050",
    withCredentials: true, 
});

export const register = (username, password, email) => API.post("/register", { username, password, email });
export const login = (email, password) => API.post("/login", { email, password });
export const logout = () => API.get('/logout');
export const getProfile = () => API.get("/profile");
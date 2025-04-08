import { useMaterialTailwindController } from "@/context";
import axios from "axios";

const API = axios.create({
    baseURL: import.meta.env.BACKEND_URL || "http://localhost:5050",
    withCredentials: true, 
});

export const getProfile = () =>  API.get("/user/profile");
export const register = (username, password, email) => API.post("/user/register", { username, password, email });
export const login = (email, password) => API.post("/user/login", { email, password });
export const logout = () => API.get('/user/logout');
export const createTrip = (tripData) => API.post('/trip/create', tripData);
export const getTrips = () => API.get('/trip');
export const getTripDetails = (tripCode) => API.get(`/trip/${tripCode}`);
export const setFavorite = (tripCode, value) => API.get(`/trip/favorite/${tripCode}-${value}`);
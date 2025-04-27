import { useMaterialTailwindController } from "@/context";
import axios from "axios";

const API = axios.create({
    baseURL: import.meta.env.VITE_BACKEND_URL || "http://localhost:5000",
    withCredentials: true, 
});

export const getProfile = () =>  API.get("/user/profile");
export const sendFriendRequest = (email) => API.post('/user/friends/request', { email });
export const acceptFriendRequest = (userId) => API.post('/user/friends/add', { userId });
export const declineFriendRequest = (userId) => API.post('/user/friends/decline', { userId });
export const removeFriend = (userId) => API.post('/user/friends/remove', { userId });
export const register = (username, password, email) => API.post("/user/register", { username, password, email });
export const updateUser = (details) => API.post('/user/update', details);
export const login = (email, password) => API.post("/user/login", { email, password });
export const logout = () => API.get('/user/logout');
export const createTrip = (tripData) => API.post('/trip/create', tripData);
export const getTrips = () => API.get('/trip');
export const getTripDetails = (tripCode) => API.get(`/trip/${tripCode}`);
export const updateTripDetails = (tripData) => API.post(`/trip/update/${tripData.tripCode}`, tripData);
export const addNewTripActivity = (tripCode, activityDetail) => API.post(`/trip/detail/new/${tripCode}`, activityDetail);
export const updateTripActivity = (tripCode, details) => API.post(`/trip/details/edit/${tripCode}`, details);
export const getDetailsOn = (tripCode, date) => API.get(`/trip/details/${date}/${tripCode}`)
export const setFavorite = (tripCode, value) => API.get(`/trip/favorite/${tripCode}-${value}`);
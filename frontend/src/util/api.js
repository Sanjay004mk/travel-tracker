import { useMaterialTailwindController } from "@/context";
import axios from "axios";

const API = axios.create({
  baseURL: import.meta.env.VITE_BACKEND_URL || "http://localhost:5000",
  withCredentials: true,
});

export const getProfile = () => API.get("/user/profile");
export const sendFriendRequest = (email) =>
  API.post("/user/friends/request", { email });
export const acceptFriendRequest = (userId) =>
  API.post("/user/friends/add", { userId });
export const declineFriendRequest = (userId) =>
  API.post("/user/friends/decline", { userId });
export const removeFriend = (userId) =>
  API.post("/user/friends/remove", { userId });
export const register = (username, password, email) =>
  API.post("/user/register", { username, password, email });
export const updateUser = (details) => API.post("/user/update", details);
export const login = (email, password) =>
  API.post("/user/login", { email, password });
export const logout = () => API.get("/user/logout");
export const createTrip = (tripData) => API.post("/trip/create", tripData);
export const joinTrip = (identifiers) => API.post("/trip/join", identifiers);
export const leaveTrip = (tripCode) => API.get(`/trip/leave/${tripCode}`);
export const inviteToTrip = (tripCode, email) =>
  API.post(`/trip/invite/${tripCode}`, { email });
export const addToTrip = (tripCode, userId) =>
  API.post(`/trip/add/${tripCode}`, { userId });
export const removeFromTrip = (tripCode, userId) =>
  API.post(`/trip/remove/${tripCode}`, { userId });
export const getTrips = () => API.get("/trip");
export const getTripDetails = (tripCode) => API.get(`/trip/${tripCode}`);
export const updateTripDetails = (tripData) =>
  API.post(`/trip/update/${tripData.tripCode}`, tripData);
export const addExpense = (tripCode, expense) => API.post(`/trip/expense/add/${tripCode}`, expense);
export const editExpense = (tripCode, expense) => API.post(`/trip/expense/edit/${tripCode}`, expense);
export const getTripExpense = (tripCode) => API.get(`/trip/expense/${tripCode}`);
export const getAllExpense = () => API.get('/user/expense');
export const addNewTripActivity = (tripCode, activityDetail) =>
  API.post(`/trip/detail/new/${tripCode}`, activityDetail);
export const updateTripActivity = (tripCode, details) =>
  API.post(`/trip/details/edit/${tripCode}`, details);
export const getDetailsOn = (tripCode, date) =>
  API.get(`/trip/details/${date}/${tripCode}`);
export const setFavorite = (tripCode, value) =>
  API.get(`/trip/favorite/${tripCode}-${value}`);
export const getMetricsAllTripTotalExpense = () => API.get('/metrics/all-trips/expense/total');
export const getMetricsAllTripExpenseSplit = () => API.get('/metrics/all-trips/expense/split');
export const getMetricsAllTripDuration = () => API.get('/metrics/all-trips/duration');
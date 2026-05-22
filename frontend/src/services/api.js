import axios from "axios";

const api = axios.create({
  baseURL: "http://127.0.0.1:8000/api",
});

export const getTrails = () => api.get("/trails/");
export const getTrail = (slug) => api.get(`/trails/${slug}/`);

export default api;

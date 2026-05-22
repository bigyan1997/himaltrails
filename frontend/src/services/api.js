import axios from "axios";

const api = axios.create({
  baseURL: "http://127.0.0.1:8000/api",
});

// Attach JWT token to every request if present
api.interceptors.request.use((config) => {
  const token = localStorage.getItem("access_token");
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// Trails
export const getTrails = () => api.get("/trails/");
export const getTrail  = (slug) => api.get(`/trails/${slug}/`);

// Auth
export const login       = (email, password) => api.post("/auth/login/",    { email, password });
export const logout      = ()               => api.post("/auth/logout/");
export const register    = (data)           => api.post("/auth/registration/", data);
export const getMe       = ()               => api.get("/auth/user/");
export const googleLogin = (accessToken)    => api.post("/auth/google/", { access_token: accessToken });

// Planner
export const getSavedTrails  = ()           => api.get('/planner/saved/');
export const saveTrail       = (trail_slug) => api.post('/planner/saved/', { trail_slug });
export const unsaveTrail     = (trail_slug) => api.delete(`/planner/saved/${trail_slug}/`);
export const getNote         = (trail_slug) => api.get(`/planner/notes/${trail_slug}/`);
export const saveNote        = (trail_slug, content) => api.put(`/planner/notes/${trail_slug}/`, { content });
export const getPackingList  = ()           => api.get('/planner/packing/');
export const addPackingItem  = (data)       => api.post('/planner/packing/', data);
export const updatePackingItem = (id, data) => api.patch(`/planner/packing/${id}/`, data);
export const deletePackingItem = (id)       => api.delete(`/planner/packing/${id}/`);

export default api;

import axios from "axios";

const BASE_URL = import.meta.env.VITE_API_URL || "http://127.0.0.1:8000/api";

const api = axios.create({
  baseURL: BASE_URL,
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem("access_token");
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

api.interceptors.response.use(
  res => res,
  async err => {
    const original = err.config;
    if (err.response?.status === 401 && !original._retry) {
      original._retry = true;
      const refresh = localStorage.getItem("refresh_token");
      if (refresh) {
        try {
          const { data } = await axios.post(`${BASE_URL}/auth/token/refresh/`, { refresh });
          localStorage.setItem("access_token", data.access);
          original.headers.Authorization = `Bearer ${data.access}`;
          return api(original);
        } catch {
          localStorage.removeItem("access_token");
          localStorage.removeItem("refresh_token");
        }
      }
    }
    return Promise.reject(err);
  }
);

// Trails
export const getTrails        = ()     => api.get("/trails/");
export const getTrail         = (slug) => api.get(`/trails/${slug}/`);
export const getPopularTrails = ()     => api.get("/trails/popular/");

// Auth
export const login       = (email, password) => api.post("/auth/login/",        { email, password });
export const logout      = ()                => api.post("/auth/logout/");
export const register    = (data)            => api.post("/auth/registration/",  data);
export const getMe       = ()                => api.get("/auth/user/");
export const googleLogin = (accessToken)     => api.post("/auth/google/",        { access_token: accessToken });

// Planner — saved trails
export const getSavedTrails  = ()           => api.get('/planner/saved/');
export const saveTrail       = (trail_slug) => api.post('/planner/saved/', { trail_slug });
export const unsaveTrail     = (trail_slug) => api.delete(`/planner/saved/${trail_slug}/`);

// Planner — notes
export const getNote  = (trail_slug)          => api.get(`/planner/notes/${trail_slug}/`);
export const saveNote = (trail_slug, content) => api.put(`/planner/notes/${trail_slug}/`, { content });

// Planner — packing
export const getPackingList    = ()           => api.get('/planner/packing/');
export const addPackingItem    = (data)       => api.post('/planner/packing/', data);
export const updatePackingItem = (id, data)   => api.patch(`/planner/packing/${id}/`, data);
export const deletePackingItem = (id)         => api.delete(`/planner/packing/${id}/`);

// Planner — reviews
export const getReviews   = (trail_slug)       => api.get(`/planner/reviews/${trail_slug}/`);
export const submitReview = (trail_slug, data) => api.post(`/planner/reviews/${trail_slug}/`, data);
export const deleteReview = (trail_slug, id)   => api.delete(`/planner/reviews/${trail_slug}/${id}/`);

// Planner — completed trails
export const getCompletedTrails  = ()         => api.get('/planner/completed/');
export const markCompleted       = (data)     => api.post('/planner/completed/', data);
export const unmarkCompleted     = (trail_slug) => api.delete(`/planner/completed/${trail_slug}/`);

// Planner — trip plans
export const getTripPlans    = ()       => api.get('/planner/plans/');
export const saveTripPlan    = (data)   => api.post('/planner/plans/', data);
export const deleteTripPlan  = (trail_slug) => api.delete(`/planner/plans/${trail_slug}/`);

export default api;

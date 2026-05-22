import { Routes, Route } from "react-router-dom";
import { AuthProvider } from "./contexts/AuthContext";
import Home       from "./pages/Home";
import TrailList  from "./pages/TrailList";
import TrailDetail from "./pages/TrailDetail";
import Login      from "./pages/Login";
import Register   from "./pages/Register";
import Dashboard  from "./pages/Dashboard";

export default function App() {
  return (
    <AuthProvider>
      <Routes>
        <Route path="/"              element={<Home />} />
        <Route path="/trails"        element={<TrailList />} />
        <Route path="/trails/:slug"  element={<TrailDetail />} />
        <Route path="/login"         element={<Login />} />
        <Route path="/register"      element={<Register />} />
        <Route path="/dashboard"     element={<Dashboard />} />
      </Routes>
    </AuthProvider>
  );
}

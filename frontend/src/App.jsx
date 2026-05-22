import { Routes, Route } from "react-router-dom";
import Home from "./pages/Home";
import TrailList from "./pages/TrailList";
import TrailDetail from "./pages/TrailDetail";

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/trails" element={<TrailList />} />
      <Route path="/trails/:slug" element={<TrailDetail />} />
    </Routes>
  );
}

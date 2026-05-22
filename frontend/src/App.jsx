import { Routes, Route, useLocation } from "react-router-dom";
import { AnimatePresence, motion } from "framer-motion";
import { AuthProvider } from "./contexts/AuthContext";
import BottomNav from "./components/BottomNav";
import Home        from "./pages/Home";
import TrailList   from "./pages/TrailList";
import TrailDetail from "./pages/TrailDetail";
import Login       from "./pages/Login";
import Register    from "./pages/Register";
import Dashboard   from "./pages/Dashboard";
import MapView     from "./pages/MapView";

const pageVariants = {
  initial: { opacity: 0, y: 18 },
  in:      { opacity: 1, y: 0 },
  out:     { opacity: 0, y: -10 },
}

const pageTransition = { duration: 0.28, ease: [0.4, 0, 0.2, 1] }

function PageWrapper({ children }) {
  return (
    <motion.div
      initial="initial"
      animate="in"
      exit="out"
      variants={pageVariants}
      transition={pageTransition}
    >
      {children}
    </motion.div>
  )
}

function AnimatedRoutes() {
  const location = useLocation()
  return (
    <AnimatePresence mode="wait">
      <Routes location={location} key={location.pathname}>
        <Route path="/"             element={<PageWrapper><Home /></PageWrapper>} />
        <Route path="/trails"       element={<PageWrapper><TrailList /></PageWrapper>} />
        <Route path="/trails/:slug" element={<PageWrapper><TrailDetail /></PageWrapper>} />
        <Route path="/map"          element={<PageWrapper><MapView /></PageWrapper>} />
        <Route path="/login"        element={<PageWrapper><Login /></PageWrapper>} />
        <Route path="/register"     element={<PageWrapper><Register /></PageWrapper>} />
        <Route path="/dashboard"    element={<PageWrapper><Dashboard /></PageWrapper>} />
      </Routes>
    </AnimatePresence>
  )
}

export default function App() {
  return (
    <AuthProvider>
      <AnimatedRoutes />
      <BottomNav />
    </AuthProvider>
  );
}

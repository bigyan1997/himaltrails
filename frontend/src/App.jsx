import { Routes, Route, useLocation } from "react-router-dom";
import { AnimatePresence, motion, useAnimation } from "framer-motion";
import { useEffect } from "react";
import { AuthProvider } from "./contexts/AuthContext";
import BottomNav from "./components/BottomNav";
import Home        from "./pages/Home";
import TrailList   from "./pages/TrailList";
import TrailDetail from "./pages/TrailDetail";
import Login       from "./pages/Login";
import Register    from "./pages/Register";
import Dashboard   from "./pages/Dashboard";
import MapView     from "./pages/MapView";
import Guides      from "./pages/Guides";
import PeakFinder  from "./pages/PeakFinder";

const pageVariants = {
  initial: { opacity: 0, y: 16, scale: 0.994 },
  in:      { opacity: 1, y: 0,  scale: 1      },
  out:     { opacity: 0, y: -8, scale: 0.998  },
}

const pageTransition = {
  duration: 0.35,
  ease: [0.25, 0.46, 0.45, 0.94],
}

function NavProgressBar() {
  const location  = useLocation()
  const controls  = useAnimation()

  useEffect(() => {
    controls.set({ scaleX: 0, opacity: 1 })
    controls.start({ scaleX: 1, opacity: 1, transition: { duration: 0.38, ease: [0.4, 0, 0.2, 1] } })
      .then(() => controls.start({ opacity: 0, transition: { duration: 0.22, delay: 0.05 } }))
  }, [location.pathname])

  return (
    <motion.div
      animate={controls}
      style={{
        position:        'fixed',
        top:             0,
        left:            0,
        right:           0,
        height:          '3px',
        background:      'linear-gradient(90deg, #C4973A 0%, #E8C06A 60%, #C4973A 100%)',
        transformOrigin: 'left center',
        zIndex:          9999,
        pointerEvents:   'none',
      }}
    />
  )
}

function PageWrapper({ children }) {
  return (
    <motion.div
      initial="initial"
      animate="in"
      exit="out"
      variants={pageVariants}
      transition={pageTransition}
      style={{ willChange: 'opacity, transform' }}
    >
      {children}
    </motion.div>
  )
}

function AnimatedRoutes() {
  const location = useLocation()
  useEffect(() => { window.scrollTo(0, 0) }, [location.pathname])
  return (
    <>
      <NavProgressBar />
      <AnimatePresence mode="wait">
        <Routes location={location} key={location.pathname}>
          <Route path="/"             element={<PageWrapper><Home /></PageWrapper>} />
          <Route path="/trails"       element={<PageWrapper><TrailList /></PageWrapper>} />
          <Route path="/trails/:slug" element={<PageWrapper><TrailDetail /></PageWrapper>} />
          <Route path="/map"          element={<PageWrapper><MapView /></PageWrapper>} />
          <Route path="/guides"       element={<PageWrapper><Guides /></PageWrapper>} />
          <Route path="/peaks"        element={<PageWrapper><PeakFinder /></PageWrapper>} />
          <Route path="/login"        element={<PageWrapper><Login /></PageWrapper>} />
          <Route path="/register"     element={<PageWrapper><Register /></PageWrapper>} />
          <Route path="/dashboard"    element={<PageWrapper><Dashboard /></PageWrapper>} />
        </Routes>
      </AnimatePresence>
    </>
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

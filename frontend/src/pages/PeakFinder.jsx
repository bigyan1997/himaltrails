import { useEffect, useRef, useState, useCallback } from 'react'
import { Link } from 'react-router-dom'
import Navbar from '../components/Navbar'
import useMobile from '../hooks/useMobile'

const PEAKS = [
  { name: 'Mount Everest',     alt: 8849, lat: 27.9881, lon: 86.9250 },
  { name: 'Lhotse',            alt: 8516, lat: 27.9617, lon: 86.9333 },
  { name: 'Makalu',            alt: 8485, lat: 27.8897, lon: 87.0881 },
  { name: 'Cho Oyu',           alt: 8188, lat: 28.0942, lon: 86.6608 },
  { name: 'Annapurna I',       alt: 8091, lat: 28.5966, lon: 83.8200 },
  { name: 'Dhaulagiri I',      alt: 8167, lat: 28.6966, lon: 83.4875 },
  { name: 'Manaslu',           alt: 8163, lat: 28.5500, lon: 84.5592 },
  { name: 'Kangchenjunga',     alt: 8586, lat: 27.7025, lon: 88.1475 },
  { name: 'Nuptse',            alt: 7861, lat: 27.9697, lon: 86.8953 },
  { name: 'Ama Dablam',        alt: 6812, lat: 27.8614, lon: 86.8597 },
  { name: 'Island Peak',       alt: 6189, lat: 27.9248, lon: 86.9295 },
  { name: 'Lobuche East',      alt: 6119, lat: 27.9619, lon: 86.7994 },
  { name: 'Mera Peak',         alt: 6476, lat: 27.7139, lon: 86.9011 },
  { name: 'Thamserku',         alt: 6618, lat: 27.8183, lon: 86.8008 },
  { name: 'Pumori',            alt: 7161, lat: 27.9994, lon: 86.8314 },
  { name: 'Annapurna South',   alt: 7219, lat: 28.5250, lon: 83.8181 },
  { name: 'Hiunchuli',         alt: 6441, lat: 28.4969, lon: 83.8442 },
  { name: 'Machhapuchhre',     alt: 6993, lat: 28.5253, lon: 83.9797 },
  { name: 'Gangapurna',        alt: 7455, lat: 28.6358, lon: 84.0589 },
  { name: 'Thorong Peak',      alt: 5942, lat: 28.7800, lon: 83.9211 },
  { name: 'Tilicho Peak',      alt: 7134, lat: 28.6878, lon: 83.8778 },
  { name: 'Langtang Lirung',   alt: 7227, lat: 28.2567, lon: 85.5236 },
  { name: 'Dorje Lakpa',       alt: 6966, lat: 28.1897, lon: 85.6822 },
  { name: 'Ganesh I',          alt: 7422, lat: 28.3867, lon: 84.9036 },
]

function toRad(deg) { return deg * Math.PI / 180 }

function bearing(lat1, lon1, lat2, lon2) {
  const dLon = toRad(lon2 - lon1)
  const y    = Math.sin(dLon) * Math.cos(toRad(lat2))
  const x    = Math.cos(toRad(lat1)) * Math.sin(toRad(lat2)) -
               Math.sin(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.cos(dLon)
  return (Math.atan2(y, x) * 180 / Math.PI + 360) % 360
}

function distance(lat1, lon1, lat2, lon2) {
  const R  = 6371
  const dLat = toRad(lat2 - lat1), dLon = toRad(lon2 - lon1)
  const a  = Math.sin(dLat/2)**2 + Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLon/2)**2
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
}

function angleDiff(a, b) {
  let d = ((a - b) + 360) % 360
  if (d > 180) d -= 360
  return d
}

export default function PeakFinder() {
  const videoRef           = useRef(null)
  const [stream,   setStream]   = useState(null)
  const [pos,      setPos]      = useState(null)
  const [heading,  setHeading]  = useState(null)
  const [error,    setError]    = useState(null)
  const [started,  setStarted]  = useState(false)
  const [fov,      setFov]      = useState(60)
  const [camW,     setCamW]     = useState(360)
  const isMobile               = useMobile()

  const overlayRef = useRef(null)

  const startCamera = useCallback(async () => {
    setError(null)
    try {
      const s = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: { ideal: 'environment' }, width: { ideal: 1280 }, height: { ideal: 720 } },
      })
      setStream(s)
      if (videoRef.current) {
        videoRef.current.srcObject = s
        videoRef.current.play()
      }
    } catch (e) {
      setError('Camera access denied. Allow camera permissions and reload.')
      return
    }
    if (!navigator.geolocation) { setError('Geolocation not supported.'); return }
    navigator.geolocation.getCurrentPosition(
      p => setPos({ lat: p.coords.latitude, lon: p.coords.longitude }),
      () => setError('Location access denied. Enable location permissions.'),
      { enableHighAccuracy: true },
    )
    setStarted(true)
  }, [])

  useEffect(() => {
    if (!started) return
    const handleOrientation = (e) => {
      const h = e.webkitCompassHeading ?? (e.alpha != null ? (360 - e.alpha) % 360 : null)
      if (h != null) setHeading(h)
    }
    if (typeof DeviceOrientationEvent !== 'undefined' && typeof DeviceOrientationEvent.requestPermission === 'function') {
      DeviceOrientationEvent.requestPermission().then(state => {
        if (state === 'granted') window.addEventListener('deviceorientation', handleOrientation, true)
        else setError('Compass permission denied. Peak overlay requires device orientation.')
      })
    } else {
      window.addEventListener('deviceorientation', handleOrientation, true)
    }
    return () => window.removeEventListener('deviceorientation', handleOrientation, true)
  }, [started])

  useEffect(() => {
    if (overlayRef.current) setCamW(overlayRef.current.offsetWidth)
    const ro = new ResizeObserver(entries => {
      if (entries[0]) setCamW(entries[0].contentRect.width)
    })
    if (overlayRef.current) ro.observe(overlayRef.current)
    return () => ro.disconnect()
  }, [])

  useEffect(() => {
    return () => { if (stream) stream.getTracks().forEach(t => t.stop()) }
  }, [stream])

  const nearbyPeaks = pos
    ? PEAKS
        .map(p => ({ ...p, dist: distance(pos.lat, pos.lon, p.lat, p.lon), brng: bearing(pos.lat, pos.lon, p.lat, p.lon) }))
        .filter(p => p.dist < 300)
        .sort((a, b) => a.dist - b.dist)
        .slice(0, 12)
    : []

  const visiblePeaks = (heading != null)
    ? nearbyPeaks.filter(p => Math.abs(angleDiff(p.brng, heading)) <= fov / 2)
    : []

  return (
    <div style={{ backgroundColor: '#0A1A12', minHeight: '100vh', fontFamily: 'DM Sans, sans-serif', color: '#FFFFFF' }}>
      <Navbar>
        <Link to="/map" style={{ fontSize: '12px', letterSpacing: '0.12em', textTransform: 'uppercase', color: 'rgba(255,255,255,0.7)', textDecoration: 'none' }}>
          Map
        </Link>
      </Navbar>

      <div style={{ maxWidth: '900px', margin: '0 auto', padding: isMobile ? '88px 16px 80px' : '96px 24px 80px' }}>

        <p style={{ fontSize: '11px', letterSpacing: '0.2em', textTransform: 'uppercase', color: '#C4973A', marginBottom: '12px' }}>✦ AR Peak Identifier</p>
        <h1 style={{ fontFamily: 'Fraunces, serif', fontSize: isMobile ? '32px' : '52px', fontWeight: 700, color: '#FFFFFF', marginBottom: '12px', lineHeight: 1.05 }}>
          Peak Finder
        </h1>
        <p style={{ fontSize: '15px', color: 'rgba(255,255,255,0.45)', marginBottom: '36px', lineHeight: 1.7, maxWidth: '520px' }}>
          Point your phone at the horizon to identify nearby Himalayan peaks. Uses your camera, GPS, and compass.
        </p>

        {!started ? (
          <div>
            <div style={{ backgroundColor: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '20px', padding: '32px', marginBottom: '24px', maxWidth: '480px' }}>
              <p style={{ fontSize: '13px', color: 'rgba(255,255,255,0.5)', lineHeight: 1.8, marginBottom: '20px' }}>
                This feature requires:<br />
                📷 Camera access (rear camera)<br />
                📍 GPS / location<br />
                🧭 Device compass (gyroscope)
              </p>
              <button onClick={startCamera}
                style={{ padding: '14px 32px', borderRadius: '12px', border: 'none', backgroundColor: '#C4973A', color: '#FFFFFF', fontSize: '15px', fontWeight: 700, cursor: 'pointer', fontFamily: 'DM Sans, sans-serif' }}>
                Start Peak Finder
              </button>
            </div>
            {error && <p style={{ fontSize: '13px', color: '#FF6B6B', padding: '12px 16px', backgroundColor: 'rgba(255,107,107,0.1)', borderRadius: '10px', maxWidth: '480px' }}>{error}</p>}

            {/* Static fallback list */}
            <div style={{ marginTop: '40px' }}>
              <p style={{ fontSize: '12px', letterSpacing: '0.12em', textTransform: 'uppercase', color: 'rgba(255,255,255,0.3)', marginBottom: '20px' }}>Nepal's highest peaks</p>
              <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr 1fr' : 'repeat(4, 1fr)', gap: '10px' }}>
                {PEAKS.filter(p => p.alt > 7000).sort((a,b) => b.alt - a.alt).map(p => (
                  <div key={p.name} style={{ backgroundColor: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '12px', padding: '14px 16px' }}>
                    <p style={{ fontSize: '13px', fontWeight: 600, color: '#FFFFFF', marginBottom: '4px' }}>{p.name}</p>
                    <p style={{ fontSize: '12px', color: '#C4973A', fontFamily: 'Fraunces, serif', fontWeight: 700 }}>{p.alt.toLocaleString()}m</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        ) : (
          <div>
            {error && <p style={{ fontSize: '13px', color: '#FF6B6B', marginBottom: '16px' }}>{error}</p>}

            {/* Camera view with overlay */}
            <div ref={overlayRef} style={{ position: 'relative', borderRadius: '16px', overflow: 'hidden', backgroundColor: '#000', maxHeight: '55vh', aspectRatio: '16/9' }}>
              <video
                ref={videoRef}
                autoPlay playsInline muted
                style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
              />

              {/* Compass HUD */}
              {heading != null && (
                <div style={{ position: 'absolute', top: '12px', right: '12px', backgroundColor: 'rgba(0,0,0,0.55)', backdropFilter: 'blur(8px)', borderRadius: '10px', padding: '8px 14px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <span style={{ fontSize: '18px' }}>🧭</span>
                  <span style={{ fontFamily: 'Fraunces, serif', fontSize: '15px', fontWeight: 700, color: '#C4973A' }}>{Math.round(heading)}°</span>
                  <span style={{ fontSize: '11px', color: 'rgba(255,255,255,0.5)' }}>
                    {heading < 22.5 || heading >= 337.5 ? 'N' : heading < 67.5 ? 'NE' : heading < 112.5 ? 'E' : heading < 157.5 ? 'SE' : heading < 202.5 ? 'S' : heading < 247.5 ? 'SW' : heading < 292.5 ? 'W' : 'NW'}
                  </span>
                </div>
              )}

              {/* GPS status */}
              <div style={{ position: 'absolute', top: '12px', left: '12px', backgroundColor: 'rgba(0,0,0,0.55)', backdropFilter: 'blur(8px)', borderRadius: '10px', padding: '8px 14px' }}>
                <span style={{ fontSize: '11px', color: pos ? '#7EC87E' : '#F5C842' }}>{pos ? `📍 ${pos.lat.toFixed(4)}, ${pos.lon.toFixed(4)}` : '📍 Getting location…'}</span>
              </div>

              {/* Peak overlays */}
              {heading != null && visiblePeaks.map(p => {
                const diff = angleDiff(p.brng, heading)
                const x    = camW / 2 + (diff / (fov / 2)) * (camW / 2)
                const heightFrac = Math.min(1, (p.alt - 5000) / 4000)
                const y = 30 + (1 - heightFrac) * 40
                return (
                  <div key={p.name} style={{ position: 'absolute', left: `${x}px`, top: `${y}%`, transform: 'translateX(-50%)', pointerEvents: 'none', textAlign: 'center' }}>
                    <div style={{ backgroundColor: 'rgba(26,58,42,0.85)', backdropFilter: 'blur(6px)', border: '1px solid rgba(196,151,58,0.6)', borderRadius: '8px', padding: '6px 10px', whiteSpace: 'nowrap' }}>
                      <p style={{ fontSize: '11px', fontWeight: 700, color: '#FFFFFF', marginBottom: '2px' }}>{p.name}</p>
                      <p style={{ fontSize: '10px', color: '#C4973A', fontFamily: 'Fraunces, serif', fontWeight: 700 }}>{p.alt.toLocaleString()}m</p>
                      <p style={{ fontSize: '9px', color: 'rgba(255,255,255,0.4)' }}>{Math.round(p.dist)} km</p>
                    </div>
                    <div style={{ width: '1px', height: '20px', backgroundColor: 'rgba(196,151,58,0.6)', margin: '0 auto' }} />
                    <div style={{ width: '5px', height: '5px', borderRadius: '50%', backgroundColor: '#C4973A', margin: '0 auto' }} />
                  </div>
                )
              })}

              {/* No peaks in view message */}
              {heading != null && pos != null && visiblePeaks.length === 0 && (
                <div style={{ position: 'absolute', bottom: '16px', left: '50%', transform: 'translateX(-50%)', backgroundColor: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(8px)', borderRadius: '10px', padding: '8px 16px' }}>
                  <p style={{ fontSize: '12px', color: 'rgba(255,255,255,0.6)', whiteSpace: 'nowrap' }}>No peaks in current view — pan around</p>
                </div>
              )}
              {heading == null && pos != null && (
                <div style={{ position: 'absolute', bottom: '16px', left: '50%', transform: 'translateX(-50%)', backgroundColor: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(8px)', borderRadius: '10px', padding: '8px 16px' }}>
                  <p style={{ fontSize: '12px', color: '#F5C842', whiteSpace: 'nowrap' }}>🧭 Waiting for compass data…</p>
                </div>
              )}
            </div>

            {/* Controls */}
            <div style={{ marginTop: '16px', display: 'flex', alignItems: 'center', gap: '16px', flexWrap: 'wrap' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <label style={{ fontSize: '12px', color: 'rgba(255,255,255,0.5)' }}>Field of view: {fov}°</label>
                <input type="range" min={30} max={120} step={5} value={fov} onChange={e => setFov(Number(e.target.value))}
                  style={{ width: '120px', accentColor: '#C4973A' }} />
              </div>
              <button onClick={() => { if (stream) stream.getTracks().forEach(t => t.stop()); setStarted(false); setStream(null) }}
                style={{ padding: '8px 16px', borderRadius: '10px', border: '1px solid rgba(255,255,255,0.2)', backgroundColor: 'transparent', color: 'rgba(255,255,255,0.6)', fontSize: '12px', cursor: 'pointer', fontFamily: 'DM Sans, sans-serif' }}>
                Stop camera
              </button>
            </div>

            {/* Peaks list */}
            {nearbyPeaks.length > 0 && (
              <div style={{ marginTop: '28px' }}>
                <p style={{ fontSize: '11px', letterSpacing: '0.12em', textTransform: 'uppercase', color: 'rgba(255,255,255,0.3)', marginBottom: '14px' }}>Nearby peaks</p>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  {nearbyPeaks.map(p => (
                    <div key={p.name} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 14px', borderRadius: '10px', backgroundColor: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.07)' }}>
                      <div>
                        <p style={{ fontSize: '13px', fontWeight: 600, color: '#FFFFFF' }}>{p.name}</p>
                        <p style={{ fontSize: '11px', color: 'rgba(255,255,255,0.35)' }}>{Math.round(p.dist)} km · {Math.round(p.brng)}° bearing</p>
                      </div>
                      <p style={{ fontFamily: 'Fraunces, serif', fontSize: '15px', fontWeight: 700, color: '#C4973A' }}>{p.alt.toLocaleString()}m</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {pos == null && !error && (
              <p style={{ marginTop: '16px', fontSize: '13px', color: 'rgba(255,255,255,0.4)' }}>Waiting for GPS fix…</p>
            )}
          </div>
        )}
      </div>
    </div>
  )
}

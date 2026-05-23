import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet'
import L from 'leaflet'
import { getTrails } from '../services/api'
import Navbar from '../components/Navbar'
import useMobile from '../hooks/useMobile'
import 'leaflet/dist/leaflet.css'

function useOfflineStatus() {
  const [offline, setOffline] = useState(!navigator.onLine)
  useEffect(() => {
    const on  = () => setOffline(false)
    const off = () => setOffline(true)
    window.addEventListener('online',  on)
    window.addEventListener('offline', off)
    return () => { window.removeEventListener('online', on); window.removeEventListener('offline', off) }
  }, [])
  return offline
}

// Fix Leaflet default icon paths broken by bundlers
delete L.Icon.Default.prototype._getIconUrl
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  iconUrl:       'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl:     'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
})

const DIFF_COLOR = { easy: '#2E7D32', moderate: '#F57F17', hard: '#BF360C', expert: '#880E4F' }

function trailIcon(difficulty) {
  const color = DIFF_COLOR[difficulty] || '#1A3A2A'
  const svg = encodeURIComponent(`
    <svg xmlns="http://www.w3.org/2000/svg" width="32" height="40" viewBox="0 0 32 40">
      <path d="M16 0C9.37 0 4 5.37 4 12c0 8.25 12 28 12 28S28 20.25 28 12C28 5.37 22.63 0 16 0z"
        fill="${color}" stroke="white" stroke-width="2"/>
      <circle cx="16" cy="12" r="5" fill="white"/>
    </svg>
  `)
  return L.icon({
    iconUrl:     `data:image/svg+xml,${svg}`,
    iconSize:    [32, 40],
    iconAnchor:  [16, 40],
    popupAnchor: [0, -44],
  })
}

function FitBounds({ trails }) {
  const map = useMap()
  useEffect(() => {
    const pts = trails.filter(t => t.latitude && t.longitude).map(t => [Number(t.latitude), Number(t.longitude)])
    if (pts.length > 0) map.fitBounds(pts, { padding: [40, 40] })
  }, [trails, map])
  return null
}

export default function MapView() {
  const [trails, setTrails]       = useState([])
  const [loading, setLoading]     = useState(true)
  const [selected, setSelected]   = useState(null)
  const isMobile                  = useMobile()
  const offline                   = useOfflineStatus()

  useEffect(() => {
    getTrails().then(res => setTrails(res.data)).finally(() => setLoading(false))
  }, [])

  const mapped = trails.filter(t => t.latitude && t.longitude)

  return (
    <div style={{ backgroundColor: '#F7F5F0', minHeight: '100vh', fontFamily: 'DM Sans, sans-serif', display: 'flex', flexDirection: 'column' }}>
      <Navbar>
        <Link to="/trails" style={{ fontSize: '12px', letterSpacing: '0.12em', textTransform: 'uppercase', color: 'rgba(255,255,255,0.7)', textDecoration: 'none' }}>
          Trails
        </Link>
        <Link to="/map" style={{ fontSize: '12px', letterSpacing: '0.12em', textTransform: 'uppercase', color: '#C4973A', textDecoration: 'none' }}>
          Map
        </Link>
      </Navbar>

      {/* Offline banner */}
      {offline && (
        <div style={{ backgroundColor: '#F57F17', padding: '10px 24px', textAlign: 'center' }}>
          <p style={{ fontSize: '13px', fontWeight: 600, color: '#FFFFFF' }}>
            You're offline — showing cached trail data. Map tiles may not load.
          </p>
        </div>
      )}

      {/* Header */}
      <div style={{ padding: isMobile ? '24px 20px 16px' : '32px 48px 20px', backgroundColor: '#FFFFFF', borderBottom: '1px solid #E8E5E0' }}>
        <div style={{ maxWidth: '1100px', margin: '0 auto', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '16px', flexWrap: 'wrap' }}>
          <div>
            <h1 style={{ fontFamily: 'Fraunces, serif', fontSize: isMobile ? '26px' : '36px', fontWeight: 700, color: '#1A3A2A', marginBottom: '4px' }}>
              Trail Map
            </h1>
            <p style={{ fontSize: '14px', color: '#999' }}>{mapped.length} trails plotted across Nepal</p>
          </div>
          <div style={{ display: 'flex', gap: '16px', alignItems: 'center', flexWrap: 'wrap' }}>
            {/* Peak Finder link */}
            <Link to="/peaks" style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '8px 16px', borderRadius: '10px', backgroundColor: '#1A3A2A', color: '#FFFFFF', textDecoration: 'none', fontSize: '13px', fontWeight: 600 }}>
              🏔 Peak Finder
            </Link>
            <Link to="/itinerary" style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '8px 16px', borderRadius: '10px', backgroundColor: '#C4973A', color: '#FFFFFF', textDecoration: 'none', fontSize: '13px', fontWeight: 600 }}>
              🗺 Plan Route
            </Link>
            {/* Legend */}
            <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
              {Object.entries(DIFF_COLOR).map(([diff, color]) => (
                <div key={diff} style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <div style={{ width: '10px', height: '10px', borderRadius: '50%', backgroundColor: color }} />
                  <span style={{ fontSize: '12px', color: '#666', textTransform: 'capitalize' }}>{diff}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      <div style={{ flex: 1, display: 'flex', position: 'relative', minHeight: '0' }}>
        {/* Map */}
        <div style={{ flex: 1 }}>
          {loading ? (
            <div style={{ height: '100%', minHeight: '500px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <p style={{ color: '#AAA' }}>Loading map…</p>
            </div>
          ) : (
            <MapContainer
              center={[28.2, 84.5]}
              zoom={7}
              style={{ height: isMobile ? 'calc(100vh - 200px)' : 'calc(100vh - 160px)', width: '100%' }}
            >
              <TileLayer
                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              />
              <FitBounds trails={mapped} />
              {mapped.map(trail => (
                <Marker
                  key={trail.slug}
                  position={[Number(trail.latitude), Number(trail.longitude)]}
                  icon={trailIcon(trail.difficulty)}
                  eventHandlers={{ click: () => setSelected(trail) }}
                >
                  <Popup>
                    <div style={{ fontFamily: 'DM Sans, sans-serif', minWidth: '180px' }}>
                      <p style={{ fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.08em', color: '#C4973A', fontWeight: 700, marginBottom: '4px' }}>
                        {trail.region}
                      </p>
                      <p style={{ fontFamily: 'Fraunces, serif', fontSize: '16px', fontWeight: 700, color: '#1A3A2A', marginBottom: '6px', lineHeight: 1.2 }}>
                        {trail.name}
                      </p>
                      <p style={{ fontSize: '12px', color: '#888', marginBottom: '8px' }}>
                        {trail.duration_days}d · {trail.max_altitude_m?.toLocaleString()}m max alt
                      </p>
                      <a href={`/trails/${trail.slug}`} style={{ display: 'block', textAlign: 'center', padding: '7px 12px', borderRadius: '8px', backgroundColor: '#1A3A2A', color: '#FFFFFF', textDecoration: 'none', fontSize: '12px', fontWeight: 600 }}>
                        View trail →
                      </a>
                    </div>
                  </Popup>
                </Marker>
              ))}
            </MapContainer>
          )}
        </div>

        {/* Side panel on desktop */}
        {!isMobile && (
          <div style={{ width: '300px', flexShrink: 0, overflowY: 'auto', backgroundColor: '#FFFFFF', borderLeft: '1px solid #E8E5E0', padding: '20px 0' }}>
            <p style={{ fontSize: '11px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em', color: '#BBB', padding: '0 20px 12px' }}>
              All trails
            </p>
            {mapped.map(trail => (
              <div
                key={trail.slug}
                onClick={() => setSelected(trail.slug === selected?.slug ? null : trail)}
                style={{
                  padding: '14px 20px', cursor: 'pointer',
                  backgroundColor: selected?.slug === trail.slug ? '#F7FAF5' : 'transparent',
                  borderLeft: selected?.slug === trail.slug ? '3px solid #1A3A2A' : '3px solid transparent',
                  transition: 'all 0.15s',
                }}
                onMouseEnter={e => { if (selected?.slug !== trail.slug) e.currentTarget.style.backgroundColor = '#FAFAF8' }}
                onMouseLeave={e => { if (selected?.slug !== trail.slug) e.currentTarget.style.backgroundColor = 'transparent' }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                  <div style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: DIFF_COLOR[trail.difficulty] || '#AAA', flexShrink: 0 }} />
                  <p style={{ fontSize: '14px', fontWeight: 600, color: '#1A3A2A', lineHeight: 1.2 }}>{trail.name}</p>
                </div>
                <p style={{ fontSize: '12px', color: '#999', paddingLeft: '16px' }}>
                  {trail.duration_days}d · {trail.max_altitude_m?.toLocaleString()}m · {trail.region}
                </p>
                {selected?.slug === trail.slug && (
                  <Link to={`/trails/${trail.slug}`} style={{ display: 'inline-block', marginTop: '8px', marginLeft: '16px', padding: '5px 12px', borderRadius: '8px', backgroundColor: '#1A3A2A', color: '#FFF', textDecoration: 'none', fontSize: '12px', fontWeight: 600 }}>
                    View trail →
                  </Link>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

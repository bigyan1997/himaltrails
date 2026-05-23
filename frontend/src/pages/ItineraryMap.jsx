import { useState, useEffect, useCallback } from 'react'
import { Link } from 'react-router-dom'
import { MapContainer, TileLayer, Marker, Popup, Polyline, useMapEvents, useMap } from 'react-leaflet'
import L from 'leaflet'
import { getTrails, getItineraryPlans, createItineraryPlan, deleteItineraryPlan, addWaypoint, deleteWaypoint } from '../services/api'
import { useAuth } from '../contexts/AuthContext'
import Navbar from '../components/Navbar'
import useMobile from '../hooks/useMobile'
import 'leaflet/dist/leaflet.css'

delete L.Icon.Default.prototype._getIconUrl
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  iconUrl:       'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl:     'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
})

const DAY_COLORS = [
  '#E53935','#FB8C00','#F9A825','#43A047','#00ACC1',
  '#1E88E5','#8E24AA','#D81B60','#00897B','#546E7A',
  '#6D4C41','#FF7043','#7CB342','#039BE5','#AB47BC',
]
const WAYPOINT_TYPES = ['teahouse','camp','pass','viewpoint','village','start','finish','other']

const dayColor = (d) => DAY_COLORS[(d - 1) % DAY_COLORS.length]

function waypointIcon(day, pending = false) {
  const color = pending ? '#AAAAAA' : dayColor(day)
  const svg = encodeURIComponent(
    `<svg xmlns="http://www.w3.org/2000/svg" width="28" height="36" viewBox="0 0 28 36">` +
    `<path d="M14 0C8.48 0 4 4.48 4 10c0 7.25 10 26 10 26S24 17.25 24 10C24 4.48 19.52 0 14 0z" fill="${color}" stroke="white" stroke-width="1.5"/>` +
    `<circle cx="14" cy="10" r="4" fill="white"/>` +
    `</svg>`
  )
  return L.icon({ iconUrl: `data:image/svg+xml,${svg}`, iconSize: [28, 36], iconAnchor: [14, 36], popupAnchor: [0, -40] })
}

function haversineKm(lat1, lon1, lat2, lon2) {
  const R = 6371
  const dLat = (lat2 - lat1) * Math.PI / 180
  const dLon = (lon2 - lon1) * Math.PI / 180
  const a = Math.sin(dLat / 2) ** 2 + Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * Math.sin(dLon / 2) ** 2
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
}

function calcDayStats(stops) {
  if (stops.length < 2) return null
  let km = 0, gainM = 0, lossM = 0
  for (let i = 1; i < stops.length; i++) {
    const p = stops[i - 1], c = stops[i]
    km += haversineKm(Number(p.latitude), Number(p.longitude), Number(c.latitude), Number(c.longitude))
    if (p.altitude_m != null && c.altitude_m != null) {
      const diff = Number(c.altitude_m) - Number(p.altitude_m)
      if (diff > 0) gainM += diff; else lossM += Math.abs(diff)
    }
  }
  km *= 1.3  // straight-line → trail distance factor
  const hrs = km / 4 + gainM / 600 + lossM / 2000  // Naismith's rule
  return { km: Math.round(km * 10) / 10, hrs: Math.round(hrs * 10) / 10, gainM: Math.round(gainM), lossM: Math.round(lossM) }
}

function formatHrs(hrs) {
  if (hrs < 0.08) return '< 5 min'
  const h = Math.floor(hrs)
  const m = Math.round((hrs - h) * 60)
  if (h === 0) return `${m}m`
  if (m === 0) return `${h}h`
  return `${h}h ${m}m`
}

function lonToTile(lon, z) { return Math.floor((lon + 180) / 360 * (1 << z)) }
function latToTile(lat, z) {
  const r = lat * Math.PI / 180
  return Math.floor((1 - Math.log(Math.tan(r) + 1 / Math.cos(r)) / Math.PI) / 2 * (1 << z))
}

function escapeXml(s) {
  return String(s).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;')
}

function downloadGPX(planName, waypoints) {
  if (!waypoints.length) return
  const byDay = {}
  waypoints.forEach(w => { (byDay[w.day_number] = byDay[w.day_number] || []).push(w) })
  Object.values(byDay).forEach(a => a.sort((a, b) => a.order - b.order))

  const wpts = waypoints.map(w =>
    `  <wpt lat="${w.latitude}" lon="${w.longitude}"><ele>${w.altitude_m || 0}</ele>` +
    `<name>${escapeXml(w.name)}</name><cmt>Day ${w.day_number}</cmt></wpt>`
  ).join('\n')

  const trks = Object.entries(byDay).map(([day, pts]) =>
    `  <trk><name>${escapeXml(planName)} - Day ${day}</name><trkseg>` +
    pts.map(w => `<trkpt lat="${w.latitude}" lon="${w.longitude}"><ele>${w.altitude_m || 0}</ele><name>${escapeXml(w.name)}</name></trkpt>`).join('') +
    `</trkseg></trk>`
  ).join('\n')

  const gpx = `<?xml version="1.0" encoding="UTF-8"?>\n<gpx version="1.1" creator="HimalTrails" xmlns="http://www.topografix.com/GPX/1/1">\n  <metadata><name>${escapeXml(planName)}</name></metadata>\n${wpts}\n${trks}\n</gpx>`
  const a = document.createElement('a')
  a.href = URL.createObjectURL(new Blob([gpx], { type: 'application/gpx+xml' }))
  a.download = `${planName.replace(/\s+/g, '-')}.gpx`
  document.body.appendChild(a); a.click(); document.body.removeChild(a)
}

async function prefetchTiles(waypoints, onProgress) {
  if (!waypoints.length) return
  const lats = waypoints.map(w => Number(w.latitude))
  const lons = waypoints.map(w => Number(w.longitude))
  const pad = 0.15
  const minLat = Math.min(...lats) - pad, maxLat = Math.max(...lats) + pad
  const minLon = Math.min(...lons) - pad, maxLon = Math.max(...lons) + pad
  const tiles = []
  for (let z = 10; z <= 14; z++) {
    const [x1, x2] = [lonToTile(minLon, z), lonToTile(maxLon, z)]
    const [y1, y2] = [latToTile(maxLat, z), latToTile(minLat, z)]
    for (let x = x1; x <= x2; x++)
      for (let y = y1; y <= y2; y++)
        tiles.push([z, x, y])
  }
  onProgress(0, tiles.length)
  const sub = ['a','b','c']
  for (let i = 0; i < tiles.length; i += 8) {
    await Promise.all(tiles.slice(i, i + 8).map(([z, x, y]) =>
      fetch(`https://${sub[x % 3]}.tile.openstreetmap.org/${z}/${x}/${y}.png`).catch(() => {})
    ))
    onProgress(Math.min(i + 8, tiles.length), tiles.length)
  }
}

function MapEvents({ addMode, onMapClick }) {
  useMapEvents({ click: e => { if (addMode) onMapClick(e.latlng) } })
  return null
}

function FitToWaypoints({ waypoints, planId }) {
  const map = useMap()
  useEffect(() => {
    if (!waypoints.length) return
    const pts = waypoints.map(w => [Number(w.latitude), Number(w.longitude)])
    try {
      if (pts.length === 1) map.setView(pts[0], 13)
      else map.fitBounds(pts, { padding: [50, 50], maxZoom: 14 })
    } catch {}
  }, [planId])
  return null
}

function FlyToTarget({ target }) {
  const map = useMap()
  useEffect(() => {
    if (target) map.flyTo([target.lat, target.lng], 13, { duration: 1.1 })
  }, [target])
  return null
}

export default function ItineraryMap() {
  const isMobile   = useMobile()
  const { user }   = useAuth()
  const [trails, setTrails]                 = useState([])
  const [plans, setPlans]                   = useState([])
  const [activePlan, setActivePlan]         = useState(null)
  const [waypoints, setWaypoints]           = useState([])
  const [numDays, setNumDays]               = useState(1)
  const [activeDay, setActiveDay]           = useState(1)
  const [loading, setLoading]               = useState(true)
  const [addMode, setAddMode]               = useState(false)
  const [showAddForm, setShowAddForm]       = useState(false)
  const [pendingLatLng, setPendingLatLng]   = useState(null)
  const [flyToTarget, setFlyToTarget]       = useState(null)
  const [wpName, setWpName]                 = useState('')
  const [wpType, setWpType]                 = useState('teahouse')
  const [wpAlt, setWpAlt]                   = useState('')
  const [adding, setAdding]                 = useState(false)
  const [searchResults, setSearchResults]   = useState([])
  const [searching, setSearching]           = useState(false)
  const [newPlanName, setNewPlanName]       = useState('')
  const [newPlanTrail, setNewPlanTrail]     = useState('')
  const [showNewPlan, setShowNewPlan]       = useState(false)
  const [creatingPlan, setCreatingPlan]     = useState(false)
  const [prefetch, setPrefetch]             = useState({ running: false, done: 0, total: 0 })
  const [mobileView, setMobileView]         = useState('map')

  // Nominatim search — only fires when form is open and no coords are pinned yet
  useEffect(() => {
    if (!showAddForm || pendingLatLng) { setSearchResults([]); setSearching(false); return }
    if (wpName.trim().length < 2) { setSearchResults([]); setSearching(false); return }
    setSearching(true)
    const timer = setTimeout(async () => {
      try {
        const res = await fetch(
          `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(wpName)}&format=json&limit=6&countrycodes=np,in,cn,bt&accept-language=en`
        )
        setSearchResults(await res.json())
      } catch {}
      finally { setSearching(false) }
    }, 350)
    return () => clearTimeout(timer)
  }, [wpName, pendingLatLng, showAddForm])

  useEffect(() => {
    getTrails().then(r => setTrails(r.data)).catch(() => {})
    if (user) {
      getItineraryPlans()
        .then(r => {
          setPlans(r.data)
          if (r.data.length) loadPlan(r.data[0])
        })
        .finally(() => setLoading(false))
    } else {
      setLoading(false)
    }
  }, [user])

  function loadPlan(plan) {
    setActivePlan(plan)
    const wps = plan.waypoints || []
    setWaypoints(wps)
    setNumDays(wps.length ? Math.max(...wps.map(w => w.day_number)) : 1)
    setActiveDay(1)
    cancelAddForm()
  }

  function openAddForm() {
    setShowAddForm(true)
    setAddMode(true)
    setWpName('')
    setWpType('teahouse')
    setWpAlt('')
    setPendingLatLng(null)
    setSearchResults([])
  }

  function cancelAddForm() {
    setShowAddForm(false)
    setAddMode(false)
    setPendingLatLng(null)
    setSearchResults([])
    setSearching(false)
    setWpName('')
    setWpType('teahouse')
    setWpAlt('')
  }

  function selectSearchResult(result) {
    const lat = parseFloat(result.lat)
    const lng = parseFloat(result.lon)
    const name = result.display_name.split(',')[0].trim()
    setPendingLatLng({ lat, lng })
    setFlyToTarget({ lat, lng })
    setWpName(name)
    setSearchResults([])
  }

  const allDays = Array.from({ length: Math.max(numDays, waypoints.length ? Math.max(...waypoints.map(w => w.day_number)) : 1) }, (_, i) => i + 1)

  const byDay = {}
  waypoints.forEach(w => { (byDay[w.day_number] = byDay[w.day_number] || []).push(w) })
  Object.values(byDay).forEach(a => a.sort((a, b) => a.order - b.order))

  const polylines = Object.entries(byDay)
    .filter(([, pts]) => pts.length > 1)
    .map(([day, pts]) => ({
      day: +day,
      color: dayColor(+day),
      positions: pts.map(w => [Number(w.latitude), Number(w.longitude)]),
    }))

  const activeDayStats = calcDayStats(byDay[activeDay] || [])

  const planTotals = (() => {
    let km = 0, hrs = 0, gainM = 0, lossM = 0
    Object.values(byDay).forEach(stops => {
      const s = calcDayStats(stops)
      if (s) { km += s.km; hrs += s.hrs; gainM += s.gainM; lossM += s.lossM }
    })
    return waypoints.length >= 2 ? { km: Math.round(km * 10) / 10, hrs: Math.round(hrs * 10) / 10, gainM: Math.round(gainM), lossM: Math.round(lossM) } : null
  })()

  const handleCreatePlan = async () => {
    if (!newPlanName.trim()) return
    setCreatingPlan(true)
    try {
      const res = await createItineraryPlan({ name: newPlanName.trim(), trail_slug: newPlanTrail || undefined })
      const plan = { ...res.data, waypoints: [] }
      setPlans(prev => [plan, ...prev])
      loadPlan(plan)
      setNewPlanName('')
      setNewPlanTrail('')
      setShowNewPlan(false)
    } finally {
      setCreatingPlan(false)
    }
  }

  const handleDeletePlan = async (e, id) => {
    e.stopPropagation()
    if (!window.confirm('Delete this itinerary?')) return
    await deleteItineraryPlan(id)
    const updated = plans.filter(p => p.id !== id)
    setPlans(updated)
    if (activePlan?.id === id) {
      if (updated.length) loadPlan(updated[0])
      else { setActivePlan(null); setWaypoints([]) }
    }
  }

  const handleMapClick = useCallback((latlng) => {
    if (!activePlan || !user) return
    setPendingLatLng(latlng)
    setSearchResults([])
    if (isMobile) setMobileView('plan')
  }, [activePlan, user, isMobile])

  const handleAddWaypoint = async () => {
    if (!pendingLatLng || !wpName.trim()) return
    setAdding(true)
    try {
      const res = await addWaypoint(activePlan.id, {
        day_number:    activeDay,
        name:          wpName.trim(),
        latitude:      pendingLatLng.lat.toFixed(6),
        longitude:     pendingLatLng.lng.toFixed(6),
        altitude_m:    wpAlt ? parseInt(wpAlt) : null,
        waypoint_type: wpType,
      })
      setWaypoints(prev => [...prev, res.data])
      cancelAddForm()
    } finally {
      setAdding(false)
    }
  }

  const handleDeleteWaypoint = async (id) => {
    await deleteWaypoint(id)
    setWaypoints(prev => prev.filter(w => w.id !== id))
  }

  const handlePrefetch = async () => {
    if (!waypoints.length || prefetch.running) return
    setPrefetch({ running: true, done: 0, total: 0 })
    await prefetchTiles(waypoints, (done, total) => setPrefetch({ running: true, done, total }))
    setPrefetch(p => ({ ...p, running: false }))
  }

  const center = waypoints.length ? [Number(waypoints[0].latitude), Number(waypoints[0].longitude)] : [28.2, 84.5]

  const addFormPanel = showAddForm && activePlan && (
    <div style={{ padding: '14px 16px', borderBottom: '1px solid #F0EDE8', flexShrink: 0, backgroundColor: '#F9F7F3' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <div style={{ width: 10, height: 10, borderRadius: '50%', backgroundColor: dayColor(activeDay) }} />
          <p style={{ fontSize: 12, fontWeight: 700, color: '#555', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
            Add stop — Day {activeDay}
          </p>
        </div>
        <button onClick={cancelAddForm} style={{ background: 'none', border: 'none', color: '#BBB', cursor: 'pointer', fontSize: 18, lineHeight: 1, padding: 0 }}>×</button>
      </div>

      {/* Search / name input */}
      <div style={{ position: 'relative', marginBottom: 8 }}>
        <input
          autoFocus
          placeholder="Search location (e.g. Namche Bazaar)"
          value={wpName}
          onChange={e => { setWpName(e.target.value); if (pendingLatLng) setPendingLatLng(null) }}
          onKeyDown={e => { if (e.key === 'Enter' && pendingLatLng) handleAddWaypoint(); if (e.key === 'Escape') { setSearchResults([]); cancelAddForm() } }}
          style={{ width: '100%', padding: '9px 34px 9px 12px', border: `1.5px solid ${pendingLatLng ? dayColor(activeDay) : '#DDD'}`, borderRadius: 8, fontSize: 13, boxSizing: 'border-box', outline: 'none', transition: 'border-color 0.15s' }}
        />
        <span style={{ position: 'absolute', right: 10, top: '50%', transform: 'translateY(-50%)', fontSize: 11, color: '#AAA' }}>
          {searching ? '…' : '🔍'}
        </span>

        {/* Autocomplete dropdown */}
        {searchResults.length > 0 && (
          <div style={{ position: 'absolute', top: 'calc(100% + 4px)', left: 0, right: 0, backgroundColor: '#FFF', border: '1px solid #E0DDD8', borderRadius: 10, boxShadow: '0 6px 20px rgba(0,0,0,0.12)', zIndex: 200, overflow: 'hidden' }}>
            {searchResults.map((r, i) => {
              const parts = r.display_name.split(',')
              const name  = parts[0].trim()
              const sub   = parts.slice(1, 3).join(',').trim()
              return (
                <button
                  key={i}
                  onMouseDown={e => { e.preventDefault(); selectSearchResult(r) }}
                  style={{
                    display: 'block', width: '100%', textAlign: 'left', padding: '10px 14px',
                    border: 'none', borderBottom: i < searchResults.length - 1 ? '1px solid #F5F3F0' : 'none',
                    backgroundColor: 'transparent', cursor: 'pointer', transition: 'background 0.1s',
                  }}
                  onMouseEnter={e => e.currentTarget.style.backgroundColor = '#F9F7F3'}
                  onMouseLeave={e => e.currentTarget.style.backgroundColor = 'transparent'}
                >
                  <p style={{ fontSize: 13, fontWeight: 600, color: '#1A3A2A', marginBottom: 1 }}>{name}</p>
                  {sub && <p style={{ fontSize: 11, color: '#999' }}>{sub}</p>}
                </button>
              )
            })}
          </div>
        )}
      </div>

      {/* Coords status */}
      {!pendingLatLng ? (
        <p style={{ fontSize: 12, color: '#BBB', textAlign: 'center', margin: '6px 0 10px', userSelect: 'none' }}>
          — or tap the map to drop a pin —
        </p>
      ) : (
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 10, padding: '7px 10px', backgroundColor: '#EDF7ED', borderRadius: 8, border: `1px solid ${dayColor(activeDay)}33` }}>
          <span style={{ fontSize: 13 }}>📍</span>
          <p style={{ fontSize: 12, color: '#1A3A2A', fontWeight: 600, flex: 1 }}>
            {Number(pendingLatLng.lat).toFixed(4)}, {Number(pendingLatLng.lng).toFixed(4)}
          </p>
          <button
            onClick={() => { setPendingLatLng(null); setWpName('') }}
            style={{ background: 'none', border: 'none', color: '#BBB', cursor: 'pointer', fontSize: 14, padding: 0, lineHeight: 1 }}
            title="Clear pin"
          >×</button>
        </div>
      )}

      {/* Type + altitude row */}
      <div style={{ display: 'flex', gap: 8, marginBottom: 10 }}>
        <select
          value={wpType}
          onChange={e => setWpType(e.target.value)}
          style={{ flex: 1, padding: '8px 10px', border: '1px solid #DDD', borderRadius: 8, fontSize: 13, backgroundColor: '#FFF' }}
        >
          {WAYPOINT_TYPES.map(t => <option key={t} value={t}>{t.charAt(0).toUpperCase() + t.slice(1)}</option>)}
        </select>
        <input
          placeholder="Alt (m)"
          value={wpAlt}
          onChange={e => setWpAlt(e.target.value)}
          type="number"
          style={{ width: 80, padding: '8px 10px', border: '1px solid #DDD', borderRadius: 8, fontSize: 13 }}
        />
      </div>

      {/* Action buttons */}
      <div style={{ display: 'flex', gap: 8 }}>
        <button
          onClick={handleAddWaypoint}
          disabled={adding || !wpName.trim() || !pendingLatLng}
          style={{
            flex: 1, padding: '10px', border: 'none', borderRadius: 8, fontSize: 13, fontWeight: 600, cursor: (!wpName.trim() || !pendingLatLng) ? 'default' : 'pointer',
            backgroundColor: (!wpName.trim() || !pendingLatLng) ? '#E0DDD8' : dayColor(activeDay),
            color: (!wpName.trim() || !pendingLatLng) ? '#AAA' : '#FFF',
            transition: 'background-color 0.15s',
          }}
        >
          {adding ? 'Adding…' : 'Add stop'}
        </button>
        <button
          onClick={cancelAddForm}
          style={{ padding: '10px 14px', backgroundColor: '#ECEAE6', border: 'none', borderRadius: 8, fontSize: 13, cursor: 'pointer', color: '#666' }}
        >
          Cancel
        </button>
      </div>

      {!pendingLatLng && isMobile && (
        <button
          onClick={() => setMobileView('map')}
          style={{ marginTop: 10, width: '100%', padding: '9px', backgroundColor: '#1A3A2A', color: '#FFF', border: 'none', borderRadius: 8, fontSize: 13, fontWeight: 600, cursor: 'pointer' }}
        >
          Open map to place pin
        </button>
      )}
    </div>
  )

  const sidebar = (
    <div style={{
      width: isMobile ? '100%' : '320px',
      flexShrink: 0,
      display: 'flex',
      flexDirection: 'column',
      height: isMobile ? 'auto' : 'calc(100vh - 137px)',
      backgroundColor: '#FFFFFF',
      borderRight: isMobile ? 'none' : '1px solid #E8E5E0',
      overflow: 'hidden',
    }}>
      {/* Plans header */}
      <div style={{ padding: '16px', borderBottom: '1px solid #F0EDE8', flexShrink: 0 }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 }}>
          <p style={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em', color: '#BBB' }}>Your plans</p>
          <button onClick={() => setShowNewPlan(v => !v)} style={{ padding: '4px 12px', backgroundColor: '#1A3A2A', color: '#FFF', border: 'none', borderRadius: 6, fontSize: 12, fontWeight: 600, cursor: 'pointer' }}>
            + New
          </button>
        </div>

        {showNewPlan && (
          <div style={{ marginBottom: 10, padding: 12, backgroundColor: '#F7F5F0', borderRadius: 10 }}>
            <input
              autoFocus
              placeholder="Plan name (e.g. EBC Trek 2026)"
              value={newPlanName}
              onChange={e => setNewPlanName(e.target.value)}
              onKeyDown={e => { if (e.key === 'Enter') handleCreatePlan() }}
              style={{ width: '100%', padding: '8px 10px', border: '1px solid #DDD', borderRadius: 8, fontSize: 13, marginBottom: 8, boxSizing: 'border-box' }}
            />
            <select value={newPlanTrail} onChange={e => setNewPlanTrail(e.target.value)}
              style={{ width: '100%', padding: '8px 10px', border: '1px solid #DDD', borderRadius: 8, fontSize: 13, marginBottom: 8, boxSizing: 'border-box' }}>
              <option value="">No trail (custom route)</option>
              {trails.map(t => <option key={t.slug} value={t.slug}>{t.name}</option>)}
            </select>
            <div style={{ display: 'flex', gap: 8 }}>
              <button onClick={handleCreatePlan} disabled={creatingPlan || !newPlanName.trim()}
                style={{ flex: 1, padding: '8px', backgroundColor: '#C4973A', color: '#FFF', border: 'none', borderRadius: 8, fontSize: 13, fontWeight: 600, cursor: 'pointer' }}>
                {creatingPlan ? 'Creating…' : 'Create plan'}
              </button>
              <button onClick={() => setShowNewPlan(false)}
                style={{ padding: '8px 12px', backgroundColor: '#EEE', border: 'none', borderRadius: 8, fontSize: 13, cursor: 'pointer' }}>
                Cancel
              </button>
            </div>
          </div>
        )}

        <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
          {loading ? (
            <p style={{ fontSize: 13, color: '#CCC' }}>Loading…</p>
          ) : plans.length === 0 ? (
            <p style={{ fontSize: 13, color: '#BBB', fontStyle: 'italic' }}>No plans yet — create one above</p>
          ) : plans.map(p => (
            <div key={p.id} onClick={() => loadPlan(p)} style={{
              display: 'flex', alignItems: 'center', justifyContent: 'space-between',
              padding: '8px 10px', borderRadius: 8, cursor: 'pointer',
              backgroundColor: activePlan?.id === p.id ? '#F0F7F0' : 'transparent',
              border: activePlan?.id === p.id ? '1px solid #C8E6C9' : '1px solid transparent',
            }}>
              <div style={{ minWidth: 0 }}>
                <p style={{ fontSize: 13, fontWeight: 600, color: '#1A3A2A', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{p.name}</p>
                {p.trail_name && <p style={{ fontSize: 11, color: '#999' }}>{p.trail_name} · {(p.waypoints || []).length} stops</p>}
              </div>
              <button onClick={e => handleDeletePlan(e, p.id)}
                style={{ background: 'none', border: 'none', color: '#CCC', cursor: 'pointer', fontSize: 18, lineHeight: 1, flexShrink: 0, padding: '0 4px' }}>
                ×
              </button>
            </div>
          ))}
        </div>
      </div>

      {activePlan && (
        <>
          {/* Day selector */}
          <div style={{ padding: '12px 16px', borderBottom: '1px solid #F0EDE8', flexShrink: 0 }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
              <p style={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em', color: '#BBB' }}>Days</p>
              <button onClick={() => setNumDays(n => n + 1)}
                style={{ padding: '3px 8px', backgroundColor: '#F7F5F0', border: '1px solid #E0DDD8', borderRadius: 6, fontSize: 12, cursor: 'pointer', color: '#666' }}>
                + Day
              </button>
            </div>
            <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
              {allDays.map(d => (
                <button key={d} onClick={() => { setActiveDay(d); if (showAddForm) { cancelAddForm(); } }} style={{
                  padding: '5px 10px', borderRadius: 20, fontSize: 12, fontWeight: 600, cursor: 'pointer', border: 'none',
                  backgroundColor: activeDay === d ? dayColor(d) : '#F0EDE8',
                  color: activeDay === d ? '#FFF' : '#666',
                }}>
                  D{d}{byDay[d]?.length ? ` (${byDay[d].length})` : ''}
                </button>
              ))}
            </div>
          </div>

          {/* Day stats strip */}
          {activeDayStats && (
            <div style={{ padding: '8px 16px', borderBottom: '1px solid #F0EDE8', flexShrink: 0, backgroundColor: '#FAFAF8' }}>
              <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
                <span style={{ fontSize: 12, color: '#555' }}>
                  <span style={{ fontWeight: 700, color: '#1A3A2A' }}>{activeDayStats.km} km</span>
                  <span style={{ color: '#AAA' }}> est.</span>
                </span>
                <span style={{ fontSize: 12, color: '#555' }}>
                  <span style={{ fontWeight: 700, color: '#1A3A2A' }}>{formatHrs(activeDayStats.hrs)}</span>
                  <span style={{ color: '#AAA' }}> hiking</span>
                </span>
                {activeDayStats.gainM > 0 && (
                  <span style={{ fontSize: 12, color: '#43A047', fontWeight: 600 }}>↑ {activeDayStats.gainM.toLocaleString()}m</span>
                )}
                {activeDayStats.lossM > 0 && (
                  <span style={{ fontSize: 12, color: '#E53935', fontWeight: 600 }}>↓ {activeDayStats.lossM.toLocaleString()}m</span>
                )}
              </div>
            </div>
          )}

          {/* Add form (inline in sidebar) */}
          {addFormPanel}

          {/* Waypoints list */}
          <div style={{ flex: 1, padding: '12px 16px', overflowY: 'auto' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
              <p style={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em', color: '#BBB' }}>
                Day {activeDay} stops
              </p>
              {!showAddForm && (
                <button onClick={openAddForm} style={{
                  padding: '4px 10px', backgroundColor: dayColor(activeDay), color: '#FFF',
                  border: 'none', borderRadius: 6, fontSize: 12, fontWeight: 600, cursor: 'pointer',
                }}>
                  + Add stop
                </button>
              )}
            </div>

            {!(byDay[activeDay] || []).length ? (
              <p style={{ fontSize: 13, color: '#CCC', fontStyle: 'italic', lineHeight: 1.6 }}>
                {showAddForm ? 'Search a location above or tap the map to place a pin.' : `Click "+ Add stop" to add Day ${activeDay}'s stops.`}
              </p>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                {(byDay[activeDay] || []).map(w => (
                  <div key={w.id} style={{
                    display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between',
                    padding: '10px 12px', backgroundColor: '#F7F5F0', borderRadius: 10,
                    borderLeft: `3px solid ${dayColor(w.day_number)}`,
                  }}>
                    <div style={{ minWidth: 0 }}>
                      <p style={{ fontSize: 13, fontWeight: 600, color: '#1A3A2A' }}>{w.name}</p>
                      <p style={{ fontSize: 11, color: '#999' }}>
                        {w.waypoint_type}{w.altitude_m ? ` · ${Number(w.altitude_m).toLocaleString()}m` : ''}
                      </p>
                    </div>
                    <button onClick={() => handleDeleteWaypoint(w.id)}
                      style={{ background: 'none', border: 'none', color: '#DDD', cursor: 'pointer', fontSize: 18, lineHeight: 1, flexShrink: 0, padding: '0 4px' }}>
                      ×
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Download actions */}
          <div style={{ padding: '12px 16px', borderTop: '1px solid #F0EDE8', flexShrink: 0 }}>
            {planTotals && (
              <div style={{ marginBottom: 12, padding: '10px 12px', backgroundColor: '#F0F7F0', borderRadius: 10, border: '1px solid #C8E6C9' }}>
                <p style={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', color: '#1A3A2A', marginBottom: 6 }}>
                  Total trek
                </p>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px 16px' }}>
                  <span style={{ fontSize: 13, color: '#1A3A2A' }}><strong>{allDays.length}</strong> days</span>
                  <span style={{ fontSize: 13, color: '#1A3A2A' }}><strong>{planTotals.km} km</strong> <span style={{ color: '#999', fontSize: 11 }}>est.</span></span>
                  <span style={{ fontSize: 13, color: '#1A3A2A' }}><strong>{formatHrs(planTotals.hrs)}</strong> <span style={{ color: '#999', fontSize: 11 }}>total hiking</span></span>
                  {planTotals.gainM > 0 && <span style={{ fontSize: 13, color: '#43A047' }}><strong>↑ {planTotals.gainM.toLocaleString()}m</strong></span>}
                  {planTotals.lossM > 0 && <span style={{ fontSize: 13, color: '#E53935' }}><strong>↓ {planTotals.lossM.toLocaleString()}m</strong></span>}
                </div>
              </div>
            )}
            <div style={{ display: 'flex', gap: 8, marginBottom: prefetch.running ? 8 : 0 }}>
              <button onClick={() => downloadGPX(activePlan.name, waypoints)} disabled={!waypoints.length}
                style={{
                  flex: 1, padding: '10px', border: 'none', borderRadius: 10, fontSize: 13, fontWeight: 600, cursor: waypoints.length ? 'pointer' : 'default',
                  backgroundColor: waypoints.length ? '#1A3A2A' : '#EEE',
                  color: waypoints.length ? '#FFF' : '#BBB',
                }}>
                ↓ GPX file
              </button>
              <button onClick={handlePrefetch} disabled={!waypoints.length || prefetch.running}
                style={{
                  flex: 1, padding: '10px', border: 'none', borderRadius: 10, fontSize: 13, fontWeight: 600, cursor: 'pointer',
                  backgroundColor: waypoints.length && !prefetch.running ? '#C4973A' : '#EEE',
                  color: waypoints.length && !prefetch.running ? '#FFF' : '#BBB',
                }}>
                {prefetch.running ? `${Math.round(prefetch.done / prefetch.total * 100)}%` : '⬇ Offline tiles'}
              </button>
            </div>
            {prefetch.running && (
              <div style={{ height: 4, backgroundColor: '#EEE', borderRadius: 4, overflow: 'hidden' }}>
                <div style={{ height: '100%', backgroundColor: '#C4973A', width: `${Math.round(prefetch.done / prefetch.total * 100)}%`, transition: 'width 0.15s' }} />
              </div>
            )}
            {!prefetch.running && prefetch.total > 0 && (
              <p style={{ fontSize: 11, color: '#43A047', marginTop: 6, textAlign: 'center' }}>
                ✓ {prefetch.total} tiles saved for offline use
              </p>
            )}
            <p style={{ fontSize: 11, color: '#BBB', marginTop: 8, lineHeight: 1.5 }}>
              GPX opens in OsmAnd, Gaia GPS, Maps.me, Garmin
            </p>
          </div>
        </>
      )}
    </div>
  )

  const mapSection = (
    <div style={{ flex: 1, position: 'relative', minHeight: 0 }}>
      {/* Add mode banner */}
      {addMode && (
        <div style={{
          position: 'absolute', top: 14, left: '50%', transform: 'translateX(-50%)',
          zIndex: 1000, backgroundColor: '#1A3A2A', color: '#FFF',
          padding: '10px 20px', borderRadius: 24, fontSize: 13, fontWeight: 600,
          boxShadow: '0 4px 16px rgba(0,0,0,0.2)', whiteSpace: 'nowrap',
          display: 'flex', alignItems: 'center', gap: 12,
        }}>
          <span>
            {pendingLatLng ? `Day ${activeDay} pin placed` : `Tap map to drop Day ${activeDay} pin`}
          </span>
          {isMobile && (
            <button onClick={() => setMobileView('plan')} style={{
              background: 'rgba(255,255,255,0.15)', border: 'none', color: '#FFF', cursor: 'pointer',
              fontSize: 12, fontWeight: 700, padding: '3px 10px', borderRadius: 12,
            }}>
              Back to form
            </button>
          )}
          <button onClick={cancelAddForm} style={{
            background: 'none', border: 'none', color: '#C4973A', cursor: 'pointer', fontSize: 13, fontWeight: 700, padding: 0,
          }}>
            Cancel
          </button>
        </div>
      )}

      {!user && (
        <div style={{ height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column', gap: 16 }}>
          <p style={{ fontSize: 16, color: '#999' }}>Sign in to plan your itinerary</p>
          <Link to="/login" style={{ padding: '12px 24px', backgroundColor: '#1A3A2A', color: '#FFF', borderRadius: 10, textDecoration: 'none', fontSize: 14, fontWeight: 600 }}>
            Sign in
          </Link>
        </div>
      )}

      {user && (
        <MapContainer
          center={center}
          zoom={7}
          style={{
            height: isMobile ? 'calc(100vh - 200px)' : 'calc(100vh - 137px)',
            width: '100%',
            cursor: addMode ? 'crosshair' : undefined,
          }}
        >
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
          <MapEvents addMode={addMode} onMapClick={handleMapClick} />
          <FitToWaypoints waypoints={waypoints} planId={activePlan?.id} />
          <FlyToTarget target={flyToTarget} />

          {polylines.map(({ day, color, positions }) => (
            <Polyline key={day} positions={positions} color={color} weight={3} opacity={0.85} />
          ))}

          {waypoints.map(w => (
            <Marker key={w.id} position={[Number(w.latitude), Number(w.longitude)]} icon={waypointIcon(w.day_number)}>
              <Popup>
                <div style={{ fontFamily: 'DM Sans, sans-serif', minWidth: 160 }}>
                  <p style={{ fontSize: 11, color: dayColor(w.day_number), fontWeight: 700, marginBottom: 2 }}>
                    Day {w.day_number} · {w.waypoint_type}
                  </p>
                  <p style={{ fontSize: 15, fontWeight: 700, color: '#1A3A2A', marginBottom: 4 }}>{w.name}</p>
                  {w.altitude_m && <p style={{ fontSize: 12, color: '#888', marginBottom: 6 }}>{Number(w.altitude_m).toLocaleString()}m</p>}
                  <button onClick={() => handleDeleteWaypoint(w.id)} style={{
                    padding: '5px 10px', backgroundColor: '#FFF0F0', border: '1px solid #FFCDD2',
                    borderRadius: 6, fontSize: 12, color: '#C62828', cursor: 'pointer',
                  }}>
                    Remove stop
                  </button>
                </div>
              </Popup>
            </Marker>
          ))}

          {pendingLatLng && (
            <Marker position={[pendingLatLng.lat, pendingLatLng.lng]} icon={waypointIcon(activeDay, true)} />
          )}
        </MapContainer>
      )}
    </div>
  )

  return (
    <div style={{ backgroundColor: '#F7F5F0', minHeight: '100vh', fontFamily: 'DM Sans, sans-serif', display: 'flex', flexDirection: 'column' }}>
      <Navbar>
        <Link to="/map" style={{ fontSize: '12px', letterSpacing: '0.12em', textTransform: 'uppercase', color: 'rgba(255,255,255,0.7)', textDecoration: 'none' }}>
          Map
        </Link>
        <Link to="/itinerary" style={{ fontSize: '12px', letterSpacing: '0.12em', textTransform: 'uppercase', color: '#C4973A', textDecoration: 'none' }}>
          Route planner
        </Link>
      </Navbar>

      {/* Page header */}
      <div style={{ backgroundColor: '#FFFFFF', borderBottom: '1px solid #E8E5E0', padding: isMobile ? '14px 16px' : '18px 32px', flexShrink: 0 }}>
        <div style={{ maxWidth: 1400, margin: '0 auto', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 16 }}>
          <div>
            <h1 style={{ fontFamily: 'Fraunces, serif', fontSize: isMobile ? 22 : 28, fontWeight: 700, color: '#1A3A2A', marginBottom: 2 }}>
              Route Planner
            </h1>
            <p style={{ fontSize: 13, color: '#999' }}>Build your day-by-day itinerary · download GPX · save tiles offline</p>
          </div>
          {isMobile && (
            <div style={{ display: 'flex', gap: 6, flexShrink: 0 }}>
              {['map','plan'].map(v => (
                <button key={v} onClick={() => setMobileView(v)} style={{
                  padding: '7px 14px', backgroundColor: mobileView === v ? '#1A3A2A' : '#F0F0F0',
                  color: mobileView === v ? '#FFF' : '#666', border: 'none', borderRadius: 8,
                  fontSize: 13, fontWeight: 600, cursor: 'pointer', textTransform: 'capitalize',
                }}>
                  {v}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      <div style={{ flex: 1, display: 'flex', minHeight: 0, overflow: 'hidden' }}>
        {(!isMobile || mobileView === 'plan') && sidebar}
        {(!isMobile || mobileView === 'map')  && mapSection}
      </div>
    </div>
  )
}

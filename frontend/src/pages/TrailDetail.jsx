import { useEffect, useState, useMemo, useRef } from 'react'
import { useParams, Link, useNavigate } from 'react-router-dom'
import { getTrail, getSavedTrails, saveTrail, unsaveTrail } from '../services/api'
import { useAuth } from '../contexts/AuthContext'
import Navbar from '../components/Navbar'
import useMobile from '../hooks/useMobile'

const SECTIONS = [
  { id: 'overview',   label: 'Overview' },
  { id: 'itinerary',  label: 'Itinerary' },
  { id: 'permits',    label: 'Permits' },
  { id: 'teahouses',  label: 'Teahouses' },
]

const PERMIT_TYPE_LABEL = {
  tims:          'TIMS Card',
  national_park: 'National Park',
  conservation:  'Conservation',
  restricted:    'Restricted Area',
  municipal:     'Municipality',
}

const NAVBAR_H  = 63
const SECNAV_H  = 52

const HERO_STARS = Array.from({ length: 40 }, (_, i) => ({
  size:     ((i * 7  + 3) % 18) / 10 + 1,
  top:      ((i * 13 + 7) % 44) + 1,
  left:     ((i * 17 + 5) % 99) + 0.5,
  opacity:  ((i * 11 + 3) % 55) / 100 + 0.2,
  duration: ((i * 3  + 2) % 28) / 10 + 2,
}))

function buildElevPath(itinerary) {
  const days = itinerary.filter(d => d.altitude_m > 0)
  if (days.length < 2) return null
  const W = 600, H = 90, pad = 14
  const alts = days.map(d => d.altitude_m)
  const lo = Math.min(...alts), hi = Math.max(...alts)
  const span = hi - lo || 1
  const pts = days.map((d, i) => [
    (i / (days.length - 1)) * W,
    pad + (1 - (d.altitude_m - lo) / span) * (H - pad * 2),
  ])
  let line = `M${pts[0][0].toFixed(1)},${pts[0][1].toFixed(1)}`
  for (let i = 1; i < pts.length; i++) {
    const [px, py] = pts[i - 1], [cx, cy] = pts[i]
    const mid = ((px + cx) / 2).toFixed(1)
    line += ` C${mid},${py.toFixed(1)} ${mid},${cy.toFixed(1)} ${cx.toFixed(1)},${cy.toFixed(1)}`
  }
  return {
    line, area: `${line} L${W},${H} L0,${H} Z`,
    pts, W, H,
    peakIdx: alts.indexOf(hi),
    peakAlt: hi,
    days,
  }
}

export default function TrailDetail() {
  const { slug }                  = useParams()
  const { user }                  = useAuth()
  const navigate                  = useNavigate()
  const [trail, setTrail]         = useState(null)
  const [loading, setLoading]     = useState(true)
  const [error, setError]         = useState(null)
  const [active, setActive]       = useState('overview')
  const [saved, setSaved]         = useState(false)
  const [savePending, setSavePending] = useState(false)
  const [hoveredDot, setHoveredDot]   = useState(null)
  const isMobile                      = useMobile()
  const scrolling                     = useRef(false)

  useEffect(() => {
    getTrail(slug)
      .then(res => setTrail(res.data))
      .catch(() => setError('Trail not found.'))
      .finally(() => setLoading(false))
  }, [slug])

  useEffect(() => {
    if (!user) return
    getSavedTrails().then(res => {
      setSaved(res.data.some(s => s.trail.slug === slug))
    })
  }, [user, slug])

  const handleSave = async () => {
    if (!user) { navigate('/login', { state: { from: `/trails/${slug}` } }); return }
    setSavePending(true)
    try {
      if (saved) { await unsaveTrail(slug); setSaved(false) }
      else        { await saveTrail(slug);   setSaved(true) }
    } finally {
      setSavePending(false)
    }
  }

  useEffect(() => {
    if (!trail) return
    const observers = []
    SECTIONS.forEach(({ id }) => {
      const el = document.getElementById(id)
      if (!el) return
      const obs = new IntersectionObserver(
        ([entry]) => { if (entry.isIntersecting && !scrolling.current) setActive(id) },
        { rootMargin: '-15% 0px -75% 0px' },
      )
      obs.observe(el)
      observers.push(obs)
    })
    return () => observers.forEach(o => o.disconnect())
  }, [trail])

  const scrollTo = id => {
    setActive(id)
    const el = document.getElementById(id)
    if (!el) return
    const target = el.getBoundingClientRect().top + window.scrollY - NAVBAR_H - SECNAV_H - 24
    const start  = window.scrollY
    const dist   = target - start
    const dur    = 900
    const t0     = performance.now()
    const ease   = t => t < 0.5 ? 4*t*t*t : 1 - Math.pow(-2*t+2, 3)/2
    scrolling.current = true
    document.documentElement.style.scrollBehavior = 'auto'
    const step = now => {
      const p = Math.min((now - t0) / dur, 1)
      window.scrollTo(0, start + dist * ease(p))
      if (p < 1) {
        requestAnimationFrame(step)
      } else {
        document.documentElement.style.scrollBehavior = ''
        scrolling.current = false
      }
    }
    requestAnimationFrame(step)
  }

  const elev = useMemo(() => trail ? buildElevPath(trail.itinerary) : null, [trail])

  if (loading) return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: '#F7F5F0' }}>
      <p style={{ color: '#AAA', fontFamily: 'DM Sans, sans-serif' }}>Loading trail...</p>
    </div>
  )
  if (error) return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: '#F7F5F0' }}>
      <p style={{ color: '#E24B4A', fontFamily: 'DM Sans, sans-serif' }}>{error}</p>
    </div>
  )

  const highlights = trail.highlights.split('\n').filter(h => h.trim())
  const altitudes  = trail.itinerary.map(d => d.altitude_m).filter(a => a > 0)
  const maxAlt     = altitudes.length > 0 ? Math.max(...altitudes) : 0

  const dotIdx   = trail.description.indexOf('.')
  const pullQuote = dotIdx > 0 ? trail.description.slice(0, dotIdx + 1) : ''
  const bodyText  = dotIdx > 0 ? trail.description.slice(dotIdx + 1).trim() : trail.description

  return (
    <div style={{ backgroundColor: '#F7F5F0', minHeight: '100vh', fontFamily: 'DM Sans, sans-serif' }}>

      <Navbar transparent>
        <Link to="/trails" style={{
          fontSize: '12px', letterSpacing: '0.12em', textTransform: 'uppercase',
          color: 'rgba(255,255,255,0.7)', textDecoration: 'none',
        }}>
          ← All Trails
        </Link>
      </Navbar>

      {/* ── HERO ────────────────────────────────────────────── */}
      <div style={{ position: 'relative', height: '100vh', minHeight: '680px', overflow: 'hidden' }}>

        <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(180deg, #080F1A 0%, #0D1F2D 22%, #122A1E 55%, #1A3A2A 80%, #2D5A3D 100%)' }} />

        {HERO_STARS.map((s, i) => (
          <div key={i} style={{
            position: 'absolute', borderRadius: '50%',
            width: s.size + 'px', height: s.size + 'px',
            backgroundColor: `rgba(255,255,255,${s.opacity})`,
            top: s.top + '%', left: s.left + '%',
            animation: `twinkle ${s.duration}s ease-in-out infinite alternate`,
          }} />
        ))}

        <svg aria-hidden="true" style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', opacity: 0.04, pointerEvents: 'none' }}>
          <filter id="tdGrain">
            <feTurbulence type="fractalNoise" baseFrequency="0.75" numOctaves="4" stitchTiles="stitch" />
            <feColorMatrix type="saturate" values="0" />
          </filter>
          <rect width="100%" height="100%" filter="url(#tdGrain)" />
        </svg>

        {/* Mountain silhouette */}
        <svg viewBox="0 0 1440 600" preserveAspectRatio="xMidYMax meet"
          style={{ position: 'absolute', bottom: 0, left: 0, right: 0, width: '100%' }}>
          <path d="M0,380 L80,260 L160,310 L240,200 L320,280 L400,180 L480,240 L560,160 L640,220 L720,140 L800,200 L880,150 L960,210 L1040,170 L1120,230 L1200,190 L1280,250 L1360,200 L1440,270 L1440,600 L0,600 Z" fill="rgba(26,58,42,0.35)" />
          <path d="M0,440 L100,320 L180,370 L260,280 L360,340 L440,250 L520,310 L600,230 L680,290 L760,200 L840,270 L920,220 L1000,300 L1080,240 L1160,310 L1240,260 L1320,330 L1440,300 L1440,600 L0,600 Z" fill="rgba(14,38,26,0.65)" />
          <path d="M756,204 L776,178 L796,185 L816,170 L836,182 L818,190 L796,181 L776,193 Z" fill="rgba(255,255,255,0.65)" />
          <path d="M438,253 L454,234 L462,240 L470,229 L486,241 L470,247 L462,238 L450,248 Z" fill="rgba(255,255,255,0.4)" />
          <ellipse cx="796" cy="186" rx="44" ry="26" fill="rgba(196,151,58,0.1)" />
          <path d="M0,520 L120,400 L200,450 L300,370 L400,430 L500,360 L580,410 L660,350 L740,390 L820,340 L900,390 L980,350 L1060,410 L1140,360 L1220,420 L1320,380 L1440,440 L1440,600 L0,600 Z" fill="#0A2010" />
          <path d="M0,560 L200,480 L400,510 L600,470 L800,500 L1000,475 L1200,505 L1440,480 L1440,600 L0,600 Z" fill="#071A0F" />
          {[30,65,100,140].map((x, i) => (
            <g key={`tl${i}`}>
              <polygon points={`${x},562 ${x-11},590 ${x+11},590`} fill="#04120A" />
              <polygon points={`${x},549 ${x-8},566 ${x+8},566`} fill="#04120A" />
              <polygon points={`${x},539 ${x-5},552 ${x+5},552`} fill="#04120A" />
            </g>
          ))}
          {[1300,1340,1375,1410].map((x, i) => (
            <g key={`tr${i}`}>
              <polygon points={`${x},562 ${x-11},590 ${x+11},590`} fill="#04120A" />
              <polygon points={`${x},549 ${x-8},566 ${x+8},566`} fill="#04120A" />
              <polygon points={`${x},539 ${x-5},552 ${x+5},552`} fill="#04120A" />
            </g>
          ))}
        </svg>

        {/* Content overlay */}
        <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: isMobile ? 'column' : undefined, alignItems: isMobile ? 'flex-start' : 'center', justifyContent: isMobile ? 'center' : undefined, padding: isMobile ? '0 20px' : '0 64px', paddingTop: isMobile ? '90px' : '80px', gap: isMobile ? '24px' : '48px', overflowY: isMobile ? 'auto' : undefined }}>

          {/* Left */}
          <div style={{ flex: isMobile ? 'none' : '0 1 580px', width: isMobile ? '100%' : undefined }}>
            <div style={{ display: 'flex', gap: '8px', marginBottom: '24px', flexWrap: 'wrap', animation: 'fadeUp 0.8s ease forwards' }}>
              <span style={{ fontSize: '12px', padding: '4px 14px', borderRadius: '20px', backgroundColor: 'rgba(196,151,58,0.2)', color: '#C4973A' }}>
                {trail.region}
              </span>
              <span style={{ fontSize: '12px', padding: '4px 14px', borderRadius: '20px', backgroundColor: 'rgba(255,255,255,0.1)', color: 'rgba(255,255,255,0.7)', textTransform: 'capitalize' }}>
                {trail.difficulty}
              </span>
              {trail.guide_required && (
                <span style={{ fontSize: '12px', padding: '4px 14px', borderRadius: '20px', backgroundColor: 'rgba(255,200,100,0.15)', color: '#F5C842' }}>
                  Guide Required
                </span>
              )}
            </div>
            <h1 style={{
              fontFamily: 'Fraunces, serif',
              fontSize: 'clamp(44px, 5.5vw, 76px)',
              fontWeight: 700, color: '#FFFFFF', lineHeight: 1.02,
              marginBottom: '20px',
              animation: 'fadeUp 0.8s ease 0.1s both',
            }}>
              {trail.name}
            </h1>
            <p style={{ color: 'rgba(255,255,255,0.4)', fontSize: '15px', animation: 'fadeUp 0.8s ease 0.2s both', marginBottom: '28px' }}>
              {trail.start_point} → {trail.end_point}
            </p>
            <div style={{ display: 'flex', gap: '12px', animation: 'fadeUp 0.8s ease 0.3s both' }}>
              <button
                onClick={handleSave}
                disabled={savePending}
                style={{
                  display: 'flex', alignItems: 'center', gap: '8px',
                  padding: '12px 22px', borderRadius: '24px', border: 'none', cursor: savePending ? 'not-allowed' : 'pointer',
                  backgroundColor: saved ? '#C4973A' : 'rgba(255,255,255,0.12)',
                  color: '#FFFFFF', fontSize: '13px', fontWeight: 600,
                  fontFamily: 'DM Sans, sans-serif', backdropFilter: 'blur(8px)',
                  transition: 'background-color 0.2s',
                }}
              >
                <svg width="15" height="15" viewBox="0 0 24 24" fill={saved ? '#FFFFFF' : 'none'} stroke="#FFFFFF" strokeWidth="2.2">
                  <path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z"/>
                </svg>
                {saved ? 'Saved' : 'Save trail'}
              </button>
              <Link
                to="/dashboard"
                style={{
                  display: 'flex', alignItems: 'center', gap: '8px',
                  padding: '12px 22px', borderRadius: '24px',
                  backgroundColor: 'rgba(255,255,255,0.08)', color: 'rgba(255,255,255,0.7)',
                  fontSize: '13px', fontWeight: 500, fontFamily: 'DM Sans, sans-serif',
                  textDecoration: 'none', backdropFilter: 'blur(8px)',
                }}
              >
                My trips →
              </Link>
            </div>
          </div>

          {/* Right — frosted glass at-a-glance, hidden on mobile */}
          {!isMobile && <div style={{
            marginLeft: 'auto', flexShrink: 0,
            backgroundColor: 'rgba(255,255,255,0.07)',
            backdropFilter: 'blur(20px)',
            border: '1px solid rgba(255,255,255,0.1)',
            borderRadius: '24px',
            padding: '36px 40px',
            animation: 'fadeUp 0.8s ease 0.3s both',
          }}>
            <p style={{ fontSize: '10px', letterSpacing: '0.2em', textTransform: 'uppercase', color: 'rgba(255,255,255,0.3)', marginBottom: '24px' }}>
              At a glance
            </p>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '28px 44px' }}>
              {[
                { val: trail.duration_days,                 suffix: ' days', label: 'Duration',     big: true },
                { val: trail.max_altitude_m.toLocaleString(), suffix: 'm',   label: 'Max altitude', big: true },
                { val: trail.distance_km,                   suffix: ' km',   label: 'Distance',     big: true },
              ].map(s => (
                <div key={s.label}>
                  <p style={{ fontFamily: 'Fraunces, serif', fontSize: '30px', fontWeight: 700, color: '#C4973A', lineHeight: 1 }}>
                    {s.val}<span style={{ fontFamily: 'DM Sans, sans-serif', fontSize: '13px', color: 'rgba(255,255,255,0.4)', fontWeight: 400 }}>{s.suffix}</span>
                  </p>
                  <p style={{ fontSize: '10px', textTransform: 'uppercase', letterSpacing: '0.12em', color: 'rgba(255,255,255,0.28)', marginTop: '6px' }}>
                    {s.label}
                  </p>
                </div>
              ))}
              <div>
                <p style={{ fontSize: '13px', fontWeight: 500, color: '#C4973A', lineHeight: 1.4 }}>
                  {trail.best_seasons}
                </p>
                <p style={{ fontSize: '10px', textTransform: 'uppercase', letterSpacing: '0.12em', color: 'rgba(255,255,255,0.28)', marginTop: '6px' }}>
                  Best seasons
                </p>
              </div>
            </div>
          </div>}
        </div>

        {/* Scroll indicator */}
        <div style={{ position: 'absolute', bottom: '32px', left: '64px', display: 'flex', flexDirection: 'column', alignItems: 'flex-start', gap: '8px' }}>
          <span style={{ fontSize: '10px', letterSpacing: '0.2em', textTransform: 'uppercase', color: 'rgba(255,255,255,0.25)' }}>Scroll</span>
          <div style={{ width: '1px', height: '48px', backgroundColor: 'rgba(255,255,255,0.1)', position: 'relative', overflow: 'hidden' }}>
            <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: '40%', backgroundColor: 'rgba(255,255,255,0.55)', animation: 'scrollLine 2.2s ease-in-out infinite' }} />
          </div>
        </div>
      </div>

      {/* ── SECTION NAV ─────────────────────────────────────── */}
      <div style={{ backgroundColor: '#FFFFFF', borderBottom: '1px solid #E8E5E0', position: 'sticky', top: `${NAVBAR_H}px`, zIndex: 40 }}>
        <div style={{ maxWidth: '1000px', margin: '0 auto', padding: isMobile ? '0 4px' : '0 48px', display: 'flex', overflowX: isMobile ? 'auto' : undefined, WebkitOverflowScrolling: 'touch' }}>
          {SECTIONS.map(({ id, label }) => (
            <button key={id} onClick={() => scrollTo(id)} style={{
              padding: isMobile ? '14px 18px' : '16px 28px', fontSize: '14px', whiteSpace: 'nowrap',
              fontFamily: 'DM Sans, sans-serif', border: 'none',
              borderBottom: active === id ? '2px solid #C4973A' : '2px solid transparent',
              backgroundColor: 'transparent',
              color: active === id ? '#1A3A2A' : '#888',
              fontWeight: active === id ? '500' : '400',
              cursor: 'pointer', transition: 'color 0.2s, border-color 0.2s',
            }}>
              {label}
            </button>
          ))}
        </div>
      </div>

      {/* ── PAGE CONTENT ────────────────────────────────────── */}
      <div style={{ maxWidth: '1000px', margin: '0 auto', padding: isMobile ? '0 20px 64px' : '0 48px 96px' }}>

        {/* ── OVERVIEW ──────────────────────────────────────── */}
        <section id="overview" style={{ padding: '72px 0' }}>
          <p style={{ fontSize: '11px', letterSpacing: '0.2em', textTransform: 'uppercase', color: '#C4973A', marginBottom: '12px' }}>✦ Overview</p>
          <h2 style={{ fontFamily: 'Fraunces, serif', fontSize: '40px', fontWeight: 700, color: '#1A3A2A', marginBottom: '48px' }}>
            About this trek
          </h2>

          <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : '1fr 300px', gap: isMobile ? '32px' : '56px', alignItems: 'start' }}>
            <div>
              {pullQuote && (
                <p style={{ fontFamily: 'Fraunces, serif', fontSize: '20px', fontStyle: 'italic', color: '#1A3A2A', lineHeight: 1.65, marginBottom: '20px' }}>
                  {pullQuote}
                </p>
              )}
              <p style={{ color: '#555', lineHeight: 1.9, fontSize: '15px' }}>
                {bodyText}
              </p>
            </div>

            {/* Highlights — editorial sidebar with gold left border */}
            <div style={{ backgroundColor: '#FFFFFF', borderLeft: '3px solid #C4973A', borderRadius: '0 16px 16px 0', padding: '28px 28px 28px 24px' }}>
              <h3 style={{ fontFamily: 'Fraunces, serif', fontSize: '18px', fontWeight: 700, color: '#1A3A2A', marginBottom: '20px' }}>
                Highlights
              </h3>
              <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '14px' }}>
                {highlights.map((h, i) => (
                  <li key={i} style={{ display: 'flex', gap: '12px', fontSize: '14px', color: '#444', lineHeight: 1.5 }}>
                    <span style={{ color: '#C4973A', flexShrink: 0, marginTop: '2px' }}>✦</span>
                    {h}
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* Dynamic elevation profile */}
          {elev && (
            <div style={{ marginTop: '56px', backgroundColor: '#FFFFFF', border: '1px solid #E8E5E0', borderRadius: '20px', padding: '36px 40px' }}>
              <p style={{ fontSize: '11px', letterSpacing: '0.15em', textTransform: 'uppercase', color: '#C0BAB2', marginBottom: '20px' }}>
                Elevation Profile
              </p>
              <svg
                viewBox={`0 0 ${elev.W} ${elev.H}`}
                style={{ width: '100%', height: 'auto', display: 'block' }}
                onMouseMove={e => {
                  const rect = e.currentTarget.getBoundingClientRect()
                  const mx = (e.clientX - rect.left) * (elev.W / rect.width)
                  const my = (e.clientY - rect.top)  * (elev.H / rect.height)
                  let closest = null, minDist = Infinity
                  elev.pts.forEach(([x, y], i) => {
                    const d = Math.sqrt((x - mx) ** 2 + (y - my) ** 2)
                    if (d < minDist) { minDist = d; closest = i }
                  })
                  setHoveredDot(minDist < 20 ? closest : null)
                }}
                onMouseLeave={() => setHoveredDot(null)}
              >
                <defs>
                  <linearGradient id="elevGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%"   stopColor="#C4973A" stopOpacity="0.28" />
                    <stop offset="100%" stopColor="#C4973A" stopOpacity="0" />
                  </linearGradient>
                </defs>
                {[0.25, 0.5, 0.75].map(f => {
                  const y = (14 + f * (elev.H - 28)).toFixed(1)
                  return <line key={f} x1="0" y1={y} x2={elev.W} y2={y} stroke="#F2EFE9" strokeWidth="1" />
                })}
                <path d={elev.area} fill="url(#elevGrad)" />
                <path d={elev.line} fill="none" stroke="#C4973A" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                {elev.pts.map(([x, y], i) => (
                  <circle key={i} cx={x} cy={y}
                    r={i === elev.peakIdx ? 4.5 : hoveredDot === i ? 4 : 2.5}
                    fill={i === elev.peakIdx ? '#C4973A' : '#D4B87A'}
                    stroke={(i === elev.peakIdx || hoveredDot === i) ? '#F7F5F0' : 'none'}
                    strokeWidth="2"
                  />
                ))}
                <text
                  x={elev.pts[elev.peakIdx][0]}
                  y={Math.max(10, elev.pts[elev.peakIdx][1] - 9)}
                  textAnchor={
                    elev.pts[elev.peakIdx][0] < 50 ? 'start' :
                    elev.pts[elev.peakIdx][0] > elev.W - 50 ? 'end' : 'middle'
                  }
                  fontSize="9" fill="#C4973A" fontFamily="DM Sans, sans-serif">
                  {elev.peakAlt.toLocaleString()}m
                </text>
                {hoveredDot !== null && (() => {
                  const [dx, dy] = elev.pts[hoveredDot]
                  const day      = elev.days[hoveredDot]
                  const TW = 136, TH = 42
                  const tx = Math.min(Math.max(dx, TW / 2 + 4), elev.W - TW / 2 - 4)
                  const ty = Math.max(2, dy - (hoveredDot === elev.peakIdx ? 4.5 : 4) - 8 - TH)
                  const label = day.title.length > 22 ? day.title.slice(0, 20) + '…' : day.title
                  return (
                    <g pointerEvents="none">
                      <rect x={tx - TW / 2} y={ty} width={TW} height={TH} rx="6"
                        fill="#1A3A2A" opacity="0.93" />
                      <text x={tx} y={ty + 15} textAnchor="middle"
                        fontSize="8.5" fontWeight="600" fill="#C4973A" fontFamily="DM Sans, sans-serif">
                        {label}
                      </text>
                      <text x={tx} y={ty + 30} textAnchor="middle"
                        fontSize="8" fill="rgba(255,255,255,0.7)" fontFamily="DM Sans, sans-serif">
                        {day.altitude_m.toLocaleString()}m · Day {day.day}
                      </text>
                    </g>
                  )
                })()}
              </svg>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '10px' }}>
                <span style={{ fontSize: '11px', color: '#CCC' }}>Day {elev.days[0].day} · {elev.days[0].altitude_m.toLocaleString()}m</span>
                <span style={{ fontSize: '11px', color: '#CCC' }}>Day {elev.days[elev.days.length - 1].day} · {elev.days[elev.days.length - 1].altitude_m.toLocaleString()}m</span>
              </div>
            </div>
          )}
        </section>

        <div style={{ borderTop: '1px solid #E8E5E0' }} />

        {/* ── ITINERARY ─────────────────────────────────────── */}
        <section id="itinerary" style={{ padding: '72px 0' }}>
          <p style={{ fontSize: '11px', letterSpacing: '0.2em', textTransform: 'uppercase', color: '#C4973A', marginBottom: '12px' }}>✦ Day by Day</p>
          <h2 style={{ fontFamily: 'Fraunces, serif', fontSize: '40px', fontWeight: 700, color: '#1A3A2A', marginBottom: '52px' }}>
            Itinerary
          </h2>

          <div style={{ position: 'relative' }}>
            {/* Gradient timeline line — fades in and out, bright in the middle (high altitude section) */}
            <div style={{
              position: 'absolute', left: 0, top: '8px', bottom: '8px', width: '2px',
              background: 'linear-gradient(to bottom, rgba(196,151,58,0.15) 0%, #C4973A 35%, #C4973A 65%, rgba(196,151,58,0.15) 100%)',
            }} />

            {trail.itinerary.map((day) => {
              const frac   = maxAlt > 0 ? day.altitude_m / maxAlt : 0
              const isHigh = frac > 0.85
              return (
                <div key={day.day} style={{ paddingLeft: '40px', paddingBottom: '44px', position: 'relative' }}>
                  {/* Timeline dot — larger + glowing at high points */}
                  <div style={{
                    position: 'absolute', top: '4px',
                    left:   isHigh ? '-7px' : '-5px',
                    width:  isHigh ? '16px' : '12px',
                    height: isHigh ? '16px' : '12px',
                    borderRadius: '50%',
                    backgroundColor: isHigh ? '#C4973A' : '#C4B07A',
                    border: '2px solid #F7F5F0',
                    boxShadow: isHigh ? '0 0 0 4px rgba(196,151,58,0.18)' : 'none',
                  }} />

                  <div style={{ display: 'flex', alignItems: 'flex-start', gap: '20px' }}>
                    <div style={{ flex: 1 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '8px', flexWrap: 'wrap' }}>
                        <span style={{ fontSize: '11px', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.12em', color: '#C4973A' }}>
                          Day {day.day}
                        </span>
                        {day.walk_hours > 0 && (
                          <span style={{ fontSize: '12px', color: '#AAA', backgroundColor: '#F0EDE8', padding: '2px 10px', borderRadius: '20px' }}>
                            🕐 {day.walk_hours} hrs
                          </span>
                        )}
                      </div>
                      <h3 style={{ fontFamily: 'Fraunces, serif', fontSize: '20px', fontWeight: 700, color: '#1C1C1C', marginBottom: '10px' }}>
                        {day.title}
                      </h3>
                      <p style={{ fontSize: '14px', color: '#666', lineHeight: 1.85 }}>
                        {day.description}
                      </p>
                    </div>

                    {/* Altitude badge — gold when near peak */}
                    {day.altitude_m > 0 && (
                      <div style={{
                        flexShrink: 0, textAlign: 'center',
                        backgroundColor: isHigh ? 'rgba(196,151,58,0.08)' : '#F7F5F0',
                        border: isHigh ? '1px solid rgba(196,151,58,0.22)' : '1px solid transparent',
                        borderRadius: '14px', padding: '14px 18px', minWidth: '84px',
                      }}>
                        <p style={{ fontFamily: 'Fraunces, serif', fontSize: '16px', fontWeight: 700, color: isHigh ? '#C4973A' : '#999', lineHeight: 1 }}>
                          {day.altitude_m.toLocaleString()}m
                        </p>
                        <p style={{ fontSize: '10px', textTransform: 'uppercase', letterSpacing: '0.08em', color: isHigh ? '#C4973A' : '#BBB', marginTop: '4px' }}>
                          altitude
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              )
            })}
          </div>
        </section>

        <div style={{ borderTop: '1px solid #E8E5E0' }} />

        {/* ── PERMITS ───────────────────────────────────────── */}
        <section id="permits" style={{ padding: '72px 0' }}>
          <p style={{ fontSize: '11px', letterSpacing: '0.2em', textTransform: 'uppercase', color: '#C4973A', marginBottom: '12px' }}>✦ What you need to know</p>
          <h2 style={{ fontFamily: 'Fraunces, serif', fontSize: isMobile ? '28px' : '40px', fontWeight: 700, color: '#1A3A2A', marginBottom: isMobile ? '28px' : '48px' }}>
            Permits & Logistics
          </h2>

          {/* Permit cards from API */}
          {trail.permits.length > 0 && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', marginBottom: '40px' }}>
              {trail.permits.map(p => (
                <div key={p.id} style={{
                  backgroundColor: '#FFFFFF', border: '1px solid #E8E5E0',
                  borderRadius: '20px', padding: isMobile ? '20px' : '28px 32px',
                  display: 'flex', flexDirection: isMobile ? 'column' : 'row',
                  gap: isMobile ? '12px' : '32px', alignItems: 'flex-start',
                }}>
                  <div style={{ flexShrink: 0 }}>
                    <span style={{
                      display: 'inline-block', fontSize: '11px', fontWeight: 600,
                      textTransform: 'uppercase', letterSpacing: '0.1em',
                      padding: '4px 12px', borderRadius: '20px',
                      backgroundColor: 'rgba(196,151,58,0.1)', color: '#C4973A',
                      marginBottom: '12px',
                    }}>
                      {PERMIT_TYPE_LABEL[p.permit_type] || p.permit_type}
                    </span>
                    <p style={{ fontFamily: 'Fraunces, serif', fontSize: '28px', fontWeight: 700, color: '#1A3A2A', lineHeight: 1 }}>
                      ${parseFloat(p.cost_usd).toFixed(0)}
                      <span style={{ fontFamily: 'DM Sans, sans-serif', fontSize: '13px', fontWeight: 400, color: '#AAA' }}> USD</span>
                    </p>
                  </div>
                  <div style={{ flex: 1 }}>
                    <h3 style={{ fontFamily: 'Fraunces, serif', fontSize: '19px', fontWeight: 700, color: '#1A3A2A', marginBottom: '8px' }}>
                      {p.name}
                    </h3>
                    <p style={{ fontSize: '13px', color: '#888', marginBottom: p.notes ? '10px' : '0', lineHeight: 1.6 }}>
                      📍 {p.where_to_buy}
                    </p>
                    {p.notes && (
                      <p style={{ fontSize: '13px', color: '#666', lineHeight: 1.7, borderLeft: '2px solid #F0EDE8', paddingLeft: '12px' }}>
                        {p.notes}
                      </p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Logistics quick-facts row */}
          <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr', gap: '16px' }}>
            {[
              {
                icon: '🧭', title: 'Guide Requirement',
                content: trail.guide_required
                  ? 'A licensed guide is required for this trek. Solo trekking is not permitted on this route.'
                  : 'A guide is not mandatory, but is recommended for first-time trekkers.',
              },
              {
                icon: '🏠', title: 'Accommodation Style',
                content: trail.trek_style === 'teahouse'
                  ? 'Tea house trek — local family-run lodges with twin beds and shared bathrooms. Meals included in room rate at most lodges.'
                  : trail.trek_style === 'camping'
                  ? 'Camping trek — all gear and camp staff included. No permanent structures on route.'
                  : 'Luxury lodge trek — high-end fixed lodges with private bathrooms and hot showers.',
              },
              {
                icon: '📅', title: 'Best Time to Go',
                content: `Best seasons: ${trail.best_seasons}. Spring (Mar–May) offers blooming rhododendrons and clear skies; autumn (Sep–Nov) has the most stable, dry weather.`,
              },
              {
                icon: '💰', title: 'Permit Total',
                content: trail.permits.length > 0
                  ? `Total permit cost: ~$${trail.permits.reduce((sum, p) => sum + parseFloat(p.cost_usd), 0).toFixed(0)} USD per person. Buy permits before departure from Kathmandu to avoid queues at the trailhead.`
                  : 'No special permits required for this trek.',
              },
            ].map(card => (
              <div key={card.title} style={{ backgroundColor: '#FFFFFF', border: '1px solid #E8E5E0', borderRadius: '20px', padding: '28px 28px' }}>
                <div style={{
                  width: '44px', height: '44px', borderRadius: '12px',
                  backgroundColor: '#F7F5F0', display: 'flex', alignItems: 'center',
                  justifyContent: 'center', fontSize: '22px', marginBottom: '16px',
                }}>
                  {card.icon}
                </div>
                <h3 style={{ fontFamily: 'Fraunces, serif', fontSize: '18px', fontWeight: 700, color: '#1A3A2A', marginBottom: '10px' }}>
                  {card.title}
                </h3>
                <p style={{ fontSize: '14px', color: '#555', lineHeight: 1.8 }}>
                  {card.content}
                </p>
              </div>
            ))}
          </div>
        </section>

        <div style={{ borderTop: '1px solid #E8E5E0' }} />

        {/* ── TEAHOUSES ─────────────────────────────────────── */}
        <section id="teahouses" style={{ padding: '72px 0' }}>
          <p style={{ fontSize: '11px', letterSpacing: '0.2em', textTransform: 'uppercase', color: '#C4973A', marginBottom: '12px' }}>✦ Accommodation</p>
          <h2 style={{ fontFamily: 'Fraunces, serif', fontSize: '40px', fontWeight: 700, color: '#1A3A2A', marginBottom: '12px' }}>
            Teahouses
          </h2>
          <p style={{ fontSize: '15px', color: '#888', marginBottom: '48px', lineHeight: 1.7 }}>
            A selection of reliable lodges along the route. Prices are per room per night and vary by season.
          </p>

          {trail.teahouses.length === 0 ? (
            <p style={{ color: '#BBB', fontSize: '14px' }}>No teahouse data available yet for this trail.</p>
          ) : (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '20px' }}>
              {trail.teahouses.map(t => (
                <div key={t.id} style={{
                  backgroundColor: '#FFFFFF', border: '1px solid #E8E5E0',
                  borderRadius: '20px', padding: '28px', display: 'flex', flexDirection: 'column', gap: '16px',
                }}>
                  {/* Header */}
                  <div>
                    {t.day_on_trail && (
                      <span style={{
                        display: 'inline-block', fontSize: '11px', fontWeight: 600,
                        textTransform: 'uppercase', letterSpacing: '0.1em',
                        padding: '3px 10px', borderRadius: '20px', marginBottom: '10px',
                        backgroundColor: '#F0EDE8', color: '#888',
                      }}>
                        Day {t.day_on_trail}
                      </span>
                    )}
                    <h3 style={{ fontFamily: 'Fraunces, serif', fontSize: '20px', fontWeight: 700, color: '#1A3A2A', marginBottom: '4px' }}>
                      {t.name}
                    </h3>
                    <p style={{ fontSize: '13px', color: '#999' }}>
                      {t.location}{t.altitude_m ? ` · ${t.altitude_m.toLocaleString()}m` : ''}
                    </p>
                  </div>

                  {/* Amenity pills */}
                  <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                    <span style={{
                      fontSize: '12px', padding: '4px 12px', borderRadius: '20px',
                      backgroundColor: t.has_wifi ? '#EAF3DE' : '#F0EDE8',
                      color: t.has_wifi ? '#3B6D11' : '#AAA',
                    }}>
                      {t.has_wifi ? '✓ WiFi' : '✗ No WiFi'}
                    </span>
                    <span style={{
                      fontSize: '12px', padding: '4px 12px', borderRadius: '20px',
                      backgroundColor: t.has_hot_shower ? '#EAF3DE' : '#F0EDE8',
                      color: t.has_hot_shower ? '#3B6D11' : '#AAA',
                    }}>
                      {t.has_hot_shower ? '✓ Hot Shower' : '✗ Cold Shower'}
                    </span>
                  </div>

                  {/* Price */}
                  {(t.price_usd_min || t.price_usd_max) && (
                    <p style={{ fontSize: '15px', fontWeight: 600, color: '#1A3A2A' }}>
                      ${t.price_usd_min}–${t.price_usd_max}
                      <span style={{ fontSize: '12px', fontWeight: 400, color: '#AAA' }}> / night</span>
                    </p>
                  )}

                  {/* Notes */}
                  {t.notes && (
                    <p style={{ fontSize: '13px', color: '#666', lineHeight: 1.7, borderTop: '1px solid #F0EDE8', paddingTop: '14px', margin: 0 }}>
                      {t.notes}
                    </p>
                  )}
                </div>
              ))}
            </div>
          )}
        </section>

      </div>

      {/* ── CTA ─────────────────────────────────────────────── */}
      {/* Mountain silhouette transitions cream → dark green */}
      <svg viewBox="0 0 1440 80" preserveAspectRatio="none"
        style={{ display: 'block', width: '100%', height: '60px', backgroundColor: '#F7F5F0' }}>
        <path d="M0,80 L80,50 L160,64 L240,38 L320,58 L400,28 L480,50 L560,20 L640,44 L720,16 L800,40 L880,24 L960,52 L1040,30 L1120,54 L1200,32 L1280,56 L1360,38 L1440,62 L1440,80 Z"
          fill="#1A3A2A" />
      </svg>
      <div style={{ backgroundColor: '#1A3A2A', padding: isMobile ? '48px 20px 56px' : '56px 64px 72px', textAlign: 'center' }}>
        <p style={{ fontSize: '11px', letterSpacing: '0.2em', textTransform: 'uppercase', color: 'rgba(196,151,58,0.7)', marginBottom: '20px' }}>
          ✦ Ready to go?
        </p>
        <h2 style={{ fontFamily: 'Fraunces, serif', fontSize: '52px', fontWeight: 700, color: '#FFFFFF', lineHeight: 1.05, marginBottom: '16px' }}>
          Plan your trek
        </h2>
        <p style={{ fontSize: '16px', color: 'rgba(255,255,255,0.4)', lineHeight: 1.7, maxWidth: '380px', margin: '0 auto 44px' }}>
          Explore all verified Nepal routes with honest permit costs and real altitude data.
        </p>
        <div style={{ display: 'flex', gap: '12px', justifyContent: 'center', flexDirection: isMobile ? 'column' : undefined, alignItems: isMobile ? 'center' : undefined }}>
          <Link to="/trails" style={{
            padding: '16px 48px', borderRadius: '32px',
            backgroundColor: '#C4973A', color: '#FFF',
            textDecoration: 'none', fontSize: '15px', fontWeight: 500, letterSpacing: '0.04em',
          }}>
            All Trails
          </Link>
          <Link to="/" style={{
            padding: '16px 40px', borderRadius: '32px',
            backgroundColor: 'rgba(255,255,255,0.08)', color: '#FFF',
            textDecoration: 'none', fontSize: '15px',
            backdropFilter: 'blur(8px)', border: '1px solid rgba(255,255,255,0.1)',
          }}>
            Home
          </Link>
        </div>
      </div>

      <style>{`
        @keyframes fadeUp {
          from { opacity: 0; transform: translateY(24px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        @keyframes twinkle {
          from { opacity: 0.15; }
          to   { opacity: 1; }
        }
        @keyframes scrollLine {
          0%   { transform: translateY(-100%); opacity: 0; }
          15%  { opacity: 1; }
          85%  { opacity: 1; }
          100% { transform: translateY(280%); opacity: 0; }
        }
      `}</style>

    </div>
  )
}

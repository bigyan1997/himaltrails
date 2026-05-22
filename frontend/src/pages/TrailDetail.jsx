import { useEffect, useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import { getTrail } from '../services/api'

const TABS = ['Overview', 'Itinerary', 'Permits & Logistics']

export default function TrailDetail() {
  const { slug }              = useParams()
  const [trail, setTrail]     = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError]     = useState(null)
  const [activeTab, setTab]   = useState('Overview')

  useEffect(() => {
    getTrail(slug)
      .then(res => setTrail(res.data))
      .catch(() => setError('Trail not found.'))
      .finally(() => setLoading(false))
  }, [slug])

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

  return (
    <div style={{ backgroundColor: '#F7F5F0', minHeight: '100vh', fontFamily: 'DM Sans, sans-serif' }}>

      {/* ── Navbar ──────────────────────────────────────── */}
      <nav style={{ backgroundColor: '#1A3A2A', padding: '16px 32px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', position: 'sticky', top: 0, zIndex: 50 }}>
        <Link to="/" style={{ fontFamily: 'Playfair Display, serif', fontSize: '20px', fontWeight: 700, color: '#C4973A', textDecoration: 'none' }}>
          HimalTrails
        </Link>
        <Link to="/trails" style={{ fontSize: '13px', letterSpacing: '0.1em', textTransform: 'uppercase', color: 'rgba(255,255,255,0.7)', textDecoration: 'none' }}>
          ← All Trails
        </Link>
      </nav>

      {/* ── Hero ────────────────────────────────────────── */}
      <div style={{ background: 'linear-gradient(160deg, #0D2B1D 0%, #1A3A2A 60%, #2D5A3D 100%)', padding: '64px 32px 48px' }}>
        <div style={{ maxWidth: '900px', margin: '0 auto' }}>
          <div style={{ display: 'flex', gap: '10px', marginBottom: '20px', flexWrap: 'wrap' }}>
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

          <h1 style={{ fontFamily: 'Playfair Display, serif', fontSize: '56px', fontWeight: 700, color: '#FFFFFF', lineHeight: 1.1, marginBottom: '16px', maxWidth: '700px' }}>
            {trail.name}
          </h1>

          <p style={{ color: 'rgba(255,255,255,0.5)', fontSize: '15px' }}>
            {trail.start_point} → {trail.end_point}
          </p>
        </div>
      </div>

      {/* ── Stats Icons Bar ──────────────────────────────── */}
      <div style={{ backgroundColor: '#FFFFFF', borderBottom: '1px solid #E8E5E0' }}>
        <div style={{ maxWidth: '900px', margin: '0 auto', padding: '28px 32px', display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '24px' }}>
          {[
            { icon: '🗓', label: 'Duration',     value: `${trail.duration_days} Days` },
            { icon: '⛰', label: 'Max Altitude', value: `${trail.max_altitude_m.toLocaleString()}m` },
            { icon: '📏', label: 'Distance',     value: `${trail.distance_km} km` },
            { icon: '📅', label: 'Best Seasons', value: trail.best_seasons },
          ].map(s => (
            <div key={s.label} style={{ textAlign: 'center' }}>
              <div style={{ fontSize: '28px', marginBottom: '8px' }}>{s.icon}</div>
              <p style={{ fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.1em', color: '#AAA', marginBottom: '4px' }}>
                {s.label}
              </p>
              <p style={{ fontFamily: 'Playfair Display, serif', fontSize: '18px', fontWeight: 700, color: '#1A3A2A' }}>
                {s.value}
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* ── Tabs ────────────────────────────────────────── */}
      <div style={{ backgroundColor: '#FFFFFF', borderBottom: '1px solid #E8E5E0', position: 'sticky', top: '57px', zIndex: 40 }}>
        <div style={{ maxWidth: '900px', margin: '0 auto', padding: '0 32px', display: 'flex', gap: '0' }}>
          {TABS.map(tab => (
            <button
              key={tab}
              onClick={() => setTab(tab)}
              style={{
                padding: '16px 24px',
                fontSize: '14px',
                fontFamily: 'DM Sans, sans-serif',
                border: 'none',
                borderBottom: activeTab === tab ? '2px solid #C4973A' : '2px solid transparent',
                backgroundColor: 'transparent',
                color: activeTab === tab ? '#1A3A2A' : '#888',
                fontWeight: activeTab === tab ? '500' : '400',
                cursor: 'pointer',
                transition: 'all 0.2s',
              }}
            >
              {tab}
            </button>
          ))}
        </div>
      </div>

      {/* ── Tab Content ─────────────────────────────────── */}
      <div style={{ maxWidth: '900px', margin: '0 auto', padding: '40px 32px' }}>

        {/* OVERVIEW TAB */}
        {activeTab === 'Overview' && (
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 340px', gap: '40px', alignItems: 'start' }}>

            {/* Description */}
            <div>
              <h2 style={{ fontFamily: 'Playfair Display, serif', fontSize: '28px', fontWeight: 700, color: '#1A3A2A', marginBottom: '16px' }}>
                About this trek
              </h2>
              <p style={{ color: '#444', lineHeight: 1.9, fontSize: '15px' }}>
                {trail.description}
              </p>
            </div>

            {/* Highlights card */}
            <div style={{ backgroundColor: '#FFFFFF', border: '1px solid #E8E5E0', borderRadius: '16px', padding: '28px' }}>
              <h3 style={{ fontFamily: 'Playfair Display, serif', fontSize: '20px', fontWeight: 700, color: '#1A3A2A', marginBottom: '20px' }}>
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
        )}

        {/* ITINERARY TAB */}
        {activeTab === 'Itinerary' && (
          <div>
            <h2 style={{ fontFamily: 'Playfair Display, serif', fontSize: '28px', fontWeight: 700, color: '#1A3A2A', marginBottom: '32px' }}>
              Day by Day
            </h2>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0', borderLeft: '2px solid #E0DDD6', paddingLeft: '0' }}>
              {trail.itinerary.map((day, i) => (
                <div
                  key={day.day}
                  style={{
                    paddingLeft: '32px',
                    paddingBottom: '36px',
                    position: 'relative',
                  }}
                >
                  {/* Timeline dot */}
                  <div style={{
                    position: 'absolute',
                    left: '-8px',
                    top: '4px',
                    width: '14px',
                    height: '14px',
                    borderRadius: '50%',
                    backgroundColor: '#C4973A',
                    border: '2px solid #F7F5F0',
                  }} />

                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '8px', flexWrap: 'wrap' }}>
                    <span style={{ fontSize: '11px', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.12em', color: '#C4973A' }}>
                      Day {day.day}
                    </span>
                    {day.altitude_m > 0 && (
                      <span style={{ fontSize: '12px', color: '#AAA', backgroundColor: '#F0EDE8', padding: '2px 10px', borderRadius: '20px' }}>
                        ⛰ {day.altitude_m.toLocaleString()}m
                      </span>
                    )}
                    {day.walk_hours > 0 && (
                      <span style={{ fontSize: '12px', color: '#AAA', backgroundColor: '#F0EDE8', padding: '2px 10px', borderRadius: '20px' }}>
                        🕐 {day.walk_hours} hrs
                      </span>
                    )}
                  </div>

                  <h3 style={{ fontSize: '17px', fontWeight: 600, color: '#1C1C1C', marginBottom: '8px' }}>
                    {day.title}
                  </h3>
                  <p style={{ fontSize: '14px', color: '#666', lineHeight: 1.8 }}>
                    {day.description}
                  </p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* PERMITS TAB */}
        {activeTab === 'Permits & Logistics' && (
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px' }}>

            {[
              {
                title: 'Permits Required',
                icon: '📋',
                content: trail.permits_required
                  ? 'This trek requires permits. You will need a Sagarmatha National Park entry permit and a Khumbu Pasang Lhamu Rural Municipality permit. These can be arranged in Kathmandu or Namche Bazaar.'
                  : 'No special permits are required for this trek.',
              },
              {
                title: 'Guide Requirement',
                icon: '🧭',
                content: trail.guide_required
                  ? 'As of 2023, all foreign trekkers must be accompanied by a licensed guide on this route. Solo trekking is no longer permitted.'
                  : 'A guide is not mandatory for this trek, but is strongly recommended for first-time trekkers.',
              },
              {
                title: 'Accommodation',
                icon: '🏠',
                content: `This is a ${trail.trek_style === 'teahouse' ? 'tea house trek' : trail.trek_style + ' trek'}. Tea houses are basic but comfortable lodges run by local families along the route. Rooms typically have twin beds and shared bathrooms.`,
              },
              {
                title: 'Best Time to Go',
                icon: '📅',
                content: `The best seasons are ${trail.best_seasons}. Spring (March–May) offers clear skies and rhododendrons in bloom. Autumn (September–December) has the most stable weather and best visibility.`,
              },
            ].map(card => (
              <div
                key={card.title}
                style={{ backgroundColor: '#FFFFFF', border: '1px solid #E8E5E0', borderRadius: '16px', padding: '28px' }}
              >
                <div style={{ fontSize: '32px', marginBottom: '14px' }}>{card.icon}</div>
                <h3 style={{ fontFamily: 'Playfair Display, serif', fontSize: '18px', fontWeight: 700, color: '#1A3A2A', marginBottom: '12px' }}>
                  {card.title}
                </h3>
                <p style={{ fontSize: '14px', color: '#555', lineHeight: 1.8 }}>
                  {card.content}
                </p>
              </div>
            ))}
          </div>
        )}

      </div>
    </div>
  )
}

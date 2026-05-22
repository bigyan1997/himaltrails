import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { getTrails } from '../services/api'

const DIFFICULTY_BADGE = {
  easy:     { bg: '#E8F5E9', color: '#2E7D32' },
  moderate: { bg: '#FFF8E1', color: '#F57F17' },
  hard:     { bg: '#FBE9E7', color: '#BF360C' },
  expert:   { bg: '#FCE4EC', color: '#880E4F' },
}

export default function TrailList() {
  const [trails, setTrails]   = useState([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter]   = useState('all')

  useEffect(() => {
    getTrails()
      .then(res => setTrails(res.data))
      .finally(() => setLoading(false))
  }, [])

  const difficulties = ['all', 'easy', 'moderate', 'hard', 'expert']
  const filtered = filter === 'all' ? trails : trails.filter(t => t.difficulty === filter)

  return (
    <div style={{ backgroundColor: '#F7F5F0', minHeight: '100vh', fontFamily: 'DM Sans, sans-serif' }}>

      {/* ── Navbar ──────────────────────────────────────── */}
      <nav style={{
        backgroundColor: '#1A3A2A',
        padding: '16px 48px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        position: 'sticky',
        top: 0,
        zIndex: 50,
      }}>
        <Link to="/" style={{ fontFamily: 'Playfair Display, serif', fontSize: '22px', fontWeight: 700, color: '#C4973A', textDecoration: 'none' }}>
          HimalTrails
        </Link>
        <Link to="/trails" style={{ fontSize: '12px', letterSpacing: '0.12em', textTransform: 'uppercase', color: 'rgba(255,255,255,0.7)', textDecoration: 'none' }}>
          Trails
        </Link>
      </nav>

      {/* ── Hero ────────────────────────────────────────── */}
      <div style={{
        background: 'linear-gradient(135deg, #0D2B1D 0%, #1A3A2A 50%, #2D5A3D 100%)',
        padding: '80px 48px 64px',
      }}>
        <div style={{ maxWidth: '1100px', margin: '0 auto' }}>
          <p style={{ fontSize: '11px', letterSpacing: '0.15em', textTransform: 'uppercase', color: '#C4973A', marginBottom: '16px' }}>
            ✦ Verified Routes
          </p>
          <h1 style={{ fontFamily: 'Playfair Display, serif', fontSize: '64px', fontWeight: 700, color: '#FFFFFF', lineHeight: 1.05, marginBottom: '20px' }}>
            Nepal Trails
          </h1>
          <p style={{ fontSize: '17px', fontWeight: 300, color: 'rgba(255,255,255,0.6)', lineHeight: 1.7, maxWidth: '520px', marginBottom: '48px' }}>
            Honest trail data for independent trekkers. No agency upsells — just the information you need.
          </p>

          {/* Stats */}
          <div style={{ display: 'flex', gap: '48px' }}>
            {[
              { value: trails.length || '—', label: 'Verified Trails' },
              { value: '18',                  label: 'Regions' },
              { value: '8,849m',              label: 'Highest Peak' },
            ].map(s => (
              <div key={s.label}>
                <p style={{ fontFamily: 'Playfair Display, serif', fontSize: '36px', fontWeight: 700, color: '#C4973A', lineHeight: 1 }}>
                  {s.value}
                </p>
                <p style={{ fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.12em', color: 'rgba(255,255,255,0.45)', marginTop: '6px' }}>
                  {s.label}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── Filters ─────────────────────────────────────── */}
      <div style={{ backgroundColor: '#FFFFFF', borderBottom: '1px solid #E8E5E0' }}>
        <div style={{ maxWidth: '1100px', margin: '0 auto', padding: '14px 48px', display: 'flex', alignItems: 'center', gap: '10px' }}>
          <span style={{ fontSize: '13px', color: '#999', marginRight: '4px' }}>Filter:</span>
          {difficulties.map(d => (
            <button
              key={d}
              onClick={() => setFilter(d)}
              style={{
                padding: '6px 18px',
                borderRadius: '20px',
                fontSize: '13px',
                textTransform: 'capitalize',
                border: 'none',
                cursor: 'pointer',
                fontFamily: 'DM Sans, sans-serif',
                backgroundColor: filter === d ? '#1A3A2A' : '#F0EDE8',
                color: filter === d ? '#FFFFFF' : '#555',
                transition: 'all 0.2s',
              }}
            >
              {d}
            </button>
          ))}
          <span style={{ marginLeft: 'auto', fontSize: '13px', color: '#BBB' }}>
            {filtered.length} trail{filtered.length !== 1 ? 's' : ''}
          </span>
        </div>
      </div>

      {/* ── Cards ───────────────────────────────────────── */}
      <div style={{ maxWidth: '1100px', margin: '0 auto', padding: '48px 48px' }}>
        {loading ? (
          <p style={{ color: '#AAA', textAlign: 'center', padding: '80px 0' }}>Loading trails...</p>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
            {filtered.map(trail => {
              const badge = DIFFICULTY_BADGE[trail.difficulty] || { bg: '#F0EDE8', color: '#555' }
              return (
                <Link
                  key={trail.id}
                  to={`/trails/${trail.slug}`}
                  style={{
                    backgroundColor: '#FFFFFF',
                    border: '1px solid #E8E5E0',
                    borderRadius: '20px',
                    display: 'block',
                    textDecoration: 'none',
                    overflow: 'hidden',
                    transition: 'transform 0.25s ease, box-shadow 0.25s ease',
                  }}
                  onMouseEnter={e => {
                    e.currentTarget.style.transform = 'translateY(-4px)'
                    e.currentTarget.style.boxShadow = '0 16px 48px rgba(0,0,0,0.09)'
                  }}
                  onMouseLeave={e => {
                    e.currentTarget.style.transform = 'translateY(0)'
                    e.currentTarget.style.boxShadow = 'none'
                  }}
                >
                  <div style={{ padding: '36px 40px' }}>
                    <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '32px' }}>

                      {/* ── Left ── */}
                      <div style={{ flex: 1 }}>
                        {/* Badges */}
                        <div style={{ display: 'flex', gap: '8px', marginBottom: '16px', flexWrap: 'wrap' }}>
                          <span style={{ fontSize: '12px', fontWeight: 500, padding: '4px 14px', borderRadius: '20px', backgroundColor: '#EAF3DE', color: '#3B6D11' }}>
                            {trail.region}
                          </span>
                          <span style={{ fontSize: '12px', fontWeight: 500, padding: '4px 14px', borderRadius: '20px', textTransform: 'capitalize', backgroundColor: badge.bg, color: badge.color }}>
                            {trail.difficulty}
                          </span>
                        </div>

                        {/* Name */}
                        <h2 style={{ fontFamily: 'Playfair Display, serif', fontSize: '32px', fontWeight: 700, color: '#1A3A2A', lineHeight: 1.2, marginBottom: '10px' }}>
                          {trail.name}
                        </h2>

                        {/* Seasons */}
                        <p style={{ fontSize: '14px', color: '#999', marginBottom: '24px' }}>
                          Best seasons: <span style={{ color: '#555' }}>{trail.best_seasons}</span>
                        </p>

                        {/* Stat pills */}
                        <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
                          {[
                            { icon: '🗓', text: `${trail.duration_days} days` },
                            { icon: '⛰', text: `${trail.max_altitude_m.toLocaleString()}m max altitude` },
                            { icon: '🧭', text: trail.trek_style === 'teahouse' ? 'Tea House Trek' : trail.trek_style },
                          ].map(s => (
                            <span
                              key={s.text}
                              style={{
                                display: 'inline-flex',
                                alignItems: 'center',
                                gap: '6px',
                                fontSize: '13px',
                                padding: '7px 16px',
                                borderRadius: '20px',
                                backgroundColor: '#F7F5F0',
                                color: '#444',
                              }}
                            >
                              {s.icon} {s.text}
                            </span>
                          ))}
                        </div>
                      </div>

                      {/* ── Right — stat block ── */}
                      <div style={{
                        backgroundColor: '#1A3A2A',
                        borderRadius: '16px',
                        padding: '28px 32px',
                        textAlign: 'center',
                        minWidth: '130px',
                        flexShrink: 0,
                      }}>
                        <p style={{ fontFamily: 'Playfair Display, serif', fontSize: '48px', fontWeight: 700, color: '#C4973A', lineHeight: 1 }}>
                          {trail.duration_days}
                        </p>
                        <p style={{ fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.12em', color: 'rgba(255,255,255,0.45)', marginTop: '4px', marginBottom: '16px' }}>
                          Days
                        </p>
                        <div style={{ borderTop: '1px solid rgba(255,255,255,0.08)', paddingTop: '16px' }}>
                          <p style={{ fontSize: '15px', fontWeight: 600, color: '#FFFFFF' }}>
                            {trail.max_altitude_m.toLocaleString()}m
                          </p>
                          <p style={{ fontSize: '11px', color: 'rgba(255,255,255,0.35)', marginTop: '3px' }}>
                            max altitude
                          </p>
                        </div>
                      </div>

                    </div>

                    {/* ── Footer ── */}
                    <div style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      marginTop: '28px',
                      paddingTop: '20px',
                      borderTop: '1px solid #F0EDE8',
                    }}>
                      <p style={{ fontSize: '13px', color: '#999' }}>
                        {trail.start_point} → {trail.end_point}
                      </p>
                      <span style={{ fontSize: '14px', fontWeight: 600, color: '#C4973A', display: 'flex', alignItems: 'center', gap: '6px' }}>
                        View full trail →
                      </span>
                    </div>
                  </div>
                </Link>
              )
            })}
          </div>
        )}
      </div>

    </div>
  )
}

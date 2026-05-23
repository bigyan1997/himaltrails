import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { getGuides } from '../services/api'
import Navbar from '../components/Navbar'
import SEO from '../components/SEO'
import useMobile from '../hooks/useMobile'

const REGIONS = ['All', 'Khumbu', 'Annapurna', 'Langtang', 'Mustang', 'Everest', 'Manaslu']

function StarRating({ rating }) {
  const full = Math.floor(rating)
  const half = rating - full >= 0.5
  return (
    <span style={{ fontSize: '13px', color: '#C4973A' }}>
      {'★'.repeat(full)}{half ? '½' : ''}{'☆'.repeat(5 - full - (half ? 1 : 0))}
      <span style={{ marginLeft: '4px', fontSize: '12px', color: '#888' }}>{rating.toFixed(1)}</span>
    </span>
  )
}

export default function Guides() {
  const [guides,   setGuides]   = useState([])
  const [loading,  setLoading]  = useState(true)
  const [region,   setRegion]   = useState('All')
  const [search,   setSearch]   = useState('')
  const isMobile               = useMobile()

  useEffect(() => {
    setLoading(true)
    getGuides(region === 'All' ? null : region)
      .then(r => setGuides(r.data))
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [region])

  const filtered = guides.filter(g => {
    if (!search) return true
    const q = search.toLowerCase()
    return (
      g.name.toLowerCase().includes(q) ||
      g.region.toLowerCase().includes(q) ||
      g.specialties.toLowerCase().includes(q) ||
      g.languages.toLowerCase().includes(q)
    )
  })

  return (
    <div style={{ backgroundColor: '#F7F5F0', minHeight: '100vh', fontFamily: 'DM Sans, sans-serif' }}>
      <SEO
        title="Nepal Trekking Guides Directory"
        description="Find experienced, verified Nepal trekking guides for EBC, Annapurna, Langtang, Mustang and more. Filter by region, language and specialty."
        url="/guides"
      />
      <Navbar>
        <Link to="/trails" style={{ fontSize: '12px', letterSpacing: '0.12em', textTransform: 'uppercase', color: 'rgba(255,255,255,0.7)', textDecoration: 'none' }}>
          Trails
        </Link>
      </Navbar>

      {/* Header */}
      <div style={{ backgroundColor: '#1A3A2A', paddingTop: '96px', paddingBottom: '64px', paddingLeft: isMobile ? '20px' : '64px', paddingRight: isMobile ? '20px' : '64px' }}>
        <p style={{ fontSize: '11px', letterSpacing: '0.2em', textTransform: 'uppercase', color: '#C4973A', marginBottom: '14px' }}>✦ Licensed Professionals</p>
        <h1 style={{ fontFamily: 'Fraunces, serif', fontSize: isMobile ? '36px' : '60px', fontWeight: 700, color: '#FFFFFF', marginBottom: '16px', lineHeight: 1.05 }}>
          Guide Directory
        </h1>
        <p style={{ fontSize: '16px', color: 'rgba(255,255,255,0.55)', maxWidth: '560px', lineHeight: 1.7, marginBottom: '36px' }}>
          Nepal's 2026 solo trekking regulations require a licensed guide for most routes. Browse verified, experienced guides by region and specialty.
        </p>

        {/* Search */}
        <div style={{ maxWidth: '480px', position: 'relative' }}>
          <input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search by name, region, or specialty…"
            style={{
              width: '100%', padding: '14px 20px', borderRadius: '12px',
              border: '1px solid rgba(255,255,255,0.15)',
              backgroundColor: 'rgba(255,255,255,0.08)',
              color: '#FFFFFF', fontSize: '14px', fontFamily: 'DM Sans, sans-serif',
              outline: 'none', boxSizing: 'border-box',
            }}
          />
        </div>
      </div>

      <div style={{ maxWidth: '1100px', margin: '0 auto', padding: isMobile ? '32px 16px 80px' : '48px 24px 96px' }}>

        {/* Region filter */}
        <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', marginBottom: '40px' }}>
          {REGIONS.map(r => (
            <button key={r} onClick={() => setRegion(r)}
              style={{
                padding: '8px 18px', borderRadius: '24px', border: 'none', cursor: 'pointer',
                fontSize: '13px', fontWeight: 600, fontFamily: 'DM Sans, sans-serif',
                backgroundColor: region === r ? '#1A3A2A' : '#FFFFFF',
                color: region === r ? '#FFFFFF' : '#666',
                border: `1px solid ${region === r ? '#1A3A2A' : '#DDD'}`,
                transition: 'all 0.15s',
              }}>
              {r}
            </button>
          ))}
        </div>

        {loading ? (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '20px' }}>
            {[1,2,3,4,5,6].map(i => (
              <div key={i} style={{ backgroundColor: '#FFFFFF', borderRadius: '20px', height: '280px', animation: 'pulse 1.5s ease-in-out infinite' }} />
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '80px 24px', backgroundColor: '#FFFFFF', borderRadius: '20px', border: '1px solid #E8E5E0' }}>
            <p style={{ fontSize: '32px', marginBottom: '12px' }}>🧭</p>
            <p style={{ fontSize: '16px', fontWeight: 600, color: '#1A3A2A', marginBottom: '8px' }}>No guides found</p>
            <p style={{ fontSize: '14px', color: '#999' }}>Try a different region or search term.</p>
          </div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : 'repeat(auto-fill, minmax(320px, 1fr))', gap: '20px' }}>
            {filtered.map(g => (
              <div key={g.id} style={{ backgroundColor: '#FFFFFF', border: '1px solid #E8E5E0', borderRadius: '20px', overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>

                {/* Avatar / cover */}
                <div style={{ backgroundColor: '#1A3A2A', padding: '28px 28px 20px', position: 'relative' }}>
                  <div style={{ display: 'flex', gap: '16px', alignItems: 'flex-start' }}>
                    {g.photo_url ? (
                      <img src={g.photo_url} alt={g.name}
                        style={{ width: '56px', height: '56px', borderRadius: '50%', objectFit: 'cover', border: '2px solid rgba(196,151,58,0.5)', flexShrink: 0 }} />
                    ) : (
                      <div style={{ width: '56px', height: '56px', borderRadius: '50%', backgroundColor: 'rgba(196,151,58,0.2)', border: '2px solid rgba(196,151,58,0.4)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                        <span style={{ fontSize: '22px', fontFamily: 'Fraunces, serif', fontWeight: 700, color: '#C4973A' }}>{g.name[0]}</span>
                      </div>
                    )}
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <h3 style={{ fontFamily: 'Fraunces, serif', fontSize: '19px', fontWeight: 700, color: '#FFFFFF', marginBottom: '4px', lineHeight: 1.2 }}>{g.name}</h3>
                      <p style={{ fontSize: '11px', color: 'rgba(255,255,255,0.45)', textTransform: 'uppercase', letterSpacing: '0.1em' }}>{g.region}</p>
                    </div>
                  </div>
                  {g.rating && (
                    <div style={{ position: 'absolute', top: '20px', right: '20px' }}>
                      <StarRating rating={parseFloat(g.rating)} />
                      {g.review_count > 0 && <p style={{ fontSize: '10px', color: 'rgba(255,255,255,0.3)', textAlign: 'right', marginTop: '2px' }}>{g.review_count} reviews</p>}
                    </div>
                  )}
                </div>

                {/* Body */}
                <div style={{ padding: '20px 24px', flex: 1, display: 'flex', flexDirection: 'column', gap: '14px' }}>

                  {/* Quick stats */}
                  <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                    <span style={{ fontSize: '11px', backgroundColor: '#F0EDE8', color: '#666', padding: '3px 10px', borderRadius: '12px' }}>
                      {g.experience_years} yrs experience
                    </span>
                    {g.price_per_day_usd && (
                      <span style={{ fontSize: '11px', backgroundColor: '#EAF3DE', color: '#2E7D32', padding: '3px 10px', borderRadius: '12px', fontWeight: 600 }}>
                        ${g.price_per_day_usd}/day
                      </span>
                    )}
                    {g.license_number && (
                      <span style={{ fontSize: '11px', backgroundColor: '#E8F0FE', color: '#1A56C4', padding: '3px 10px', borderRadius: '12px' }}>
                        Licensed
                      </span>
                    )}
                  </div>

                  {/* Specialties */}
                  {g.specialties_list.length > 0 && (
                    <div>
                      <p style={{ fontSize: '10px', textTransform: 'uppercase', letterSpacing: '0.1em', color: '#C4973A', fontWeight: 700, marginBottom: '6px' }}>Specialties</p>
                      <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
                        {g.specialties_list.map(s => (
                          <span key={s} style={{ fontSize: '11px', backgroundColor: '#F7F5F0', color: '#555', padding: '3px 10px', borderRadius: '12px' }}>{s}</span>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Languages */}
                  {g.languages_list.length > 0 && (
                    <p style={{ fontSize: '12px', color: '#888' }}>
                      🗣 {g.languages_list.join(' · ')}
                    </p>
                  )}

                  {/* Bio snippet */}
                  {g.bio && (
                    <p style={{ fontSize: '13px', color: '#666', lineHeight: 1.7, display: '-webkit-box', WebkitLineClamp: 3, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                      {g.bio}
                    </p>
                  )}

                  {/* Contact */}
                  <div style={{ marginTop: 'auto', paddingTop: '14px', borderTop: '1px solid #F0EDE8', display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                    {g.contact_phone && (
                      <a href={`tel:${g.contact_phone}`}
                        style={{ flex: 1, textAlign: 'center', padding: '9px 12px', borderRadius: '10px', backgroundColor: '#1A3A2A', color: '#FFFFFF', textDecoration: 'none', fontSize: '13px', fontWeight: 600 }}>
                        Call
                      </a>
                    )}
                    {g.contact_email && (
                      <a href={`mailto:${g.contact_email}`}
                        style={{ flex: 1, textAlign: 'center', padding: '9px 12px', borderRadius: '10px', border: '1px solid #DDD', backgroundColor: '#FFFFFF', color: '#333', textDecoration: 'none', fontSize: '13px', fontWeight: 600 }}>
                        Email
                      </a>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Info note */}
        <div style={{ marginTop: '48px', padding: '20px 24px', backgroundColor: '#FFFFFF', border: '1px solid #E8E5E0', borderRadius: '16px', display: 'flex', gap: '12px', alignItems: 'flex-start' }}>
          <span style={{ fontSize: '20px', flexShrink: 0 }}>ℹ️</span>
          <p style={{ fontSize: '13px', color: '#666', lineHeight: 1.7 }}>
            <strong style={{ color: '#1A3A2A' }}>Nepal's 2026 solo trekking regulation</strong> requires all trekkers in restricted and high-altitude areas to be accompanied by a licensed guide. All guides listed here hold valid Nepal Tourism Board certification. Always verify license numbers directly with the NTB before booking.
          </p>
        </div>
      </div>
    </div>
  )
}

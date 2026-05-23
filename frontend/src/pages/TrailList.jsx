import { useEffect, useState, useMemo } from 'react'
import { Link } from 'react-router-dom'
import { AnimatePresence, motion } from 'framer-motion'
import { getTrails } from '../services/api'
import Navbar from '../components/Navbar'
import { TrailCardSkeleton } from '../components/Skeleton'
import useMobile from '../hooks/useMobile'

const COMPARE_ROWS = [
  { label: 'Region',       key: t => t.region },
  { label: 'Difficulty',   key: t => t.difficulty },
  { label: 'Duration',     key: t => `${t.duration_days} days` },
  { label: 'Max Altitude', key: t => `${t.max_altitude_m?.toLocaleString()}m` },
  { label: 'Trek Style',   key: t => t.trek_style },
  { label: 'Best Seasons', key: t => t.best_seasons },
  { label: 'Start Point',  key: t => t.start_point },
  { label: 'Rating',       key: t => t.avg_rating ? `${t.avg_rating}★ (${t.review_count})` : 'No reviews' },
]

function ComparePanel({ trails, selected, onClose }) {
  const a = trails.find(t => t.slug === selected[0])
  const b = trails.find(t => t.slug === selected[1])
  if (!a || !b) return null
  return (
    <div style={{ position: 'fixed', inset: 0, zIndex: 200, display: 'flex', alignItems: 'flex-end', justifyContent: 'center', backgroundColor: 'rgba(0,0,0,0.45)' }}
      onClick={onClose}>
      <div style={{ width: '100%', maxWidth: '720px', backgroundColor: '#FFFFFF', borderRadius: '24px 24px 0 0', padding: '32px 28px 40px', maxHeight: '85vh', overflowY: 'auto' }}
        onClick={e => e.stopPropagation()}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
          <h2 style={{ fontFamily: 'Fraunces, serif', fontSize: '22px', fontWeight: 700, color: '#1A3A2A' }}>Trail Comparison</h2>
          <button onClick={onClose} style={{ background: 'none', border: 'none', fontSize: '20px', color: '#AAA', cursor: 'pointer' }}>✕</button>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '0' }}>
          <div />
          {[a, b].map(t => (
            <div key={t.slug} style={{ textAlign: 'center', padding: '0 8px 20px', borderBottom: '2px solid #1A3A2A', marginBottom: '8px' }}>
              <Link to={`/trails/${t.slug}`} style={{ fontFamily: 'Fraunces, serif', fontSize: '16px', fontWeight: 700, color: '#1A3A2A', textDecoration: 'none' }}>
                {t.name}
              </Link>
            </div>
          ))}
          {COMPARE_ROWS.map(row => (
            <>
              <div key={`l-${row.label}`} style={{ fontSize: '11px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em', color: '#C4973A', padding: '12px 0', borderBottom: '1px solid #F0EDE8', display: 'flex', alignItems: 'center' }}>
                {row.label}
              </div>
              {[a, b].map(t => (
                <div key={`${row.label}-${t.slug}`} style={{ fontSize: '13px', color: '#333', padding: '12px 8px', borderBottom: '1px solid #F0EDE8', textAlign: 'center', textTransform: 'capitalize' }}>
                  {row.key(t)}
                </div>
              ))}
            </>
          ))}
        </div>
        <div style={{ display: 'flex', gap: '10px', marginTop: '24px' }}>
          {[a, b].map(t => (
            <Link key={t.slug} to={`/trails/${t.slug}`} style={{ flex: 1, textAlign: 'center', padding: '12px', borderRadius: '12px', backgroundColor: '#1A3A2A', color: '#FFFFFF', textDecoration: 'none', fontSize: '14px', fontWeight: 600 }}>
              View {t.name.split(' ')[0]} →
            </Link>
          ))}
        </div>
      </div>
    </div>
  )
}

const DIFFICULTY_BADGE = {
  easy:     { bg: '#E8F5E9', color: '#2E7D32' },
  moderate: { bg: '#FFF8E1', color: '#F57F17' },
  hard:     { bg: '#FBE9E7', color: '#BF360C' },
  expert:   { bg: '#FCE4EC', color: '#880E4F' },
}

function Stars({ rating, count }) {
  if (!rating) return null
  return (
    <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
      {[1,2,3,4,5].map(i => (
        <svg key={i} width="12" height="12" viewBox="0 0 24 24"
          fill={i <= Math.round(rating) ? '#C4973A' : 'none'}
          stroke="#C4973A" strokeWidth="2">
          <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>
        </svg>
      ))}
      <span style={{ fontSize: '12px', color: '#888' }}>{rating} ({count})</span>
    </span>
  )
}

export default function TrailList() {
  const [trails, setTrails]       = useState([])
  const [loading, setLoading]     = useState(true)
  const [filter, setFilter]       = useState('all')
  const [search, setSearch]       = useState('')
  const [minDays, setMinDays]     = useState('')
  const [maxDays, setMaxDays]     = useState('')
  const [maxAlt, setMaxAlt]       = useState('')
  const [showFilters, setShowFilters]   = useState(false)
  const [compareList, setCompareList]   = useState([])
  const [showCompare, setShowCompare]   = useState(false)
  const [page, setPage]                 = useState(1)
  const isMobile = useMobile()
  const PAGE_SIZE = 6

  const toggleCompare = (slug) => {
    setCompareList(prev => {
      if (prev.includes(slug)) return prev.filter(s => s !== slug)
      if (prev.length >= 2)    return [prev[1], slug]
      return [...prev, slug]
    })
  }

  useEffect(() => {
    getTrails()
      .then(res => setTrails(res.data))
      .finally(() => setLoading(false))
  }, [])

  const difficulties = ['all', 'easy', 'moderate', 'hard', 'expert']

  const filtered = useMemo(() => {
    let list = filter === 'all' ? trails : trails.filter(t => t.difficulty === filter)
    if (search.trim()) {
      const q = search.toLowerCase()
      list = list.filter(t =>
        t.name.toLowerCase().includes(q) ||
        t.region.toLowerCase().includes(q) ||
        t.start_point.toLowerCase().includes(q)
      )
    }
    if (minDays) list = list.filter(t => t.duration_days >= Number(minDays))
    if (maxDays) list = list.filter(t => t.duration_days <= Number(maxDays))
    if (maxAlt)  list = list.filter(t => t.max_altitude_m <= Number(maxAlt))
    return list
  }, [trails, filter, search, minDays, maxDays, maxAlt])

  const hasAdvancedFilter = minDays || maxDays || maxAlt

  const totalPages = Math.ceil(filtered.length / PAGE_SIZE)
  const paginated  = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE)

  useEffect(() => { setPage(1) }, [filter, search, minDays, maxDays, maxAlt])

  return (
    <div style={{ backgroundColor: '#F7F5F0', minHeight: '100vh', fontFamily: 'DM Sans, sans-serif' }}>

      {showCompare && compareList.length === 2 && (
        <ComparePanel trails={trails} selected={compareList} onClose={() => setShowCompare(false)} />
      )}

      {/* Floating compare bar */}
      {compareList.length > 0 && (
        <div style={{ position: 'fixed', bottom: '24px', left: '50%', transform: 'translateX(-50%)', zIndex: 100, backgroundColor: '#1A3A2A', borderRadius: '24px', padding: '12px 20px', display: 'flex', alignItems: 'center', gap: '12px', boxShadow: '0 8px 32px rgba(0,0,0,0.25)' }}>
          <span style={{ fontSize: '13px', color: 'rgba(255,255,255,0.7)' }}>
            {compareList.length === 1 ? 'Select 1 more to compare' : '2 trails selected'}
          </span>
          {compareList.length === 2 && (
            <button onClick={() => setShowCompare(true)} style={{ padding: '8px 18px', borderRadius: '16px', border: 'none', backgroundColor: '#C4973A', color: '#FFF', fontSize: '13px', fontWeight: 600, cursor: 'pointer', fontFamily: 'DM Sans, sans-serif' }}>
              Compare →
            </button>
          )}
          <button onClick={() => setCompareList([])} style={{ background: 'none', border: 'none', color: 'rgba(255,255,255,0.5)', cursor: 'pointer', fontSize: '16px' }}>✕</button>
        </div>
      )}

      <Navbar>
        <Link to="/trails" style={{ fontSize: '12px', letterSpacing: '0.12em', textTransform: 'uppercase', color: 'rgba(255,255,255,0.7)', textDecoration: 'none' }}>
          Trails
        </Link>
        <Link to="/map" style={{ fontSize: '12px', letterSpacing: '0.12em', textTransform: 'uppercase', color: 'rgba(255,255,255,0.7)', textDecoration: 'none' }}>
          Map
        </Link>
      </Navbar>

      {/* ── Hero ── */}
      <div style={{
        background: 'linear-gradient(135deg, #0D2B1D 0%, #1A3A2A 50%, #2D5A3D 100%)',
        padding: isMobile ? '72px 20px 40px' : '80px 48px 64px',
      }}>
        <div style={{ maxWidth: '1100px', margin: '0 auto' }}>
          <p style={{ fontSize: '11px', letterSpacing: '0.15em', textTransform: 'uppercase', color: '#C4973A', marginBottom: '16px' }}>
            ✦ Verified Routes
          </p>
          <h1 style={{ fontFamily: 'Fraunces, serif', fontSize: isMobile ? '40px' : '64px', fontWeight: 700, color: '#FFFFFF', lineHeight: 1.05, marginBottom: '20px' }}>
            Nepal Trails
          </h1>
          <p style={{ fontSize: '17px', fontWeight: 300, color: 'rgba(255,255,255,0.6)', lineHeight: 1.7, maxWidth: '520px', marginBottom: '48px' }}>
            Honest trail data for independent trekkers. No agency upsells — just the information you need.
          </p>
          <div style={{
            display: isMobile ? 'grid' : 'flex',
            gridTemplateColumns: isMobile ? 'repeat(3, 1fr)' : undefined,
            gap: isMobile ? '12px' : '48px',
          }}>
            {[
              { value: trails.length || '—', label: 'Verified Trails' },
              { value: '18',                  label: 'Regions' },
              { value: '8,849m',              label: 'Highest Peak' },
            ].map(s => (
              <div key={s.label}>
                <p style={{ fontFamily: 'Fraunces, serif', fontSize: isMobile ? '26px' : '36px', fontWeight: 700, color: '#C4973A', lineHeight: 1 }}>
                  {s.value}
                </p>
                <p style={{ fontSize: '10px', textTransform: 'uppercase', letterSpacing: '0.1em', color: 'rgba(255,255,255,0.45)', marginTop: '6px' }}>
                  {s.label}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── Search + Filters bar ── */}
      <div style={{ backgroundColor: '#FFFFFF', borderBottom: '1px solid #E8E5E0' }}>
        <div style={{ maxWidth: '1100px', margin: '0 auto', padding: isMobile ? '12px 16px' : '14px 48px' }}>

          {/* Search row */}
          <div style={{ display: 'flex', gap: '10px', alignItems: 'center', marginBottom: '10px' }}>
            <div style={{ flex: 1, position: 'relative' }}>
              <svg style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#AAA' }}
                width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
              </svg>
              <input
                value={search}
                onChange={e => setSearch(e.target.value)}
                placeholder="Search trails, regions…"
                style={{
                  width: '100%', padding: '9px 12px 9px 34px',
                  borderRadius: '10px', border: '1px solid #E0DDD8',
                  fontSize: '13px', fontFamily: 'DM Sans, sans-serif',
                  outline: 'none', boxSizing: 'border-box', backgroundColor: '#FAFAF8',
                }}
                onFocus={e => e.target.style.borderColor = '#1A3A2A'}
                onBlur={e  => e.target.style.borderColor = '#E0DDD8'}
              />
            </div>
            <button
              onClick={() => setShowFilters(f => !f)}
              style={{
                padding: '9px 16px', borderRadius: '10px', border: '1px solid #E0DDD8',
                backgroundColor: showFilters || hasAdvancedFilter ? '#1A3A2A' : '#FAFAF8',
                color: showFilters || hasAdvancedFilter ? '#FFFFFF' : '#555',
                fontSize: '13px', fontFamily: 'DM Sans, sans-serif', cursor: 'pointer',
                display: 'flex', alignItems: 'center', gap: '6px', flexShrink: 0,
              }}
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <line x1="4" y1="6" x2="20" y2="6"/><line x1="8" y1="12" x2="16" y2="12"/><line x1="12" y1="18" x2="12" y2="18"/>
              </svg>
              Filters {hasAdvancedFilter ? '•' : ''}
            </button>
          </div>

          {/* Difficulty pills */}
          {isMobile ? (
            <div style={{ overflowX: 'auto', WebkitOverflowScrolling: 'touch', scrollbarWidth: 'none' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', width: 'max-content', paddingBottom: '4px' }}>
                <span style={{ fontSize: '12px', color: '#999', flexShrink: 0 }}>Difficulty:</span>
                {difficulties.map(d => (
                  <button key={d} onClick={() => setFilter(d)} style={{
                    padding: '5px 14px', borderRadius: '20px', fontSize: '12px',
                    textTransform: 'capitalize', border: 'none', cursor: 'pointer',
                    fontFamily: 'DM Sans, sans-serif', flexShrink: 0, whiteSpace: 'nowrap',
                    backgroundColor: filter === d ? '#1A3A2A' : '#F0EDE8',
                    color: filter === d ? '#FFFFFF' : '#555',
                  }}>{d}</button>
                ))}
                <span style={{ fontSize: '12px', color: '#BBB', paddingLeft: '6px', flexShrink: 0 }}>
                  {filtered.length} trail{filtered.length !== 1 ? 's' : ''}
                </span>
              </div>
            </div>
          ) : (
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span style={{ fontSize: '13px', color: '#999', marginRight: '4px' }}>Difficulty:</span>
              {difficulties.map(d => (
                <button key={d} onClick={() => setFilter(d)} style={{
                  padding: '6px 18px', borderRadius: '20px', fontSize: '13px',
                  textTransform: 'capitalize', border: 'none', cursor: 'pointer',
                  fontFamily: 'DM Sans, sans-serif',
                  backgroundColor: filter === d ? '#1A3A2A' : '#F0EDE8',
                  color: filter === d ? '#FFFFFF' : '#555',
                }}>{d}</button>
              ))}
              <span style={{ marginLeft: 'auto', fontSize: '13px', color: '#BBB' }}>
                {filtered.length} trail{filtered.length !== 1 ? 's' : ''}
              </span>
            </div>
          )}

          {/* Advanced filters panel */}
          {showFilters && (
            <div style={{
              display: 'flex', gap: '12px', flexWrap: 'wrap',
              marginTop: '12px', paddingTop: '12px', borderTop: '1px solid #F0EDE8',
              alignItems: 'center',
            }}>
              <span style={{ fontSize: '12px', color: '#999', flexShrink: 0 }}>Duration (days):</span>
              <input value={minDays} onChange={e => setMinDays(e.target.value)} placeholder="Min"
                type="number" min="1"
                style={{ width: '60px', padding: '6px 10px', borderRadius: '8px', border: '1px solid #DDD', fontSize: '13px', fontFamily: 'DM Sans, sans-serif', outline: 'none' }} />
              <span style={{ fontSize: '12px', color: '#BBB' }}>–</span>
              <input value={maxDays} onChange={e => setMaxDays(e.target.value)} placeholder="Max"
                type="number" min="1"
                style={{ width: '60px', padding: '6px 10px', borderRadius: '8px', border: '1px solid #DDD', fontSize: '13px', fontFamily: 'DM Sans, sans-serif', outline: 'none' }} />
              <span style={{ fontSize: '12px', color: '#999', marginLeft: '8px', flexShrink: 0 }}>Max altitude (m):</span>
              <input value={maxAlt} onChange={e => setMaxAlt(e.target.value)} placeholder="e.g. 5500"
                type="number" min="0"
                style={{ width: '90px', padding: '6px 10px', borderRadius: '8px', border: '1px solid #DDD', fontSize: '13px', fontFamily: 'DM Sans, sans-serif', outline: 'none' }} />
              {hasAdvancedFilter && (
                <button
                  onClick={() => { setMinDays(''); setMaxDays(''); setMaxAlt('') }}
                  style={{ padding: '6px 12px', borderRadius: '8px', border: 'none', backgroundColor: '#FBE9E7', color: '#BF360C', fontSize: '12px', cursor: 'pointer', fontFamily: 'DM Sans, sans-serif' }}
                >
                  Clear
                </button>
              )}
            </div>
          )}
        </div>
      </div>

      {/* ── Cards ── */}
      <div style={{ maxWidth: '1100px', margin: '0 auto', padding: isMobile ? '24px 20px' : '48px 48px' }}>
        {loading ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
            {[1, 2, 3].map(i => <TrailCardSkeleton key={i} />)}
          </div>
        ) : filtered.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '80px 0' }}>
            <p style={{ fontSize: '32px', marginBottom: '12px' }}>🏔️</p>
            <p style={{ fontSize: '16px', fontWeight: 600, color: '#1A3A2A', marginBottom: '8px' }}>No trails match your filters</p>
            <p style={{ fontSize: '14px', color: '#999' }}>Try adjusting your search or clearing the filters.</p>
          </div>
        ) : (
          <AnimatePresence mode="wait">
            <motion.div
              key={page}
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.28, ease: [0.25, 0.46, 0.45, 0.94] }}
              style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}
            >
            {paginated.map(trail => {
              const badge = DIFFICULTY_BADGE[trail.difficulty] || { bg: '#F0EDE8', color: '#555' }
              return (
                <Link
                  key={trail.id}
                  to={`/trails/${trail.slug}`}
                  style={{
                    backgroundColor: '#FFFFFF', border: '1px solid #E8E5E0',
                    borderRadius: '20px', display: 'block', textDecoration: 'none',
                    overflow: 'hidden', transition: 'transform 0.25s ease, box-shadow 0.25s ease',
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
                  {/* Hero image strip */}
                  {trail.cover_image_url && (
                    <div style={{
                      height: isMobile ? '160px' : '200px',
                      backgroundImage: `url(${trail.cover_image_url})`,
                      backgroundSize: 'cover',
                      backgroundPosition: 'center',
                      position: 'relative',
                    }}>
                      <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to bottom, rgba(0,0,0,0.1) 0%, rgba(26,58,42,0.55) 100%)' }} />
                      {/* Condition badge */}
                      {trail.condition_status && trail.condition_status !== 'open' && (
                        <span style={{
                          position: 'absolute', top: '12px', right: '12px',
                          fontSize: '11px', fontWeight: 600, padding: '4px 12px',
                          borderRadius: '20px', backdropFilter: 'blur(8px)',
                          backgroundColor: trail.condition_status === 'closed' ? 'rgba(191,54,12,0.85)' : 'rgba(245,127,23,0.85)',
                          color: '#FFFFFF',
                        }}>
                          {trail.condition_status === 'closed' ? '⛔ Closed' : '⚠ Partial'}
                        </span>
                      )}
                      {trail.condition_status === 'open' && (
                        <span style={{
                          position: 'absolute', top: '12px', right: '12px',
                          fontSize: '11px', fontWeight: 600, padding: '4px 12px',
                          borderRadius: '20px', backdropFilter: 'blur(8px)',
                          backgroundColor: 'rgba(46,125,50,0.75)', color: '#FFFFFF',
                        }}>
                          ✓ Open
                        </span>
                      )}
                    </div>
                  )}
                  <div style={{ padding: isMobile ? '20px' : '36px 40px' }}>
                    <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '20px', flexDirection: isMobile ? 'column' : undefined }}>

                      {/* Left */}
                      <div style={{ flex: 1 }}>
                        <div style={{ display: 'flex', gap: '8px', marginBottom: '12px', flexWrap: 'wrap', alignItems: 'center' }}>
                          <span style={{ fontSize: '12px', fontWeight: 500, padding: '4px 14px', borderRadius: '20px', backgroundColor: '#EAF3DE', color: '#3B6D11' }}>
                            {trail.region}
                          </span>
                          <span style={{ fontSize: '12px', fontWeight: 500, padding: '4px 14px', borderRadius: '20px', textTransform: 'capitalize', backgroundColor: badge.bg, color: badge.color }}>
                            {trail.difficulty}
                          </span>
                          {trail.avg_rating && <Stars rating={trail.avg_rating} count={trail.review_count} />}
                        </div>

                        <h2 style={{ fontFamily: 'Fraunces, serif', fontSize: '32px', fontWeight: 700, color: '#1A3A2A', lineHeight: 1.2, marginBottom: '10px' }}>
                          {trail.name}
                        </h2>

                        <p style={{ fontSize: '14px', color: '#999', marginBottom: '24px' }}>
                          Best seasons: <span style={{ color: '#555' }}>{trail.best_seasons}</span>
                        </p>

                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, auto)', gap: '0', columnGap: '32px' }}>
                          {[
                            { val: trail.duration_days, label: 'Days' },
                            { val: `${trail.max_altitude_m.toLocaleString()}m`, label: 'Max Alt' },
                            { val: trail.trek_style === 'teahouse' ? 'Teahouse' : trail.trek_style, label: 'Style' },
                          ].map(s => (
                            <div key={s.label}>
                              <p style={{ fontFamily: 'Fraunces, serif', fontSize: '16px', fontWeight: 700, color: '#1A3A2A', lineHeight: 1, textTransform: 'capitalize' }}>
                                {s.val}
                              </p>
                              <p style={{ fontSize: '10px', textTransform: 'uppercase', letterSpacing: '0.1em', color: '#BBB', marginTop: '4px' }}>
                                {s.label}
                              </p>
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* Right stat block */}
                      {!isMobile && (
                        <div style={{
                          backgroundColor: '#1A3A2A', borderRadius: '16px',
                          padding: '28px 32px', textAlign: 'center', minWidth: '130px', flexShrink: 0,
                        }}>
                          <p style={{ fontFamily: 'Fraunces, serif', fontSize: '48px', fontWeight: 700, color: '#C4973A', lineHeight: 1 }}>
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
                      )}
                    </div>

                    {/* Footer */}
                    <div style={{
                      display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                      marginTop: '28px', paddingTop: '20px', borderTop: '1px solid #F0EDE8',
                    }}>
                      <p style={{ fontSize: '13px', color: '#999' }}>
                        {trail.start_point} → {trail.end_point}
                      </p>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                        <button
                          onClick={e => { e.preventDefault(); toggleCompare(trail.slug) }}
                          style={{
                            padding: '5px 12px', borderRadius: '16px', border: '1px solid',
                            fontSize: '12px', cursor: 'pointer', fontFamily: 'DM Sans, sans-serif',
                            borderColor: compareList.includes(trail.slug) ? '#1A3A2A' : '#DDD',
                            backgroundColor: compareList.includes(trail.slug) ? '#1A3A2A' : 'transparent',
                            color: compareList.includes(trail.slug) ? '#FFFFFF' : '#888',
                          }}
                        >
                          {compareList.includes(trail.slug) ? '✓ Added' : '+ Compare'}
                        </button>
                        <span style={{ fontSize: '14px', fontWeight: 600, color: '#C4973A' }}>
                          View full trail →
                        </span>
                      </div>
                    </div>
                  </div>
                </Link>
              )
            })}
            </motion.div>
          </AnimatePresence>
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', marginTop: '48px', paddingBottom: '16px' }}>
            <button
              onClick={() => { setPage(p => p - 1); window.scrollTo(0, 0) }}
              disabled={page === 1}
              style={{
                padding: '10px 20px', borderRadius: '12px', border: '1px solid #E0DDD8',
                backgroundColor: page === 1 ? '#F5F2EE' : '#1A3A2A',
                color: page === 1 ? '#CCC' : '#FFFFFF',
                fontSize: '13px', fontFamily: 'DM Sans, sans-serif',
                cursor: page === 1 ? 'not-allowed' : 'pointer', fontWeight: 500,
              }}
            >
              ← Prev
            </button>

            {Array.from({ length: totalPages }, (_, i) => i + 1).map(n => (
              <button
                key={n}
                onClick={() => { setPage(n); window.scrollTo(0, 0) }}
                style={{
                  width: '40px', height: '40px', borderRadius: '10px',
                  border: '1px solid', cursor: 'pointer',
                  fontFamily: 'DM Sans, sans-serif', fontSize: '14px', fontWeight: 600,
                  borderColor: n === page ? '#1A3A2A' : '#E0DDD8',
                  backgroundColor: n === page ? '#1A3A2A' : '#FFFFFF',
                  color: n === page ? '#FFFFFF' : '#555',
                }}
              >
                {n}
              </button>
            ))}

            <button
              onClick={() => { setPage(p => p + 1); window.scrollTo(0, 0) }}
              disabled={page === totalPages}
              style={{
                padding: '10px 20px', borderRadius: '12px', border: '1px solid #E0DDD8',
                backgroundColor: page === totalPages ? '#F5F2EE' : '#1A3A2A',
                color: page === totalPages ? '#CCC' : '#FFFFFF',
                fontSize: '13px', fontFamily: 'DM Sans, sans-serif',
                cursor: page === totalPages ? 'not-allowed' : 'pointer', fontWeight: 500,
              }}
            >
              Next →
            </button>
          </div>
        )}

        <p style={{ textAlign: 'center', fontSize: '13px', color: '#AAA', marginTop: '8px', paddingBottom: '40px' }}>
          {filtered.length === 0 ? '' : `Showing ${(page - 1) * PAGE_SIZE + 1}–${Math.min(page * PAGE_SIZE, filtered.length)} of ${filtered.length} trails`}
        </p>
      </div>

    </div>
  )
}

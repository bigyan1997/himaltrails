import { useState, useEffect, useCallback } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import {
  getSavedTrails, unsaveTrail,
  getNote, saveNote,
  getPackingList, addPackingItem, updatePackingItem, deletePackingItem,
  getCompletedTrails,
  getTripPlans, saveTripPlan, deleteTripPlan,
} from '../services/api'
import Navbar from '../components/Navbar'
import useMobile from '../hooks/useMobile'

const CATEGORIES = ['clothing', 'gear', 'documents', 'medical', 'food', 'other']
const CAT_LABEL  = { clothing: 'Clothing', gear: 'Gear', documents: 'Documents', medical: 'Medical', food: 'Food & Water', other: 'Other' }

function getPackingSuggestions(trail) {
  const alt = trail.max_altitude_m || 0
  const days = trail.duration_days || 7
  const isHighAlt = alt > 4000
  const isVeryHigh = alt > 5000

  const suggestions = [
    { name: 'Passport + copies', category: 'documents' },
    { name: 'Travel insurance certificate', category: 'documents' },
    { name: 'TIMS card & permits', category: 'documents' },
    { name: 'Emergency contact card', category: 'documents' },
    { name: 'First aid kit', category: 'medical' },
    { name: 'Diamox (altitude sickness tablets)', category: 'medical' },
    { name: 'Ibuprofen & paracetamol', category: 'medical' },
    { name: 'Blister kit & moleskin', category: 'medical' },
    { name: 'Water purification tablets', category: 'medical' },
    { name: 'Sunscreen SPF 50+', category: 'medical' },
    { name: 'Lip balm with SPF', category: 'medical' },
    { name: 'Trekking boots (broken in)', category: 'clothing' },
    { name: 'Moisture-wicking base layers ×3', category: 'clothing' },
    { name: 'Trekking trousers ×2', category: 'clothing' },
    { name: 'Warm fleece or down jacket', category: 'clothing' },
    { name: 'Waterproof rain jacket', category: 'clothing' },
    { name: 'Wool trekking socks ×4', category: 'clothing' },
    { name: 'Sun hat + warm beanie', category: 'clothing' },
    { name: 'Trekking poles', category: 'gear' },
    { name: 'Headlamp + spare batteries', category: 'gear' },
    { name: 'Daypack (25–30L)', category: 'gear' },
    { name: 'Sleeping bag liner', category: 'gear' },
    { name: 'Offline maps (Maps.me / AllTrails)', category: 'gear' },
    { name: 'Power bank (20,000mAh)', category: 'gear' },
    { name: 'Water bottle 1L ×2', category: 'food' },
    { name: 'Energy bars / trail snacks', category: 'food' },
    { name: 'Electrolyte sachets', category: 'food' },
  ]

  if (isHighAlt) {
    suggestions.push({ name: 'Heavy down jacket (−10°C rated)', category: 'clothing' })
    suggestions.push({ name: 'Thermal base layer (merino)', category: 'clothing' })
    suggestions.push({ name: 'Balaclava', category: 'clothing' })
    suggestions.push({ name: 'Mountaineering gloves', category: 'clothing' })
    suggestions.push({ name: 'Gaiters', category: 'gear' })
  }
  if (isVeryHigh) {
    suggestions.push({ name: 'Microspikes / crampons', category: 'gear' })
    suggestions.push({ name: 'High-altitude sleeping bag (−20°C)', category: 'gear' })
    suggestions.push({ name: 'Pulse oximeter', category: 'medical' })
    suggestions.push({ name: 'Dexamethasone (emergency AMS)', category: 'medical' })
  }
  if (days > 10) {
    suggestions.push({ name: 'Laundry soap strips', category: 'other' })
    suggestions.push({ name: 'Extra memory card', category: 'gear' })
  }
  return suggestions
}

function PackingGenerator({ savedTrails, packingItems, onAdd }) {
  const [selectedSlug, setSelectedSlug] = useState(savedTrails[0]?.trail.slug || '')
  const [adding, setAdding] = useState(false)
  const [done, setDone] = useState(false)

  const trail = savedTrails.find(s => s.trail.slug === selectedSlug)?.trail
  if (!trail) return null

  const suggestions = getPackingSuggestions(trail)
  const existing = new Set(packingItems.map(i => i.name.toLowerCase()))
  const newSuggestions = suggestions.filter(s => !existing.has(s.name.toLowerCase()))

  const handleGenerate = async () => {
    if (!newSuggestions.length) { setDone(true); return }
    setAdding(true)
    for (const s of newSuggestions) await onAdd(s.name, s.category)
    setAdding(false)
    setDone(true)
  }

  return (
    <div style={{ backgroundColor: '#FFFFFF', border: '1px solid #C8E6C9', borderRadius: '16px', padding: '20px 24px', marginBottom: '24px' }}>
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '12px', flexWrap: 'wrap' }}>
        <div style={{ flex: 1 }}>
          <p style={{ fontSize: '13px', fontWeight: 700, color: '#1A3A2A', marginBottom: '4px' }}>🎒 Generate packing list for a trail</p>
          <p style={{ fontSize: '12px', color: '#888' }}>
            {newSuggestions.length > 0
              ? `${newSuggestions.length} suggested items based on ${trail.name} (${trail.max_altitude_m?.toLocaleString()}m, ${trail.duration_days}d)`
              : 'All suggested items already in your list.'}
          </p>
        </div>
        <div style={{ display: 'flex', gap: '8px', alignItems: 'center', flexShrink: 0 }}>
          <select value={selectedSlug} onChange={e => { setSelectedSlug(e.target.value); setDone(false) }}
            style={{ padding: '8px 10px', borderRadius: '8px', border: '1px solid #DDD', fontSize: '13px', fontFamily: 'DM Sans, sans-serif', outline: 'none', color: '#333', backgroundColor: '#FAFAF8', cursor: 'pointer' }}>
            {savedTrails.map(s => <option key={s.trail.slug} value={s.trail.slug}>{s.trail.name}</option>)}
          </select>
          <button onClick={handleGenerate} disabled={adding || done || !newSuggestions.length}
            style={{ padding: '8px 16px', borderRadius: '8px', border: 'none', cursor: adding || done || !newSuggestions.length ? 'not-allowed' : 'pointer', backgroundColor: done ? '#2E7D32' : '#1A3A2A', color: '#FFF', fontSize: '13px', fontWeight: 600, fontFamily: 'DM Sans, sans-serif', whiteSpace: 'nowrap' }}>
            {adding ? 'Adding…' : done ? '✓ Added' : 'Add all'}
          </button>
        </div>
      </div>
    </div>
  )
}

export default function Dashboard() {
  const { user, loading: authLoading } = useAuth()
  const navigate = useNavigate()
  const isMobile = useMobile()

  const [savedTrails,    setSavedTrails]    = useState([])
  const [completedTrails, setCompletedTrails] = useState([])
  const [tripPlans,      setTripPlans]      = useState([])
  const [packingItems,   setPackingItems]   = useState([])
  const [activeNote,     setActiveNote]     = useState(null)
  const [noteText,       setNoteText]       = useState('')
  const [noteSaving,     setNoteSaving]     = useState(false)
  const [newItem,        setNewItem]        = useState('')
  const [newCat,         setNewCat]         = useState('gear')
  const [tab,            setTab]            = useState('trails')
  const [planningSlug,   setPlanningSlug]   = useState(null)
  const [planDate,       setPlanDate]       = useState('')
  const [planSaving,     setPlanSaving]     = useState(false)

  useEffect(() => {
    if (!authLoading && !user) navigate('/login', { state: { from: '/dashboard' } })
  }, [user, authLoading, navigate])

  useEffect(() => {
    if (!user) return
    getSavedTrails().then(r => setSavedTrails(r.data))
    getPackingList().then(r => setPackingItems(r.data))
    getCompletedTrails().then(r => setCompletedTrails(r.data))
    getTripPlans().then(r => setTripPlans(r.data))
  }, [user])

  const handleUnsave = async (slug) => {
    await unsaveTrail(slug)
    setSavedTrails(t => t.filter(s => s.trail.slug !== slug))
    if (activeNote?.trail_slug === slug) setActiveNote(null)
  }

  const openNote = async (trail) => {
    const res = await getNote(trail.slug)
    setActiveNote(res.data)
    setNoteText(res.data.content || '')
  }

  const handleNoteSave = useCallback(async () => {
    if (!activeNote) return
    setNoteSaving(true)
    const res = await saveNote(activeNote.trail_slug, noteText)
    setActiveNote(res.data)
    setNoteSaving(false)
  }, [activeNote, noteText])

  const handleAddItem = async (e) => {
    e.preventDefault()
    if (!newItem.trim()) return
    const res = await addPackingItem({ name: newItem.trim(), category: newCat })
    setPackingItems(items => [...items, res.data])
    setNewItem('')
  }

  const handleToggle = async (item) => {
    const res = await updatePackingItem(item.id, { checked: !item.checked })
    setPackingItems(items => items.map(i => i.id === item.id ? res.data : i))
  }

  const handleDeleteItem = async (id) => {
    await deletePackingItem(id)
    setPackingItems(items => items.filter(i => i.id !== id))
  }

  const handleSavePlan = async (slug) => {
    if (!planDate) return
    setPlanSaving(true)
    const res = await saveTripPlan({ trail_slug: slug, start_date: planDate })
    setTripPlans(plans => {
      const exists = plans.find(p => p.trail.slug === slug)
      return exists ? plans.map(p => p.trail.slug === slug ? res.data : p) : [...plans, res.data]
    })
    setPlanningSlug(null)
    setPlanDate('')
    setPlanSaving(false)
  }

  const handleDeletePlan = async (slug) => {
    await deleteTripPlan(slug)
    setTripPlans(plans => plans.filter(p => p.trail.slug !== slug))
  }

  const groupedPacking = CATEGORIES.reduce((acc, cat) => {
    const items = packingItems.filter(i => i.category === cat)
    if (items.length) acc[cat] = items
    return acc
  }, {})

  if (authLoading) return null

  const tabStyle = (t) => ({
    padding: '10px 24px', borderRadius: '24px', border: 'none', cursor: 'pointer',
    fontSize: '13px', fontWeight: 600, fontFamily: 'DM Sans, sans-serif',
    backgroundColor: tab === t ? '#1A3A2A' : 'transparent',
    color: tab === t ? '#FFFFFF' : '#999',
    transition: 'all 0.2s',
  })

  const upcomingPlans = tripPlans.filter(p => new Date(p.start_date) >= new Date())
  const savedSlugs = new Set(savedTrails.map(s => s.trail.slug))

  return (
    <div style={{ backgroundColor: '#F7F5F0', minHeight: '100vh', fontFamily: 'DM Sans, sans-serif' }}>
      <Navbar>
        <Link to="/trails" style={{ fontSize: '12px', letterSpacing: '0.12em', textTransform: 'uppercase', color: 'rgba(255,255,255,0.7)', textDecoration: 'none' }}>
          Trails
        </Link>
      </Navbar>

      <div style={{ maxWidth: '1100px', margin: '0 auto', padding: isMobile ? '32px 16px' : '60px 24px' }}>

        {/* Header */}
        <div style={{ marginBottom: '48px' }}>
          <p style={{ fontSize: '11px', letterSpacing: '0.15em', textTransform: 'uppercase', color: '#C4973A', marginBottom: '10px' }}>
            ✦ My HimalTrails
          </p>
          <h1 style={{ fontFamily: 'Fraunces, serif', fontSize: isMobile ? '28px' : '42px', fontWeight: 700, color: '#1A3A2A', marginBottom: '6px' }}>
            {user?.display_name ? `Welcome back, ${user.display_name}` : 'Your dashboard'}
          </h1>
          <p style={{ fontSize: '14px', color: '#999' }}>
            {savedTrails.length} saved · {completedTrails.length} completed · {upcomingPlans.length} planned
          </p>
        </div>

        {/* Tabs */}
        <div style={{ display: 'flex', gap: '4px', backgroundColor: '#EDEAE4', borderRadius: '28px', padding: '4px', marginBottom: '40px', width: 'fit-content', flexWrap: 'wrap' }}>
          <button style={tabStyle('trails')}    onClick={() => setTab('trails')}>Saved Trails</button>
          <button style={tabStyle('planned')}   onClick={() => setTab('planned')}>Trip Plans</button>
          <button style={tabStyle('completed')} onClick={() => setTab('completed')}>Completed</button>
          <button style={tabStyle('packing')}   onClick={() => setTab('packing')}>Packing List</button>
        </div>

        {/* ── Saved Trails tab ── */}
        {tab === 'trails' && (
          <div style={{ display: 'flex', gap: '32px', alignItems: 'flex-start', flexDirection: isMobile ? 'column' : undefined }}>
            <div style={{ flex: 1, width: isMobile ? '100%' : undefined }}>
              {savedTrails.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '80px 24px', backgroundColor: '#FFFFFF', borderRadius: '20px', border: '1px solid #E8E5E0' }}>
                  <p style={{ fontSize: '32px', marginBottom: '12px' }}>🏔️</p>
                  <p style={{ fontSize: '16px', fontWeight: 600, color: '#1A3A2A', marginBottom: '8px' }}>No saved trails yet</p>
                  <p style={{ fontSize: '14px', color: '#999', marginBottom: '24px' }}>Browse trails and tap the bookmark to save them here.</p>
                  <Link to="/trails" style={{ display: 'inline-block', padding: '12px 28px', borderRadius: '24px', backgroundColor: '#1A3A2A', color: '#FFFFFF', textDecoration: 'none', fontSize: '14px', fontWeight: 600 }}>
                    Browse Trails
                  </Link>
                </div>
              ) : (
                <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : 'repeat(auto-fill, minmax(280px, 1fr))', gap: '16px' }}>
                  {savedTrails.map(({ trail, saved_at }) => {
                    const plan = tripPlans.find(p => p.trail.slug === trail.slug)
                    return (
                      <div key={trail.slug} style={{ backgroundColor: '#FFFFFF', borderRadius: '20px', border: '1px solid #E8E5E0', overflow: 'hidden' }}>
                        <div style={{ padding: '20px' }}>
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '10px' }}>
                            <span style={{ fontSize: '11px', letterSpacing: '0.1em', textTransform: 'uppercase', color: '#C4973A', fontWeight: 600 }}>{trail.region}</span>
                            <span style={{ fontSize: '11px', color: '#BBB' }}>{new Date(saved_at).toLocaleDateString()}</span>
                          </div>
                          <h3 style={{ fontFamily: 'Fraunces, serif', fontSize: '18px', fontWeight: 700, color: '#1A3A2A', marginBottom: '8px', lineHeight: 1.2 }}>
                            {trail.name}
                          </h3>
                          <div style={{ display: 'flex', gap: '8px', marginBottom: '12px', flexWrap: 'wrap' }}>
                            {trail.duration_days && <span style={{ fontSize: '11px', backgroundColor: '#F0EDE8', color: '#666', padding: '3px 10px', borderRadius: '12px' }}>{trail.duration_days}d</span>}
                            {trail.difficulty   && <span style={{ fontSize: '11px', backgroundColor: '#F0EDE8', color: '#666', padding: '3px 10px', borderRadius: '12px' }}>{trail.difficulty}</span>}
                            {trail.max_altitude_m && <span style={{ fontSize: '11px', backgroundColor: '#F0EDE8', color: '#666', padding: '3px 10px', borderRadius: '12px' }}>{(trail.max_altitude_m / 1000).toFixed(1)}km alt</span>}
                          </div>

                          {/* Trip plan inline */}
                          {planningSlug === trail.slug ? (
                            <div style={{ marginBottom: '12px', padding: '12px', backgroundColor: '#F7FAF7', borderRadius: '10px', border: '1px solid #C8E6C9' }}>
                              <p style={{ fontSize: '12px', color: '#2E7D32', fontWeight: 600, marginBottom: '8px' }}>Set start date</p>
                              <input type="date" value={planDate} onChange={e => setPlanDate(e.target.value)}
                                min={new Date().toISOString().slice(0,10)}
                                style={{ width: '100%', padding: '8px 10px', borderRadius: '8px', border: '1px solid #DDD', fontSize: '13px', fontFamily: 'DM Sans, sans-serif', outline: 'none', boxSizing: 'border-box', marginBottom: '8px' }} />
                              <div style={{ display: 'flex', gap: '6px' }}>
                                <button onClick={() => handleSavePlan(trail.slug)} disabled={planSaving || !planDate}
                                  style={{ flex: 1, padding: '8px', borderRadius: '8px', border: 'none', backgroundColor: '#1A3A2A', color: '#FFF', fontSize: '12px', fontWeight: 600, cursor: 'pointer', fontFamily: 'DM Sans, sans-serif' }}>
                                  {planSaving ? 'Saving…' : 'Save plan'}
                                </button>
                                <button onClick={() => { setPlanningSlug(null); setPlanDate('') }}
                                  style={{ padding: '8px 12px', borderRadius: '8px', border: '1px solid #DDD', backgroundColor: '#FFF', fontSize: '12px', cursor: 'pointer', fontFamily: 'DM Sans, sans-serif' }}>
                                  Cancel
                                </button>
                              </div>
                            </div>
                          ) : plan ? (
                            <div style={{ marginBottom: '12px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '8px 12px', backgroundColor: '#F7FAF7', borderRadius: '10px', border: '1px solid #C8E6C9' }}>
                              <div>
                                <p style={{ fontSize: '11px', color: '#2E7D32', fontWeight: 600 }}>Planned</p>
                                <p style={{ fontSize: '13px', color: '#1A3A2A', fontWeight: 500 }}>{new Date(plan.start_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</p>
                              </div>
                              <div style={{ display: 'flex', gap: '6px' }}>
                                <button onClick={() => { setPlanningSlug(trail.slug); setPlanDate(plan.start_date) }}
                                  style={{ padding: '5px 10px', borderRadius: '8px', border: '1px solid #DDD', backgroundColor: '#FFF', fontSize: '11px', cursor: 'pointer', fontFamily: 'DM Sans, sans-serif', color: '#555' }}>Edit</button>
                                <button onClick={() => handleDeletePlan(trail.slug)}
                                  style={{ padding: '5px 8px', borderRadius: '8px', border: '1px solid #FFCCBC', backgroundColor: '#FFF5F3', fontSize: '11px', cursor: 'pointer', color: '#BF360C' }}>✕</button>
                              </div>
                            </div>
                          ) : null}

                          <div style={{ display: 'flex', gap: '8px' }}>
                            <Link to={`/trails/${trail.slug}`} style={{ flex: 1, textAlign: 'center', padding: '9px', borderRadius: '10px', backgroundColor: '#1A3A2A', color: '#FFFFFF', textDecoration: 'none', fontSize: '13px', fontWeight: 600 }}>
                              View
                            </Link>
                            <button onClick={() => openNote(trail)}
                              style={{ flex: 1, padding: '9px', borderRadius: '10px', border: '1px solid #DDD', backgroundColor: '#FFFFFF', color: '#555', fontSize: '13px', fontWeight: 500, cursor: 'pointer', fontFamily: 'DM Sans, sans-serif' }}>
                              Notes
                            </button>
                            {!plan && (
                              <button onClick={() => { setPlanningSlug(trail.slug); setPlanDate('') }}
                                style={{ padding: '9px 10px', borderRadius: '10px', border: '1px solid #C8E6C9', backgroundColor: '#F7FAF7', color: '#2E7D32', fontSize: '12px', cursor: 'pointer', fontFamily: 'DM Sans, sans-serif' }}>
                                📅
                              </button>
                            )}
                            <button onClick={() => handleUnsave(trail.slug)} title="Remove"
                              style={{ padding: '9px 12px', borderRadius: '10px', border: '1px solid #FFCCBC', backgroundColor: '#FFF5F3', color: '#BF360C', fontSize: '13px', cursor: 'pointer' }}>
                              ✕
                            </button>
                          </div>
                        </div>
                      </div>
                    )
                  })}
                </div>
              )}
            </div>

            {/* Notes panel */}
            {activeNote && (
              <div style={{ width: isMobile ? '100%' : '340px', flexShrink: 0, backgroundColor: '#FFFFFF', borderRadius: '20px', border: '1px solid #E8E5E0', padding: '24px', position: isMobile ? undefined : 'sticky', top: isMobile ? undefined : '80px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                  <div>
                    <p style={{ fontSize: '11px', color: '#C4973A', textTransform: 'uppercase', letterSpacing: '0.1em', fontWeight: 600 }}>Trip notes</p>
                    <p style={{ fontSize: '15px', fontWeight: 700, color: '#1A3A2A', fontFamily: 'Fraunces, serif' }}>{activeNote.trail_name}</p>
                  </div>
                  <button onClick={() => setActiveNote(null)} style={{ background: 'none', border: 'none', fontSize: '18px', color: '#AAA', cursor: 'pointer' }}>✕</button>
                </div>
                <textarea value={noteText} onChange={e => setNoteText(e.target.value)}
                  placeholder="Gear notes, questions, reminders…"
                  style={{ width: '100%', minHeight: '200px', padding: '14px', borderRadius: '12px', border: '1px solid #DDD', fontSize: '14px', fontFamily: 'DM Sans, sans-serif', resize: 'vertical', outline: 'none', boxSizing: 'border-box', lineHeight: 1.6, color: '#333' }}
                  onFocus={e => e.target.style.borderColor = '#C4973A'}
                  onBlur={e  => e.target.style.borderColor = '#DDD'} />
                <button onClick={handleNoteSave} disabled={noteSaving}
                  style={{ marginTop: '12px', width: '100%', padding: '12px', borderRadius: '10px', border: 'none', backgroundColor: noteSaving ? '#9FB89F' : '#1A3A2A', color: '#FFFFFF', fontSize: '14px', fontWeight: 600, fontFamily: 'DM Sans, sans-serif', cursor: noteSaving ? 'not-allowed' : 'pointer' }}>
                  {noteSaving ? 'Saving…' : 'Save note'}
                </button>
              </div>
            )}
          </div>
        )}

        {/* ── Trip Plans tab ── */}
        {tab === 'planned' && (
          <div>
            {tripPlans.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '80px 24px', backgroundColor: '#FFFFFF', borderRadius: '20px', border: '1px solid #E8E5E0' }}>
                <p style={{ fontSize: '32px', marginBottom: '12px' }}>📅</p>
                <p style={{ fontSize: '16px', fontWeight: 600, color: '#1A3A2A', marginBottom: '8px' }}>No trips planned yet</p>
                <p style={{ fontSize: '14px', color: '#999', marginBottom: '24px' }}>Save a trail first, then tap the calendar icon to set your start date.</p>
                <Link to="/trails" style={{ display: 'inline-block', padding: '12px 28px', borderRadius: '24px', backgroundColor: '#1A3A2A', color: '#FFFFFF', textDecoration: 'none', fontSize: '14px', fontWeight: 600 }}>Browse Trails</Link>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                {tripPlans.sort((a, b) => new Date(a.start_date) - new Date(b.start_date)).map(plan => {
                  const start = new Date(plan.start_date)
                  const end   = new Date(plan.end_date)
                  const isPast = end < new Date()
                  const daysUntil = Math.ceil((start - new Date()) / 86400000)
                  return (
                    <div key={plan.id} style={{ backgroundColor: '#FFFFFF', border: `1px solid ${isPast ? '#E8E5E0' : '#C8E6C9'}`, borderRadius: '20px', padding: isMobile ? '20px' : '24px 32px', display: 'flex', gap: '24px', alignItems: 'flex-start', flexDirection: isMobile ? 'column' : 'row', opacity: isPast ? 0.6 : 1 }}>
                      <div style={{ backgroundColor: isPast ? '#F0EDE8' : '#1A3A2A', borderRadius: '14px', padding: '16px 20px', textAlign: 'center', flexShrink: 0, minWidth: '80px' }}>
                        <p style={{ fontFamily: 'Fraunces, serif', fontSize: '28px', fontWeight: 700, color: isPast ? '#AAA' : '#C4973A', lineHeight: 1 }}>
                          {start.getDate()}
                        </p>
                        <p style={{ fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.1em', color: isPast ? '#BBB' : 'rgba(255,255,255,0.5)', marginTop: '4px' }}>
                          {start.toLocaleDateString('en-US', { month: 'short', year: 'numeric' })}
                        </p>
                      </div>
                      <div style={{ flex: 1 }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px', flexWrap: 'wrap' }}>
                          {!isPast && daysUntil > 0 && (
                            <span style={{ fontSize: '11px', backgroundColor: '#EAF3DE', color: '#2E7D32', padding: '3px 10px', borderRadius: '20px', fontWeight: 600 }}>
                              {daysUntil} day{daysUntil !== 1 ? 's' : ''} away
                            </span>
                          )}
                          {isPast && <span style={{ fontSize: '11px', backgroundColor: '#F0EDE8', color: '#AAA', padding: '3px 10px', borderRadius: '20px' }}>Completed</span>}
                        </div>
                        <h3 style={{ fontFamily: 'Fraunces, serif', fontSize: '20px', fontWeight: 700, color: '#1A3A2A', marginBottom: '4px' }}>
                          {plan.trail.name}
                        </h3>
                        <p style={{ fontSize: '13px', color: '#888', marginBottom: '12px' }}>
                          {start.toLocaleDateString('en-US', { weekday: 'short', month: 'long', day: 'numeric' })} → {end.toLocaleDateString('en-US', { weekday: 'short', month: 'long', day: 'numeric' })} · {plan.trail.duration_days} days
                        </p>
                        <div style={{ display: 'flex', gap: '8px' }}>
                          <Link to={`/trails/${plan.trail.slug}`} style={{ padding: '8px 16px', borderRadius: '10px', backgroundColor: '#1A3A2A', color: '#FFF', textDecoration: 'none', fontSize: '13px', fontWeight: 600 }}>
                            View trail
                          </Link>
                          <button onClick={() => handleDeletePlan(plan.trail.slug)}
                            style={{ padding: '8px 12px', borderRadius: '10px', border: '1px solid #FFCCBC', backgroundColor: '#FFF5F3', color: '#BF360C', fontSize: '13px', cursor: 'pointer' }}>
                            Remove
                          </button>
                        </div>
                      </div>
                    </div>
                  )
                })}
              </div>
            )}
          </div>
        )}

        {/* ── Completed Trails tab ── */}
        {tab === 'completed' && (
          <div>
            {completedTrails.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '80px 24px', backgroundColor: '#FFFFFF', borderRadius: '20px', border: '1px solid #E8E5E0' }}>
                <p style={{ fontSize: '32px', marginBottom: '12px' }}>🏔</p>
                <p style={{ fontSize: '16px', fontWeight: 600, color: '#1A3A2A', marginBottom: '8px' }}>No completed treks yet</p>
                <p style={{ fontSize: '14px', color: '#999', marginBottom: '24px' }}>Mark a trail as completed from the trail page to log it here.</p>
                <Link to="/trails" style={{ display: 'inline-block', padding: '12px 28px', borderRadius: '24px', backgroundColor: '#1A3A2A', color: '#FFFFFF', textDecoration: 'none', fontSize: '14px', fontWeight: 600 }}>Browse Trails</Link>
              </div>
            ) : (
              <>
                <div style={{ marginBottom: '24px', padding: '16px 20px', backgroundColor: '#1A3A2A', borderRadius: '16px', display: 'flex', alignItems: 'center', gap: '16px' }}>
                  <span style={{ fontFamily: 'Fraunces, serif', fontSize: '40px', fontWeight: 700, color: '#C4973A' }}>{completedTrails.length}</span>
                  <div>
                    <p style={{ fontSize: '14px', fontWeight: 600, color: '#FFFFFF' }}>Trek{completedTrails.length !== 1 ? 's' : ''} completed</p>
                    <p style={{ fontSize: '12px', color: 'rgba(255,255,255,0.45)' }}>
                      {completedTrails.reduce((s, c) => s + c.trail.duration_days, 0)} total days on trail
                    </p>
                  </div>
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : 'repeat(auto-fill, minmax(280px, 1fr))', gap: '16px' }}>
                  {completedTrails.map(({ trail, completed_at }) => (
                    <div key={trail.slug} style={{ backgroundColor: '#FFFFFF', borderRadius: '20px', border: '1px solid #E8E5E0', padding: '20px', position: 'relative' }}>
                      <span style={{ position: 'absolute', top: '16px', right: '16px', fontSize: '11px', backgroundColor: '#EAF3DE', color: '#2E7D32', padding: '3px 10px', borderRadius: '20px', fontWeight: 600 }}>
                        ✓ Done
                      </span>
                      <p style={{ fontSize: '11px', color: '#C4973A', textTransform: 'uppercase', letterSpacing: '0.1em', fontWeight: 600, marginBottom: '6px' }}>{trail.region}</p>
                      <h3 style={{ fontFamily: 'Fraunces, serif', fontSize: '18px', fontWeight: 700, color: '#1A3A2A', marginBottom: '6px', lineHeight: 1.2 }}>
                        {trail.name}
                      </h3>
                      <p style={{ fontSize: '12px', color: '#AAA', marginBottom: '12px' }}>
                        Completed {new Date(completed_at).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
                      </p>
                      <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', marginBottom: '12px' }}>
                        {trail.duration_days && <span style={{ fontSize: '11px', backgroundColor: '#F0EDE8', color: '#666', padding: '3px 10px', borderRadius: '12px' }}>{trail.duration_days}d</span>}
                        {trail.max_altitude_m && <span style={{ fontSize: '11px', backgroundColor: '#F0EDE8', color: '#666', padding: '3px 10px', borderRadius: '12px' }}>{trail.max_altitude_m.toLocaleString()}m</span>}
                      </div>
                      <Link to={`/trails/${trail.slug}`} style={{ display: 'block', textAlign: 'center', padding: '9px', borderRadius: '10px', backgroundColor: '#F0EDE8', color: '#1A3A2A', textDecoration: 'none', fontSize: '13px', fontWeight: 600 }}>
                        View trail
                      </Link>
                    </div>
                  ))}
                </div>
              </>
            )}
          </div>
        )}

        {/* ── Packing List tab ── */}
        {tab === 'packing' && (
          <div style={{ maxWidth: '680px' }}>

            {/* Trail-aware generator */}
            {savedTrails.length > 0 && (
              <PackingGenerator savedTrails={savedTrails} packingItems={packingItems} onAdd={async (name, cat) => {
                const res = await addPackingItem({ name, category: cat })
                setPackingItems(items => [...items, res.data])
              }} />
            )}

            <form onSubmit={handleAddItem} style={{ display: 'flex', gap: '10px', marginBottom: '32px', flexDirection: isMobile ? 'column' : undefined }}>
              <input value={newItem} onChange={e => setNewItem(e.target.value)} placeholder="Add an item…"
                style={{ flex: 1, padding: '13px 18px', borderRadius: '12px', border: '1px solid #DDD', fontSize: '15px', fontFamily: 'DM Sans, sans-serif', outline: 'none', backgroundColor: '#FFFFFF' }}
                onFocus={e => e.target.style.borderColor = '#C4973A'}
                onBlur={e  => e.target.style.borderColor = '#DDD'} />
              <select value={newCat} onChange={e => setNewCat(e.target.value)}
                style={{ padding: '13px 14px', borderRadius: '12px', border: '1px solid #DDD', fontSize: '13px', fontFamily: 'DM Sans, sans-serif', outline: 'none', backgroundColor: '#FFFFFF', color: '#555', cursor: 'pointer' }}>
                {CATEGORIES.map(c => <option key={c} value={c}>{CAT_LABEL[c]}</option>)}
              </select>
              <button type="submit" style={{ padding: '13px 22px', borderRadius: '12px', border: 'none', backgroundColor: '#1A3A2A', color: '#FFFFFF', fontSize: '15px', fontWeight: 600, fontFamily: 'DM Sans, sans-serif', cursor: 'pointer' }}>Add</button>
            </form>

            {Object.keys(groupedPacking).length === 0 ? (
              <div style={{ textAlign: 'center', padding: '60px 24px', backgroundColor: '#FFFFFF', borderRadius: '20px', border: '1px solid #E8E5E0' }}>
                <p style={{ fontSize: '32px', marginBottom: '12px' }}>🎒</p>
                <p style={{ fontSize: '16px', fontWeight: 600, color: '#1A3A2A', marginBottom: '8px' }}>Your packing list is empty</p>
                <p style={{ fontSize: '14px', color: '#999' }}>Add items above to start building your kit.</p>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
                {Object.entries(groupedPacking).map(([cat, items]) => (
                  <div key={cat}>
                    <p style={{ fontSize: '11px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.12em', color: '#C4973A', marginBottom: '10px' }}>
                      {CAT_LABEL[cat]}
                      <span style={{ marginLeft: '8px', color: '#BBB', fontWeight: 400 }}>{items.filter(i => i.checked).length}/{items.length}</span>
                    </p>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                      {items.map(item => (
                        <div key={item.id} style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '13px 16px', borderRadius: '12px', backgroundColor: item.checked ? '#F7FAF7' : '#FFFFFF', border: `1px solid ${item.checked ? '#C8E6C9' : '#E8E5E0'}`, transition: 'all 0.15s' }}>
                          <button onClick={() => handleToggle(item)} style={{ width: '20px', height: '20px', borderRadius: '6px', flexShrink: 0, border: `2px solid ${item.checked ? '#2E7D32' : '#CCC'}`, backgroundColor: item.checked ? '#2E7D32' : 'transparent', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                            {item.checked && <span style={{ color: '#FFF', fontSize: '11px', fontWeight: 700 }}>✓</span>}
                          </button>
                          <span style={{ flex: 1, fontSize: '14px', color: item.checked ? '#999' : '#333', textDecoration: item.checked ? 'line-through' : 'none' }}>{item.name}</span>
                          <button onClick={() => handleDeleteItem(item.id)} style={{ background: 'none', border: 'none', color: '#CCC', cursor: 'pointer', fontSize: '16px', lineHeight: 1, padding: '2px 4px' }}
                            onMouseEnter={e => e.target.style.color = '#BF360C'}
                            onMouseLeave={e => e.target.style.color = '#CCC'}>✕</button>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}

                {packingItems.length > 0 && (() => {
                  const pct = Math.round(packingItems.filter(i => i.checked).length / packingItems.length * 100)
                  return (
                    <div style={{ marginTop: '8px', padding: '16px 20px', backgroundColor: '#FFFFFF', borderRadius: '14px', border: '1px solid #E8E5E0' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                        <span style={{ fontSize: '13px', color: '#555', fontWeight: 500 }}>Overall progress</span>
                        <span style={{ fontSize: '13px', color: '#1A3A2A', fontWeight: 700 }}>{pct}%</span>
                      </div>
                      <div style={{ height: '6px', backgroundColor: '#F0EDE8', borderRadius: '3px' }}>
                        <div style={{ height: '100%', width: `${pct}%`, backgroundColor: pct === 100 ? '#2E7D32' : '#C4973A', borderRadius: '3px', transition: 'width 0.3s' }} />
                      </div>
                    </div>
                  )
                })()}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}

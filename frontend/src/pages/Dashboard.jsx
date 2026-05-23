import { useState, useEffect, useCallback } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import {
  getSavedTrails, unsaveTrail,
  getNote, saveNote,
  getPackingList, addPackingItem, updatePackingItem, deletePackingItem,
  getCompletedTrails,
  getTripPlans, saveTripPlan, deleteTripPlan,
  getSafetyCheckIns, checkinSafe, deleteSafetyCheckIn,
  getUserPermits, addUserPermit, deleteUserPermit,
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
    try {
      for (const s of newSuggestions) await onAdd(s.name, s.category)
      setDone(true)
    } finally {
      setAdding(false)
    }
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
  const [safetyCheckins, setSafetyCheckins] = useState([])
  const [userPermits,    setUserPermits]    = useState([])
  const [permitForm,     setPermitForm]     = useState({ permit_name: '', permit_number: '', permit_type: 'tims', issued_date: '', expiry_date: '', trail_slug: '', notes: '' })
  const [permitSaving,   setPermitSaving]   = useState(false)
  const [showPermitForm, setShowPermitForm] = useState(false)

  useEffect(() => {
    if (!authLoading && !user) navigate('/login', { state: { from: '/dashboard' } })
  }, [user, authLoading, navigate])

  useEffect(() => {
    if (!user) return
    getSavedTrails().then(r => setSavedTrails(r.data)).catch(() => {})
    getPackingList().then(r => setPackingItems(r.data)).catch(() => {})
    getCompletedTrails().then(r => setCompletedTrails(r.data)).catch(() => {})
    getTripPlans().then(r => setTripPlans(r.data)).catch(() => {})
    getSafetyCheckIns().then(r => setSafetyCheckins(r.data)).catch(() => {})
    getUserPermits().then(r => setUserPermits(r.data)).catch(() => {})
  }, [user])

  const handleUnsave = async (slug) => {
    try {
      await unsaveTrail(slug)
      setSavedTrails(t => t.filter(s => s.trail.slug !== slug))
      if (activeNote?.trail_slug === slug) setActiveNote(null)
    } catch (_) {}
  }

  const openNote = async (trail) => {
    try {
      const res = await getNote(trail.slug)
      setActiveNote(res.data)
      setNoteText(res.data.content || '')
    } catch (_) {}
  }

  const handleNoteSave = useCallback(async () => {
    if (!activeNote) return
    setNoteSaving(true)
    try {
      const res = await saveNote(activeNote.trail_slug, noteText)
      setActiveNote(res.data)
    } catch (_) {
    } finally {
      setNoteSaving(false)
    }
  }, [activeNote, noteText])

  const handleAddItem = async (e) => {
    e.preventDefault()
    if (!newItem.trim()) return
    try {
      const res = await addPackingItem({ name: newItem.trim(), category: newCat })
      setPackingItems(items => [...items, res.data])
      setNewItem('')
    } catch (_) {}
  }

  const handleToggle = async (item) => {
    try {
      const res = await updatePackingItem(item.id, { checked: !item.checked })
      setPackingItems(items => items.map(i => i.id === item.id ? res.data : i))
    } catch (_) {}
  }

  const handleDeleteItem = async (id) => {
    try {
      await deletePackingItem(id)
      setPackingItems(items => items.filter(i => i.id !== id))
    } catch (_) {}
  }

  const handleSavePlan = async (slug) => {
    if (!planDate) return
    setPlanSaving(true)
    try {
      const res = await saveTripPlan({ trail_slug: slug, start_date: planDate })
      setTripPlans(plans => {
        const exists = plans.find(p => p.trail.slug === slug)
        return exists ? plans.map(p => p.trail.slug === slug ? res.data : p) : [...plans, res.data]
      })
      setPlanningSlug(null)
      setPlanDate('')
    } catch (_) {
    } finally {
      setPlanSaving(false)
    }
  }

  const handleDeletePlan = async (slug) => {
    try {
      await deleteTripPlan(slug)
      setTripPlans(plans => plans.filter(p => p.trail.slug !== slug))
    } catch (_) {}
  }

  const handleCheckinSafe = async (id) => {
    try {
      const res = await checkinSafe(id)
      setSafetyCheckins(cs => cs.map(c => c.id === id ? res.data : c))
    } catch (_) {}
  }

  const handleDeleteCheckin = async (id) => {
    try {
      await deleteSafetyCheckIn(id)
      setSafetyCheckins(cs => cs.filter(c => c.id !== id))
    } catch (_) {}
  }

  const handleAddPermit = async (e) => {
    e.preventDefault()
    setPermitSaving(true)
    try {
      const res = await addUserPermit(permitForm)
      setUserPermits(ps => [...ps, res.data])
      setPermitForm({ permit_name: '', permit_number: '', permit_type: 'tims', issued_date: '', expiry_date: '', trail_slug: '', notes: '' })
      setShowPermitForm(false)
    } catch (_) {
    } finally {
      setPermitSaving(false)
    }
  }

  const handleDeletePermit = async (id) => {
    try {
      await deleteUserPermit(id)
      setUserPermits(ps => ps.filter(p => p.id !== id))
    } catch (_) {}
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

  const todayStr = new Date().toISOString().slice(0, 10)
  const upcomingPlans = tripPlans.filter(p => p.start_date >= todayStr)
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
          <button style={tabStyle('permits')}   onClick={() => setTab('permits')}>My Permits</button>
          <button style={tabStyle('safety')}    onClick={() => setTab('safety')}>Safety</button>
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
                {[...tripPlans].sort((a, b) => a.start_date.localeCompare(b.start_date)).map(plan => {
                  const start = new Date(plan.start_date + 'T00:00:00')
                  const end   = new Date(plan.end_date   + 'T00:00:00')
                  const today = new Date(); today.setHours(0, 0, 0, 0)
                  const isPast = end < today
                  const daysUntil = Math.ceil((start - today) / 86400000)
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
                        {completed_at ? `Completed ${new Date(completed_at).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}` : 'Completed'}
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

        {/* ── My Permits tab ── */}
        {tab === 'permits' && (
          <div style={{ maxWidth: '760px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px', flexWrap: 'wrap', gap: '12px' }}>
              <p style={{ fontSize: '14px', color: '#888' }}>{userPermits.length} permit{userPermits.length !== 1 ? 's' : ''} stored</p>
              <button onClick={() => setShowPermitForm(v => !v)}
                style={{ padding: '10px 20px', borderRadius: '24px', border: 'none', backgroundColor: '#1A3A2A', color: '#FFF', fontSize: '13px', fontWeight: 600, cursor: 'pointer', fontFamily: 'DM Sans, sans-serif' }}>
                {showPermitForm ? 'Cancel' : '+ Add permit'}
              </button>
            </div>

            {showPermitForm && (
              <form onSubmit={handleAddPermit} style={{ backgroundColor: '#FFFFFF', border: '1px solid #C8E6C9', borderRadius: '20px', padding: '24px', marginBottom: '24px' }}>
                <p style={{ fontSize: '13px', fontWeight: 700, color: '#1A3A2A', marginBottom: '16px' }}>New permit</p>
                <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr', gap: '10px', marginBottom: '10px' }}>
                  {[
                    { key: 'permit_name',   label: 'Permit name',   type: 'text', required: true  },
                    { key: 'permit_number', label: 'Permit number',  type: 'text', required: false },
                    { key: 'issued_date',   label: 'Issue date',     type: 'date', required: true  },
                    { key: 'expiry_date',   label: 'Expiry date',    type: 'date', required: true  },
                  ].map(f => (
                    <div key={f.key}>
                      <label style={{ display: 'block', fontSize: '11px', color: '#888', marginBottom: '4px' }}>{f.label}</label>
                      <input type={f.type} required={f.required} value={permitForm[f.key]}
                        onChange={e => setPermitForm(p => ({ ...p, [f.key]: e.target.value }))}
                        style={{ width: '100%', padding: '10px 12px', borderRadius: '10px', border: '1px solid #DDD', fontSize: '13px', fontFamily: 'DM Sans, sans-serif', outline: 'none', boxSizing: 'border-box' }}
                        onFocus={e => e.target.style.borderColor = '#C4973A'}
                        onBlur={e  => e.target.style.borderColor = '#DDD'} />
                    </div>
                  ))}
                  <div>
                    <label style={{ display: 'block', fontSize: '11px', color: '#888', marginBottom: '4px' }}>Permit type</label>
                    <select value={permitForm.permit_type} onChange={e => setPermitForm(p => ({ ...p, permit_type: e.target.value }))}
                      style={{ width: '100%', padding: '10px 12px', borderRadius: '10px', border: '1px solid #DDD', fontSize: '13px', fontFamily: 'DM Sans, sans-serif', outline: 'none', boxSizing: 'border-box', backgroundColor: '#FFF', cursor: 'pointer' }}>
                      {[['tims','TIMS Card'],['national_park','National Park'],['conservation','Conservation Area'],['restricted','Restricted Area'],['municipal','Municipality']].map(([v,l]) => (
                        <option key={v} value={v}>{l}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label style={{ display: 'block', fontSize: '11px', color: '#888', marginBottom: '4px' }}>Trail (optional)</label>
                    <select value={permitForm.trail_slug} onChange={e => setPermitForm(p => ({ ...p, trail_slug: e.target.value }))}
                      style={{ width: '100%', padding: '10px 12px', borderRadius: '10px', border: '1px solid #DDD', fontSize: '13px', fontFamily: 'DM Sans, sans-serif', outline: 'none', boxSizing: 'border-box', backgroundColor: '#FFF', cursor: 'pointer' }}>
                      <option value="">No specific trail</option>
                      {savedTrails.map(s => <option key={s.trail.slug} value={s.trail.slug}>{s.trail.name}</option>)}
                    </select>
                  </div>
                </div>
                <button type="submit" disabled={permitSaving}
                  style={{ padding: '10px 24px', borderRadius: '10px', border: 'none', backgroundColor: permitSaving ? '#9FB89F' : '#1A3A2A', color: '#FFF', fontSize: '13px', fontWeight: 600, cursor: permitSaving ? 'not-allowed' : 'pointer', fontFamily: 'DM Sans, sans-serif' }}>
                  {permitSaving ? 'Saving…' : 'Save permit'}
                </button>
              </form>
            )}

            {userPermits.length === 0 && !showPermitForm ? (
              <div style={{ textAlign: 'center', padding: '80px 24px', backgroundColor: '#FFFFFF', borderRadius: '20px', border: '1px solid #E8E5E0' }}>
                <p style={{ fontSize: '32px', marginBottom: '12px' }}>📄</p>
                <p style={{ fontSize: '16px', fontWeight: 600, color: '#1A3A2A', marginBottom: '8px' }}>No permits stored yet</p>
                <p style={{ fontSize: '14px', color: '#999' }}>Store your TIMS card, national park entry, and conservation permits here to keep them in one place.</p>
              </div>
            ) : userPermits.length > 0 ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                {userPermits.map(p => {
                  const expired = p.is_expired
                  const expDate = new Date(p.expiry_date + 'T00:00:00')
                  const daysLeft = Math.ceil((expDate - new Date()) / 86400000)
                  return (
                    <div key={p.id} style={{ backgroundColor: '#FFFFFF', border: `1px solid ${expired ? '#FFCCBC' : '#E8E5E0'}`, borderRadius: '16px', padding: '18px 22px', display: 'flex', gap: '16px', alignItems: 'flex-start', opacity: expired ? 0.75 : 1 }}>
                      <div style={{ flex: 1 }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px', flexWrap: 'wrap' }}>
                          <p style={{ fontSize: '15px', fontWeight: 700, color: '#1A3A2A' }}>{p.permit_name}</p>
                          {expired
                            ? <span style={{ fontSize: '10px', fontWeight: 700, padding: '2px 8px', borderRadius: '12px', backgroundColor: '#FBE9E7', color: '#BF360C' }}>EXPIRED</span>
                            : daysLeft <= 30
                            ? <span style={{ fontSize: '10px', fontWeight: 700, padding: '2px 8px', borderRadius: '12px', backgroundColor: '#FFF8E1', color: '#F57F17' }}>Expires in {daysLeft}d</span>
                            : <span style={{ fontSize: '10px', fontWeight: 700, padding: '2px 8px', borderRadius: '12px', backgroundColor: '#E8F5E9', color: '#2E7D32' }}>Valid</span>
                          }
                        </div>
                        <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap' }}>
                          {p.permit_number && <p style={{ fontSize: '12px', color: '#888' }}>#{p.permit_number}</p>}
                          <p style={{ fontSize: '12px', color: '#888' }}>Issued {new Date(p.issued_date + 'T00:00:00').toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</p>
                          <p style={{ fontSize: '12px', color: expired ? '#BF360C' : '#888' }}>Expires {expDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</p>
                          {p.trail_name && <p style={{ fontSize: '12px', color: '#C4973A', fontWeight: 600 }}>{p.trail_name}</p>}
                        </div>
                      </div>
                      <button onClick={() => handleDeletePermit(p.id)}
                        style={{ padding: '6px 10px', borderRadius: '8px', border: '1px solid #FFCCBC', backgroundColor: '#FFF5F3', color: '#BF360C', fontSize: '12px', cursor: 'pointer', flexShrink: 0 }}>✕</button>
                    </div>
                  )
                })}
              </div>
            ) : null}
          </div>
        )}

        {/* ── Safety tab ── */}
        {tab === 'safety' && (
          <div style={{ maxWidth: '760px' }}>
            <p style={{ fontSize: '14px', color: '#888', marginBottom: '32px' }}>
              Active safety check-ins register your trek dates and emergency contact. Mark yourself as safe when you return.
            </p>
            {safetyCheckins.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '80px 24px', backgroundColor: '#FFFFFF', borderRadius: '20px', border: '1px solid #E8E5E0' }}>
                <p style={{ fontSize: '32px', marginBottom: '12px' }}>🛡️</p>
                <p style={{ fontSize: '16px', fontWeight: 600, color: '#1A3A2A', marginBottom: '8px' }}>No active check-ins</p>
                <p style={{ fontSize: '14px', color: '#999', marginBottom: '24px' }}>Register a safety check-in from any trail page before you depart.</p>
                <Link to="/trails" style={{ display: 'inline-block', padding: '12px 28px', borderRadius: '24px', backgroundColor: '#1A3A2A', color: '#FFFFFF', textDecoration: 'none', fontSize: '14px', fontWeight: 600 }}>Browse Trails</Link>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                {safetyCheckins.map(c => {
                  const overdue = c.is_overdue
                  return (
                    <div key={c.id} style={{ backgroundColor: '#FFFFFF', border: `1px solid ${overdue ? '#FFCCBC' : c.checked_in ? '#C8E6C9' : '#E8E5E0'}`, borderRadius: '20px', padding: isMobile ? '18px' : '22px 28px' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '12px', gap: '12px', flexWrap: 'wrap' }}>
                        <div>
                          <p style={{ fontSize: '11px', color: '#C4973A', textTransform: 'uppercase', letterSpacing: '0.1em', fontWeight: 600, marginBottom: '4px' }}>{c.trail_name}</p>
                          <p style={{ fontSize: '13px', color: '#555' }}>Emergency contact: <strong style={{ color: '#1A3A2A' }}>{c.emergency_name}</strong> · {c.emergency_email}</p>
                        </div>
                        {c.checked_in
                          ? <span style={{ fontSize: '11px', fontWeight: 700, padding: '4px 12px', borderRadius: '20px', backgroundColor: '#E8F5E9', color: '#2E7D32', flexShrink: 0 }}>✓ Safe</span>
                          : overdue
                          ? <span style={{ fontSize: '11px', fontWeight: 700, padding: '4px 12px', borderRadius: '20px', backgroundColor: '#FBE9E7', color: '#BF360C', flexShrink: 0 }}>OVERDUE</span>
                          : <span style={{ fontSize: '11px', fontWeight: 700, padding: '4px 12px', borderRadius: '20px', backgroundColor: '#EAF3DE', color: '#2E7D32', flexShrink: 0 }}>Active</span>
                        }
                      </div>
                      <div style={{ display: 'flex', gap: '20px', marginBottom: '14px', flexWrap: 'wrap' }}>
                        <div><p style={{ fontSize: '11px', color: '#AAA' }}>Trek start</p><p style={{ fontSize: '13px', fontWeight: 600, color: '#1A3A2A' }}>{new Date(c.start_date + 'T00:00:00').toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</p></div>
                        <div><p style={{ fontSize: '11px', color: '#AAA' }}>Expected return</p><p style={{ fontSize: '13px', fontWeight: 600, color: overdue ? '#BF360C' : '#1A3A2A' }}>{new Date(c.expected_return + 'T00:00:00').toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</p></div>
                      </div>
                      <div style={{ display: 'flex', gap: '8px' }}>
                        <Link to={`/trails/${c.trail_slug}`} style={{ padding: '8px 16px', borderRadius: '10px', backgroundColor: '#F0EDE8', color: '#1A3A2A', textDecoration: 'none', fontSize: '13px', fontWeight: 600 }}>View trail</Link>
                        {!c.checked_in && (
                          <button onClick={() => handleCheckinSafe(c.id)}
                            style={{ padding: '8px 16px', borderRadius: '10px', border: 'none', backgroundColor: '#1A3A2A', color: '#FFF', fontSize: '13px', fontWeight: 600, cursor: 'pointer', fontFamily: 'DM Sans, sans-serif' }}>
                            ✓ I'm back safe
                          </button>
                        )}
                        <button onClick={() => handleDeleteCheckin(c.id)}
                          style={{ padding: '8px 12px', borderRadius: '10px', border: '1px solid #FFCCBC', backgroundColor: '#FFF5F3', color: '#BF360C', fontSize: '13px', cursor: 'pointer' }}>
                          Remove
                        </button>
                      </div>
                    </div>
                  )
                })}
              </div>
            )}
          </div>
        )}

      </div>
    </div>
  )
}

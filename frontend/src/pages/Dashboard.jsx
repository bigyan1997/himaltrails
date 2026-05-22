import { useState, useEffect, useCallback } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import {
  getSavedTrails, unsaveTrail,
  getNote, saveNote,
  getPackingList, addPackingItem, updatePackingItem, deletePackingItem,
} from '../services/api'
import Navbar from '../components/Navbar'
import useMobile from '../hooks/useMobile'

const CATEGORIES = ['clothing', 'gear', 'documents', 'medical', 'food', 'other']
const CAT_LABEL  = { clothing: 'Clothing', gear: 'Gear', documents: 'Documents', medical: 'Medical', food: 'Food & Water', other: 'Other' }

export default function Dashboard() {
  const { user, loading: authLoading } = useAuth()
  const navigate = useNavigate()
  const isMobile = useMobile()

  const [savedTrails,  setSavedTrails]  = useState([])
  const [packingItems, setPackingItems] = useState([])
  const [activeNote,   setActiveNote]   = useState(null)   // { trail_slug, trail_name, content }
  const [noteText,     setNoteText]     = useState('')
  const [noteSaving,   setNoteSaving]   = useState(false)
  const [newItem,      setNewItem]      = useState('')
  const [newCat,       setNewCat]       = useState('gear')
  const [tab,          setTab]          = useState('trails') // trails | packing

  useEffect(() => {
    if (!authLoading && !user) navigate('/login', { state: { from: '/dashboard' } })
  }, [user, authLoading, navigate])

  useEffect(() => {
    if (!user) return
    getSavedTrails().then(r => setSavedTrails(r.data))
    getPackingList().then(r => setPackingItems(r.data))
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
            {savedTrails.length} saved trail{savedTrails.length !== 1 ? 's' : ''} · {packingItems.length} packing item{packingItems.length !== 1 ? 's' : ''}
          </p>
        </div>

        {/* Tabs */}
        <div style={{ display: 'flex', gap: '4px', backgroundColor: '#EDEAE4', borderRadius: '28px', padding: '4px', marginBottom: '40px', width: 'fit-content' }}>
          <button style={tabStyle('trails')}  onClick={() => setTab('trails')}>Saved Trails</button>
          <button style={tabStyle('packing')} onClick={() => setTab('packing')}>Packing List</button>
        </div>

        {/* ── Saved Trails tab ── */}
        {tab === 'trails' && (
          <div style={{ display: 'flex', gap: '32px', alignItems: 'flex-start', flexDirection: isMobile ? 'column' : undefined }}>

            {/* Trail cards */}
            <div style={{ flex: 1 }}>
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
                  {savedTrails.map(({ trail, saved_at }) => (
                    <div key={trail.slug} style={{ backgroundColor: '#FFFFFF', borderRadius: '20px', border: '1px solid #E8E5E0', overflow: 'hidden' }}>
                      <div style={{ padding: '20px' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '10px' }}>
                          <span style={{ fontSize: '11px', letterSpacing: '0.1em', textTransform: 'uppercase', color: '#C4973A', fontWeight: 600 }}>{trail.region}</span>
                          <span style={{ fontSize: '11px', color: '#BBB' }}>{new Date(saved_at).toLocaleDateString()}</span>
                        </div>
                        <h3 style={{ fontFamily: 'Fraunces, serif', fontSize: '18px', fontWeight: 700, color: '#1A3A2A', marginBottom: '8px', lineHeight: 1.2 }}>
                          {trail.name}
                        </h3>
                        <div style={{ display: 'flex', gap: '8px', marginBottom: '16px', flexWrap: 'wrap' }}>
                          {trail.duration_days && <span style={{ fontSize: '11px', backgroundColor: '#F0EDE8', color: '#666', padding: '3px 10px', borderRadius: '12px' }}>{trail.duration_days}d</span>}
                          {trail.difficulty   && <span style={{ fontSize: '11px', backgroundColor: '#F0EDE8', color: '#666', padding: '3px 10px', borderRadius: '12px' }}>{trail.difficulty}</span>}
                          {trail.max_altitude_m && <span style={{ fontSize: '11px', backgroundColor: '#F0EDE8', color: '#666', padding: '3px 10px', borderRadius: '12px' }}>{(trail.max_altitude_m / 1000).toFixed(1)}km</span>}
                        </div>
                        <div style={{ display: 'flex', gap: '8px' }}>
                          <Link to={`/trails/${trail.slug}`} style={{ flex: 1, textAlign: 'center', padding: '9px', borderRadius: '10px', backgroundColor: '#1A3A2A', color: '#FFFFFF', textDecoration: 'none', fontSize: '13px', fontWeight: 600 }}>
                            View
                          </Link>
                          <button
                            onClick={() => openNote(trail)}
                            style={{ flex: 1, padding: '9px', borderRadius: '10px', border: '1px solid #DDD', backgroundColor: '#FFFFFF', color: '#555', fontSize: '13px', fontWeight: 500, cursor: 'pointer', fontFamily: 'DM Sans, sans-serif' }}
                          >
                            Notes
                          </button>
                          <button
                            onClick={() => handleUnsave(trail.slug)}
                            title="Remove"
                            style={{ padding: '9px 12px', borderRadius: '10px', border: '1px solid #FFCCBC', backgroundColor: '#FFF5F3', color: '#BF360C', fontSize: '13px', cursor: 'pointer' }}
                          >
                            ✕
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
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
                <textarea
                  value={noteText}
                  onChange={e => setNoteText(e.target.value)}
                  placeholder="Gear notes, questions, reminders…"
                  style={{
                    width: '100%', minHeight: '200px', padding: '14px', borderRadius: '12px',
                    border: '1px solid #DDD', fontSize: '14px', fontFamily: 'DM Sans, sans-serif',
                    resize: 'vertical', outline: 'none', boxSizing: 'border-box', lineHeight: 1.6, color: '#333',
                  }}
                  onFocus={e => e.target.style.borderColor = '#C4973A'}
                  onBlur={e  => e.target.style.borderColor = '#DDD'}
                />
                <button
                  onClick={handleNoteSave}
                  disabled={noteSaving}
                  style={{
                    marginTop: '12px', width: '100%', padding: '12px', borderRadius: '10px', border: 'none',
                    backgroundColor: noteSaving ? '#9FB89F' : '#1A3A2A', color: '#FFFFFF',
                    fontSize: '14px', fontWeight: 600, fontFamily: 'DM Sans, sans-serif', cursor: noteSaving ? 'not-allowed' : 'pointer',
                  }}
                >
                  {noteSaving ? 'Saving…' : 'Save note'}
                </button>
              </div>
            )}
          </div>
        )}

        {/* ── Packing List tab ── */}
        {tab === 'packing' && (
          <div style={{ maxWidth: '680px' }}>

            {/* Add item form */}
            <form onSubmit={handleAddItem} style={{ display: 'flex', gap: '10px', marginBottom: '32px', flexDirection: isMobile ? 'column' : undefined }}>
              <input
                value={newItem}
                onChange={e => setNewItem(e.target.value)}
                placeholder="Add an item…"
                style={{
                  flex: 1, padding: '13px 18px', borderRadius: '12px', border: '1px solid #DDD',
                  fontSize: '15px', fontFamily: 'DM Sans, sans-serif', outline: 'none', backgroundColor: '#FFFFFF',
                }}
                onFocus={e => e.target.style.borderColor = '#C4973A'}
                onBlur={e  => e.target.style.borderColor = '#DDD'}
              />
              <select
                value={newCat}
                onChange={e => setNewCat(e.target.value)}
                style={{
                  padding: '13px 14px', borderRadius: '12px', border: '1px solid #DDD',
                  fontSize: '13px', fontFamily: 'DM Sans, sans-serif', outline: 'none',
                  backgroundColor: '#FFFFFF', color: '#555', cursor: 'pointer',
                }}
              >
                {CATEGORIES.map(c => <option key={c} value={c}>{CAT_LABEL[c]}</option>)}
              </select>
              <button
                type="submit"
                style={{
                  padding: '13px 22px', borderRadius: '12px', border: 'none',
                  backgroundColor: '#1A3A2A', color: '#FFFFFF',
                  fontSize: '15px', fontWeight: 600, fontFamily: 'DM Sans, sans-serif', cursor: 'pointer',
                }}
              >
                Add
              </button>
            </form>

            {/* Items by category */}
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
                      <span style={{ marginLeft: '8px', color: '#BBB', fontWeight: 400 }}>
                        {items.filter(i => i.checked).length}/{items.length}
                      </span>
                    </p>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                      {items.map(item => (
                        <div key={item.id} style={{
                          display: 'flex', alignItems: 'center', gap: '12px',
                          padding: '13px 16px', borderRadius: '12px',
                          backgroundColor: item.checked ? '#F7FAF7' : '#FFFFFF',
                          border: `1px solid ${item.checked ? '#C8E6C9' : '#E8E5E0'}`,
                          transition: 'all 0.15s',
                        }}>
                          <button
                            onClick={() => handleToggle(item)}
                            style={{
                              width: '20px', height: '20px', borderRadius: '6px', flexShrink: 0,
                              border: `2px solid ${item.checked ? '#2E7D32' : '#CCC'}`,
                              backgroundColor: item.checked ? '#2E7D32' : 'transparent',
                              cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center',
                            }}
                          >
                            {item.checked && <span style={{ color: '#FFF', fontSize: '11px', fontWeight: 700 }}>✓</span>}
                          </button>
                          <span style={{
                            flex: 1, fontSize: '14px', color: item.checked ? '#999' : '#333',
                            textDecoration: item.checked ? 'line-through' : 'none',
                          }}>
                            {item.name}
                          </span>
                          <button
                            onClick={() => handleDeleteItem(item.id)}
                            style={{ background: 'none', border: 'none', color: '#CCC', cursor: 'pointer', fontSize: '16px', lineHeight: 1, padding: '2px 4px' }}
                            onMouseEnter={e => e.target.style.color = '#BF360C'}
                            onMouseLeave={e => e.target.style.color = '#CCC'}
                          >
                            ✕
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}

                {/* Progress bar */}
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

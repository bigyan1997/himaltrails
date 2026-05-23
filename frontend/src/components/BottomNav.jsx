import { Link, useLocation } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import useMobile from '../hooks/useMobile'

const TABS = [
  {
    to: '/trails',
    label: 'Trails',
    icon: (active) => (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none"
        stroke={active ? '#C4973A' : '#AAA'} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M3 17l4-8 4 4 4-6 4 10"/>
      </svg>
    ),
  },
  {
    to: '/map',
    label: 'Map',
    icon: (active) => (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none"
        stroke={active ? '#C4973A' : '#AAA'} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <polygon points="1 6 1 22 8 18 16 22 23 18 23 2 16 6 8 2 1 6"/>
        <line x1="8" y1="2" x2="8" y2="18"/><line x1="16" y1="6" x2="16" y2="22"/>
      </svg>
    ),
  },
  {
    to: '/guides',
    label: 'Guides',
    icon: (active) => (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none"
        stroke={active ? '#C4973A' : '#AAA'} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/>
        <circle cx="9" cy="7" r="4"/>
        <path d="M23 21v-2a4 4 0 0 0-3-3.87"/>
        <path d="M16 3.13a4 4 0 0 1 0 7.75"/>
      </svg>
    ),
  },
  {
    to: '/peaks',
    label: 'Peaks',
    icon: (active) => (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none"
        stroke={active ? '#C4973A' : '#AAA'} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <polygon points="12 2 2 22 22 22"/>
        <line x1="12" y1="6" x2="12" y2="6" strokeWidth="2.5"/>
      </svg>
    ),
  },
  {
    to: '/dashboard',
    label: 'My Trips',
    icon: (active) => (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none"
        stroke={active ? '#C4973A' : '#AAA'} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z"/>
      </svg>
    ),
  },
]

export default function BottomNav() {
  const isMobile   = useMobile()
  const location   = useLocation()
  const { user }   = useAuth()

  if (!isMobile) return null

  const activeTab = TABS.find(t => location.pathname.startsWith(t.to))?.to

  return (
    <nav style={{
      position: 'fixed', bottom: 0, left: 0, right: 0, zIndex: 200,
      backgroundColor: '#FFFFFF',
      borderTop: '1px solid #E8E5E0',
      display: 'flex',
      paddingBottom: 'env(safe-area-inset-bottom, 0px)',
    }}>
      {TABS.map(tab => {
        const active = activeTab === tab.to
        if (tab.to === '/dashboard' && !user) return null
        return (
          <Link
            key={tab.to}
            to={tab.to}
            style={{
              flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center',
              justifyContent: 'center', padding: '10px 0 8px', textDecoration: 'none',
              gap: '3px',
            }}
          >
            {tab.icon(active)}
            <span style={{
              fontSize: '10px', fontWeight: active ? 600 : 400,
              color: active ? '#C4973A' : '#AAA',
              fontFamily: 'DM Sans, sans-serif',
              letterSpacing: '0.04em',
            }}>
              {tab.label}
            </span>
          </Link>
        )
      })}
    </nav>
  )
}

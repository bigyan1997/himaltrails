import { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import useMobile from '../hooks/useMobile'

export default function Navbar({ transparent = false, children }) {
  const [scrollY, setScrollY]       = useState(0)
  const [menuOpen, setMenuOpen]     = useState(false)
  const [mobileOpen, setMobileOpen] = useState(false)
  const { user, logout }            = useAuth()
  const navigate                    = useNavigate()
  const isMobile                    = useMobile()

  useEffect(() => {
    if (!transparent) return
    const h = () => setScrollY(window.scrollY)
    window.addEventListener('scroll', h)
    return () => window.removeEventListener('scroll', h)
  }, [transparent])

  useEffect(() => { if (!isMobile) setMobileOpen(false) }, [isMobile])

  const solid = !transparent || scrollY > 60 || mobileOpen

  const handleLogout = async () => {
    setMenuOpen(false)
    setMobileOpen(false)
    await logout()
    navigate('/')
  }

  return (
    <nav style={{
      position: transparent ? 'fixed' : 'sticky',
      top: 0, left: 0, right: 0,
      zIndex: 100,
      padding: isMobile ? '16px 20px' : '20px 48px',
      display: 'flex',
      flexWrap: 'wrap',
      alignItems: 'center',
      justifyContent: 'space-between',
      background: solid ? '#1A3A2A' : 'transparent',
      transition: 'background 0.4s ease',
    }}>

      <Link to="/" style={{
        fontFamily: 'Fraunces, serif',
        fontSize: '22px',
        fontWeight: 700,
        color: '#C4973A',
        textDecoration: 'none',
      }}>
        HimalTrails
      </Link>

      {/* ── Desktop nav ── */}
      {!isMobile && (
        <div style={{ display: 'flex', gap: '32px', alignItems: 'center' }}>
          {children}

          {user ? (
            <div style={{ position: 'relative' }}>
              <button
                onClick={() => setMenuOpen(o => !o)}
                style={{
                  display: 'flex', alignItems: 'center', gap: '8px',
                  background: 'rgba(255,255,255,0.1)', border: '1px solid rgba(255,255,255,0.15)',
                  borderRadius: '24px', padding: '8px 16px', cursor: 'pointer',
                  color: '#FFFFFF', fontSize: '13px', fontFamily: 'DM Sans, sans-serif',
                }}
              >
                <span style={{ width: '26px', height: '26px', borderRadius: '50%', backgroundColor: '#C4973A', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '12px', fontWeight: 700 }}>
                  {(user.display_name || user.email).charAt(0).toUpperCase()}
                </span>
                {user.display_name || user.email.split('@')[0]}
              </button>

              {menuOpen && (
                <div style={{
                  position: 'absolute', top: 'calc(100% + 10px)', right: 0,
                  backgroundColor: '#FFFFFF', border: '1px solid #E8E5E0',
                  borderRadius: '16px', padding: '8px', minWidth: '180px',
                  boxShadow: '0 12px 32px rgba(0,0,0,0.12)',
                }}>
                  <div style={{ padding: '10px 14px 8px', borderBottom: '1px solid #F0EDE8' }}>
                    <p style={{ fontSize: '13px', fontWeight: 600, color: '#1A3A2A' }}>{user.display_name || 'Trekker'}</p>
                    <p style={{ fontSize: '11px', color: '#AAA', marginTop: '2px' }}>{user.email}</p>
                  </div>
                  <Link
                    to="/dashboard"
                    onClick={() => setMenuOpen(false)}
                    style={{
                      display: 'block', padding: '10px 14px', marginTop: '4px', borderRadius: '10px',
                      fontSize: '13px', color: '#1A3A2A', textDecoration: 'none',
                      fontFamily: 'DM Sans, sans-serif',
                    }}
                    onMouseEnter={e => e.currentTarget.style.backgroundColor = '#F5F2EE'}
                    onMouseLeave={e => e.currentTarget.style.backgroundColor = 'transparent'}
                  >
                    My trips
                  </Link>
                  <button
                    onClick={handleLogout}
                    style={{
                      display: 'block', width: '100%', textAlign: 'left',
                      padding: '10px 14px', marginTop: '4px', borderRadius: '10px',
                      border: 'none', backgroundColor: 'transparent',
                      fontSize: '13px', color: '#BF360C', cursor: 'pointer',
                      fontFamily: 'DM Sans, sans-serif',
                    }}
                    onMouseEnter={e => e.target.style.backgroundColor = '#FBE9E7'}
                    onMouseLeave={e => e.target.style.backgroundColor = 'transparent'}
                  >
                    Sign out
                  </button>
                </div>
              )}
            </div>
          ) : (
            <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
              <Link to="/login" style={{
                fontSize: '13px', color: 'rgba(255,255,255,0.7)',
                textDecoration: 'none', letterSpacing: '0.05em',
              }}>
                Sign in
              </Link>
              <Link to="/register" style={{
                fontSize: '13px', fontWeight: 500,
                backgroundColor: '#C4973A', color: '#FFFFFF',
                padding: '8px 20px', borderRadius: '24px',
                textDecoration: 'none', letterSpacing: '0.04em',
              }}>
                Join free
              </Link>
            </div>
          )}
        </div>
      )}

      {/* ── Mobile hamburger button ── */}
      {isMobile && (
        <button
          onClick={() => setMobileOpen(o => !o)}
          style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#FFFFFF', padding: '4px', display: 'flex', alignItems: 'center' }}
          aria-label="Menu"
        >
          {mobileOpen ? (
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
            </svg>
          ) : (
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <line x1="3" y1="6" x2="21" y2="6"/><line x1="3" y1="12" x2="21" y2="12"/><line x1="3" y1="18" x2="21" y2="18"/>
            </svg>
          )}
        </button>
      )}

      {/* ── Mobile menu panel ── */}
      {isMobile && mobileOpen && (
        <div style={{
          width: '100%',
          borderTop: '1px solid rgba(255,255,255,0.1)',
          paddingTop: '16px',
          marginTop: '12px',
        }}>
          {children && (
            <div style={{ marginBottom: '16px', paddingBottom: '16px', borderBottom: '1px solid rgba(255,255,255,0.08)', display: 'flex', flexDirection: 'column', gap: '4px' }}>
              {children}
            </div>
          )}

          {user ? (
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '12px' }}>
                <span style={{ width: '32px', height: '32px', borderRadius: '50%', backgroundColor: '#C4973A', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '14px', fontWeight: 700, color: '#FFFFFF', flexShrink: 0 }}>
                  {(user.display_name || user.email).charAt(0).toUpperCase()}
                </span>
                <div>
                  <p style={{ fontSize: '13px', fontWeight: 600, color: '#FFFFFF' }}>{user.display_name || 'Trekker'}</p>
                  <p style={{ fontSize: '11px', color: 'rgba(255,255,255,0.4)' }}>{user.email}</p>
                </div>
              </div>
              <Link
                to="/dashboard"
                onClick={() => setMobileOpen(false)}
                style={{ display: 'block', padding: '12px 0', fontSize: '14px', color: 'rgba(255,255,255,0.8)', textDecoration: 'none', borderTop: '1px solid rgba(255,255,255,0.08)' }}
              >
                My trips
              </Link>
              <button
                onClick={handleLogout}
                style={{ display: 'block', width: '100%', textAlign: 'left', padding: '12px 0', fontSize: '14px', color: '#F4A460', background: 'none', border: 'none', borderTop: '1px solid rgba(255,255,255,0.08)', cursor: 'pointer', fontFamily: 'DM Sans, sans-serif' }}
              >
                Sign out
              </button>
            </div>
          ) : (
            <div style={{ display: 'flex', gap: '10px' }}>
              <Link
                to="/login"
                onClick={() => setMobileOpen(false)}
                style={{ flex: 1, textAlign: 'center', padding: '11px', borderRadius: '24px', border: '1px solid rgba(255,255,255,0.2)', fontSize: '14px', color: '#FFFFFF', textDecoration: 'none' }}
              >
                Sign in
              </Link>
              <Link
                to="/register"
                onClick={() => setMobileOpen(false)}
                style={{ flex: 1, textAlign: 'center', padding: '11px', borderRadius: '24px', backgroundColor: '#C4973A', fontSize: '14px', fontWeight: 500, color: '#FFFFFF', textDecoration: 'none' }}
              >
                Join free
              </Link>
            </div>
          )}
        </div>
      )}
    </nav>
  )
}

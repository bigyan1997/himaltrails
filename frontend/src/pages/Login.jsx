import { useState } from 'react'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import { useGoogleLogin } from '@react-oauth/google'
import { useAuth } from '../contexts/AuthContext'
import { googleLogin as apiGoogleLogin } from '../services/api'
import Navbar from '../components/Navbar'
import SEO from '../components/SEO'

export default function Login() {
  const { login, loginWithTokens } = useAuth()

  const navigate                   = useNavigate()
  const location                   = useLocation()
  const from                       = location.state?.from || '/trails'

  const [email,     setEmail]     = useState('')
  const [password,  setPassword]  = useState('')
  const [showPass,  setShowPass]  = useState(false)
  const [error,     setError]     = useState('')
  const [loading,   setLoading]   = useState(false)
  const [gLoading,  setGLoading]  = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      await login(email, password)
      navigate(from, { replace: true })
    } catch (err) {
      const msg = err.response?.data?.non_field_errors?.[0]
        || err.response?.data?.detail
        || 'Invalid email or password.'
      setError(msg)
    } finally {
      setLoading(false)
    }
  }

  const handleGoogle = useGoogleLogin({
    onSuccess: async (tokenResponse) => {
      setGLoading(true)
      setError('')
      try {
        const res = await apiGoogleLogin(tokenResponse.access_token)
        loginWithTokens(res.data)
        navigate(from, { replace: true })
      } catch (err) {
        setError(err.response?.data?.error || 'Google sign-in failed.')
      } finally {
        setGLoading(false)
      }
    },
    onError: () => setError('Google sign-in was cancelled or failed.'),
    flow: 'implicit',
  })

  const inputStyle = {
    width: '100%', padding: '14px 18px', borderRadius: '12px',
    border: '1px solid #DDD', fontSize: '15px', fontFamily: 'DM Sans, sans-serif',
    backgroundColor: '#FFFFFF', outline: 'none', boxSizing: 'border-box',
  }

  return (
    <div style={{ backgroundColor: '#F7F5F0', minHeight: '100vh', fontFamily: 'DM Sans, sans-serif' }}>
      <SEO title="Sign In" noindex />
      <Navbar>
        <Link to="/trails" style={{ fontSize: '12px', letterSpacing: '0.12em', textTransform: 'uppercase', color: 'rgba(255,255,255,0.7)', textDecoration: 'none' }}>
          Trails
        </Link>
      </Navbar>

      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'flex-start', padding: '80px 24px' }}>
        <div style={{ width: '100%', maxWidth: '420px' }}>

          <p style={{ fontSize: '11px', letterSpacing: '0.15em', textTransform: 'uppercase', color: '#C4973A', marginBottom: '12px' }}>
            ✦ Welcome back
          </p>
          <h1 style={{ fontFamily: 'Fraunces, serif', fontSize: '44px', fontWeight: 700, color: '#1A3A2A', lineHeight: 1.1, marginBottom: '8px' }}>
            Sign in
          </h1>
          <p style={{ fontSize: '14px', color: '#999', marginBottom: '44px' }}>
            Don't have an account?{' '}
            <Link to="/register" style={{ color: '#C4973A', textDecoration: 'none', fontWeight: 500 }}>
              Create one →
            </Link>
          </p>

          {error && (
            <div style={{ padding: '14px 18px', borderRadius: '12px', backgroundColor: '#FBE9E7', border: '1px solid #FFCCBC', color: '#BF360C', fontSize: '14px', marginBottom: '16px' }}>
              {error}
            </div>
          )}

          {/* Google button */}
          <button
            onClick={() => handleGoogle()}
            disabled={gLoading}
            style={{
              width: '100%', padding: '14px 18px', borderRadius: '12px',
              border: '1px solid #DDD', backgroundColor: '#FFFFFF',
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '12px',
              fontSize: '15px', fontFamily: 'DM Sans, sans-serif', cursor: gLoading ? 'not-allowed' : 'pointer',
              color: '#333', fontWeight: 500,
            }}
          >
            {!gLoading && (
              <svg width="18" height="18" viewBox="0 0 18 18">
                <path fill="#4285F4" d="M17.64 9.2c0-.637-.057-1.251-.164-1.84H9v3.481h4.844c-.209 1.125-.843 2.078-1.796 2.717v2.258h2.908c1.702-1.567 2.684-3.875 2.684-6.615z"/>
                <path fill="#34A853" d="M9 18c2.43 0 4.467-.806 5.956-2.184l-2.908-2.258c-.806.54-1.837.86-3.048.86-2.344 0-4.328-1.584-5.036-3.711H.957v2.332A8.997 8.997 0 0 0 9 18z"/>
                <path fill="#FBBC05" d="M3.964 10.707A5.41 5.41 0 0 1 3.682 9c0-.593.102-1.17.282-1.707V4.961H.957A8.996 8.996 0 0 0 0 9c0 1.452.348 2.827.957 4.039l3.007-2.332z"/>
                <path fill="#EA4335" d="M9 3.58c1.321 0 2.508.454 3.44 1.345l2.582-2.58C13.463.891 11.426 0 9 0A8.997 8.997 0 0 0 .957 4.961L3.964 6.293C4.672 4.166 6.656 3.58 9 3.58z"/>
              </svg>
            )}
            {gLoading ? 'Signing in…' : 'Continue with Google'}
          </button>

          {/* Divider */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px', margin: '24px 0' }}>
            <div style={{ flex: 1, height: '1px', backgroundColor: '#E8E5E0' }} />
            <span style={{ fontSize: '12px', color: '#BBB', letterSpacing: '0.05em' }}>or sign in with email</span>
            <div style={{ flex: 1, height: '1px', backgroundColor: '#E8E5E0' }} />
          </div>

          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div>
              <label style={{ display: 'block', fontSize: '12px', fontWeight: 500, textTransform: 'uppercase', letterSpacing: '0.1em', color: '#888', marginBottom: '8px' }}>
                Email
              </label>
              <input
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                required
                placeholder="you@example.com"
                style={inputStyle}
                onFocus={e => e.target.style.borderColor = '#C4973A'}
                onBlur={e  => e.target.style.borderColor = '#DDD'}
              />
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '12px', fontWeight: 500, textTransform: 'uppercase', letterSpacing: '0.1em', color: '#888', marginBottom: '8px' }}>
                Password
              </label>
              <div style={{ position: 'relative' }}>
                <input
                  type={showPass ? 'text' : 'password'}
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  required
                  placeholder="••••••••"
                  style={{ ...inputStyle, paddingRight: '48px' }}
                  onFocus={e => e.target.style.borderColor = '#C4973A'}
                  onBlur={e  => e.target.style.borderColor = '#DDD'}
                />
                <button
                  type="button"
                  onClick={() => setShowPass(v => !v)}
                  style={{ position: 'absolute', right: '14px', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', padding: '4px', color: '#AAA' }}
                >
                  {showPass
                    ? <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94"/><path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19"/><line x1="1" y1="1" x2="23" y2="23"/></svg>
                    : <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>
                  }
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              style={{
                marginTop: '8px', padding: '16px', borderRadius: '12px', border: 'none',
                backgroundColor: loading ? '#9FB89F' : '#1A3A2A',
                color: '#FFFFFF', fontSize: '15px', fontWeight: 600,
                fontFamily: 'DM Sans, sans-serif', cursor: loading ? 'not-allowed' : 'pointer',
                transition: 'background-color 0.2s',
              }}
            >
              {loading ? 'Signing in…' : 'Sign in'}
            </button>
          </form>

        </div>
      </div>
    </div>
  )
}

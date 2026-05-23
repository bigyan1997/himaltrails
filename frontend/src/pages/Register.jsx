import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useGoogleLogin } from '@react-oauth/google'
import { register, googleLogin as apiGoogleLogin } from '../services/api'
import { useAuth } from '../contexts/AuthContext'
import Navbar from '../components/Navbar'
import SEO from '../components/SEO'

const checks = [
  { key: 'len',     label: 'At least 8 characters',    test: p => p.length >= 8 },
  { key: 'upper',   label: '1 uppercase letter',        test: p => /[A-Z]/.test(p) },
  { key: 'special', label: '1 special character',       test: p => /[^A-Za-z0-9]/.test(p) },
]

function EyeIcon({ open }) {
  return open
    ? <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94"/><path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19"/><line x1="1" y1="1" x2="23" y2="23"/></svg>
    : <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>
}

export default function Register() {
  const { login, loginWithTokens } = useAuth()
  const navigate                   = useNavigate()

  const [form,      setForm]      = useState({ email: '', password1: '', password2: '', display_name: '', nationality: '' })
  const [errors,    setErrors]    = useState({})
  const [showPass1, setShowPass1] = useState(false)
  const [showPass2, setShowPass2] = useState(false)
  const [touched1,  setTouched1]  = useState(false)
  const [touched2,  setTouched2]  = useState(false)
  const [loading,   setLoading]   = useState(false)
  const [gLoading,  setGLoading]  = useState(false)

  const set = (k) => (e) => setForm(f => ({ ...f, [k]: e.target.value }))

  const p1 = form.password1
  const p2 = form.password2
  const allChecksPassed = checks.every(c => c.test(p1))
  const passwordsMatch  = p1 && p2 && p1 === p2

  const handleSubmit = async (e) => {
    e.preventDefault()
    setTouched1(true)
    setTouched2(true)
    if (!allChecksPassed || !passwordsMatch) return
    setErrors({})
    setLoading(true)
    try {
      await register(form)
      await login(form.email, form.password1)
      navigate('/trails', { replace: true })
    } catch (err) {
      const data = err.response?.data || {}
      setErrors(typeof data === 'object' ? data : { non_field_errors: [String(data)] })
    } finally {
      setLoading(false)
    }
  }

  const handleGoogle = useGoogleLogin({
    onSuccess: async (tokenResponse) => {
      setGLoading(true)
      setErrors({})
      try {
        const res = await apiGoogleLogin(tokenResponse.access_token)
        loginWithTokens(res.data)
        navigate('/trails', { replace: true })
      } catch (err) {
        setErrors({ non_field_errors: [err.response?.data?.error || 'Google sign-in failed.'] })
      } finally {
        setGLoading(false)
      }
    },
    onError: () => setErrors({ non_field_errors: ['Google sign-in was cancelled or failed.'] }),
    flow: 'implicit',
  })

  const fieldError = (key) => errors[key]?.[0]

  const inputStyle = (key, extraBorder) => ({
    width: '100%', padding: '14px 18px', paddingRight: '48px', borderRadius: '12px',
    border: `1px solid ${extraBorder || (fieldError(key) ? '#FFCCBC' : '#DDD')}`,
    fontSize: '15px', fontFamily: 'DM Sans, sans-serif',
    backgroundColor: '#FFFFFF', outline: 'none', boxSizing: 'border-box',
  })

  return (
    <div style={{ backgroundColor: '#F7F5F0', minHeight: '100vh', fontFamily: 'DM Sans, sans-serif' }}>
      <SEO title="Create Account" noindex />
      <Navbar>
        <Link to="/trails" style={{ fontSize: '12px', letterSpacing: '0.12em', textTransform: 'uppercase', color: 'rgba(255,255,255,0.7)', textDecoration: 'none' }}>
          Trails
        </Link>
      </Navbar>

      <div style={{ display: 'flex', justifyContent: 'center', padding: '80px 24px' }}>
        <div style={{ width: '100%', maxWidth: '460px' }}>

          <p style={{ fontSize: '11px', letterSpacing: '0.15em', textTransform: 'uppercase', color: '#C4973A', marginBottom: '12px' }}>
            ✦ Join HimalTrails
          </p>
          <h1 style={{ fontFamily: 'Fraunces, serif', fontSize: '44px', fontWeight: 700, color: '#1A3A2A', lineHeight: 1.1, marginBottom: '8px' }}>
            Create account
          </h1>
          <p style={{ fontSize: '14px', color: '#999', marginBottom: '44px' }}>
            Already have an account?{' '}
            <Link to="/login" style={{ color: '#C4973A', textDecoration: 'none', fontWeight: 500 }}>
              Sign in →
            </Link>
          </p>

          {(errors.non_field_errors || errors.detail) && (
            <div style={{ padding: '14px 18px', borderRadius: '12px', backgroundColor: '#FBE9E7', border: '1px solid #FFCCBC', color: '#BF360C', fontSize: '14px', marginBottom: '16px' }}>
              {errors.non_field_errors?.[0] || errors.detail}
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
            <span style={{ fontSize: '12px', color: '#BBB', letterSpacing: '0.05em' }}>or register with email</span>
            <div style={{ flex: 1, height: '1px', backgroundColor: '#E8E5E0' }} />
          </div>

          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>

            {/* Email */}
            <div>
              <label style={{ display: 'block', fontSize: '12px', fontWeight: 500, textTransform: 'uppercase', letterSpacing: '0.1em', color: '#888', marginBottom: '8px' }}>
                Email <span style={{ color: '#C4973A' }}>*</span>
              </label>
              <input
                type="email" value={form.email} onChange={set('email')} required
                placeholder="you@example.com" style={inputStyle('email')}
                onFocus={e => e.target.style.borderColor = '#C4973A'}
                onBlur={e  => e.target.style.borderColor = fieldError('email') ? '#FFCCBC' : '#DDD'}
              />
              {fieldError('email') && <p style={{ fontSize: '12px', color: '#BF360C', marginTop: '6px' }}>{fieldError('email')}</p>}
            </div>

            {/* Display name */}
            <div>
              <label style={{ display: 'block', fontSize: '12px', fontWeight: 500, textTransform: 'uppercase', letterSpacing: '0.1em', color: '#888', marginBottom: '8px' }}>
                Display name
              </label>
              <input
                type="text" value={form.display_name} onChange={set('display_name')}
                placeholder="How you'll appear" style={{ ...inputStyle('display_name'), paddingRight: '18px' }}
                onFocus={e => e.target.style.borderColor = '#C4973A'}
                onBlur={e  => e.target.style.borderColor = '#DDD'}
              />
            </div>

            {/* Nationality */}
            <div>
              <label style={{ display: 'block', fontSize: '12px', fontWeight: 500, textTransform: 'uppercase', letterSpacing: '0.1em', color: '#888', marginBottom: '8px' }}>
                Nationality
              </label>
              <input
                type="text" value={form.nationality} onChange={set('nationality')}
                placeholder="e.g. British" style={{ ...inputStyle('nationality'), paddingRight: '18px' }}
                onFocus={e => e.target.style.borderColor = '#C4973A'}
                onBlur={e  => e.target.style.borderColor = '#DDD'}
              />
            </div>

            {/* Password */}
            <div>
              <label style={{ display: 'block', fontSize: '12px', fontWeight: 500, textTransform: 'uppercase', letterSpacing: '0.1em', color: '#888', marginBottom: '8px' }}>
                Password <span style={{ color: '#C4973A' }}>*</span>
              </label>
              <div style={{ position: 'relative' }}>
                <input
                  type={showPass1 ? 'text' : 'password'}
                  value={p1}
                  onChange={set('password1')}
                  onBlur={() => setTouched1(true)}
                  required
                  placeholder="8+ characters"
                  style={inputStyle('password1', touched1 && !allChecksPassed && p1 ? '#FFCCBC' : undefined)}
                  onFocus={e => e.target.style.borderColor = '#C4973A'}
                />
                <button type="button" onClick={() => setShowPass1(v => !v)}
                  style={{ position: 'absolute', right: '14px', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', padding: '4px', color: '#AAA' }}>
                  <EyeIcon open={showPass1} />
                </button>
              </div>

              {/* Strength checklist — show once user starts typing */}
              {p1.length > 0 && (
                <div style={{ marginTop: '10px', display: 'flex', flexDirection: 'column', gap: '5px' }}>
                  {checks.map(c => {
                    const pass = c.test(p1)
                    return (
                      <div key={c.key} style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <span style={{
                          width: '16px', height: '16px', borderRadius: '50%', flexShrink: 0,
                          display: 'flex', alignItems: 'center', justifyContent: 'center',
                          backgroundColor: pass ? '#E8F5E9' : '#FBE9E7',
                          color: pass ? '#2E7D32' : '#BF360C', fontSize: '10px', fontWeight: 700,
                        }}>
                          {pass ? '✓' : '✗'}
                        </span>
                        <span style={{ fontSize: '12px', color: pass ? '#2E7D32' : '#999' }}>{c.label}</span>
                      </div>
                    )
                  })}
                </div>
              )}
            </div>

            {/* Confirm password */}
            <div>
              <label style={{ display: 'block', fontSize: '12px', fontWeight: 500, textTransform: 'uppercase', letterSpacing: '0.1em', color: '#888', marginBottom: '8px' }}>
                Confirm password <span style={{ color: '#C4973A' }}>*</span>
              </label>
              <div style={{ position: 'relative' }}>
                <input
                  type={showPass2 ? 'text' : 'password'}
                  value={p2}
                  onChange={set('password2')}
                  onBlur={() => setTouched2(true)}
                  required
                  placeholder="Repeat password"
                  style={inputStyle('password2', touched2 && p2 && !passwordsMatch ? '#FFCCBC' : (passwordsMatch ? '#A5D6A7' : undefined))}
                  onFocus={e => e.target.style.borderColor = '#C4973A'}
                />
                <button type="button" onClick={() => setShowPass2(v => !v)}
                  style={{ position: 'absolute', right: '14px', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', padding: '4px', color: '#AAA' }}>
                  <EyeIcon open={showPass2} />
                </button>
              </div>

              {/* Match indicator */}
              {p2.length > 0 && (
                <p style={{ fontSize: '12px', marginTop: '6px', color: passwordsMatch ? '#2E7D32' : '#BF360C' }}>
                  {passwordsMatch ? '✓ Passwords match' : '✗ Passwords do not match'}
                </p>
              )}
              {fieldError('password2') && (
                <p style={{ fontSize: '12px', color: '#BF360C', marginTop: '6px' }}>{fieldError('password2')}</p>
              )}
            </div>

            <button
              type="submit"
              disabled={loading}
              style={{
                marginTop: '8px', padding: '16px', borderRadius: '12px', border: 'none',
                backgroundColor: loading ? '#9FB89F' : '#1A3A2A',
                color: '#FFFFFF', fontSize: '15px', fontWeight: 600,
                fontFamily: 'DM Sans, sans-serif', cursor: loading ? 'not-allowed' : 'pointer',
              }}
            >
              {loading ? 'Creating account…' : 'Create account'}
            </button>
          </form>

        </div>
      </div>
    </div>
  )
}

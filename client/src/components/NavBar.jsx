import { Link, useLocation, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext.jsx'
import { useMemo, useState } from 'react'
import Modal from './Modal.jsx'

const linkStyle = (active) => ({
  padding: '10px 16px',
  borderRadius: 8,
  textDecoration: 'none',
  color: active ? 'var(--text)' : 'var(--muted)',
  background: active ? 'rgba(255,255,255,.08)' : 'transparent',
  fontWeight: active ? 600 : 500,
  transition: 'all 0.2s ease',
  fontSize: 14,
})

export default function NavBar() {
  const { token, user, logout } = useAuth()
  const loc = useLocation()
  const navigate = useNavigate()
  const [showLogoutModal, setShowLogoutModal] = useState(false)

  const handleLogout = () => {
    logout()
    navigate('/login')
  }

  const avatarUrl = useMemo(() => {
    const url = user?.avatarUrl
    if (!url) return null
    if (url.startsWith('http')) return url
    const base = import.meta.env.DEV ? 'http://localhost:4000' : (import.meta.env.VITE_API_BASE_URL || '')
    return base.replace(/\/$/, '') + url
  }, [user])

  return (
    <>
      <header style={{ 
        borderBottom: '1px solid var(--border)', 
        background: 'var(--surface)', 
        position: 'sticky', 
        top: 0, 
        zIndex: 10,
        backdropFilter: 'blur(10px)',
      }}>
        <div style={{ 
          maxWidth: 1200, 
          margin: '0 auto', 
          padding: '12px 24px', 
          display: 'flex', 
          alignItems: 'center', 
          gap: 16, 
          justifyContent: 'space-between',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 20 }}>
            <Link 
              to={token ? '/feed' : '/home'} 
              style={{ 
                fontWeight: 800, 
                fontSize: 20, 
                color: 'var(--text)', 
                textDecoration: 'none',
                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                backgroundClip: 'text',
              }}
            >
              Campus Connect
            </Link>
            {token && (
              <nav style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
                <Link to="/feed" style={linkStyle(loc.pathname === '/feed')}>Home</Link>
                <Link to="/compose" style={linkStyle(loc.pathname === '/compose')}>Compose</Link>
                <Link 
                  to="/profile?tab=search" 
                  style={{
                    ...linkStyle(loc.pathname === '/profile' && new URLSearchParams(loc.search).get('tab') === 'search'),
                    display: 'flex',
                    alignItems: 'center',
                    gap: 6,
                  }}
                >
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <circle cx="11" cy="11" r="8"></circle>
                    <path d="m21 21-4.35-4.35"></path>
                  </svg>
                  Search
                </Link>
              </nav>
            )}
          </div>

          <div>
            {!token ? (
              <div style={{ display: 'flex', gap: 8 }}>
                <Link to="/home" style={linkStyle(loc.pathname === '/home')}>Home</Link>
                <Link to="/login" style={linkStyle(loc.pathname === '/login')}>Login</Link>
                <Link to="/register" style={linkStyle(loc.pathname === '/register')}>Register</Link>
              </div>
            ) : (
              <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <Link to="/profile" style={{ display: 'flex', alignItems: 'center', gap: 8, textDecoration: 'none', color: 'var(--text)' }}>
                  <div style={{ 
                    width: 38, 
                    height: 38, 
                    borderRadius: '50%', 
                    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', 
                    overflow: 'hidden', 
                    display: 'grid', 
                    placeItems: 'center', 
                    fontWeight: 700, 
                    fontSize: 16,
                    color: 'white',
                    border: '2px solid var(--border)',
                    transition: 'transform 0.2s ease',
                    cursor: 'pointer',
                  }}
                  onMouseEnter={(e) => e.currentTarget.style.transform = 'scale(1.05)'}
                  onMouseLeave={(e) => e.currentTarget.style.transform = 'scale(1)'}
                  >
                    {avatarUrl ? <img src={avatarUrl} alt="avatar" style={{ width: '100%', height: '100%', objectFit: 'cover' }} /> : (user?.name?.[0] || '?')}
                  </div>
                </Link>
                <button 
                  onClick={() => setShowLogoutModal(true)} 
                  className="btn"
                  style={{
                    padding: '8px 16px',
                    fontSize: 14,
                  }}
                >
                  Logout
                </button>
              </div>
            )}
          </div>
        </div>
      </header>

      <Modal
        isOpen={showLogoutModal}
        onClose={() => setShowLogoutModal(false)}
        onConfirm={handleLogout}
        title="Logout"
        message="Are you sure you want to logout? You'll need to login again to access your account."
        confirmText="Yes, Logout"
        cancelText="Cancel"
        confirmStyle="primary"
      />
    </>
  )
}

import { Outlet, NavLink, useNavigate } from 'react-router-dom';
import { useState } from 'react';

const NAV_ITEMS = [
  { to: '/', label: '홈', icon: '🏕️', exact: true },
  { to: '/ai', label: 'AI', icon: '🤖', exact: false },
  { to: '/emergency', label: '긴급', icon: '🆘', exact: false },
  { to: '/checklist', label: '준비물', icon: '📋', exact: false },
];

export default function Layout() {
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100dvh' }}>
      {/* Top bar */}
      <header style={{
        position: 'sticky', top: 0, zIndex: 100,
        background: 'var(--bark)', color: 'var(--cream)',
        height: 'var(--nav-h)',
        display: 'flex', alignItems: 'center',
        padding: '0 16px', gap: '12px',
        boxShadow: '0 2px 8px rgba(0,0,0,0.3)',
      }}>
        <button
          onClick={() => navigate('/')}
          style={{
            background: 'none', border: 'none', cursor: 'pointer',
            fontFamily: 'var(--font-display)', fontWeight: 700,
            fontSize: '1.3rem', color: 'var(--cream)',
            letterSpacing: '1px', padding: 0,
          }}
        >
          🌿 WildCraft
        </button>

        <div style={{ flex: 1 }} />

        {/* Desktop nav */}
        <nav style={{
          display: 'flex', gap: '4px',
        }} className="desktop-nav">
          {NAV_ITEMS.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.exact}
              style={({ isActive }) => ({
                display: 'flex', alignItems: 'center', gap: '4px',
                padding: '6px 12px', borderRadius: '6px',
                color: isActive ? 'var(--cream)' : 'rgba(240,230,211,0.7)',
                background: isActive ? 'rgba(255,255,255,0.15)' : 'transparent',
                fontFamily: 'var(--font-body)', fontSize: '0.95rem',
                textDecoration: 'none', transition: 'all 0.15s',
              })}
            >
              {item.icon} {item.label}
            </NavLink>
          ))}
        </nav>

        {/* Mobile menu button */}
        <button
          onClick={() => setMenuOpen(!menuOpen)}
          className="mobile-menu-btn"
          style={{
            background: 'none', border: 'none', cursor: 'pointer',
            color: 'var(--cream)', fontSize: '1.4rem', padding: '4px',
          }}
          aria-label="메뉴"
        >
          {menuOpen ? '✕' : '☰'}
        </button>
      </header>

      {/* Mobile dropdown menu */}
      {menuOpen && (
        <div style={{
          position: 'fixed', top: 'var(--nav-h)', left: 0, right: 0, zIndex: 99,
          background: 'var(--bark-light)',
          boxShadow: '0 4px 12px rgba(0,0,0,0.3)',
        }}>
          {NAV_ITEMS.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.exact}
              onClick={() => setMenuOpen(false)}
              style={({ isActive }) => ({
                display: 'flex', alignItems: 'center', gap: '10px',
                padding: '14px 20px',
                color: isActive ? 'var(--cream)' : 'rgba(240,230,211,0.8)',
                background: isActive ? 'rgba(255,255,255,0.1)' : 'transparent',
                fontFamily: 'var(--font-body)', fontSize: '1.05rem',
                textDecoration: 'none',
                borderBottom: '1px solid rgba(255,255,255,0.08)',
              })}
            >
              {item.icon} {item.label}
            </NavLink>
          ))}
        </div>
      )}

      {/* Main content */}
      <main style={{ flex: 1 }}>
        <Outlet />
      </main>

      {/* Bottom nav (mobile) */}
      <nav style={{
        position: 'fixed', bottom: 0, left: 0, right: 0, zIndex: 100,
        background: 'var(--bark)', borderTop: '1px solid rgba(255,255,255,0.1)',
        display: 'flex', justifyContent: 'space-around',
        padding: '8px 0 max(8px, env(safe-area-inset-bottom))',
      }} className="bottom-nav">
        {NAV_ITEMS.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            end={item.exact}
            style={({ isActive }) => ({
              display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '2px',
              color: isActive ? 'var(--cream)' : 'rgba(240,230,211,0.5)',
              textDecoration: 'none', minWidth: '60px',
              fontFamily: 'var(--font-ui)', fontSize: '0.7rem',
            })}
          >
            <span style={{ fontSize: '1.4rem' }}>{item.icon}</span>
            <span>{item.label}</span>
          </NavLink>
        ))}
      </nav>

      <style>{`
        @media (min-width: 641px) {
          .mobile-menu-btn { display: none !important; }
          .bottom-nav { display: none !important; }
        }
        @media (max-width: 640px) {
          .desktop-nav { display: none !important; }
        }
      `}</style>
    </div>
  );
}

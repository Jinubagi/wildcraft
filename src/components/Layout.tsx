import { Outlet, NavLink, useNavigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import NicknameModal, { getNickname } from './NicknameModal';

const NAV_ITEMS = [
  { to: '/', label: '홈', icon: '🏕️', exact: true },
  { to: '/daily', label: '사부작', icon: '🪓', exact: false },
  { to: '/ai', label: 'AI', icon: '🤖', exact: false },
  { to: '/qna', label: 'Q&A', icon: '💬', exact: false },
  { to: '/checklist', label: '준비물', icon: '📋', exact: false },
  { to: '/emergency', label: '긴급', icon: '🆘', exact: false },
];

export default function Layout() {
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);
  const [nickname, setNickname] = useState(() => getNickname());
  const [modalOpen, setModalOpen] = useState(false);
  const [isFirstVisit, setIsFirstVisit] = useState(false);

  useEffect(() => {
    const existing = getNickname();
    if (!existing) {
      setIsFirstVisit(true);
      setModalOpen(true);
    }
  }, []);

  function handleModalClose(name: string) {
    setNickname(name);
    setModalOpen(false);
    setIsFirstVisit(false);
  }

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

        {/* Nickname button */}
        <button
          onClick={() => setModalOpen(true)}
          style={{
            background: 'rgba(255,255,255,0.12)', border: '1px solid rgba(240,230,211,0.25)',
            borderRadius: 20, cursor: 'pointer',
            color: 'rgba(240,230,211,0.85)',
            fontFamily: 'var(--font-ui)', fontSize: '0.78rem',
            padding: '4px 10px', whiteSpace: 'nowrap',
            transition: 'all 0.15s',
          }}
          onMouseEnter={(e) => { (e.currentTarget as HTMLButtonElement).style.background = 'rgba(255,255,255,0.2)'; }}
          onMouseLeave={(e) => { (e.currentTarget as HTMLButtonElement).style.background = 'rgba(255,255,255,0.12)'; }}
          title="닉네임 변경"
        >
          {nickname ? `👤 ${nickname}` : '👤 닉네임 설정'}
        </button>

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
              textDecoration: 'none', minWidth: '52px',
              fontFamily: 'var(--font-ui)', fontSize: '0.65rem',
            })}
          >
            <span style={{ fontSize: '1.3rem' }}>{item.icon}</span>
            <span>{item.label}</span>
          </NavLink>
        ))}
      </nav>

      {/* Nickname Modal */}
      <NicknameModal
        open={modalOpen}
        onClose={handleModalClose}
        isFirstVisit={isFirstVisit}
      />

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

import { Outlet, NavLink, useNavigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import NicknameModal, { getNickname } from './NicknameModal';

const NAV_ITEMS = [
  { to: '/', label: '홈', icon: '🏕️', exact: true },
  { to: '/daily', label: '사부작', icon: '🪓', exact: false },
  { to: '/ai', label: 'AI', icon: '🤖', exact: false },
  { to: '/qna', label: 'Q&A', icon: '💬', exact: false },
  { to: '/checklist', label: '준비물', icon: '📋', exact: false },
  { to: '/woodcarving', label: '우드카빙', icon: '🪵', exact: false },
  { to: '/cooking', label: '요리', icon: '🍳', exact: false },
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
          🌿 WILDCRAFT
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
                color: item.to === '/emergency'
                  ? '#ff6b4a'
                  : (isActive ? 'var(--cream)' : 'rgba(240,230,211,0.7)'),
                background: isActive ? 'rgba(255,255,255,0.15)' : 'transparent',
                fontFamily: 'var(--font-body)', fontSize: '0.95rem',
                fontWeight: item.to === '/emergency' ? 700 : 400,
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

      {/* Side drawer overlay */}
      {menuOpen && (
        <div
          onClick={() => setMenuOpen(false)}
          style={{
            position: 'fixed', inset: 0, zIndex: 98,
            background: 'rgba(0,0,0,0.45)',
            backdropFilter: 'blur(2px)',
          }}
        />
      )}

      {/* Side drawer */}
      <nav style={{
        position: 'fixed', top: 0, left: 0, bottom: 0, zIndex: 99,
        width: 240,
        background: 'var(--bark)',
        boxShadow: menuOpen ? '4px 0 24px rgba(0,0,0,0.4)' : 'none',
        display: 'flex', flexDirection: 'column',
        paddingTop: 'var(--nav-h)',
        transform: menuOpen ? 'translateX(0)' : 'translateX(-100%)',
        transition: 'transform 0.25s cubic-bezier(0.4,0,0.2,1)',
        overflowY: 'auto',
      }} className="side-drawer">
        <div style={{ padding: '12px 16px 8px', borderBottom: '1px solid rgba(255,255,255,0.08)' }}>
          <p style={{
            color: 'rgba(240,230,211,0.5)', fontSize: '0.7rem',
            textTransform: 'uppercase', letterSpacing: '1px', margin: 0,
          }}>메뉴</p>
        </div>
        {NAV_ITEMS.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            end={item.exact}
            onClick={() => setMenuOpen(false)}
            style={({ isActive }) => ({
              display: 'flex', alignItems: 'center', gap: '12px',
              padding: '13px 20px',
              color: item.to === '/emergency'
                ? '#ff6b4a'
                : (isActive ? 'var(--cream)' : 'rgba(240,230,211,0.75)'),
              background: isActive ? 'rgba(255,255,255,0.1)' : 'transparent',
              fontFamily: 'var(--font-body)', fontSize: '1rem',
              fontWeight: item.to === '/emergency' ? 700 : 400,
              textDecoration: 'none',
              borderBottom: '1px solid rgba(255,255,255,0.05)',
              transition: 'background 0.1s',
            })}
          >
            <span style={{ fontSize: '1.2rem', width: 24, textAlign: 'center' }}>{item.icon}</span>
            {item.label}
          </NavLink>
        ))}
      </nav>

      {/* Main content */}
      <main style={{ flex: 1 }}>
        <Outlet />
      </main>

      {/* Nickname Modal */}
      <NicknameModal
        open={modalOpen}
        onClose={handleModalClose}
        isFirstVisit={isFirstVisit}
      />

      <style>{`
        @media (min-width: 641px) {
          .mobile-menu-btn { display: none !important; }
          .side-drawer { display: none !important; }
        }
        @media (max-width: 640px) {
          .desktop-nav { display: none !important; }
        }
      `}</style>
    </div>
  );
}

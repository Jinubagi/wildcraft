const InstagramIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <rect x="2" y="2" width="20" height="20" rx="5" stroke="currentColor" strokeWidth="1.8" fill="none"/>
    <circle cx="12" cy="12" r="4.5" stroke="currentColor" strokeWidth="1.8" fill="none"/>
    <circle cx="17.5" cy="6.5" r="1" fill="currentColor"/>
  </svg>
);

export default function WoodCarving() {
  return (
    <div className="page" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '60vh', textAlign: 'center' }}>
      <div style={{ fontSize: '4rem', marginBottom: 16 }}>🪵</div>
      <h1 style={{ marginBottom: 8 }}>우드카빙</h1>
      <div style={{
        display: 'inline-block',
        padding: '6px 16px',
        borderRadius: 20,
        background: '#fff3e0',
        color: '#b45309',
        fontSize: '0.85rem',
        fontWeight: 600,
        border: '1px solid #fcd34d',
        marginBottom: 28,
        letterSpacing: '0.04em',
      }}>
        🚧 공사중
      </div>

      <p style={{ color: 'var(--text-muted)', fontSize: '1rem', marginBottom: 32, maxWidth: 280, lineHeight: 1.7 }}>
        나무를 깎고 다듬는 우드카빙 콘텐츠를 준비하고 있습니다.<br />
        고수에게 먼저 물어보세요!
      </p>

      <a
        href="https://www.instagram.com/Vanji_outdoors"
        target="_blank"
        rel="noopener noreferrer"
        style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: 10,
          padding: '13px 24px',
          borderRadius: 12,
          background: 'linear-gradient(135deg, #f09433 0%, #e6683c 25%, #dc2743 50%, #cc2366 75%, #bc1888 100%)',
          color: 'white',
          textDecoration: 'none',
          fontWeight: 600,
          fontSize: '1rem',
          boxShadow: '0 4px 16px rgba(220,39,67,0.35)',
          transition: 'transform 0.15s, box-shadow 0.15s',
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.transform = 'translateY(-2px)';
          e.currentTarget.style.boxShadow = '0 6px 20px rgba(220,39,67,0.45)';
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.transform = '';
          e.currentTarget.style.boxShadow = '0 4px 16px rgba(220,39,67,0.35)';
        }}
      >
        <InstagramIcon />
        @Vanji_outdoors
      </a>
    </div>
  );
}

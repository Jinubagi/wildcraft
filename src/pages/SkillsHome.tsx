import { useNavigate } from 'react-router-dom';

const CATEGORIES = [
  { id: 'fire',      emoji: '🔥', label: '불피우기',  desc: '마찰발화, 부싯돌, 불 관리' },
  { id: 'knots',     emoji: '🪢', label: '매듭법',    desc: '보울라인, 히치, 래핑' },
  { id: 'shelter',   emoji: '⛺', label: '쉘터',      desc: '타프, 자연 쉘터, 비박' },
  { id: 'water',     emoji: '💧', label: '식수',      desc: '정수, 수집, 안전 판별' },
  { id: 'emergency', emoji: '🆘', label: '긴급상황',  desc: 'STOP 원칙, 저체온증, 동물' },
];

export default function SkillsHome() {
  const navigate = useNavigate();

  return (
    <div className="page">
      <h1 style={{ margin: '0 0 6px' }}>🛠️ 스킬</h1>
      <p style={{ color: 'var(--text-muted)', fontSize: '0.95rem', marginBottom: 24 }}>
        카테고리를 선택하세요
      </p>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
        {CATEGORIES.map((cat) => (
          <button
            key={cat.id}
            onClick={() => navigate(`/skills/${cat.id}`)}
            style={{
              display: 'flex', alignItems: 'center', gap: 16,
              background: 'linear-gradient(145deg, var(--surface) 0%, #fdfaf7 100%)',
              border: '1.5px solid var(--border)',
              borderRadius: 12,
              padding: '16px 20px',
              cursor: 'pointer',
              textAlign: 'left',
              transition: 'all 0.2s',
              fontFamily: 'var(--font-body)',
              boxShadow: 'var(--shadow-sm)',
              width: '100%',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.boxShadow = 'var(--shadow)';
              e.currentTarget.style.transform = 'translateY(-2px)';
              e.currentTarget.style.borderColor = 'var(--moss)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.boxShadow = 'var(--shadow-sm)';
              e.currentTarget.style.transform = '';
              e.currentTarget.style.borderColor = 'var(--border)';
            }}
          >
            <span style={{ fontSize: '2.2rem', flexShrink: 0 }}>{cat.emoji}</span>
            <div>
              <div style={{
                fontFamily: 'var(--font-display)', fontWeight: 600,
                fontSize: '1.05rem', color: 'var(--bark)', marginBottom: 2,
              }}>{cat.label}</div>
              <div style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>{cat.desc}</div>
            </div>
            <span style={{ marginLeft: 'auto', color: 'var(--text-muted)', fontSize: '1.1rem' }}>›</span>
          </button>
        ))}
      </div>
    </div>
  );
}

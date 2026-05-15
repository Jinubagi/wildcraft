import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { askWildcraft } from '../lib/anthropic';

const CATEGORIES = [
  { id: 'fire', emoji: '🔥', label: '불피우기', desc: '마찰발화, 부싯돌, 불 관리' },
  { id: 'knots', emoji: '🪢', label: '매듭법', desc: '보울라인, 히치, 래핑' },
  { id: 'shelter', emoji: '⛺', label: '쉘터', desc: '타프, 자연 쉘터, 비박' },
  { id: 'water', emoji: '💧', label: '식수', desc: '정수, 수집, 안전 판별' },
  { id: 'emergency', emoji: '🆘', label: '긴급상황', desc: 'STOP 원칙, 저체온증, 동물' },
];

const QUICK_CHIPS = [
  '불 없이 따뜻하게 자는 법',
  '방향을 잃었을 때',
  '물이 없을 때 식수 확보',
  '타프 혼자 설치하는 법',
  '나이프 하나로 할 수 있는 것',
];

export default function Home() {
  const navigate = useNavigate();
  const [question, setQuestion] = useState('');
  const [answer, setAnswer] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleAsk(q?: string) {
    const text = q ?? question;
    if (!text.trim()) return;
    setQuestion(text);
    setLoading(true);
    setAnswer('');
    try {
      const res = await askWildcraft([{ role: 'user', content: text }]);
      setAnswer(res);
    } catch {
      setAnswer('⚠️ API 키를 설정해주세요. `.env.local`에 `VITE_ANTHROPIC_API_KEY`를 추가하세요.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="page">
      {/* Hero */}
      <div style={{ textAlign: 'center', marginBottom: 32, paddingTop: 8 }}>
        <div style={{ fontSize: '3rem', marginBottom: 8 }}>🌿</div>
        <h1 style={{ margin: '0 0 8px', fontSize: 'clamp(1.6rem, 5vw, 2.4rem)' }}>
          WildCraft
        </h1>
        <p style={{ color: 'var(--text-muted)', fontSize: '1.05rem', fontStyle: 'italic' }}>
          자연 속에서 살아남는 기술의 수첩
        </p>
      </div>

      {/* Emergency button */}
      <div style={{ textAlign: 'center', marginBottom: 28 }}>
        <button
          className="btn btn-ember"
          onClick={() => navigate('/emergency')}
          style={{ fontSize: '1.1rem', padding: '12px 28px', gap: '8px' }}
        >
          🆘 긴급 상황 도움 받기
        </button>
      </div>

      {/* AI input */}
      <div className="card" style={{ marginBottom: 24 }}>
        <h2 style={{ fontSize: '1.1rem', marginBottom: 12 }}>
          🤖 AI에게 물어보기
        </h2>
        <div style={{ display: 'flex', gap: 8 }}>
          <input
            className="input"
            value={question}
            onChange={(e) => setQuestion(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleAsk()}
            placeholder="야외 생존 질문을 입력하세요..."
            disabled={loading}
          />
          <button
            className="btn btn-primary"
            onClick={() => handleAsk()}
            disabled={loading || !question.trim()}
            style={{ whiteSpace: 'nowrap', flexShrink: 0 }}
          >
            {loading ? <span className="spinner" /> : '물어보기'}
          </button>
        </div>

        {/* Quick chips */}
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginTop: 10 }}>
          {QUICK_CHIPS.map((chip) => (
            <button
              key={chip}
              onClick={() => handleAsk(chip)}
              disabled={loading}
              style={{
                padding: '4px 12px', borderRadius: 20,
                background: 'var(--cream)', color: 'var(--text-muted)',
                border: '1px solid var(--border)',
                cursor: 'pointer', fontSize: '0.82rem',
                fontFamily: 'var(--font-body)',
                transition: 'all 0.15s',
              }}
              onMouseEnter={(e) => {
                (e.target as HTMLButtonElement).style.background = 'var(--parch-dark)';
                (e.target as HTMLButtonElement).style.color = 'var(--bark)';
              }}
              onMouseLeave={(e) => {
                (e.target as HTMLButtonElement).style.background = 'var(--cream)';
                (e.target as HTMLButtonElement).style.color = 'var(--text-muted)';
              }}
            >
              {chip}
            </button>
          ))}
        </div>

        {/* Answer */}
        {loading && (
          <div style={{
            marginTop: 16, padding: '14px', borderRadius: 8,
            background: 'var(--cream)', color: 'var(--text-muted)',
            fontSize: '0.95rem',
          }}>
            🌿 생각하는 중<span className="loading-dots" />
          </div>
        )}
        {answer && !loading && (
          <div style={{
            marginTop: 16, padding: '14px', borderRadius: 8,
            background: 'var(--cream)',
            borderLeft: '3px solid var(--moss)',
          }}>
            <div
              className="prose"
              dangerouslySetInnerHTML={{
                __html: markdownToHtml(answer),
              }}
              style={{ fontSize: '0.95rem' }}
            />
          </div>
        )}
      </div>

      {/* Skill categories */}
      <p className="section-title">스킬 카테고리</p>
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fill, minmax(150px, 1fr))',
        gap: 12,
      }}>
        {CATEGORIES.map((cat) => (
          <button
            key={cat.id}
            onClick={() => navigate(`/skills/${cat.id}`)}
            style={{
              background: 'var(--surface)',
              border: '1px solid var(--border)',
              borderRadius: 10,
              padding: '16px 12px',
              cursor: 'pointer',
              textAlign: 'center',
              transition: 'all 0.2s',
              fontFamily: 'var(--font-body)',
            }}
            onMouseEnter={(e) => {
              const el = e.currentTarget;
              el.style.boxShadow = 'var(--shadow)';
              el.style.transform = 'translateY(-2px)';
              el.style.borderColor = 'var(--moss)';
            }}
            onMouseLeave={(e) => {
              const el = e.currentTarget;
              el.style.boxShadow = '';
              el.style.transform = '';
              el.style.borderColor = 'var(--border)';
            }}
          >
            <div style={{ fontSize: '2rem', marginBottom: 6 }}>{cat.emoji}</div>
            <div style={{
              fontFamily: 'var(--font-display)', fontWeight: 600,
              fontSize: '1rem', color: 'var(--bark)', marginBottom: 4,
            }}>{cat.label}</div>
            <div style={{
              fontSize: '0.78rem', color: 'var(--text-muted)',
              lineHeight: 1.3,
            }}>{cat.desc}</div>
          </button>
        ))}
      </div>
    </div>
  );
}

// Minimal markdown → HTML
function markdownToHtml(md: string): string {
  return md
    .replace(/^### (.+)$/gm, '<h3>$1</h3>')
    .replace(/^## (.+)$/gm, '<h2>$1</h2>')
    .replace(/^# (.+)$/gm, '<h1>$1</h1>')
    .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
    .replace(/\*(.+?)\*/g, '<em>$1</em>')
    .replace(/`(.+?)`/g, '<code>$1</code>')
    .replace(/^- (.+)$/gm, '<li>$1</li>')
    .replace(/(<li>.*<\/li>\n?)+/g, (m) => `<ul>${m}</ul>`)
    .replace(/^\d+\. (.+)$/gm, '<li>$1</li>')
    .replace(/^---$/gm, '<hr>')
    .replace(/\n\n/g, '</p><p>')
    .replace(/^(?!<[hul]|<li|<hr)(.+)$/gm, '<p>$1</p>');
}

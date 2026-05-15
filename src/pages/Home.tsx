import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { askWildcraft } from '../lib/anthropic';
import DailySkill from '../components/DailySkill';

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

const DEFAULT_RULES = [
  'Leave No Trace — 자연을 있는 그대로 남겨라',
  '불은 완전히 꺼진 것을 확인하라',
  '항상 나이프는 몸 바깥 방향으로',
  '혼자 입산 시 반드시 귀환 시간을 알려라',
  '물은 반드시 정수 후 마셔라',
];

const DEFAULT_GLOSSARY: Record<string, string> = {
  부시크래프트: '자연 재료만으로 야외 생존 기술을 실천하는 활동',
  페더스틱: '나무를 얇게 깎아 만든 불쏘시개',
  타프: '방수 천으로 만든 간이 지붕 쉘터',
  파라코드: '낙하산 줄. 야외에서 다목적으로 사용',
  틴더: '불씨를 받아 불로 키우는 마른 풀·나무껍질',
};

const RULES_KEY = 'wildcraft_rules';
const GLOSSARY_KEY = 'wildcraft_glossary';

function loadRules(): string[] {
  try {
    const raw = localStorage.getItem(RULES_KEY);
    return raw ? (JSON.parse(raw) as string[]) : DEFAULT_RULES;
  } catch { return DEFAULT_RULES; }
}

function saveRules(rules: string[]) {
  try { localStorage.setItem(RULES_KEY, JSON.stringify(rules)); } catch { /* noop */ }
}

function loadGlossary(): Record<string, string> {
  try {
    const raw = localStorage.getItem(GLOSSARY_KEY);
    return raw ? (JSON.parse(raw) as Record<string, string>) : DEFAULT_GLOSSARY;
  } catch { return DEFAULT_GLOSSARY; }
}

function saveGlossary(g: Record<string, string>) {
  try { localStorage.setItem(GLOSSARY_KEY, JSON.stringify(g)); } catch { /* noop */ }
}

// ---- Rules Section ----
function RulesSection() {
  const [open, setOpen] = useState(false);
  const [rules, setRules] = useState<string[]>(loadRules);
  const [input, setInput] = useState('');

  function addRule() {
    const trimmed = input.trim();
    if (!trimmed) return;
    const next = [...rules, trimmed];
    setRules(next);
    saveRules(next);
    setInput('');
  }

  function removeRule(idx: number) {
    const next = rules.filter((_, i) => i !== idx);
    setRules(next);
    saveRules(next);
  }

  return (
    <div style={{
      background: 'linear-gradient(145deg, var(--surface) 0%, #fdfaf7 100%)',
      border: '1.5px solid var(--border)',
      borderRadius: 12, marginBottom: 12,
      overflow: 'hidden',
      boxShadow: 'var(--shadow-sm)',
    }}>
      <button
        onClick={() => setOpen(!open)}
        style={{
          width: '100%', padding: '14px 18px',
          background: 'none', border: 'none', cursor: 'pointer',
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          fontFamily: 'var(--font-display)', fontWeight: 600,
          fontSize: '1rem', color: 'var(--bark)',
          transition: 'background 0.15s',
        }}
        onMouseEnter={(e) => { (e.currentTarget as HTMLButtonElement).style.background = 'var(--cream)'; }}
        onMouseLeave={(e) => { (e.currentTarget as HTMLButtonElement).style.background = 'none'; }}
      >
        <span>📋 기본 수칙</span>
        <span style={{ color: 'var(--text-muted)', fontSize: '0.85rem', transition: 'transform 0.2s', display: 'inline-block', transform: open ? 'rotate(180deg)' : 'none' }}>▼</span>
      </button>

      {open && (
        <div style={{ padding: '0 18px 16px' }}>
          <ol style={{ margin: '0 0 12px', paddingLeft: '1.4em', display: 'flex', flexDirection: 'column', gap: 8 }}>
            {rules.map((rule, idx) => (
              <li key={idx} style={{ fontSize: '0.92rem', lineHeight: 1.5, display: 'flex', alignItems: 'flex-start', gap: 8 }}>
                <span style={{ flex: 1 }}>{rule}</span>
                <button
                  onClick={() => removeRule(idx)}
                  style={{
                    background: 'none', border: 'none', cursor: 'pointer',
                    color: 'var(--text-muted)', fontSize: '0.85rem',
                    padding: '0 2px', lineHeight: 1, flexShrink: 0,
                    opacity: 0.6, transition: 'opacity 0.15s',
                  }}
                  onMouseEnter={(e) => { (e.currentTarget as HTMLButtonElement).style.opacity = '1'; }}
                  onMouseLeave={(e) => { (e.currentTarget as HTMLButtonElement).style.opacity = '0.6'; }}
                  title="삭제"
                >✕</button>
              </li>
            ))}
          </ol>
          <div style={{ display: 'flex', gap: 8 }}>
            <input
              className="input"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && addRule()}
              placeholder="새 수칙 추가..."
              style={{ flex: 1, fontSize: '0.88rem', padding: '7px 12px' }}
            />
            <button
              className="btn btn-primary"
              onClick={addRule}
              disabled={!input.trim()}
              style={{ padding: '7px 14px', fontSize: '0.88rem' }}
            >
              추가
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

// ---- Glossary Section ----
function GlossarySection() {
  const [open, setOpen] = useState(false);
  const [glossary, setGlossary] = useState<Record<string, string>>(loadGlossary);
  const [termInput, setTermInput] = useState('');
  const [defInput, setDefInput] = useState('');

  function addTerm() {
    const term = termInput.trim();
    const def = defInput.trim();
    if (!term || !def) return;
    const next = { ...glossary, [term]: def };
    setGlossary(next);
    saveGlossary(next);
    setTermInput('');
    setDefInput('');
  }

  function removeTerm(key: string) {
    const next = { ...glossary };
    delete next[key];
    setGlossary(next);
    saveGlossary(next);
  }

  return (
    <div style={{
      background: 'linear-gradient(145deg, var(--surface) 0%, #fdfaf7 100%)',
      border: '1.5px solid var(--border)',
      borderRadius: 12, marginBottom: 24,
      overflow: 'hidden',
      boxShadow: 'var(--shadow-sm)',
    }}>
      <button
        onClick={() => setOpen(!open)}
        style={{
          width: '100%', padding: '14px 18px',
          background: 'none', border: 'none', cursor: 'pointer',
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          fontFamily: 'var(--font-display)', fontWeight: 600,
          fontSize: '1rem', color: 'var(--bark)',
          transition: 'background 0.15s',
        }}
        onMouseEnter={(e) => { (e.currentTarget as HTMLButtonElement).style.background = 'var(--cream)'; }}
        onMouseLeave={(e) => { (e.currentTarget as HTMLButtonElement).style.background = 'none'; }}
      >
        <span>📖 용어 사전</span>
        <span style={{ color: 'var(--text-muted)', fontSize: '0.85rem', transition: 'transform 0.2s', display: 'inline-block', transform: open ? 'rotate(180deg)' : 'none' }}>▼</span>
      </button>

      {open && (
        <div style={{ padding: '0 18px 16px' }}>
          <dl style={{ margin: '0 0 14px', display: 'flex', flexDirection: 'column', gap: 10 }}>
            {Object.entries(glossary).map(([term, def]) => (
              <div key={term} style={{
                padding: '10px 12px', borderRadius: 8,
                background: 'var(--cream)', border: '1px solid var(--border-light)',
                display: 'flex', gap: 10, alignItems: 'flex-start',
              }}>
                <div style={{ flex: 1 }}>
                  <dt style={{
                    fontFamily: 'var(--font-display)', fontWeight: 700,
                    fontSize: '0.95rem', color: 'var(--bark)', marginBottom: 2,
                  }}>{term}</dt>
                  <dd style={{ margin: 0, fontSize: '0.85rem', color: 'var(--text-muted)', lineHeight: 1.45 }}>{def}</dd>
                </div>
                <button
                  onClick={() => removeTerm(term)}
                  style={{
                    background: 'none', border: 'none', cursor: 'pointer',
                    color: 'var(--text-muted)', fontSize: '0.85rem',
                    padding: '0 2px', lineHeight: 1, flexShrink: 0,
                    opacity: 0.6, transition: 'opacity 0.15s',
                  }}
                  onMouseEnter={(e) => { (e.currentTarget as HTMLButtonElement).style.opacity = '1'; }}
                  onMouseLeave={(e) => { (e.currentTarget as HTMLButtonElement).style.opacity = '0.6'; }}
                  title="삭제"
                >✕</button>
              </div>
            ))}
          </dl>

          <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
            <input
              className="input"
              value={termInput}
              onChange={(e) => setTermInput(e.target.value)}
              placeholder="용어"
              style={{ flex: '0 0 100px', fontSize: '0.88rem', padding: '7px 10px' }}
            />
            <input
              className="input"
              value={defInput}
              onChange={(e) => setDefInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && addTerm()}
              placeholder="설명"
              style={{ flex: 1, minWidth: '120px', fontSize: '0.88rem', padding: '7px 10px' }}
            />
            <button
              className="btn btn-primary"
              onClick={addTerm}
              disabled={!termInput.trim() || !defInput.trim()}
              style={{ padding: '7px 14px', fontSize: '0.88rem' }}
            >
              추가
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

// ---- Main Home ----
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
      <div style={{ textAlign: 'center', marginBottom: 28, paddingTop: 8 }}>
        <div style={{ fontSize: '3rem', marginBottom: 8 }}>🌿</div>
        <h1 style={{ margin: '0 0 8px', fontSize: 'clamp(1.6rem, 5vw, 2.4rem)' }}>
          WildCraft
        </h1>
        <p style={{ color: 'var(--text-muted)', fontSize: '1.05rem', fontStyle: 'italic' }}>
          자연 속에서 살아남는 기술의 수첩
        </p>
      </div>

      {/* Daily Skill */}
      <p className="section-title">오늘의 사부작</p>
      <DailySkill />

      {/* Rules & Glossary */}
      <p className="section-title">수칙 · 용어</p>
      <RulesSection />
      <GlossarySection />

      {/* Skill categories */}
      <p className="section-title">스킬 카테고리</p>
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fill, minmax(150px, 1fr))',
        gap: 12,
        marginBottom: 32,
      }}>
        {CATEGORIES.map((cat) => (
          <button
            key={cat.id}
            onClick={() => navigate(`/skills/${cat.id}`)}
            style={{
              background: 'linear-gradient(145deg, var(--surface) 0%, #fdfaf7 100%)',
              border: '1.5px solid var(--border)',
              borderRadius: 12,
              padding: '16px 12px',
              cursor: 'pointer',
              textAlign: 'center',
              transition: 'all 0.2s cubic-bezier(0.4,0,0.2,1)',
              fontFamily: 'var(--font-body)',
              boxShadow: 'var(--shadow-sm)',
            }}
            onMouseEnter={(e) => {
              const el = e.currentTarget;
              el.style.boxShadow = 'var(--shadow)';
              el.style.transform = 'translateY(-3px)';
              el.style.borderColor = 'var(--moss)';
            }}
            onMouseLeave={(e) => {
              const el = e.currentTarget;
              el.style.boxShadow = 'var(--shadow-sm)';
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

      {/* AI input — at the bottom */}
      <p className="section-title">AI 가이드</p>
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
                padding: '4px 12px', borderRadius: 50,
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

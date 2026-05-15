import { useState } from 'react';
import { generateChecklist } from '../lib/anthropic';

const ACTIVITIES = [
  { id: 'hiking', emoji: '🥾', label: '하이킹' },
  { id: 'camping', emoji: '⛺', label: '캠핑' },
  { id: 'bushcraft', emoji: '🪓', label: '부시크래프트' },
  { id: 'survival', emoji: '🌿', label: '생존 훈련' },
  { id: 'fishing', emoji: '🎣', label: '낚시' },
  { id: 'climbing', emoji: '🧗', label: '암벽 등반' },
];

const SEASONS = [
  { id: 'spring', emoji: '🌸', label: '봄' },
  { id: 'summer', emoji: '☀️', label: '여름' },
  { id: 'autumn', emoji: '🍂', label: '가을' },
  { id: 'winter', emoji: '❄️', label: '겨울' },
];

const DURATIONS = [
  { id: '당일', label: '당일치기' },
  { id: '1박 2일', label: '1박 2일' },
  { id: '2박 3일', label: '2박 3일' },
  { id: '1주일+', label: '장기 (1주+)' },
];

interface ChecklistItem {
  category: string;
  items: string[];
}

function parseChecklist(text: string): ChecklistItem[] {
  const sections: ChecklistItem[] = [];
  let current: ChecklistItem | null = null;

  for (const line of text.split('\n')) {
    const trimmed = line.trim();
    if (!trimmed) continue;

    const headingMatch = trimmed.match(/^#+\s+(.+)$/) || trimmed.match(/^\*\*(.+)\*\*$/);
    if (headingMatch) {
      if (current) sections.push(current);
      current = { category: headingMatch[1].replace(/[*#]/g, '').trim(), items: [] };
    } else if (trimmed.match(/^[-•*]\s+(.+)$/) || trimmed.match(/^\d+\.\s+(.+)$/)) {
      const item = trimmed.replace(/^[-•*\d.]+\s+/, '').replace(/\*\*/g, '');
      if (!current) current = { category: '필수 준비물', items: [] };
      current.items.push(item);
    }
  }
  if (current) sections.push(current);
  return sections.filter((s) => s.items.length > 0);
}

export default function Checklist() {
  const [activity, setActivity] = useState('');
  const [season, setSeason] = useState('');
  const [duration, setDuration] = useState('당일');
  const [checklist, setChecklist] = useState<ChecklistItem[]>([]);
  const [checked, setChecked] = useState<Record<string, boolean>>({});
  const [loading, setLoading] = useState(false);
  const [rawText, setRawText] = useState('');

  async function handleGenerate() {
    if (!activity || !season) return;
    setLoading(true);
    setChecklist([]);
    setChecked({});
    setRawText('');
    try {
      const res = await generateChecklist(activity, season, duration);
      setRawText(res);
      const parsed = parseChecklist(res);
      setChecklist(parsed);
    } catch {
      setRawText('⚠️ API 키를 설정해야 AI 체크리스트를 생성할 수 있습니다.');
    } finally {
      setLoading(false);
    }
  }

  function toggleItem(key: string) {
    setChecked((prev) => ({ ...prev, [key]: !prev[key] }));
  }

  const totalItems = checklist.reduce((sum, c) => sum + c.items.length, 0);
  const checkedCount = Object.values(checked).filter(Boolean).length;

  const activityLabel = ACTIVITIES.find((a) => a.id === activity)?.label ?? activity;
  const seasonLabel = SEASONS.find((s) => s.id === season)?.label ?? season;

  return (
    <div className="page">
      <div style={{ marginBottom: 24 }}>
        <h1 style={{ margin: '0 0 6px' }}>🎒 준비물 체크리스트</h1>
        <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>
          활동과 계절을 선택하면 AI가 맞춤 준비물을 생성합니다
        </p>
      </div>

      {/* Activity selector */}
      <div className="card" style={{ marginBottom: 16 }}>
        <p className="section-title" style={{ marginBottom: 10 }}>활동 종류</p>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
          {ACTIVITIES.map((a) => (
            <button
              key={a.id}
              onClick={() => setActivity(a.id)}
              style={{
                display: 'flex', alignItems: 'center', gap: 6,
                padding: '8px 14px', borderRadius: 20,
                cursor: 'pointer', fontSize: '0.92rem',
                fontFamily: 'var(--font-body)',
                background: activity === a.id ? 'var(--moss)' : 'var(--cream)',
                color: activity === a.id ? 'white' : 'var(--bark)',
                border: `1px solid ${activity === a.id ? 'var(--moss)' : 'var(--border)'}`,
                transition: 'all 0.15s',
              }}
            >
              {a.emoji} {a.label}
            </button>
          ))}
        </div>
      </div>

      {/* Season selector */}
      <div className="card" style={{ marginBottom: 16 }}>
        <p className="section-title" style={{ marginBottom: 10 }}>계절</p>
        <div style={{ display: 'flex', gap: 8 }}>
          {SEASONS.map((s) => (
            <button
              key={s.id}
              onClick={() => setSeason(s.id)}
              style={{
                flex: 1, padding: '10px 4px', borderRadius: 10,
                cursor: 'pointer', fontSize: '0.88rem', textAlign: 'center',
                fontFamily: 'var(--font-body)',
                background: season === s.id ? 'var(--moss)' : 'var(--cream)',
                color: season === s.id ? 'white' : 'var(--bark)',
                border: `1px solid ${season === s.id ? 'var(--moss)' : 'var(--border)'}`,
                transition: 'all 0.15s',
              }}
            >
              <div style={{ fontSize: '1.4rem', marginBottom: 2 }}>{s.emoji}</div>
              {s.label}
            </button>
          ))}
        </div>
      </div>

      {/* Duration selector */}
      <div className="card" style={{ marginBottom: 20 }}>
        <p className="section-title" style={{ marginBottom: 10 }}>기간</p>
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
          {DURATIONS.map((d) => (
            <button
              key={d.id}
              onClick={() => setDuration(d.id)}
              style={{
                padding: '8px 16px', borderRadius: 20,
                cursor: 'pointer', fontSize: '0.9rem',
                fontFamily: 'var(--font-body)',
                background: duration === d.id ? 'var(--bark)' : 'var(--cream)',
                color: duration === d.id ? 'var(--cream)' : 'var(--bark)',
                border: `1px solid ${duration === d.id ? 'var(--bark)' : 'var(--border)'}`,
                transition: 'all 0.15s',
              }}
            >
              {d.label}
            </button>
          ))}
        </div>
      </div>

      {/* Generate button */}
      <button
        className="btn btn-primary"
        onClick={handleGenerate}
        disabled={loading || !activity || !season}
        style={{ width: '100%', justifyContent: 'center', marginBottom: 24, padding: '14px' }}
      >
        {loading ? (
          <><span className="spinner" /> AI 체크리스트 생성 중<span className="loading-dots" /></>
        ) : '🤖 체크리스트 생성하기'}
      </button>

      {/* Error / raw text fallback */}
      {rawText && checklist.length === 0 && !loading && (
        <div style={{
          padding: '14px', borderRadius: 8, background: '#fce8e2',
          color: 'var(--ember)', fontSize: '0.9rem', marginBottom: 20,
        }}>
          {rawText}
        </div>
      )}

      {/* Progress bar */}
      {checklist.length > 0 && (
        <div style={{ marginBottom: 20 }}>
          <div style={{
            display: 'flex', justifyContent: 'space-between',
            fontSize: '0.9rem', marginBottom: 6, color: 'var(--text-muted)',
          }}>
            <span>
              📋 {activityLabel} · {seasonLabel} · {duration}
            </span>
            <span style={{ fontWeight: 600, color: checkedCount === totalItems ? 'var(--moss)' : 'var(--bark)' }}>
              {checkedCount} / {totalItems}
            </span>
          </div>
          <div style={{
            height: 8, borderRadius: 4, background: 'var(--border)',
            overflow: 'hidden',
          }}>
            <div style={{
              height: '100%',
              width: `${totalItems ? (checkedCount / totalItems) * 100 : 0}%`,
              background: checkedCount === totalItems ? 'var(--moss)' : 'var(--bark)',
              borderRadius: 4,
              transition: 'width 0.3s ease',
            }} />
          </div>
          {checkedCount === totalItems && totalItems > 0 && (
            <p style={{
              textAlign: 'center', marginTop: 8,
              color: 'var(--moss)', fontFamily: 'var(--font-display)',
              fontSize: '1rem', fontWeight: 600,
            }}>
              ✅ 모든 준비 완료! 안전한 여행 되세요.
            </p>
          )}
        </div>
      )}

      {/* Checklist sections */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
        {checklist.map((section) => (
          <div
            key={section.category}
            style={{
              background: 'var(--surface)',
              border: '1px solid var(--border)',
              borderRadius: 10,
              overflow: 'hidden',
              boxShadow: 'var(--shadow-sm)',
            }}
          >
            <div style={{
              padding: '12px 16px',
              borderBottom: '1px solid var(--border)',
              background: 'var(--cream)',
              fontFamily: 'var(--font-display)',
              fontWeight: 600, fontSize: '1rem',
              color: 'var(--bark)',
              display: 'flex', justifyContent: 'space-between',
            }}>
              <span>{section.category}</span>
              <span style={{ fontSize: '0.85rem', fontWeight: 400, color: 'var(--text-muted)' }}>
                {section.items.filter((_, i) => checked[`${section.category}-${i}`]).length}
                /{section.items.length}
              </span>
            </div>
            <div style={{ padding: '8px 0' }}>
              {section.items.map((item, i) => {
                const key = `${section.category}-${i}`;
                const isDone = checked[key];
                return (
                  <label
                    key={i}
                    style={{
                      display: 'flex', alignItems: 'flex-start', gap: 12,
                      padding: '10px 16px', cursor: 'pointer',
                      background: isDone ? 'rgba(74, 94, 58, 0.06)' : 'transparent',
                      transition: 'background 0.15s',
                    }}
                  >
                    <input
                      type="checkbox"
                      checked={isDone ?? false}
                      onChange={() => toggleItem(key)}
                      style={{
                        marginTop: 2, width: 18, height: 18,
                        accentColor: 'var(--moss)', cursor: 'pointer',
                        flexShrink: 0,
                      }}
                    />
                    <span style={{
                      fontSize: '0.93rem', lineHeight: 1.5,
                      textDecoration: isDone ? 'line-through' : 'none',
                      color: isDone ? 'var(--text-muted)' : 'var(--text)',
                      transition: 'all 0.15s',
                    }}>
                      {item}
                    </span>
                  </label>
                );
              })}
            </div>
          </div>
        ))}
      </div>

      {checklist.length > 0 && (
        <div style={{ marginTop: 20, textAlign: 'center' }}>
          <button
            className="btn btn-ghost"
            onClick={() => {
              setChecklist([]);
              setChecked({});
              setRawText('');
              setActivity('');
              setSeason('');
            }}
            style={{ fontSize: '0.9rem' }}
          >
            🔄 초기화
          </button>
        </div>
      )}
    </div>
  );
}

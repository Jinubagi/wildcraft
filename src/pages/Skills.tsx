import { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { fetchSkillItems, fetchCorrections, type SkillItem, type Correction } from '../lib/firebase';
import { SEED_DATA } from '../lib/seedData';
import BottomSheet from '../components/BottomSheet';

const CATEGORY_META: Record<string, { emoji: string; label: string; color: string }> = {
  fire: { emoji: '🔥', label: '불피우기', color: '#c4441a' },
  knots: { emoji: '🪢', label: '매듭법', color: '#5d7449' },
  shelter: { emoji: '⛺', label: '쉘터 만들기', color: '#4a5e3a' },
  water: { emoji: '💧', label: '식수 확보', color: '#2a6b8a' },
  emergency: { emoji: '🆘', label: '긴급상황', color: '#c4441a' },
};

type LevelFilter = '전체' | '초급' | '중급' | '고급';
const LEVELS: LevelFilter[] = ['전체', '초급', '중급', '고급'];

export default function Skills() {
  const { category = 'fire' } = useParams();
  const navigate = useNavigate();
  const meta = CATEGORY_META[category] ?? { emoji: '📖', label: category, color: '#4a5e3a' };

  const staticFallback = (SEED_DATA[category] ?? []).map((item, idx) => ({
    id: `static-${idx}`,
    ...item,
    createdAt: null,
  })) as SkillItem[];

  const [items, setItems] = useState<SkillItem[]>(staticFallback);
  const [corrections, setCorrections] = useState<Correction[]>([]);
  const [loading] = useState(false);
  const [expanded, setExpanded] = useState<string | null>(null);
  const [levelFilter, setLevelFilter] = useState<LevelFilter>('전체');
  const [sheet, setSheet] = useState<{ open: boolean; itemId: string; itemTitle: string }>({
    open: false, itemId: '', itemTitle: '',
  });

  const load = useCallback(async () => {
    try {
      const [i, c] = await Promise.all([
        fetchSkillItems(category),
        fetchCorrections(category),
      ]);
      if (i.length > 0) setItems(i);
      setCorrections(c);
    } catch {
      // Firebase not configured — keep static fallback already shown
    }
  }, [category]);

  // Reset to static data immediately when category changes
  useEffect(() => {
    const fallback = (SEED_DATA[category] ?? []).map((item, idx) => ({
      id: `static-${idx}`, ...item, createdAt: null,
    })) as SkillItem[];
    setItems(fallback);
    setExpanded(null);
  }, [category]);

  useEffect(() => { load(); }, [load]);

  function openSheet(itemId: string, itemTitle: string) {
    setSheet({ open: true, itemId, itemTitle });
  }

  function getCorrectionsFor(itemId: string) {
    return corrections.filter((c) => c.itemId === itemId);
  }

  const filteredItems = levelFilter === '전체'
    ? items
    : items.filter((item) => item.tags?.includes(levelFilter));

  return (
    <div className="page">
      {/* Header */}
      <button
        onClick={() => navigate('/')}
        style={{
          background: 'none', border: 'none', cursor: 'pointer',
          color: 'var(--text-muted)', fontSize: '0.9rem',
          padding: '0 0 12px', fontFamily: 'var(--font-body)',
        }}
      >
        ← 홈으로
      </button>

      <div style={{ marginBottom: 20 }}>
        <h1 style={{ margin: '0 0 4px', display: 'flex', alignItems: 'center', gap: '10px' }}>
          <span>{meta.emoji}</span>
          <span>{meta.label}</span>
        </h1>
        <p style={{ color: 'var(--text-muted)', fontSize: '0.95rem' }}>
          {items.length}개의 스킬 · 용사들이 보완합니다
        </p>
      </div>

      {/* Level filter tabs */}
      <div style={{
        display: 'flex', gap: 4, marginBottom: 20,
        background: 'var(--cream)', borderRadius: 10, padding: 4,
        boxShadow: 'inset 0 1px 3px rgba(44,24,16,0.07)',
      }}>
        {LEVELS.map((level) => (
          <button
            key={level}
            onClick={() => setLevelFilter(level)}
            style={{
              flex: 1, padding: '8px 4px', borderRadius: 7, border: 'none',
              cursor: 'pointer', fontSize: '0.88rem',
              fontFamily: 'var(--font-body)',
              background: levelFilter === level
                ? 'linear-gradient(145deg, var(--surface) 0%, #fdfaf7 100%)'
                : 'transparent',
              color: levelFilter === level ? 'var(--bark)' : 'var(--text-muted)',
              fontWeight: levelFilter === level ? 600 : 400,
              boxShadow: levelFilter === level ? 'var(--shadow-sm)' : 'none',
              transition: 'all 0.15s',
            }}
          >
            {level}
          </button>
        ))}
      </div>

      {/* Loading */}
      {loading && (
        <div style={{ textAlign: 'center', padding: '40px', color: 'var(--text-muted)' }}>
          <span className="spinner" style={{ width: 28, height: 28 }} />
          <p style={{ marginTop: 12 }}>스킬을 불러오는 중...</p>
        </div>
      )}

      {/* No items at all notice */}
      {!loading && items.length === 0 && (
        <div style={{
          padding: '24px', borderRadius: 12, background: 'var(--cream)',
          border: '1px solid var(--border)', textAlign: 'center',
        }}>
          <p style={{ fontSize: '1.1rem', marginBottom: 8 }}>📭 스킬 데이터 없음</p>
          <p style={{ fontSize: '0.9rem', color: 'var(--text-muted)' }}>
            이 카테고리의 스킬 데이터를 불러올 수 없습니다.
          </p>
        </div>
      )}

      {/* No results for this level */}
      {!loading && items.length > 0 && filteredItems.length === 0 && (
        <div style={{
          padding: '24px', borderRadius: 12, background: 'var(--cream)',
          border: '1px solid var(--border)', textAlign: 'center',
        }}>
          <p style={{ fontSize: '1rem' }}>"{levelFilter}" 레벨의 스킬이 없습니다.</p>
        </div>
      )}

      {/* Skill items */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
        {filteredItems.map((item) => {
          const isExpanded = expanded === item.id;
          const itemCorrections = getCorrectionsFor(item.id);

          return (
            <div
              key={item.id}
              style={{
                background: 'linear-gradient(145deg, var(--surface) 0%, #fdfaf7 100%)',
                border: `1.5px solid ${isExpanded ? 'var(--moss)' : 'var(--border)'}`,
                borderRadius: 12,
                overflow: 'hidden',
                boxShadow: isExpanded ? 'var(--shadow)' : 'var(--shadow-sm)',
                transition: 'all 0.2s ease',
              }}
            >
              {/* Item header */}
              <div
                style={{
                  display: 'flex', alignItems: 'center', gap: '10px',
                  padding: '14px 16px',
                  cursor: 'pointer',
                  background: isExpanded ? 'rgba(74,94,58,0.05)' : 'transparent',
                  transition: 'background 0.15s',
                }}
                onClick={() => setExpanded(isExpanded ? null : item.id)}
              >
                <div style={{ flex: 1 }}>
                  <div style={{
                    fontFamily: 'var(--font-display)', fontWeight: 600,
                    fontSize: '1rem', color: 'var(--bark)', marginBottom: 4,
                  }}>
                    {item.title}
                  </div>
                  <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                    {item.addedBy === 'community' && (
                      <span className="tag tag-ember">필드 보완</span>
                    )}
                    {item.tags?.map((t) => (
                      <span key={t} className="tag tag-bark">{t}</span>
                    ))}
                    {itemCorrections.length > 0 && (
                      <span className="tag tag-moss">
                        {itemCorrections.length}개 수정 제안
                      </span>
                    )}
                  </div>
                </div>
                <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
                  <button
                    className="btn btn-ghost"
                    style={{ padding: '4px 10px', fontSize: '0.85rem' }}
                    onClick={(e) => {
                      e.stopPropagation();
                      openSheet(item.id, item.title);
                    }}
                    title="수정 제안 또는 추가 요청"
                  >
                    ✏️
                  </button>
                  <span style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>
                    {isExpanded ? '▲' : '▼'}
                  </span>
                </div>
              </div>

              {/* Expanded content */}
              {isExpanded && (
                <div style={{ padding: '0 16px 16px' }}>
                  <div
                    className="prose"
                    style={{ fontSize: '0.93rem' }}
                    dangerouslySetInnerHTML={{ __html: markdownToHtml(item.body) }}
                  />

                  {/* Corrections */}
                  {itemCorrections.length > 0 && (
                    <div style={{ marginTop: 14 }}>
                      <p style={{
                        fontSize: '0.78rem', textTransform: 'uppercase',
                        letterSpacing: '0.8px', color: 'var(--text-muted)',
                        marginBottom: 8,
                      }}>
                        필드 보완
                      </p>
                      {itemCorrections.map((c) => (
                        <div
                          key={c.id}
                          style={{
                            padding: '8px 12px', borderRadius: 8,
                            background: 'var(--cream)',
                            border: '1px solid var(--border-light)',
                            marginBottom: 6, fontSize: '0.88rem',
                          }}
                        >
                          <span className="tag tag-ember" style={{ marginRight: 6, marginBottom: 4 }}>
                            {c.type === 'correction' ? '수정' : '추가'}
                          </span>
                          {c.fix}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Add more button */}
      {!loading && (
        <div style={{ marginTop: 20, textAlign: 'center' }}>
          <button
            className="btn btn-ghost"
            onClick={() => openSheet('__new__', '새 스킬 추가')}
            style={{ fontSize: '0.95rem' }}
          >
            ➕ 추가 요청하기
          </button>
        </div>
      )}

      {/* Bottom Sheet */}
      <BottomSheet
        open={sheet.open}
        onClose={() => setSheet((s) => ({ ...s, open: false }))}
        category={category}
        itemId={sheet.itemId}
        itemTitle={sheet.itemTitle}
        onItemAdded={load}
      />
    </div>
  );
}

function markdownToHtml(md: string): string {
  return md
    .replace(/^### (.+)$/gm, '<h3>$1</h3>')
    .replace(/^## (.+)$/gm, '<h2>$1</h2>')
    .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
    .replace(/\*(.+?)\*/g, '<em>$1</em>')
    .replace(/`(.+?)`/g, '<code>$1</code>')
    .replace(/^- (.+)$/gm, '<li>$1</li>')
    .replace(/(<li>.*<\/li>\n?)+/g, (m) => `<ul>${m}</ul>`)
    .replace(/^\d+\. (.+)$/gm, '<li>$1</li>')
    .replace(/^---$/gm, '<hr>')
    .replace(/\n\n+/g, '</p><p>')
    .replace(/\n/g, '<br/>');
}

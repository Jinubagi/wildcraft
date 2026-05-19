import { useState, useEffect } from 'react';
import { fetchActivityLogs, type ActivityLog } from '../lib/firebase';
import { useNavigate } from 'react-router-dom';

const ADMIN_PIN = import.meta.env.VITE_ADMIN_PIN as string | undefined;

const ACTION_META: Record<ActivityLog['action'], { label: string; emoji: string; color: string }> = {
  skill_edit:    { label: '스킬 수정',     emoji: '✏️',  color: '#5d7449' },
  skill_add:     { label: '스킬 추가',     emoji: '➕',  color: '#2a6b8a' },
  skill_delete:  { label: '스킬 삭제',     emoji: '🗑️',  color: '#c4441a' },
  daily_done:    { label: '1일1부시 완료', emoji: '✅',  color: '#3a7a3a' },
  qna_question:  { label: '질문 작성',     emoji: '💬',  color: '#7a5c00' },
  qna_answer:    { label: '답변 작성',     emoji: '💡',  color: '#c4441a' },
};

function timeAgo(ts: { toDate?: () => Date } | null | undefined): string {
  try {
    const date = ts?.toDate ? ts.toDate() : new Date();
    const diff = Math.floor((Date.now() - date.getTime()) / 1000);
    if (diff < 60) return '방금 전';
    if (diff < 3600) return `${Math.floor(diff / 60)}분 전`;
    if (diff < 86400) return `${Math.floor(diff / 3600)}시간 전`;
    return `${Math.floor(diff / 86400)}일 전`;
  } catch { return ''; }
}

// ---- PIN Gate ----
function PinGate({ onUnlock }: { onUnlock: () => void }) {
  const navigate = useNavigate();
  const [pin, setPin] = useState('');
  const [error, setError] = useState('');

  function submit() {
    if (pin === ADMIN_PIN) {
      onUnlock();
    } else {
      setError('PIN이 틀렸습니다.');
      setPin('');
    }
  }

  return (
    <div className="page" style={{ maxWidth: 360, margin: '0 auto' }}>
      <button
        onClick={() => navigate('/')}
        style={{
          background: 'none', border: 'none', cursor: 'pointer',
          color: 'var(--text-muted)', fontSize: '0.9rem',
          padding: '0 0 20px', fontFamily: 'var(--font-body)',
        }}
      >
        ← 홈으로
      </button>

      <div style={{
        background: 'linear-gradient(145deg, var(--surface) 0%, #fdfaf7 100%)',
        border: '1.5px solid var(--border)',
        borderRadius: 16, padding: '28px 24px',
        boxShadow: 'var(--shadow)',
        textAlign: 'center',
      }}>
        <div style={{ fontSize: '2.5rem', marginBottom: 12 }}>🔐</div>
        <h2 style={{ margin: '0 0 6px', fontSize: '1.1rem', color: 'var(--bark)' }}>관리자 전용</h2>
        <p style={{ margin: '0 0 20px', fontSize: '0.85rem', color: 'var(--text-muted)' }}>
          활동 로그는 관리자만 볼 수 있습니다
        </p>
        <input
          className="input"
          type="password"
          value={pin}
          onChange={(e) => { setPin(e.target.value); setError(''); }}
          onKeyDown={(e) => e.key === 'Enter' && submit()}
          placeholder="PIN 입력"
          autoFocus
          style={{ textAlign: 'center', fontSize: '1.1rem', letterSpacing: '0.2em', marginBottom: 12 }}
        />
        {error && (
          <p style={{ margin: '0 0 10px', fontSize: '0.85rem', color: 'var(--ember)' }}>{error}</p>
        )}
        <button
          className="btn btn-primary"
          onClick={submit}
          disabled={!pin}
          style={{ width: '100%', justifyContent: 'center' }}
        >
          확인
        </button>
      </div>
    </div>
  );
}

// ---- Main Log View ----
export default function ActivityLogPage() {
  const navigate = useNavigate();
  const [unlocked, setUnlocked] = useState(false);
  const [logs, setLogs] = useState<ActivityLog[]>([]);
  const [loading, setLoading] = useState(false);
  const [actionFilter, setActionFilter] = useState<ActivityLog['action'] | '전체'>('전체');
  const [nicknameFilter, setNicknameFilter] = useState<string>('전체');

  useEffect(() => {
    if (!unlocked) return;
    setLoading(true);
    fetchActivityLogs(200).then((data) => {
      setLogs(data);
      setLoading(false);
    });
  }, [unlocked]);

  if (!unlocked) {
    return <PinGate onUnlock={() => setUnlocked(true)} />;
  }

  // 필터 적용
  const filtered = logs.filter((l) => {
    if (actionFilter !== '전체' && l.action !== actionFilter) return false;
    if (nicknameFilter !== '전체' && l.nickname !== nicknameFilter) return false;
    return true;
  });

  // 닉네임별 통계
  const stats = logs.reduce<Record<string, { total: number; actions: Partial<Record<ActivityLog['action'], number>> }>>((acc, l) => {
    if (!acc[l.nickname]) acc[l.nickname] = { total: 0, actions: {} };
    acc[l.nickname].total += 1;
    acc[l.nickname].actions[l.action] = (acc[l.nickname].actions[l.action] ?? 0) + 1;
    return acc;
  }, {});

  const topUsers = Object.entries(stats)
    .sort((a, b) => b[1].total - a[1].total)
    .slice(0, 10);

  return (
    <div className="page">
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

      <h1 style={{ margin: '0 0 4px', display: 'flex', alignItems: 'center', gap: '10px' }}>
        <span>📋</span><span>활동 로그</span>
      </h1>
      <p style={{ color: 'var(--text-muted)', fontSize: '0.95rem', marginBottom: 20 }}>
        용사들의 필드 기여 기록 · 총 {logs.length}건
      </p>

      {/* 닉네임별 기여 통계 */}
      {topUsers.length > 0 && (
        <div style={{
          background: 'linear-gradient(145deg, var(--surface) 0%, #fdfaf7 100%)',
          border: '1.5px solid var(--border)', borderRadius: 12,
          padding: '14px 16px', marginBottom: 20,
        }}>
          <p style={{
            fontSize: '0.72rem', fontFamily: 'var(--font-ui)', fontWeight: 600,
            color: 'var(--text-muted)', letterSpacing: '0.5px',
            textTransform: 'uppercase', marginBottom: 10,
          }}>🏆 닉네임별 활동</p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {topUsers.map(([name, data], i) => (
              <div
                key={name}
                style={{
                  display: 'flex', alignItems: 'center', gap: 10,
                  padding: '8px 10px', borderRadius: 8,
                  background: nicknameFilter === name ? 'rgba(74,94,58,0.08)' : 'transparent',
                  border: `1px solid ${nicknameFilter === name ? 'var(--moss)' : 'transparent'}`,
                  cursor: 'pointer', transition: 'all 0.15s',
                }}
                onClick={() => setNicknameFilter(nicknameFilter === name ? '전체' : name)}
              >
                <span style={{
                  fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-muted)',
                  width: 22, textAlign: 'center', flexShrink: 0,
                }}>
                  {i === 0 ? '🥇' : i === 1 ? '🥈' : i === 2 ? '🥉' : `${i + 1}.`}
                </span>
                <span style={{ flex: 1, fontSize: '0.9rem', color: 'var(--bark)', fontWeight: 500 }}>
                  {name}
                </span>
                {/* 액션별 breakdown */}
                <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap', justifyContent: 'flex-end' }}>
                  {Object.entries(data.actions).map(([act, cnt]) => (
                    <span key={act} style={{
                      fontSize: '0.7rem', padding: '1px 6px', borderRadius: 8,
                      background: 'var(--cream)', color: ACTION_META[act as ActivityLog['action']]?.color ?? 'var(--text-muted)',
                      border: `1px solid ${ACTION_META[act as ActivityLog['action']]?.color ?? 'var(--border)'}30`,
                      whiteSpace: 'nowrap',
                    }}>
                      {ACTION_META[act as ActivityLog['action']]?.emoji} {cnt}
                    </span>
                  ))}
                </div>
                <span style={{
                  fontSize: '0.8rem', fontWeight: 700, color: 'var(--moss)',
                  flexShrink: 0, minWidth: 32, textAlign: 'right',
                }}>
                  {data.total}회
                </span>
              </div>
            ))}
          </div>
          {nicknameFilter !== '전체' && (
            <button
              onClick={() => setNicknameFilter('전체')}
              style={{
                marginTop: 10, background: 'none', border: 'none', cursor: 'pointer',
                fontSize: '0.8rem', color: 'var(--text-muted)', fontFamily: 'var(--font-body)',
              }}
            >
              ✕ 필터 해제
            </button>
          )}
        </div>
      )}

      {/* 액션 필터 */}
      <div style={{
        display: 'flex', gap: 6, marginBottom: 16,
        overflowX: 'auto', paddingBottom: 4,
      }}>
        {(['전체', 'skill_edit', 'skill_add', 'skill_delete', 'daily_done', 'qna_question', 'qna_answer'] as const).map((f) => (
          <button
            key={f}
            onClick={() => setActionFilter(f)}
            style={{
              padding: '5px 12px', borderRadius: 20, border: 'none',
              cursor: 'pointer', whiteSpace: 'nowrap',
              fontFamily: 'var(--font-body)', fontSize: '0.82rem',
              background: actionFilter === f ? 'var(--moss)' : 'var(--cream)',
              color: actionFilter === f ? 'white' : 'var(--text-muted)',
              transition: 'all 0.15s',
            }}
          >
            {f === '전체' ? '전체' : `${ACTION_META[f].emoji} ${ACTION_META[f].label}`}
          </button>
        ))}
      </div>

      {/* 현재 필터 표시 */}
      {(nicknameFilter !== '전체' || actionFilter !== '전체') && (
        <div style={{
          marginBottom: 12, padding: '7px 12px', borderRadius: 8,
          background: 'rgba(74,94,58,0.07)', border: '1px solid rgba(74,94,58,0.2)',
          fontSize: '0.82rem', color: 'var(--moss)',
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        }}>
          <span>
            {nicknameFilter !== '전체' && `👤 ${nicknameFilter}`}
            {nicknameFilter !== '전체' && actionFilter !== '전체' && ' · '}
            {actionFilter !== '전체' && `${ACTION_META[actionFilter].emoji} ${ACTION_META[actionFilter].label}`}
            {' '}— {filtered.length}건
          </span>
          <button
            onClick={() => { setNicknameFilter('전체'); setActionFilter('전체'); }}
            style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '0.8rem', color: 'var(--text-muted)' }}
          >
            전체 보기
          </button>
        </div>
      )}

      {/* 로그 목록 */}
      {loading && (
        <div style={{ textAlign: 'center', padding: '40px', color: 'var(--text-muted)' }}>
          <span className="spinner" style={{ width: 28, height: 28 }} />
          <p style={{ marginTop: 12 }}>로그 불러오는 중...</p>
        </div>
      )}

      {!loading && filtered.length === 0 && (
        <div style={{
          padding: '32px', textAlign: 'center', borderRadius: 12,
          background: 'var(--cream)', border: '1px solid var(--border)',
          color: 'var(--text-muted)', fontSize: '0.95rem',
        }}>
          📭 활동 기록이 없습니다
        </div>
      )}

      <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
        {filtered.map((log) => {
          const meta = ACTION_META[log.action];
          return (
            <div
              key={log.id}
              style={{
                display: 'flex', alignItems: 'center', gap: 12,
                padding: '10px 14px', borderRadius: 10,
                background: 'linear-gradient(145deg, var(--surface) 0%, #fdfaf7 100%)',
                border: '1px solid var(--border)',
                boxShadow: 'var(--shadow-sm)',
                cursor: 'pointer',
              }}
              onClick={() => setNicknameFilter(log.nickname === nicknameFilter ? '전체' : log.nickname)}
            >
              <span style={{ fontSize: '1.1rem', width: 28, textAlign: 'center', flexShrink: 0 }}>
                {meta.emoji}
              </span>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
                  <span style={{ fontSize: '0.88rem', fontWeight: 600, color: 'var(--bark)' }}>
                    {log.nickname}
                  </span>
                  <span style={{
                    fontSize: '0.72rem', padding: '1px 7px', borderRadius: 10,
                    background: 'var(--cream)', color: meta.color,
                    border: `1px solid ${meta.color}30`,
                    fontWeight: 500,
                  }}>
                    {meta.label}
                  </span>
                  {log.category && (
                    <span style={{
                      fontSize: '0.72rem', padding: '1px 7px', borderRadius: 10,
                      background: 'var(--cream)', color: 'var(--text-muted)',
                      border: '1px solid var(--border-light)',
                    }}>
                      {log.category}
                    </span>
                  )}
                </div>
                <p style={{
                  fontSize: '0.82rem', color: 'var(--text-muted)',
                  margin: '2px 0 0', overflow: 'hidden',
                  textOverflow: 'ellipsis', whiteSpace: 'nowrap',
                }}>
                  {log.detail}
                </p>
              </div>
              <span style={{
                fontSize: '0.72rem', color: 'var(--text-muted)',
                flexShrink: 0, whiteSpace: 'nowrap',
              }}>
                {timeAgo(log.timestamp as Parameters<typeof timeAgo>[0])}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

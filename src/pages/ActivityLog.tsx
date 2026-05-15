import { useState, useEffect } from 'react';
import { fetchActivityLogs, type ActivityLog } from '../lib/firebase';
import { useNavigate } from 'react-router-dom';

const ACTION_META: Record<ActivityLog['action'], { label: string; emoji: string; color: string }> = {
  skill_edit:    { label: '스킬 수정',   emoji: '✏️',  color: '#5d7449' },
  skill_add:     { label: '스킬 추가',   emoji: '➕',  color: '#2a6b8a' },
  daily_done:    { label: '사부작 완료', emoji: '✅',  color: '#3a7a3a' },
  qna_question:  { label: '질문 작성',   emoji: '💬',  color: '#7a5c00' },
  qna_answer:    { label: '답변 작성',   emoji: '💡',  color: '#c4441a' },
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

export default function ActivityLog() {
  const navigate = useNavigate();
  const [logs, setLogs] = useState<ActivityLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<ActivityLog['action'] | '전체'>('전체');

  useEffect(() => {
    fetchActivityLogs(100).then((data) => {
      setLogs(data);
      setLoading(false);
    });
  }, []);

  const filtered = filter === '전체' ? logs : logs.filter((l) => l.action === filter);

  // 닉네임별 통계
  const stats = logs.reduce<Record<string, number>>((acc, l) => {
    acc[l.nickname] = (acc[l.nickname] ?? 0) + 1;
    return acc;
  }, {});
  const topUsers = Object.entries(stats)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5);

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
        용사들의 필드 기여 기록
      </p>

      {/* 상위 기여자 */}
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
          }}>🏆 기여 TOP {topUsers.length}</p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
            {topUsers.map(([name, count], i) => (
              <div key={name} style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <span style={{
                  fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-muted)',
                  width: 18, textAlign: 'center',
                }}>
                  {i === 0 ? '🥇' : i === 1 ? '🥈' : i === 2 ? '🥉' : `${i + 1}.`}
                </span>
                <span style={{ flex: 1, fontSize: '0.9rem', color: 'var(--bark)', fontWeight: 500 }}>
                  {name}
                </span>
                <span style={{
                  fontSize: '0.78rem', color: 'var(--text-muted)',
                  background: 'var(--cream)', padding: '2px 8px', borderRadius: 10,
                }}>
                  {count}회
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 필터 */}
      <div style={{
        display: 'flex', gap: 6, marginBottom: 16,
        overflowX: 'auto', paddingBottom: 4,
      }}>
        {(['전체', 'skill_edit', 'skill_add', 'daily_done', 'qna_question', 'qna_answer'] as const).map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            style={{
              padding: '5px 12px', borderRadius: 20, border: 'none',
              cursor: 'pointer', whiteSpace: 'nowrap',
              fontFamily: 'var(--font-body)', fontSize: '0.82rem',
              background: filter === f ? 'var(--moss)' : 'var(--cream)',
              color: filter === f ? 'white' : 'var(--text-muted)',
              transition: 'all 0.15s',
            }}
          >
            {f === '전체' ? '전체' : `${ACTION_META[f].emoji} ${ACTION_META[f].label}`}
          </button>
        ))}
      </div>

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
          📭 아직 활동 기록이 없습니다
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
              }}
            >
              <span style={{
                fontSize: '1.1rem', width: 28, textAlign: 'center', flexShrink: 0,
              }}>{meta.emoji}</span>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
                  <span style={{
                    fontSize: '0.88rem', fontWeight: 600, color: 'var(--bark)',
                  }}>
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

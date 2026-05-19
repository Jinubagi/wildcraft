import { useState, useEffect } from 'react';
import { fetchActivityLogs, fetchQuestions, fetchAnswers, type ActivityLog, type QnaQuestion } from '../lib/firebase';
import { useNavigate } from 'react-router-dom';

const ADMIN_PIN = import.meta.env.VITE_ADMIN_PIN as string | undefined;

// ---- PIN Gate ----
function PinGate({ onUnlock }: { onUnlock: () => void }) {
  const navigate = useNavigate();
  const [pin, setPin] = useState('');
  const [error, setError] = useState('');

  function submit() {
    if (pin === ADMIN_PIN) { onUnlock(); }
    else { setError('PIN이 틀렸습니다.'); setPin(''); }
  }

  return (
    <div className="page" style={{ maxWidth: 360, margin: '0 auto' }}>
      <button onClick={() => navigate('/')} style={{
        background: 'none', border: 'none', cursor: 'pointer',
        color: 'var(--text-muted)', fontSize: '0.9rem',
        padding: '0 0 20px', fontFamily: 'var(--font-body)',
      }}>← 홈으로</button>
      <div style={{
        background: 'linear-gradient(145deg, var(--surface) 0%, #fdfaf7 100%)',
        border: '1.5px solid var(--border)', borderRadius: 16,
        padding: '28px 24px', boxShadow: 'var(--shadow)', textAlign: 'center',
      }}>
        <div style={{ fontSize: '2.5rem', marginBottom: 12 }}>🔐</div>
        <h2 style={{ margin: '0 0 6px', fontSize: '1.1rem', color: 'var(--bark)' }}>관리자 전용</h2>
        <p style={{ margin: '0 0 20px', fontSize: '0.85rem', color: 'var(--text-muted)' }}>
          활동 내역은 관리자만 볼 수 있습니다
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
        {error && <p style={{ margin: '0 0 10px', fontSize: '0.85rem', color: 'var(--ember)' }}>{error}</p>}
        <button className="btn btn-primary" onClick={submit} disabled={!pin}
          style={{ width: '100%', justifyContent: 'center' }}>확인</button>
      </div>
    </div>
  );
}

// ---- Types ----
interface UserActivity {
  nickname: string;
  skillEdits: { detail: string; at: Date | null }[];
  skillAdds: { detail: string; at: Date | null }[];
  skillDeletes: { detail: string; at: Date | null }[];
  dailyDone: { detail: string; at: Date | null }[];
  qnaQuestions: { title: string; body: string; at: Date | null }[];
  qnaAnswers: { questionTitle: string; body: string; at: Date | null }[];
  ruleChanges: { detail: string; at: Date | null }[];
}

function toDate(ts: unknown): Date | null {
  try {
    if (!ts) return null;
    if (ts && typeof (ts as { toDate?: () => Date }).toDate === 'function') return (ts as { toDate: () => Date }).toDate();
    return null;
  } catch { return null; }
}

function fmt(d: Date | null): string {
  if (!d) return '';
  return d.toLocaleDateString('ko-KR', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' });
}

// ---- Main ----
export default function ActivityLogPage() {
  const navigate = useNavigate();
  const [unlocked, setUnlocked] = useState(false);
  const [loading, setLoading] = useState(false);
  const [userMap, setUserMap] = useState<Record<string, UserActivity>>({});
  const [selected, setSelected] = useState<string | null>(null);

  useEffect(() => {
    if (!unlocked) return;
    setLoading(true);
    loadAll().then((map) => { setUserMap(map); setLoading(false); });
  }, [unlocked]);

  async function loadAll(): Promise<Record<string, UserActivity>> {
    const map: Record<string, UserActivity> = {};

    function ensure(nick: string): UserActivity {
      if (!map[nick]) map[nick] = {
        nickname: nick,
        skillEdits: [], skillAdds: [], skillDeletes: [],
        dailyDone: [], qnaQuestions: [], qnaAnswers: [], ruleChanges: [],
      };
      return map[nick];
    }

    // 1. activity_logs — skill edits/adds/deletes, daily, rules
    try {
      const logs = await fetchActivityLogs(500);
      for (const l of logs) {
        if (!l.nickname) continue;
        const u = ensure(l.nickname);
        const at = toDate(l.timestamp);
        if (l.action === 'skill_edit') {
          if (l.detail.startsWith('[수칙')) {
            u.ruleChanges.push({ detail: l.detail, at });
          } else {
            u.skillEdits.push({ detail: l.detail, at });
          }
        } else if (l.action === 'skill_add') {
          u.skillAdds.push({ detail: l.detail, at });
        } else if (l.action === 'skill_delete') {
          u.skillDeletes.push({ detail: l.detail, at });
        } else if (l.action === 'daily_done') {
          u.dailyDone.push({ detail: l.detail, at });
        }
      }
    } catch { /* Firebase 미설정 */ }

    // 2. qna_questions — 직접 읽기 (authorNickname 필드 보유)
    try {
      const questions: QnaQuestion[] = await fetchQuestions();
      for (const q of questions) {
        if (!q.authorNickname) continue;
        const u = ensure(q.authorNickname);
        u.qnaQuestions.push({
          title: q.title,
          body: q.body,
          at: toDate(q.createdAt),
        });

        // 각 질문의 답변도 읽기
        try {
          const answers = await fetchAnswers(q.id);
          for (const a of answers) {
            if (!a.authorNickname) continue;
            const au = ensure(a.authorNickname);
            au.qnaAnswers.push({
              questionTitle: q.title,
              body: a.body,
              at: toDate(a.createdAt),
            });
          }
        } catch { /* skip */ }
      }
    } catch { /* Firebase 미설정 */ }

    return map;
  }

  if (!unlocked) return <PinGate onUnlock={() => setUnlocked(true)} />;

  const users = Object.values(userMap).sort((a, b) => {
    const totalA = a.skillEdits.length + a.skillAdds.length + a.qnaQuestions.length + a.qnaAnswers.length + a.dailyDone.length;
    const totalB = b.skillEdits.length + b.skillAdds.length + b.qnaQuestions.length + b.qnaAnswers.length + b.dailyDone.length;
    return totalB - totalA;
  });

  const selectedUser = selected ? userMap[selected] : null;

  return (
    <div className="page">
      <button onClick={() => navigate('/')} style={{
        background: 'none', border: 'none', cursor: 'pointer',
        color: 'var(--text-muted)', fontSize: '0.9rem',
        padding: '0 0 12px', fontFamily: 'var(--font-body)',
      }}>← 홈으로</button>

      <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 4 }}>
        <h1 style={{ margin: 0 }}>📋 닉네임별 활동</h1>
        {selected && (
          <button onClick={() => setSelected(null)} style={{
            background: 'var(--cream)', border: '1px solid var(--border)',
            borderRadius: 16, padding: '3px 10px', cursor: 'pointer',
            fontSize: '0.78rem', color: 'var(--text-muted)', fontFamily: 'var(--font-body)',
          }}>✕ 전체</button>
        )}
      </div>
      <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginBottom: 20 }}>
        {selected ? `👤 ${selected} 상세보기` : `총 ${users.length}명의 활동 기록`}
      </p>

      {loading && (
        <div style={{ textAlign: 'center', padding: '40px', color: 'var(--text-muted)' }}>
          <span className="spinner" style={{ width: 28, height: 28 }} />
          <p style={{ marginTop: 12 }}>데이터 불러오는 중...</p>
        </div>
      )}

      {!loading && !selectedUser && (
        /* 닉네임 카드 목록 */
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {users.length === 0 && (
            <div style={{
              padding: '32px', textAlign: 'center', borderRadius: 12,
              background: 'var(--cream)', border: '1px solid var(--border)',
              color: 'var(--text-muted)',
            }}>📭 기록된 활동이 없습니다</div>
          )}
          {users.map((u, i) => {
            const total = u.skillEdits.length + u.skillAdds.length + u.skillDeletes.length
              + u.qnaQuestions.length + u.qnaAnswers.length + u.dailyDone.length + u.ruleChanges.length;
            return (
              <div key={u.nickname} onClick={() => setSelected(u.nickname)} style={{
                background: 'linear-gradient(145deg, var(--surface) 0%, #fdfaf7 100%)',
                border: '1.5px solid var(--border)', borderRadius: 12,
                padding: '14px 16px', cursor: 'pointer',
                boxShadow: 'var(--shadow-sm)', transition: 'all 0.15s',
              }}
                onMouseEnter={(e) => { (e.currentTarget as HTMLDivElement).style.borderColor = 'var(--moss)'; }}
                onMouseLeave={(e) => { (e.currentTarget as HTMLDivElement).style.borderColor = 'var(--border)'; }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <span style={{
                    fontSize: '0.8rem', fontWeight: 700, color: 'var(--text-muted)',
                    width: 22, textAlign: 'center', flexShrink: 0,
                  }}>
                    {i === 0 ? '🥇' : i === 1 ? '🥈' : i === 2 ? '🥉' : `${i + 1}.`}
                  </span>
                  <span style={{ flex: 1, fontSize: '1rem', fontWeight: 600, color: 'var(--bark)' }}>
                    👤 {u.nickname}
                  </span>
                  <span style={{
                    fontSize: '0.85rem', fontWeight: 700, color: 'var(--moss)',
                  }}>총 {total}건 →</span>
                </div>
                {/* 요약 태그들 */}
                <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginTop: 10, paddingLeft: 32 }}>
                  {u.qnaQuestions.length > 0 && <Chip emoji="💬" label="질문" count={u.qnaQuestions.length} color="#7a5c00" />}
                  {u.qnaAnswers.length > 0 && <Chip emoji="💡" label="답변" count={u.qnaAnswers.length} color="#c4441a" />}
                  {u.skillEdits.length > 0 && <Chip emoji="✏️" label="스킬수정" count={u.skillEdits.length} color="#5d7449" />}
                  {u.skillAdds.length > 0 && <Chip emoji="➕" label="스킬추가" count={u.skillAdds.length} color="#2a6b8a" />}
                  {u.skillDeletes.length > 0 && <Chip emoji="🗑️" label="스킬삭제" count={u.skillDeletes.length} color="#c4441a" />}
                  {u.dailyDone.length > 0 && <Chip emoji="✅" label="1일1부시" count={u.dailyDone.length} color="#3a7a3a" />}
                  {u.ruleChanges.length > 0 && <Chip emoji="📜" label="수칙" count={u.ruleChanges.length} color="#7a3060" />}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* 닉네임 상세 */}
      {!loading && selectedUser && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>

          {selectedUser.qnaQuestions.length > 0 && (
            <Section title="💬 작성한 질문" color="#7a5c00">
              {selectedUser.qnaQuestions.map((q, i) => (
                <Item key={i} title={q.title} body={q.body} at={q.at} />
              ))}
            </Section>
          )}

          {selectedUser.qnaAnswers.length > 0 && (
            <Section title="💡 작성한 답변" color="#c4441a">
              {selectedUser.qnaAnswers.map((a, i) => (
                <Item key={i} title={`Q: ${a.questionTitle}`} body={a.body} at={a.at} />
              ))}
            </Section>
          )}

          {selectedUser.skillEdits.length > 0 && (
            <Section title="✏️ 스킬 수정" color="#5d7449">
              {selectedUser.skillEdits.map((s, i) => (
                <Item key={i} title={s.detail} at={s.at} />
              ))}
            </Section>
          )}

          {selectedUser.skillAdds.length > 0 && (
            <Section title="➕ 스킬 추가" color="#2a6b8a">
              {selectedUser.skillAdds.map((s, i) => (
                <Item key={i} title={s.detail} at={s.at} />
              ))}
            </Section>
          )}

          {selectedUser.skillDeletes.length > 0 && (
            <Section title="🗑️ 스킬 삭제" color="#c4441a">
              {selectedUser.skillDeletes.map((s, i) => (
                <Item key={i} title={s.detail} at={s.at} />
              ))}
            </Section>
          )}

          {selectedUser.dailyDone.length > 0 && (
            <Section title="✅ 1일 1부시 완료" color="#3a7a3a">
              {selectedUser.dailyDone.map((d, i) => (
                <Item key={i} title={d.detail} at={d.at} />
              ))}
            </Section>
          )}

          {selectedUser.ruleChanges.length > 0 && (
            <Section title="📜 수칙 변경" color="#7a3060">
              {selectedUser.ruleChanges.map((r, i) => (
                <Item key={i} title={r.detail} at={r.at} />
              ))}
            </Section>
          )}

          {Object.values(selectedUser).every((v) => !Array.isArray(v) || v.length === 0) && (
            <div style={{
              padding: '32px', textAlign: 'center', borderRadius: 12,
              background: 'var(--cream)', border: '1px solid var(--border)',
              color: 'var(--text-muted)',
            }}>📭 아직 기록된 활동이 없습니다</div>
          )}
        </div>
      )}
    </div>
  );
}

// ---- UI 컴포넌트 ----
function Chip({ emoji, label, count, color }: { emoji: string; label: string; count: number; color: string }) {
  return (
    <span style={{
      fontSize: '0.73rem', padding: '2px 8px', borderRadius: 10,
      background: `${color}12`, color,
      border: `1px solid ${color}30`, fontWeight: 500, whiteSpace: 'nowrap',
    }}>
      {emoji} {label} {count}
    </span>
  );
}

function Section({ title, color, children }: { title: string; color: string; children: React.ReactNode }) {
  return (
    <div style={{
      background: 'linear-gradient(145deg, var(--surface) 0%, #fdfaf7 100%)',
      border: `1.5px solid ${color}30`, borderRadius: 12,
      overflow: 'hidden', boxShadow: 'var(--shadow-sm)',
    }}>
      <div style={{
        padding: '10px 14px', background: `${color}0d`,
        borderBottom: `1px solid ${color}20`,
        fontSize: '0.85rem', fontWeight: 700, color,
      }}>
        {title}
      </div>
      <div style={{ padding: '8px 14px 12px', display: 'flex', flexDirection: 'column', gap: 8 }}>
        {children}
      </div>
    </div>
  );
}

function Item({ title, body, at }: { title: string; body?: string; at: Date | null }) {
  const [open, setOpen] = useState(false);
  return (
    <div style={{
      padding: '8px 10px', borderRadius: 8,
      background: 'var(--cream)', border: '1px solid var(--border-light)',
    }}>
      <div
        style={{
          display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 8,
          cursor: body ? 'pointer' : 'default',
        }}
        onClick={() => body && setOpen(!open)}
      >
        <span style={{ fontSize: '0.88rem', color: 'var(--bark)', lineHeight: 1.4, flex: 1 }}>{title}</span>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6, flexShrink: 0 }}>
          {at && <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)', whiteSpace: 'nowrap' }}>{fmt(at)}</span>}
          {body && <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{open ? '▲' : '▼'}</span>}
        </div>
      </div>
      {open && body && (
        <p style={{
          margin: '8px 0 0', fontSize: '0.83rem', color: 'var(--text-muted)',
          lineHeight: 1.55, whiteSpace: 'pre-wrap', borderTop: '1px solid var(--border-light)',
          paddingTop: 8,
        }}>{body}</p>
      )}
    </div>
  );
}

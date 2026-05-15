import { useState, useEffect, useCallback } from 'react';
import {
  fetchQuestions,
  fetchAnswers,
  submitQuestion,
  submitAnswer,
  type QnaQuestion,
  type QnaAnswer,
} from '../lib/firebase';
import { getNickname } from '../components/NicknameModal';

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

interface AnswerPanelProps {
  questionId: string;
  onAnswerAdded: () => void;
}

function AnswerPanel({ questionId, onAnswerAdded }: AnswerPanelProps) {
  const [answers, setAnswers] = useState<QnaAnswer[]>([]);
  const [loading, setLoading] = useState(true);
  const [body, setBody] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [error, setError] = useState('');
  const nickname = getNickname();

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const data = await fetchAnswers(questionId);
      setAnswers(data);
    } catch {
      // Firebase not configured
    } finally {
      setLoading(false);
    }
  }, [questionId]);

  useEffect(() => { load(); }, [load]);

  async function handleSubmit() {
    if (!body.trim() || !nickname) return;
    setSubmitting(true);
    setError('');
    try {
      await submitAnswer(questionId, body.trim(), nickname);
      setBody('');
      setShowForm(false);
      await load();
      onAnswerAdded();
    } catch {
      setError('⚠️ 답변 저장 중 오류가 발생했습니다.');
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div style={{ marginTop: 16, paddingTop: 16, borderTop: '1px solid var(--border-light)' }}>
      {loading ? (
        <div style={{ textAlign: 'center', padding: '12px', color: 'var(--text-muted)', fontSize: '0.9rem' }}>
          <span className="spinner" style={{ width: 16, height: 16 }} />
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginBottom: answers.length > 0 ? 12 : 0 }}>
          {answers.map((a) => (
            <div key={a.id} style={{
              padding: '10px 14px', borderRadius: 8,
              background: '#f6f9f3',
              border: '1px solid #deebd4',
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
                <span style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--moss)', fontFamily: 'var(--font-ui)' }}>
                  👤 {a.authorNickname}
                </span>
                <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontFamily: 'var(--font-ui)' }}>
                  {timeAgo(a.createdAt as unknown as { toDate?: () => Date })}
                </span>
              </div>
              <p style={{ fontSize: '0.92rem', margin: 0, lineHeight: 1.55, color: 'var(--text)' }}>
                {a.body}
              </p>
            </div>
          ))}
        </div>
      )}

      {!showForm ? (
        <button
          onClick={() => {
            if (!nickname) { setError('필드에서 사용할 닉네임을 먼저 설정해주세요.'); return; }
            setShowForm(true);
          }}
          style={{
            padding: '6px 14px', borderRadius: 8,
            background: 'var(--cream)', border: '1px solid var(--border)',
            cursor: 'pointer', fontSize: '0.85rem',
            fontFamily: 'var(--font-body)', color: 'var(--text-muted)',
            transition: 'all 0.15s',
          }}
          onMouseEnter={(e) => { (e.currentTarget as HTMLButtonElement).style.background = 'var(--parch-dark)'; }}
          onMouseLeave={(e) => { (e.currentTarget as HTMLButtonElement).style.background = 'var(--cream)'; }}
        >
          💬 답변 달기
        </button>
      ) : (
        <div>
          <textarea
            className="input"
            value={body}
            onChange={(e) => setBody(e.target.value)}
            placeholder="답변을 작성하세요..."
            rows={3}
            disabled={submitting}
            style={{ marginBottom: 8 }}
          />
          <div style={{ display: 'flex', gap: 8 }}>
            <button
              className="btn btn-primary"
              onClick={handleSubmit}
              disabled={submitting || !body.trim()}
              style={{ fontSize: '0.9rem', padding: '7px 16px' }}
            >
              {submitting ? <span className="spinner" style={{ width: 16, height: 16 }} /> : '답변 등록'}
            </button>
            <button
              className="btn btn-ghost"
              onClick={() => { setShowForm(false); setBody(''); setError(''); }}
              style={{ fontSize: '0.9rem', padding: '7px 14px' }}
            >
              취소
            </button>
          </div>
        </div>
      )}
      {error && (
        <p style={{ color: 'var(--ember)', fontSize: '0.85rem', marginTop: 8 }}>{error}</p>
      )}
    </div>
  );
}

export default function QnA() {
  const [questions, setQuestions] = useState<QnaQuestion[]>([]);
  const [loading, setLoading] = useState(true);
  const [expanded, setExpanded] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [title, setTitle] = useState('');
  const [body, setBody] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState('');
  const [firebaseError, setFirebaseError] = useState(false);
  const nickname = getNickname();

  const load = useCallback(async () => {
    setLoading(true);
    setFirebaseError(false);
    try {
      const data = await fetchQuestions();
      setQuestions(data);
    } catch {
      setFirebaseError(true);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  async function handleSubmit() {
    if (!title.trim() || !body.trim() || !nickname) return;
    setSubmitting(true);
    setSubmitError('');
    try {
      await submitQuestion(title.trim(), body.trim(), nickname);
      setTitle('');
      setBody('');
      setShowForm(false);
      await load();
    } catch {
      setSubmitError('⚠️ 질문 저장 중 오류가 발생했습니다. Firebase 설정을 확인하세요.');
    } finally {
      setSubmitting(false);
    }
  }

  function handleAnswerAdded() {
    // Refresh to get updated count
    load();
  }

  return (
    <div className="page">
      {/* Header */}
      <div style={{ marginBottom: 24 }}>
        <h1 style={{ margin: '0 0 6px', display: 'flex', alignItems: 'center', gap: '10px' }}>
          <span>💬</span>
          <span>Q&A</span>
        </h1>
        <p style={{ color: 'var(--text-muted)', fontSize: '0.95rem' }}>
          용사들이 야외 활동에 대해 서로 묻고 답하는 공간
        </p>
      </div>

      {/* Ask button */}
      <div style={{ marginBottom: 24 }}>
        <button
          className="btn btn-primary"
          onClick={() => {
            if (!nickname) {
              setSubmitError('필드에서 사용할 닉네임을 먼저 설정해주세요. 헤더의 👤 버튼을 눌러 설정하세요.');
              setShowForm(false);
              return;
            }
            setShowForm(!showForm);
            setSubmitError('');
          }}
          style={{ fontSize: '0.95rem' }}
        >
          {showForm ? '✕ 취소' : '✏️ 질문하기'}
        </button>
      </div>

      {/* Question form */}
      {showForm && (
        <div style={{
          background: 'linear-gradient(145deg, var(--parch) 0%, var(--cream) 100%)',
          border: '1.5px solid var(--border)',
          borderRadius: 12, padding: '20px',
          marginBottom: 24,
          boxShadow: 'var(--shadow-sm)',
        }}>
          <h3 style={{ margin: '0 0 14px', fontSize: '1rem' }}>새 질문 작성</h3>
          <input
            className="input"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="제목 (무엇이 궁금한가요?)"
            disabled={submitting}
            style={{ marginBottom: 10 }}
          />
          <textarea
            className="input"
            value={body}
            onChange={(e) => setBody(e.target.value)}
            placeholder="자세한 내용을 작성해주세요..."
            rows={4}
            disabled={submitting}
            style={{ marginBottom: 12 }}
          />
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <button
              className="btn btn-primary"
              onClick={handleSubmit}
              disabled={submitting || !title.trim() || !body.trim()}
            >
              {submitting ? <><span className="spinner" style={{ width: 16, height: 16 }} /> 등록 중</> : '질문 등록'}
            </button>
            <span style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>
              👤 {nickname}
            </span>
          </div>
          {submitError && (
            <p style={{ color: 'var(--ember)', fontSize: '0.85rem', marginTop: 10 }}>{submitError}</p>
          )}
        </div>
      )}

      {submitError && !showForm && (
        <div style={{
          padding: '10px 14px', borderRadius: 8, marginBottom: 16,
          background: '#fce8e2', color: 'var(--ember)', fontSize: '0.9rem',
        }}>{submitError}</div>
      )}

      {/* Loading */}
      {loading && (
        <div style={{ textAlign: 'center', padding: '40px', color: 'var(--text-muted)' }}>
          <span className="spinner" style={{ width: 28, height: 28 }} />
          <p style={{ marginTop: 12 }}>질문을 불러오는 중...</p>
        </div>
      )}

      {/* Firebase error */}
      {!loading && firebaseError && (
        <div style={{
          padding: '24px', borderRadius: 12, background: 'var(--cream)',
          border: '1px solid var(--border)', textAlign: 'center',
        }}>
          <p style={{ fontSize: '1.1rem', marginBottom: 8 }}>⚙️ Firebase 설정 필요</p>
          <p style={{ fontSize: '0.88rem', color: 'var(--text-muted)' }}>
            Q&A 기능을 사용하려면 Firebase 설정이 필요합니다.
          </p>
        </div>
      )}

      {/* Empty state */}
      {!loading && !firebaseError && questions.length === 0 && (
        <div style={{
          padding: '40px 24px', borderRadius: 12, background: 'var(--cream)',
          border: '1px solid var(--border)', textAlign: 'center',
        }}>
          <div style={{ fontSize: '2.5rem', marginBottom: 12 }}>🌿</div>
          <p style={{ fontSize: '1.05rem', marginBottom: 6 }}>아직 질문이 없어요</p>
          <p style={{ fontSize: '0.88rem', color: 'var(--text-muted)' }}>
            첫 번째 질문을 남겨보세요!
          </p>
        </div>
      )}

      {/* Questions list */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
        {questions.map((q) => {
          const isExpanded = expanded === q.id;
          return (
            <div
              key={q.id}
              style={{
                background: 'linear-gradient(145deg, var(--surface) 0%, #fdfaf7 100%)',
                border: `1.5px solid ${isExpanded ? 'var(--moss)' : 'var(--border)'}`,
                borderRadius: 12,
                overflow: 'hidden',
                boxShadow: isExpanded ? 'var(--shadow)' : 'var(--shadow-sm)',
                transition: 'all 0.2s ease',
              }}
            >
              {/* Question header */}
              <div
                style={{
                  padding: '14px 16px',
                  cursor: 'pointer',
                  background: isExpanded ? '#f6f9f3' : 'transparent',
                  transition: 'background 0.15s',
                }}
                onClick={() => setExpanded(isExpanded ? null : q.id)}
              >
                <div style={{
                  fontFamily: 'var(--font-display)', fontWeight: 600,
                  fontSize: '1rem', color: 'var(--bark)', marginBottom: 6,
                  lineHeight: 1.3,
                }}>
                  {q.title}
                </div>
                <div style={{ display: 'flex', gap: 10, alignItems: 'center', flexWrap: 'wrap' }}>
                  <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)', fontFamily: 'var(--font-ui)' }}>
                    👤 {q.authorNickname}
                  </span>
                  <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)', fontFamily: 'var(--font-ui)' }}>
                    {timeAgo(q.createdAt as unknown as { toDate?: () => Date })}
                  </span>
                  {q.answersCount > 0 && (
                    <span style={{
                      padding: '2px 10px', borderRadius: 50, fontSize: '0.72rem',
                      background: '#e3eedc', color: '#3a5230', border: '1px solid #c8dcc0',
                      fontFamily: 'var(--font-ui)', fontWeight: 600,
                    }}>
                      답변 {q.answersCount}개
                    </span>
                  )}
                  {q.answersCount === 0 && (
                    <span style={{
                      padding: '2px 10px', borderRadius: 50, fontSize: '0.72rem',
                      background: 'var(--cream)', color: 'var(--text-muted)', border: '1px solid var(--border)',
                      fontFamily: 'var(--font-ui)',
                    }}>
                      답변 없음
                    </span>
                  )}
                  <span style={{ marginLeft: 'auto', color: 'var(--text-muted)', fontSize: '0.85rem' }}>
                    {isExpanded ? '▲' : '▼'}
                  </span>
                </div>
              </div>

              {/* Expanded content */}
              {isExpanded && (
                <div style={{ padding: '0 16px 16px' }}>
                  <p style={{
                    fontSize: '0.93rem', lineHeight: 1.65,
                    color: 'var(--text)', marginBottom: 0,
                    whiteSpace: 'pre-wrap',
                  }}>
                    {q.body}
                  </p>
                  <AnswerPanel questionId={q.id} onAnswerAdded={handleAnswerAdded} />
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

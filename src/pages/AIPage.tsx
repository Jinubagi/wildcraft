import { useState, useRef, useEffect } from 'react';
import { askWildcraft, recommendKnot, analyzeEquipment, getEmergencyGuide, type ChatMessage } from '../lib/anthropic';

type Mode = 'chat' | 'knots' | 'gear' | 'emergency';

const MODES: { id: Mode; emoji: string; label: string; placeholder: string }[] = [
  { id: 'chat', emoji: '💬', label: '자유 채팅', placeholder: '부시크래프트에 대해 무엇이든 물어보세요...' },
  { id: 'knots', emoji: '🪢', label: '매듭 추천', placeholder: '상황을 설명하세요 (예: 나무에 해먹 달기, 무거운 짐 묶기...)' },
  { id: 'gear', emoji: '🎒', label: '장비 분석', placeholder: '보유 장비 목록을 입력하세요 (예: 타프, 파라코드 30m, 나이프, 라이터...)' },
  { id: 'emergency', emoji: '⚠️', label: '긴급 대처', placeholder: '긴급 상황을 설명하세요 (예: 길을 잃었고 날이 어두워지고 있어요...)' },
];

interface Message {
  role: 'user' | 'assistant';
  content: string;
  mode?: Mode;
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

export default function AIPage() {
  const [mode, setMode] = useState<Mode>('chat');
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);
  const currentMode = MODES.find((m) => m.id === mode)!;

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, loading]);

  async function handleSend() {
    if (!input.trim() || loading) return;
    const userMsg = input.trim();
    setInput('');
    setMessages((prev) => [...prev, { role: 'user', content: userMsg, mode }]);
    setLoading(true);

    try {
      let response = '';

      if (mode === 'chat') {
        const chatHistory: ChatMessage[] = messages
          .filter((m) => m.mode === 'chat')
          .map(({ role, content }) => ({ role, content }));
        chatHistory.push({ role: 'user', content: userMsg });
        response = await askWildcraft(chatHistory);
      } else if (mode === 'knots') {
        response = await recommendKnot(userMsg);
      } else if (mode === 'gear') {
        response = await analyzeEquipment(userMsg);
      } else if (mode === 'emergency') {
        response = await getEmergencyGuide(userMsg);
      }

      setMessages((prev) => [...prev, { role: 'assistant', content: response, mode }]);
    } catch {
      setMessages((prev) => [
        ...prev,
        {
          role: 'assistant',
          content: '⚠️ API 오류가 발생했습니다. `VITE_ANTHROPIC_API_KEY`를 `.env.local`에 설정해주세요.',
          mode,
        },
      ]);
    } finally {
      setLoading(false);
    }
  }

  const modeMessages = messages.filter((m) => m.mode === mode);

  return (
    <div style={{
      display: 'flex', flexDirection: 'column',
      height: 'calc(100dvh - var(--nav-h))',
      maxWidth: 800, margin: '0 auto', width: '100%',
    }}>
      {/* Mode selector */}
      <div style={{
        padding: '12px 16px', borderBottom: '1px solid var(--border)',
        background: 'var(--parch)',
      }}>
        <div style={{ display: 'flex', gap: 6, overflowX: 'auto', paddingBottom: 2 }}>
          {MODES.map((m) => (
            <button
              key={m.id}
              onClick={() => setMode(m.id)}
              style={{
                display: 'flex', alignItems: 'center', gap: '5px',
                padding: '6px 12px', borderRadius: 20, border: 'none',
                cursor: 'pointer', whiteSpace: 'nowrap',
                fontFamily: 'var(--font-body)', fontSize: '0.9rem',
                background: mode === m.id ? 'var(--moss)' : 'var(--cream)',
                color: mode === m.id ? 'white' : 'var(--text-muted)',
                transition: 'all 0.15s',
              }}
            >
              {m.emoji} {m.label}
            </button>
          ))}
        </div>
      </div>

      {/* Messages */}
      <div style={{ flex: 1, overflowY: 'auto', padding: '16px' }}>
        {modeMessages.length === 0 && (
          <div style={{ textAlign: 'center', padding: '40px 20px', color: 'var(--text-muted)' }}>
            <div style={{ fontSize: '3rem', marginBottom: 12 }}>{currentMode.emoji}</div>
            <p style={{ fontFamily: 'var(--font-display)', fontSize: '1.1rem', color: 'var(--bark)' }}>
              {currentMode.label}
            </p>
            <p style={{ fontSize: '0.9rem', marginTop: 6 }}>
              {mode === 'knots' && '상황에 맞는 매듭을 추천하고 단계별 묶는 법과 YouTube 링크를 드립니다.'}
              {mode === 'gear' && '보유 장비로 할 수 있는 것과 부족한 장비를 분석해드립니다.'}
              {mode === 'emergency' && '긴급 상황에서 즉각적인 단계별 대처법을 알려드립니다.'}
              {mode === 'chat' && '부시크래프트에 관한 어떤 질문이든 해보세요.'}
            </p>
          </div>
        )}

        {modeMessages.map((msg, i) => (
          <div
            key={i}
            style={{
              display: 'flex',
              justifyContent: msg.role === 'user' ? 'flex-end' : 'flex-start',
              marginBottom: 12,
            }}
          >
            {msg.role === 'assistant' && (
              <div style={{
                width: 28, height: 28, borderRadius: '50%',
                background: 'var(--moss)', color: 'white',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: '0.85rem', marginRight: 8, flexShrink: 0, marginTop: 4,
              }}>
                🌿
              </div>
            )}
            <div style={{
              maxWidth: '80%', padding: '10px 14px', borderRadius: 12,
              background: msg.role === 'user' ? 'var(--moss)' : 'var(--surface)',
              color: msg.role === 'user' ? 'white' : 'var(--text)',
              border: msg.role === 'user' ? 'none' : '1px solid var(--border)',
              boxShadow: 'var(--shadow-sm)',
            }}>
              {msg.role === 'user' ? (
                <p style={{ margin: 0, fontSize: '0.95rem' }}>{msg.content}</p>
              ) : (
                <div
                  className="prose"
                  style={{ fontSize: '0.93rem' }}
                  dangerouslySetInnerHTML={{ __html: markdownToHtml(msg.content) }}
                />
              )}
            </div>
          </div>
        ))}

        {loading && (
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}>
            <div style={{
              width: 28, height: 28, borderRadius: '50%',
              background: 'var(--moss)', color: 'white',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: '0.85rem',
            }}>🌿</div>
            <div style={{
              padding: '10px 14px', borderRadius: 12,
              background: 'var(--surface)', border: '1px solid var(--border)',
              color: 'var(--text-muted)', fontSize: '0.93rem',
            }}>
              생각하는 중<span className="loading-dots" />
            </div>
          </div>
        )}

        <div ref={bottomRef} />
      </div>

      {/* Input */}
      <div style={{
        padding: '12px 16px',
        borderTop: '1px solid var(--border)',
        background: 'var(--parch)',
        paddingBottom: 'max(12px, env(safe-area-inset-bottom))',
      }}>
        {/* Knot YouTube hint */}
        {mode === 'knots' && modeMessages.some((m) => m.role === 'assistant') && (
          <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginBottom: 6 }}>
            💡 응답에서 YouTube 검색어를 클릭하면 영상을 찾을 수 있습니다.
          </p>
        )}
        <div style={{ display: 'flex', gap: 8 }}>
          <textarea
            className="input"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                handleSend();
              }
            }}
            placeholder={currentMode.placeholder}
            disabled={loading}
            rows={2}
            style={{ resize: 'none', minHeight: 'unset' }}
          />
          <button
            className="btn btn-primary"
            onClick={handleSend}
            disabled={loading || !input.trim()}
            style={{ alignSelf: 'flex-end', flexShrink: 0, padding: '10px 16px' }}
          >
            {loading ? <span className="spinner" /> : '↑'}
          </button>
        </div>
      </div>
    </div>
  );
}

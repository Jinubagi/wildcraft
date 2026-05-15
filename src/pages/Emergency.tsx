import { useState } from 'react';
import { getEmergencyGuide } from '../lib/anthropic';

interface Scenario {
  id: string;
  emoji: string;
  title: string;
  steps: string[];
  warning?: string;
}

// Offline-safe static scenarios
const STATIC_SCENARIOS: Scenario[] = [
  {
    id: 'lost',
    emoji: '🧭',
    title: '길을 잃었을 때',
    steps: [
      'STOP: 즉시 멈추고 심호흡합니다.',
      '패닉 금지: 당황하면 체력 낭비, 심호흡으로 안정을 취합니다.',
      '위치 파악: 마지막으로 알던 위치, 지나온 지형지물 기억하세요.',
      '높은 곳으로: 능선이나 언덕에서 전체 지형을 파악합니다.',
      '물 소리 따라가기: 개울 → 강 → 마을 방향입니다.',
      '119 신고: 스마트폰 신호 있으면 즉시 위치 공유 후 신고.',
      '원칙: 해질 무렵에는 움직이지 말고, 밤에는 구조 신호를 보내세요.',
    ],
    warning: '밤에 절대 이동하지 마세요. 구조대가 낮에 찾기 쉽습니다.',
  },
  {
    id: 'hypothermia',
    emoji: '🥶',
    title: '저체온증',
    steps: [
      '즉시 젖은 옷 제거: 젖은 옷은 체온을 10배 빠르게 빼앗습니다.',
      '바람 차단 & 단열: 쉘터나 방풍 소재로 감쌉니다.',
      '땅에서 단열: 나뭇잎, 배낭 등으로 바닥 단열 (땅 냉기가 더 위험).',
      '겨드랑이/사타구니 먼저: 몸통 핵심 부위에 체온 집중.',
      '의식 있으면: 따뜻한 음료 (단, 알코올 절대 금지).',
      '몸을 움직이게: 의식 있으면 팔다리 움직임으로 열 생성.',
      '119 신고 및 하산 준비.',
    ],
    warning: '팔다리를 먼저 따뜻하게 하면 심장에 차가운 혈액이 몰려 위험합니다.',
  },
  {
    id: 'injury',
    emoji: '🩹',
    title: '출혈 / 부상',
    steps: [
      '직접 압박: 깨끗한 천이나 옷으로 상처 부위를 강하게 누릅니다.',
      '5-10분 유지: 계속 압박, 피가 스며도 천을 제거하지 마세요.',
      '심장보다 높이: 팔다리 부상이면 심장보다 높게 올립니다.',
      '지혈대 (심각 시): 팔다리 절단 위협 시만 사용, 시간 기록 필수.',
      '상처 세척: 깨끗한 물로 이물질 제거, 흙/잎으로 막지 마세요.',
      '감염 방지: 가능하면 멸균 드레싱, 없으면 가장 깨끗한 천 사용.',
      '움직임 최소화: 부러진 뼈는 고정 후 이동.',
    ],
    warning: '지혈대는 생명 위협 상황에서만 사용. 풀면 안 됩니다.',
  },
  {
    id: 'fire',
    emoji: '🌲🔥',
    title: '산불 조우',
    steps: [
      '즉시 도망: 불은 위로 빠르게 번집니다. 절대 위쪽 경사로 도망치지 마세요.',
      '바람 방향 반대로: 연기 반대 방향, 경사 아래쪽으로 뜁니다.',
      '불보다 빠른 이동: 마른 풀밭은 불이 달리기보다 빠릅니다.',
      '긁혀서 불 피하기: 수풀, 바위, 개울 쪽으로.',
      '물 속이나 암석지대: 연기 마시지 않도록 젖은 천으로 코 막기.',
      '최후 수단 - 소각지 활용: 이미 탄 땅은 안전합니다.',
      '119 신고: 불 위치, 이동 방향, 내 위치 전달.',
    ],
    warning: '연기 흡입이 화상보다 위험합니다. 낮게 엎드려 이동하세요.',
  },
  {
    id: 'animal',
    emoji: '🐗',
    title: '위험 동물 조우',
    steps: [
      '멧돼지: 등을 보이지 말고 천천히 물러납니다. 나무 위로 피하기.',
      '말벌: 즉시 반대방향으로 전력질주. 최소 500m 이상.',
      '뱀에 물렸을 때: 물린 부위 심장보다 낮게, 절개/입으로 빨기 금지.',
      '뱀 종류 기억: 색, 무늬, 머리 모양 → 병원에서 중요한 정보.',
      '알레르기 반응: 말벌 쏘임 후 얼굴 부음, 호흡 어려움 → 즉시 119.',
      '움직이지 말기: 뱀 물린 후 움직이면 독 퍼짐 속도 증가.',
      '즉시 119 신고 및 하산.',
    ],
    warning: '뱀 물린 후 2시간이 골든타임입니다. 즉시 하산하세요.',
  },
];

function markdownToHtml(md: string): string {
  return md
    .replace(/^## (.+)$/gm, '<h2>$1</h2>')
    .replace(/^### (.+)$/gm, '<h3>$1</h3>')
    .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
    .replace(/\*(.+?)\*/g, '<em>$1</em>')
    .replace(/^- (.+)$/gm, '<li>$1</li>')
    .replace(/(<li>.*<\/li>\n?)+/g, (m) => `<ul>${m}</ul>`)
    .replace(/^\d+\. (.+)$/gm, '<li>$1</li>')
    .replace(/^---$/gm, '<hr>')
    .replace(/\n\n+/g, '</p><p>')
    .replace(/\n/g, '<br/>');
}

export default function Emergency() {
  const [expanded, setExpanded] = useState<string | null>(null);
  const [aiSituation, setAiSituation] = useState('');
  const [aiResponse, setAiResponse] = useState('');
  const [aiLoading, setAiLoading] = useState(false);

  async function handleAiGuide() {
    if (!aiSituation.trim()) return;
    setAiLoading(true);
    setAiResponse('');
    try {
      const res = await getEmergencyGuide(aiSituation);
      setAiResponse(res);
    } catch {
      setAiResponse('⚠️ API 키를 설정해야 AI 긴급 대처법을 사용할 수 있습니다.');
    } finally {
      setAiLoading(false);
    }
  }

  return (
    <div className="page">
      <div style={{ marginBottom: 24 }}>
        <h1 style={{ margin: '0 0 6px' }}>🆘 긴급 상황 가이드</h1>
        <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>
          ⚡ 오프라인에서도 작동합니다 · 심각한 부상 시 즉시 119
        </p>
      </div>

      {/* Emergency call banner */}
      <a
        href="tel:119"
        style={{
          display: 'flex', alignItems: 'center', gap: 12,
          padding: '14px 18px', borderRadius: 10, marginBottom: 20,
          background: 'var(--ember)', color: 'white',
          textDecoration: 'none', fontFamily: 'var(--font-display)',
          fontWeight: 600, fontSize: '1.1rem',
          boxShadow: 'var(--shadow)',
        }}
      >
        📞 119 긴급 신고
        <span style={{ marginLeft: 'auto', fontSize: '0.85rem', fontWeight: 400 }}>
          탭하여 전화
        </span>
      </a>

      {/* AI emergency query */}
      <div className="card" style={{ marginBottom: 20, borderColor: 'var(--ember)' }}>
        <h2 style={{ fontSize: '1.05rem', marginBottom: 10, color: 'var(--ember)' }}>
          ⚠️ AI 긴급 대처법 생성
        </h2>
        <div style={{ display: 'flex', gap: 8 }}>
          <input
            className="input"
            value={aiSituation}
            onChange={(e) => setAiSituation(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleAiGuide()}
            placeholder="상황 설명 (예: 길을 잃고 날이 저물고 있어요)"
            disabled={aiLoading}
          />
          <button
            className="btn btn-ember"
            onClick={handleAiGuide}
            disabled={aiLoading || !aiSituation.trim()}
            style={{ flexShrink: 0 }}
          >
            {aiLoading ? <span className="spinner" style={{ borderTopColor: 'white' }} /> : '🆘'}
          </button>
        </div>
        {aiLoading && (
          <p style={{ marginTop: 10, color: 'var(--text-muted)', fontSize: '0.9rem' }}>
            AI가 대처법을 생성하는 중<span className="loading-dots" />
          </p>
        )}
        {aiResponse && !aiLoading && (
          <div style={{
            marginTop: 14, padding: '14px', borderRadius: 8,
            background: 'var(--cream)', borderLeft: '3px solid var(--ember)',
          }}>
            <div
              className="prose"
              dangerouslySetInnerHTML={{ __html: markdownToHtml(aiResponse) }}
              style={{ fontSize: '0.93rem' }}
            />
          </div>
        )}
      </div>

      {/* Offline scenarios */}
      <p className="section-title">시나리오별 가이드</p>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
        {STATIC_SCENARIOS.map((scenario) => {
          const isOpen = expanded === scenario.id;
          return (
            <div
              key={scenario.id}
              style={{
                background: 'var(--surface)',
                border: `1px solid ${isOpen ? 'var(--ember)' : 'var(--border)'}`,
                borderRadius: 10,
                overflow: 'hidden',
                boxShadow: 'var(--shadow-sm)',
              }}
            >
              <button
                onClick={() => setExpanded(isOpen ? null : scenario.id)}
                style={{
                  width: '100%', display: 'flex', alignItems: 'center', gap: '12px',
                  padding: '14px 16px', background: 'transparent', border: 'none',
                  cursor: 'pointer', textAlign: 'left',
                }}
              >
                <span style={{ fontSize: '1.6rem' }}>{scenario.emoji}</span>
                <span style={{
                  fontFamily: 'var(--font-display)', fontWeight: 600,
                  fontSize: '1rem', color: 'var(--bark)', flex: 1,
                }}>
                  {scenario.title}
                </span>
                <span style={{ color: 'var(--text-muted)' }}>{isOpen ? '▲' : '▼'}</span>
              </button>

              {isOpen && (
                <div style={{ padding: '0 16px 16px' }}>
                  <ol style={{ paddingLeft: '1.4em', margin: '0 0 12px' }}>
                    {scenario.steps.map((step, i) => (
                      <li key={i} style={{
                        marginBottom: 8, lineHeight: 1.6,
                        fontSize: '0.93rem',
                      }}>
                        {step}
                      </li>
                    ))}
                  </ol>
                  {scenario.warning && (
                    <div style={{
                      padding: '10px 14px', borderRadius: 8,
                      background: '#fce8e2',
                      border: '1px solid rgba(196, 68, 26, 0.2)',
                      fontSize: '0.88rem', color: 'var(--ember)',
                    }}>
                      ⚠️ <strong>주의:</strong> {scenario.warning}
                    </div>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Quick reference card */}
      <div style={{
        marginTop: 24, padding: '16px', borderRadius: 10,
        background: 'var(--bark)', color: 'var(--cream)',
      }}>
        <h3 style={{ margin: '0 0 10px', color: 'var(--cream)', fontFamily: 'var(--font-display)' }}>
          📋 긴급 기억 카드
        </h3>
        <div style={{ fontSize: '0.88rem', lineHeight: 1.7 }}>
          <div>🆘 <strong>119</strong> - 응급, 화재, 구조</div>
          <div>🚓 <strong>112</strong> - 경찰</div>
          <div>⛑️ <strong>STOP</strong> - 멈추기 · 생각 · 관찰 · 계획</div>
          <div>🌡️ 체온 &gt; 물 &gt; 음식 순서로 중요</div>
          <div>🔦 낮에 이동, 밤에 구조 신호 (불, 반사판)</div>
        </div>
      </div>
    </div>
  );
}

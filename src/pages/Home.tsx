import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { askWildcraft } from '../lib/anthropic';
import { logActivity } from '../lib/firebase';
import { getNickname } from '../components/NicknameModal';
import { getTodayTask, getHistory, markTodayComplete, isTodayCompleted, type DailyTask } from '../lib/dailyTasks';

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
  "Leave No Trace — 왔을 때보다 더 깨끗하게 남겨라. 모든 흔적을 지운다.",
  "불은 완전히 꺼진 것을 세 번 확인하라. 연기도 열기도 없어야 진짜 꺼진 것이다.",
  "나이프는 항상 날이 몸 바깥 방향. 움직일 때 칼집에 넣는 것이 원칙이다.",
  "혼자 입산 시 목적지, 경로, 귀환 시간을 최소 2명에게 알려라.",
  "물은 아무리 맑아도 반드시 정수 후 마셔라. 지아르디아는 눈에 보이지 않는다.",
  "날이 저물면 이동하지 마라. 빛이 있을 때 캠프를 완성하라.",
  "STOP 원칙: 길을 잃으면 Stop(멈추기) → Think(생각) → Observe(관찰) → Plan(계획).",
  "자연에서 채취는 최소한으로. 필요한 것만, 살아있는 나무는 건드리지 않는다.",
  "동행자의 페이스를 맞춰라. 그룹에서 가장 느린 사람이 기준이다.",
  "체온 관리가 최우선이다. 젖으면 죽는다 — 여벌 옷은 항상 방수 포장.",
  "고도가 올라갈수록 날씨 변화는 급격하다. 맑은 하늘도 믿지 마라.",
  "야생 식물은 확실히 아는 것만 먹어라. 모르면 먹지 마라. 단 하나의 실수가 치명적이다.",
  "나이프, 도끼 등 도구는 항상 칼집/덮개를 씌워 보관하고 이동한다.",
  "배낭에는 항상 비상 키트를 넣어라: 호루라기, 방수 성냥, 응급 처치 키트, 비상 식량.",
  "캠프는 물에서 60m 이상 떨어진 곳에 차려라. 동물 이동로와 홍수 위험을 피한다.",
];

const DEFAULT_GLOSSARY: Record<string, string> = {
  "부시크래프트": "자연에서 얻은 재료만으로 생존 기술을 실천하는 활동. 나이프 하나만 들고 숲에서 며칠을 보내는 것이 궁극적 목표다.",
  "틴더(Tinder)": "불씨를 받아 불꽃으로 키우는 재료. 자작나무 껍질 속살, 솔방울 솜털, 마른 이끼, 차르클로스가 대표적이다.",
  "킨들링(Kindling)": "틴더로 만든 불꽃을 본 불로 키우는 중간 단계 연료. 연필~손가락 굵기의 건조한 나뭇가지.",
  "차르클로스(Char Cloth)": "면 천을 무산소 상태로 가열해 만든 숯천. 아주 작은 불꽃도 받아들이는 틴더로 부싯돌 발화에 필수.",
  "버드네스트(Bird's Nest)": "틴더를 새 둥지 모양으로 뭉친 형태. 불씨를 안에 넣고 불어서 불꽃으로 키우는 역할.",
  "페더스틱(Feather Stick)": "나무 막대를 나이프로 깎아 얇은 깃털 모양의 조각들이 붙어있게 만든 것. 습한 환경에서도 불을 붙일 수 있는 효과적인 불쏘시개.",
  "바토닝(Batoning)": "나이프 등 부분에 막대를 쳐서 통나무를 쪼개는 기술. 도끼 없이 나이프만으로 장작을 만드는 핵심 기술.",
  "타프(Tarp)": "방수 천으로 만든 다목적 쉘터 재료. A형, 린투, 다이아몬드 등 다양한 형태로 설치할 수 있다.",
  "파라코드(Paracord)": "본래 낙하산 줄. 7가닥의 내부 줄이 있어 분해하면 실로 활용 가능. 야외 활동의 만능 줄.",
  "릿지라인(Ridgeline)": "두 나무 사이에 수평으로 팽팽히 친 메인 줄. 타프를 걸거나 장비를 걸어두는 용도.",
  "보울라인(Bowline)": "구조 활동에 쓰이는 절대 풀리지 않는 루프 매듭. '토끼가 굴에서 나와 나무를 돌고 들어간다'로 외운다.",
  "프루직(Prusik)": "가는 줄로 메인 줄에 감아 체중이 걸리면 잠기고 손으로 밀면 이동하는 마찰 매듭. 로프 등반에 필수.",
  "클로브 히치(Clove Hitch)": "기둥이나 나무에 빠르게 줄을 고정하는 매듭. 타프 릿지라인 연결에 가장 많이 쓴다.",
  "린투 쉘터(Lean-to Shelter)": "경사진 한쪽 지붕 형태의 쉘터. 한쪽이 열려 있어 불과 함께 사용하기 좋다.",
  "퀸시(Quinzhee)": "눈을 쌓아 동굴처럼 만든 쉘터. 내부 온도는 영하에서도 0도 이상을 유지한다.",
  "데브리 쉘터(Debris Shelter)": "나뭇가지와 낙엽만으로 만드는 원시적 쉘터. 두껍게 쌓은 낙엽이 단열재 역할을 한다.",
  "바우드릴(Bow Drill)": "활비비라고도 함. 활을 이용해 스핀들을 빠르게 돌려 마찰열로 불씨를 만드는 원시 발화 도구 세트.",
  "스핀들(Spindle)": "바우드릴에서 회전하는 막대. 건조한 소나무, 버드나무, 머위 줄기 등이 적합.",
  "화판(Fireboard)": "스핀들이 돌아가는 평평한 판. V노치를 파서 불씨가 모이게 한다.",
  "부싯돌(Flint)": "강철 스트라이커와 부딪혀 불꽃을 만드는 규질암. 날카로운 날이 있어야 효과적.",
  "페로세륨 로드(Ferro Rod)": "마그네슘+철 합금 막대. 긁으면 3000도 불꽃이 튀어 틴더에 점화. 현대 부시크래프트의 표준 발화 도구.",
  "EDC(Every Day Carry)": "매일 몸에 지니고 다니는 생존/야외 장비. 나이프, 라이터, 파라코드, 응급 호루라기 등.",
  "IFAK(Individual First Aid Kit)": "개인 응급처치 키트. 지혈대, 압박 붕대, 상처 봉합 테이프 등 야외 응급에 특화된 구성.",
  "고어텍스(Gore-Tex)": "방수+투습 소재. 물은 막고 땀은 배출. 야외 자켓의 핵심 소재지만 세탁과 관리가 중요.",
  "레이어링(Layering)": "3중 레이어 시스템. 베이스레이어(흡습속건) + 미드레이어(보온) + 쉘레이어(방수방풍).",
  "LNT(Leave No Trace)": "자연에 흔적을 남기지 않는 7가지 원칙. 부시크래프터의 기본 윤리이자 철학.",
  "STOP 원칙": "조난 시 생존 원칙. Stop(즉시 멈추기) → Think(상황 파악) → Observe(주변 관찰) → Plan(계획 수립).",
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

// ---- 1일 1부시 Section ----
const IMPORTANCE_LABEL = ['', '보통', '권장', '필수'];
const IMPORTANCE_COLOR = ['', '#688060', '#b45309', '#c4441a'];
const CATEGORY_EMOJI: Record<string, string> = {
  '스킬': '🪓', '요리': '🍳', '카빙': '🔪', '손질': '🐟', '매듭': '🪢', '응급': '🚨', '장비': '🎒',
};

function DailyBushSection() {
  const [task] = useState<DailyTask>(getTodayTask);
  const [expanded, setExpanded] = useState(false);
  const [completed, setCompleted] = useState(isTodayCompleted);
  const [historyOpen, setHistoryOpen] = useState(false);
  const history = getHistory();

  const isWeekend = [0, 6].includes(new Date().getDay());
  const youtubeSearchUrl = `https://www.youtube.com/results?search_query=${encodeURIComponent(task.youtubeQuery)}`;

  function handleComplete() {
    markTodayComplete(task);
    setCompleted(true);
    const nickname = getNickname() || '익명';
    logActivity(nickname, 'daily_done', `1일1부시 완료: ${task.title}`);
  }

  return (
    <div style={{ marginBottom: 20 }}>
      {/* 헤더 */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
        <p className="section-title" style={{ margin: 0 }}>
          🌿 1일 1부시 — {isWeekend ? '주말 필드' : '평일 홈/도심'}
        </p>
        <button
          onClick={() => setHistoryOpen(!historyOpen)}
          style={{
            background: 'none', border: 'none', cursor: 'pointer',
            fontSize: '0.75rem', color: 'var(--text-muted)', fontFamily: 'var(--font-body)',
          }}
        >
          📋 히스토리
        </button>
      </div>

      {/* 히스토리 패널 */}
      {historyOpen && (
        <div style={{
          marginBottom: 12, padding: '12px 14px', borderRadius: 10,
          background: 'var(--cream)', border: '1px solid var(--border)',
        }}>
          <p style={{ margin: '0 0 8px', fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
            최근 완료 기록
          </p>
          {history.length === 0 && <p style={{ margin: 0, fontSize: '0.85rem', color: 'var(--text-muted)' }}>아직 기록 없음</p>}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 5 }}>
            {history.slice(0, 10).map((h) => (
              <div key={h.date} style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <span style={{ fontSize: '0.8rem' }}>{CATEGORY_EMOJI[h.category] ?? '🌿'}</span>
                <span style={{ flex: 1, fontSize: '0.83rem', color: 'var(--bark)' }}>{h.title}</span>
                <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{h.date}</span>
                <span style={{ fontSize: '0.75rem', color: '#3a7a3a' }}>✅</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 메인 카드 */}
      <div style={{
        background: 'linear-gradient(145deg, var(--surface) 0%, #fdfaf7 100%)',
        border: `1.5px solid ${completed ? '#3a7a3a' : 'var(--border)'}`,
        borderRadius: 14,
        overflow: 'hidden',
        boxShadow: 'var(--shadow-sm)',
      }}>
        {/* 제목 + 태그 */}
        <div style={{ padding: '14px 16px 0' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6, flexWrap: 'wrap' }}>
            <span style={{
              fontSize: '0.72rem', padding: '2px 8px', borderRadius: 10,
              background: 'var(--moss-dim)', color: 'var(--moss-light)',
              fontWeight: 600, fontFamily: 'var(--font-ui)',
            }}>
              {CATEGORY_EMOJI[task.category]} {task.category}
            </span>
            <span style={{
              fontSize: '0.72rem', padding: '2px 8px', borderRadius: 10,
              background: `${IMPORTANCE_COLOR[task.importance]}18`,
              color: IMPORTANCE_COLOR[task.importance],
              border: `1px solid ${IMPORTANCE_COLOR[task.importance]}33`,
              fontWeight: 600, fontFamily: 'var(--font-ui)',
            }}>
              {'⭐'.repeat(task.importance)} {IMPORTANCE_LABEL[task.importance]}
            </span>
            {completed && (
              <span style={{
                fontSize: '0.72rem', padding: '2px 8px', borderRadius: 10,
                background: 'rgba(58,122,58,0.12)', color: '#3a7a3a',
                fontWeight: 600, fontFamily: 'var(--font-ui)',
              }}>✅ 완료</span>
            )}
          </div>
          <h2 style={{ margin: '0 0 12px', fontSize: '1.15rem', color: 'var(--bark)', fontWeight: 700 }}>
            {task.title}
          </h2>
        </div>

        {/* 유튜브 영상 영역 */}
        <a
          href={youtubeSearchUrl}
          target="_blank"
          rel="noopener noreferrer"
          style={{
            display: 'block', margin: '0 16px 14px',
            borderRadius: 10, overflow: 'hidden',
            textDecoration: 'none', position: 'relative',
          }}
        >
          <div style={{
            background: 'linear-gradient(135deg, #1a1a2e 0%, #16213e 50%, #0f3460 100%)',
            padding: '28px 16px',
            display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
            minHeight: 120,
            gap: 10,
          }}>
            <div style={{
              width: 52, height: 52, borderRadius: '50%',
              background: '#ff0000',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              boxShadow: '0 4px 16px rgba(255,0,0,0.4)',
            }}>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="white">
                <path d="M8 5v14l11-7z"/>
              </svg>
            </div>
            <p style={{ margin: 0, color: 'rgba(255,255,255,0.9)', fontSize: '0.88rem', fontWeight: 600, textAlign: 'center' }}>
              {task.title}
            </p>
            <p style={{ margin: 0, color: 'rgba(255,255,255,0.45)', fontSize: '0.75rem' }}>
              YouTube에서 영상 보기 →
            </p>
          </div>
        </a>

        {/* 펼치기 버튼 */}
        <button
          onClick={() => setExpanded(!expanded)}
          style={{
            width: '100%', padding: '10px 16px',
            background: 'none', border: 'none', borderTop: '1px solid var(--border-light)',
            cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6,
            fontFamily: 'var(--font-body)', fontSize: '0.84rem', color: 'var(--text-muted)',
          }}
        >
          <span style={{ display: 'inline-block', transition: 'transform 0.2s', transform: expanded ? 'rotate(180deg)' : 'none' }}>▼</span>
          {expanded ? '접기' : '설명 보기'}
        </button>

        {/* 펼쳐지는 내용 */}
        {expanded && (
          <div style={{ padding: '14px 16px 16px', borderTop: '1px solid var(--border-light)' }}>
            <p style={{ margin: '0 0 16px', fontSize: '0.93rem', color: 'var(--text-muted)', lineHeight: 1.7 }}>
              {task.description}
            </p>
            {!completed ? (
              <button
                className="btn btn-primary"
                onClick={handleComplete}
                style={{ width: '100%', justifyContent: 'center', fontSize: '0.95rem' }}
              >
                ✅ 오늘 완료했어요!
              </button>
            ) : (
              <div style={{
                padding: '12px', borderRadius: 10, textAlign: 'center',
                background: 'rgba(58,122,58,0.1)', border: '1px solid rgba(58,122,58,0.25)',
                color: '#3a7a3a', fontSize: '0.9rem', fontWeight: 600,
              }}>
                🎉 오늘의 부시 완료! 내일 또 만나요
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

// ---- Rules Section ----
function RulesSection() {
  const [open, setOpen] = useState(false);
  const [rules, setRules] = useState<string[]>(loadRules);
  const [input, setInput] = useState('');
  const [dailyIdx] = useState(() => Math.floor(Math.random() * loadRules().length));

  function addRule() {
    const trimmed = input.trim();
    if (!trimmed) return;
    const next = [...rules, trimmed];
    setRules(next);
    saveRules(next);
    setInput('');
    const nickname = getNickname() || '익명';
    logActivity(nickname, 'skill_edit', `[수칙 추가] ${trimmed}`);
  }

  function removeRule(idx: number) {
    const removed = rules[idx];
    const next = rules.filter((_, i) => i !== idx);
    setRules(next);
    saveRules(next);
    const nickname = getNickname() || '익명';
    logActivity(nickname, 'skill_edit', `[수칙 삭제] ${removed}`);
  }

  return (
    <div style={{
      background: 'linear-gradient(145deg, var(--surface) 0%, #fdfaf7 100%)',
      border: '1.5px solid var(--border)',
      borderRadius: 12, marginBottom: 12,
      overflow: 'hidden',
      boxShadow: 'var(--shadow-sm)',
    }}>
      {/* Daily rule preview */}
      <div style={{ padding: '14px 18px 0' }}>
        <div style={{
          fontSize: '0.72rem', textTransform: 'uppercase', letterSpacing: '0.8px',
          color: 'var(--text-muted)', marginBottom: 6,
        }}>📜 오늘의 수칙</div>
        <p style={{
          fontSize: '0.93rem', lineHeight: 1.55, color: 'var(--bark)',
          margin: '0 0 10px', fontStyle: 'italic',
        }}>
          {rules[dailyIdx]}
        </p>
      </div>

      <button
        onClick={() => setOpen(!open)}
        style={{
          width: '100%', padding: '8px 18px 14px',
          background: 'none', border: 'none', cursor: 'pointer',
          display: 'flex', alignItems: 'center', gap: 6,
          fontFamily: 'var(--font-body)', fontSize: '0.82rem',
          color: 'var(--text-muted)', transition: 'color 0.15s',
        }}
      >
        <span style={{ display: 'inline-block', transition: 'transform 0.2s', transform: open ? 'rotate(180deg)' : 'none' }}>▼</span>
        <span>{open ? '접기' : `전체보기 (${rules.length}개)`}</span>
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
  const [editingTerm, setEditingTerm] = useState<string | null>(null);
  const [suggestion, setSuggestion] = useState('');
  const [submitted, setSubmitted] = useState<string | null>(null);

  const termKeys = Object.keys(glossary);
  const [dailyKey] = useState(() => {
    const keys = Object.keys(loadGlossary());
    return keys[Math.floor(Math.random() * keys.length)] ?? keys[0];
  });

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
      {/* Daily term preview */}
      {dailyKey && (
        <div style={{ padding: '14px 18px 0' }}>
          <div style={{
            fontSize: '0.72rem', textTransform: 'uppercase', letterSpacing: '0.8px',
            color: 'var(--text-muted)', marginBottom: 6,
          }}>📖 오늘의 용어</div>
          <div style={{
            padding: '10px 12px', borderRadius: 8,
            background: 'var(--cream)', border: '1px solid var(--border-light)',
            marginBottom: 10,
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 2 }}>
              <span style={{
                fontFamily: 'var(--font-display)', fontWeight: 700,
                fontSize: '0.95rem', color: 'var(--bark)',
              }}>{dailyKey}</span>
              <a
                href={`https://www.google.com/search?q=${encodeURIComponent(dailyKey + ' 부시크래프트')}&tbm=isch`}
                target="_blank"
                rel="noopener noreferrer"
                style={{ fontSize: '0.85rem', textDecoration: 'none' }}
                title="이미지 검색"
              >🔍</a>
            </div>
            <p style={{ margin: 0, fontSize: '0.85rem', color: 'var(--text-muted)', lineHeight: 1.45 }}>
              {glossary[dailyKey]}
            </p>
          </div>
        </div>
      )}

      <button
        onClick={() => setOpen(!open)}
        style={{
          width: '100%', padding: '8px 18px 14px',
          background: 'none', border: 'none', cursor: 'pointer',
          display: 'flex', alignItems: 'center', gap: 6,
          fontFamily: 'var(--font-body)', fontSize: '0.82rem',
          color: 'var(--text-muted)', transition: 'color 0.15s',
        }}
      >
        <span style={{ display: 'inline-block', transition: 'transform 0.2s', transform: open ? 'rotate(180deg)' : 'none' }}>▼</span>
        <span>{open ? '접기' : `전체보기 (${termKeys.length}개)`}</span>
      </button>

      {open && (
        <div style={{ padding: '0 18px 16px' }}>
          <dl style={{ margin: '0 0 14px', display: 'flex', flexDirection: 'column', gap: 10 }}>
            {Object.entries(glossary).map(([term, def]) => (
              <div key={term} style={{
                borderRadius: 8,
                background: 'var(--cream)', border: '1px solid var(--border-light)',
                overflow: 'hidden',
              }}>
                <div style={{ padding: '10px 12px', display: 'flex', gap: 10, alignItems: 'flex-start' }}>
                  <div style={{ flex: 1 }}>
                    <dt style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 2 }}>
                      <span style={{
                        fontFamily: 'var(--font-display)', fontWeight: 700,
                        fontSize: '0.95rem', color: 'var(--bark)',
                      }}>{term}</span>
                      <a
                        href={`https://www.google.com/search?q=${encodeURIComponent(term + ' 부시크래프트')}&tbm=isch`}
                        target="_blank"
                        rel="noopener noreferrer"
                        style={{ fontSize: '0.85rem', textDecoration: 'none' }}
                        title="이미지 검색"
                      >🔍</a>
                    </dt>
                    <dd style={{ margin: 0, fontSize: '0.85rem', color: 'var(--text-muted)', lineHeight: 1.45 }}>{def}</dd>
                  </div>
                  <div style={{ display: 'flex', gap: 4, flexShrink: 0 }}>
                    <button
                      onClick={() => {
                        if (editingTerm === term) { setEditingTerm(null); setSuggestion(''); }
                        else { setEditingTerm(term); setSuggestion(def); setSubmitted(null); }
                      }}
                      style={{
                        background: 'none', border: 'none', cursor: 'pointer',
                        fontSize: '0.8rem', padding: '0 3px', lineHeight: 1,
                        opacity: 0.6, transition: 'opacity 0.15s',
                      }}
                      title="수정 요청"
                    >✏️</button>
                    <button
                      onClick={() => removeTerm(term)}
                      style={{
                        background: 'none', border: 'none', cursor: 'pointer',
                        color: 'var(--text-muted)', fontSize: '0.85rem',
                        padding: '0 2px', lineHeight: 1,
                        opacity: 0.6, transition: 'opacity 0.15s',
                      }}
                      title="삭제"
                    >✕</button>
                  </div>
                </div>

                {/* 수정 요청 인라인 폼 */}
                {editingTerm === term && (
                  <div style={{
                    padding: '10px 12px', borderTop: '1px solid var(--border-light)',
                    background: 'rgba(74,124,62,0.04)',
                  }}>
                    {submitted === term ? (
                      <p style={{ margin: 0, fontSize: '0.82rem', color: 'var(--moss)', fontWeight: 500 }}>
                        ✅ 수정 요청이 제출됐습니다. 감사합니다!
                      </p>
                    ) : (
                      <>
                        <p style={{ margin: '0 0 6px', fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                          🏕️ 수정할 내용을 입력하세요. 확실한 정보만 요청해주세요.
                        </p>
                        <textarea
                          className="input"
                          value={suggestion}
                          onChange={(e) => setSuggestion(e.target.value)}
                          rows={3}
                          style={{ fontSize: '0.85rem', padding: '7px 10px', marginBottom: 7 }}
                        />
                        <div style={{ display: 'flex', gap: 6, justifyContent: 'flex-end' }}>
                          <button
                            className="btn btn-ghost"
                            onClick={() => { setEditingTerm(null); setSuggestion(''); }}
                            style={{ padding: '5px 12px', fontSize: '0.82rem' }}
                          >취소</button>
                          <button
                            className="btn btn-primary"
                            disabled={!suggestion.trim() || suggestion.trim() === def}
                            onClick={async () => {
                              const nickname = getNickname() || '익명';
                              await logActivity(nickname, 'skill_edit', `[용어사전] ${term}: ${suggestion.trim()}`);
                              setSubmitted(term);
                              setSuggestion('');
                            }}
                            style={{ padding: '5px 12px', fontSize: '0.82rem' }}
                          >요청 제출</button>
                        </div>
                      </>
                    )}
                  </div>
                )}
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
      <div style={{ textAlign: 'center', marginBottom: 20, paddingTop: 8 }}>
        <div style={{ fontSize: '3rem', marginBottom: 8 }}>🌿</div>
        <h1 style={{ margin: '0 0 8px', fontSize: 'clamp(1.8rem, 5vw, 2.6rem)', letterSpacing: '0.12em', fontWeight: 700 }}>
          BUSHKIPIDIA
        </h1>
        <p style={{ color: 'var(--text-muted)', fontSize: '1.05rem', fontStyle: 'italic' }}>
          자연 속에서 살아남는 기술의 수첩
        </p>
      </div>

      {/* 1일 1부시 */}
      <DailyBushSection />

      {/* Rules & Glossary — daily summary, above categories */}
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

      {/* AI input */}
      <p className="section-title">AI 가이드</p>
      <div className="card" style={{ marginBottom: 32 }}>
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

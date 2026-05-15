import { useState, useMemo } from 'react';

interface Skill {
  title: string;
  emoji: string;
  difficulty: '초급' | '중급' | '고급';
  shortDesc: string;
  steps: string[];
}

const SKILLS: Skill[] = [
  { title: '보울라인 매듭', emoji: '🪢', difficulty: '초급', shortDesc: '절대 풀리지 않는 구조용 루프 매듭', steps: ['줄 끝에 작은 루프를 만든다', '끝을 루프 안으로 통과시킨다', '메인 줄 뒤로 돌린다', '다시 루프 안으로 집어넣고 조인다'] },
  { title: '클로브 히치', emoji: '🪢', difficulty: '초급', shortDesc: '기둥이나 나무에 줄을 빠르게 고정', steps: ['기둥에 줄을 X자로 두 번 감는다', '두 번째 감을 때 첫 번째 감 아래로 통과', '양쪽을 당겨 조인다'] },
  { title: '페더스틱 만들기', emoji: '🪵', difficulty: '중급', shortDesc: '나무를 얇게 깎아 만드는 불쏘시개', steps: ['건조한 소나무 가지를 선택한다', '나이프를 45도 각도로 세운다', '끝까지 깎지 않고 얇은 깃털 모양으로', '5~8개 깃털이 붙어있게 만든다', '가장 가는 깃털부터 불을 붙인다'] },
  { title: '나이프 연마', emoji: '🔪', difficulty: '중급', shortDesc: '숫돌로 날을 세우는 기본 기술', steps: ['숫돌을 물에 5분 담근다', '날을 20도 각도로 세운다', '앞쪽으로 밀면서 연마한다', '반대면도 동일하게', '마지막에 가죽에 마무리'] },
  { title: '팀버 히치', emoji: '🪢', difficulty: '초급', shortDesc: '통나무를 끌거나 매달 때 사용', steps: ['줄을 통나무에 한 번 감는다', '짧은 끝을 긴 줄에 세 번 꼬아 감는다', '당기면 더 조여지는 구조'] },
  { title: '프루직 매듭', emoji: '🪢', difficulty: '고급', shortDesc: '메인 줄에 마찰로 고정되는 매듭', steps: ['가는 줄로 메인 줄을 3회 감는다', '루프를 자신 안으로 통과', '체중 걸리면 잠기고 손으로 밀면 움직임'] },
  { title: '타프 A형 설치', emoji: '⛺', difficulty: '초급', shortDesc: '릿지라인 하나로 기본 비 피난처 만들기', steps: ['두 나무 사이에 릿지라인 팽팽히 친다', '타프 중앙 고리에 릿지라인 통과', '양쪽 끝을 지면에 45도로 팩 고정', '앞뒤 열려있어 환기 좋음'] },
  { title: '불 유지 관리', emoji: '🔥', difficulty: '초급', shortDesc: '불이 오래 타게 관리하는 기술', steps: ['처음엔 가는 장작으로 화력을 키운다', '통나무는 별 모양으로 배치', '재가 쌓이면 모아서 단열층 형성', '바람 방향에 맞게 공기 흐름 조절'] },
  { title: '빗물 수집', emoji: '💧', difficulty: '초급', shortDesc: '타프로 식수를 모으는 방법', steps: ['타프를 가운데가 처지도록 설치', '처지는 부분 아래에 용기 놓기', '비가 오면 자동으로 모임', '마시기 전 정수 필터 사용'] },
  { title: '자작나무 껍질 활용', emoji: '🌿', difficulty: '초급', shortDesc: '방수·불쏘시개로 탁월한 자작나무 활용', steps: ['흰 껍질의 얇은 층을 채취', '불쏘시개: 얇게 구겨서 사용', '방수: 이음새에 붙여 방수층 형성', '타르 채취: 가열하면 천연 접착제'] },
  { title: '별자리로 북쪽 찾기', emoji: '⭐', difficulty: '중급', shortDesc: '북극성으로 야간 방향 찾기', steps: ['큰곰자리 국자 모양을 찾는다', '국자 끝 두 별 간격의 5배 연장', '그 지점이 북극성', '북극성 방향이 정북'] },
  { title: '이슬 채취', emoji: '💧', difficulty: '중급', shortDesc: '새벽 이슬로 식수 보충하기', steps: ['새벽 4~6시가 최적 시간', '마른 천을 풀밭에 끌거나 풀에 닦는다', '젖은 천을 짜서 식수 수집', '하루 0.5~1L 가능'] },
  { title: '린투 쉘터', emoji: '⛺', difficulty: '중급', shortDesc: '경사진 지붕 형태의 1인 쉘터', steps: ['경사 아래쪽을 바람 방향으로', 'A형보다 낮게, 바람 차단에 유리', '한쪽은 막고 한쪽만 개방', '낙엽을 두텁게 깔아 단열'] },
  { title: '숯 만들기', emoji: '🔥', difficulty: '고급', shortDesc: '불 온도 조절과 숯불 요리의 기본', steps: ['단단한 활엽수를 사용', '강한 불로 완전히 태운다', '재가 없이 검게 탄 상태가 숯', '산소를 차단해 보관'] },
  { title: '활비비 준비', emoji: '🪵', difficulty: '고급', shortDesc: '마찰 발화를 위한 도구 준비', steps: ['스핀들: 건조한 소나무 30cm', '화판: 편평한 건조 목재', '현: 활에 파라코드 팽팽히', '소켓: 손에 쥘 단단한 돌이나 나무'] },
  { title: '파라코드 풀기', emoji: '🪢', difficulty: '초급', shortDesc: '엉킨 파라코드 빠르게 정리하기', steps: ['한쪽 끝을 찾아 루프를 만든다', '반대쪽에서 차례로 루프를 통과', '팔꿈치에 8자로 감아 보관'] },
  { title: '방향 파악하기', emoji: '🧭', difficulty: '초급', shortDesc: '태양과 그림자로 동서남북 찾기', steps: ['막대를 수직으로 세운다', '그림자 끝 지점에 돌을 놓는다', '15분 후 새 그림자 끝에 돌', '두 돌을 이으면 동서 방향'] },
  { title: '야생 식물 관찰', emoji: '🌿', difficulty: '중급', shortDesc: '먹을 수 있는 식물 기본 판별법', steps: ['처음 보는 식물은 먹지 않는다', '손에 비벼 냄새로 독성 추측', '알레르기 테스트: 피부에 소량 문질러', '확실한 것만: 민들레·쑥·질경이'] },
  { title: '불 피우기 후 처리', emoji: '🔥', difficulty: '초급', shortDesc: '안전한 불 끄기와 흔적 지우기', steps: ['물을 여러 번 나눠 붓는다', '장갑으로 재를 뒤집으며 끈다', '연기·열기 완전히 없을 때까지', '재는 흙과 섞어 분산'] },
  { title: '나무 나이 추측', emoji: '🌲', difficulty: '초급', shortDesc: '나이테와 둘레로 나무 나이 파악', steps: ['둘레(cm)를 줄자로 측정', '둘레 ÷ 2.5 ≈ 나이 (cm당 약 2.5년)', '나이테: 베인 단면에서 직접 세기', '느린 성장 나무는 나이테 촘촘'] },
];

const STORAGE_KEY = 'wildcraft_daily_done';

function getDailyIndex(): number {
  const seed = new Date().toDateString();
  let hash = 0;
  for (let i = 0; i < seed.length; i++) {
    hash = (hash * 31 + seed.charCodeAt(i)) >>> 0;
  }
  return hash % SKILLS.length;
}

function getDoneKey(): string {
  return `${STORAGE_KEY}_${new Date().toDateString()}`;
}

const DIFFICULTY_COLORS: Record<string, { bg: string; color: string; border: string }> = {
  초급: { bg: '#e3eedc', color: '#3a5230', border: '#c8dcc0' },
  중급: { bg: '#fef5d6', color: '#7a5c00', border: '#f0dea0' },
  고급: { bg: '#fce8e2', color: '#a83515', border: '#f0c8b8' },
};

export default function DailySkill() {
  const skill = useMemo(() => SKILLS[getDailyIndex()], []);
  const [expanded, setExpanded] = useState(false);
  const [done, setDone] = useState(() => {
    try { return localStorage.getItem(getDoneKey()) === '1'; } catch { return false; }
  });

  function toggleDone() {
    const next = !done;
    setDone(next);
    try { localStorage.setItem(getDoneKey(), next ? '1' : '0'); } catch { /* noop */ }
  }

  const diffStyle = DIFFICULTY_COLORS[skill.difficulty] ?? DIFFICULTY_COLORS['초급'];

  return (
    <div style={{
      background: done
        ? 'linear-gradient(145deg, #f0f7ea 0%, #e8f4df 100%)'
        : 'linear-gradient(145deg, #fff 0%, #fdfaf7 100%)',
      border: `1.5px solid ${done ? '#c8dcc0' : 'var(--border)'}`,
      borderRadius: 14,
      padding: '18px 20px',
      boxShadow: done ? '0 2px 10px rgba(74,94,58,0.12)' : 'var(--shadow-sm)',
      transition: 'all 0.3s ease',
      marginBottom: 24,
    }}>
      {/* Header row */}
      <div style={{ display: 'flex', alignItems: 'flex-start', gap: 12, marginBottom: 10 }}>
        <span style={{ fontSize: '2rem', lineHeight: 1 }}>{skill.emoji}</span>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4, flexWrap: 'wrap' }}>
            <span style={{
              fontFamily: 'var(--font-display)', fontWeight: 700,
              fontSize: '1.05rem', color: done ? '#3a5230' : 'var(--bark)',
            }}>
              {skill.title}
            </span>
            <span style={{
              padding: '2px 10px', borderRadius: 50, fontSize: '0.72rem',
              fontFamily: 'var(--font-ui)', fontWeight: 600, letterSpacing: '0.3px',
              background: diffStyle.bg, color: diffStyle.color, border: `1px solid ${diffStyle.border}`,
            }}>
              {skill.difficulty}
            </span>
          </div>
          <p style={{ fontSize: '0.88rem', color: 'var(--text-muted)', margin: 0, lineHeight: 1.4 }}>
            {skill.shortDesc}
          </p>
        </div>
      </div>

      {/* Action row */}
      <div style={{ display: 'flex', gap: 8, marginBottom: expanded ? 14 : 0 }}>
        <button
          onClick={() => setExpanded(!expanded)}
          style={{
            flex: 1, padding: '7px 14px', borderRadius: 8,
            background: 'var(--cream)', border: '1px solid var(--border)',
            cursor: 'pointer', fontSize: '0.85rem', fontFamily: 'var(--font-body)',
            color: 'var(--text-muted)', transition: 'all 0.15s',
            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 4,
          }}
          onMouseEnter={(e) => { (e.currentTarget as HTMLButtonElement).style.background = 'var(--parch-dark)'; }}
          onMouseLeave={(e) => { (e.currentTarget as HTMLButtonElement).style.background = 'var(--cream)'; }}
        >
          {expanded ? '▲ 접기' : '📋 방법 보기'}
        </button>
        <button
          onClick={toggleDone}
          style={{
            padding: '7px 16px', borderRadius: 8,
            background: done ? '#4a5e3a' : 'var(--parch)',
            border: `1.5px solid ${done ? '#3a5230' : 'var(--border)'}`,
            cursor: 'pointer', fontSize: '0.85rem', fontFamily: 'var(--font-body)',
            color: done ? '#fff' : 'var(--text-muted)',
            fontWeight: done ? 600 : 400,
            transition: 'all 0.2s ease',
            whiteSpace: 'nowrap',
          }}
        >
          {done ? '✅ 완료!' : '오늘 완료! ✅'}
        </button>
      </div>

      {/* Steps */}
      {expanded && (
        <ol style={{
          margin: 0, paddingLeft: '1.4em',
          display: 'flex', flexDirection: 'column', gap: 6,
        }}>
          {skill.steps.map((step, i) => (
            <li key={i} style={{
              fontSize: '0.92rem', lineHeight: 1.5,
              color: 'var(--text)', fontFamily: 'var(--font-body)',
            }}>
              {step}
            </li>
          ))}
        </ol>
      )}
    </div>
  );
}

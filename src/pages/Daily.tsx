import { useState, useMemo } from 'react';
import { getNickname } from '../components/NicknameModal';
import { logActivity } from '../lib/firebase';

interface Skill {
  title: string;
  emoji: string;
  difficulty: '초급' | '중급' | '고급';
  shortDesc: string;
  steps: string[];
}

const WEEKDAY_SKILLS: Skill[] = [
  { title: "보울라인 매듭 연습", emoji: "🪢", difficulty: "초급", shortDesc: "로프 없어도 끈이나 전선으로 연습 가능한 필수 매듭", steps: ["왼손에 루프를 만든다 (토끼굴)", "끈 끝(토끼)을 굴에서 나오게 한다", "나무(긴 줄) 뒤로 돌린다", "다시 굴 속으로 집어넣고 조인다", "루프 크기 조절 후 완성"] },
  { title: "클로브 히치 암기", emoji: "🪢", difficulty: "초급", shortDesc: "기둥 고정에 쓰는 2초 매듭, 눈 감고 묶기 목표", steps: ["줄을 기둥에 한 번 감는다", "X자가 되게 한 번 더 감는다", "두 번째 감을 첫 번째 감 아래로 통과", "당기면 완성 — 30초 안에 가능하게 연습"] },
  { title: "파라코드 8자 보관법", emoji: "🪢", difficulty: "초급", shortDesc: "엉키지 않게 파라코드 정리하는 법", steps: ["한쪽 끝을 왼손에 잡는다", "팔꿈치-손바닥 사이를 8자로 감는다", "마지막 1m를 감긴 줄 중간에 여러 번 감아 고정", "펼 때는 한쪽 끝을 잡아당기면 술술 풀림"] },
  { title: "나이프 각도 연습", emoji: "🔪", difficulty: "중급", shortDesc: "칼 연마의 핵심은 각도 유지. 숫돌 없어도 각도 감각 연습 가능", steps: ["동전 2개를 겹쳐 칼날 아래 놓으면 약 20도", "이 각도를 손으로 기억한다", "빈 손으로 20도 유지 연습 10회", "실제 연마 시 이 각도를 끝까지 유지"] },
  { title: "프루직 매듭 이해", emoji: "🪢", difficulty: "중급", shortDesc: "마찰로 잠기는 마법 매듭 — 로프 2가지로 연습", steps: ["가는 줄(슬링)을 메인 로프에 3번 감는다", "루프를 자신 안으로 통과시킨다", "위로 밀면 이동, 체중 걸리면 잠김 원리 이해", "3번 vs 5번 감기 차이 비교해본다"] },
  { title: "장비 점검 루틴", emoji: "🎒", difficulty: "초급", shortDesc: "배낭 속 장비를 꺼내 상태 점검하는 습관", steps: ["나이프 — 날 상태, 녹, 잠금장치 확인", "라이터 — 가스 잔량, 점화 테스트", "파라코드 — 엉킴, 손상, 길이 확인", "응급키트 — 유통기한, 소모품 보충", "메모: 다음 필드 전 구매 목록 작성"] },
  { title: "팀버 히치 연습", emoji: "🪢", difficulty: "초급", shortDesc: "통나무를 끌 때 쓰는 자조임 매듭", steps: ["줄을 통나무에 한 번 감는다", "짧은 끝을 긴 줄에 세 번 꼬아 감는다", "당길수록 더 조여지는 원리 확인", "의자 다리에 대고 연습해본다"] },
  { title: "매듭 이름 20개 암기", emoji: "📖", difficulty: "초급", shortDesc: "부시크래프터라면 알아야 할 매듭 이름", steps: ["보울라인, 클로브히치, 팀버히치 (기본 3)", "프루직, 블레이크히치 (마찰 매듭)", "피셔맨즈, 더블피셔맨즈 (연결 매듭)", "래핑히치, 데드아이히치 (고정 매듭)", "쉬트밴드, 캐릭밴드 (줄 연결)"] },
  { title: "불피우기 이론 정리", emoji: "🔥", difficulty: "초급", shortDesc: "실전 전 머릿속으로 시뮬레이션", steps: ["틴더 → 킨들링 → 연료 순서 이해", "틴더: 마른 풀, 자작나무 껍질, 솔방울 솜털", "킨들링: 연필 굵기 나뭇가지", "연료: 손목 굵기 이상의 건조한 나무", "바람 방향, 공기 흐름 계획"] },
  { title: "나이프 안전 수칙 복습", emoji: "🔪", difficulty: "초급", shortDesc: "혼자 복습하는 나이프 안전 10계명", steps: ["항상 날은 몸 바깥 방향", "닫을 때 절대 손가락이 날 경로에 없게", "전달 시 핸들을 상대방에게", "작업 중 말 걸지 않기", "칼집에 넣기 전 날 방향 확인"] },
  { title: "배낭 무게 최적화", emoji: "🎒", difficulty: "중급", shortDesc: "짐을 줄이는 사고방식 연습", steps: ["모든 짐을 바닥에 펼친다", "3가지로 분류: 필수/선택/없어도됨", "'선택'에서 한 가지 제거 도전", "무게 측정: 배낭 없이 짐만 재보기", "목표: 1박 기준 7kg 이하"] },
  { title: "셸터 종류 이론 학습", emoji: "⛺", difficulty: "초급", shortDesc: "A형/린투/퀸시/데브리 쉘터 특징 이해", steps: ["A형 타프: 릿지라인, 좌우 개방, 환기 최고", "린투: 한쪽만 개방, 바람막이 탁월", "퀸시: 눈 동굴, 보온 최고 단점은 시간", "데브리 쉘터: 나뭇가지+낙엽, 도구 없이 가능", "오늘 밤 자고 싶은 쉘터 스케치해보기"] },
  { title: "피셔맨즈 매듭 연습", emoji: "🪢", difficulty: "중급", shortDesc: "두 줄을 연결하는 강력한 낚시꾼 매듭", steps: ["줄 두 개를 겹쳐서 나란히 놓는다", "A줄로 B줄 주변에 3번 감아 묶는다", "B줄로 A줄 주변에 3번 감아 묶는다", "두 매듭을 서로 잡아당겨 맞붙인다"] },
  { title: "응급처치 이론: 지혈", emoji: "🩹", difficulty: "초급", shortDesc: "야외 출혈 대처법 머릿속으로 복습", steps: ["직접 압박이 1순위 — 손으로 세게 누른다", "최소 10분 압박, 중간에 절대 확인하지 않음", "심장보다 높게 들어올리기", "지혈대는 팔다리 절단 위협 시에만", "시간 기록 필수: 지혈대 묶은 시각"] },
];

const WEEKEND_SKILLS: Skill[] = [
  { title: "부싯돌 불꽃 내기", emoji: "🔥", difficulty: "중급", shortDesc: "플린트+스트라이커로 차르클로스에 불꽃 옮기기", steps: ["차르클로스를 부싯돌 위에 올린다", "스트라이커를 45도 각도로 잡는다", "손목 스냅으로 빠르게 내리친다", "불꽃이 튀어 차르클로스가 빨갛게 되면", "버드네스트로 감싸 불어서 불꽃으로 키운다"] },
  { title: "타프 A형 설치", emoji: "⛺", difficulty: "초급", shortDesc: "10분 안에 비 피할 수 있는 기본 쉘터", steps: ["두 나무 사이에 릿지라인 팽팽히 설치", "릿지라인 높이: 가슴 높이가 적당", "타프 중앙 그로밋에 줄로 릿지라인 연결", "양쪽 하단 모서리를 45도로 팩 고정", "바람 방향 확인 후 입구 방향 조정"] },
  { title: "페더스틱 만들기", emoji: "🪵", difficulty: "중급", shortDesc: "나무를 깎아 만드는 천연 불쏘시개", steps: ["건조한 소나무 가지를 선택 (손가락 굵기)", "나이프를 45도 각도로 세운다", "끝까지 깎지 않고 깃털 모양으로 남긴다", "5~8개 깃털이 붙어있게 만든다", "가장 가는 깃털부터 불을 붙인다"] },
  { title: "야외 정수 실습", emoji: "💧", difficulty: "중급", shortDesc: "필터+끓이기로 안전한 식수 만들기", steps: ["흐르는 물보다 고인 물은 피한다", "큰 이물질: 천으로 1차 여과", "소형 필터 (소이어 등)로 2차 여과", "가능하면 끓이기로 마무리 (100도 1분)", "맑아도 반드시 정수 — 지아르디아 주의"] },
  { title: "활비비 불 피우기 도전", emoji: "🔥", difficulty: "고급", shortDesc: "원시 마찰 발화의 정수", steps: ["화판: 편평한 건조 버드나무/소나무", "스핀들: 30cm 직선 건조 막대", "화판에 V노치+불씨받이 홈 파기", "활로 스핀들을 빠르게 돌린다", "연기 → 불씨 → 버드네스트로 불꽃 만들기"] },
  { title: "린투 쉘터 만들기", emoji: "⛺", difficulty: "중급", shortDesc: "경사 지붕으로 바람 막는 1인 야영지", steps: ["경사 아래쪽이 바람 방향 향하게 설정", "두 나무 사이에 낮은 릿지라인 설치", "타프 한쪽을 높게, 반대쪽을 낮게 고정", "낙엽을 10cm 이상 두텁게 깔아 단열", "입구 반대쪽 완전히 막아 보온 강화"] },
  { title: "자작나무 껍질 채취", emoji: "🌿", difficulty: "초급", shortDesc: "천연 방수재+불쏘시개의 왕", steps: ["죽은 자작나무에서만 채취 (산 나무 훼손 금지)", "흰 껍질의 얇은 층을 벗겨낸다", "불쏘시개: 얇게 구겨서 습기에도 점화 가능", "방수재: 이음새에 발라 방수층 형성", "타르 채취: 불에 가열하면 천연 접착제"] },
  { title: "이슬 채취 실습", emoji: "💧", difficulty: "중급", shortDesc: "새벽 이슬로 비상 식수 확보", steps: ["새벽 4~6시가 이슬 최대 시간", "마른 면 천을 풀밭에서 끌거나 닦는다", "젖은 천을 모아 용기에 짠다", "하루 0.5~1L 확보 가능", "반드시 여과 후 마실 것"] },
  { title: "방향 찾기 실습", emoji: "🧭", difficulty: "초급", shortDesc: "나침반 없이 태양으로 방향 파악", steps: ["막대 40cm를 수직으로 땅에 세운다", "그림자 끝에 돌 A를 놓는다", "20분 기다린다", "새 그림자 끝에 돌 B를 놓는다", "A→B 방향이 서→동, 수직이 남→북"] },
  { title: "별자리 북쪽 찾기", emoji: "⭐", difficulty: "중급", shortDesc: "야간 방향 감각의 기본", steps: ["큰곰자리(북두칠성) 국자 모양을 찾는다", "국자 끝 두 별(Dubhe-Merak)을 잇는다", "그 간격의 5배를 연장한 지점", "그곳이 북극성(Polaris)", "북극성 방향이 정북 — 오차 1도 이내"] },
  { title: "통나무 처리 연습", emoji: "🪓", difficulty: "중급", shortDesc: "나이프+바토닝으로 장작 만들기", steps: ["바토닝: 나이프 등에 막대로 쳐서 나무 쪼개기", "그레인 방향 따라 쪼개면 힘 덜 든다", "30cm 길이로 자르고 손바닥 굵기로 쪼개기", "불쏘시개용 얇은 것 따로 분류", "작업 중 항상 날은 몸 바깥 방향"] },
  { title: "야생 식물 관찰", emoji: "🌿", difficulty: "중급", shortDesc: "먹을 수 있는 식물 눈으로 익히기", steps: ["민들레: 잎 톱니 모양, 꽃 노란색, 전체 식용", "질경이: 잎 타원형, 잎맥 세로, 데쳐서 식용", "쑥: 특유의 향, 잎 뒷면 흰 솜털", "처음 보는 식물은 절대 섭취 금지", "오늘은 관찰만 — 사진 찍어 도감과 비교"] },
  { title: "빗물 수집 시스템", emoji: "💧", difficulty: "초급", shortDesc: "타프로 식수 모으는 실전 설치", steps: ["타프를 가운데가 처지도록 설치", "가장 낮은 지점 아래에 용기 위치", "비 오기 전에 타프를 씻어낸다 (초기 흘러내린 물 버림)", "튜브나 천으로 흘러내리는 경로 만들기", "1mm 강수 = 1㎡당 1리터 기준"] },
  { title: "숯 만들기", emoji: "🔥", difficulty: "고급", shortDesc: "완전 연소된 숯으로 정밀 화력 제어", steps: ["참나무, 박달나무 등 단단한 활엽수 사용", "강한 불로 완전히 태운다", "산소를 차단하면 숯 완성 (흙이나 재로 덮기)", "진짜 숯: 두드리면 맑은 소리", "재: 두드리면 부서짐 — 구별 연습"] },
];

function seededRandom(seed: string): number {
  let hash = 0;
  for (let i = 0; i < seed.length; i++) {
    const char = seed.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash;
  }
  return Math.abs(hash);
}

const DIFFICULTY_COLORS: Record<string, { bg: string; color: string; border: string }> = {
  초급: { bg: '#e3eedc', color: '#3a5230', border: '#c8dcc0' },
  중급: { bg: '#fef5d6', color: '#7a5c00', border: '#f0dea0' },
  고급: { bg: '#fce8e2', color: '#a83515', border: '#f0c8b8' },
};

const DAY_NAMES_KR = ['일요일', '월요일', '화요일', '수요일', '목요일', '금요일', '토요일'];

function getDailyKey(nickname: string): string {
  const d = new Date();
  const yyyy = d.getFullYear();
  const mm = String(d.getMonth() + 1).padStart(2, '0');
  const dd = String(d.getDate()).padStart(2, '0');
  return `wildcraft_daily_${nickname}_${yyyy}-${mm}-${dd}`;
}

export default function Daily() {
  const today = new Date();
  const dayOfWeek = today.getDay(); // 0=Sun, 6=Sat
  const isWeekend = dayOfWeek === 0 || dayOfWeek === 6;
  const dayName = DAY_NAMES_KR[dayOfWeek];
  const dateLabel = `${today.getFullYear()}. ${today.getMonth() + 1}. ${today.getDate()}`;

  const nickname = getNickname() || 'guest';

  const { mainSkill, previewSkill } = useMemo(() => {
    const todayStr = today.toDateString();
    const seed = nickname + todayStr;
    const mainList = isWeekend ? WEEKEND_SKILLS : WEEKDAY_SKILLS;
    const previewList = isWeekend ? WEEKDAY_SKILLS : WEEKEND_SKILLS;
    const mainIdx = seededRandom(seed) % mainList.length;
    const previewIdx = seededRandom(seed + 'preview') % previewList.length;
    return { mainSkill: mainList[mainIdx], previewSkill: previewList[previewIdx] };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [nickname, isWeekend]);

  const doneKey = getDailyKey(nickname);
  const [expanded, setExpanded] = useState(false);
  const [done, setDone] = useState(() => {
    try { return localStorage.getItem(doneKey) === '1'; } catch { return false; }
  });

  function toggleDone() {
    const next = !done;
    setDone(next);
    try { localStorage.setItem(doneKey, next ? '1' : '0'); } catch { /* noop */ }
    if (next) {
      logActivity(getNickname(), 'daily_done', `${mainSkill.title} 완료`);
    }
  }

  const diffStyle = DIFFICULTY_COLORS[mainSkill.difficulty] ?? DIFFICULTY_COLORS['초급'];
  const previewDiffStyle = DIFFICULTY_COLORS[previewSkill.difficulty] ?? DIFFICULTY_COLORS['초급'];

  return (
    <div className="page">
      {/* Header */}
      <div style={{ marginBottom: 24, paddingTop: 4 }}>
        <h1 style={{ margin: '0 0 4px', display: 'flex', alignItems: 'center', gap: '10px' }}>
          <span>🪓</span>
          <span>오늘의 사부작</span>
        </h1>
        <p style={{ color: 'var(--text-muted)', fontSize: '0.95rem', margin: 0 }}>
          🗓️ {dayName} · {dateLabel} · {isWeekend ? '주말 필드' : '평일 사부작'}
        </p>
      </div>

      {/* Main skill card */}
      <div style={{
        background: done
          ? 'linear-gradient(145deg, #f0f7ea 0%, #e8f4df 100%)'
          : 'linear-gradient(145deg, #fff 0%, #fdfaf7 100%)',
        border: `2px solid ${done ? '#c8dcc0' : 'var(--border)'}`,
        borderRadius: 16,
        padding: '20px',
        boxShadow: done ? '0 4px 16px rgba(74,94,58,0.15)' : 'var(--shadow)',
        transition: 'all 0.3s ease',
        marginBottom: 16,
      }}>
        {/* Skill header */}
        <div style={{ display: 'flex', alignItems: 'flex-start', gap: 14, marginBottom: 14 }}>
          <span style={{ fontSize: '2.6rem', lineHeight: 1 }}>{mainSkill.emoji}</span>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6, flexWrap: 'wrap' }}>
              <span style={{
                fontFamily: 'var(--font-display)', fontWeight: 700,
                fontSize: '1.2rem', color: done ? '#3a5230' : 'var(--bark)',
              }}>
                {mainSkill.title}
              </span>
              <span style={{
                padding: '2px 10px', borderRadius: 50, fontSize: '0.72rem',
                fontFamily: 'var(--font-ui)', fontWeight: 600, letterSpacing: '0.3px',
                background: diffStyle.bg, color: diffStyle.color, border: `1px solid ${diffStyle.border}`,
              }}>
                {mainSkill.difficulty}
              </span>
            </div>
            <p style={{ fontSize: '0.92rem', color: 'var(--text-muted)', margin: 0, lineHeight: 1.5 }}>
              {mainSkill.shortDesc}
            </p>
          </div>
        </div>

        {/* Action buttons */}
        <div style={{ display: 'flex', gap: 10, marginBottom: 12 }}>
          <button
            onClick={() => setExpanded(!expanded)}
            style={{
              flex: 1, padding: '9px 14px', borderRadius: 10,
              background: 'var(--cream)', border: '1px solid var(--border)',
              cursor: 'pointer', fontSize: '0.9rem', fontFamily: 'var(--font-body)',
              color: 'var(--text-muted)', transition: 'all 0.15s',
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6,
            }}
            onMouseEnter={(e) => { (e.currentTarget as HTMLButtonElement).style.background = 'var(--parch-dark)'; }}
            onMouseLeave={(e) => { (e.currentTarget as HTMLButtonElement).style.background = 'var(--cream)'; }}
          >
            {expanded ? '▲ 접기' : '📋 단계 보기'}
          </button>
          <button
            onClick={toggleDone}
            style={{
              padding: '9px 18px', borderRadius: 10,
              background: done ? '#4a5e3a' : 'var(--parch)',
              border: `1.5px solid ${done ? '#3a5230' : 'var(--border)'}`,
              cursor: 'pointer', fontSize: '0.9rem', fontFamily: 'var(--font-body)',
              color: done ? '#fff' : 'var(--text-muted)',
              fontWeight: done ? 600 : 400,
              transition: 'all 0.2s ease',
              whiteSpace: 'nowrap',
            }}
          >
            {done ? '✅ 완료!' : '완료 체크 ✅'}
          </button>
        </div>

        {/* YouTube + Image buttons — always visible */}
        <div style={{ display: 'flex', gap: 8 }}>
          <a
            href={`https://www.youtube.com/results?search_query=${encodeURIComponent(mainSkill.title + ' 부시크래프트')}`}
            target="_blank"
            rel="noopener noreferrer"
            style={{
              flex: 1, display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: 7,
              padding: '8px 12px', borderRadius: 10,
              background: '#ff0000', color: 'white',
              fontSize: '0.85rem', fontWeight: 500,
              textDecoration: 'none', transition: 'opacity 0.15s',
              fontFamily: 'var(--font-body)',
            }}
            onMouseEnter={(e) => { (e.currentTarget as HTMLAnchorElement).style.opacity = '0.85'; }}
            onMouseLeave={(e) => { (e.currentTarget as HTMLAnchorElement).style.opacity = '1'; }}
          >
            <svg width="15" height="15" viewBox="0 0 24 24" fill="white">
              <path d="M23.5 6.19a3.02 3.02 0 0 0-2.12-2.14C19.54 3.5 12 3.5 12 3.5s-7.54 0-9.38.55A3.02 3.02 0 0 0 .5 6.19C0 8.04 0 12 0 12s0 3.96.5 5.81a3.02 3.02 0 0 0 2.12 2.14C4.46 20.5 12 20.5 12 20.5s7.54 0 9.38-.55a3.02 3.02 0 0 0 2.12-2.14C24 15.96 24 12 24 12s0-3.96-.5-5.81zM9.75 15.5v-7l6.5 3.5-6.5 3.5z"/>
            </svg>
            유튜브 영상
          </a>
          <a
            href={`https://www.google.com/search?tbm=isch&q=${encodeURIComponent(mainSkill.title + ' 부시크래프트 방법')}`}
            target="_blank"
            rel="noopener noreferrer"
            style={{
              flex: 1, display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: 7,
              padding: '8px 12px', borderRadius: 10,
              background: 'var(--cream)', color: 'var(--bark)',
              border: '1px solid var(--border)',
              fontSize: '0.85rem', fontWeight: 500,
              textDecoration: 'none', transition: 'all 0.15s',
              fontFamily: 'var(--font-body)',
            }}
            onMouseEnter={(e) => { (e.currentTarget as HTMLAnchorElement).style.background = 'var(--parch-dark)'; }}
            onMouseLeave={(e) => { (e.currentTarget as HTMLAnchorElement).style.background = 'var(--cream)'; }}
          >
            🖼️ 이미지 보기
          </a>
        </div>

        {/* Steps */}
        {expanded && (
          <ol style={{
            margin: '14px 0 0', paddingLeft: '1.5em',
            display: 'flex', flexDirection: 'column', gap: 8,
          }}>
            {mainSkill.steps.map((step, i) => (
              <li key={i} style={{
                fontSize: '0.95rem', lineHeight: 1.6,
                color: 'var(--text)', fontFamily: 'var(--font-body)',
              }}>
                {step}
              </li>
            ))}
          </ol>
        )}
      </div>

      {/* Done message */}
      {done && (
        <div style={{
          textAlign: 'center', padding: '16px 20px',
          background: 'linear-gradient(145deg, #e8f4df 0%, #d8eecf 100%)',
          border: '1.5px solid #c8dcc0',
          borderRadius: 12, marginBottom: 24,
          color: '#3a5230',
          fontFamily: 'var(--font-display)', fontWeight: 600,
          fontSize: '1rem',
        }}>
          오늘 사부작 완료! 내일 또 만나요 용사님 🌿
        </div>
      )}

      {/* Preview of opposite category */}
      <p className="section-title" style={{ marginTop: done ? 0 : 16 }}>
        다른 스킬 둘러보기
      </p>
      <div style={{
        background: 'linear-gradient(145deg, var(--surface) 0%, #fdfaf7 100%)',
        border: '1.5px solid var(--border)',
        borderRadius: 12,
        padding: '16px 18px',
        boxShadow: 'var(--shadow-sm)',
        opacity: 0.85,
      }}>
        <div style={{
          fontSize: '0.72rem', fontFamily: 'var(--font-ui)', fontWeight: 600,
          color: 'var(--text-muted)', letterSpacing: '0.5px', marginBottom: 10,
          textTransform: 'uppercase',
        }}>
          {isWeekend ? '🏠 평일 사부작 미리보기' : '🌲 주말 필드 미리보기'}
        </div>
        <div style={{ display: 'flex', alignItems: 'flex-start', gap: 12 }}>
          <span style={{ fontSize: '1.8rem', lineHeight: 1 }}>{previewSkill.emoji}</span>
          <div style={{ flex: 1 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4, flexWrap: 'wrap' }}>
              <span style={{
                fontFamily: 'var(--font-display)', fontWeight: 600,
                fontSize: '0.95rem', color: 'var(--bark)',
              }}>
                {previewSkill.title}
              </span>
              <span style={{
                padding: '1px 8px', borderRadius: 50, fontSize: '0.68rem',
                fontFamily: 'var(--font-ui)', fontWeight: 600,
                background: previewDiffStyle.bg, color: previewDiffStyle.color,
                border: `1px solid ${previewDiffStyle.border}`,
              }}>
                {previewSkill.difficulty}
              </span>
            </div>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', margin: 0, lineHeight: 1.4 }}>
              {previewSkill.shortDesc}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

export interface DailyTask {
  id: string;
  title: string;
  description: string;
  category: '스킬' | '요리' | '카빙' | '손질' | '매듭' | '응급' | '장비';
  importance: 1 | 2 | 3; // 1=보통 2=권장 3=필수
  isWeekend: boolean;     // true=필드 전용, false=집/도심 가능
  youtubeQuery: string;
}

export const WEEKDAY_TASKS: DailyTask[] = [
  {
    id: 'knot-bowline', title: '보울라인 매듭 완전 정복',
    description: '구조 상황의 기본. 토끼가 굴에서 나와 나무를 돌고 다시 들어간다. 눈 감고 할 수 있을 때까지 반복한다. 손목에 걸어 빠지지 않는지 확인.',
    category: '매듭', importance: 3, isWeekend: false, youtubeQuery: '보울라인 매듭 묶는 법 부시크래프트',
  },
  {
    id: 'gear-knife-sharpen', title: '나이프 날 세우기 (숫돌 기초)',
    description: '숫돌 400방으로 날 각도 15~20도 유지하며 앞으로 밀기. 날카로움은 팔 털 면도 테스트로 확인. 스트로핑으로 마무리.',
    category: '장비', importance: 3, isWeekend: false, youtubeQuery: '나이프 숫돌 날 세우기 방법',
  },
  {
    id: 'carving-feather', title: '페더스틱 깎기 도전',
    description: '건조한 소나무나 삼나무 막대에서 얇고 긴 깃털 모양 조각 깎기. 꽃잎이 5장 이상 붙어있어야 합격. 습한 날씨에도 불을 붙일 수 있게 하는 기술.',
    category: '카빙', importance: 2, isWeekend: false, youtubeQuery: '페더스틱 만들기 불쏘시개 깎기',
  },
  {
    id: 'gear-paracord-bracelet', title: '파라코드 팔찌 만들기',
    description: '코브라 매듭으로 8인치 팔찌 완성. 약 3m 파라코드 확보. 비상시 분해해서 줄로 사용 가능.',
    category: '장비', importance: 1, isWeekend: false, youtubeQuery: '파라코드 팔찌 만들기 코브라 매듭',
  },
  {
    id: 'emergency-tourniquet', title: '응급 지혈대 사용법',
    description: 'CAT 지혈대 또는 파라코드로 사지 지혈 연습. 부착 위치는 상처 위 5~8cm. 시간 기록 필수. 2시간 이내 병원 도착이 목표.',
    category: '응급', importance: 3, isWeekend: false, youtubeQuery: '지혈대 사용법 응급처치 야외',
  },
  {
    id: 'knot-clove-hitch', title: '클로브 히치 + 하프 히치',
    description: '타프 릿지라인 연결의 핵심. 기둥이나 나무에 빠르게 고정하는 법. 하프 히치 2개로 마감해 풀리지 않게 고정.',
    category: '매듭', importance: 2, isWeekend: false, youtubeQuery: '클로브 히치 매듭 타프 설치',
  },
  {
    id: 'skill-firestarter', title: '화이어 스타터로 틴더 점화',
    description: '페로 세륨 로드로 버드네스트 틴더에 불씨 만들기. 스트라이크 각도 45도, 짧고 강하게. 차르클로스 없이 자작나무 껍질로 도전.',
    category: '스킬', importance: 2, isWeekend: false, youtubeQuery: '페로세륨 부싯돌 틴더 불붙이기',
  },
  {
    id: 'skill-char-cloth', title: '차르클로스 만들기',
    description: '면 천 5×5cm를 알루미늄 캔에 넣고 작은 구멍 뚫어 가스버너로 가열. 연기가 멈추면 완성. 작은 불꽃도 받아들이는 최고의 틴더.',
    category: '스킬', importance: 2, isWeekend: false, youtubeQuery: '차르클로스 만들기 틴더 부시크래프트',
  },
  {
    id: 'gear-bob-check', title: '생존 배낭(BOB) 점검',
    description: '비상용 배낭 72시간 기준 점검: 물 3L, 비상식량, 응급키트, 나이프, 방수 성냥, 호루라기, 보온재, 통신수단. 유통기한 확인.',
    category: '장비', importance: 3, isWeekend: false, youtubeQuery: 'BOB 배낭 72시간 생존가방 구성',
  },
  {
    id: 'knot-ridgeline', title: '릿지라인 팽팽하게 설치',
    description: '두 나무 사이에 타우트라인 히치로 팽팽한 릿지라인 설치. 손가락으로 튕겼을 때 탁 소리 나야 합격. 높이는 눈높이 기준.',
    category: '매듭', importance: 2, isWeekend: false, youtubeQuery: '릿지라인 설치 타프 매듭',
  },
  {
    id: 'skill-flint-practice', title: '부싯돌 스트라이크 연습',
    description: '부싯돌 날카로운 면으로 철 스트라이커를 강하게 내리쳐 불꽃 만들기. 차르클로스 위에 모이도록 조절. 한 번에 성공하는 각도 찾기.',
    category: '스킬', importance: 2, isWeekend: false, youtubeQuery: '부싯돌 불꽃 만들기 flint strike',
  },
  {
    id: 'emergency-bandage', title: '응급 압박 붕대 감기',
    description: '이스라엘 붕대 또는 삼각건으로 팔 다리 압박 붕대 감기 연습. 너무 타이트하면 혈액순환 차단. 2분 안에 완성이 목표.',
    category: '응급', importance: 3, isWeekend: false, youtubeQuery: '야외 응급처치 붕대 감기',
  },
  {
    id: 'carving-spoon-start', title: '스푼 카빙 첫걸음',
    description: '라임이나 버드나무 재료로 스푼 외형 그리기. 칼로 어깨 그립 사용해 볼 파내기. 안전 수칙: 항상 몸 바깥 방향으로 깎기.',
    category: '카빙', importance: 2, isWeekend: false, youtubeQuery: '스푼 카빙 만들기 나이프 나무',
  },
  {
    id: 'knot-prusik', title: '프루직 매듭 배우기',
    description: '가는 루프 코드를 두꺼운 줄에 3번 감아 만드는 마찰 매듭. 체중 걸리면 잠기고 손으로 밀면 이동. 로프 등반의 기본.',
    category: '매듭', importance: 2, isWeekend: false, youtubeQuery: '프루직 매듭 로프 등반',
  },
  {
    id: 'skill-compass-watch', title: '손목시계 나침반법',
    description: '아날로그 시계 시침을 태양 방향으로 향하게. 시침과 12시 사이 이등분선이 남쪽. 디지털 시계 있으면 아날로그 그려서 적용.',
    category: '스킬', importance: 2, isWeekend: false, youtubeQuery: '손목시계 나침반 방향 찾기 생존',
  },
  {
    id: 'cooking-can', title: '캔 쿠킹 도전 (화롯대 없이)',
    description: '알루미늄 캔 바닥 구멍 뚫어 alcohol 스토브 만들기. 500ml 물 끓이는 시간 측정. 미니멀 생존 요리의 기본.',
    category: '요리', importance: 1, isWeekend: false, youtubeQuery: '알코올 캔 스토브 만들기 캠핑',
  },
  {
    id: 'knot-tarp-system', title: '타프 A형 매듭 시스템',
    description: '릿지라인에 피그 테일 히치로 타프 연결, 4코너에 타우트라인 히치로 팩 고정. 혼자서 10분 내 완성이 목표.',
    category: '매듭', importance: 2, isWeekend: false, youtubeQuery: '타프 A형 설치 매듭 혼자',
  },
  {
    id: 'skill-knife-safety', title: '나이프 안전 수칙 완전 복습',
    description: '날이 항상 몸 바깥 방향. 이동 시 칼집. 건네줄 때 칼끝 아래. 바토닝 자세. 나이프 낙하 시 절대 잡지 마라. 반복 체화.',
    category: '스킬', importance: 3, isWeekend: false, youtubeQuery: '나이프 안전 수칙 부시크래프트',
  },
  {
    id: 'skill-birds-nest', title: '버드네스트 틴더 만들기',
    description: '마른 풀, 솔잎, 나무껍질 섬유를 새 둥지 모양으로 뭉치기. 안쪽은 가장 가는 재료. 불씨를 안에 넣고 불어 불꽃으로 키우기.',
    category: '스킬', importance: 2, isWeekend: false, youtubeQuery: '버드네스트 틴더 만들기 불 피우기',
  },
  {
    id: 'skill-batoning', title: '바토닝 자세 연습',
    description: '나이프 등 부분에 막대로 쳐서 장작 쪼개기. 칼날이 통나무 중심을 통과하도록. 나이프 팁 위치 확인. 풀 탱 나이프 전용.',
    category: '스킬', importance: 2, isWeekend: false, youtubeQuery: '바토닝 장작 패기 나이프 기술',
  },
  {
    id: 'cooking-one-pot', title: '원팟 야영 요리 완성',
    description: '트랑기아 세트나 코펠 하나로 주식+사이드 동시 조리. 파스타 or 쌀 + 채소 + 단백질. 최소 도구로 최대 칼로리 만들기.',
    category: '요리', importance: 1, isWeekend: false, youtubeQuery: '원팟 캠핑 요리 코펠 하나로',
  },
  {
    id: 'gear-survival-kit', title: '포켓 생존 키트 DIY',
    description: '알루미늄 케이스에: 페로 세륨 로드, 낚시바늘+줄, 안전핀, 차르클로스, 접이식 나이프, 핀셋, 지사제. 언제나 주머니에.',
    category: '장비', importance: 3, isWeekend: false, youtubeQuery: 'EDC 포켓 생존 키트 구성',
  },
  {
    id: 'emergency-signal', title: '조난 신호 만들기 이론',
    description: '국제 조난 신호: 땅에 SOS 대형 3개. 호루라기 3회 반복. 거울 반사로 항공기에 신호. STOP 원칙 재숙지.',
    category: '응급', importance: 2, isWeekend: false, youtubeQuery: '조난 신호 만들기 SOS 생존',
  },
  {
    id: 'cooking-herb-tea', title: '허브 인퓨전 차 집에서',
    description: '민트, 레몬밤, 히비스커스 등 구할 수 있는 허브로 야외 차 준비. 필드에서 같은 방법 활용 가능. 보온병에 담아 외출.',
    category: '요리', importance: 1, isWeekend: false, youtubeQuery: '야생 허브 차 끓이기 캠핑',
  },
  {
    id: 'knot-sheet-bend', title: '쉬트 밴드로 줄 연결',
    description: '굵기가 다른 두 줄을 연결하는 매듭. 단일 vs 이중 쉬트 밴드. 장력이 걸릴수록 더 강하게 잠김. 타프 연장에 자주 사용.',
    category: '매듭', importance: 2, isWeekend: false, youtubeQuery: '쉬트밴드 매듭 줄 연결',
  },
];

export const WEEKEND_TASKS: DailyTask[] = [
  {
    id: 'skill-bowdrill', title: '활비비(바우드릴) 발화 도전',
    description: '스핀들(소나무/버드나무), 화판(같은 재료), 활(유연한 나뭇가지), 핸드피스. 압력 + 속도가 핵심. 검은 불씨가 화판 V노치에 모이면 버드네스트로 이동.',
    category: '스킬', importance: 3, isWeekend: true, youtubeQuery: '활비비 바우드릴 불피우기 원시 발화',
  },
  {
    id: 'shelter-a-frame', title: 'A형 타프 쉘터 완성',
    description: '두 나무 사이에 릿지라인 치고, 타프를 A자로 걸어 4코너 팩다운. 바람 방향 확인 후 입구 위치 결정. 비에도 버티는지 물 테스트.',
    category: '스킬', importance: 3, isWeekend: true, youtubeQuery: '타프 A형 쉘터 설치 혼자 野',
  },
  {
    id: 'fishing-clean-grill', title: '민물고기 손질 + 직화 구이',
    description: '비늘 제거 → 배 갈라 내장 제거 → 소금 뿌려 30분 → 직화 그릴. 눈이 하얗게 익으면 완성. 내장은 미끼나 땅에 묻어 LNT 준수.',
    category: '손질', importance: 2, isWeekend: true, youtubeQuery: '민물고기 손질 직화 구이 캠핑',
  },
  {
    id: 'skill-wood-splitting', title: '통나무 패기 + 불 관리',
    description: '도끼 스윙: 무릎 굽히고 허리로 내리기. 장작 크기별 분류 (큰 것→중→잔가지→틴더). 코어 온도 유지하며 3시간 불 관리.',
    category: '스킬', importance: 2, isWeekend: true, youtubeQuery: '장작 패기 도끼 불 관리 캠핑',
  },
  {
    id: 'skill-plant-id', title: '야생 식물 식별 산책',
    description: '쑥, 민들레, 냉이, 달래 식별 실습. 잎 앞뒷면, 줄기 단면, 향기 확인. 모르면 절대 먹지 마라. 스마트폰 도감 앱 보조.',
    category: '스킬', importance: 3, isWeekend: true, youtubeQuery: '야생식물 식용 식별 산나물 채취',
  },
  {
    id: 'skill-water-purify', title: '야생 식수 정수 실습',
    description: '1단계: 거친 천으로 부유물 제거 → 2단계: 정수 알약 or 끓이기 (100°C 1분). 라이프스트로우 사용법. 고지대 물이 상대적으로 안전.',
    category: '스킬', importance: 3, isWeekend: true, youtubeQuery: '야생 식수 정수 방법 생존',
  },
  {
    id: 'skill-flint-fire', title: '부싯돌 발화 성공하기',
    description: '부싯돌 날카로운 모서리 + 철 스트라이커. 차르클로스를 부싯돌 위에 올리고 강하게 내리쳐 불씨 이동. 버드네스트로 완성.',
    category: '스킬', importance: 3, isWeekend: true, youtubeQuery: '부싯돌 발화 실제 영상 flint fire',
  },
  {
    id: 'cooking-chicken-leg', title: '직화 닭다리 구이 마스터',
    description: '닭다리에 칼집 4~5개 → 소금 올리브오일 허브 마리네이드 1시간 → 석쇠나 나뭇가지 꼬치로 직화 25~30분. 관절 부분에서 맑은 육즙이 나오면 완성.',
    category: '요리', importance: 2, isWeekend: true, youtubeQuery: '직화 닭다리 구이 캠핑 요리',
  },
  {
    id: 'shelter-leanto', title: '린투 쉘터 만들기',
    description: '릿지 폴 두 나무에 묶고, 길고 굵은 가지를 기대어 골격 완성. 나뭇잎을 기와 방식으로 아래에서 위로 쌓기. 빗물 테스트.',
    category: '스킬', importance: 2, isWeekend: true, youtubeQuery: '린투 쉘터 자연 재료 만들기',
  },
  {
    id: 'cooking-dutch-oven', title: '더치오븐 빵 굽기',
    description: '반죽(밀가루+베이킹파우더+소금+물) → 더치오븐 바닥에 기름 → 숯불 위아래 배치 → 30~35분. 빵 두드렸을 때 통통 소리 나면 완성.',
    category: '요리', importance: 2, isWeekend: true, youtubeQuery: '더치오븐 빵 굽기 캠핑 화롯대',
  },
  {
    id: 'skill-hammock', title: '해먹 + 릿지라인 완성 설치',
    description: '나무 간격 3~4m, 높이 45도각. 나무 보호 스트랩 필수. 무게 중심 낮게, 바나나 모양 유지. 릿지라인에 타프 걸어 비 대비.',
    category: '스킬', importance: 2, isWeekend: true, youtubeQuery: '해먹 설치 방법 타프 나무 캠핑',
  },
  {
    id: 'butchering-chicken', title: '닭 한 마리 손질하기',
    description: '관절 위치 파악 후 나이프로 부위별 분리: 다리, 날개, 가슴, 등. 모든 부위 활용. 뼈는 육수용. 필드에서 할 수 있는 가장 실용적인 손질.',
    category: '손질', importance: 3, isWeekend: true, youtubeQuery: '닭 손질 부위별 분리 방법',
  },
  {
    id: 'carving-spoon-finish', title: '스푼 카빙 필드 완성',
    description: '라임/버드나무 재료 현장 채취 → 외형 거칠게 → 볼 파내기 → 사포 120→220방 순서로 마감 → 아마씨유 마감. 완성품 실제 사용.',
    category: '카빙', importance: 2, isWeekend: true, youtubeQuery: '스푼 카빙 완성 나이프 버드나무',
  },
  {
    id: 'cooking-wild-tea', title: '야생초 차 필드에서 끓이기',
    description: '쑥, 솔잎, 민들레 뿌리 식별 후 채취. 흐르는 물에 세척. 직화 끓이기 2~3분. 야생 차는 정체성 확인 후만 음용.',
    category: '요리', importance: 1, isWeekend: true, youtubeQuery: '야생 쑥차 솔잎차 끓이기 자연',
  },
  {
    id: 'emergency-stretcher', title: '응급 들것 만들기',
    description: '2개의 긴 막대 + 자켓 2개 소매 뒤집기. 또는 타프 + 막대. 한 사람이 혼자 이동시키는 법. 척추 부상 의심 시 절대 이동 금지 원칙.',
    category: '응급', importance: 3, isWeekend: true, youtubeQuery: '야외 응급 들것 만들기 생존',
  },
];

// 날짜 기반 시드 (모든 유저 동일)
function dateHash(dateStr: string): number {
  let hash = 0;
  for (const ch of dateStr) hash = ((hash << 5) - hash) + ch.charCodeAt(0);
  return Math.abs(hash);
}

export function getTodayTask(): DailyTask {
  const now = new Date();
  const day = now.getDay(); // 0=일, 6=토
  const isWeekend = day === 0 || day === 6;
  const pool = isWeekend ? WEEKEND_TASKS : WEEKDAY_TASKS;
  const dateStr = `${now.getFullYear()}-${now.getMonth()}-${now.getDate()}`;
  return pool[dateHash(dateStr) % pool.length];
}

// 히스토리
export interface TaskHistory {
  taskId: string;
  title: string;
  category: string;
  completed: boolean;
  date: string; // "YYYY-MM-DD"
}

const HISTORY_KEY = 'bushkipidia_daily_history';

export function getHistory(): TaskHistory[] {
  try {
    return JSON.parse(localStorage.getItem(HISTORY_KEY) ?? '[]') as TaskHistory[];
  } catch { return []; }
}

export function markTodayComplete(task: DailyTask): void {
  const history = getHistory();
  const today = new Date();
  const dateStr = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;
  const exists = history.find((h) => h.date === dateStr);
  if (!exists) {
    history.unshift({ taskId: task.id, title: task.title, category: task.category, completed: true, date: dateStr });
    // 최근 60일만 보관
    localStorage.setItem(HISTORY_KEY, JSON.stringify(history.slice(0, 60)));
  }
}

export function isTodayCompleted(): boolean {
  const today = new Date();
  const dateStr = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;
  return getHistory().some((h) => h.date === dateStr && h.completed);
}

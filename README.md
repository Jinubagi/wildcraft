# 🌿 WildCraft — 부시크래프트 가이드

야외 생존 기술과 부시크래프트를 위한 AI 기반 모바일 앱.

## 기능

- **AI 질문** — 부시크래프트 관련 무엇이든 물어보세요
- **매듭 추천** — 상황별 매듭 + YouTube 링크
- **장비 분석** — 보유 장비 분석 및 추천
- **긴급 대처** — 오프라인 작동하는 시나리오 가이드
- **체크리스트** — 활동/계절별 AI 준비물 생성
- **스킬 DB** — Firebase 기반 커뮤니티 스킬 공유

---

## 로컬 개발 시작

### 1. 의존성 설치

```bash
npm install
```

### 2. 환경 변수 설정

`.env.local` 파일을 열어 API 키를 입력합니다:

```
VITE_ANTHROPIC_API_KEY=sk-ant-...
VITE_FIREBASE_API_KEY=AIza...
VITE_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your-project-id
VITE_FIREBASE_APP_ID=1:xxx:web:xxx
```

### 3. 개발 서버 실행

```bash
npm run dev
```

---

## Firebase 설정

### Firebase 프로젝트 생성

1. [Firebase Console](https://console.firebase.google.com) → **프로젝트 추가**
2. 프로젝트 이름 입력 후 생성

### Firestore 활성화

1. 좌측 메뉴 → **Firestore Database** → **데이터베이스 만들기**
2. **테스트 모드**로 시작 (30일 후 보안 규칙 업데이트 필요)
3. 리전 선택 (권장: `asia-northeast3` 서울)

### Authentication 활성화

1. 좌측 메뉴 → **Authentication** → **시작하기**
2. **로그인 방법** 탭 → **익명** 활성화

### 웹 앱 등록 및 API 키 확인

1. 프로젝트 설정 (⚙️) → **앱 추가** → 웹 (`</>`)
2. 앱 닉네임 입력 후 등록
3. `firebaseConfig` 객체에서 값을 복사하여 `.env.local`에 입력

### Firestore 보안 규칙 (프로덕션용)

```
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /skills/{category}/items/{itemId} {
      allow read: if true;
      allow create: if request.auth != null;
    }
    match /skills/{category}/corrections/{corrId} {
      allow read: if true;
      allow create: if request.auth != null;
    }
  }
}
```

### 시드 데이터 추가

Firebase 설정 완료 후, 임시로 Home.tsx에 버튼을 추가하거나 브라우저 콘솔에서:

```js
// 개발 서버 실행 중, 브라우저 콘솔에서
import('/src/lib/seedData.ts').then(m => m.runSeed())
```

---

## Vercel 배포

### GitHub 연동 배포 (권장)

1. [Vercel](https://vercel.com) → **New Project** → GitHub 저장소 import
2. Framework: **Vite** (자동 감지)
3. **Environment Variables** 탭에서 `.env.local`의 5개 변수 입력
4. **Deploy** 클릭

### CLI 배포

```bash
npm install -g vercel
vercel
```

### 환경 변수 (Vercel 대시보드)

| 변수명 | 설명 |
|--------|------|
| `VITE_ANTHROPIC_API_KEY` | Anthropic API 키 |
| `VITE_FIREBASE_API_KEY` | Firebase API 키 |
| `VITE_FIREBASE_AUTH_DOMAIN` | Firebase Auth 도메인 |
| `VITE_FIREBASE_PROJECT_ID` | Firebase 프로젝트 ID |
| `VITE_FIREBASE_APP_ID` | Firebase 앱 ID |

---

## 기술 스택

- **Frontend**: React 18 + TypeScript + Vite
- **Routing**: React Router v6
- **AI**: Anthropic Claude API (`claude-sonnet-4-6`)
- **Database**: Firebase Firestore + Anonymous Auth
- **Hosting**: Vercel

## 프로젝트 구조

```
src/
├── components/
│   ├── Layout.tsx      # 네비게이션 레이아웃
│   └── BottomSheet.tsx # 커뮤니티 기여 모달
├── lib/
│   ├── anthropic.ts    # Claude API 함수
│   ├── firebase.ts     # Firestore 함수
│   └── seedData.ts     # 초기 데이터
└── pages/
    ├── Home.tsx        # 메인 페이지
    ├── Skills.tsx      # 스킬 카테고리
    ├── AIPage.tsx      # AI 채팅
    ├── Emergency.tsx   # 긴급 가이드
    └── Checklist.tsx   # 준비물 체크리스트
```

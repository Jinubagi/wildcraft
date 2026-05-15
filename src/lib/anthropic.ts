import Anthropic from '@anthropic-ai/sdk';

const client = new Anthropic({
  apiKey: import.meta.env.VITE_ANTHROPIC_API_KEY,
  dangerouslyAllowBrowser: true,
});

const MODEL = 'claude-sonnet-4-6';

export interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
}

// Streaming helper — calls onChunk with accumulated text, returns full text
export async function streamMessage(
  params: Parameters<typeof client.messages.create>[0],
  onChunk: (accumulated: string) => void,
): Promise<string> {
  // Use the SDK's event-based API — more reliable than raw for-await iteration
  const stream = client.messages.stream(
    params as Parameters<typeof client.messages.stream>[0],
  );
  let full = '';
  stream.on('text', (_delta: string, snapshot: string) => {
    full = snapshot;
    onChunk(snapshot);
  });
  await stream.finalMessage();
  return full;
}

// General AI chat
export async function askWildcraft(
  messages: ChatMessage[],
  onChunk?: (text: string) => void,
  systemPrompt?: string,
): Promise<string> {
  const system =
    systemPrompt ||
    `당신은 WildCraft의 부시크래프트 전문 AI 가이드입니다.
야외 생존, 캠핑, 자연 속 기술에 대해 풍부한 경험을 가진 전문가입니다.
항상 한국어로 답변하고, 실용적이고 안전한 정보를 제공하세요.
응답은 마크다운을 사용해 구조화하되 간결하게 작성하세요.`;

  if (onChunk) {
    return streamMessage({ model: MODEL, max_tokens: 2048, system, messages }, onChunk);
  }
  const response = await client.messages.create({ model: MODEL, max_tokens: 2048, system, messages });
  const block = response.content[0];
  return block.type === 'text' ? block.text : '';
}

// Knot recommendation
export async function recommendKnot(situation: string, onChunk?: (text: string) => void): Promise<string> {
  const system = `당신은 매듭 전문가 부시크래프터입니다.
상황을 설명하면 최적의 매듭을 추천하고 단계별 묶는 방법을 설명합니다.
반드시 다음 형식으로 응답하세요:

## 추천 매듭: [매듭 이름]

**왜 이 매듭인가?**
[이유 2-3줄]

**묶는 방법**
1. [1단계]
2. [2단계]
3. [3단계]
...

**주의사항**
[중요 포인트]

**YouTube 검색**: [검색어 (예: "bowline knot tutorial")]`;

  const params = { model: MODEL, max_tokens: 1024, system, messages: [{ role: 'user' as const, content: `상황: ${situation}` }] };
  if (onChunk) return streamMessage(params, onChunk);
  const response = await client.messages.create(params);
  const block = response.content[0];
  return block.type === 'text' ? block.text : '';
}

// Equipment analysis
export async function analyzeEquipment(gear: string, onChunk?: (text: string) => void): Promise<string> {
  const system = `당신은 부시크래프트 장비 분석 전문가입니다.
보유한 장비 목록을 받으면 그 장비로 야외에서 할 수 있는 것들을 분석합니다.
실용적이고 창의적인 활용법을 알려주세요.

형식:
## 장비 분석

**보유 장비 요약**: [간단히]

**할 수 있는 것들**
- [활동 1]: [설명]
- [활동 2]: [설명]
...

**조합 추천**
[장비 조합으로 가능한 특별한 것들]

**부족한 것 / 추천 추가 장비**
[있으면 더 좋을 것들]`;

  const params = { model: MODEL, max_tokens: 1024, system, messages: [{ role: 'user' as const, content: `보유 장비:\n${gear}` }] };
  if (onChunk) return streamMessage(params, onChunk);
  const response = await client.messages.create(params);
  const block = response.content[0];
  return block.type === 'text' ? block.text : '';
}

// Emergency response
export async function getEmergencyGuide(situation: string, onChunk?: (text: string) => void): Promise<string> {
  const system = `당신은 야외 응급 처치 및 생존 전문가입니다.
긴급 상황을 설명하면 즉각적인 단계별 대처법을 제공합니다.
명확하고 빠르게 읽을 수 있도록 작성하세요.

## ⚠️ 긴급 대처: [상황 요약]

**즉시 해야 할 것** (첫 5분)
1. [1단계]
2. [2단계]

**안정화 단계** (5-30분)
1. [단계]

**구조 요청 / 탈출 방법**
[구체적 방법]

**절대 하지 말 것**
- [위험한 행동]

⚠️ 심각한 부상이나 생명 위협 시 즉시 119에 신고하세요.`;

  const params = { model: MODEL, max_tokens: 1024, system, messages: [{ role: 'user' as const, content: `긴급 상황: ${situation}` }] };
  if (onChunk) return streamMessage(params, onChunk);
  const response = await client.messages.create(params);
  const block = response.content[0];
  return block.type === 'text' ? block.text : '';
}

// Generate skill content for addition
export async function generateSkillContent(
  category: string,
  topic: string,
  onChunk?: (text: string) => void,
): Promise<string> {
  const categoryNames: Record<string, string> = {
    fire: '불피우기',
    knots: '매듭법',
    shelter: '쉘터 만들기',
    water: '식수 확보',
    emergency: '긴급상황 대처',
  };

  const system = `당신은 부시크래프트 전문 교육자입니다.
요청된 주제에 대한 상세한 부시크래프트 기술 가이드를 작성하세요.
한국어로, 실용적이고 따라할 수 있는 내용으로 작성합니다.`;

  const params = {
    model: MODEL,
    max_tokens: 800,
    system,
    messages: [
      {
        role: 'user' as const,
        content: `카테고리: ${categoryNames[category] || category}\n주제: ${topic}\n\n이 주제에 대한 실용적인 부시크래프트 가이드를 300자 내외로 작성해주세요. 단계별로 명확하게.`,
      },
    ],
  };

  // 30-second timeout race
  const timeout = new Promise<never>((_, reject) =>
    setTimeout(() => reject(new Error('AI 응답 시간 초과 (30초)')), 30_000),
  );

  if (onChunk) {
    return Promise.race([streamMessage(params, onChunk), timeout]);
  }

  const result = await Promise.race([
    client.messages.create(params).then((r) => {
      const block = r.content[0];
      return block.type === 'text' ? block.text : '';
    }),
    timeout,
  ]);
  return result;
}

// Field guide — identify plant/animal/fish from photo
export async function identifySpecies(
  imageBase64: string,
  mediaType: 'image/jpeg' | 'image/png' | 'image/webp' | 'image/gif',
  onChunk: (text: string) => void,
): Promise<string> {
  const system = `당신은 야생 동식물 전문가이자 부시크래프터입니다.
사진을 보고 동식물을 식별하고 야외 생존 관점에서 정보를 제공합니다.
반드시 한국어로, 아래 형식으로 답변하세요:

## 🔍 식별 결과
**이름**: [한국어명 / 학명]
**종류**: [식물 / 민물고기 / 바닷물고기 / 곤충 / 포유류 / 조류 / 버섯 / 기타]

## 🍽️ 식용 여부
[✅ 식용 가능 / ⚠️ 조건부 식용 / ❌ 식용 불가 / ⚠️ 불확실]
[식용 여부 상세 설명 — 어떻게 먹는지, 주의할 점]

## ⚠️ 위험 / 독성
[독성 여부, 독성 부위, 유사종 혼동 주의 등]

## 🌿 야외 활용
[생존 상황에서 활용법 — 식용 외 약용, 도구 등]

## 📍 식별 확신도
[높음 / 중간 / 낮음] — [확신도가 낮은 경우 반드시 "전문가 확인 필요" 경고]

⚠️ **중요**: 야생에서 직접 채취/섭취 전 반드시 전문가에게 재확인하세요. AI 식별은 100% 정확하지 않습니다.`;

  return streamMessage(
    {
      model: MODEL,
      max_tokens: 1024,
      system,
      messages: [
        {
          role: 'user',
          content: [
            {
              type: 'image',
              source: { type: 'base64', media_type: mediaType, data: imageBase64 },
            },
            { type: 'text', text: '이 사진의 동식물을 식별하고 야외 생존 관점에서 분석해주세요.' },
          ],
        },
      ],
    },
    onChunk,
  );
}

// Generate checklist
export async function generateChecklist(
  activity: string,
  season: string,
  duration: string,
): Promise<string> {
  const system = `당신은 부시크래프트 장비 전문가입니다.
활동 조건에 맞는 최적의 준비물 체크리스트를 생성합니다.

## [활동명] 준비물 체크리스트

### 필수 장비
- [ ] [아이템]: [이유/사용법]

### 의류 / 개인 장비
- [ ] [아이템]

### 음식 / 물
- [ ] [아이템]

### 비상용품
- [ ] [아이템]

### 선택 장비
- [ ] [아이템]

**총 무게 추정**: [kg]
**특별 주의사항**: [계절/활동 특이사항]`;

  const response = await client.messages.create({
    model: MODEL,
    max_tokens: 1200,
    system,
    messages: [
      {
        role: 'user',
        content: `활동: ${activity}, 계절: ${season}, 기간: ${duration}`,
      },
    ],
  });

  const block = response.content[0];
  return block.type === 'text' ? block.text : '';
}

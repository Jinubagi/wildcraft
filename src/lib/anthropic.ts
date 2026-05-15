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

// Streaming helper — calls onChunk with each text delta, returns full text
export async function streamMessage(
  params: Parameters<typeof client.messages.create>[0],
  onChunk: (delta: string) => void,
): Promise<string> {
  const stream = client.messages.stream({ ...params, stream: true } as Parameters<typeof client.messages.create>[0]);
  let full = '';
  for await (const event of stream as AsyncIterable<{ type: string; delta?: { type: string; text?: string } }>) {
    if (event.type === 'content_block_delta' && event.delta?.type === 'text_delta' && event.delta.text) {
      full += event.delta.text;
      onChunk(full);
    }
  }
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

  const response = await client.messages.create({
    model: MODEL,
    max_tokens: 800,
    system,
    messages: [
      {
        role: 'user',
        content: `카테고리: ${categoryNames[category] || category}\n주제: ${topic}\n\n이 주제에 대한 실용적인 부시크래프트 가이드를 300자 내외로 작성해주세요. 단계별로 명확하게.`,
      },
    ],
  });

  const block = response.content[0];
  return block.type === 'text' ? block.text : '';
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

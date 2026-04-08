import { NextRequest, NextResponse } from 'next/server';
import { LLMClient, Config, HeaderUtils } from 'coze-coding-dev-sdk';
import { Scenario, Gender, Option } from '@/types/game';
import { GAME_CONFIG } from '@/constants/game';

interface GenerateRequest {
  scenario: Scenario;
  gender: Gender;
  history: Array<{
    role: 'partner' | 'user';
    content: string;
  }>;
  currentScore: number;
  currentRound: number;
  isFirstRound?: boolean;
}

// 构建系统提示词
function buildSystemPrompt(gender: Gender, scenario: Scenario, currentScore: number): string {
  const partnerTitle = gender === 'girlfriend' ? '女朋友' : '男朋友';
  const userTitle = gender === 'girlfriend' ? '男朋友' : '女朋友';
  
  // 根据好感度确定情绪
  let emotionGuide = '';
  if (currentScore < 0) {
    emotionGuide = '你现在非常生气，可能会冷暴力或激烈质问对方。';
  } else if (currentScore < 30) {
    emotionGuide = '你还在生气，但愿意听听对方说什么。';
  } else if (currentScore < 60) {
    emotionGuide = '你开始有点软化，嘴上还生气但语气缓和了一些。';
  } else if (currentScore < 80) {
    emotionGuide = '你快被哄好了，可能会撒娇或小声说"哼"。';
  } else {
    emotionGuide = '你已经原谅对方了，但还是要让对方保证不再犯。';
  }
  
  return `你是一个哄人模拟器游戏中的角色扮演AI。

## 角色分工（非常重要！）
- **你扮演**：生气的${partnerTitle}，是场景中的受害者，正在因为对方的错误而生气
- **对方（用户）**：你的${userTitle}，是犯错的人，需要选择合适的话来哄你

## 当前场景
场景：${scenario.title}
具体情况：${scenario.description.replace(/你/g, '对方')}

你是被对方伤害的人。上面提到的错误是**对方犯的**，不是你犯的！你现在是受害者，你很生气！

## 当前情绪状态
好感度：${currentScore}/100
${emotionGuide}

## 你的任务
1. 说出生气的话（质问对方为什么犯错、表达你的不满和委屈）
2. 生成6个选项供对方选择（这些是对方可以说来哄你的话）

## 回复格式（必须严格遵循）
直接输出JSON，不要有任何其他文字：
{"partnerMessage":"你生气的质问或抱怨","options":[{"id":"1","text":"对方哄你的话","scoreChange":10}]}

## 选项规则（这些是对方哄你说的话）
生成6个选项供对方选择：
- 2个加分选项（+5到+20）：真诚道歉、具体弥补方案、提起美好回忆、承诺改正
- 4个减分选项（-5到-30）：敷衍、找借口、搞笑离谱的话

## 重要提醒
1. 你说的话必须是生气的、质问的、抱怨的，因为你是受害者！
2. 选项是对方（犯错者）哄你说的话，不是你说的话！
3. 只输出JSON，不要有markdown代码块标记`;
}

// 构建用户消息
function buildUserMessage(history: Array<{ role: string; content: string }>, isFirstRound: boolean): string {
  if (isFirstRound) {
    return '游戏开始。你是受害者，现在很生气。说出生气的第一句话，并生成6个让对方哄你的选项。直接输出JSON。';
  }
  
  const lastUserChoice = history.filter(h => h.role === 'user').pop();
  if (lastUserChoice) {
    return `对方想哄你，说："${lastUserChoice.content}"\n\n根据对方的话，你的情绪有什么变化？说出生气的回复，并生成下一轮6个让对方哄你的选项。直接输出JSON。`;
  }
  
  return '生成你的回复和6个选项。直接输出JSON。';
}

// 解析 LLM 响应
function parseLLMResponse(content: string): { partnerMessage: string; options: Option[] } | null {
  try {
    // 清理内容
    let cleanContent = content.trim();
    
    // 移除可能的 markdown 代码块标记
    cleanContent = cleanContent.replace(/^```json\s*/i, '').replace(/\s*```$/i, '');
    cleanContent = cleanContent.replace(/^```\s*/i, '').replace(/\s*```$/i, '');
    
    // 尝试找到 JSON 对象
    const jsonMatch = cleanContent.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      console.error('No JSON object found in response:', cleanContent.substring(0, 200));
      return null;
    }
    
    const parsed = JSON.parse(jsonMatch[0]);
    
    // 验证必要字段
    if (!parsed.partnerMessage || !Array.isArray(parsed.options) || parsed.options.length < 6) {
      console.error('Invalid response structure:', parsed);
      return null;
    }
    
    // 处理选项
    const options: Option[] = parsed.options.slice(0, 6).map((opt: any, index: number) => ({
      id: String(index + 1),
      text: String(opt.text || '').trim(),
      scoreChange: Math.max(-30, Math.min(20, Number(opt.scoreChange) || 0)),
    }));
    
    return {
      partnerMessage: String(parsed.partnerMessage).trim(),
      options,
    };
  } catch (error) {
    console.error('Parse error:', error);
    return null;
  }
}

// 生成场景相关的 fallback 回复
function generateFallbackMessage(scenario: Scenario, isFirstRound: boolean, currentScore: number): string {
  // 根据场景生成生气的开场白
  const scenarioMessages: Record<string, string[]> = {
    anniversary: [
      '你知道今天是什么日子吗？我们在一起三周年了！你居然忘了？！',
      '我等了一整天你的祝福，结果你连一句都没说...你是不是根本不在乎我？',
    ],
    no_reply: [
      '你昨晚打游戏到凌晨三点？我发了十几条消息你一条都没回！你知道我多担心吗？！',
      '我打了你那么多电话你都不接，我还以为你出事了！结果你在打游戏？！',
    ],
    flirt_chat: [
      '这是谁？为什么你们聊到凌晨三点？她还叫你亲爱的？！',
      '我看到你们的聊天记录了，你们到底什么关系？！',
    ],
    lost_cat: [
      '你把我的猫弄丢了？！它是我养了三年的宝贝啊！你怎么能这么不小心！',
      '我的猫呢？你说它跑丢了是什么意思？你怎么能把它弄丢！',
    ],
    public_embarrassment: [
      '你在朋友面前那样说我，你知道我多丢脸吗？！',
      '你开的那个玩笑一点都不好笑，你有没有想过我的感受？！',
    ],
  };
  
  const messages = scenarioMessages[scenario.id] || ['你太过分了！你怎么能这样对我！'];
  
  if (isFirstRound) {
    return messages[0];
  }
  
  if (currentScore > 50) {
    return '哼...看在你这么诚恳的份上，我再想想...';
  } else if (currentScore > 20) {
    return '你说的这些...但我还是很生气...';
  } else {
    return messages[Math.floor(Math.random() * messages.length)];
  }
}

// 生成多样化选项
function generateDiverseOptions(scenario: Scenario, round: number): Option[] {
  // 根据场景生成相关的选项
  const scenarioGoodOptions: Record<string, Array<{ text: string; scoreChange: number }>> = {
    anniversary: [
      { text: '对不起！我订了那家你喜欢的餐厅，我们今晚补过纪念日好不好？', scoreChange: 18 },
      { text: '我错了...这是我给你准备的礼物，本来想给你惊喜的', scoreChange: 15 },
      { text: '我真的太粗心了，我保证以后每个纪念日都记住！', scoreChange: 12 },
    ],
    no_reply: [
      { text: '对不起，我不该玩游戏不理你。以后晚上我一定第一时间回你消息！', scoreChange: 16 },
      { text: '我知道错了，我以后再也不会让你担心了！', scoreChange: 14 },
      { text: '我保证以后打游戏前先告诉你，不让你找不到我！', scoreChange: 12 },
    ],
    flirt_chat: [
      { text: '对不起，我和她真的没什么。我现在就删了她，以后只和你聊天！', scoreChange: 15 },
      { text: '是我没注意分寸，我保证以后不会再这样了，你相信我！', scoreChange: 12 },
      { text: '我知道让你难过了，我以后会注意和异性保持距离的！', scoreChange: 10 },
    ],
    lost_cat: [
      { text: '对不起！我已经打印了寻猫启事，我们一起去找好不好？', scoreChange: 18 },
      { text: '我错了...我一定会找到它的，我发誓！', scoreChange: 15 },
      { text: '我联系了宠物救助站，我们一定能找到它的！', scoreChange: 12 },
    ],
    public_embarrassment: [
      { text: '对不起，我不该开那种玩笑。我以后在朋友面前一定维护你！', scoreChange: 15 },
      { text: '我知道错了，下次聚会我当着大家的面给你道歉！', scoreChange: 12 },
      { text: '我真的不是故意的，以后我说话一定过脑子！', scoreChange: 10 },
    ],
  };
  
  const goodOptions = scenarioGoodOptions[scenario.id] || [
    { text: '对不起，我真的知道错了！', scoreChange: 15 },
    { text: '我保证以后再也不这样了！', scoreChange: 12 },
  ];
  
  const badOptions = [
    { text: '好了好了，别生气了行不行？', scoreChange: -8 },
    { text: '我觉得你有点小题大做了...', scoreChange: -20 },
    { text: '要不我给你跳个舞？💃', scoreChange: -18 },
    { text: '我请你吃肯德基疯狂星期四行不行？', scoreChange: -22 },
    { text: '要不咱们石头剪刀布，你赢了我道歉？', scoreChange: -16 },
    { text: '我给你表演一个胸口碎大石？', scoreChange: -25 },
  ];
  
  // 根据轮次选择不同的选项
  const startIndex = (round - 1) % goodOptions.length;
  const selected: Option[] = [
    { id: '1', text: goodOptions[startIndex].text, scoreChange: goodOptions[startIndex].scoreChange },
    { id: '2', text: goodOptions[(startIndex + 1) % goodOptions.length].text, scoreChange: goodOptions[(startIndex + 1) % goodOptions.length].scoreChange },
    { id: '3', text: badOptions[startIndex % badOptions.length].text, scoreChange: badOptions[startIndex % badOptions.length].scoreChange },
    { id: '4', text: badOptions[(startIndex + 2) % badOptions.length].text, scoreChange: badOptions[(startIndex + 2) % badOptions.length].scoreChange },
    { id: '5', text: badOptions[(startIndex + 4) % badOptions.length].text, scoreChange: badOptions[(startIndex + 4) % badOptions.length].scoreChange },
    { id: '6', text: badOptions[(startIndex + 6) % badOptions.length].text, scoreChange: badOptions[(startIndex + 6) % badOptions.length].scoreChange },
  ];
  
  // 打乱顺序
  return selected.sort(() => Math.random() - 0.5);
}

export async function POST(request: NextRequest) {
  try {
    const body: GenerateRequest = await request.json();
    const { scenario, gender, history, currentScore, currentRound, isFirstRound = false } = body;

    console.log('[Generate API] Request:', { scenario: scenario.id, currentRound, currentScore, isFirstRound });

    // 初始化 LLM 客户端
    const config = new Config();
    const customHeaders = HeaderUtils.extractForwardHeaders(request.headers);
    const client = new LLMClient(config, customHeaders);

    // 构建消息
    const systemPrompt = buildSystemPrompt(gender, scenario, currentScore);
    const userMessage = buildUserMessage(history, isFirstRound);

    const messages = [
      { role: 'system' as const, content: systemPrompt },
      ...history.map(h => ({
        role: (h.role === 'partner' ? 'assistant' : 'user') as 'assistant' | 'user',
        content: h.content,
      })),
      { role: 'user' as const, content: userMessage },
    ];

    // 调用 LLM
    const response = await client.invoke(messages, {
      temperature: 0.85,
      model: 'doubao-seed-1-6-251015',
    });

    console.log('[Generate API] LLM Response length:', response.content.length);

    // 解析响应
    const parsed = parseLLMResponse(response.content);
    
    if (parsed) {
      // 打乱选项顺序
      const shuffledOptions = parsed.options.sort(() => Math.random() - 0.5);
      
      console.log('[Generate API] Successfully parsed');
      console.log('[Generate API] Partner message:', parsed.partnerMessage.substring(0, 50));
      console.log('[Generate API] Options:', shuffledOptions.map(o => o.text.substring(0, 20)));
      
      return NextResponse.json({
        partnerMessage: parsed.partnerMessage,
        options: shuffledOptions,
      });
    }

    // 如果解析失败，生成场景相关的 fallback
    console.log('[Generate API] Parse failed, using scenario-specific fallback');

    return NextResponse.json({
      partnerMessage: generateFallbackMessage(scenario, isFirstRound, currentScore),
      options: generateDiverseOptions(scenario, currentRound),
    });

  } catch (error) {
    console.error('[Generate API] Error:', error);
    
    return NextResponse.json({
      partnerMessage: '...（对方沉默了一会儿）',
      options: generateDiverseOptions({ id: 'anniversary', title: '忘记纪念日', description: '', icon: '💔' } as Scenario, 1),
    });
  }
}

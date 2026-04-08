// 游戏类型定义

// 性别选择
export type Gender = 'girlfriend' | 'boyfriend';

// 声音类型
export type VoiceType = 
  | 'gentle_female'    // 温柔女声
  | 'domineering'      // 霸道御姐
  | 'cute'             // 可爱软妹
  | 'deep_male'        // 低沉男声
  | 'gentle_male';     // 温柔男声

// 预设场景
export interface Scenario {
  id: string;
  title: string;
  description: string;
  icon: string;
}

// 选项
export interface Option {
  id: string;
  text: string;
  scoreChange: number; // 分数变化（对用户隐藏）
}

// 对话消息
export interface Message {
  id: string;
  role: 'partner' | 'user';
  content: string;
  audioUrl?: string;
  isPlaying?: boolean;
}

// 游戏状态
export interface GameState {
  gender: Gender;
  voiceType: VoiceType;
  scenario: Scenario | null;
  messages: Message[];
  currentOptions: Option[];
  affectionScore: number; // 好感度
  currentRound: number;
  maxRounds: number;
  gameStatus: 'idle' | 'playing' | 'loading' | 'success' | 'failed';
  lastScoreChange: number; // 上次分数变化（用于动画）
}

// API 请求类型
export interface GenerateRequest {
  scenario: Scenario;
  gender: Gender;
  history: Array<{
    role: 'partner' | 'user';
    content: string;
  }>;
  currentScore: number;
  currentRound: number;
}

export interface GenerateResponse {
  partnerMessage: string;
  options: Option[];
  scoreChange?: number; // 如果用户刚选择了选项，返回分数变化
}

export interface TTSRequest {
  text: string;
  voiceType: VoiceType;
  gender: Gender;
}

export interface TTSResponse {
  audioUrl: string;
}

import { Scenario, VoiceType } from '@/types/game';

// 预设场景
export const SCENARIOS: Scenario[] = [
  {
    id: 'anniversary',
    title: '忘记纪念日',
    description: '今天是你们在一起三周年，你完全忘了...',
    icon: '💔',
  },
  {
    id: 'no_reply',
    title: '深夜不回消息',
    description: '你昨晚打游戏到凌晨三点，对方发了十几条消息你都没回',
    icon: '📱',
  },
  {
    id: 'flirt_chat',
    title: '被发现和异性聊天',
    description: '对方看到你和异性朋友的暧昧聊天记录',
    icon: '😱',
  },
  {
    id: 'lost_cat',
    title: '把对方的猫弄丢了',
    description: '你帮对方照顾猫的时候，猫跑丢了',
    icon: '🐱',
  },
  {
    id: 'public_embarrassment',
    title: '当众让对方没面子',
    description: '你在朋友聚会上开了一个过分的玩笑',
    icon: '😳',
  },
];

// 声音类型配置
export const VOICE_CONFIG: Record<VoiceType, { name: string; speakerId: string }> = {
  gentle_female: {
    name: '温柔女声',
    speakerId: 'zh_female_meilinvyou_saturn_bigtts', // 迷人女友
  },
  domineering: {
    name: '霸道御姐',
    speakerId: 'zh_female_jitangnv_saturn_bigtts', // 鸡汤女（有点霸气的）
  },
  cute: {
    name: '可爱软妹',
    speakerId: 'saturn_zh_female_keainvsheng_tob', // 可爱女生
  },
  deep_male: {
    name: '低沉男声',
    speakerId: 'zh_male_m191_uranus_bigtts', // 男声
  },
  gentle_male: {
    name: '温柔男声',
    speakerId: 'zh_male_ruyayichen_saturn_bigtts', // 儒雅男声
  },
};

// 游戏配置
export const GAME_CONFIG = {
  INITIAL_SCORE: 20, // 初始好感度
  MAX_SCORE: 100, // 最高好感度
  MIN_SCORE: -50, // 最低好感度（失败线）
  SUCCESS_SCORE: 80, // 成功线
  MAX_ROUNDS: 10, // 最大轮数
  OPTIONS_COUNT: 6, // 每轮选项数
};

// 好感度对应的情绪状态
export const EMOTION_LEVELS = {
  VERY_ANGRY: { min: -50, max: 0, label: '非常生气' },
  ANGRY: { min: 0, max: 30, label: '还在生气' },
  SOFTENING: { min: 30, max: 60, label: '开始软化' },
  ALMOST_THERE: { min: 60, max: 80, label: '快哄好了' },
  FORGIVEN: { min: 80, max: 100, label: '原谅你了' },
};

// 获取当前情绪
export function getEmotionLevel(score: number): string {
  if (score < 0) return EMOTION_LEVELS.VERY_ANGRY.label;
  if (score < 30) return EMOTION_LEVELS.ANGRY.label;
  if (score < 60) return EMOTION_LEVELS.SOFTENING.label;
  if (score < 80) return EMOTION_LEVELS.ALMOST_THERE.label;
  return EMOTION_LEVELS.FORGIVEN.label;
}

'use client';

import { Gender, VoiceType } from '@/types/game';
import { VOICE_CONFIG } from '@/constants/game';

interface SetupScreenProps {
  onStartGame: (gender: Gender, voiceType: VoiceType, scenarioId: string) => void;
}

const SCENARIOS = [
  { id: 'anniversary', title: '忘记纪念日', description: '今天是你们在一起三周年，你完全忘了...', icon: '💔' },
  { id: 'no_reply', title: '深夜不回消息', description: '你昨晚打游戏到凌晨三点，对方发了十几条消息你都没回', icon: '📱' },
  { id: 'flirt_chat', title: '被发现和异性聊天', description: '对方看到你和异性朋友的暧昧聊天记录', icon: '😱' },
  { id: 'lost_cat', title: '把对方的猫弄丢了', description: '你帮对方照顾猫的时候，猫跑丢了', icon: '🐱' },
  { id: 'public_embarrassment', title: '当众让对方没面子', description: '你在朋友聚会上开了一个过分的玩笑', icon: '😳' },
];

export function SetupScreen({ onStartGame }: SetupScreenProps) {
  const handleStart = () => {
    const genderSelect = document.getElementById('gender') as HTMLSelectElement;
    const voiceSelect = document.getElementById('voice') as HTMLSelectElement;
    const scenarioRadio = document.querySelector('input[name="scenario"]:checked') as HTMLInputElement;

    if (!scenarioRadio) {
      alert('请选择一个场景');
      return;
    }

    onStartGame(
      genderSelect.value as Gender,
      voiceSelect.value as VoiceType,
      scenarioRadio.value
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-pink-50 to-purple-50 py-8 px-4">
      <div className="max-w-2xl mx-auto">
        {/* 标题 */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-blue-600 mb-2">
            哄哄模拟器
          </h1>
          <p className="text-gray-600">
            AI扮演生气的对象，你能在10轮内把TA哄好吗？
          </p>
        </div>

        {/* 选择卡片 */}
        <div className="bg-white rounded-2xl shadow-xl p-6 mb-6">
          {/* 性别选择 */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              选择对方身份
            </label>
            <select
              id="gender"
              className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-pink-500 focus:border-transparent transition-all"
            >
              <option value="girlfriend">女朋友</option>
              <option value="boyfriend">男朋友</option>
            </select>
          </div>

          {/* 声音选择 */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              选择TA的声音
            </label>
            <select
              id="voice"
              className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-pink-500 focus:border-transparent transition-all"
            >
              {Object.entries(VOICE_CONFIG).map(([key, config]) => (
                <option key={key} value={key}>
                  {config.name}
                </option>
              ))}
            </select>
          </div>

          {/* 场景选择 */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-3">
              选择吵架场景
            </label>
            <div className="space-y-3">
              {SCENARIOS.map((scenario) => (
                <label
                  key={scenario.id}
                  className="flex items-start gap-3 p-4 border border-gray-200 rounded-xl cursor-pointer hover:border-pink-300 hover:bg-pink-50 transition-all group"
                >
                  <input
                    type="radio"
                    name="scenario"
                    value={scenario.id}
                    className="mt-1 w-4 h-4 text-pink-500 focus:ring-pink-500"
                  />
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-xl">{scenario.icon}</span>
                      <span className="font-medium text-gray-800 group-hover:text-pink-600">
                        {scenario.title}
                      </span>
                    </div>
                    <p className="text-sm text-gray-500 mt-1">{scenario.description}</p>
                  </div>
                </label>
              ))}
            </div>
          </div>

          {/* 开始按钮 */}
          <button
            onClick={handleStart}
            className="w-full py-4 bg-gradient-to-r from-pink-500 to-purple-500 text-white font-bold rounded-xl hover:from-pink-600 hover:to-purple-600 transform hover:scale-[1.02] transition-all shadow-lg"
          >
            开始哄人 💕
          </button>
        </div>

        {/* 提示 */}
        <div className="text-center text-sm text-gray-500">
          <p>💡 提示：选择合适的回复可以增加好感度，选错会扣分哦</p>
        </div>
      </div>
    </div>
  );
}

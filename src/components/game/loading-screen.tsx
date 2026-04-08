'use client';

import { SCENARIOS } from '@/constants/game';
import { Scenario } from '@/types/game';

interface LoadingScreenProps {
  scenarioId: string;
}

export function LoadingScreen({ scenarioId }: LoadingScreenProps) {
  const scenario = SCENARIOS.find(s => s.id === scenarioId) as Scenario;

  return (
    <div className="min-h-screen bg-gradient-to-b from-pink-50 to-purple-50 flex items-center justify-center p-4">
      <div className="text-center">
        {/* 场景图标 */}
        <div className="text-6xl mb-4 animate-bounce">
          {scenario?.icon || '💬'}
        </div>

        {/* 场景标题 */}
        <h2 className="text-xl font-bold text-gray-800 mb-2">
          {scenario?.title || '加载中...'}
        </h2>

        {/* 场景描述 */}
        <p className="text-gray-500 mb-6 max-w-md">
          {scenario?.description}
        </p>

        {/* 加载动画 */}
        <div className="flex items-center justify-center gap-2">
          <div className="flex gap-1">
            <span className="w-2 h-2 bg-pink-500 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
            <span className="w-2 h-2 bg-pink-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
            <span className="w-2 h-2 bg-pink-300 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
          </div>
          <span className="text-gray-500 text-sm ml-2">对方正在输入...</span>
        </div>
      </div>
    </div>
  );
}

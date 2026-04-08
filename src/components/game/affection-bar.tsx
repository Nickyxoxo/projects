'use client';

import { useEffect, useState } from 'react';

interface AffectionBarProps {
  score: number;
  maxScore: number;
  minScore: number;
  successScore: number;
  lastChange: number;
}

export function AffectionBar({ score, maxScore, minScore, successScore, lastChange }: AffectionBarProps) {
  const [displayScore, setDisplayScore] = useState(score);
  const [showChange, setShowChange] = useState(false);

  useEffect(() => {
    if (lastChange !== 0) {
      setShowChange(true);
      const timer = setTimeout(() => setShowChange(false), 1500);
      return () => clearTimeout(timer);
    }
  }, [lastChange]);

  useEffect(() => {
    const timer = setTimeout(() => setDisplayScore(score), 100);
    return () => clearTimeout(timer);
  }, [score]);

  // 计算进度条百分比（从 minScore 到 maxScore 的范围）
  // minScore = -50, maxScore = 100, 范围是 150
  // score = 20 时，(20 - (-50)) / (100 - (-50)) = 70 / 150 = 46.67%
  const percentage = Math.max(
    0,
    Math.min(100, ((displayScore - minScore) / (maxScore - minScore)) * 100)
  );

  // 计算失败区域百分比（-50 到 0 的范围）
  const failZonePercentage = ((0 - minScore) / (maxScore - minScore)) * 100; // 33.33%

  // 计算成功线位置
  const successLinePercentage = ((successScore - minScore) / (maxScore - minScore)) * 100; // 86.67%

  // 根据分数决定颜色
  const getBarColor = () => {
    if (score >= successScore) return 'from-green-400 to-green-500';
    if (score >= 60) return 'from-pink-400 to-pink-500';
    if (score >= 30) return 'from-yellow-400 to-yellow-500';
    if (score >= 0) return 'from-orange-400 to-orange-500';
    return 'from-red-400 to-red-500';
  };

  // 获取情绪标签
  const getEmotionLabel = () => {
    if (score >= 80) return '🥰 原谅你了';
    if (score >= 60) return '😊 快哄好了';
    if (score >= 30) return '😐 开始软化';
    if (score >= 0) return '😠 还在生气';
    return '🤬 非常生气';
  };

  return (
    <div className="relative w-full">
      {/* 标题行 */}
      <div className="flex justify-between items-center mb-2">
        <span className="text-sm font-medium text-gray-600">好感度</span>
        <span className="text-sm font-medium text-gray-800">
          {displayScore} / {maxScore}
        </span>
      </div>

      {/* 进度条容器 */}
      <div className="relative">
        {/* 背景条 */}
        <div className="h-5 bg-gray-200 rounded-full overflow-hidden relative">
          {/* 失败区域背景（红色） */}
          <div 
            className="absolute top-0 left-0 h-full bg-red-100"
            style={{ width: `${failZonePercentage}%` }}
          />
          
          {/* 成功线标记 */}
          <div 
            className="absolute top-0 bottom-0 w-0.5 bg-green-500 z-10"
            style={{ left: `${successLinePercentage}%` }}
          />
        </div>

        {/* 进度填充条（覆盖在背景上） */}
        <div 
          className="absolute top-0 left-0 h-5 rounded-full overflow-hidden transition-all duration-500 ease-out"
          style={{ width: `${percentage}%` }}
        >
          <div className={`h-full w-full bg-gradient-to-r ${getBarColor()}`}>
            {/* 光效动画 */}
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent" />
          </div>
        </div>

        {/* 胜利线标签 */}
        <div 
          className="absolute -top-6 text-xs text-green-600 font-medium transform -translate-x-1/2"
          style={{ left: `${successLinePercentage}%` }}
        >
          胜利线
        </div>
      </div>

      {/* 情绪标签 */}
      <div className="mt-3 text-center">
        <span className="text-sm font-medium text-gray-700">{getEmotionLabel()}</span>
      </div>

      {/* 分数变化动画 */}
      {showChange && lastChange !== 0 && (
        <div
          className={`absolute top-8 left-1/2 transform -translate-x-1/2 text-xl font-bold animate-bounce ${
            lastChange > 0 ? 'text-green-500' : 'text-red-500'
          }`}
        >
          {lastChange > 0 ? `+${lastChange}` : lastChange}
        </div>
      )}
    </div>
  );
}

'use client';

import { useEffect, useState, useRef } from 'react';
import { useAuth } from '@/contexts/AuthContext';

interface GameOverModalProps {
  isSuccess: boolean;
  rounds: number;
  score: number;
  scenario: string;
  onPlayAgain: () => void;
}

export function GameOverModal({ isSuccess, rounds, score, scenario, onPlayAgain }: GameOverModalProps) {
  const { user } = useAuth();
  const [showConfetti, setShowConfetti] = useState(false);
  const [showHeartbreak, setShowHeartbreak] = useState(false);
  const [saveStatus, setSaveStatus] = useState<'saving' | 'saved' | 'error' | 'needLogin' | null>(null);
  
  // 使用 ref 防止重复保存（React StrictMode 会导致 useEffect 执行两次）
  const hasSaved = useRef(false);

  // 保存游戏记录
  useEffect(() => {
    // 防止重复保存
    if (hasSaved.current) return;
    
    const saveRecord = async () => {
      if (!user) {
        setSaveStatus('needLogin');
        return;
      }

      hasSaved.current = true;
      setSaveStatus('saving');

      try {
        const response = await fetch('/api/game/save', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            scenario,
            finalScore: score,
            result: isSuccess ? 'success' : 'failed',
          }),
        });

        const data = await response.json();

        if (response.ok && data.success) {
          setSaveStatus('saved');
        } else if (data.needLogin) {
          setSaveStatus('needLogin');
        } else {
          setSaveStatus('error');
        }
      } catch {
        setSaveStatus('error');
      }
    };

    saveRecord();
  }, [user, scenario, score, isSuccess]);

  useEffect(() => {
    if (isSuccess) {
      setShowConfetti(true);
      const timer = setTimeout(() => setShowConfetti(false), 3000);
      return () => clearTimeout(timer);
    } else {
      setShowHeartbreak(true);
      const timer = setTimeout(() => setShowHeartbreak(false), 2000);
      return () => clearTimeout(timer);
    }
  }, [isSuccess]);

  // 生成撒花效果
  const confettiPieces = Array.from({ length: 50 }, (_, i) => ({
    id: i,
    left: `${Math.random() * 100}%`,
    delay: `${Math.random() * 0.5}s`,
    duration: `${1 + Math.random() * 2}s`,
    color: ['#ff69b4', '#ff1493', '#da70d6', '#ff6b6b', '#ffd700'][Math.floor(Math.random() * 5)],
  }));

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      {/* 撒花/心碎动画 */}
      {showConfetti && (
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          {confettiPieces.map((piece) => (
            <div
              key={piece.id}
              className="absolute w-3 h-3 animate-confetti"
              style={{
                left: piece.left,
                top: '-10px',
                backgroundColor: piece.color,
                animationDelay: piece.delay,
                animationDuration: piece.duration,
              }}
            />
          ))}
        </div>
      )}

      {showHeartbreak && (
        <div className="absolute inset-0 pointer-events-none flex items-center justify-center">
          <div className="text-8xl animate-bounce text-red-500">💔</div>
        </div>
      )}

      {/* 结果卡片 */}
      <div className="bg-white rounded-2xl p-8 max-w-md w-full text-center shadow-2xl transform animate-scale-in">
        {/* 图标 */}
        <div className="text-6xl mb-4">
          {isSuccess ? '🎉' : '😢'}
        </div>

        {/* 标题 */}
        <h2 className={`text-2xl font-bold mb-2 ${isSuccess ? 'text-green-500' : 'text-red-500'}`}>
          {isSuccess ? '恭喜通关！' : '哄人失败...'}
        </h2>

        {/* 游戏记录保存状态提示 */}
        {saveStatus === 'saving' && (
          <div className="bg-blue-50 text-blue-600 px-4 py-2 rounded-lg mb-4 text-sm">
            正在保存游戏记录...
          </div>
        )}
        {saveStatus === 'saved' && (
          <div className="bg-green-50 text-green-600 px-4 py-2 rounded-lg mb-4 text-sm">
            ✅ 您的游戏记录已保存
          </div>
        )}
        {saveStatus === 'needLogin' && (
          <div className="bg-yellow-50 text-yellow-700 px-4 py-2 rounded-lg mb-4 text-sm">
            💡 登录后可保存您的游戏记录
          </div>
        )}
        {saveStatus === 'error' && (
          <div className="bg-red-50 text-red-600 px-4 py-2 rounded-lg mb-4 text-sm">
            保存失败，请稍后重试
          </div>
        )}

        {/* 统计 */}
        <div className="bg-gray-50 rounded-xl p-4 mb-6">
          <div className="flex justify-around">
            <div>
              <div className="text-2xl font-bold text-gray-800">{rounds}</div>
              <div className="text-xs text-gray-500">回合数</div>
            </div>
            <div className="w-px bg-gray-200" />
            <div>
              <div className="text-2xl font-bold text-gray-800">{score}</div>
              <div className="text-xs text-gray-500">最终好感度</div>
            </div>
          </div>
        </div>

        {/* 结果描述 */}
        <p className="text-gray-600 mb-6">
          {isSuccess
            ? 'TA已经原谅你了！快去实践你学到的哄人技巧吧~'
            : '没关系，哄人是一门艺术，再试试看？'}
        </p>

        {/* 按钮组 */}
        <div className="space-y-3">
          <button
            onClick={onPlayAgain}
            className="w-full py-3 bg-gradient-to-r from-pink-500 to-purple-500 text-white font-bold rounded-xl hover:from-pink-600 hover:to-purple-600 transition-all shadow-lg"
          >
            {isSuccess ? '换个场景再玩' : '再试一次'}
          </button>
          
          {/* 分享按钮 */}
          <button
            onClick={() => {
              const text = isSuccess
                ? `我在「哄哄模拟器」里成功把TA哄好了！用了${rounds}轮，你也来试试？`
                : `我在「哄哄模拟器」里坚持了${rounds}轮...你也来试试能不能做到更好？`;
              const url = window.location.href;
              if (navigator.share) {
                navigator.share({ text, url }).catch(() => {});
              } else {
                navigator.clipboard.writeText(`${text}\n${url}`);
                alert('链接已复制到剪贴板！');
              }
            }}
            className="w-full py-3 border-2 border-pink-200 text-pink-500 font-bold rounded-xl hover:bg-pink-50 transition-all"
          >
            分享给朋友
          </button>
        </div>
      </div>

      <style jsx>{`
        @keyframes confetti {
          0% {
            transform: translateY(0) rotate(0deg);
            opacity: 1;
          }
          100% {
            transform: translateY(100vh) rotate(720deg);
            opacity: 0;
          }
        }
        .animate-confetti {
          animation: confetti 3s ease-in-out forwards;
        }
        @keyframes scale-in {
          0% {
            transform: scale(0.8);
            opacity: 0;
          }
          100% {
            transform: scale(1);
            opacity: 1;
          }
        }
        .animate-scale-in {
          animation: scale-in 0.3s ease-out forwards;
        }
      `}</style>
    </div>
  );
}

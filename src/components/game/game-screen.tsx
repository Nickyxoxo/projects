'use client';

import { GameState, Option } from '@/types/game';
import { AffectionBar } from './affection-bar';
import { ChatBubble } from './chat-bubble';
import { OptionsList } from './options-list';
import { GAME_CONFIG } from '@/constants/game';
import { ChevronLeft } from 'lucide-react';

interface GameScreenProps {
  gameState: GameState;
  onSelectOption: (option: Option) => void;
  onPlayAudio: (messageId: string) => void;
  onQuit: () => void;
}

export function GameScreen({ gameState, onSelectOption, onPlayAudio, onQuit }: GameScreenProps) {
  const { scenario, messages, currentOptions, affectionScore, currentRound, gameStatus } = gameState;

  return (
    <div className="h-screen bg-gradient-to-b from-pink-50 to-purple-50 flex flex-col overflow-hidden">
      {/* 顶部栏 */}
      <div className="bg-white/80 backdrop-blur-sm border-b border-gray-100 px-4 py-3 flex-shrink-0">
        <div className="max-w-6xl mx-auto">
          {/* 导航栏 */}
          <div className="flex items-center justify-between mb-3">
            <button
              onClick={onQuit}
              className="flex items-center gap-1 text-gray-500 hover:text-gray-700 transition-colors"
            >
              <ChevronLeft className="w-5 h-5" />
              <span className="text-sm">退出</span>
            </button>
            
            <div className="flex items-center gap-2">
              <span className="text-sm text-gray-500">
                第 {currentRound} / {GAME_CONFIG.MAX_ROUNDS} 轮
              </span>
            </div>
            
            <div className="w-16" /> {/* 占位 */}
          </div>

          {/* 好感度进度条 */}
          <AffectionBar
            score={affectionScore}
            maxScore={GAME_CONFIG.MAX_SCORE}
            minScore={GAME_CONFIG.MIN_SCORE}
            successScore={GAME_CONFIG.SUCCESS_SCORE}
            lastChange={gameState.lastScoreChange}
          />
        </div>
      </div>

      {/* 主内容区域 - 分屏布局 */}
      <div className="flex-1 flex min-h-0 overflow-hidden">
        {/* 左侧 - 聊天窗口 */}
        <div className="flex-1 flex flex-col min-w-0 min-h-0 overflow-hidden">
          {/* 聊天区域 - 独立滚动 */}
          <div className="flex-1 overflow-y-auto px-4 py-6 min-h-0 scrollbar-pink">
            <div className="max-w-2xl mx-auto">
              {/* 场景提示 */}
              {scenario && (
                <div className="text-center mb-6">
                  <span className="inline-block bg-white/50 px-4 py-2 rounded-full text-sm text-gray-500">
                    {scenario.icon} {scenario.title}
                  </span>
                </div>
              )}

              {/* 消息列表 */}
              {messages.map((message) => (
                <ChatBubble
                  key={message.id}
                  message={message}
                  onPlayAudio={onPlayAudio}
                />
              ))}

              {/* Loading 状态 */}
              {gameStatus === 'loading' && (
                <div className="flex gap-2 justify-start mb-4">
                  <div className="w-10 h-10 rounded-full bg-pink-100 flex items-center justify-center flex-shrink-0">
                    <svg width="24" height="24" viewBox="0 0 40 40" className="rounded-full">
                      <circle cx="20" cy="20" r="20" fill="#fce7f3" />
                      <circle cx="14" cy="16" r="3" fill="#ec4899" />
                      <circle cx="26" cy="16" r="3" fill="#ec4899" />
                      <path d="M 12 26 Q 20 32 28 26" stroke="#ec4899" strokeWidth="2" fill="none" strokeLinecap="round" />
                    </svg>
                  </div>
                  <div className="bg-white border border-gray-200 px-4 py-3 rounded-2xl rounded-tl-none">
                    <div className="flex gap-1 items-center">
                      <span className="w-2 h-2 bg-gray-300 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                      <span className="w-2 h-2 bg-gray-300 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                      <span className="w-2 h-2 bg-gray-300 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                      <span className="text-xs text-gray-400 ml-2">对方正在输入...</span>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* 右侧 - 选项面板（桌面端显示）- 独立滚动 */}
        <div className="hidden lg:flex flex-col w-96 border-l border-gray-200 bg-white/50 min-h-0 overflow-hidden">
          {/* 标题 */}
          <div className="px-4 py-3 border-b border-gray-100 bg-white/80 flex-shrink-0">
            <h3 className="text-sm font-medium text-gray-700">选择你的回复</h3>
          </div>
          {/* 选项区域 - 独立滚动 */}
          <div className="flex-1 overflow-y-auto p-4 min-h-0 scrollbar-thin">
            {gameStatus === 'loading' ? (
              <div className="text-center text-gray-400 text-sm py-8">
                <div className="flex justify-center gap-1 mb-2">
                  <span className="w-2 h-2 bg-pink-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                  <span className="w-2 h-2 bg-pink-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                  <span className="w-2 h-2 bg-pink-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                </div>
                等待对方回复...
              </div>
            ) : currentOptions.length > 0 && gameStatus === 'playing' ? (
              <OptionsList
                options={currentOptions}
                onSelect={onSelectOption}
                disabled={false}
              />
            ) : gameStatus === 'success' || gameStatus === 'failed' ? (
              <div className="text-center py-8">
                <div className="text-4xl mb-2">
                  {gameStatus === 'success' ? '🎉' : '😢'}
                </div>
                <p className="text-gray-500">
                  {gameStatus === 'success' ? '恭喜通关！' : '游戏结束'}
                </p>
              </div>
            ) : null}
          </div>
        </div>
      </div>

      {/* 底部选项区域（移动端显示） */}
      <div className="lg:hidden bg-white/80 backdrop-blur-sm border-t border-gray-100 px-4 py-4 flex-shrink-0">
        {gameStatus === 'loading' ? (
          <div className="text-center text-gray-400 text-sm py-4">
            <div className="flex justify-center gap-1 mb-2">
              <span className="w-2 h-2 bg-pink-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
              <span className="w-2 h-2 bg-pink-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
              <span className="w-2 h-2 bg-pink-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
            </div>
            等待对方回复...
          </div>
        ) : currentOptions.length > 0 && gameStatus === 'playing' ? (
          <OptionsList
            options={currentOptions}
            onSelect={onSelectOption}
            disabled={false}
          />
        ) : null}
      </div>
    </div>
  );
}

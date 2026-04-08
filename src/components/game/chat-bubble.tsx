'use client';

import { Message } from '@/types/game';
import { Volume2, VolumeX } from 'lucide-react';

interface ChatBubbleProps {
  message: Message;
  onPlayAudio: (messageId: string) => void;
}

export function ChatBubble({ message, onPlayAudio }: ChatBubbleProps) {
  const isPartner = message.role === 'partner';

  return (
    <div className={`flex gap-2 ${isPartner ? 'justify-start' : 'justify-end'} mb-4`}>
      {/* 对方头像（左侧） */}
      {isPartner && (
        <div className="flex-shrink-0">
          <svg width="40" height="40" viewBox="0 0 40 40" className="rounded-full">
            <circle cx="20" cy="20" r="20" fill="#fce7f3" />
            <circle cx="14" cy="16" r="3" fill="#ec4899" />
            <circle cx="26" cy="16" r="3" fill="#ec4899" />
            <path d="M 12 26 Q 20 32 28 26" stroke="#ec4899" strokeWidth="2" fill="none" strokeLinecap="round" />
          </svg>
        </div>
      )}

      {/* 消息气泡 */}
      <div className={`max-w-[70%] ${isPartner ? 'order-2' : 'order-1'}`}>
        <div
          className={`relative px-4 py-3 rounded-2xl ${
            isPartner
              ? 'bg-white border border-gray-200 text-gray-800 rounded-tl-none'
              : 'bg-gradient-to-r from-pink-500 to-purple-500 text-white rounded-tr-none'
          }`}
        >
          <p className="text-sm leading-relaxed whitespace-pre-wrap">{message.content}</p>

          {/* 播放按钮（仅对方消息） */}
          {isPartner && message.audioUrl && (
            <button
              onClick={() => onPlayAudio(message.id)}
              className={`mt-2 flex items-center gap-1 text-xs ${
                message.isPlaying ? 'text-pink-500' : 'text-gray-400 hover:text-pink-500'
              } transition-colors`}
            >
              {message.isPlaying ? (
                <>
                  <VolumeX className="w-4 h-4" />
                  <span>停止</span>
                </>
              ) : (
                <>
                  <Volume2 className="w-4 h-4" />
                  <span>播放语音</span>
                </>
              )}
            </button>
          )}
        </div>
      </div>

      {/* 用户头像（右侧） */}
      {!isPartner && (
        <div className="flex-shrink-0 order-2">
          <svg width="40" height="40" viewBox="0 0 40 40" className="rounded-full">
            <circle cx="20" cy="20" r="20" fill="#e0e7ff" />
            <circle cx="14" cy="16" r="3" fill="#6366f1" />
            <circle cx="26" cy="16" r="3" fill="#6366f1" />
            <path d="M 14 26 L 26 26" stroke="#6366f1" strokeWidth="2" strokeLinecap="round" />
          </svg>
        </div>
      )}
    </div>
  );
}

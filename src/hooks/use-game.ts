'use client';

import { useState, useCallback, useRef, useEffect } from 'react';
import { GameState, Gender, VoiceType, Scenario, Option, Message } from '@/types/game';
import { GAME_CONFIG } from '@/constants/game';

interface UseGameReturn {
  gameState: GameState;
  startGame: (gender: Gender, voiceType: VoiceType, scenario: Scenario) => Promise<void>;
  selectOption: (option: Option) => Promise<void>;
  playAgain: () => void;
  playAudio: (messageId: string) => void;
  stopAudio: () => void;
}

const initialState: GameState = {
  gender: 'girlfriend',
  voiceType: 'gentle_female',
  scenario: null,
  messages: [],
  currentOptions: [],
  affectionScore: GAME_CONFIG.INITIAL_SCORE,
  currentRound: 0,
  maxRounds: GAME_CONFIG.MAX_ROUNDS,
  gameStatus: 'idle',
  lastScoreChange: 0,
};

// 生成唯一 ID 的计数器
let messageIdCounter = 0;
function generateMessageId(prefix: string = 'msg'): string {
  messageIdCounter++;
  return `${prefix}-${Date.now()}-${messageIdCounter}`;
}

export function useGame(): UseGameReturn {
  const [gameState, setGameState] = useState<GameState>(initialState);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const currentPlayingId = useRef<string | null>(null);

  // 清理音频
  useEffect(() => {
    return () => {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current = null;
      }
    };
  }, []);

  // 停止当前音频
  const stopAudio = useCallback(() => {
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current = null;
      currentPlayingId.current = null;
      setGameState(prev => ({
        ...prev,
        messages: prev.messages.map(m => ({ ...m, isPlaying: false })),
      }));
    }
  }, []);

  // 播放音频
  const playAudio = useCallback(async (messageId: string) => {
    const message = gameState.messages.find(m => m.id === messageId);
    if (!message || !message.audioUrl) return;

    // 如果正在播放同一个，停止
    if (currentPlayingId.current === messageId && audioRef.current) {
      stopAudio();
      return;
    }

    // 停止之前的音频
    stopAudio();

    // 播放新的
    audioRef.current = new Audio(message.audioUrl);
    currentPlayingId.current = messageId;

    // 更新播放状态
    setGameState(prev => ({
      ...prev,
      messages: prev.messages.map(m => ({
        ...m,
        isPlaying: m.id === messageId,
      })),
    }));

    audioRef.current.onended = () => {
      setGameState(prev => ({
        ...prev,
        messages: prev.messages.map(m => ({
          ...m,
          isPlaying: false,
        })),
      }));
      currentPlayingId.current = null;
    };

    try {
      await audioRef.current.play();
    } catch (error) {
      console.error('Audio play error:', error);
    }
  }, [gameState.messages, stopAudio]);

  // 生成 TTS（后台生成，不阻塞）
  const generateTTSInBackground = useCallback((
    messageId: string,
    text: string,
    gender: Gender,
    voiceType: VoiceType
  ) => {
    // 异步生成语音，不阻塞主流程
    fetch('/api/tts', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ text, voiceType, gender }),
    })
      .then(res => res.json())
      .then(data => {
        if (data.audioUrl) {
          // 更新对应消息的 audioUrl
          setGameState(prev => ({
            ...prev,
            messages: prev.messages.map(m =>
              m.id === messageId ? { ...m, audioUrl: data.audioUrl } : m
            ),
          }));
        }
      })
      .catch(error => {
        console.error('TTS background error:', error);
      });
  }, []);

  // 开始游戏
  const startGame = useCallback(async (gender: Gender, voiceType: VoiceType, scenario: Scenario) => {
    setGameState({
      ...initialState,
      gender,
      voiceType,
      scenario,
      gameStatus: 'loading',
    });

    try {
      // 调用生成 API
      const response = await fetch('/api/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          scenario,
          gender,
          history: [],
          currentScore: GAME_CONFIG.INITIAL_SCORE,
          currentRound: 0,
          isFirstRound: true,
        }),
      });

      const data = await response.json();

      // 立即创建消息（不等待 TTS）
      const partnerMessageId = generateMessageId('partner');
      const partnerMessage: Message = {
        id: partnerMessageId,
        role: 'partner',
        content: data.partnerMessage,
        audioUrl: undefined,
      };

      // 先更新状态显示消息
      setGameState(prev => ({
        ...prev,
        messages: [partnerMessage],
        currentOptions: data.options,
        currentRound: 1,
        gameStatus: 'playing',
      }));

      // 后台生成语音
      generateTTSInBackground(partnerMessageId, data.partnerMessage, gender, voiceType);

    } catch (error) {
      console.error('Start game error:', error);
      setGameState(prev => ({ ...prev, gameStatus: 'idle' }));
    }
  }, [generateTTSInBackground]);

  // 选择选项
  const selectOption = useCallback(async (option: Option) => {
    // 停止当前音频
    stopAudio();

    // 创建用户消息（使用唯一 ID）
    const userMessage: Message = {
      id: generateMessageId('user'),
      role: 'user',
      content: option.text,
    };

    // 计算新的好感度
    const newScore = Math.max(
      GAME_CONFIG.MIN_SCORE,
      Math.min(GAME_CONFIG.MAX_SCORE, gameState.affectionScore + option.scoreChange)
    );

    // 立即添加用户消息，并设置 loading 状态
    setGameState(prev => ({
      ...prev,
      messages: [...prev.messages, userMessage],
      affectionScore: newScore,
      lastScoreChange: option.scoreChange,
      currentOptions: [], // 清空选项
      gameStatus: 'loading',
    }));

    // 检查是否失败（好感度降到 -50 以下）
    if (newScore <= GAME_CONFIG.MIN_SCORE) {
      const failContent = '算了，我们还是冷静一下吧。对方把你拉黑了。';
      const failMessageId = generateMessageId('fail');
      const failMessage: Message = {
        id: failMessageId,
        role: 'partner',
        content: failContent,
        audioUrl: undefined,
      };

      setGameState(prev => ({
        ...prev,
        messages: [...prev.messages, failMessage],
        gameStatus: 'failed',
      }));

      // 后台生成语音
      generateTTSInBackground(failMessageId, failContent, gameState.gender, gameState.voiceType);
      return;
    }

    // 检查是否成功
    if (newScore >= GAME_CONFIG.SUCCESS_SCORE) {
      const successContent = '好啦好啦，原谅你啦～下次不许这样了哦！';
      const successMessageId = generateMessageId('success');
      const successMessage: Message = {
        id: successMessageId,
        role: 'partner',
        content: successContent,
        audioUrl: undefined,
      };

      setGameState(prev => ({
        ...prev,
        messages: [...prev.messages, successMessage],
        gameStatus: 'success',
      }));

      // 后台生成语音
      generateTTSInBackground(successMessageId, successContent, gameState.gender, gameState.voiceType);
      return;
    }

    // 检查是否用完轮数
    if (gameState.currentRound >= GAME_CONFIG.MAX_ROUNDS) {
      const failContent = '时间太久了...我已经不想听了。';
      const failMessageId = generateMessageId('timeout');
      const failMessage: Message = {
        id: failMessageId,
        role: 'partner',
        content: failContent,
        audioUrl: undefined,
      };

      setGameState(prev => ({
        ...prev,
        messages: [...prev.messages, failMessage],
        gameStatus: 'failed',
      }));

      // 后台生成语音
      generateTTSInBackground(failMessageId, failContent, gameState.gender, gameState.voiceType);
      return;
    }

    try {
      // 获取历史记录（包含刚添加的用户消息）
      const history = [
        ...gameState.messages.map(m => ({
          role: m.role,
          content: m.content,
        })),
        { role: 'user' as const, content: option.text },
      ];

      // 调用生成 API
      const response = await fetch('/api/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          scenario: gameState.scenario,
          gender: gameState.gender,
          history,
          currentScore: newScore,
          currentRound: gameState.currentRound + 1,
          isFirstRound: false,
        }),
      });

      const data = await response.json();

      // 立即创建消息（不等待 TTS）
      const partnerMessageId = generateMessageId('partner');
      const partnerMessage: Message = {
        id: partnerMessageId,
        role: 'partner',
        content: data.partnerMessage,
        audioUrl: undefined,
      };

      // 先更新状态显示消息和选项
      setGameState(prev => ({
        ...prev,
        messages: [...prev.messages, partnerMessage],
        currentOptions: data.options,
        currentRound: prev.currentRound + 1,
        gameStatus: 'playing',
      }));

      // 后台生成语音
      generateTTSInBackground(partnerMessageId, data.partnerMessage, gameState.gender, gameState.voiceType);

    } catch (error) {
      console.error('Select option error:', error);
      setGameState(prev => ({
        ...prev,
        gameStatus: 'playing',
      }));
    }
  }, [gameState, stopAudio, generateTTSInBackground]);

  // 再玩一次
  const playAgain = useCallback(() => {
    stopAudio();
    setGameState(initialState);
  }, [stopAudio]);

  return {
    gameState,
    startGame,
    selectOption,
    playAgain,
    playAudio,
    stopAudio,
  };
}

'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useGame } from '@/hooks/use-game';
import { SetupScreen, GameScreen, LoadingScreen, GameOverModal } from '@/components/game';
import { Gender, VoiceType } from '@/types/game';
import { SCENARIOS } from '@/constants/game';
import { useAuth, AuthProvider } from '@/contexts/AuthContext';
import { AuthModal } from '@/components/auth/auth-modal';
import { Button } from '@/components/ui/button';
import { User, LogOut, History, Trophy } from 'lucide-react';

function HomeContent() {
  const router = useRouter();
  const [screen, setScreen] = useState<'setup' | 'loading' | 'game'>('setup');
  const [pendingScenarioId, setPendingScenarioId] = useState<string>('');
  const [showAuthModal, setShowAuthModal] = useState(false);
  
  const {
    gameState,
    startGame,
    selectOption,
    playAgain,
    playAudio,
  } = useGame();

  const { user, loading, logout } = useAuth();

  // 未登录时显示登录提示
  useEffect(() => {
    if (!loading && !user && screen === 'setup') {
      setShowAuthModal(true);
    }
  }, [loading, user, screen]);

  const handleStartGame = async (gender: Gender, voiceType: VoiceType, scenarioId: string) => {
    const scenario = SCENARIOS.find(s => s.id === scenarioId);
    if (!scenario) return;

    // 检查登录状态
    if (!user) {
      setShowAuthModal(true);
      return;
    }

    setPendingScenarioId(scenarioId);
    setScreen('loading');
    
    await startGame(gender, voiceType, scenario);
    
    setScreen('game');
  };

  const handlePlayAgain = () => {
    playAgain();
    setScreen('setup');
    setPendingScenarioId('');
  };

  const handleQuit = () => {
    playAgain();
    setScreen('setup');
    setPendingScenarioId('');
  };

  const handleLogout = async () => {
    await logout();
    setShowAuthModal(true);
  };

  // 加载中
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-pink-50 to-purple-50">
        <div className="text-center">
          <div className="w-8 h-8 border-4 border-pink-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-500">加载中...</p>
        </div>
      </div>
    );
  }

  return (
    <main className="min-h-screen relative">
      {/* 右上角用户信息 */}
      <div className="fixed top-4 right-4 z-50 flex items-center gap-2">
        {/* 排行榜按钮 */}
        <button
          onClick={() => router.push('/leaderboard')}
          className="flex items-center gap-1 bg-white/80 backdrop-blur-sm rounded-full px-4 py-2 shadow-sm border border-gray-100 hover:bg-white transition-colors"
        >
          <Trophy className="w-4 h-4 text-yellow-500" />
          <span className="text-sm font-medium text-gray-700">排行榜</span>
        </button>
        
        {/* 用户信息 */}
        {user && (
          <div className="flex items-center gap-2 bg-white/80 backdrop-blur-sm rounded-full px-4 py-2 shadow-sm border border-gray-100">
            <button
              onClick={() => router.push('/profile')}
              className="flex items-center gap-1 hover:text-pink-500 transition-colors"
            >
              <User className="w-4 h-4 text-pink-500" />
              <span className="text-sm font-medium text-gray-700">{user.username}</span>
            </button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => router.push('/profile')}
              className="h-6 px-2 text-gray-500 hover:text-gray-700"
              title="游戏记录"
            >
              <History className="w-4 h-4" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleLogout}
              className="h-6 px-2 text-gray-500 hover:text-gray-700"
              title="退出登录"
            >
              <LogOut className="w-4 h-4" />
            </Button>
          </div>
        )}
      </div>

      {screen === 'setup' && (
        <SetupScreen onStartGame={handleStartGame} />
      )}
      
      {screen === 'loading' && (
        <LoadingScreen scenarioId={pendingScenarioId} />
      )}
      
      {screen === 'game' && (
        <>
          <GameScreen
            gameState={gameState}
            onSelectOption={selectOption}
            onPlayAudio={playAudio}
            onQuit={handleQuit}
          />
          
          {/* 游戏结束弹窗 */}
          {(gameState.gameStatus === 'success' || gameState.gameStatus === 'failed') && (
            <GameOverModal
              isSuccess={gameState.gameStatus === 'success'}
              rounds={gameState.currentRound}
              score={gameState.affectionScore}
              scenario={gameState.scenario?.title || '未知场景'}
              onPlayAgain={handlePlayAgain}
            />
          )}
        </>
      )}

      {/* 登录/注册弹窗 */}
      <AuthModal open={showAuthModal} onOpenChange={setShowAuthModal} />
    </main>
  );
}

export default function Home() {
  return (
    <AuthProvider>
      <HomeContent />
    </AuthProvider>
  );
}

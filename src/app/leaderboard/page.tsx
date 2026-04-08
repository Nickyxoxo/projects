'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { AuthProvider, useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { ChevronLeft, Trophy, Medal, Crown, Gamepad2 } from 'lucide-react';

interface LeaderboardEntry {
  rank: number;
  userId: number;
  username: string;
  scenario: string;
  score: number;
  playedAt: string;
}

function LeaderboardContent() {
  const router = useRouter();
  const { user, loading } = useAuth();
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
  const [currentUserRank, setCurrentUserRank] = useState<LeaderboardEntry | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchLeaderboard();
  }, []);

  const fetchLeaderboard = async () => {
    try {
      const response = await fetch('/api/leaderboard');
      const data = await response.json();
      if (response.ok) {
        setLeaderboard(data.leaderboard || []);
        setCurrentUserRank(data.currentUserRank || null);
      }
    } catch (error) {
      console.error('获取排行榜失败:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('zh-CN', {
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const getRankIcon = (rank: number) => {
    switch (rank) {
      case 1:
        return <Crown className="w-6 h-6 text-yellow-500" />;
      case 2:
        return <Medal className="w-6 h-6 text-gray-400" />;
      case 3:
        return <Medal className="w-6 h-6 text-amber-600" />;
      default:
        return (
          <span className="w-6 h-6 flex items-center justify-center text-gray-500 font-bold">
            {rank}
          </span>
        );
    }
  };

  const getRankStyle = (rank: number, isCurrentUser: boolean) => {
    if (isCurrentUser) {
      return 'bg-pink-100 border-pink-300';
    }
    switch (rank) {
      case 1:
        return 'bg-gradient-to-r from-yellow-50 to-amber-50 border-yellow-200';
      case 2:
        return 'bg-gradient-to-r from-gray-50 to-slate-50 border-gray-200';
      case 3:
        return 'bg-gradient-to-r from-amber-50 to-orange-50 border-amber-200';
      default:
        return 'bg-white border-gray-100';
    }
  };

  if (loading || isLoading) {
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
    <div className="min-h-screen bg-gradient-to-b from-pink-50 to-purple-50">
      {/* 顶部导航 */}
      <div className="bg-white/80 backdrop-blur-sm border-b border-gray-100 px-4 py-3 sticky top-0 z-10">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <button
            onClick={() => router.push('/')}
            className="flex items-center gap-1 text-gray-500 hover:text-gray-700 transition-colors"
          >
            <ChevronLeft className="w-5 h-5" />
            <span className="text-sm">返回</span>
          </button>
          
          <h1 className="text-lg font-bold text-gray-800 flex items-center gap-2">
            <Trophy className="w-5 h-5 text-yellow-500" />
            排行榜
          </h1>
          
          <div className="w-16" />
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 py-6">
        {/* 标题区域 */}
        <div className="text-center mb-6">
          <h2 className="text-2xl font-bold text-gray-800 mb-2">哄人高手榜</h2>
          <p className="text-gray-500 text-sm">按最高好感度分数排名的前20名</p>
        </div>

        {/* 当前用户排名（如果不在前20） */}
        {currentUserRank && currentUserRank.rank > 20 && (
          <div className="mb-6 bg-pink-50 border-2 border-pink-200 rounded-xl p-4">
            <div className="text-center text-sm text-pink-600 mb-2">您的排名</div>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <span className="text-lg font-bold text-gray-500">#{currentUserRank.rank}</span>
                <span className="font-medium text-gray-800">{currentUserRank.username}</span>
              </div>
              <div className="text-right">
                <div className="text-lg font-bold text-pink-500">{currentUserRank.score}</div>
                <div className="text-xs text-gray-500">{currentUserRank.scenario}</div>
              </div>
            </div>
          </div>
        )}

        {/* 排行榜列表 */}
        {leaderboard.length === 0 ? (
          <div className="bg-white rounded-2xl p-8 text-center shadow-sm">
            <Trophy className="w-12 h-12 mx-auto mb-3 text-gray-300" />
            <p className="text-gray-500">暂无排行数据</p>
            <p className="text-sm text-gray-400 mt-1">完成游戏后，你的成绩将显示在这里</p>
            <Button className="mt-4" onClick={() => router.push('/')}>
              开始游戏
            </Button>
          </div>
        ) : (
          <div className="space-y-3">
            {leaderboard.map((entry) => {
              const isCurrentUser = user?.id === entry.userId;
              return (
                <div
                  key={entry.rank}
                  className={`rounded-xl p-4 border-2 transition-all ${getRankStyle(entry.rank, isCurrentUser)}`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      {/* 排名 */}
                      <div className="flex-shrink-0 w-10 h-10 flex items-center justify-center">
                        {getRankIcon(entry.rank)}
                      </div>
                      
                      {/* 用户信息 */}
                      <div>
                        <div className={`font-medium ${isCurrentUser ? 'text-pink-600' : 'text-gray-800'}`}>
                          {entry.username}
                          {isCurrentUser && (
                            <span className="ml-2 text-xs bg-pink-500 text-white px-2 py-0.5 rounded-full">
                              你
                            </span>
                          )}
                        </div>
                        <div className="text-xs text-gray-500">{entry.scenario}</div>
                      </div>
                    </div>
                    
                    {/* 分数和时间 */}
                    <div className="text-right">
                      <div className={`text-xl font-bold ${isCurrentUser ? 'text-pink-500' : 'text-gray-800'}`}>
                        {entry.score}
                      </div>
                      <div className="text-xs text-gray-400">{formatDate(entry.playedAt)}</div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* 未登录提示 */}
        {!user && (
          <div className="mt-6 bg-white rounded-xl p-4 text-center shadow-sm">
            <p className="text-gray-500 text-sm">
              登录后可查看自己的排名
            </p>
            <Button
              variant="outline"
              className="mt-2"
              onClick={() => router.push('/')}
            >
              去登录
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}

export default function LeaderboardPage() {
  return (
    <AuthProvider>
      <LeaderboardContent />
    </AuthProvider>
  );
}

'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth, AuthProvider } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { ChevronLeft, Trophy, XCircle, Calendar, Gamepad2 } from 'lucide-react';

interface GameRecord {
  id: number;
  scenario: string;
  final_score: number;
  result: 'success' | 'failed';
  played_at: string;
}

function ProfileContent() {
  const { user, loading, logout } = useAuth();
  const router = useRouter();
  const [records, setRecords] = useState<GameRecord[]>([]);
  const [recordsLoading, setRecordsLoading] = useState(true);

  // 获取游戏记录
  useEffect(() => {
    if (!loading && !user) {
      router.push('/');
      return;
    }

    if (user) {
      fetchRecords();
    }
  }, [user, loading, router]);

  const fetchRecords = async () => {
    try {
      const response = await fetch('/api/game/records');
      const data = await response.json();
      if (response.ok) {
        setRecords(data.records || []);
      }
    } catch (error) {
      console.error('获取游戏记录失败:', error);
    } finally {
      setRecordsLoading(false);
    }
  };

  const handleLogout = async () => {
    await logout();
    router.push('/');
  };

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleString('zh-CN', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  // 统计数据
  const totalGames = records.length;
  const successCount = records.filter(r => r.result === 'success').length;
  const successRate = totalGames > 0 ? Math.round((successCount / totalGames) * 100) : 0;
  const avgScore = totalGames > 0 
    ? Math.round(records.reduce((sum, r) => sum + r.final_score, 0) / totalGames) 
    : 0;

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
          
          <h1 className="text-lg font-bold text-gray-800">我的记录</h1>
          
          <Button
            variant="ghost"
            size="sm"
            onClick={handleLogout}
            className="text-gray-500 hover:text-gray-700"
          >
            退出登录
          </Button>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 py-6">
        {/* 用户信息卡片 */}
        <div className="bg-white rounded-2xl p-6 shadow-sm mb-6">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 bg-gradient-to-br from-pink-400 to-purple-400 rounded-full flex items-center justify-center text-white text-2xl font-bold">
              {user?.username?.charAt(0).toUpperCase()}
            </div>
            <div>
              <h2 className="text-xl font-bold text-gray-800">{user?.username}</h2>
              <p className="text-gray-500 text-sm">
                加入时间: {user?.created_at ? formatDate(user.created_at) : '-'}
              </p>
            </div>
          </div>
        </div>

        {/* 统计卡片 */}
        <div className="grid grid-cols-3 gap-4 mb-6">
          <div className="bg-white rounded-xl p-4 text-center shadow-sm">
            <Gamepad2 className="w-6 h-6 text-blue-500 mx-auto mb-2" />
            <div className="text-2xl font-bold text-gray-800">{totalGames}</div>
            <div className="text-xs text-gray-500">游戏次数</div>
          </div>
          <div className="bg-white rounded-xl p-4 text-center shadow-sm">
            <Trophy className="w-6 h-6 text-yellow-500 mx-auto mb-2" />
            <div className="text-2xl font-bold text-gray-800">{successRate}%</div>
            <div className="text-xs text-gray-500">成功率</div>
          </div>
          <div className="bg-white rounded-xl p-4 text-center shadow-sm">
            <span className="text-2xl">❤️</span>
            <div className="text-2xl font-bold text-gray-800">{avgScore}</div>
            <div className="text-xs text-gray-500">平均好感度</div>
          </div>
        </div>

        {/* 游戏记录列表 */}
        <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
          <div className="px-4 py-3 border-b border-gray-100">
            <h3 className="font-semibold text-gray-800">游戏历史</h3>
          </div>

          {recordsLoading ? (
            <div className="p-8 text-center text-gray-500">
              加载中...
            </div>
          ) : records.length === 0 ? (
            <div className="p-8 text-center text-gray-500">
              <Gamepad2 className="w-12 h-12 mx-auto mb-3 text-gray-300" />
              <p>还没有游戏记录</p>
              <p className="text-sm mt-1">开始游戏，你的记录将显示在这里</p>
              <Button
                className="mt-4"
                onClick={() => router.push('/')}
              >
                开始游戏
              </Button>
            </div>
          ) : (
            <div className="divide-y divide-gray-100">
              {records.map((record) => (
                <div
                  key={record.id}
                  className="px-4 py-3 flex items-center justify-between hover:bg-gray-50 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                      record.result === 'success' 
                        ? 'bg-green-100 text-green-500' 
                        : 'bg-red-100 text-red-500'
                    }`}>
                      {record.result === 'success' ? (
                        <Trophy className="w-5 h-5" />
                      ) : (
                        <XCircle className="w-5 h-5" />
                      )}
                    </div>
                    <div>
                      <div className="font-medium text-gray-800">{record.scenario}</div>
                      <div className="flex items-center gap-2 text-xs text-gray-500">
                        <Calendar className="w-3 h-3" />
                        {formatDate(record.played_at)}
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className={`text-lg font-bold ${
                      record.result === 'success' ? 'text-green-500' : 'text-red-500'
                    }`}>
                      {record.result === 'success' ? '通关' : '失败'}
                    </div>
                    <div className="text-xs text-gray-500">
                      好感度: {record.final_score}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default function ProfilePage() {
  return (
    <AuthProvider>
      <ProfileContent />
    </AuthProvider>
  );
}

import { NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth';
import { getSupabaseClient } from '@/storage/database/supabase-client';

export async function GET() {
  try {
    const client = getSupabaseClient();

    // 获取排行榜前20名（按最高好感度分数排序）
    // 使用子查询获取每个用户的最高分记录
    const { data, error } = await client
      .from('game_records')
      .select(`
        id,
        user_id,
        scenario,
        final_score,
        result,
        played_at
      `)
      .eq('result', 'success') // 只统计通关的记录
      .order('final_score', { ascending: false })
      .order('played_at', { ascending: true })
      .limit(20);

    if (error) {
      console.error('获取排行榜失败:', error);
      return NextResponse.json(
        { error: '获取排行榜失败' },
        { status: 500 }
      );
    }

    // 获取所有涉及的user_id
    const userIds = [...new Set(data?.map(r => r.user_id) || [])];

    // 查询用户信息
    const { data: users, error: usersError } = await client
      .from('users')
      .select('id, username')
      .in('id', userIds);

    if (usersError) {
      console.error('获取用户信息失败:', usersError);
      return NextResponse.json(
        { error: '获取排行榜失败' },
        { status: 500 }
      );
    }

    // 创建用户ID到用户名的映射
    const userMap = new Map(users?.map(u => [u.id, u.username]) || []);

    // 组装排行榜数据
    const leaderboard = (data || []).map((record, index) => ({
      rank: index + 1,
      userId: record.user_id,
      username: userMap.get(record.user_id) || '未知用户',
      scenario: record.scenario,
      score: record.final_score,
      playedAt: record.played_at,
    }));

    // 获取当前用户
    let currentUser = null;
    try {
      currentUser = await getCurrentUser();
    } catch {
      // 忽略错误，用户未登录
    }

    // 查找当前用户的排名（如果登录且在榜上）
    let currentUserRank = null;
    if (currentUser) {
      const userRecord = leaderboard.find(item => item.userId === currentUser.id);
      if (userRecord) {
        currentUserRank = userRecord;
      } else {
        // 用户不在前20名，查询用户的最高分排名
        const { data: allRecords, error: allError } = await client
          .from('game_records')
          .select('user_id, final_score')
          .eq('result', 'success');

        if (!allError && allRecords) {
          // 按分数排序计算排名
          const sortedRecords = allRecords.sort((a, b) => b.final_score - a.final_score);
          const rankIndex = sortedRecords.findIndex(r => r.user_id === currentUser.id);
          if (rankIndex !== -1) {
            // 获取用户的最高分记录
            const { data: userBest, error: userBestError } = await client
              .from('game_records')
              .select('final_score, played_at, scenario')
              .eq('user_id', currentUser.id)
              .eq('result', 'success')
              .order('final_score', { ascending: false })
              .limit(1)
              .maybeSingle();

            if (!userBestError && userBest) {
              currentUserRank = {
                rank: rankIndex + 1,
                userId: currentUser.id,
                username: currentUser.username,
                scenario: userBest.scenario,
                score: userBest.final_score,
                playedAt: userBest.played_at,
              };
            }
          }
        }
      }
    }

    return NextResponse.json({
      leaderboard,
      currentUserRank,
    });
  } catch (error) {
    console.error('获取排行榜错误:', error);
    return NextResponse.json(
      { error: '获取排行榜失败' },
      { status: 500 }
    );
  }
}

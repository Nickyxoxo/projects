import { NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth';
import { getSupabaseClient } from '@/storage/database/supabase-client';

export async function GET() {
  try {
    const user = await getCurrentUser();

    if (!user) {
      return NextResponse.json(
        { error: '请先登录' },
        { status: 401 }
      );
    }

    const client = getSupabaseClient();

    // 获取用户的游戏记录，按时间倒序
    const { data, error } = await client
      .from('game_records')
      .select('id, scenario, final_score, result, played_at')
      .eq('user_id', user.id)
      .order('played_at', { ascending: false })
      .limit(50);

    if (error) {
      console.error('获取游戏记录失败:', error);
      return NextResponse.json(
        { error: '获取记录失败' },
        { status: 500 }
      );
    }

    return NextResponse.json({ records: data });
  } catch (error) {
    console.error('获取游戏记录错误:', error);
    return NextResponse.json(
      { error: '获取记录失败' },
      { status: 500 }
    );
  }
}

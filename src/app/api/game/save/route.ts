import { NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth';
import { getSupabaseClient } from '@/storage/database/supabase-client';

export async function POST(request: Request) {
  try {
    const user = await getCurrentUser();

    if (!user) {
      return NextResponse.json(
        { error: '请先登录', needLogin: true },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { scenario, finalScore, result } = body;

    // 参数验证
    if (!scenario || typeof finalScore !== 'number' || !result) {
      return NextResponse.json(
        { error: '参数错误' },
        { status: 400 }
      );
    }

    if (result !== 'success' && result !== 'failed') {
      return NextResponse.json(
        { error: '结果参数错误' },
        { status: 400 }
      );
    }

    const client = getSupabaseClient();

    // 保存游戏记录
    const { data, error } = await client
      .from('game_records')
      .insert({
        user_id: user.id,
        scenario,
        final_score: finalScore,
        result,
      })
      .select()
      .single();

    if (error) {
      console.error('保存游戏记录失败:', error);
      return NextResponse.json(
        { error: '保存失败，请稍后重试' },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true, record: data });
  } catch (error) {
    console.error('保存游戏记录错误:', error);
    return NextResponse.json(
      { error: '保存失败，请稍后重试' },
      { status: 500 }
    );
  }
}

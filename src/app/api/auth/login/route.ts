import { NextResponse } from 'next/server';
import { loginUser, setSession } from '@/lib/auth';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { username, password } = body;

    // 参数验证
    if (!username || !password) {
      return NextResponse.json(
        { error: '用户名和密码不能为空' },
        { status: 400 }
      );
    }

    // 登录验证
    const { user, error } = await loginUser(username, password);

    if (error) {
      return NextResponse.json({ error }, { status: 401 });
    }

    // 设置 session
    await setSession(user.id);

    return NextResponse.json({ user });
  } catch (error) {
    console.error('登录错误:', error);
    return NextResponse.json(
      { error: '登录失败，请稍后重试' },
      { status: 500 }
    );
  }
}

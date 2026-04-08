import { NextResponse } from 'next/server';
import { registerUser, setSession } from '@/lib/auth';

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

    if (username.length < 2 || username.length > 50) {
      return NextResponse.json(
        { error: '用户名长度需要在 2-50 个字符之间' },
        { status: 400 }
      );
    }

    if (password.length < 6) {
      return NextResponse.json(
        { error: '密码长度至少需要 6 个字符' },
        { status: 400 }
      );
    }

    // 注册用户
    const { user, error } = await registerUser(username, password);

    if (error) {
      return NextResponse.json({ error }, { status: 400 });
    }

    // 设置 session
    await setSession(user.id);

    return NextResponse.json({ user });
  } catch (error) {
    console.error('注册错误:', error);
    return NextResponse.json(
      { error: '注册失败，请稍后重试' },
      { status: 500 }
    );
  }
}

import { cookies } from 'next/headers';
import { getSupabaseClient } from '@/storage/database/supabase-client';
import * as crypto from 'crypto';

// 密码哈希配置
const SALT_LENGTH = 16;
const KEY_LENGTH = 64;
const ITERATIONS = 100000;

// 用户类型
export interface User {
  id: number;
  username: string;
  created_at: string;
}

// Session 配置
const SESSION_COOKIE_NAME = 'session_user_id';
const SESSION_MAX_AGE = 7 * 24 * 60 * 60; // 7 天

/**
 * 对密码进行哈希
 */
export async function hashPassword(password: string): Promise<string> {
  const salt = crypto.randomBytes(SALT_LENGTH).toString('hex');
  return new Promise((resolve, reject) => {
    crypto.scrypt(password, salt, KEY_LENGTH, (err, derivedKey) => {
      if (err) reject(err);
      resolve(`${salt}:${derivedKey.toString('hex')}`);
    });
  });
}

/**
 * 验证密码
 */
export async function verifyPassword(password: string, hashedPassword: string): Promise<boolean> {
  const [salt, hash] = hashedPassword.split(':');
  return new Promise((resolve, reject) => {
    crypto.scrypt(password, salt, KEY_LENGTH, (err, derivedKey) => {
      if (err) reject(err);
      resolve(derivedKey.toString('hex') === hash);
    });
  });
}

/**
 * 注册用户
 */
export async function registerUser(username: string, password: string): Promise<{ user: User; error?: string }> {
  const client = getSupabaseClient();

  // 检查用户名是否已存在
  const { data: existingUser, error: checkError } = await client
    .from('users')
    .select('id')
    .eq('username', username)
    .maybeSingle();

  if (checkError) {
    return { user: null as unknown as User, error: '检查用户名失败' };
  }

  if (existingUser) {
    return { user: null as unknown as User, error: '用户名已存在' };
  }

  // 哈希密码
  const hashedPassword = await hashPassword(password);

  // 创建用户
  const { data, error } = await client
    .from('users')
    .insert({ username, password: hashedPassword })
    .select('id, username, created_at')
    .single();

  if (error) {
    return { user: null as unknown as User, error: '注册失败，请稍后重试' };
  }

  return { user: data as User };
}

/**
 * 登录验证
 */
export async function loginUser(username: string, password: string): Promise<{ user: User; error?: string }> {
  const client = getSupabaseClient();

  // 查询用户
  const { data, error } = await client
    .from('users')
    .select('id, username, password, created_at')
    .eq('username', username)
    .maybeSingle();

  if (error) {
    return { user: null as unknown as User, error: '登录失败，请稍后重试' };
  }

  if (!data) {
    return { user: null as unknown as User, error: '用户名或密码错误' };
  }

  // 验证密码
  const isValid = await verifyPassword(password, data.password);
  if (!isValid) {
    return { user: null as unknown as User, error: '用户名或密码错误' };
  }

  // 返回用户信息（不包含密码）
  const { password: _, ...userWithoutPassword } = data;
  return { user: userWithoutPassword as User };
}

/**
 * 设置登录 session
 */
export async function setSession(userId: number) {
  const cookieStore = await cookies();
  cookieStore.set(SESSION_COOKIE_NAME, String(userId), {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: SESSION_MAX_AGE,
    path: '/',
  });
}

/**
 * 获取当前登录用户
 */
export async function getCurrentUser(): Promise<User | null> {
  const cookieStore = await cookies();
  const userId = cookieStore.get(SESSION_COOKIE_NAME)?.value;

  if (!userId) {
    return null;
  }

  const client = getSupabaseClient();
  const { data, error } = await client
    .from('users')
    .select('id, username, created_at')
    .eq('id', parseInt(userId, 10))
    .maybeSingle();

  if (error || !data) {
    return null;
  }

  return data as User;
}

/**
 * 清除 session
 */
export async function clearSession() {
  const cookieStore = await cookies();
  cookieStore.delete(SESSION_COOKIE_NAME);
}

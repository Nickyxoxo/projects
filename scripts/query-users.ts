import * as dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });
import pg from 'pg';
import { createClient } from '@supabase/supabase-js';

const { Pool } = pg;

async function main() {
  console.log('=== 方式 1: 直接 PostgreSQL 连接 ===');
  const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
  });

  try {
    const result = await pool.query('SELECT id, username, created_at FROM users');
    console.log('总记录数:', result.rowCount);
    console.log('users 表内容:');
    console.log(JSON.stringify(result.rows, null, 2));
  } catch (err: any) {
    console.error('PostgreSQL 查询出错:', err.message);
  }

  await pool.end();

  console.log('\n=== 方式 2: Supabase SDK 连接 ===');
  const client = createClient(
    process.env.COZE_SUPABASE_URL!,
    process.env.COZE_SUPABASE_ANON_KEY!
  );

  const { data, error } = await client.from('users').select('*');
  if (error) {
    console.error('Supabase 查询出错:', JSON.stringify(error, null, 2));
  } else {
    console.log('Supabase 查询成功，记录数:', data?.length);
    console.log(JSON.stringify(data, null, 2));
  }
}

main();

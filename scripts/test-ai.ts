import * as dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });
import { LLMClient, Config } from 'coze-coding-dev-sdk';

async function main() {
  console.log('=== AI 接口配置检查 ===\n');

  console.log('1. 环境变量状态:');
  console.log('   COZE_WORKLOAD_IDENTITY_API_KEY:', process.env.COZE_WORKLOAD_IDENTITY_API_KEY ? '✅ 已设置' : '❌ 未设置');
  console.log('   COZE_INTEGRATION_BASE_URL:', process.env.COZE_INTEGRATION_BASE_URL || '❌ 未设置');
  console.log('   COZE_INTEGRATION_MODEL_BASE_URL:', process.env.COZE_INTEGRATION_MODEL_BASE_URL || '❌ 未设置');

  console.log('\n2. 初始化 Config...');
  const config = new Config();
  
  try {
    const client = new LLMClient(config);
    console.log('   LLMClient 创建成功 ✅');

    console.log('\n3. 测试 AI 调用...');
    const response = await client.invoke(
      [{ role: 'user', content: '请用一句话介绍你自己' }],
      { temperature: 0.7, model: 'doubao-seed-1-6-251015' }
    );

    console.log('   ✅ AI 调用成功！');
    console.log('\n=== AI 响应 ===');
    console.log(response.content);
    
  } catch (error: any) {
    console.error('   ❌ AI 调用失败！');
    console.error('\n错误详情:');
    console.error('   Message:', error.message);
    if (error.cause) {
      console.error('   Cause:', error.cause.message || error.cause);
    }
    if (error.response) {
      console.error('   Status:', error.response.status);
      console.error('   Data:', error.response.data);
    }
  }
}

main();

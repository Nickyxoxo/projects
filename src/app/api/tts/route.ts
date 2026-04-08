import { NextRequest, NextResponse } from 'next/server';
import { TTSClient, Config, HeaderUtils } from 'coze-coding-dev-sdk';
import { VoiceType, Gender } from '@/types/game';
import { VOICE_CONFIG } from '@/constants/game';

interface TTSRequest {
  text: string;
  voiceType: VoiceType;
  gender: Gender;
}

export async function POST(request: NextRequest) {
  try {
    const body: TTSRequest = await request.json();
    const { text, voiceType, gender } = body;

    if (!text) {
      return NextResponse.json({ error: '缺少文本内容' }, { status: 400 });
    }

    // 初始化 TTS 客户端
    const config = new Config();
    const customHeaders = HeaderUtils.extractForwardHeaders(request.headers);
    const client = new TTSClient(config, customHeaders);

    // 获取对应的 speaker ID
    const speakerId = VOICE_CONFIG[voiceType]?.speakerId;
    
    if (!speakerId) {
      return NextResponse.json({ error: '无效的声音类型' }, { status: 400 });
    }

    // 调用 TTS
    const response = await client.synthesize({
      uid: 'honghong-game-user',
      text,
      speaker: speakerId,
      audioFormat: 'mp3',
      sampleRate: 24000,
    });

    return NextResponse.json({
      audioUrl: response.audioUri,
      audioSize: response.audioSize,
    });
  } catch (error) {
    console.error('TTS API error:', error);
    return NextResponse.json(
      { error: '语音生成失败' },
      { status: 500 }
    );
  }
}

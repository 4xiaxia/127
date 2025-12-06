import * as geminiService from './geminiService';

// MiniMax MCP 服务的直接调用函数
export class MiniMaxService {
  private static instance: MiniMaxService;
  private baseUrl = 'http://localhost:3000'; // 假设有一个本地代理服务器

  static getInstance(): MiniMaxService {
    if (!MiniMaxService.instance) {
      MiniMaxService.instance = new MiniMaxService();
    }
    return MiniMaxService.instance;
  }

  // 生成语音
  async generateSpeech(text: string, options?: {
    voiceId?: string;
    speed?: number;
    volume?: number;
    pitch?: number;
    outputDirectory?: string;
  }): Promise<string> {
    try {
      // 使用现有的 geminiService，它已经配置了 MiniMax
      const audioBase64 = await geminiService.generateMinimaxAudio(text, {
        voice_id: options?.voiceId || 'Chinese (Mandarin)_News_Anchor',
        speed: options?.speed || 1.0,
        vol: options?.volume || 1.0,
        pitch: options?.pitch || 0
      });

      if (audioBase64) {
        // 将 base64 转换为 blob URL
        const audioBlob = this.base64ToBlob(audioBase64, 'audio/mp3');
        return URL.createObjectURL(audioBlob);
      }
      
      throw new Error('音频生成失败');
    } catch (error) {
      console.error('MiniMax 语音生成失败:', error);
      throw error;
    }
  }

  // 获取可用语音列表（模拟，实际应调用 MCP 工具）
  async getVoices(): Promise<Array<{id: string, name: string}>> {
    // 这里返回一些常用的语音，实际可以从 MCP 获取完整列表
    return [
      { id: 'Chinese (Mandarin)_News_Anchor', name: '中文新闻主播' },
      { id: 'Chinese (Mandarin)_Warm_Girl', name: '温暖女生' },
      { id: 'Chinese (Mandarin)_Male_Announcer', name: '男播音员' },
      { id: 'English_FriendlyPerson', name: '英语友好声' },
      { id: 'Japanese_GentleButler', name: '日语管家' },
      { id: 'Korean_CheerfulLittleSister', name: '韩语活泼妹妹' }
    ];
  }

  // 生成图像
  async generateImage(prompt: string, options?: {
    aspectRatio?: string;
    numberOfImages?: number;
  }): Promise<string[]> {
    // 这里可以扩展使用 MiniMax 的图像生成功能
    console.log('图像生成功能待实现:', prompt);
    return [];
  }

  // 语音克隆
  async cloneVoice(
    voiceId: string, 
    audioFile: File, 
    previewText: string
  ): Promise<string> {
    console.log('语音克隆功能待实现');
    return '';
  }

  // Base64 转 Blob
  private base64ToBlob(base64: string, mimeType: string): Blob {
    const byteCharacters = atob(base64);
    const byteNumbers = new Array(byteCharacters.length);
    
    for (let i = 0; i < byteCharacters.length; i++) {
      byteNumbers[i] = byteCharacters.charCodeAt(i);
    }
    
    const byteArray = new Uint8Array(byteNumbers);
    return new Blob([byteArray], { type: mimeType });
  }

  // 下载音频文件
  downloadAudio(audioBlob: Blob, filename: string): void {
    const url = URL.createObjectURL(audioBlob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }
}

// 导出单例实例
export const minimaxService = MiniMaxService.getInstance();

// 导出便捷函数
export const generateSpeech = (text: string, options?: any) => 
  minimaxService.generateSpeech(text, options);

export const getVoices = () => 
  minimaxService.getVoices();

export const generateImage = (prompt: string, options?: any) => 
  minimaxService.generateImage(prompt, options);

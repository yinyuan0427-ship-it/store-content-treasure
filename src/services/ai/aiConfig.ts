// ============================================================
// src/services/ai/aiConfig.ts — AI 服务配置
// ============================================================
//
// 【重要安全说明】
// 真实大模型 API Key 绝对不能放在前端代码中。
// 原因：
//   1. 前端代码打包后完全暴露在浏览器中，任何人都能看到
//   2. API Key 泄露会导致被盗刷、产生巨额费用
//   3. 前端无法安全存储任何密钥
//
// 正式版本的正确做法：
//   前端 → POST /api/ai/generate → 后端 → 调用大模型 API → 返回结果
//   后端通过环境变量读取 API Key，前端永远接触不到密钥。
//
// 当前 mock 模式不需要任何 API Key，直接在前端模拟生成。

import type { AiProvider } from '../../types/ai';

export interface AiConfig {
  /** 当前使用的 AI 提供商 */
  provider: AiProvider;
  /** 是否启用真实 API（false = mock 模式） */
  useRealApi: boolean;
  /** 后端 API 地址（接真实大模型时使用） */
  backendApiUrl: string;
}

/**
 * 当前 AI 配置
 *
 * 后续切换到真实大模型时，只需修改这里：
 *   provider: 'claude'        // 或其他
 *   useRealApi: true
 *   backendApiUrl: '/api/ai/generate'
 */
export const aiConfig: AiConfig = {
  provider: 'mock',
  useRealApi: false,
  backendApiUrl: '/api/ai/generate',
};

/**
 * 各提供商推荐的模型（供后端参考）
 */
export const providerModels: Record<Exclude<AiProvider, 'mock'>, string> = {
  openai: 'gpt-4o',
  claude: 'claude-sonnet-4-6',
  deepseek: 'deepseek-chat',
  qwen: 'qwen-max',
  doubao: 'doubao-pro-128k',
};

/**
 * 生成参数默认值
 */
export const defaultAiParams = {
  temperature: 0.8,
  maxTokens: 2000,
  versionCount: 3,
};

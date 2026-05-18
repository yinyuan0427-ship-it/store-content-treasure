// ============================================================
// src/services/ai/aiService.ts — 统一 AI 调用入口
// ============================================================
//
// 这是前端调用 AI 的唯一入口，所有 AI 生成请求都走这里。
//
// 当前 mock 模式（aiConfig.useRealApi = false）：
//   直接调用 mockAiProvider.mockGenerate()，在前端模拟生成。
//
// 后续接真实大模型（aiConfig.useRealApi = true）：
//   改为 fetch POST /api/ai/generate，由后端调用大模型。
//
//   后端接口约定：
//     POST /api/ai/generate
//     Content-Type: application/json
//     Body: { params: AiGenerateParams, provider: AiProvider }
//     Response: AiGenerateResponse
//
//   后端示例（Node.js + Express）：
//     app.post('/api/ai/generate', async (req, res) => {
//       const { params, provider } = req.body;
//       // 根据 provider 调用对应大模型 SDK
//       // API Key 从 process.env 读取，不暴露给前端
//       const result = await callLLM(provider, params);
//       res.json(result);
//     });

import type { AiGenerateParams, AiGenerateResponse } from '../../types/ai';
import { aiConfig } from './aiConfig';
import { mockGenerate } from './mockAiProvider';

/**
 * 生成营销文案。
 *
 * 用法：
 *   import { generateMarketingContent } from '../services/ai/aiService';
 *   const result = await generateMarketingContent(params);
 *   if (result.success) { ... }
 *
 * @param params AI 生成参数
 * @returns 包含 3 个版本的生成结果
 */
export async function generateMarketingContent(
  params: AiGenerateParams,
): Promise<AiGenerateResponse> {
  // ============================================================
  // Mock 模式：前端直接模拟生成
  // ============================================================
  if (!aiConfig.useRealApi) {
    return mockGenerate(params);
  }

  // ============================================================
  // 真实 API 模式：请求后端接口
  // ============================================================
  // 【安全提醒】
  // 真实大模型 API Key 绝对不能放在前端。
  // 前端通过后端转发请求，后端从环境变量读取 API Key。
  //
  // 以下代码是预留结构，当前不会执行（useRealApi = false）。

  try {
    const response = await fetch(aiConfig.backendApiUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        params,
        provider: aiConfig.provider,
      }),
    });

    if (!response.ok) {
      const err = await response.json().catch(() => ({ message: 'Unknown error' }));
      return {
        success: false,
        versions: [],
        generatedAt: new Date().toISOString(),
        provider: aiConfig.provider,
        error: err.message || `HTTP ${response.status}`,
      };
    }

    return response.json();
  } catch (e) {
    return {
      success: false,
      versions: [],
      generatedAt: new Date().toISOString(),
      provider: aiConfig.provider,
      error: e instanceof Error ? e.message : '网络请求失败',
    };
  }
}

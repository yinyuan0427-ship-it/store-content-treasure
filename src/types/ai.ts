// ============================================================
// src/types/ai.ts — AI 文案生成相关类型定义
// ============================================================

/** 目标发布平台 */
export type AiPlatform = '朋友圈' | '小红书' | '抖音' | '视频号' | '微信私聊';

/** 用户角色 */
export type AiRole = '门店老板' | '销售顾问' | '安装师傅' | '品牌运营';

/** 文案语气 */
export type AiTone = '高级专业' | '真实案例' | '轻松口语' | '毒舌观点' | '温暖感谢';

/** AI 服务提供商 */
export type AiProvider = 'mock' | 'openai' | 'claude' | 'deepseek' | 'qwen' | 'doubao';

/** 素材来源类型 */
export type AiSourceType = 'material' | 'delivery';

// ============================================================
// 请求参数
// ============================================================

export interface AiGenerateParams {
  /** 素材来源类型 */
  sourceType: AiSourceType;
  /** 素材 ID 或交付任务 ID */
  sourceId: string;
  /** 目标平台 */
  platform: AiPlatform;
  /** 发布者角色 */
  role: AiRole;
  /** 所在城市 */
  city: string;
  /** 门店名称 */
  storeName: string;
  /** 产品名称 */
  productName: string;
  /** 使用场景 */
  scene: string;
  /** 文案语气 */
  tone: AiTone;
  /** 是否加入个人感受 */
  personalTouch: boolean;
  /** 原始素材文案（素材库内容或交付故事） */
  sourceContent: string;
  /** 图片数量 */
  imageCount: number;
  /** 客户需求（交付案例场景） */
  customerNeeds?: string;
  /** 成交故事（交付案例场景） */
  deliveryStory?: string;
}

// ============================================================
// 返回结果
// ============================================================

export interface AiVersion {
  /** 版本序号 1-3 */
  index: number;
  /** 标题 */
  title: string;
  /** 正文 */
  body: string;
  /** 封面文案 */
  coverText: string;
  /** 推荐标签 */
  tags: string[];
  /** 推荐图片顺序 [1,3,2,4] 表示第1张放封面 */
  imageOrder: number[];
  /** 重复风险 */
  duplicateRisk: 'low' | 'medium' | 'high';
  /** 使用建议 */
  suggestions: string;
}

export interface AiGenerateResponse {
  /** 是否成功 */
  success: boolean;
  /** 3 个版本 */
  versions: AiVersion[];
  /** 生成耗时（mock 模拟） */
  generatedAt: string;
  /** 使用的 provider */
  provider: AiProvider;
  /** 错误信息 */
  error?: string;
}

// ============================================================
// 大模型 API 请求体（后端用，前端不直接调用）
// ============================================================

export interface AiApiRequest {
  provider: AiProvider;
  model: string;
  messages: AiMessage[];
  temperature: number;
  maxTokens: number;
}

export interface AiMessage {
  role: 'system' | 'user';
  content: string;
}

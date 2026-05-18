// ============================================================
// src/services/ai/promptTemplates.ts — 提示词模板
// ============================================================
//
// 这些模板用于构造发送给大模型的 System Prompt 和 User Prompt。
// 当前 mock 阶段不使用它们（mock 直接返回假数据），
// 但这些模板已经设计好，接真实大模型时可直接使用。
//
// 接真实 API 时的使用方式（在后端）：
//   const systemPrompt = SYSTEM_PROMPTS.base;
//   const userPrompt = buildUserPrompt(params, platformTemplate);
//   const response = await openai.chat.completions.create({
//     model: 'gpt-4o',
//     messages: [
//       { role: 'system', content: systemPrompt },
//       { role: 'user', content: userPrompt },
//     ],
//   });

import type { AiPlatform, AiRole, AiTone } from '../../types/ai';

// ============================================================
// System Prompts
// ============================================================

export const SYSTEM_PROMPTS = {
  /** 基础角色设定 */
  base: `你是一个专业的家居/床垫行业内容营销专家。你擅长为经销商、门店导购、安装师傅等角色生成适合在社交媒体上传播的文案内容。

你的核心能力：
1. 根据不同平台（朋友圈、小红书、抖音、视频号）生成符合平台调性的文案
2. 根据不同角色（老板、销售、安装师傅）切换不同口吻
3. 根据语气要求（高级专业、真实案例、轻松口语等）调整风格
4. 生成的文案必须真实可信，不夸大、不虚假宣传
5. 每次生成 3 个不同版本，让用户有选择空间

行业背景：
- 品牌：TEMPUR，主打中高端床垫
- 产品特点：独立袋装弹簧、天然乳胶、护脊设计
- 目标客户：25-50 岁关注睡眠质量的人群
- 价格区间：2000-8000 元`,

  /** 去重改写 */
  dedup: `你需要将以下文案改写成不同版本，保持核心信息不变但表达方式完全不同。
改写要求：
- 更换句式结构
- 更换用词和修辞
- 可以调整信息顺序
- 保持原文核心卖点和情感传递`,
};

// ============================================================
// Platform Templates — 各平台专属提示词
// ============================================================

export const PLATFORM_TEMPLATES: Record<AiPlatform, string> = {
  '朋友圈': `【朋友圈文案要求】
- 像朋友聊天一样的自然口吻，不要广告腔
- 80-200 字，适合快速阅读
- 配图建议：3-6 张图，首图最重要
- 可以适当使用 emoji
- 结尾可以加互动引导（如"你觉得呢？"）
- 适合晚上 8-10 点发布`,

  '小红书': `【小红书文案要求】
- 标题要有吸引力，使用 emoji 分段
- 正文 200-500 字，要有干货或真实感受
- 使用"姐妹们"、"我真的"等亲切口吻
- 必须带 #话题标签（3-5个）
- 配图建议：4-9 张竖图，首图（封面）最重要
- 内容要有种草感，不要太硬广
- 善用数字和emoji增加可读性`,

  '抖音': `【抖音脚本要求】
- 写出完整的口播脚本，包含时间标记
- 前 3 秒必须有吸引点（hook）
- 总时长建议 30-60 秒的文字量
- 配合画面描述
- 结尾引导点赞+关注+评论
- 口播风格：快节奏、有情绪起伏`,

  '视频号': `【视频号文案要求】
- 标题简洁有力，10-20 字
- 正文 50-150 字
- 风格介于朋友圈和小红书之间
- 可以适当正式一些
- 适合中青年客户群体阅读`,

  '微信私聊': `【微信私聊文案要求】
- 一对一沟通风格
- 短小精悍，50-100 字
- 突出个性化关怀
- 不要群发感
- 以关心客户使用体验为主`,

};

// ============================================================
// Role Templates — 各角色口吻
// ============================================================

export const ROLE_TEMPLATES: Record<AiRole, string> = {
  '门店老板': `【角色口吻：门店老板】
- 以门店老板的视角，更关注客户满意度和门店口碑
- 口吻介于专业和亲切之间
- 可以提到"我们店"、"来店里"等`,

  '销售顾问': `【角色口吻：销售顾问】
- 以服务客户的销售视角
- 口吻亲切、热情、可信赖
- 可以提到客户故事和成交过程
- 突出产品的实际体验感受`,

  '安装师傅': `【角色口吻：安装师傅】
- 以送货安装师傅的视角
- 口吻朴实、真实、接地气
- 内容聚焦送货现场、安装细节、客户反应
- 风格像"师傅的日常朋友圈"
- 不需要华丽辞藻，真实感最重要`,

  '品牌运营': `【角色口吻：品牌运营】
- 以品牌官方视角
- 口吻正式、高级、有品牌感
- 适合品牌宣传和活动推广`,

};

// ============================================================
// Tone Templates — 语气风格
// ============================================================

export const TONE_TEMPLATES: Record<AiTone, string> = {
  '高级专业': '使用专业但不晦涩的语言，突出产品的工艺、材质和技术优势。适合高端客户群体。',
  '真实案例': '以讲故事的方式呈现，用真实的客户案例和细节打动人。重点在于真实感和共鸣。',
  '轻松口语': '口语化表达，像朋友聊天一样自然。使用日常用语、网络用语，轻松有趣。',
  '毒舌观点': '犀利但不冒犯的风格，用反问和对比制造记忆点。如"睡了10年还不知道床垫里面有什么？"',
  '温暖感谢': '温暖感恩的语气，适合感谢客户、回顾案例、分享感动时刻。情感真挚。',
};

// ============================================================
// Builder — 构建完整 User Prompt
// ============================================================

export interface PromptContext {
  platform: AiPlatform;
  role: AiRole;
  tone: AiTone;
  city: string;
  storeName: string;
  productName: string;
  scene: string;
  personalTouch: boolean;
  sourceContent: string;
  imageCount: number;
  customerNeeds?: string;
  deliveryStory?: string;
}

/**
 * 构建发送给大模型的完整 User Prompt。
 * 当前 mock 阶段暂不使用，但接真实 API 时直接调用此函数。
 *
 * 示例（后端 Node.js）：
 *   const prompt = buildUserPrompt(context);
 *   const completion = await openai.chat.completions.create({ ... });
 */
export function buildUserPrompt(ctx: PromptContext): string {
  const parts: string[] = [];

  parts.push('请根据以下信息生成 3 个不同版本的社交媒体文案：');
  parts.push('');
  parts.push(`目标平台：${ctx.platform}`);
  parts.push(`发布角色：${ctx.role}`);
  parts.push(`语气风格：${ctx.tone}`);
  parts.push(`城市：${ctx.city}`);
  parts.push(`门店：${ctx.storeName}`);
  parts.push(`产品：${ctx.productName}`);
  parts.push(`场景：${ctx.scene}`);
  parts.push(`图片数量：${ctx.imageCount} 张`);
  parts.push(`加入个人感受：${ctx.personalTouch ? '是' : '否'}`);

  if (ctx.customerNeeds) {
    parts.push(`客户需求：${ctx.customerNeeds}`);
  }
  if (ctx.deliveryStory) {
    parts.push(`交付故事：${ctx.deliveryStory}`);
  }

  parts.push('');
  parts.push('原始素材内容：');
  parts.push(ctx.sourceContent);
  parts.push('');
  parts.push('--- 平台要求 ---');
  parts.push(PLATFORM_TEMPLATES[ctx.platform]);
  parts.push('');
  parts.push('--- 角色要求 ---');
  parts.push(ROLE_TEMPLATES[ctx.role]);
  parts.push('');
  parts.push('--- 语气要求 ---');
  parts.push(TONE_TEMPLATES[ctx.tone]);
  parts.push('');
  parts.push('请返回 JSON 格式，包含 3 个版本，每个版本包含 title、body、coverText、tags、imageOrder、duplicateRisk、suggestions。');

  return parts.join('\n');
}

// ============================================================
// 去重改写模板
// ============================================================

export const DEDUP_TEMPLATE = `
你需要将以下文案改写，保持核心信息不变但表达方式完全不同。
要求：
- 更换句式结构（如把陈述句改成反问句）
- 更换 50% 以上的用词
- 调整信息顺序
- 可以增加 1-2 个新的细节角度
- 保持原文长度基本一致
`;

// ============================================================
// 风险检查模板
// ============================================================

export const RISK_CHECK_TEMPLATE = `
请检查以下文案是否存在以下风险：
1. 夸大宣传（如"最好"、"第一"等绝对化用语）
2. 虚假承诺（如"保证治好"等医疗暗示）
3. 竞品贬低（直接点名竞品）
4. 价格误导
5. 隐私泄露（门牌号、手机号、人脸等）
6. 违反广告法

如有风险，请指出具体问题和修改建议。
`;

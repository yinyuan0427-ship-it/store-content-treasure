import type { DeliveryTask } from '../mock/data';
import { getStoryText, canShareCase } from '../mock/data';

/*
 * ============================================================
 * TODO: WeChat card sharing for SPAs
 *
 * WeChat's crawler runs with limited JS support.  In a pure Vite
 * SPA with a single index.html, WeChat may only scrape the default
 * <title> and <meta> tags — it won't see the per-route dynamic
 * meta we set with useEffect.
 *
 * Before production launch, pick one of:
 *   1. Server-side rendering (SSR) for /share/:caseId routes
 *   2. Pre-rendering / static HTML generation for share pages
 *   3. A lightweight Node/Edge backend that serves per-case <meta>
 *      when the User-Agent contains "MicroMessenger"
 *
 * Until then, setting document.title + og:* via useEffect is best
 * effort for non-WeChat previews (iMessage, Slack, etc.).
 * ============================================================
 */

// ── URL helpers ──

/** Returns the base URL for public share links. */
export function getShareBaseUrl(): string {
  return import.meta.env.VITE_PUBLIC_SHARE_BASE_URL || window.location.origin;
}

export interface ShareLinkParams {
  caseId: string;
  salesId?: string;
  storeId?: string;
  channel?: string;
  entry?: string;
  extra?: Record<string, string | undefined>;
}

export function buildShareQuery({
  caseId,
  salesId,
  storeId,
  channel = 'wechat_private',
  entry = 'case_share',
  extra,
}: ShareLinkParams): string {
  const params = new URLSearchParams();
  params.set('caseId', caseId);
  if (salesId) params.set('salesId', salesId);
  if (storeId) params.set('storeId', storeId);
  params.set('channel', channel);
  params.set('entry', entry);
  Object.entries(extra || {}).forEach(([key, value]) => {
    if (value) params.set(key, value);
  });
  return params.toString();
}

/** Build the public share URL for a single case. */
export function getShareUrl(
  taskId: string,
  salesId?: string,
  options?: Partial<Omit<ShareLinkParams, 'caseId' | 'salesId'>>,
): string {
  const query = buildShareQuery({
    caseId: taskId,
    salesId,
    storeId: options?.storeId,
    channel: options?.channel,
    entry: options?.entry,
    extra: options?.extra,
  });
  return `${getShareBaseUrl()}/share/${taskId}?${query}`;
}

// ── WeChat card meta generators ──
// These MUST NOT include city, storeName, district, or salesName.

/** Generate share title (≤30 chars). */
export function generateShareTitle(task: DeliveryTask): string {
  const scene = task.scene || '真实交付案例';
  const product = task.productName || `${task.brand} ${task.model}`;
  const candidate = `${scene}真实交付案例｜TEMPUR ${product}`;
  if (candidate.length <= 30) return candidate;
  // Truncate product name to fit
  const prefix = `${scene}真实交付案例｜`;
  const maxProductLen = 30 - prefix.length - 1;
  return prefix + (product.length > maxProductLen ? product.slice(0, maxProductLen) + '…' : product);
}

/** Generate share description (≤60 chars). */
export function generateShareDescription(task: DeliveryTask): string {
  const solution = task.productName || `${task.brand} ${task.model}`;
  const requirement = task.customerRequirement || '改善睡眠质量';

  const candidate = `客户想解决${requirement}的问题，最终选择了${solution}。`;
  if (candidate.length <= 60) return candidate;

  // Truncate requirement to fit
  const suffix = `的问题，最终选择了${solution}。`;
  const maxReqLen = 60 - suffix.length - 1;
  const shortReq = requirement.length > maxReqLen ? requirement.slice(0, maxReqLen) + '…' : requirement;
  return `客户想解决${shortReq}的问题，最终选择了${solution}。`;
}

/**
 * Return the best available share image URL.
 * data: URLs are useless for WeChat scraping — returns empty string
 * when no fetchable URL is available so callers can skip the tag.
 */
export function getShareImageUrl(task: DeliveryTask): string {
  const img = task.installImages[0];
  if (!img) return '';
  // data: URLs cannot be scraped by WeChat
  if (img.startsWith('data:')) return '';
  // If it's already an absolute URL (from a real CDN), return as-is
  if (img.startsWith('http://') || img.startsWith('https://')) return img;
  // Relative path — prepend base URL
  return `${getShareBaseUrl()}${img.startsWith('/') ? '' : '/'}${img}`;
}

// ── Meta tag DOM helpers ──
// Shared between CustomerCaseShare and CaseCollectionShare for
// dynamically setting <title> + og:* / schema.org meta tags.

interface ShareMeta {
  title: string;
  description: string;
  image: string;
  url: string;
}

const META_KEYS = [
  { selector: 'meta[name="description"]', attr: 'content' },
  { selector: 'meta[property="og:title"]', attr: 'content' },
  { selector: 'meta[property="og:description"]', attr: 'content' },
  { selector: 'meta[property="og:image"]', attr: 'content' },
  { selector: 'meta[property="og:url"]', attr: 'content' },
  { selector: 'meta[property="og:type"]', attr: 'content' },
  { selector: 'meta[itemprop="name"]', attr: 'content' },
  { selector: 'meta[itemprop="description"]', attr: 'content' },
  { selector: 'meta[itemprop="image"]', attr: 'content' },
];

const DEFAULT_META: ShareMeta = {
  title: '真实交付案例｜TEMPUR 睡眠方案',
  description: '本案例为真实交付案例，客户隐私信息已做处理。预约体验同款，咨询睡眠顾问。',
  image: '',
  url: '',
};

/**
 * Set all share-related meta tags in <head>.
 * Call from useEffect on share pages; clean up by calling with no args.
 */
export function setShareMeta(meta?: ShareMeta): void {
  const m = meta || DEFAULT_META;

  // document.title
  document.title = m.title;

  // Helper to set or remove a meta tag
  const upsertMeta = (selector: string, attr: string, value: string) => {
    let el = document.querySelector(selector) as HTMLMetaElement | null;
    if (!el) {
      el = document.createElement('meta');
      // Derive attributes from selector
      if (selector.includes('name=')) {
        el.setAttribute('name', selector.match(/name="([^"]+)"/)![1]);
      } else if (selector.includes('property=')) {
        el.setAttribute('property', selector.match(/property="([^"]+)"/)![1]);
      } else if (selector.includes('itemprop=')) {
        el.setAttribute('itemprop', selector.match(/itemprop="([^"]+)"/)![1]);
      }
      document.head.appendChild(el);
    }
    if (value) {
      el.setAttribute(attr, value);
    } else {
      el.removeAttribute(attr);
    }
  };

  upsertMeta('meta[name="description"]', 'content', m.description);
  upsertMeta('meta[property="og:title"]', 'content', m.title);
  upsertMeta('meta[property="og:description"]', 'content', m.description);
  if (m.image) {
    upsertMeta('meta[property="og:image"]', 'content', m.image);
  }
  upsertMeta('meta[property="og:url"]', 'content', m.url);
  upsertMeta('meta[property="og:type"]', 'content', 'article');
  upsertMeta('meta[itemprop="name"]', 'content', m.title);
  upsertMeta('meta[itemprop="description"]', 'content', m.description);
  if (m.image) {
    upsertMeta('meta[itemprop="image"]', 'content', m.image);
  }
}

// ── Customer share text (legacy, still useful for non-WeChat channels) ──

export function generateCustomerShareText(task: DeliveryTask, salesId: string): string {
  const solution = task.productName || `${task.brand} ${task.model}`;
  const requirement = task.customerRequirement || '想改善睡眠质量，找一款合适的床垫/枕头';
  const feedback = getStoryText(task) || '使用后睡眠质量明显改善，非常满意';

  const url = getShareUrl(task.id, salesId);

  return `您好，给您看一个真实交付案例：
【客户需求】${requirement}
【解决方案】${solution}
【真实反馈】${feedback}

这个案例已经做过隐私处理，您可以点开看看详情：
${url}

如果您愿意，也可以直接预约体验同款。`;
}

export function truncateForPoster(text: string, maxLen: number): string {
  if (text.length <= maxLen) return text;
  return text.slice(0, maxLen) + '…';
}

// ── Smart case recommendation engine ──

export interface RecommendedGroup {
  label: string;
  cases: DeliveryTask[];
}

/**
 * Build a ranked, grouped list of recommended cases based on a source case.
 * Returns up to 9 unique cases, with the source case positioned first.
 */
export function getRecommendedCases(
  sourceCase: DeliveryTask,
  allShareable: DeliveryTask[],
): { groups: RecommendedGroup[]; sourceCase: DeliveryTask } {

  // Candidates: all shareable cases EXCEPT the source
  const candidates = allShareable.filter(t => t.id !== sourceCase.id);

  // Scoring function
  const score = (t: DeliveryTask): number => {
    let s = 0;
    if (t.productModel && sourceCase.productModel && t.productModel === sourceCase.productModel) s += 100;
    if (t.model && sourceCase.model && t.model === sourceCase.model) s += 90;
    if (t.productSeries && sourceCase.productSeries && t.productSeries === sourceCase.productSeries) s += 70;
    if (t.productCategory && sourceCase.productCategory && t.productCategory === sourceCase.productCategory) s += 50;
    if (t.scene === sourceCase.scene) s += 30;
    // Keyword overlap in customerRequirement
    if (t.customerRequirement && sourceCase.customerRequirement) {
      const keywords = extractSleepKeywords(sourceCase.customerRequirement);
      for (const kw of keywords) {
        if (t.customerRequirement.includes(kw)) s += 10;
      }
    }
    // featured boost
    if (t.reviewStatus === 'featured') s += 15;
    return s;
  };

  const scored = candidates
    .map(t => ({ task: t, score: score(t) }))
    .sort((a, b) => b.score - a.score);

  // Build groups (no duplicates)
  const used = new Set<string>();

  const addGroup = (label: string, filter: (t: DeliveryTask) => boolean): RecommendedGroup => {
    const items: DeliveryTask[] = [];
    for (const { task } of scored) {
      if (used.has(task.id)) continue;
      if (filter(task)) {
        items.push(task);
        used.add(task.id);
      }
    }
    return { label, cases: items };
  };

  const sameModel = (t: DeliveryTask): boolean =>
    !!(sourceCase.productModel && t.productModel === sourceCase.productModel) ||
    !!(sourceCase.model && t.model === sourceCase.model);

  const sameSeries = (t: DeliveryTask): boolean =>
    !!(sourceCase.productSeries && t.productSeries === sourceCase.productSeries);

  const sameCategory = (t: DeliveryTask): boolean =>
    !!(sourceCase.productCategory && t.productCategory === sourceCase.productCategory);

  const sameScene = (t: DeliveryTask): boolean =>
    t.scene === sourceCase.scene;

  const groups: RecommendedGroup[] = [];

  // Group 1: 同款产品
  const g1 = addGroup('同款产品', sameModel);
  if (g1.cases.length > 0) groups.push(g1);

  // Group 2: 相似需求 (same series or category, but not already in 同款)
  const g2 = addGroup('相似需求', t => sameSeries(t) || sameCategory(t));
  if (g2.cases.length > 0) groups.push(g2);

  // Group 3: 同类场景 (same scene, not already used)
  const g3 = addGroup('同类场景', sameScene);
  if (g3.cases.length > 0) groups.push(g3);

  // Group 4: 更多推荐 (anything left with score > 0, fallback to any shareable)
  const g4 = addGroup('更多推荐', () => true);
  if (g4.cases.length > 0) groups.push(g4);

  // Limit total to 9 cases (not counting source)
  let count = 0;
  const trimmed: RecommendedGroup[] = [];
  for (const g of groups) {
    if (count >= 9) break;
    const allowed = Math.min(g.cases.length, 9 - count);
    if (allowed > 0) {
      trimmed.push({ label: g.label, cases: g.cases.slice(0, allowed) });
      count += allowed;
    }
  }

  return { groups: trimmed, sourceCase };
}

/** Extract common sleep/comfort keywords from requirement text. */
function extractSleepKeywords(text: string): string[] {
  const pool = [
    '腰', '背', '肩', '颈', '头', '腿', '臀', '脊椎', '颈椎', '腰椎',
    '侧睡', '仰睡', '趴睡', '翻身',
    '疼痛', '酸', '不舒服', '麻木', '僵硬',
    '支撑', '硬', '软', '塌陷', '弹簧',
    '失眠', '睡眠', '入睡', '打鼾', '透气', '闷热',
    '过敏', '螨虫', '环保', '静音', '抗干扰',
    '老人', '儿童', '孕妇', '宝宝',
  ];
  return pool.filter(kw => text.includes(kw));
}

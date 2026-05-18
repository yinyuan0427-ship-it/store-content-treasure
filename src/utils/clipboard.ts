// ============================================================
// 统一复制工具
// 兼容手机端微信/小红书内置浏览器的一键复制
// ============================================================

export type CopyMethod = 'clipboard' | 'execCommand' | 'none';

export interface CopyResult {
  success: boolean;
  method: CopyMethod;
  text: string;
}

/**
 * 尝试复制文本到剪贴板
 * 1. 优先 navigator.clipboard.writeText
 * 2. 兼容 textarea + execCommand('copy')
 * 3. 都失败则返回 success: false，由调用方弹窗显示文本
 */
export async function copyText(text: string): Promise<CopyResult> {
  // 方案 1：现代 Clipboard API
  if (navigator.clipboard && typeof navigator.clipboard.writeText === 'function') {
    try {
      await navigator.clipboard.writeText(text);
      return { success: true, method: 'clipboard', text };
    } catch {
      // 降级到方案 2
    }
  }

  // 方案 2：textarea + execCommand（兼容微信/小红书内置浏览器）
  try {
    const textarea = document.createElement('textarea');
    textarea.value = text;
    textarea.style.position = 'fixed';
    textarea.style.left = '-9999px';
    textarea.style.top = '-9999px';
    textarea.style.opacity = '0';
    // iOS 兼容：防止键盘弹出
    textarea.setAttribute('readonly', '');
    document.body.appendChild(textarea);

    // iOS 兼容：需要先 focus 再 select
    textarea.contentEditable = 'true';
    textarea.focus();
    textarea.select();

    // Android 兼容：设置 selection range
    if (navigator.userAgent.match(/android/i)) {
      textarea.setSelectionRange(0, text.length);
    }

    const ok = document.execCommand('copy');
    document.body.removeChild(textarea);

    if (ok) {
      return { success: true, method: 'execCommand', text };
    }
  } catch {
    // 降级到手动复制
  }

  return { success: false, method: 'none', text };
}

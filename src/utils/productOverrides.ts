import type { ProductKnowledge } from '../mock/productKnowledge';
import { productKnowledgeList, getProductKnowledgeById as getDefaultById, searchProductKnowledge as searchDefault } from '../mock/productKnowledge';
import { productImage } from './images';

const STORAGE_PREFIX = 'sct-admin-product-override-';
const CREATED_KEY = 'sct-admin-products-created';

// ========== ProductOverride (for built-in products) ==========

export interface ProductOverride {
  series?: string;
  model?: string;
  category?: string;
  firmness?: string;
  coreSellingPoints?: string[];
  fitCustomers?: string[];
  painPoints?: string[];
  salesScript?: string;
  objectionReplies?: Array<{ question: string; answer: string }>;
  customerPageCopy?: string;
  momentsCopy?: string;
  xhsCopy?: string;
  keywords?: string[];
  images?: string[];
}

export function getProductOverride(productId: string): ProductOverride | null {
  try {
    const raw = localStorage.getItem(`${STORAGE_PREFIX}${productId}`);
    if (raw) return JSON.parse(raw);
  } catch { /* ignore */ }
  return null;
}

export function saveProductOverride(productId: string, override: ProductOverride): void {
  const cleaned: Record<string, unknown> = {};
  for (const [k, v] of Object.entries(override)) {
    if (v !== undefined && v !== null && v !== '' && !(Array.isArray(v) && v.length === 0)) {
      cleaned[k] = v;
    }
  }
  localStorage.setItem(`${STORAGE_PREFIX}${productId}`, JSON.stringify(cleaned));
}

export function resetProductOverride(productId: string): void {
  try { localStorage.removeItem(`${STORAGE_PREFIX}${productId}`); } catch { /* ignore */ }
}

export function hasProductOverride(productId: string): boolean {
  return getProductOverride(productId) !== null;
}

export function mergeProductWithOverride(product: ProductKnowledge): ProductKnowledge {
  const override = getProductOverride(product.id);
  if (!override) return product;

  const images = (override.images && override.images.length > 0)
    ? override.images
    : [product.image];

  return {
    ...product,
    series: override.series ?? product.series,
    model: override.model ?? product.model,
    category: (override.category as ProductKnowledge['category']) ?? product.category,
    firmness: override.firmness ?? product.firmness,
    coreSellingPoints: override.coreSellingPoints ?? product.coreSellingPoints,
    fitCustomers: override.fitCustomers ?? product.fitCustomers,
    painPoints: override.painPoints ?? product.painPoints,
    salesScript: override.salesScript ?? product.salesScript,
    objectionReplies: override.objectionReplies ?? product.objectionReplies,
    customerPageCopy: override.customerPageCopy ?? product.customerPageCopy,
    momentsCopy: override.momentsCopy ?? product.momentsCopy,
    xhsCopy: override.xhsCopy ?? product.xhsCopy,
    keywords: override.keywords ?? product.keywords,
    image: images[0] || product.image,
    internalNotes: product.internalNotes,
    sourceDocs: product.sourceDocs,
    visibility: product.visibility,
  };
}

export function getProductImages(product: ProductKnowledge): string[] {
  const override = getProductOverride(product.id);
  if (override?.images && override.images.length > 0) {
    return override.images;
  }
  const img = product.image || productImage('tempur-mattress-01.jpg');
  return [img];
}

export function getProductMainImage(product: ProductKnowledge): string {
  return getProductImages(product)[0];
}

// ========== Created products (admin-created) ==========

export function getCreatedProducts(): ProductKnowledge[] {
  try {
    const raw = localStorage.getItem(CREATED_KEY);
    if (raw) return JSON.parse(raw);
  } catch { /* ignore */ }
  return [];
}

export function saveCreatedProduct(product: ProductKnowledge): void {
  const list = getCreatedProducts();
  const idx = list.findIndex(p => p.id === product.id);
  if (idx >= 0) {
    list[idx] = product;
  } else {
    list.push(product);
  }
  localStorage.setItem(CREATED_KEY, JSON.stringify(list));
}

export function deleteCreatedProduct(productId: string): void {
  const list = getCreatedProducts().filter(p => p.id !== productId);
  localStorage.setItem(CREATED_KEY, JSON.stringify(list));
  // Also clean up override data
  try { localStorage.removeItem(`${STORAGE_PREFIX}${productId}`); } catch { /* ignore */ }
}

export function isCreatedProduct(productId: string): boolean {
  return getCreatedProducts().some(p => p.id === productId);
}

export function getCreatedProductById(id: string): ProductKnowledge | undefined {
  return getCreatedProducts().find(p => p.id === id);
}

// ========== Unified product access ==========

export function getAllProducts(): ProductKnowledge[] {
  const defaults = productKnowledgeList.map(p => mergeProductWithOverride(p));
  const created = getCreatedProducts();
  return [...defaults, ...created];
}

export function getProductById(id?: string): ProductKnowledge | undefined {
  if (!id) return undefined;
  const created = getCreatedProductById(id);
  if (created) return created;
  const def = getDefaultById(id);
  if (!def) return undefined;
  return mergeProductWithOverride(def);
}

export function searchProducts(query: string): ProductKnowledge[] {
  const mergedDefaults = productKnowledgeList.map(p => mergeProductWithOverride(p));
  const created = getCreatedProducts();
  const all = [...mergedDefaults, ...created];
  const q = query.trim().toLowerCase();
  if (!q) return all;
  return all.filter(item =>
    [item.series, item.model, item.category, item.firmness || '', item.salesScript,
      item.customerPageCopy, item.momentsCopy, item.xhsCopy,
      ...item.coreSellingPoints, ...item.fitCustomers, ...item.painPoints, ...item.keywords,
    ].some(text => text.toLowerCase().includes(q))
  );
}

export function compressImage(file: File, maxWidth: number, quality: number): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      const img = new Image();
      img.onload = () => {
        const w = Math.min(img.width, maxWidth);
        const h = Math.round(img.height * (w / img.width));
        const canvas = document.createElement('canvas');
        canvas.width = w;
        canvas.height = h;
        const ctx = canvas.getContext('2d');
        if (!ctx) { reject(new Error('canvas context')); return; }
        ctx.drawImage(img, 0, 0, w, h);
        resolve(canvas.toDataURL('image/jpeg', quality));
      };
      img.onerror = () => reject(new Error('image load'));
      img.src = reader.result as string;
    };
    reader.onerror = () => reject(new Error('file read'));
    reader.readAsDataURL(file);
  });
}

export function createNewProductId(): string {
  return `custom-product-${Date.now()}`;
}

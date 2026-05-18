import { useState, useRef } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { getProductKnowledgeById } from '../mock/productKnowledge';
import {
  getProductOverride, saveProductOverride, resetProductOverride,
  mergeProductWithOverride, getProductImages, compressImage,
  saveCreatedProduct, deleteCreatedProduct, isCreatedProduct,
  getCreatedProductById, createNewProductId,
} from '../utils/productOverrides';
import type { ProductOverride } from '../utils/productOverrides';
import type { ProductKnowledge } from '../mock/productKnowledge';
import { useToast } from '../App';
import {
  ArrowLeft, Upload, RotateCcw, Save, Star, X, Plus, Trash2,
} from 'lucide-react';

function SectionHeader({ title }: { title: string }) {
  return <h2 className="text-sm font-semibold text-gray-800 mb-2.5">{title}</h2>;
}

function ConfirmModal({ message, onConfirm, onClose }: { message: string; onConfirm: () => void; onClose: () => void }) {
  return (
    <div className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center px-8">
      <div className="bg-white rounded-2xl p-6 w-full max-w-sm shadow-xl">
        <p className="text-sm text-gray-800 mb-4">{message}</p>
        <div className="flex gap-2">
          <button onClick={onClose} className="flex-1 h-10 bg-surface-50 text-surface-600 rounded-xl text-sm font-medium">取消</button>
          <button onClick={onConfirm} className="flex-1 h-10 bg-red-500 text-white rounded-xl text-sm font-medium">确定删除</button>
        </div>
      </div>
    </div>
  );
}

export default function AdminProductEdit() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { showToast } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const isNew = id === 'new';
  const defaultProduct = !isNew ? getProductKnowledgeById(id) : undefined;
  const createdProduct = (!isNew && !defaultProduct) ? getCreatedProductById(id!) : undefined;

  // Determine the source product and mode
  let sourceProduct: ProductKnowledge | undefined;
  let mode: 'new' | 'default' | 'created';
  if (isNew) {
    sourceProduct = undefined;
    mode = 'new';
  } else if (createdProduct) {
    sourceProduct = createdProduct;
    mode = 'created';
  } else if (defaultProduct) {
    sourceProduct = defaultProduct;
    mode = 'default';
  } else {
    return (
      <div className="min-h-screen bg-surface-50 flex items-center justify-center px-5">
        <div className="text-center">
          <p className="text-gray-700 font-semibold mb-4">产品不存在</p>
          <button onClick={() => navigate('/admin/products')} className="text-navy-700 font-medium">返回产品列表</button>
        </div>
      </div>
    );
  }

  // Initialize form state
  const merged = mode === 'default' ? mergeProductWithOverride(sourceProduct!) : sourceProduct;
  const existingOverride = mode === 'default' ? getProductOverride(sourceProduct!.id) : null;

  const [series, setSeries] = useState(merged?.series || '');
  const [model, setModel] = useState(merged?.model || '');
  const [category, setCategory] = useState<string>(merged?.category || '床垫');
  const [firmness, setFirmness] = useState(merged?.firmness || '');
  const [sellingPoints, setSellingPoints] = useState(merged?.coreSellingPoints?.join('\n') || '');
  const [fitCustomers, setFitCustomers] = useState(merged?.fitCustomers?.join('\n') || '');
  const [painPoints, setPainPoints] = useState(merged?.painPoints?.join('\n') || '');
  const [salesScript, setSalesScript] = useState(merged?.salesScript || '');
  const [objectionText, setObjectionText] = useState(
    merged?.objectionReplies?.map(r => `问题：${r.question}\n回答：${r.answer}`).join('\n\n') || ''
  );
  const [customerPageCopy, setCustomerPageCopy] = useState(merged?.customerPageCopy || '');
  const [momentsCopy, setMomentsCopy] = useState(merged?.momentsCopy || '');
  const [xhsCopy, setXhsCopy] = useState(merged?.xhsCopy || '');
  const [keywords, setKeywords] = useState(merged?.keywords?.join(', ') || '');

  const defaultImages = sourceProduct ? getProductImages(sourceProduct) : [];
  const initImages = (() => {
    if (mode === 'default' && existingOverride?.images && existingOverride.images.length > 0) {
      return existingOverride.images;
    }
    if (mode === 'created' && sourceProduct) {
      const ov = getProductOverride(sourceProduct.id);
      if (ov?.images && ov.images.length > 0) return ov.images;
      return sourceProduct.image ? [sourceProduct.image] : [];
    }
    return merged?.image ? [merged.image] : [];
  })();
  const [images, setImages] = useState<string[]>(initImages);
  const [saving, setSaving] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  const mainImage = images[0] || '';
  const hasOverride = mode === 'default' && existingOverride !== null;

  const handleChooseImages = () => fileInputRef.current?.click();

  const handleFilesSelected = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (files.length === 0) return;
    const remaining = 6 - images.length;
    if (remaining <= 0) { showToast('最多保存 6 张图片'); return; }
    const toAdd = files.slice(0, remaining);
    setSaving(true);
    const compressed: string[] = [];
    for (const file of toAdd) {
      try {
        compressed.push(await compressImage(file, 1200, 0.82));
      } catch {
        showToast('图片过大，请换一张或压缩后上传');
      }
    }
    setImages(prev => [...prev, ...compressed].slice(0, 6));
    setSaving(false);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleSetMain = (index: number) => {
    if (index === 0) return;
    setImages(prev => {
      const next = [...prev];
      const [item] = next.splice(index, 1);
      next.unshift(item);
      return next;
    });
  };

  const handleDeleteImage = (index: number) => {
    setImages(prev => {
      const next = prev.filter((_, i) => i !== index);
      return next.length === 0 ? defaultImages : next;
    });
  };

  const parseLines = (text: string): string[] =>
    text.split('\n').map(s => s.trim()).filter(Boolean);

  const parseObjectionReplies = (text: string): Array<{ question: string; answer: string }> => {
    const result: Array<{ question: string; answer: string }> = [];
    const blocks = text.split(/\n{2,}/);
    for (const block of blocks) {
      const lines = block.split('\n');
      let question = '';
      let answer = '';
      for (const line of lines) {
        const trimmed = line.trim();
        if (trimmed.startsWith('问题：') || trimmed.startsWith('问题:')) {
          question = trimmed.replace(/^问题[：:]\s*/, '');
        } else if (trimmed.startsWith('回答：') || trimmed.startsWith('回答:')) {
          answer = trimmed.replace(/^回答[：:]\s*/, '');
        } else if (!question) {
          question = trimmed;
        } else {
          answer += (answer ? '\n' : '') + trimmed;
        }
      }
      if (question && answer) result.push({ question, answer });
    }
    return result.length > 0 ? result : (merged?.objectionReplies || []);
  };

  const handleSave = () => {
    if (!series.trim()) { showToast('请填写系列'); return; }
    if (!model.trim()) { showToast('请填写型号'); return; }
    if (!category.trim()) { showToast('请填写分类'); return; }

    if (mode === 'default' && sourceProduct) {
      const override: ProductOverride = {
        series, model, category,
        firmness: firmness || undefined,
        coreSellingPoints: parseLines(sellingPoints),
        fitCustomers: parseLines(fitCustomers),
        painPoints: parseLines(painPoints),
        salesScript,
        objectionReplies: parseObjectionReplies(objectionText),
        customerPageCopy, momentsCopy, xhsCopy,
        keywords: keywords.split(/[,，\n]/).map(s => s.trim()).filter(Boolean),
        images,
      };
      try {
        saveProductOverride(sourceProduct.id, override);
        showToast('产品资料已保存');
      } catch {
        showToast('图片过大，请换一张或压缩后上传');
      }
    } else if (mode === 'created' && sourceProduct) {
      const updated: ProductKnowledge = {
        ...sourceProduct,
        series, model,
        category: category as ProductKnowledge['category'],
        firmness: firmness || undefined,
        coreSellingPoints: parseLines(sellingPoints),
        fitCustomers: parseLines(fitCustomers),
        painPoints: parseLines(painPoints),
        salesScript,
        objectionReplies: parseObjectionReplies(objectionText),
        customerPageCopy, momentsCopy, xhsCopy,
        keywords: keywords.split(/[,，\n]/).map(s => s.trim()).filter(Boolean),
        image: images[0] || '',
      };
      const override: ProductOverride = { images: images.length > 0 ? images : undefined };
      try {
        saveCreatedProduct(updated);
        saveProductOverride(sourceProduct.id, override);
        showToast('产品资料已保存');
      } catch {
        showToast('图片过大，请换一张或压缩后上传');
      }
    } else if (mode === 'new') {
      const newId = createNewProductId();
      const newProduct: ProductKnowledge = {
        id: newId,
        series, model,
        category: (category || '床垫') as ProductKnowledge['category'],
        firmness: firmness || undefined,
        coreSellingPoints: parseLines(sellingPoints),
        fitCustomers: parseLines(fitCustomers),
        painPoints: parseLines(painPoints),
        salesScript,
        objectionReplies: parseObjectionReplies(objectionText),
        customerPageCopy, momentsCopy, xhsCopy,
        keywords: keywords.split(/[,，\n]/).map(s => s.trim()).filter(Boolean),
        image: images[0] || '',
        internalNotes: '',
        sourceDocs: [],
        visibility: 'public',
      };
      const override: ProductOverride = { images: images.length > 0 ? images : undefined };
      try {
        saveCreatedProduct(newProduct);
        saveProductOverride(newId, override);
        showToast('产品已新增');
        navigate('/admin/products');
      } catch {
        showToast('图片过大，请换一张或压缩后上传');
      }
    }
  };

  const handleReset = () => {
    if (mode === 'default' && sourceProduct) {
      resetProductOverride(sourceProduct.id);
      setSeries(sourceProduct.series);
      setModel(sourceProduct.model);
      setCategory(sourceProduct.category);
      setFirmness(sourceProduct.firmness || '');
      setSellingPoints(sourceProduct.coreSellingPoints.join('\n'));
      setFitCustomers(sourceProduct.fitCustomers.join('\n'));
      setPainPoints(sourceProduct.painPoints.join('\n'));
      setSalesScript(sourceProduct.salesScript);
      setObjectionText(sourceProduct.objectionReplies.map(r => `问题：${r.question}\n回答：${r.answer}`).join('\n\n'));
      setCustomerPageCopy(sourceProduct.customerPageCopy);
      setMomentsCopy(sourceProduct.momentsCopy);
      setXhsCopy(sourceProduct.xhsCopy);
      setKeywords(sourceProduct.keywords.join(', '));
      setImages(defaultImages);
      showToast('已恢复默认资料');
    }
  };

  const handleDelete = () => {
    if (mode === 'created' && sourceProduct) {
      deleteCreatedProduct(sourceProduct.id);
      showToast('产品已删除');
      navigate('/admin/products');
    }
  };

  const pageTitle = isNew ? '新增产品资料' : '编辑产品资料';
  const saveLabel = isNew ? '保存新增产品' : '保存修改';
  const canDelete = mode === 'created';
  const canReset = mode === 'default' && hasOverride;

  return (
    <div className="min-h-screen bg-surface-50 flex flex-col">
      <div className="bg-navy-900 text-white px-4 pt-12 pb-4">
        <div className="flex items-center gap-3 mb-2">
          <button onClick={() => navigate('/admin/products')} className="w-8 h-8 rounded-full bg-white/15 flex items-center justify-center">
            <ArrowLeft size={18} />
          </button>
          <h1 className="text-lg font-semibold">{pageTitle}</h1>
        </div>
      </div>

      <div className="flex-1 px-4 pt-4 pb-24 space-y-4">

        {/* 基础信息 */}
        <div className="bg-white rounded-2xl p-4 shadow-card space-y-3">
          <SectionHeader title="基础信息" />
          <div>
            <label className="text-[11px] text-surface-400 mb-1 block">系列 {isNew && <span className="text-red-400">*</span>}</label>
            <input value={series} onChange={e => setSeries(e.target.value)} placeholder="如：TEMPUR Pro 梵璞·怡然" className="w-full h-10 px-3 bg-surface-50 border border-surface-200 rounded-xl text-sm text-gray-900 focus:outline-none focus:border-navy-400 placeholder-surface-300" />
          </div>
          <div>
            <label className="text-[11px] text-surface-400 mb-1 block">型号 {isNew && <span className="text-red-400">*</span>}</label>
            <input value={model} onChange={e => setModel(e.target.value)} placeholder="如：怡然-软" className="w-full h-10 px-3 bg-surface-50 border border-surface-200 rounded-xl text-sm text-gray-900 focus:outline-none focus:border-navy-400 placeholder-surface-300" />
          </div>
          <div>
            <label className="text-[11px] text-surface-400 mb-1 block">分类 {isNew && <span className="text-red-400">*</span>}</label>
            <input value={category} onChange={e => setCategory(e.target.value)} placeholder="床垫 / 枕头 / 智能床 / 配件" className="w-full h-10 px-3 bg-surface-50 border border-surface-200 rounded-xl text-sm text-gray-900 focus:outline-none focus:border-navy-400 placeholder-surface-300" />
          </div>
          <div>
            <label className="text-[11px] text-surface-400 mb-1 block">软硬度</label>
            <input value={firmness} onChange={e => setFirmness(e.target.value)} placeholder="如：软 / 中 / 中偏硬 / 硬" className="w-full h-10 px-3 bg-surface-50 border border-surface-200 rounded-xl text-sm text-gray-900 focus:outline-none focus:border-navy-400 placeholder-surface-300" />
          </div>
        </div>

        {/* 产品图片 */}
        <div className="bg-white rounded-2xl p-4 shadow-card space-y-3">
          <SectionHeader title="产品图片" />

          {mainImage && (
            <div>
              <p className="text-[11px] text-surface-400 mb-1.5">当前产品主图</p>
              <div className="aspect-[4/3] rounded-xl overflow-hidden bg-surface-100">
                <img src={mainImage} alt="主图" className="w-full h-full object-cover" />
              </div>
            </div>
          )}

          {images.length > 1 && (
            <div>
              <p className="text-[11px] text-surface-400 mb-1.5">全部图片 ({images.length}/6)</p>
              <div className="grid grid-cols-3 gap-2">
                {images.map((src, i) => (
                  <div key={i} className="relative aspect-square rounded-xl overflow-hidden bg-surface-100 group">
                    <img src={src} alt={`图${i + 1}`} className="w-full h-full object-cover" />
                    <div className="absolute inset-x-0 bottom-0 flex">
                      {i > 0 && (
                        <button onClick={() => handleSetMain(i)} className="flex-1 py-1.5 bg-black/40 text-white text-[10px] font-medium flex items-center justify-center gap-0.5">
                          <Star size={10} />设为主图
                        </button>
                      )}
                      <button onClick={() => handleDeleteImage(i)} className="flex-1 py-1.5 bg-black/40 text-red-300 text-[10px] font-medium flex items-center justify-center gap-0.5">
                        <X size={10} />删除
                      </button>
                    </div>
                    {i === 0 && (
                      <div className="absolute top-1.5 left-1.5 px-1.5 py-0.5 rounded bg-navy-800/70 text-white text-[10px]">主图</div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          <input ref={fileInputRef} type="file" accept="image/*" multiple onChange={handleFilesSelected} className="hidden" />
          <button
            onClick={handleChooseImages}
            disabled={images.length >= 6 || saving}
            className={`w-full h-12 rounded-xl text-sm font-semibold flex items-center justify-center gap-2 ${
              images.length >= 6 ? 'bg-surface-100 text-surface-400' : 'bg-navy-800 text-white active:bg-navy-900'
            }`}
          >
            <Upload size={18} />
            {images.length >= 6 ? '已达上限 6 张' : saving ? '压缩中...' : '从相册选择图片'}
          </button>
        </div>

        {/* 核心卖点 */}
        <div className="bg-white rounded-2xl p-4 shadow-card space-y-2">
          <SectionHeader title="核心卖点" />
          <p className="text-[10px] text-surface-400">每行一条</p>
          <textarea value={sellingPoints} onChange={e => setSellingPoints(e.target.value)} rows={4} className="w-full px-3 py-2 bg-surface-50 border border-surface-200 rounded-xl text-sm text-gray-900 focus:outline-none focus:border-navy-400 resize-none" />
        </div>

        {/* 适合客户 */}
        <div className="bg-white rounded-2xl p-4 shadow-card space-y-2">
          <SectionHeader title="适合客户" />
          <p className="text-[10px] text-surface-400">每行一条</p>
          <textarea value={fitCustomers} onChange={e => setFitCustomers(e.target.value)} rows={4} className="w-full px-3 py-2 bg-surface-50 border border-surface-200 rounded-xl text-sm text-gray-900 focus:outline-none focus:border-navy-400 resize-none" />
        </div>

        {/* 客户痛点 */}
        <div className="bg-white rounded-2xl p-4 shadow-card space-y-2">
          <SectionHeader title="客户痛点" />
          <p className="text-[10px] text-surface-400">每行一条</p>
          <textarea value={painPoints} onChange={e => setPainPoints(e.target.value)} rows={4} className="w-full px-3 py-2 bg-surface-50 border border-surface-200 rounded-xl text-sm text-gray-900 focus:outline-none focus:border-navy-400 resize-none" />
        </div>

        {/* 导购介绍话术 */}
        <div className="bg-white rounded-2xl p-4 shadow-card space-y-2">
          <SectionHeader title="导购介绍话术" />
          <textarea value={salesScript} onChange={e => setSalesScript(e.target.value)} rows={5} className="w-full px-3 py-2 bg-surface-50 border border-surface-200 rounded-xl text-sm text-gray-900 focus:outline-none focus:border-navy-400 resize-none" />
        </div>

        {/* 客户常见疑问 */}
        <div className="bg-white rounded-2xl p-4 shadow-card space-y-2">
          <SectionHeader title="客户常见疑问" />
          <p className="text-[10px] text-surface-400">每段格式：问题：xxx / 回答：xxx，空行分隔下一组</p>
          <textarea value={objectionText} onChange={e => setObjectionText(e.target.value)} rows={6} className="w-full px-3 py-2 bg-surface-50 border border-surface-200 rounded-xl text-sm text-gray-900 focus:outline-none focus:border-navy-400 resize-none" />
        </div>

        {/* 客户页展示文案 */}
        <div className="bg-white rounded-2xl p-4 shadow-card space-y-2">
          <SectionHeader title="客户页展示文案" />
          <textarea value={customerPageCopy} onChange={e => setCustomerPageCopy(e.target.value)} rows={3} className="w-full px-3 py-2 bg-surface-50 border border-surface-200 rounded-xl text-sm text-gray-900 focus:outline-none focus:border-navy-400 resize-none" />
        </div>

        {/* 朋友圈文案 */}
        <div className="bg-white rounded-2xl p-4 shadow-card space-y-2">
          <SectionHeader title="朋友圈文案" />
          <textarea value={momentsCopy} onChange={e => setMomentsCopy(e.target.value)} rows={4} className="w-full px-3 py-2 bg-surface-50 border border-surface-200 rounded-xl text-sm text-gray-900 focus:outline-none focus:border-navy-400 resize-none" />
        </div>

        {/* 小红书文案 */}
        <div className="bg-white rounded-2xl p-4 shadow-card space-y-2">
          <SectionHeader title="小红书文案" />
          <textarea value={xhsCopy} onChange={e => setXhsCopy(e.target.value)} rows={4} className="w-full px-3 py-2 bg-surface-50 border border-surface-200 rounded-xl text-sm text-gray-900 focus:outline-none focus:border-navy-400 resize-none" />
        </div>

        {/* 搜索关键词 */}
        <div className="bg-white rounded-2xl p-4 shadow-card space-y-2">
          <SectionHeader title="搜索关键词" />
          <p className="text-[10px] text-surface-400">逗号或换行分隔</p>
          <textarea value={keywords} onChange={e => setKeywords(e.target.value)} rows={3} className="w-full px-3 py-2 bg-surface-50 border border-surface-200 rounded-xl text-sm text-gray-900 focus:outline-none focus:border-navy-400 resize-none" />
        </div>
      </div>

      {/* 底部操作栏 */}
      <div className="fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-app bg-white/95 backdrop-blur border-t border-surface-100 z-40 safe-bottom px-4 py-3 space-y-2">
        <button
          onClick={handleSave}
          className="w-full h-12 bg-navy-800 text-white font-semibold rounded-xl text-sm flex items-center justify-center gap-2 active:bg-navy-900"
        >
          <Save size={18} />{saveLabel}
        </button>
        {canReset && (
          <button onClick={handleReset} className="w-full h-11 text-surface-500 font-medium rounded-xl text-sm flex items-center justify-center gap-1.5 active:bg-surface-50">
            <RotateCcw size={16} />恢复默认资料
          </button>
        )}
        {canDelete && (
          <button onClick={() => setShowDeleteConfirm(true)} className="w-full h-11 text-red-500 font-medium rounded-xl text-sm flex items-center justify-center gap-1.5 active:bg-red-50">
            <Trash2 size={16} />删除产品
          </button>
        )}
      </div>

      {showDeleteConfirm && (
        <ConfirmModal
          message="确定删除这个产品资料吗？"
          onConfirm={handleDelete}
          onClose={() => setShowDeleteConfirm(false)}
        />
      )}
    </div>
  );
}

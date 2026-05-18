import { useNavigate } from 'react-router-dom';
import { useState } from 'react';
import type { Material } from '../mock/data';
import { isCaseMaterial, hasUnlockedCaseMaterial, canSpendCaseCoins, spendCaseCoins, CASE_COIN_RULES } from '../mock/data';
import { useAuth, useToast } from '../App';
import InsufficientCoinsModal from './InsufficientCoinsModal';
import { Star, Copy, Image, Sparkles, Tag } from 'lucide-react';

interface Props {
  material: Material;
  onCopy?: (text: string) => void;
  onToggleFavorite?: (id: string) => void;
  isFavorited?: boolean;
  compact?: boolean;
  showCaseCoinActions?: boolean;
}

const productCategoryColors: Record<string, string> = {
  '床垫': 'bg-blue-50 text-blue-600 border border-blue-100',
  '枕头': 'bg-purple-50 text-purple-600 border border-purple-100',
  '智能床': 'bg-teal-50 text-teal-600 border border-teal-100',
};

export default function MaterialCard({ material, onCopy, onToggleFavorite, isFavorited, compact, showCaseCoinActions = true }: Props) {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { showToast } = useToast();

  const [showInsufficientModal, setShowInsufficientModal] = useState(false);

  const handleSaveImage = () => {
    if (!showCaseCoinActions || !isCaseMaterial(material)) {
      navigate(`/save-images/${material.id}`);
      return;
    }
    if (!user) return;
    if (hasUnlockedCaseMaterial(user.phone, material.id)) {
      navigate(`/save-images/${material.id}`);
      return;
    }
    const cost = Math.abs(CASE_COIN_RULES.save_case_set);
    if (!canSpendCaseCoins(user.phone, cost)) {
      setShowInsufficientModal(true);
      return;
    }
    const ok = spendCaseCoins(user.phone, CASE_COIN_RULES.save_case_set, 'save_set', `保存案例全套图片：${material.title}`, undefined, material.id);
    if (ok) {
      showToast(`已消耗 ${cost} 案例币，可保存案例高清图片。`);
      navigate(`/save-images/${material.id}`);
    }
  };

  const isCase = isCaseMaterial(material);
  const unlocked = user && hasUnlockedCaseMaterial(user.phone, material.id);
  const showWatermark = showCaseCoinActions && isCase && !unlocked;

  const platformColors: Record<string, string> = {
    '微信朋友圈': 'bg-green-50 text-green-600 border border-green-100',
    '小红书': 'bg-red-50 text-red-500 border border-red-100',
    '抖音': 'bg-gray-800 text-white',
    '视频号': 'bg-orange-50 text-orange-600 border border-orange-100',
    '线下销售': 'bg-blue-50 text-blue-600 border border-blue-100',
    '门店展示': 'bg-purple-50 text-purple-600 border border-purple-100',
  };

  if (compact) {
    return (
      <div
        onClick={() => navigate(`/material/${material.id}`)}
        className="bg-white rounded-2xl overflow-hidden shadow-card active:scale-[0.98] transition-transform cursor-pointer"
      >
        <div className="aspect-[16/10] overflow-hidden relative">
          <img src={material.images[0]} alt={material.title} className="w-full h-full object-cover" loading="lazy" />
          {showWatermark && (
            <div className="absolute inset-0 pointer-events-none">
              <div className="absolute bottom-0 left-0 right-0 bg-black/30 backdrop-blur-[1px] py-1 px-2">
                <p className="text-white/70 text-[10px] text-center">内部预览 · 保存高清无水印图需案例币</p>
              </div>
            </div>
          )}
        </div>
        <div className="p-3">
          <div className="flex gap-1.5 mb-1.5 flex-wrap">
            {material.productName && (
              <span className={`text-[10px] px-1.5 py-0.5 rounded-full font-medium ${productCategoryColors[material.productCategory] || 'bg-surface-100 text-surface-500 border border-surface-200'}`}>
                {material.productName}{material.productCategory ? ` · ${material.productCategory}` : ''}
              </span>
            )}
            {material.platforms.slice(0, 1).map((p) => (
              <span key={p} className={`text-[10px] px-1.5 py-0.5 rounded-full font-medium ${platformColors[p] || 'bg-gray-100 text-gray-600'}`}>
                {p}
              </span>
            ))}
          </div>
          <h3 className="text-sm font-semibold text-gray-900 line-clamp-1">{material.title}</h3>
          <p className="text-xs text-surface-500 mt-1 line-clamp-2">{material.content}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-2xl overflow-hidden shadow-card border border-surface-100/50">
      <div
        onClick={() => navigate(`/material/${material.id}`)}
        className="flex gap-3 p-3 cursor-pointer active:bg-surface-50"
      >
        <div className="w-[100px] h-[100px] rounded-xl overflow-hidden flex-shrink-0 bg-surface-100 relative">
          <img src={material.images[0]} alt={material.title} className="w-full h-full object-cover" loading="lazy" />
          {showWatermark && (
            <div className="absolute inset-0 pointer-events-none">
              <div className="absolute bottom-0 left-0 right-0 bg-black/30 backdrop-blur-[1px] py-0.5">
                <p className="text-white/50 text-[8px] text-center leading-tight">内部预览</p>
              </div>
            </div>
          )}
        </div>
        <div className="flex-1 min-w-0 flex flex-col justify-between">
          <div>
            <div className="flex gap-1.5 mb-1.5 flex-wrap">
              {material.platforms.map((p) => (
                <span key={p} className={`text-[10px] px-1.5 py-0.5 rounded-full font-medium ${platformColors[p] || 'bg-gray-100 text-gray-600'}`}>
                  {p}
                </span>
              ))}
              <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-blue-50 text-blue-600 font-medium">{material.scene}</span>
            </div>
            {/* Product tag */}
            {material.productName && (
              <div className="mb-1.5">
                <span className={`text-[10px] px-2 py-0.5 rounded-full font-medium ${productCategoryColors[material.productCategory] || 'bg-surface-100 text-surface-500 border border-surface-200'}`}>
                  <Tag size={10} className="inline mr-0.5" />
                  {material.productName}{material.productCategory ? ` · ${material.productCategory}` : ''}
                </span>
              </div>
            )}
            <h3 className="text-sm font-semibold text-gray-900 line-clamp-2 leading-snug">{material.title}</h3>
            <p className="text-xs text-surface-500 mt-1 line-clamp-2">{material.content}</p>
          </div>
        </div>
        {onToggleFavorite && (
          <button
            onClick={(e) => { e.stopPropagation(); onToggleFavorite(material.id); }}
            className="flex-shrink-0 self-start p-1"
          >
            <Star size={18} fill={isFavorited ? '#f5a932' : 'none'} stroke={isFavorited ? '#f5a932' : '#d1d5db'} />
          </button>
        )}
      </div>

      {/* Action bar */}
      <div className="flex border-t border-surface-100">
        {showCaseCoinActions && (
          <>
            <button
              onClick={handleSaveImage}
              className="flex-1 py-2.5 text-xs font-medium text-surface-500 active:bg-surface-50 transition-colors flex items-center justify-center gap-1"
            >
              <Image size={14} />
              保存图片{unlocked ? ' ✓已解锁' : isCase ? ` -${Math.abs(CASE_COIN_RULES.save_case_set)}币` : ''}
            </button>
            <div className="w-px bg-surface-100" />
          </>
        )}
        <button
          onClick={() => onCopy?.(material.content)}
          className="flex-1 py-2.5 text-xs font-medium text-navy-700 active:bg-navy-50 transition-colors flex items-center justify-center gap-1"
        >
          <Copy size={14} />
          复制文案
        </button>
        <div className="w-px bg-surface-100" />
        <button
          onClick={() => navigate(`/ai-generate/material/${material.id}`)}
          className="flex-1 py-2.5 text-xs font-medium text-purple-600 active:bg-purple-50 transition-colors flex items-center justify-center gap-1"
        >
          <Sparkles size={14} />
          AI改写
        </button>
      </div>

      {showInsufficientModal && (
        <InsufficientCoinsModal onClose={() => setShowInsufficientModal(false)} />
      )}
    </div>
  );
}

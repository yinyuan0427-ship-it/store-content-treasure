import { useParams, useNavigate } from 'react-router-dom';
import { useState } from 'react';
import { mockMaterials, isCaseMaterial, hasUnlockedCaseMaterial, canSpendCaseCoins, spendCaseCoins, CASE_COIN_RULES } from '../mock/data';
import { useToast, useFavorites, useAuth } from '../App';
import CopyModal from '../components/CopyModal';
import InsufficientCoinsModal from '../components/InsufficientCoinsModal';
import { copyText } from '../utils/clipboard';
import { ArrowLeft, Star, Copy, Image, Lightbulb, Sparkles } from 'lucide-react';

export default function MaterialDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { showToast } = useToast();
  const { toggleFavorite, isFavorited } = useFavorites();
  const { user } = useAuth();
  const [currentImg, setCurrentImg] = useState(0);
  const [showInsufficientModal, setShowInsufficientModal] = useState(false);

  const material = mockMaterials.find(m => m.id === id);

  if (!material) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-surface-50">
        <div className="text-center">
          <p className="text-surface-400 text-lg mb-4">素材不存在</p>
          <button onClick={() => navigate('/library')} className="text-navy-700 font-medium">返回素材库</button>
        </div>
      </div>
    );
  }

  const isCase = isCaseMaterial(material);
  const unlocked = user && hasUnlockedCaseMaterial(user.phone, material.id);
  const showWatermark = isCase && !unlocked;

  const handleSaveAll = () => {
    if (!isCase) {
      navigate(`/save-images/${material.id}`);
      return;
    }
    if (!user) return;
    if (unlocked) {
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

  const platformColors: Record<string, string> = {
    '微信朋友圈': 'bg-green-50 text-green-700 border border-green-100',
    '小红书': 'bg-red-50 text-red-500 border border-red-100',
    '抖音': 'bg-gray-800 text-white',
    '视频号': 'bg-orange-50 text-orange-600 border border-orange-100',
    '线下销售': 'bg-blue-50 text-blue-700 border border-blue-100',
    '门店展示': 'bg-purple-50 text-purple-700 border border-purple-100',
  };

  const [copyModalText, setCopyModalText] = useState('');

  const handleCopy = async (text: string, _label?: string) => {
    const result = await copyText(text);
    if (result.success) {
      showToast('已复制，可直接粘贴发布');
    } else {
      setCopyModalText(text);
    }
  };

  const favorited = isFavorited(material.id);

  return (
    <div className="min-h-screen bg-surface-50 flex flex-col">
      {/* ── Image Carousel ── */}
      <div className="relative bg-navy-900">
        <button onClick={() => navigate(-1)}
          className="absolute top-12 left-4 z-10 w-9 h-9 bg-black/40 backdrop-blur rounded-full flex items-center justify-center text-white">
          <ArrowLeft size={20} />
        </button>
        <button
          onClick={() => toggleFavorite(material.id)}
          className="absolute top-12 right-4 z-10 w-9 h-9 bg-black/40 backdrop-blur rounded-full flex items-center justify-center"
        >
          <Star size={20} fill={favorited ? '#f5a932' : 'none'} stroke={favorited ? '#f5a932' : 'white'} />
        </button>

        <div className="image-carousel w-full aspect-[4/3] no-scrollbar" onScroll={(e) => {
          const el = e.currentTarget;
          const idx = Math.round(el.scrollLeft / el.clientWidth);
          setCurrentImg(idx);
        }}>
          {material.images.map((img, i) => (
            <div key={i} className="w-full flex-shrink-0 relative">
              <img src={img} alt={`${material.title} - 图${i + 1}`} className="w-full aspect-[4/3] object-cover" />
              {showWatermark && (
                <div className="absolute bottom-0 left-0 right-0 bg-black/35 backdrop-blur-[2px] py-2 px-4">
                  <p className="text-white/60 text-xs text-center">内部预览 · 保存高清无水印图需案例币</p>
                </div>
              )}
            </div>
          ))}
        </div>

        <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-1.5">
          {material.images.map((_, i) => (
            <div key={i} className={`w-1.5 h-1.5 rounded-full transition-all ${i === currentImg ? 'bg-white w-4' : 'bg-white/50'}`} />
          ))}
        </div>
      </div>

      {/* ── Content ── */}
      <div className="flex-1 px-4 pt-4 pb-24 space-y-4">
        {/* Title & Tags */}
        <div>
          <h1 className="text-lg font-bold text-gray-900">{material.title}</h1>
          <div className="flex gap-1.5 mt-2 flex-wrap">
            {material.platforms.map((p) => (
              <span key={p} className={`text-xs px-2 py-0.5 rounded-full font-medium ${platformColors[p] || 'bg-surface-100 text-surface-500'}`}>
                {p}
              </span>
            ))}
            <span className="text-xs px-2 py-0.5 rounded-full bg-blue-50 text-blue-600 font-medium">{material.scene}</span>
            {material.productName && (
              <span className="text-xs px-2 py-0.5 rounded-full bg-navy-50 text-navy-700 font-medium border border-navy-100">
                {material.productName}{material.productCategory ? ` · ${material.productCategory}` : ''}
              </span>
            )}
          </div>
        </div>

        {/* 朋友圈文案 */}
        <div className="bg-white rounded-2xl p-4 shadow-card">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-sm font-semibold text-gray-700">朋友圈文案</h3>
            <button
              onClick={() => handleCopy(material.content, '文案')}
              className="text-xs text-navy-700 font-medium flex items-center gap-1 active:text-navy-800"
            >
              <Copy size={14} />
              复制
            </button>
          </div>
          <p className="text-sm text-surface-600 whitespace-pre-wrap leading-relaxed">{material.content}</p>
        </div>

        {/* 小红书文案 */}
        {material.xhsContent && (
          <div className="bg-white rounded-2xl p-4 shadow-card">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-sm font-semibold text-gray-700">小红书文案</h3>
              <button
                onClick={() => handleCopy(material.xhsContent!, '小红书文案')}
                className="text-xs text-navy-700 font-medium flex items-center gap-1 active:text-navy-800"
              >
                <Copy size={14} />
                复制
              </button>
            </div>
            <p className="text-sm text-surface-600 whitespace-pre-wrap leading-relaxed">{material.xhsContent}</p>
          </div>
        )}

        {/* 抖音脚本 */}
        {material.dyScript && (
          <div className="bg-white rounded-2xl p-4 shadow-card">
            <h3 className="text-sm font-semibold text-gray-700 mb-2">抖音脚本</h3>
            <pre className="text-xs text-surface-600 whitespace-pre-wrap leading-relaxed font-sans">{material.dyScript}</pre>
          </div>
        )}

        {/* Usage Tip */}
        <div className="bg-warm-50 border border-warm-200 rounded-2xl p-4">
          <div className="flex items-start gap-2">
            <Lightbulb size={16} className="text-warm-500 flex-shrink-0 mt-0.5" />
            <div>
              <h3 className="text-sm font-semibold text-warm-800">使用提醒</h3>
              <p className="text-xs text-warm-700 mt-1 leading-relaxed">{material.usageTip}</p>
            </div>
          </div>
        </div>

        {/* Image count */}
        <div className="flex items-center gap-2 text-xs text-surface-400">
          <Image size={14} />
          共 {material.images.length} 张图片
        </div>

        {/* AI Generate */}
        <div className="bg-white rounded-2xl p-4 shadow-card border border-purple-100">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-semibold text-gray-700 flex items-center gap-1.5">
                <Sparkles size={16} className="text-purple-500" />
                AI 文案生成
              </h3>
              <p className="text-xs text-surface-400 mt-0.5">用 AI 改写成不同平台风格</p>
            </div>
            <button
              onClick={() => navigate(`/ai-generate/material/${material.id}`)}
              className="px-4 py-2 bg-navy-800 text-white font-semibold rounded-xl text-sm active:bg-navy-900 transition-all flex items-center gap-1.5"
            >
              <Sparkles size={14} />
              去生成
            </button>
          </div>
        </div>
      </div>

      {/* ── Bottom Actions ── */}
      <div className="fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-app bg-white/95 backdrop-blur border-t border-surface-100 z-40 safe-bottom">
        <div className="flex items-center gap-2 px-4 py-3">
          <button
            onClick={handleSaveAll}
            className="flex-1 h-11 bg-navy-800 text-white font-semibold rounded-xl text-sm active:bg-navy-900 transition-colors shadow-lg shadow-navy-200 flex items-center justify-center gap-1.5"
          >
            <Image size={16} />
            保存全部图片{unlocked ? ' · 已解锁' : isCase ? ` · -${Math.abs(CASE_COIN_RULES.save_case_set)}案例币` : ''}
          </button>
          {material.xhsContent ? (
            <>
              <button
                onClick={() => handleCopy(material.content, '朋友圈文案')}
                className="flex-1 h-11 bg-green-500 text-white font-semibold rounded-xl text-sm active:bg-green-600 transition-colors flex items-center justify-center gap-1.5"
              >
                <Copy size={15} />
                朋友圈
              </button>
              <button
                onClick={() => handleCopy(material.xhsContent!, '小红书文案')}
                className="flex-1 h-11 bg-red-500 text-white font-semibold rounded-xl text-sm active:bg-red-600 transition-colors flex items-center justify-center gap-1.5"
              >
                <Copy size={15} />
                小红书
              </button>
            </>
          ) : (
            <button
              onClick={() => handleCopy(material.content, '文案')}
              className="flex-1 h-11 bg-navy-50 text-navy-700 font-semibold rounded-xl text-sm active:bg-navy-100 transition-colors flex items-center justify-center gap-1.5"
            >
              <Copy size={15} />
              复制文案
            </button>
          )}
        </div>
      </div>

      {copyModalText && (
        <CopyModal text={copyModalText} onClose={() => setCopyModalText('')} />
      )}
      {showInsufficientModal && (
        <InsufficientCoinsModal onClose={() => setShowInsufficientModal(false)} />
      )}
    </div>
  );
}

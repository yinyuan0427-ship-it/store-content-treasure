import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { getPublicCases } from '../mock/data';
import { Search, Camera, ShieldCheck, Shield, ChevronRight, MapPin, Store, Sparkles, Phone } from 'lucide-react';

const cities = ['全部', '苏州', '南京', '无锡', '上海'];
const brands = ['全部', 'TEMPUR'];
const sceneLabels = ['全部', '新房装修', '客户卧室', '婚房', '老人房', '高端改善'];

export default function Cases() {
  const navigate = useNavigate();
  const cases = getPublicCases();

  const [city, setCity] = useState('全部');
  const [brand, setBrand] = useState('全部');
  const [scene, setScene] = useState('全部');

  const filtered = cases.filter((c) => {
    if (city !== '全部' && c.city !== city) return false;
    if (brand !== '全部' && c.brand !== brand) return false;
    if (scene !== '全部' && c.sceneLabel !== scene) return false;
    return true;
  });

  return (
    <div className="min-h-screen bg-surface-50">
      {/* ── Brand Hero ── */}
      <div className="hero-gradient soft-glow relative overflow-hidden px-5 pt-14 pb-8">
        <div className="absolute top-0 right-0 w-48 h-48 bg-blue-400/8 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-32 h-32 bg-amber-400/6 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10">
          <h1 className="text-2xl font-bold text-white tracking-tight">真实交付案例</h1>
          <p className="text-blue-200/70 text-sm mt-2 leading-relaxed">
            真实门店交付案例，已做客户隐私脱敏处理
          </p>

          {/* Trust badges */}
          <div className="flex gap-3 mt-5">
            <div className="flex items-center gap-1.5 bg-white/10 backdrop-blur rounded-full px-3 py-1.5 border border-white/5">
              <Camera size={13} className="text-blue-300" />
              <span className="text-blue-200/80 text-xs">全部实拍</span>
            </div>
            <div className="flex items-center gap-1.5 bg-white/10 backdrop-blur rounded-full px-3 py-1.5 border border-white/5">
              <ShieldCheck size={13} className="text-blue-300" />
              <span className="text-blue-200/80 text-xs">已通过审核</span>
            </div>
            <div className="flex items-center gap-1.5 bg-white/10 backdrop-blur rounded-full px-3 py-1.5 border border-white/5">
              <Shield size={13} className="text-blue-300" />
              <span className="text-blue-200/80 text-xs">隐私已脱敏</span>
            </div>
          </div>
        </div>
      </div>

      {/* ── Filters ── */}
      <div className="px-5 py-4 space-y-3 bg-white border-b border-surface-200">
        <div>
          <p className="text-[11px] font-semibold text-surface-400 uppercase tracking-wider mb-2">城市</p>
          <div className="flex gap-2 overflow-x-auto no-scrollbar">
            {cities.map((c) => (
              <button key={c} onClick={() => setCity(c)}
                className={`flex-shrink-0 px-4 py-2 rounded-full text-sm font-medium transition-all ${
                  city === c ? 'bg-navy-800 text-white shadow-sm' : 'bg-surface-50 text-surface-500 active:bg-surface-100'
                }`}>{c}</button>
            ))}
          </div>
        </div>
        <div>
          <p className="text-[11px] font-semibold text-surface-400 uppercase tracking-wider mb-2">品牌</p>
          <div className="flex gap-2 overflow-x-auto no-scrollbar">
            {brands.map((b) => (
              <button key={b} onClick={() => setBrand(b)}
                className={`flex-shrink-0 px-4 py-2 rounded-full text-sm font-medium transition-all ${
                  brand === b ? 'bg-navy-800 text-white shadow-sm' : 'bg-surface-50 text-surface-500 active:bg-surface-100'
                }`}>{b}</button>
            ))}
          </div>
        </div>
        <div>
          <p className="text-[11px] font-semibold text-surface-400 uppercase tracking-wider mb-2">场景</p>
          <div className="flex gap-2 overflow-x-auto no-scrollbar">
            {sceneLabels.map((s) => (
              <button key={s} onClick={() => setScene(s)}
                className={`flex-shrink-0 px-4 py-2 rounded-full text-sm font-medium transition-all ${
                  scene === s ? 'bg-navy-800 text-white shadow-sm' : 'bg-surface-50 text-surface-500 active:bg-surface-100'
                }`}>{s}</button>
            ))}
          </div>
        </div>
      </div>

      {/* ── Case Cards ── */}
      <div className="px-5 pt-5 pb-8 space-y-5">
        {filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-surface-400">
            <Search size={40} strokeWidth={1} className="mb-3" />
            <p className="text-sm">暂无匹配案例</p>
            <p className="text-xs mt-1">试试调整筛选条件</p>
          </div>
        ) : (
          filtered.map((c) => (
            <div key={c.id} className="bg-white rounded-2xl overflow-hidden shadow-card border border-surface-100/50">
              {/* Images carousel */}
              <div className="image-carousel no-scrollbar">
                {c.images.slice(0, 4).map((img, i) => (
                  <div key={i} className="w-full flex-shrink-0 aspect-[4/3]">
                    <img src={img} alt={`${c.sceneLabel} - 图${i + 1}`} className="w-full h-full object-cover" loading="lazy" />
                  </div>
                ))}
              </div>

              <div className="p-4">
                {/* Tags row */}
                <div className="flex gap-1.5 flex-wrap mb-3">
                  <span className="text-[10px] px-2.5 py-0.5 rounded-full bg-navy-800 text-white font-medium flex items-center gap-1">
                    <MapPin size={10} />{c.city}
                  </span>
                  <span className="text-[10px] px-2.5 py-0.5 rounded-full bg-warm-50 text-warm-700 font-medium border border-warm-200">
                    {c.brand} {c.model}
                  </span>
                  <span className="text-[10px] px-2.5 py-0.5 rounded-full bg-blue-50 text-blue-600 font-medium">{c.sceneLabel}</span>
                </div>

                {/* Story title */}
                {c.storyTitle && (
                  <h2 className="text-base font-bold text-gray-900 mb-2 leading-snug">{c.storyTitle}</h2>
                )}

                {/* Highlights */}
                {c.highlights.length > 0 && (
                  <div className="flex gap-1.5 flex-wrap mb-2.5">
                    {c.highlights.map((h, i) => (
                      <span key={i} className="text-xs text-surface-500 flex items-center gap-1">
                        <Sparkles size={10} className="text-warm-500" />
                        {h}
                      </span>
                    ))}
                  </div>
                )}

                {/* Story snippet */}
                {c.story && (
                  <p className="text-sm text-surface-500 leading-relaxed line-clamp-3">{c.story}</p>
                )}

                {/* Requirement tags */}
                {c.requirementTags.length > 0 && (
                  <div className="flex gap-1.5 mt-3 flex-wrap">
                    {c.requirementTags.map((tag, i) => (
                      <span key={i} className="text-[10px] px-2.5 py-1 rounded-lg bg-surface-50 text-surface-500 font-medium">{tag}</span>
                    ))}
                  </div>
                )}

                {/* Source */}
                <div className="flex items-center gap-1 mt-3 text-xs text-surface-400">
                  <Store size={12} />
                  <span>{c.storeName}</span>
                  <span>·</span>
                  <span>{c.salesName}</span>
                </div>

                {/* Actions */}
                <div className="flex gap-2 mt-4">
                  <button onClick={() => navigate(`/cases/${c.id}`)}
                    className="flex-1 h-11 bg-navy-800 text-white font-semibold rounded-xl text-sm active:bg-navy-900 transition-colors flex items-center justify-center gap-1">
                    查看详情
                    <ChevronRight size={16} />
                  </button>
                  <button onClick={() => navigate(`/lead-form/${c.id}`)}
                    className="flex-1 h-11 bg-white border-2 border-navy-800 text-navy-800 font-semibold rounded-xl text-sm active:bg-navy-50 transition-colors flex items-center justify-center gap-1">
                    <Phone size={14} />
                    预约体验同款
                  </button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* ── Footer ── */}
      <div className="bg-navy-900 px-5 py-10 text-center">
        <div className="flex items-center justify-center gap-2 mb-3">
          <Store size={20} className="text-warm-400" />
          <span className="text-white font-bold text-lg tracking-tight">门店案例宝</span>
        </div>
        <p className="text-navy-300 text-xs leading-relaxed">真实案例 · 隐私保护 · 专业睡眠顾问</p>
        <div className="mt-4 pt-4 border-t border-white/5">
          <p className="text-navy-400 text-[11px]">本页面展示的案例均为真实门店交付案例</p>
          <p className="text-navy-400 text-[11px] mt-1">已对隐私信息进行脱敏处理，请放心浏览</p>
        </div>
      </div>
    </div>
  );
}

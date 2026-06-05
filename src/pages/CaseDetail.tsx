import { useParams, useNavigate, useSearchParams } from 'react-router-dom';
import { mockPublicCases } from '../mock/data';
import { ArrowLeft, ShieldCheck, ChevronRight, Sparkles, Phone } from 'lucide-react';

export default function CaseDetail() {
  const { caseId } = useParams<{ caseId: string }>();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const salesId = searchParams.get('salesId');

  const c = mockPublicCases.find(item => item.id === caseId);

  if (!c) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-surface-50">
        <div className="text-center">
          <p className="text-surface-400 mb-4">案例不存在</p>
          <button onClick={() => navigate('/cases')} className="text-navy-800 font-semibold">浏览更多案例 →</button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-surface-50">
      {/* ── Image Carousel ── */}
      <div className="relative bg-navy-900">
        <button onClick={() => navigate(-1)}
          className="absolute top-12 left-4 z-10 w-9 h-9 bg-black/40 backdrop-blur rounded-full flex items-center justify-center text-white">
          <ArrowLeft size={20} />
        </button>

        <div className="image-carousel w-full aspect-[4/3] no-scrollbar">
          {c.images.map((img, i) => (
            <div key={i} className="w-full flex-shrink-0">
              <img src={img} alt={`${c.storyTitle} - 图${i + 1}`} className="w-full aspect-[4/3] object-cover" />
            </div>
          ))}
        </div>

        <div className="absolute bottom-3 right-4 bg-black/50 backdrop-blur rounded-full px-2.5 py-1 text-white text-xs">
          1 / {c.images.length}
        </div>
      </div>

      {/* ── Content ── */}
      <div className="px-5 pt-5 pb-24 space-y-5">
        {/* Scene */}
        <div>
          <div className="flex gap-2 mb-3">
            <span className="text-xs px-2.5 py-1 rounded-full bg-blue-50 text-blue-600 font-medium">{c.sceneLabel}</span>
          </div>
          <h1 className="text-xl font-bold text-gray-900 leading-tight">{c.storyTitle}</h1>
        </div>

        {/* Product Info Card */}
        <div className="bg-white rounded-2xl p-4 shadow-card space-y-3">
          <div className="flex justify-between text-sm">
            <span className="text-surface-400">品牌型号</span>
            <span className="text-gray-900 font-semibold">{c.brand} · {c.model}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-surface-400">产品尺寸</span>
            <span className="text-gray-900">{c.size}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-surface-400">使用场景</span>
            <span className="text-gray-900">{c.scene}</span>
          </div>
        </div>

        {/* Case Story */}
        <div className="bg-white rounded-2xl p-4 shadow-card">
          <h2 className="text-base font-bold text-gray-900 mb-3 flex items-center gap-2">
            <span className="w-1 h-4 bg-navy-800 rounded-full" />
            案例故事
          </h2>
          <p className="text-sm text-surface-600 leading-relaxed whitespace-pre-wrap">{c.story}</p>
          {c.highlights.length > 0 && (
            <div className="flex gap-2 flex-wrap mt-4">
              {c.highlights.map((h, i) => (
                <span key={i} className="text-xs px-3 py-1.5 rounded-xl bg-warm-50 text-warm-700 font-medium border border-warm-200 flex items-center gap-1">
                  <Sparkles size={12} className="text-warm-500" />
                  {h}
                </span>
              ))}
            </div>
          )}
        </div>

        {/* Service Flow */}
        <div className="bg-white rounded-2xl p-4 shadow-card">
          <h2 className="text-base font-bold text-gray-900 mb-3 flex items-center gap-2">
            <span className="w-1 h-4 bg-navy-800 rounded-full" />
            服务流程
          </h2>
          <div className="flex items-center gap-2 overflow-x-auto no-scrollbar">
            {c.serviceFlow.map((step, i) => (
              <div key={i} className="flex items-center gap-2 flex-shrink-0">
                <div className="flex items-center gap-2 bg-surface-50 rounded-xl px-3 py-2.5">
                  <span className="w-5 h-5 rounded-full bg-navy-800 text-white text-[10px] flex items-center justify-center font-bold">{i + 1}</span>
                  <span className="text-xs text-gray-700 font-medium whitespace-nowrap">{step}</span>
                </div>
                {i < c.serviceFlow.length - 1 && (
                  <ChevronRight size={16} className="text-surface-300" />
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Privacy Notice */}
        <div className="bg-navy-50 rounded-2xl p-4 flex items-center gap-3 border border-navy-100">
          <ShieldCheck size={18} className="text-navy-600 flex-shrink-0" />
          <p className="text-xs text-navy-700 leading-relaxed">
            本案例为真实交付案例，已对隐私信息进行脱敏处理
          </p>
        </div>
      </div>

      {/* ── Bottom Actions ── */}
      <div className="fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-app bg-white/95 backdrop-blur border-t border-surface-100 z-40 safe-bottom">
        <div className="flex gap-2 px-4 py-3">
          <button
            onClick={() => navigate(`/lead-form/${c.id}${salesId ? `?salesId=${salesId}` : ''}`)}
            className="flex-1 h-12 bg-navy-800 text-white font-semibold rounded-xl text-sm active:bg-navy-900 transition-colors shadow-lg shadow-navy-200 flex items-center justify-center gap-1.5"
          >
            <Phone size={16} />
            预约到店体验
          </button>
          <button
            onClick={() => navigate(`/lead-form/${c.id}${salesId ? `?salesId=${salesId}` : ''}`)}
            className="flex-1 h-12 bg-white border-2 border-navy-800 text-navy-800 font-semibold rounded-xl text-sm active:bg-navy-50 transition-colors"
          >
            咨询同款产品
          </button>
        </div>
      </div>
    </div>
  );
}

import { useState } from 'react';
import { useParams, useNavigate, useSearchParams } from 'react-router-dom';
import { addShareLead, getAllDeliveryTasks, mockPublicCases } from '../mock/data';
import { ArrowLeft, CheckCircle2, Shield, Phone, MapPin, ShoppingBag, FileText, Store } from 'lucide-react';

const interestTypes = [
  '预约到店试睡',
  '咨询同款方案',
  '获取更多案例',
  '其他咨询',
];

export default function LeadForm() {
  const { caseId } = useParams<{ caseId: string }>();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const sourceSalesId = searchParams.get('salesId') || '';
  const interestParam = searchParams.get('interestType') || '';

  const sourceData =
    mockPublicCases.find(c => c.id === caseId) ||
    getAllDeliveryTasks().find(t => t.id === caseId);

  const [alias, setAlias] = useState('');
  const [phone, setPhone] = useState('');
  const [city, setCity] = useState(sourceData?.city || '');
  const [product, setProduct] = useState(sourceData ? `${sourceData.brand} ${sourceData.model}` : '');
  const [interest, setInterest] = useState(interestParam || '');
  const [remark, setRemark] = useState('');
  const [agreed, setAgreed] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  if (!sourceData) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-surface-50">
        <div className="text-center">
          <p className="text-surface-400 mb-4">案例不存在</p>
          <button onClick={() => navigate('/cases')} className="text-navy-700 font-semibold">浏览更多案例</button>
        </div>
      </div>
    );
  }

  const handleSubmit = () => {
    if (!alias.trim()) return;
    if (!phone.trim() || phone.length < 11) return;
    if (!city.trim()) return;
    if (!interest) return;
    if (!agreed) return;

    addShareLead({
      alias: alias.trim(),
      phone: phone.trim(),
      city: city.trim(),
      remark: remark.trim(),
      sourceCaseId: sourceData.id,
      sourceStoreId: sourceData.storeId,
      sourceStoreName: sourceData.storeName,
      sourceSalesId: sourceSalesId || sourceData.salesId,
      interestProduct: product.trim() || `${sourceData.brand} ${sourceData.model}`,
      interestType: interest,
      sourceAction: interest === '咨询同款方案' ? 'consult_same_product' : 'book_visit',
      createdAt: new Date().toISOString(),
    });
    setSubmitted(true);
  };

  if (submitted) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center px-5">
        <div className="text-center max-w-sm w-full">
          <div className="w-20 h-20 bg-green-50 rounded-full flex items-center justify-center mx-auto mb-6">
            <CheckCircle2 size={40} className="text-green-600" />
          </div>
          <h1 className="text-xl font-bold text-gray-900 mb-2">已收到您的咨询</h1>
          <p className="text-surface-500 text-sm leading-relaxed mb-1">睡眠顾问会尽快联系您</p>
          <p className="text-xs text-surface-400 mb-2">请保持手机畅通</p>

          <div className="bg-surface-50 rounded-xl p-3 text-left mb-6">
            <div className="flex items-center gap-2 mb-1">
              <Store size={14} className="text-surface-400" />
              <span className="text-xs text-surface-600">{sourceData.storeName}</span>
            </div>
            <div className="flex items-center gap-2">
              <MapPin size={14} className="text-surface-400" />
              <span className="text-xs text-surface-600">{sourceData.city}</span>
            </div>
          </div>

          <button onClick={() => navigate('/cases')}
            className="w-full h-12 bg-navy-800 text-white font-semibold rounded-xl text-sm active:bg-navy-900 transition-colors">
            浏览更多案例
          </button>
        </div>
      </div>
    );
  }

  const sourceCaseLabel = `${sourceData.city} · ${sourceData.brand} ${sourceData.model}`;

  return (
    <div className="min-h-screen bg-white">
      <div className="px-5 pt-14 pb-5">
        <button onClick={() => navigate(-1)} className="text-surface-400 mb-4">
          <ArrowLeft size={22} />
        </button>
        <h1 className="text-xl font-bold text-gray-900">预约咨询</h1>
        <p className="text-surface-400 text-sm mt-1">留下联系方式，专业睡眠顾问为您服务</p>

        <div className="mt-3 bg-surface-50 rounded-xl px-3 py-2 text-xs text-surface-500 flex items-center gap-2">
          <FileText size={14} className="text-surface-400" />
          <span>来源案例：</span>
          <span className="font-medium text-gray-700">{sourceCaseLabel}</span>
        </div>
      </div>

      <div className="px-5 pb-8 space-y-4">
        <div>
          <label className="text-sm font-semibold text-gray-700 mb-1.5 block">
            您的称呼 <span className="text-red-400">*</span>
          </label>
          <input type="text" value={alias} onChange={(e) => setAlias(e.target.value)}
            placeholder="如：王女士" className="w-full h-11 px-3 bg-surface-50 border border-surface-200 rounded-xl text-sm focus:outline-none focus:border-navy-400 transition-colors" />
        </div>

        <div>
          <label className="text-sm font-semibold text-gray-700 mb-1.5 block">
            手机号 <span className="text-red-400">*</span>
          </label>
          <div className="flex items-center gap-2 bg-surface-50 border border-surface-200 rounded-xl px-3 focus-within:border-navy-400 transition-colors">
            <Phone size={14} className="text-surface-400" />
            <input type="tel" value={phone} onChange={(e) => setPhone(e.target.value)}
              placeholder="请输入手机号" className="flex-1 h-11 bg-transparent text-sm focus:outline-none" />
          </div>
        </div>

        <div>
          <label className="text-sm font-semibold text-gray-700 mb-1.5 block">
            所在城市 <span className="text-red-400">*</span>
          </label>
          <div className="flex items-center gap-2 bg-surface-50 border border-surface-200 rounded-xl px-3 focus-within:border-navy-400 transition-colors">
            <MapPin size={14} className="text-surface-400" />
            <input type="text" value={city} onChange={(e) => setCity(e.target.value)}
              placeholder="如：苏州" className="flex-1 h-11 bg-transparent text-sm focus:outline-none" />
          </div>
        </div>

        <div>
          <label className="text-sm font-semibold text-gray-700 mb-1.5 block">意向产品</label>
          <div className="flex items-center gap-2 bg-surface-50 border border-surface-200 rounded-xl px-3 focus-within:border-navy-400 transition-colors">
            <ShoppingBag size={14} className="text-surface-400" />
            <input type="text" value={product} onChange={(e) => setProduct(e.target.value)}
              className="flex-1 h-11 bg-transparent text-sm focus:outline-none" />
          </div>
        </div>

        <div>
          <label className="text-sm font-semibold text-gray-700 mb-2 block">
            想了解什么 <span className="text-red-400">*</span>
          </label>
          <div className="space-y-2">
            {interestTypes.map((t) => (
              <button key={t} onClick={() => setInterest(t)}
                className={`w-full py-2.5 rounded-xl text-sm font-medium border text-left px-3 transition-all ${
                  interest === t ? 'bg-navy-800 border-navy-800 text-white' : 'bg-surface-50 border-surface-200 text-surface-500'
                }`}>{t}</button>
            ))}
          </div>
        </div>

        <div>
          <label className="text-sm font-semibold text-gray-700 mb-1.5 block">
            备注 <span className="text-xs text-surface-400 font-normal">（可选）</span>
          </label>
          <textarea value={remark} onChange={(e) => setRemark(e.target.value)}
            placeholder="如有特殊需求可在此说明"
            rows={2} className="w-full px-3 py-2.5 bg-surface-50 border border-surface-200 rounded-xl text-sm resize-none focus:outline-none focus:border-navy-400 transition-colors" />
        </div>

        <div className="bg-warm-50 border border-warm-100 rounded-xl p-4 flex items-start gap-2">
          <Shield size={16} className="text-warm-500 flex-shrink-0 mt-0.5" />
          <p className="text-xs text-warm-700 leading-relaxed">
            我们仅用于门店睡眠顾问联系您，不会公开展示您的个人信息。
          </p>
        </div>

        <button onClick={() => setAgreed(!agreed)} className="flex items-start gap-3 w-full text-left">
          <div className={`w-5 h-5 rounded border-2 flex items-center justify-center flex-shrink-0 mt-0.5 transition-colors ${
            agreed ? 'bg-navy-800 border-navy-800' : 'border-surface-300'
          }`}>
            {agreed && (
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none">
                <path d="M5 12l4 4L19 7" stroke="white" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            )}
          </div>
          <span className={`text-sm leading-relaxed ${agreed ? 'text-gray-700 font-medium' : 'text-surface-500'}`}>
            我同意门店通过电话或微信联系我 <span className="text-red-400">*</span>
          </span>
        </button>

        <button onClick={handleSubmit}
          disabled={!alias.trim() || phone.trim().length < 11 || !city.trim() || !interest || !agreed}
          className="w-full h-12 bg-navy-800 text-white font-semibold rounded-xl text-base active:bg-navy-900 transition-colors shadow-sm disabled:opacity-40 disabled:cursor-not-allowed">
          提交咨询
        </button>
      </div>
    </div>
  );
}

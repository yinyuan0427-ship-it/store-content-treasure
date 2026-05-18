import { useMemo } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import {
  getShareableCasesBySeries, getShareableCasesByCity, getShareableCasesByScene,
  addShareLead, mockSalesPersons,
} from '../mock/data';
import {
  Store, MapPin, Shield, CheckCircle2, Camera, Phone,
  MessageCircle, ChevronLeft, Star, ChevronRight, ShoppingBag,
} from 'lucide-react';
import { useState } from 'react';
import { copyText } from '../utils/clipboard';
import { Copy, QrCode, UserPlus } from 'lucide-react';

export default function CaseCollectionShare() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const salesId = searchParams.get('salesId') || '';
  const sourceStoreId = searchParams.get('sourceStoreId') || '';
  const sourceStoreName = searchParams.get('sourceStoreName') || '';
  const productSeries = searchParams.get('productSeries') || '';
  const city = searchParams.get('city') || '';
  const scene = searchParams.get('scene') || '';

  const sales = salesId ? mockSalesPersons.find(s => s.id === salesId) : null;

  const collectionType = productSeries ? 'product' : city ? 'city' : scene ? 'scene' : null;

  const cases = useMemo(() => {
    const list = productSeries
      ? getShareableCasesBySeries(productSeries)
      : city
      ? getShareableCasesByCity(city)
      : scene
      ? getShareableCasesByScene(scene)
      : [];
    return sourceStoreId ? list.filter(t => t.storeId === sourceStoreId) : list;
  }, [productSeries, city, scene, sourceStoreId]);

  const title = productSeries
    ? `${productSeries}真实交付案例`
    : city
    ? `${city}同城客户案例`
    : scene
    ? `${scene}睡眠升级案例`
    : '真实交付案例';

  if (!collectionType || cases.length === 0) {
    return (
      <div className="min-h-screen bg-surface-50 flex items-center justify-center px-5">
        <div className="text-center max-w-sm">
          <div className="w-16 h-16 bg-surface-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Shield size={28} className="text-surface-400" />
          </div>
          <h1 className="text-lg font-semibold text-gray-900 mb-2">暂无公开案例</h1>
          <p className="text-sm text-surface-500 leading-relaxed">
            该条件下暂无通过审核的公开案例。
          </p>
          <button onClick={() => navigate('/')}
            className="mt-6 px-6 py-2.5 bg-navy-800 text-white font-medium rounded-xl text-sm active:bg-navy-900 transition-colors">
            返回首页
          </button>
        </div>
      </div>
    );
  }

  const storeName = sourceStoreName || cases[0]?.storeName || '';
  const storeId = sourceStoreId || cases[0]?.storeId || '';
  const caseCity = city || cases[0]?.city || '';

  return (
    <div className="min-h-screen bg-white flex flex-col">
      {/* ── Header ── */}
      <div className="bg-navy-900 px-5 pt-12 pb-6">
        <button onClick={() => navigate(-1)}
          className="mb-4 w-9 h-9 bg-white/15 backdrop-blur rounded-full flex items-center justify-center text-white">
          <ChevronLeft size={20} />
        </button>
        <h1 className="text-xl font-bold text-white">{title}</h1>
        <p className="text-blue-200/70 text-sm mt-1">
          {cases.length} 个真实交付案例
          {sales && ` · ${sales.name} 为您服务`}
        </p>

        <div className="flex gap-2 mt-3 flex-wrap">
          <div className="flex items-center gap-1 bg-white/10 backdrop-blur rounded-full px-2.5 py-1 text-xs text-blue-200">
            <CheckCircle2 size={12} />已通过审核
          </div>
          <div className="flex items-center gap-1 bg-white/10 backdrop-blur rounded-full px-2.5 py-1 text-xs text-blue-200">
            <Shield size={12} />隐私已脱敏
          </div>
          <div className="flex items-center gap-1 bg-white/10 backdrop-blur rounded-full px-2.5 py-1 text-xs text-blue-200">
            <Store size={12} />{storeName}
          </div>
        </div>
      </div>

      {/* ── Case Cards ── */}
      <div className="flex-1 px-4 pt-4 pb-32 space-y-4">
        {cases.map((task) => {
          const caseTitle = `${task.city}${task.customerAlias} · ${task.scene}`;
          return (
            <div key={task.id}
              onClick={() => navigate(`/share/${task.id}?salesId=${salesId || task.salesId}`)}
              className="bg-white rounded-2xl shadow-card border border-surface-100 overflow-hidden active:bg-surface-50 transition-colors cursor-pointer">
              {/* Thumbnail + Info */}
              <div className="flex gap-3 p-3">
                <div className="w-[100px] h-[100px] rounded-xl overflow-hidden flex-shrink-0 bg-surface-100">
                  <img src={task.installImages[0]} alt={task.scene}
                    className="w-full h-full object-cover" />
                  {task.installImages.length > 1 && (
                    <div className="relative -mt-5 bg-black/50 backdrop-blur rounded-b-xl text-white text-[10px] text-center py-0.5">
                      <Camera size={10} className="inline mr-0.5" />{task.installImages.length}张
                    </div>
                  )}
                </div>

                <div className="flex-1 min-w-0 flex flex-col justify-between">
                  <div>
                    <div className="flex gap-1 flex-wrap mb-1">
                      <span className="text-[10px] px-2 py-0.5 rounded-full bg-navy-50 text-navy-700 font-medium">
                        {task.productName || task.brand}
                      </span>
                      <span className="text-[10px] px-2 py-0.5 rounded-full bg-surface-50 text-surface-500">
                        {task.scene}
                      </span>
                    </div>
                    <h3 className="text-sm font-semibold text-gray-900 line-clamp-2 leading-snug">{caseTitle}</h3>
                    <p className="text-xs text-surface-400 mt-1">
                      <MapPin size={10} className="inline mr-0.5" />{task.city}
                      <span className="mx-1">·</span>
                      <Store size={10} className="inline mr-0.5" />{task.storeName}
                    </p>
                  </div>
                  <div className="flex items-center gap-1 text-xs text-navy-700 font-medium mt-1.5">
                    查看详情 <ChevronRight size={12} />
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* ── Bottom CTAs ── */}
      <BottomActions
        collectionType={collectionType}
        productSeries={productSeries}
        city={caseCity}
        caseCount={cases.length}
        storeName={storeName}
        storeId={storeId}
        salesId={salesId}
        salesName={sales?.name}
      />
    </div>
  );
}

// ── Bottom Actions ──
function BottomActions({
  collectionType, productSeries, city, caseCount, storeName, storeId, salesId, salesName,
}: {
  collectionType: string;
  productSeries: string;
  city: string;
  caseCount: number;
  storeName: string;
  storeId: string;
  salesId: string;
  salesName?: string;
}) {
  const [showVisitForm, setShowVisitForm] = useState(false);
  const [showContactSheet, setShowContactSheet] = useState(false);

  return (
    <>
      <div className="fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-app bg-white/95 backdrop-blur border-t border-surface-100 z-40 safe-bottom">
        <div className="flex items-center gap-2 px-4 py-3">
          <button onClick={() => setShowVisitForm(true)}
            className="flex-1 h-12 bg-navy-800 text-white font-semibold rounded-xl text-sm active:bg-navy-900 transition-colors shadow-lg shadow-navy-200 flex items-center justify-center gap-1.5">
            <Phone size={16} />预约到店试睡
          </button>
          <button onClick={() => setShowContactSheet(true)}
            className="flex-1 h-12 bg-white border-2 border-navy-800 text-navy-800 font-semibold rounded-xl text-sm active:bg-navy-50 transition-colors flex items-center justify-center gap-1.5">
            <MessageCircle size={16} />咨询同款方案
          </button>
        </div>
      </div>

      {showVisitForm && (
        <CollectionLeadForm
          collectionType={collectionType}
          productSeries={productSeries}
          city={city}
          caseCount={caseCount}
          storeName={storeName}
          storeId={storeId}
          salesId={salesId}
          salesName={salesName}
          onClose={() => setShowVisitForm(false)}
        />
      )}

      {showContactSheet && (
        <CollectionContactSheet
          productSeries={productSeries}
          city={city}
          storeName={storeName}
          storeId={storeId}
          salesId={salesId}
          salesName={salesName}
          onClose={() => setShowContactSheet(false)}
          onRequestLead={() => {
            setShowContactSheet(false);
            setShowVisitForm(true);
          }}
        />
      )}
    </>
  );
}

// ── Collection Lead Form ──
function CollectionLeadForm({
  collectionType, productSeries, city, caseCount, storeName, storeId, salesId, salesName, onClose,
}: {
  collectionType: string; productSeries: string; city: string; caseCount: number;
  storeName: string; storeId: string; salesId: string; salesName?: string; onClose: () => void;
}) {
  const [alias, setAlias] = useState('');
  const [phone, setPhone] = useState('');
  const [product, setProduct] = useState(productSeries || '');
  const [remark, setRemark] = useState('');
  const [agreed, setAgreed] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = () => {
    if (!alias.trim()) return;
    if (!phone.trim() || phone.length < 11) return;
    if (!agreed) return;
    addShareLead({
      alias: alias.trim(),
      phone: phone.trim(),
      city,
      remark: remark.trim(),
      sourceCaseId: `collection:${collectionType}:${productSeries || city}`,
      sourceStoreId: storeId,
      sourceStoreName: storeName,
      sourceSalesId: salesId || undefined,
      interestProduct: product.trim() || productSeries,
      interestType: '预约到店体验',
      sourceAction: 'book_collection',
      createdAt: new Date().toISOString(),
    });
    setSubmitted(true);
  };

  if (submitted) {
    return (
      <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center">
        <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />
        <div className="relative bg-white rounded-t-3xl sm:rounded-3xl w-full sm:max-w-sm shadow-premium animate-fade-up p-6 safe-bottom">
          <div className="text-center">
            <div className="w-16 h-16 bg-green-50 rounded-full flex items-center justify-center mx-auto mb-4">
              <CheckCircle2 size={32} className="text-green-600" />
            </div>
            <h3 className="text-lg font-bold text-gray-900 mb-2">已收到您的预约</h3>
            <p className="text-sm text-surface-500 leading-relaxed mb-1">
              {salesName || '睡眠顾问'}会尽快联系您
            </p>
            <p className="text-xs text-surface-400">请保持手机畅通</p>
            <button onClick={onClose}
              className="w-full h-11 bg-navy-800 text-white font-semibold rounded-xl text-sm mt-6 active:bg-navy-900 transition-colors">
              知道了
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center">
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />
      <div className="relative bg-white rounded-t-3xl sm:rounded-3xl w-full sm:max-w-sm shadow-premium animate-fade-up max-h-[90vh] overflow-y-auto">
        <div className="flex justify-center pt-3 pb-1">
          <div className="w-10 h-1 rounded-full bg-surface-200" />
        </div>
        <div className="px-5 pb-6">
          <h3 className="text-lg font-bold text-gray-900 mb-1">预约到店体验</h3>
          <p className="text-xs text-surface-400 mb-4">
            {productSeries ? `${productSeries} · ` : ''}{caseCount}个真实案例 · {storeName}
          </p>

          <div className="bg-surface-50 rounded-xl px-3 py-2 text-xs text-surface-500 mb-4 flex items-center gap-1.5">
            <ShoppingBag size={12} />
            <span className="truncate">
              {collectionType === 'product' ? `${productSeries}案例合集` :
               collectionType === 'city' ? `${city}同城案例合集` :
               '场景案例合集'}
            </span>
          </div>

          <div className="space-y-3">
            <div>
              <label className="text-xs font-semibold text-gray-700 mb-1 block">您的称呼 <span className="text-red-400">*</span></label>
              <input type="text" value={alias} onChange={(e) => setAlias(e.target.value)}
                placeholder="如：王女士"
                className="w-full h-11 px-3 bg-surface-50 border border-surface-200 rounded-xl text-sm focus:outline-none focus:border-navy-400 transition-colors" />
            </div>
            <div>
              <label className="text-xs font-semibold text-gray-700 mb-1 block">手机号 <span className="text-red-400">*</span></label>
              <div className="flex items-center gap-2 bg-surface-50 border border-surface-200 rounded-xl px-3 focus-within:border-navy-400 transition-colors">
                <Phone size={14} className="text-surface-400" />
                <input type="tel" value={phone} onChange={(e) => setPhone(e.target.value)}
                  placeholder="请输入手机号"
                  className="flex-1 h-11 bg-transparent text-sm focus:outline-none" />
              </div>
            </div>
            <div>
              <label className="text-xs font-semibold text-gray-700 mb-1 block">意向产品</label>
              <div className="flex items-center gap-2 bg-surface-50 border border-surface-200 rounded-xl px-3 focus-within:border-navy-400 transition-colors">
                <ShoppingBag size={14} className="text-surface-400" />
                <input type="text" value={product} onChange={(e) => setProduct(e.target.value)}
                  className="flex-1 h-11 bg-transparent text-sm focus:outline-none" />
              </div>
            </div>
            <div>
              <label className="text-xs font-semibold text-gray-700 mb-1 block">备注 <span className="text-xs text-surface-400 font-normal">（可选）</span></label>
              <textarea value={remark} onChange={(e) => setRemark(e.target.value)}
                placeholder="如有特殊需求可在此说明" rows={2}
                className="w-full px-3 py-2.5 bg-surface-50 border border-surface-200 rounded-xl text-sm resize-none focus:outline-none focus:border-navy-400 transition-colors" />
            </div>
            <button onClick={() => setAgreed(!agreed)} className="flex items-start gap-2.5 w-full text-left">
              <div className={`w-5 h-5 rounded border-2 flex items-center justify-center flex-shrink-0 mt-0.5 transition-colors ${
                agreed ? 'bg-navy-800 border-navy-800' : 'border-surface-300'}`}>
                {agreed && (
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none">
                    <path d="M5 12l4 4L19 7" stroke="white" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                )}
              </div>
              <span className={`text-xs leading-relaxed ${agreed ? 'text-gray-700' : 'text-surface-500'}`}>
                我同意门店通过电话联系我 <span className="text-red-400">*</span>
              </span>
            </button>
            <button onClick={handleSubmit}
              disabled={!alias.trim() || phone.trim().length < 11 || !agreed}
              className="w-full h-12 bg-navy-800 text-white font-semibold rounded-xl text-sm active:bg-navy-900 transition-colors disabled:opacity-40 disabled:cursor-not-allowed shadow-lg shadow-navy-200">
              提交预约
            </button>
          </div>
          <p className="text-[10px] text-surface-400 text-center mt-3 leading-relaxed">
            信息仅用于门店联系您，不会公开或转给第三方
          </p>
        </div>
      </div>
    </div>
  );
}

// ── Collection Contact Sheet ──
function CollectionContactSheet({
  productSeries, city, storeName, salesId, salesName, onClose, onRequestLead,
}: {
  productSeries: string; city: string; storeName: string;
  storeId: string; salesId: string; salesName?: string; onClose: () => void; onRequestLead: () => void;
}) {
  const [copyStatus, setCopyStatus] = useState<'idle' | 'success' | 'failed'>('idle');

  const wechatId = `shuibao-${city === '苏州' ? 'suzhou' : city === '南京' ? 'nanjing' : 'shanghai'}`;

  const handleCopyWechat = async () => {
    const result = await copyText(wechatId);
    if (result.success) setCopyStatus('success');
    else setCopyStatus('failed');
  };

  // Find first case ID from the collection for lead form linking
  const collectionLabel = productSeries ? `${productSeries}案例合集` : `${city}同城案例合集`;

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center">
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />
      <div className="relative bg-white rounded-t-3xl sm:rounded-3xl w-full sm:max-w-sm shadow-premium animate-fade-up max-h-[90vh] overflow-y-auto">
        <div className="flex justify-center pt-3 pb-1">
          <div className="w-10 h-1 rounded-full bg-surface-200" />
        </div>

        <div className="px-5 pb-6">
          <h3 className="text-lg font-bold text-gray-900 mb-1">联系专属顾问</h3>
          <p className="text-xs text-surface-400 mb-4">
            {salesName || ''} · {storeName} · {city}
          </p>

          <div className="bg-surface-50 rounded-xl px-3 py-2 text-xs text-surface-500 mb-4 flex items-center gap-1.5">
            <ShoppingBag size={12} />
            <span className="truncate">{collectionLabel}</span>
          </div>

          {/* Option 1: Copy WeChat */}
          <div className="mb-4">
            <p className="text-xs font-semibold text-gray-700 mb-2 flex items-center gap-1.5">
              <UserPlus size={14} className="text-green-600" />添加睡眠顾问微信
            </p>
            <div className="bg-surface-50 rounded-xl px-3 py-2.5 text-sm text-gray-900 font-medium text-center mb-2">
              {wechatId}
            </div>
            {copyStatus === 'failed' ? (
              <div className="bg-red-50 rounded-xl p-3 text-xs text-red-600 mb-2">
                当前浏览器限制自动复制，请长按微信号手动复制：<span className="font-medium">{wechatId}</span>
              </div>
            ) : (
              <button onClick={handleCopyWechat}
                className="w-full h-10 bg-green-50 text-green-700 font-semibold rounded-xl text-sm active:bg-green-100 transition-colors flex items-center justify-center gap-1.5">
                <Copy size={14} />
                {copyStatus === 'success' ? '微信号已复制，请打开微信添加睡眠顾问' : '复制微信号'}
              </button>
            )}
          </div>

          <div className="flex items-center gap-3 mb-4">
            <div className="flex-1 border-t border-surface-100" />
            <span className="text-xs text-surface-400">或</span>
            <div className="flex-1 border-t border-surface-100" />
          </div>

          {/* Option 2: QR Code */}
          <div className="mb-4">
            <p className="text-xs font-semibold text-gray-700 mb-2 flex items-center gap-1.5">
              <QrCode size={14} className="text-navy-600" />微信二维码
            </p>
            <div className="flex flex-col items-center bg-surface-50 rounded-xl p-4">
              <div className="w-40 h-40 bg-white border-2 border-surface-200 rounded-xl flex flex-col items-center justify-center mb-2">
                <QrCode size={64} className="text-navy-300" strokeWidth={1} />
                <p className="text-[10px] text-surface-400 mt-1">微信扫码添加</p>
              </div>
              <p className="text-xs text-surface-400 text-center leading-relaxed mt-1">
                长按二维码，添加睡眠顾问微信
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3 mb-4">
            <div className="flex-1 border-t border-surface-100" />
            <span className="text-xs text-surface-400">或</span>
            <div className="flex-1 border-t border-surface-100" />
          </div>

          {/* Option 3: Leave contact */}
          <div>
            <p className="text-xs font-semibold text-gray-700 mb-2 flex items-center gap-1.5">
              <Phone size={14} className="text-navy-600" />留下联系方式
            </p>
            <button onClick={onRequestLead}
              className="w-full h-10 bg-navy-50 text-navy-700 font-semibold rounded-xl text-sm active:bg-navy-100 transition-colors flex items-center justify-center gap-1.5">
              填写信息，顾问联系我
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

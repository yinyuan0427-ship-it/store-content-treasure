import { useMemo, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import {
  getAllDeliveryTasks, canShareCase,
} from '../mock/data';
import {
  Shield, CheckCircle2, Camera, Phone,
  MessageCircle, ChevronLeft, Star, ChevronRight, ShoppingBag,
  Layers,
} from 'lucide-react';
import { useState } from 'react';
import { copyText } from '../utils/clipboard';
import { buildShareQuery, getShareImageUrl, setShareMeta, getRecommendedCases } from '../utils/share';
import type { RecommendedGroup } from '../utils/share';
import { Copy, QrCode, UserPlus } from 'lucide-react';
import { getAdvisorContact } from '../utils/advisor';
import { createShareLead } from '../utils/leads';

export default function CaseCollectionShare() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const salesId = searchParams.get('salesId') || '';
  const storeIdParam = searchParams.get('storeId') || '';
  const channel = searchParams.get('channel') || 'wechat_private';
  const entry = searchParams.get('entry') || 'case_collection';
  const caseIdsParam = searchParams.get('caseIds') || '';
  const fromCaseId = searchParams.get('fromCaseId') || '';
  const productSeries = searchParams.get('productSeries') || '';
  const city = searchParams.get('city') || '';
  const scene = searchParams.get('scene') || '';

  const hasCaseIds = !!caseIdsParam;
  const isFromCase = !!fromCaseId;

  const allShareable = useMemo(() => getAllDeliveryTasks().filter(canShareCase), []);

  const sourceCase = useMemo(
    () => (isFromCase ? allShareable.find(t => t.id === fromCaseId) : null),
    [isFromCase, fromCaseId, allShareable],
  );

  // Build recommended groups for fromCaseId mode
  const recommendation = useMemo(() => {
    if (!sourceCase) return null;
    return getRecommendedCases(sourceCase, allShareable);
  }, [sourceCase, allShareable]);

  // Flat list of all recommended cases (source first, then groups)
  const recommendedList = useMemo(() => {
    if (!recommendation) return [] as typeof allShareable;
    const list = [recommendation.sourceCase];
    for (const g of recommendation.groups) {
      list.push(...g.cases);
    }
    return list;
  }, [recommendation]);

  // caseIds exact mode
  const exactCases = useMemo(() => {
    if (!hasCaseIds) return [];
    const ids = caseIdsParam.split(',').map(s => s.trim()).filter(Boolean);
    return allShareable.filter(t => ids.includes(t.id));
  }, [hasCaseIds, caseIdsParam, allShareable]);

  // Legacy mode (productSeries / city / scene)
  const legacyCases = useMemo(() => {
    if (hasCaseIds || isFromCase) return [];
    if (productSeries) return allShareable.filter(t => t.productSeries === productSeries);
    if (city) return allShareable.filter(t => t.city === city);
    if (scene) return allShareable.filter(t => t.scene === scene);
    return [];
  }, [hasCaseIds, isFromCase, productSeries, city, scene, allShareable]);

  const cases = hasCaseIds ? exactCases : isFromCase ? recommendedList : legacyCases;

  const collectionType = hasCaseIds ? 'caseIds'
    : isFromCase ? 'fromCase'
    : productSeries ? 'product'
    : city ? 'city'
    : scene ? 'scene'
    : null;

  // Title and display metadata
  const title = hasCaseIds
    ? (exactCases.length <= 1 ? '真实交付案例' : '真实交付案例合集')
    : isFromCase
    ? '更多真实交付案例'
    : productSeries
    ? `${productSeries}真实交付案例`
    : city
    ? '真实交付案例合集'
    : scene
    ? `${scene}睡眠升级案例`
    : '真实交付案例合集';

  const subtitle = isFromCase
    ? '已为您整理同款产品和相似需求案例'
    : null;

  const caseCount = cases.length;

  // Dynamic meta
  useEffect(() => {
    if (cases.length > 0) {
      const first = cases[0];
      const shareTitle = title.length > 30 ? title.slice(0, 29) + '…' : title;
      const shareDesc = subtitle || `查看${caseCount}个真实交付案例，隐私已处理。`;
      setShareMeta({
        title: shareTitle,
        description: shareDesc,
        image: getShareImageUrl(first),
        url: window.location.href,
      });
    } else {
      setShareMeta();
    }
    return () => { setShareMeta(); };
  }, [cases, title, subtitle, caseCount]);

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
          <button onClick={() => navigate(-1)}
            className="mt-6 px-6 py-2.5 bg-navy-800 text-white font-medium rounded-xl text-sm active:bg-navy-900 transition-colors">
            返回
          </button>
        </div>
      </div>
    );
  }

  const storeName = cases[0]?.storeName || '';
  const storeId = storeIdParam || cases[0]?.storeId || '';
  const caseCity = city || cases[0]?.city || '';
  const collectionLabel = hasCaseIds
    ? `${cases.length} 个精选案例`
    : isFromCase
    ? `${cases.length} 个推荐案例`
    : productSeries ? `${productSeries}案例合集`
    : city ? '真实交付案例合集'
    : '场景案例合集';

  const sourceCaseId = hasCaseIds
    ? `collection:caseIds:${caseIdsParam}`
    : isFromCase
    ? `collection:fromCase:${fromCaseId}`
    : `collection:${collectionType}:${productSeries || city || scene}`;

  return (
    <div className="min-h-screen bg-white flex flex-col">
      {/* ── Header ── */}
      <div className="bg-navy-900 px-5 pt-12 pb-6">
        <button onClick={() => navigate(-1)}
          className="mb-4 w-9 h-9 bg-white/15 backdrop-blur rounded-full flex items-center justify-center text-white">
          <ChevronLeft size={20} />
        </button>
        <h1 className="text-xl font-bold text-white">{title}</h1>
        {subtitle && (
          <p className="text-blue-200/70 text-sm mt-1">{subtitle}</p>
        )}
        {!subtitle && (
          <p className="text-blue-200/70 text-sm mt-1">
            {caseCount} 个真实交付案例
          </p>
        )}

        <div className="flex gap-2 mt-3 flex-wrap">
          <div className="flex items-center gap-1 bg-white/10 backdrop-blur rounded-full px-2.5 py-1 text-xs text-blue-200">
            <CheckCircle2 size={12} />已通过审核
          </div>
          <div className="flex items-center gap-1 bg-white/10 backdrop-blur rounded-full px-2.5 py-1 text-xs text-blue-200">
            <Shield size={12} />隐私已脱敏
          </div>
        </div>
      </div>

      {/* ── Single case fallback ── */}
      {caseCount === 1 && (
        <div className="px-4 pt-4 pb-2">
          <div className="bg-warm-50 border border-warm-200 rounded-xl p-3 text-sm text-warm-700 text-center">
            更多案例正在更新，可先查看这个真实交付案例
          </div>
        </div>
      )}

      {/* ── Case Cards ── */}
      <div className="flex-1 px-4 pt-4 pb-32 space-y-4">
        {isFromCase && recommendation ? (
          <>
            {/* Source case — first, marked */}
            <CaseCard
              task={recommendation.sourceCase}
              salesId={salesId}
              storeId={storeId}
              channel={channel}
              navigate={navigate}
              badge="当前案例"
            />

            {/* Groups */}
            {recommendation.groups.map((group) => (
              <div key={group.label}>
                <div className="flex items-center gap-2 mb-2 mt-5">
                  <Layers size={14} className="text-navy-500" />
                  <h2 className="text-sm font-semibold text-gray-700">{group.label}</h2>
                  <span className="text-xs text-surface-400">{group.cases.length}个</span>
                </div>
                <div className="space-y-3">
                  {group.cases.map(task => (
                    <CaseCard
                      key={task.id}
                      task={task}
                      salesId={salesId}
                      storeId={storeId}
                      channel={channel}
                      navigate={navigate}
                    />
                  ))}
                </div>
              </div>
            ))}
          </>
        ) : (
          // Flat list for caseIds and legacy modes
          cases.map(task => (
            <CaseCard
              key={task.id}
              task={task}
              salesId={salesId}
              storeId={storeId}
              channel={channel}
              navigate={navigate}
            />
          ))
        )}
      </div>

      {/* ── Bottom CTAs ── */}
      <BottomActions
        collectionType={collectionType}
        productSeries={productSeries}
        city={caseCity}
        caseCount={caseCount}
        storeName={storeName}
        storeId={storeId}
        salesId={salesId}
        collectionLabel={collectionLabel}
        sourceCaseId={sourceCaseId}
        channel={channel}
        entry={entry}
      />
    </div>
  );
}

// ── Case Card (client-facing: no city/district/store/sales name) ──
function CaseCard({
  task, salesId, storeId, channel, navigate, badge,
}: {
  task: NonNullable<ReturnType<typeof getAllDeliveryTasks>[number]>;
  salesId: string;
  storeId: string;
  channel: string;
  navigate: (path: string) => void;
  badge?: string;
}) {
  const caseTitle = `${task.customerAlias} · ${task.scene}`;
  const summary = task.customerRequirement
    || `查看${task.productName || task.brand + ' ' + task.model}的真实交付案例`;

  return (
    <div
      onClick={() => navigate(`/share/${task.id}?${buildShareQuery({
        caseId: task.id,
        salesId: salesId || task.salesId,
        storeId: storeId || task.storeId,
        channel,
        entry: 'collection_card',
      })}`)}
      className="bg-white rounded-2xl shadow-card border border-surface-100 overflow-hidden active:bg-surface-50 transition-colors cursor-pointer"
    >
      <div className="flex gap-3 p-3">
        <div className="w-[100px] h-[100px] rounded-xl overflow-hidden flex-shrink-0 bg-surface-100 relative">
          <img src={task.installImages[0]} alt={task.scene}
            className="w-full h-full object-cover" />
          {badge && (
            <div className="absolute top-1.5 left-1.5 bg-navy-800/85 backdrop-blur rounded-full px-2 py-0.5 text-white text-[9px] font-medium">
              {badge}
            </div>
          )}
          {task.installImages.length > 1 && (
            <div className="absolute bottom-0 left-0 right-0 bg-black/50 backdrop-blur text-white text-[10px] text-center py-0.5">
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
            <p className="text-xs text-surface-400 mt-1 line-clamp-1">{summary}</p>
          </div>
          <div className="flex items-center gap-1 text-xs text-navy-700 font-medium mt-1.5">
            查看详情 <ChevronRight size={12} />
          </div>
        </div>
      </div>
    </div>
  );
}

// ── Bottom Actions ──
function BottomActions({
  collectionType, productSeries, city, caseCount, storeName, storeId, salesId, collectionLabel, sourceCaseId, channel, entry,
}: {
  collectionType: string;
  productSeries: string;
  city: string;
  caseCount: number;
  storeName: string;
  storeId: string;
  salesId: string;
  collectionLabel: string;
  sourceCaseId: string;
  channel: string;
  entry: string;
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
          collectionLabel={collectionLabel}
          sourceCaseId={sourceCaseId}
          channel={channel}
          entry={entry}
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
          collectionLabel={collectionLabel}
          channel={channel}
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
  collectionType, productSeries, city, caseCount, storeName, storeId, salesId, onClose, collectionLabel, sourceCaseId, channel, entry,
}: {
  collectionType: string; productSeries: string; city: string; caseCount: number;
  storeName: string; storeId: string; salesId: string; onClose: () => void;
  collectionLabel: string; sourceCaseId: string; channel: string; entry: string;
}) {
  const [alias, setAlias] = useState('');
  const [phone, setPhone] = useState('');
  const [customerCity, setCustomerCity] = useState('');
  const [product, setProduct] = useState(productSeries || '');
  const [remark, setRemark] = useState('');
  const [agreed, setAgreed] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const phoneValid = /^1[3-9]\d{9}$/.test(phone.trim());

  const handleSubmit = () => {
    if (!alias.trim()) return;
    if (!phoneValid) return;
    if (!agreed) return;
    createShareLead({
      alias: alias.trim(),
      phone: phone.trim(),
      city: customerCity.trim(),
      remark: remark.trim(),
      sourceCaseId,
      sourceStoreId: storeId,
      sourceStoreName: storeName,
      sourceSalesId: salesId || undefined,
      interestProduct: product.trim() || productSeries,
      interestType: '预约到店体验',
      sourceAction: 'book_collection',
      sourceChannel: channel,
      sourceEntry: entry,
      sourceUrl: window.location.href,
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
              睡眠顾问将尽快联系您
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
            {collectionLabel}
          </p>

          <div className="bg-surface-50 rounded-xl px-3 py-2 text-xs text-surface-500 mb-4 flex items-center gap-1.5">
            <ShoppingBag size={12} />
            <span className="truncate">
              {collectionType === 'product' ? `${productSeries}案例合集` :
               collectionType === 'city' ? '真实交付案例合集' :
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
              {phone.trim() && !phoneValid && (
                <p className="text-[10px] text-red-500 mt-1">请输入有效的 11 位手机号</p>
              )}
            </div>
            <div>
              <label className="text-xs font-semibold text-gray-700 mb-1 block">您所在城市 <span className="text-xs text-surface-400 font-normal">（可选）</span></label>
              <input type="text" value={customerCity} onChange={(e) => setCustomerCity(e.target.value)}
                placeholder="用于安排就近服务"
                className="w-full h-11 px-3 bg-surface-50 border border-surface-200 rounded-xl text-sm focus:outline-none focus:border-navy-400 transition-colors" />
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
                我同意睡眠顾问通过电话联系我 <span className="text-red-400">*</span>
              </span>
            </button>
            <button onClick={handleSubmit}
              disabled={!alias.trim() || !phoneValid || !agreed}
              className="w-full h-12 bg-navy-800 text-white font-semibold rounded-xl text-sm active:bg-navy-900 transition-colors disabled:opacity-40 disabled:cursor-not-allowed shadow-lg shadow-navy-200">
              提交预约
            </button>
          </div>
          <p className="text-[10px] text-surface-400 text-center mt-3 leading-relaxed">
            信息仅用于睡眠顾问联系您，不会公开或转给第三方
          </p>
        </div>
      </div>
    </div>
  );
}

// ── Collection Contact Sheet ──
function CollectionContactSheet({
  productSeries, city, storeName, storeId, salesId, collectionLabel, channel, onClose, onRequestLead,
}: {
  productSeries: string; city: string; storeName: string;
  storeId: string; salesId: string; collectionLabel: string; channel: string; onClose: () => void; onRequestLead: () => void;
}) {
  const [copyStatus, setCopyStatus] = useState<'idle' | 'success' | 'failed'>('idle');

  const advisor = getAdvisorContact({ salesId, storeId });
  const wechatId = advisor.wechatId;

  const handleCopyWechat = async () => {
    const result = await copyText(wechatId);
    if (result.success) setCopyStatus('success');
    else setCopyStatus('failed');
  };

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
            了解同款方案详情，睡眠顾问提供一对一咨询
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

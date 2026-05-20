import { useState } from 'react';
import { useParams, useNavigate, useSearchParams } from 'react-router-dom';
import { addShareLead, mockDeliveryTasks, canShareCase, getAllDeliveryTasks } from '../mock/data';
import { findProductKnowledgeForTask } from '../mock/productKnowledge';
import { copyText } from '../utils/clipboard';
import {
  Store, MapPin, Shield, CheckCircle2, Camera,
  MessageCircle, Phone, ChevronLeft, Star, Heart,
  Copy, QrCode, UserPlus, ShoppingBag, Award, Clock
} from 'lucide-react';

function getCustomerTitle(task: NonNullable<ReturnType<typeof mockDeliveryTasks.find>>): string {
  const titles: Record<string, string> = {
    '父母房': '给父母换一张睡得安心的床垫',
    '新房主卧': '新家入住第一晚，从一张好床垫开始',
    '新房次卧': '孩子的房间，也要睡得舒服',
    '旧床换新': '睡了多年的旧床垫退役，腰终于不疼了',
    '婚房布置': '婚房的第一张床垫，承载幸福的新开始',
    '儿童房': '给宝宝一个安心好眠的童年',
    '客户卧室实拍': '真实客户的家，真实的睡眠改善',
  };
  return titles[task.scene] || `${task.city} · ${task.scene} · ${task.brand} ${task.model}`;
}

export default function CustomerCaseShare() {
  const { caseId } = useParams<{ caseId: string }>();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const salesId = searchParams.get('salesId') || '';

  const task = getAllDeliveryTasks().find(t => t.id === caseId);

  if (!task || !canShareCase(task)) {
    return (
      <div className="min-h-screen bg-surface-50 flex items-center justify-center px-5">
        <div className="text-center max-w-sm">
          <div className="w-16 h-16 bg-surface-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Shield size={28} className="text-surface-400" />
          </div>
          <h1 className="text-lg font-semibold text-gray-900 mb-2">案例暂未公开</h1>
          <p className="text-sm text-surface-500 leading-relaxed">
            该案例尚未通过审核，暂时无法查看。
          </p>
          <button onClick={() => navigate('/')}
            className="mt-6 px-6 py-2.5 bg-navy-800 text-white font-medium rounded-xl text-sm active:bg-navy-900 transition-colors">
            返回首页
          </button>
        </div>
      </div>
    );
  }

  const customerTitle = getCustomerTitle(task);
  const caseSubtitle = `${task.city}${task.customerAlias} · ${task.scene} · ${task.brand} ${task.model}`;

  const productKnowledge = findProductKnowledgeForTask({
    productSeries: task.productSeries,
    productModel: task.productModel,
    model: task.model,
    productCategory: task.productCategory,
  });

  const productFeatures = productKnowledge
    ? productKnowledge.coreSellingPoints.slice(0, 3)
    : [
        ...(task.productSeries ? [`${task.productSeries}系列`] : []),
        ...(task.productCategory ? [`${task.productCategory}品类`] : []),
        ...(task.productCategory === '智能床' ? ['电动调节 · 零重力模式', '按摩功能 · USB充电', '静音电机'] :
            task.productCategory === '枕头' ? ['感温材质 · 自适应高度', '透气面料 · 防螨抗菌', '人体工学设计'] :
            ['独立袋装弹簧 · 静音抗干扰', '天然乳胶层 · 透气防螨', '边缘加固 · 安全防滑落']),
      ].slice(0, 3);

  const fitCustomers = productKnowledge
    ? productKnowledge.fitCustomers.slice(0, 3)
    : ['睡眠质量差', '腰椎不适', '对床垫有要求'];

  const storeCaseCount = getAllDeliveryTasks().filter(
    t => t.storeId === task.storeId && (t.reviewStatus === 'approved' || t.reviewStatus === 'featured')
  ).length;

  return (
    <div className="min-h-screen bg-white flex flex-col">
      {/* ── Photo Carousel ── */}
      <div className="relative bg-navy-900">
        <button onClick={() => navigate(-1)}
          className="absolute top-12 left-4 z-10 w-9 h-9 bg-black/40 backdrop-blur rounded-full flex items-center justify-center text-white">
          <ChevronLeft size={20} />
        </button>

        <div className="flex overflow-x-auto snap-x snap-mandatory no-scrollbar w-full aspect-[4/3]">
          {task.installImages.map((img, i) => (
            <div key={i} className="w-full flex-shrink-0 snap-center">
              <img src={img} alt={`${task.scene}实拍${i + 1}`}
                className="w-full aspect-[4/3] object-cover" />
            </div>
          ))}
        </div>

        <div className="absolute bottom-3 right-4 bg-black/50 backdrop-blur rounded-full px-2.5 py-1 text-white text-xs">
          <Camera size={12} className="inline mr-1" />
          {task.installImages.length} 张实拍
        </div>
      </div>

      {/* ── Content ── */}
      <div className="flex-1 px-5 pt-5 pb-32 space-y-5">
        {/* Service & location */}
        <div className="flex items-center gap-2 text-sm text-surface-500">
          <div className="flex items-center gap-1"><Store size={14} /><span>本地服务</span></div>
          <span>·</span>
          <div className="flex items-center gap-1"><MapPin size={14} /><span>{task.city}{task.district ? ` ${task.district}` : ''}</span></div>
        </div>

        {/* Customer-facing title */}
        <div>
          <h1 className="text-xl font-bold text-gray-900 leading-snug">{customerTitle}</h1>
          <p className="text-sm text-surface-400 mt-1">{caseSubtitle}</p>
          <p className="text-xs text-surface-400 mt-0.5">{task.salesName} 为您服务</p>
        </div>

        {/* Trust badges */}
        <div className="flex gap-2 flex-wrap">
          <div className="flex items-center gap-1.5 bg-surface-50 rounded-full px-3 py-1.5 text-xs text-surface-500">
            <CheckCircle2 size={14} className="text-green-600 flex-shrink-0" />
            <span>真实交付案例</span>
          </div>
          <div className="flex items-center gap-1.5 bg-surface-50 rounded-full px-3 py-1.5 text-xs text-surface-500">
            <Shield size={14} className="text-navy-600 flex-shrink-0" />
            <span>真实门店交付案例</span>
          </div>
          <div className="flex items-center gap-1.5 bg-surface-50 rounded-full px-3 py-1.5 text-xs text-surface-500">
            <Star size={14} className="text-warm-500 flex-shrink-0" fill="#f5a932" />
            <span>隐私已处理</span>
          </div>
        </div>

        <div className="border-t border-surface-100" />

        {/* Customer needs */}
        <div>
          <h2 className="text-[15px] font-bold text-gray-900 mb-2 flex items-center gap-1.5">
            <Heart size={18} className="text-red-400" fill="#f87171" />客户需求
          </h2>
          <p className="text-sm text-surface-600 leading-relaxed">{task.customerRequirement}</p>
        </div>

        {/* Customer feedback */}
        {task.storyFeedback && (
          <div className="relative">
            <div className="absolute -top-2 left-4 text-4xl text-warm-200 leading-none select-none">&ldquo;</div>
            <div className="bg-warm-50/60 border border-warm-100 rounded-2xl p-5 pt-5">
              <h2 className="text-[15px] font-bold text-warm-800 mb-2 flex items-center gap-1.5">
                <Star size={18} className="text-warm-500" fill="#f5a932" />客户反馈
              </h2>
              <p className="text-sm text-warm-800 leading-relaxed">{task.storyFeedback}</p>
              {task.storyFocus && (
                <p className="text-xs text-warm-600 mt-2">客户最关注：{task.storyFocus}</p>
              )}
            </div>
          </div>
        )}

        {/* Solution */}
        {task.storyReason && (
          <div className="bg-surface-50 rounded-2xl p-4">
            <h2 className="text-[15px] font-bold text-gray-900 mb-2">解决方案</h2>
            <p className="text-sm text-surface-600 leading-relaxed">{task.storyReason}</p>
            {task.storyWhy && (
              <p className="text-xs text-surface-500 mt-2 leading-relaxed">{task.storyWhy}</p>
            )}
          </div>
        )}

        {/* Product info */}
        <div className="bg-surface-50 rounded-2xl p-4">
          <h2 className="text-[15px] font-bold text-gray-900 mb-3">产品信息</h2>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-surface-400">产品</span>
              <span className="text-gray-900 font-medium">{task.brand} {task.model}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-surface-400">规格</span>
              <span className="text-gray-900">{task.size}</span>
            </div>
            {task.productSeries && (
              <div className="flex justify-between">
                <span className="text-surface-400">系列</span>
                <span className="text-gray-900">{task.productSeries}系列</span>
              </div>
            )}
            {task.productCategory && (
              <div className="flex justify-between">
                <span className="text-surface-400">品类</span>
                <span className="text-gray-900">{task.productCategory}</span>
              </div>
            )}
          </div>

          <div className="mt-4 pt-3 border-t border-surface-100">
            <p className="text-xs text-surface-500 mb-2 flex items-center gap-1">
              <Award size={12} className="text-navy-600" />核心卖点
            </p>
            <div className="space-y-1.5">
              {productFeatures.map((f, i) => (
                <div key={i} className="flex items-center gap-2 text-xs text-surface-600">
                  <div className="w-1.5 h-1.5 rounded-full bg-navy-500 flex-shrink-0" />{f}
                </div>
              ))}
            </div>
          </div>

          {/* Suitable for */}
          <div className="mt-3 pt-3 border-t border-surface-100">
            <p className="text-xs text-surface-500 mb-1">适合人群</p>
            <div className="flex flex-wrap gap-1.5">
              {fitCustomers.map((item, i) => (
                <span key={i} className="text-[10px] px-2 py-0.5 rounded-full bg-surface-50 text-surface-600">{item}</span>
              ))}
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-surface-50 text-surface-600">{task.scene}</span>
            </div>
          </div>

          {/* Customer page copy (from knowledge base) */}
          {productKnowledge?.customerPageCopy && (
            <div className="mt-3 pt-3 border-t border-surface-100">
              <p className="text-xs text-surface-500 mb-1">产品简介</p>
              <p className="text-xs text-surface-600 leading-relaxed">{productKnowledge.customerPageCopy}</p>
            </div>
          )}
        </div>

        {/* Service trust */}
        <div className="bg-surface-50 rounded-2xl p-4">
          <h2 className="text-sm font-semibold text-gray-700 mb-3 flex items-center gap-1.5">
            <Store size={16} className="text-navy-600" />本地门店服务
          </h2>
          <div className="space-y-2 text-sm">
            <div className="flex items-center gap-2">
              <MapPin size={14} className="text-surface-400 flex-shrink-0" />
              <span className="text-surface-600">支持预约到店体验</span>
            </div>
            <div className="flex items-center gap-2">
              <Star size={14} className="text-warm-400 flex-shrink-0" fill="#f5a932" />
              <span className="text-surface-600">本店已积累 {storeCaseCount} 个真实案例</span>
            </div>
            <div className="flex items-center gap-2">
              <Clock size={14} className="text-surface-400 flex-shrink-0" />
              <span className="text-surface-600">支持到店试睡体验</span>
            </div>
          </div>
          <p className="text-xs text-surface-400 mt-3 leading-relaxed">
            可预约到店免费体验多款产品，专业睡眠顾问一对一服务
          </p>
        </div>

        {/* Privacy notice */}
        <div className="bg-surface-50 rounded-xl p-3 flex items-start gap-2">
          <Shield size={14} className="text-surface-400 flex-shrink-0 mt-0.5" />
          <p className="text-xs text-surface-400 leading-relaxed">
            本案例为真实门店交付案例，隐私信息已脱敏处理。
          </p>
        </div>
      </div>

      {/* ── Bottom CTAs ── */}
      <BottomActions task={task} customerTitle={customerTitle} salesId={salesId} />
    </div>
  );
}

// ── Bottom Actions ──
function BottomActions({
  task, customerTitle, salesId,
}: {
  task: NonNullable<ReturnType<typeof mockDeliveryTasks.find>>;
  customerTitle: string;
  salesId: string;
}) {
  const [leadInterestType, setLeadInterestType] = useState<string | null>(null);
  const [showContactSheet, setShowContactSheet] = useState(false);

  return (
    <>
      <div className="fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-app bg-white/95 backdrop-blur border-t border-surface-100 z-40 safe-bottom">
        <div className="flex items-center gap-2 px-4 py-3">
          <button onClick={() => setLeadInterestType('预约体验同款')}
            className="flex-1 h-12 bg-navy-800 text-white font-semibold rounded-xl text-sm active:bg-navy-900 transition-colors shadow-sm flex items-center justify-center gap-1.5">
            <Phone size={16} />预约体验同款
          </button>
          <button onClick={() => setShowContactSheet(true)}
            className="flex-1 h-12 bg-white border-2 border-navy-800 text-navy-800 font-semibold rounded-xl text-sm active:bg-navy-50 transition-colors flex items-center justify-center gap-1.5">
            <MessageCircle size={16} />咨询睡眠顾问
          </button>
        </div>
      </div>

      {leadInterestType && (
        <LeadFormModal
          task={task} customerTitle={customerTitle}
          salesId={salesId} interestType={leadInterestType}
          onClose={() => setLeadInterestType(null)}
        />
      )}
      {showContactSheet && (
        <ContactAdvisorSheet
          task={task} customerTitle={customerTitle}
          salesId={salesId}
          onClose={() => setShowContactSheet(false)}
          onRequestLead={() => {
            setShowContactSheet(false);
            setLeadInterestType('咨询同款产品');
          }}
        />
      )}
    </>
  );
}

// ── Contact Advisor Sheet ──
function ContactAdvisorSheet({
  task, customerTitle, salesId, onClose, onRequestLead,
}: {
  task: NonNullable<ReturnType<typeof mockDeliveryTasks.find>>;
  customerTitle: string;
  salesId: string;
  onClose: () => void;
  onRequestLead: () => void;
}) {
  const [copyStatus, setCopyStatus] = useState<'idle' | 'success' | 'failed'>('idle');

  const wechatId = `tempur-${task.city === '苏州' ? 'suzhou' : task.city === '南京' ? 'nanjing' : task.city === '无锡' ? 'wuxi' : 'shanghai'}001`;

  const handleCopyWechat = async () => {
    const result = await copyText(wechatId);
    if (result.success) { setCopyStatus('success'); }
    else { setCopyStatus('failed'); }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center">
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />
      <div className="relative bg-white rounded-t-3xl sm:rounded-3xl w-full sm:max-w-sm shadow-premium animate-fade-up max-h-[90vh] overflow-y-auto">
        <div className="flex justify-center pt-3 pb-1">
          <div className="w-10 h-1 rounded-full bg-surface-200" />
        </div>

        <div className="px-5 pb-6">
          <h3 className="text-lg font-bold text-gray-900 mb-1">联系睡眠顾问</h3>
          <p className="text-xs text-surface-400 mb-4">
            了解同款方案详情，顾问一对一为您服务
          </p>

          <div className="bg-surface-50 rounded-xl px-3 py-2.5 text-xs text-surface-600 mb-4 space-y-1">
            <div className="flex justify-between gap-3">
              <span className="text-surface-400 flex-shrink-0">当前案例</span>
              <span className="font-medium text-gray-800 text-right">{customerTitle}</span>
            </div>
            <div className="flex justify-between gap-3">
              <span className="text-surface-400 flex-shrink-0">当前产品</span>
              <span className="font-medium text-gray-800 text-right">{task.brand} {task.model}</span>
            </div>
            {task.productSeries && (
              <div className="flex justify-between"><span className="text-surface-400">产品系列</span><span className="font-medium text-gray-800">{task.productSeries}</span></div>
            )}
            <div className="flex justify-between"><span className="text-surface-400">城市</span><span className="font-medium text-gray-800">{task.city}</span></div>
            {(salesId || task.salesId) && (
              <div className="flex justify-between"><span className="text-surface-400">专属顾问</span><span className="font-medium text-gray-800">{task.salesName}</span></div>
            )}
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
              <p className="text-xs text-surface-400 text-center mt-1">
                长按识别二维码，添加睡眠顾问
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
            <button
              onClick={onRequestLead}
              className="w-full h-10 bg-navy-50 text-navy-700 font-semibold rounded-xl text-sm active:bg-navy-100 transition-colors flex items-center justify-center gap-1.5"
            >
              填写信息，顾问联系我
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// ── Lead Form Modal ──
function LeadFormModal({
  task, customerTitle, salesId, interestType, onClose,
}: {
  task: NonNullable<ReturnType<typeof mockDeliveryTasks.find>>;
  customerTitle: string;
  salesId: string;
  interestType: string;
  onClose: () => void;
}) {
  const [alias, setAlias] = useState('');
  const [phone, setPhone] = useState('');
  const [product, setProduct] = useState(`${task.brand} ${task.model}`);
  const [remark, setRemark] = useState('');
  const [agreed, setAgreed] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = () => {
    if (!alias.trim() || !phone.trim() || phone.length < 11 || !agreed) return;

    const leadPayload = {
      alias: alias.trim(),
      phone: phone.trim(),
      remark: remark.trim(),
      sourceCaseId: task.id,
      sourceSalesId: salesId || task.salesId,
      sourceStoreId: task.storeId,
      sourceStoreName: task.storeName,
      interestProduct: product.trim() || task.model,
      interestType,
      sourceAction: interestType === '咨询同款产品' ? 'consult_same_product' : 'book_same_product',
      createdAt: new Date().toISOString(),
    };
    addShareLead(leadPayload);
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
            <p className="text-sm text-surface-500 leading-relaxed">
              {task.salesName} 会尽快联系您
            </p>
            <div className="mt-3 bg-surface-50 rounded-xl p-3 text-left">
              <div className="flex items-center gap-2">
                <MapPin size={14} className="text-surface-400" />
                <span className="text-xs text-surface-600">{task.city}</span>
              </div>
            </div>
            <p className="text-xs text-surface-400 mt-3">请保持手机畅通</p>
            <button onClick={onClose}
              className="w-full h-11 bg-navy-800 text-white font-semibold rounded-xl text-sm mt-4 active:bg-navy-900 transition-colors">
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
          <h3 className="text-lg font-bold text-gray-900 mb-1">{interestType}</h3>
          <p className="text-xs text-surface-400 mb-4">留下联系方式，我们将尽快联系您</p>

          <div className="bg-surface-50 rounded-xl px-3 py-2 text-xs text-surface-500 mb-4 flex items-center gap-1.5">
            <ShoppingBag size={12} />
            <span className="truncate">{task.brand} {task.model} · {task.city}</span>
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
              className="w-full h-12 bg-navy-800 text-white font-semibold rounded-xl text-sm active:bg-navy-900 transition-colors disabled:opacity-40 disabled:cursor-not-allowed shadow-sm">
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

import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth, useToast } from '../App';
import { addDealReport } from '../mock/data';
import { ArrowLeft, Send, TrendingUp, FileText } from 'lucide-react';

const customerSources = [
  '自然进店',
  '老客户介绍',
  '线上咨询',
  '电话邀约',
  '活动引流',
  '异业合作',
  '其他',
];

const templates = [
  {
    label: '老客户介绍',
    source: '老客户介绍',
    story: '老客户张先生半年前在本店购买了TEMPUR床垫，使用体验非常好。这次主动带邻居李女士来店里体验。李女士试躺了多款床垫后，对TEMPUR的支撑感和贴合度非常满意。老客户的真实口碑是最有说服力的，当场就下了订单。',
    summary: '老客户转介绍成交率远高于新客，维护好老客户关系就是最好的获客方式。',
  },
  {
    label: '到店试睡',
    source: '自然进店',
    story: '客户王先生周末到店，原本只是随便看看。我们邀请他试躺了TEMPUR FORM系列，详细讲解了材质的感温特性和人体工学设计。客户试躺后明显感觉到和普通床垫的差异，特别是腰部支撑非常到位。经过对比三个型号后，最终选择了最适合他睡眠习惯的一款。',
    summary: '好的产品会自己说话，试躺体验是成交的关键环节，一定要让客户躺下来感受。',
  },
  {
    label: '线上咨询',
    source: '线上咨询',
    story: '客户赵女士通过大众点评找到我们门店，在线咨询了多款床垫的区别。我们耐心讲解了TEMPUR材质的特点，并邀请她到店体验。到店后根据她的睡眠习惯推荐了合适的型号，客户非常满意产品的贴合感和透气性，当天就确定了购买意向。',
    summary: '线上线索要快速响应、专业解答，把客户从线上引导到线下体验，成交率会大幅提升。',
  },
  {
    label: '活动引流',
    source: '活动引流',
    story: '本次商场周年庆活动吸引了大量客流，客户陈先生在活动中了解到TEMPUR品牌。我们为他安排了深度试躺体验，同时介绍了当前的优惠方案。客户对比了其他品牌后，认为TEMPUR在舒适度和支撑性上明显更优，加上活动优惠力度大，当场决定购买。',
    summary: '活动是把客户引到店的好机会，但最终成交靠的是产品实力和专业的服务。',
  },
  {
    label: '长期跟进',
    source: '电话邀约',
    story: '客户刘先生3个月前到店了解过产品，当时说"考虑考虑"。我们一直保持微信联系，定期分享产品知识和客户案例，没有频繁打扰。最近客户主动联系我们说腰疼加重，想换床垫。再次到店试躺后，客户对TEMPUR的腰部支撑效果非常认可，终于下单。',
    summary: '坚持就是胜利，不轻易放弃任何一个客户。长期跟进的关键是提供价值而不是频繁推销。',
  },
];

export default function DealReportSubmit() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { showToast } = useToast();

  const [amount, setAmount] = useState('');
  const [productName, setProductName] = useState('TEMPUR');
  const [productModel, setProductModel] = useState('');
  const [customerSource, setCustomerSource] = useState('');
  const [story, setStory] = useState('');
  const [summary, setSummary] = useState('');

  if (!user) return null;

  const handleSubmit = () => {
    if (!amount || Number(amount) <= 0) { showToast('请填写成交金额'); return; }
    if (!productModel.trim()) { showToast('请填写销售产品型号'); return; }
    if (!customerSource) { showToast('请选择客户来源'); return; }
    if (!story.trim()) { showToast('请填写成交过程'); return; }
    if (!summary.trim()) { showToast('请填写成交总结'); return; }

    addDealReport({
      city: user.city || '',
      storeId: user.storeId || '',
      storeName: user.storeName || '',
      salesId: user.phone,
      salesName: user.name || '',
      amount: Number(amount),
      productName,
      productModel: productModel.trim(),
      customerSource,
      story: story.trim(),
      summary: summary.trim(),
    });

    showToast('成交喜报已提交，等待管理员审核');
    setTimeout(() => navigate('/'), 600);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white px-4 pt-12 pb-3 border-b border-gray-100 flex items-center gap-3">
        <button onClick={() => navigate(-1)} className="text-gray-500">
          <ArrowLeft size={22} />
        </button>
        <div>
          <h1 className="text-lg font-semibold text-gray-900">发布成交喜报</h1>
          <p className="text-xs text-gray-400">{user.storeName} · {user.name}</p>
        </div>
      </div>

      <div className="px-4 py-4 space-y-4 pb-6">
        {/* Amount */}
        <div className="bg-white rounded-xl p-4 shadow-card">
          <label className="text-sm font-semibold text-gray-700 mb-1.5 block">
            成交金额 <span className="text-red-400">*</span>
          </label>
          <div className="flex items-center gap-2">
            <span className="text-lg font-bold text-gray-400">¥</span>
            <input
              type="number"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder="如 33000"
              className="flex-1 px-3 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-lg font-bold text-gray-900 focus:outline-none focus:border-navy-400"
            />
          </div>
        </div>

        {/* Templates */}
        <div className="bg-white rounded-xl p-4 shadow-card">
          <label className="text-sm font-semibold text-gray-700 mb-1.5 block flex items-center gap-1.5">
            <FileText size={14} />快速填写模板
          </label>
          <p className="text-xs text-surface-400 mb-2">选择一个场景自动填充来源、过程和总结</p>
          <div className="flex flex-wrap gap-2">
            {templates.map((tpl) => (
              <button
                key={tpl.label}
                onClick={() => {
                  setCustomerSource(tpl.source);
                  setStory(tpl.story);
                  setSummary(tpl.summary);
                }}
                className="px-3.5 py-2 rounded-full text-xs font-medium bg-surface-50 text-surface-600 border border-surface-200 active:bg-navy-50 active:text-navy-700 active:border-navy-200 transition-all"
              >
                {tpl.label}
              </button>
            ))}
          </div>
        </div>

        {/* Product */}
        <div className="bg-white rounded-xl p-4 shadow-card">
          <label className="text-sm font-semibold text-gray-700 mb-1.5 block">
            销售产品 <span className="text-red-400">*</span>
          </label>
          <input
            type="text"
            value={productName}
            onChange={(e) => setProductName(e.target.value)}
            placeholder="品牌"
            className="w-full px-3 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm mb-2 focus:outline-none focus:border-navy-400"
          />
          <input
            type="text"
            value={productModel}
            onChange={(e) => setProductModel(e.target.value)}
            placeholder="产品型号，如 TEMPUR FORM™ 芸枫系列床垫"
            className="w-full px-3 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-navy-400"
          />
        </div>

        {/* Customer Source */}
        <div className="bg-white rounded-xl p-4 shadow-card">
          <label className="text-sm font-semibold text-gray-700 mb-1.5 block">
            客户来源 <span className="text-red-400">*</span>
          </label>
          <div className="flex flex-wrap gap-2">
            {customerSources.map((src) => (
              <button
                key={src}
                onClick={() => setCustomerSource(src)}
                className={`px-3.5 py-2 rounded-full text-sm font-medium transition-all ${
                  customerSource === src
                    ? 'bg-navy-800 text-white shadow-sm'
                    : 'bg-gray-50 text-gray-600 active:bg-gray-100'
                }`}
              >
                {src}
              </button>
            ))}
          </div>
        </div>

        {/* Story */}
        <div className="bg-white rounded-xl p-4 shadow-card">
          <label className="text-sm font-semibold text-gray-700 mb-1.5 block">
            成交过程 <span className="text-red-400">*</span>
          </label>
          <textarea
            value={story}
            onChange={(e) => setStory(e.target.value)}
            placeholder="描述客户从接触到成交的过程，突出关键转折点和导购的跟进方法"
            rows={4}
            className="w-full px-3 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm resize-none focus:outline-none focus:border-navy-400"
          />
        </div>

        {/* Summary */}
        <div className="bg-white rounded-xl p-4 shadow-card">
          <label className="text-sm font-semibold text-gray-700 mb-1.5 block">
            成交总结 <span className="text-red-400">*</span>
          </label>
          <textarea
            value={summary}
            onChange={(e) => setSummary(e.target.value)}
            placeholder="一句话总结，如：坚持就是胜利，不轻易放弃任何一个客户"
            rows={2}
            className="w-full px-3 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm resize-none focus:outline-none focus:border-navy-400"
          />
        </div>

        {/* Info */}
        <div className="bg-amber-50 border border-amber-200 rounded-xl p-3">
          <div className="flex items-center gap-2">
            <TrendingUp size={14} className="text-amber-500" />
            <p className="text-xs text-amber-700">
              提交后需管理员审核，通过后展示在首页成交喜报，并奖励 +20 成长积分
            </p>
          </div>
        </div>

        <button onClick={handleSubmit}
          className="w-full h-12 bg-navy-800 text-white font-semibold rounded-xl text-base active:bg-navy-900 transition-colors shadow-lg shadow-navy-200 flex items-center justify-center gap-2">
          <Send size={18} />
          提交成交喜报
        </button>
      </div>
    </div>
  );
}

import { useState, useMemo } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useToast } from '../App';
import {
  getAllDeliveryTasks, updateDeliveryTask, CASE_COIN_RULES, POINTS_RULES,
  addCaseCoins, hasCoinAward, getUserIdBySalesId,
  addPointRecord, hasPointRecord,
  getAllDealReports, updateDealReportStatus,
  getUserIdByInstallerId, addDeliveryPoints,
} from '../mock/data';
import type { DeliveryTask, DealReport } from '../mock/data';
import { AlertTriangle, CheckCircle2, Star, Coins, TrendingUp, ChevronDown, ChevronUp, Camera, ShieldCheck } from 'lucide-react';

const filterTabs = [
  { key: 'pending', label: '待审核' },
  { key: 'approved', label: '已通过' },
  { key: 'rejected', label: '已驳回' },
  { key: 'duplicate', label: '疑似重复' },
  { key: 'all', label: '全部' },
];

const dealFilterTabs = [
  { key: 'pending', label: '待审核' },
  { key: 'approved', label: '已通过' },
  { key: 'rejected', label: '已驳回' },
  { key: 'all', label: '全部' },
];

export default function AdminDelivery() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { showToast } = useToast();
  const [activeTab, setActiveTab] = useState('pending');
  const [mainTab, setMainTab] = useState<'case' | 'deal'>(
    searchParams.get('tab') === 'deal' ? 'deal' : 'case'
  );
  const [showRules, setShowRules] = useState(false);
  const [showDealRules, setShowDealRules] = useState(false);

  // ── React state for delivery tasks (mutable) ──
  const [tasks, setTasks] = useState<DeliveryTask[]>(() =>
    getAllDeliveryTasks().map(t => ({ ...t }))
  );

  // ── React state for deal reports ──
  const [dealReports, setDealReports] = useState<DealReport[]>(() =>
    getAllDealReports()
  );
  const [dealFilter, setDealFilter] = useState('pending');

  const refreshDealReports = () => setDealReports(getAllDealReports());

  // ═══════════ Case review logic ═══════════

  const filteredTasks = useMemo(() => {
    let list = tasks;
    switch (activeTab) {
      case 'pending': list = list.filter(t => t.reviewStatus === 'pending' || t.reviewStatus === 'story_done'); break;
      case 'approved': list = list.filter(t => t.reviewStatus === 'approved' || t.reviewStatus === 'featured'); break;
      case 'rejected': list = list.filter(t => t.reviewStatus === 'rejected'); break;
      case 'duplicate': list = list.filter(t => t.reviewStatus === 'suspected_dup' || t.reviewStatus === 'confirmed_dup'); break;
    }
    return list;
  }, [tasks, activeTab]);

  const updateTaskStatus = (taskId: string, status: DeliveryTask['reviewStatus']) => {
    updateDeliveryTask(taskId, { reviewStatus: status });
    setTasks(prev => prev.map(t => t.id === taskId ? { ...t, reviewStatus: status } : t));
  };

  const getSubmitterUserId = (salesId: string): string => {
    const fromSales = getUserIdBySalesId(salesId);
    if (fromSales) return fromSales;
    // For dealer_owner direct submissions, salesId is the user's own phone
    return salesId || '';
  };

  const handleApprove = (taskId: string) => {
    const task = tasks.find(t => t.id === taskId);
    if (!task) return;
    const submitterUserId = getSubmitterUserId(task.salesId);
    if (submitterUserId) {
      if (!hasCoinAward(submitterUserId, 'approved_case', taskId)) {
        addCaseCoins(submitterUserId, CASE_COIN_RULES.approved_case, 'approved_case', `案例审核通过：${task.model}`, taskId);
      }
      if (!hasPointRecord(submitterUserId, 'delivery_approved', taskId)) {
        addPointRecord(submitterUserId, POINTS_RULES.case_approved, 'delivery_approved', `案例审核通过：${task.model}`, taskId);
      }
    }
    // Installer gets delivery points +10, no case coins
    const installerUserId = getUserIdByInstallerId(task.installerId);
    if (installerUserId) {
      addDeliveryPoints(installerUserId, 10, 'approved_photo', `照片审核合格：${task.model}`, taskId, 5);
    }
    updateTaskStatus(taskId, 'approved');
    showToast('审核通过！已发放积分、案例币和交付积分');
  };

  const handleReject = (taskId: string) => {
    updateTaskStatus(taskId, 'rejected');
    showToast('已驳回（不发放奖励）');
  };

  const handleMarkDuplicate = (taskId: string) => {
    updateTaskStatus(taskId, 'confirmed_dup');
    showToast('已标记为判定重复，积分、案例币和交付奖励均不发放');
  };

  const handleFeature = (taskId: string) => {
    const task = tasks.find(t => t.id === taskId);
    if (!task) return;
    const submitterUserId = getSubmitterUserId(task.salesId);
    if (submitterUserId) {
      if (!hasCoinAward(submitterUserId, 'featured_case', taskId)) {
        addCaseCoins(submitterUserId, CASE_COIN_RULES.featured_case, 'featured_case', `案例设为精选：${task.model}`, taskId);
      }
      if (!hasPointRecord(submitterUserId, 'sales_featured', taskId)) {
        addPointRecord(submitterUserId, POINTS_RULES.case_featured, 'sales_featured', `案例设为精选：${task.model}`, taskId);
      }
    }
    // Installer gets featured delivery points +20, reward 10 yuan
    const installerUserId = getUserIdByInstallerId(task.installerId);
    if (installerUserId) {
      addDeliveryPoints(installerUserId, 20, 'featured_photo', `案例设为精选：${task.model}`, taskId, 10);
    }
    updateTaskStatus(taskId, 'featured');
    showToast('已设为精选案例！额外积分、案例币和交付积分已发放');
  };

  // ═══════════ Deal report review logic ═══════════

  const filteredDeals = useMemo(() => {
    let list = dealReports;
    switch (dealFilter) {
      case 'pending': list = list.filter(d => d.status === 'pending'); break;
      case 'approved': list = list.filter(d => d.status === 'approved'); break;
      case 'rejected': list = list.filter(d => d.status === 'rejected'); break;
    }
    return list;
  }, [dealReports, dealFilter]);

  const handleDealApprove = (reportId: string) => {
    const report = dealReports.find(d => d.id === reportId);
    if (!report) return;
    if (report.salesId && !hasPointRecord(report.salesId, 'delivery_approved', reportId)) {
      addPointRecord(report.salesId, 20, 'delivery_approved', `成交喜报审核通过：${report.productModel}`, reportId);
    }
    updateDealReportStatus(reportId, 'approved');
    refreshDealReports();
    showToast('成交喜报已通过！+20 积分');
  };

  const handleDealReject = (reportId: string) => {
    updateDealReportStatus(reportId, 'rejected');
    refreshDealReports();
    showToast('成交喜报已驳回');
  };

  // ═══════════ Render ═══════════

  const pendingCaseCount = tasks.filter(t => t.reviewStatus === 'pending' || t.reviewStatus === 'story_done').length;
  const pendingDealCount = dealReports.filter(d => d.status === 'pending').length;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white px-4 pt-12 pb-3 border-b border-gray-100 flex items-center gap-3">
        <button onClick={() => navigate(-1)} className="text-gray-500">
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
            <path d="M15 18l-6-6 6-6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </button>
        <div>
          <h1 className="text-lg font-semibold text-gray-900">管理员审核</h1>
          <p className="text-xs text-gray-400">管理员 · 品牌总部</p>
        </div>
      </div>

      {/* ── Main Tabs: 案例审核 / 成交喜报 ── */}
      <div className="bg-white border-b border-gray-50">
        <div className="flex gap-1 px-4 py-2.5">
          <button onClick={() => setMainTab('case')}
            className={`flex-1 py-2 rounded-full text-sm font-semibold transition-all ${
              mainTab === 'case' ? 'bg-navy-800 text-white shadow-sm' : 'bg-gray-50 text-gray-500'
            }`}>
            案例审核
            {pendingCaseCount > 0 && (
              <span className="ml-1 bg-red-500 text-white text-[10px] px-1.5 py-0.5 rounded-full">{pendingCaseCount}</span>
            )}
          </button>
          <button onClick={() => setMainTab('deal')}
            className={`flex-1 py-2 rounded-full text-sm font-semibold transition-all ${
              mainTab === 'deal' ? 'bg-navy-800 text-white shadow-sm' : 'bg-gray-50 text-gray-500'
            }`}>
            成交喜报
            {pendingDealCount > 0 && (
              <span className="ml-1 bg-red-500 text-white text-[10px] px-1.5 py-0.5 rounded-full">{pendingDealCount}</span>
            )}
          </button>
        </div>
      </div>

      {/* ── Overview Stats Bar ── */}
      <div className="px-4 pt-3">
        <div className="grid grid-cols-4 gap-2">
          <div className="bg-blue-50 rounded-xl p-2.5 text-center">
            <div className="text-base font-bold text-blue-700">{pendingCaseCount}</div>
            <div className="text-[10px] text-blue-600 mt-0.5">待审核案例</div>
          </div>
          <div className="bg-orange-50 rounded-xl p-2.5 text-center">
            <div className="text-base font-bold text-orange-600">{tasks.filter(t => t.reviewStatus === 'suspected_dup').length}</div>
            <div className="text-[10px] text-orange-500 mt-0.5">疑似重复</div>
          </div>
          <div className="bg-green-50 rounded-xl p-2.5 text-center">
            <div className="text-base font-bold text-green-600">{tasks.filter(t => t.reviewStatus === 'approved' || t.reviewStatus === 'featured').length}</div>
            <div className="text-[10px] text-green-500 mt-0.5">已通过</div>
          </div>
          <div className="bg-amber-50 rounded-xl p-2.5 text-center">
            <div className="text-base font-bold text-amber-600">{pendingDealCount}</div>
            <div className="text-[10px] text-amber-500 mt-0.5">待审喜报</div>
          </div>
        </div>
      </div>

      {/* ═══════════════════════════════════ */}
      {/* ── Case Review Tab ── */}
      {/* ═══════════════════════════════════ */}
      {mainTab === 'case' && (
      <>
        {/* Filter Tabs */}
        <div className="bg-white border-b border-gray-50">
          <div className="category-tabs flex gap-1 px-4 py-2.5 no-scrollbar">
            {filterTabs.map((tab) => (
              <button key={tab.key} onClick={() => setActiveTab(tab.key)}
                className={`flex-shrink-0 px-3.5 py-1.5 rounded-full text-sm font-medium transition-all ${
                  activeTab === tab.key ? 'bg-primary-600 text-white shadow-sm' : 'bg-gray-50 text-gray-500 active:bg-gray-100'
                }`}>
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {/* Case Coin Reward Policy (collapsible) */}
        <div className="px-4 pt-3">
          <button onClick={() => setShowRules(!showRules)}
            className="w-full bg-navy-50 border border-navy-200 rounded-xl p-3 flex items-center justify-between active:bg-navy-100 transition-colors">
            <div className="flex items-center gap-2">
              <Coins size={14} className="text-navy-600" />
              <p className="text-xs font-semibold text-navy-700">奖励发放规则</p>
            </div>
            {showRules ? <ChevronUp size={16} className="text-navy-500" /> : <ChevronDown size={16} className="text-navy-500" />}
          </button>
          {showRules && (
            <div className="text-xs text-navy-600 space-y-0.5 mt-2 bg-navy-50/50 rounded-xl p-3 border border-navy-100">
              <p>· 审核通过：导购获得积分和案例币</p>
              <p>· 审核通过：安装师傅获得交付积分，合格案例 +1，预计奖励 +5元</p>
              <p>· 设为精选：导购获得额外积分和案例币</p>
              <p>· 设为精选：安装师傅获得额外交付积分，精选案例 +1，预计奖励 +10元</p>
              <p className="text-red-500">· 疑似重复/判定重复/隐私/水印/模糊：不发放案例币，也不发放安装师傅交付奖励</p>
            </div>
          )}
        </div>

        {/* Task List */}
        <div className="px-4 pt-3 pb-4 space-y-3">
          {filteredTasks.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 text-gray-400">
              <svg width="48" height="48" viewBox="0 0 24 24" fill="none">
                <path d="M9 12l2 2 4-4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="1.5"/>
              </svg>
              <p className="mt-3 text-sm">暂无{filterTabs.find(t => t.key === activeTab)?.label}案例</p>
            </div>
          ) : (
            filteredTasks.map((task) => {
              const isPending = task.reviewStatus === 'pending' || task.reviewStatus === 'story_done';
              const isDup = task.reviewStatus === 'suspected_dup';
              return (
                <div key={task.id} className="bg-white rounded-xl shadow-sm overflow-hidden">
                  {/* Summary */}
                  <div onClick={() => navigate(`/delivery/detail/${task.id}`)}
                    className="p-4 cursor-pointer active:bg-gray-50">
                    <div className="flex items-start justify-between mb-3">
                      <div>
                        <h3 className="text-base font-semibold text-gray-900">{task.customerAlias} · {task.model}</h3>
                        <p className="text-xs text-gray-400 mt-0.5">{task.storeName} · {task.salesName} · {task.installerName}</p>
                      </div>
                      <span className={`text-[10px] px-2 py-0.5 rounded-full font-medium flex-shrink-0 ${
                        task.reviewStatus === 'pending' || task.reviewStatus === 'story_done' ? 'bg-blue-100 text-blue-700' :
                        task.reviewStatus === 'approved' ? 'bg-green-100 text-green-700' :
                        task.reviewStatus === 'rejected' ? 'bg-red-100 text-red-600' :
                        task.reviewStatus === 'suspected_dup' ? 'bg-orange-100 text-orange-700' :
                        task.reviewStatus === 'featured' ? 'bg-amber-100 text-amber-700' :
                        'bg-gray-100 text-gray-600'
                      }`}>
                        {task.reviewStatus === 'story_done' ? '待审核' :
                         task.reviewStatus === 'featured' ? '精选' :
                         task.reviewStatus === 'suspected_dup' ? '疑似重复' :
                         {pending:'待审核',approved:'已通过',rejected:'已驳回',confirmed_dup:'判定重复',draft:'草稿',photos_uploaded:'待补故事'}[task.reviewStatus] || task.reviewStatus}
                      </span>
                    </div>

                    {/* Install Photos */}
                    {task.installImages.length > 0 && (
                      <div className="flex gap-1 mb-3 overflow-x-auto no-scrollbar">
                        {task.installImages.map((img, i) => (
                          <div key={i} className="w-16 h-16 rounded-lg overflow-hidden flex-shrink-0">
                            <img src={img} alt="" className="w-full h-full object-cover" />
                          </div>
                        ))}
                      </div>
                    )}

                    {/* Key info tags */}
                    <div className="flex flex-wrap gap-1.5 text-xs">
                      <span className={'px-2 py-0.5 rounded-full font-medium ' + (
                        task.authStatus === '可公开使用' ? 'bg-green-50 text-green-600' :
                        task.authStatus === '仅内部学习' ? 'bg-amber-50 text-amber-600' :
                        'bg-gray-100 text-gray-500'
                      )}>授权：{task.authStatus}</span>
                      {task.storyPublic && (
                        <span className={'px-2 py-0.5 rounded-full font-medium ' + (
                          task.storyPublic === '适合公开传播' ? 'bg-green-50 text-green-600' : 'bg-gray-100 text-gray-500'
                        )}>{task.storyPublic}</span>
                      )}
                      {task.installStatus && (
                        <span className="px-2 py-0.5 rounded-full bg-blue-50 text-blue-600 font-medium">
                          安装：{task.installStatus === 'completed' ? '已完成' : task.installStatus}
                        </span>
                      )}
                      {task.storyWhy && <span className="px-2 py-0.5 rounded-full bg-indigo-50 text-indigo-600 font-medium">已有故事</span>}
                      {task.installImages.length === 0 && <span className="px-2 py-0.5 rounded-full bg-gray-100 text-gray-500 font-medium">暂无照片</span>}
                    </div>

                    {/* Privacy Check */}
                    {task.privacyChecks && Object.values(task.privacyChecks).some(v => v) && (
                      <div className="mt-3 p-3 bg-red-50 border border-red-100 rounded-lg">
                        <p className="text-xs font-semibold text-red-700 mb-1.5">隐私检查未通过</p>
                        <div className="grid grid-cols-2 gap-x-3 gap-y-0.5 text-xs text-red-600">
                          {task.privacyChecks.hasFace && <span>• 有人脸</span>}
                          {task.privacyChecks.hasDoorNumber && <span>• 有门牌号</span>}
                          {task.privacyChecks.hasPhoneOrAddress && <span>• 有手机号/地址</span>}
                          {task.privacyChecks.hasDeliveryDocOrContract && <span>• 有送货单/合同/发票</span>}
                          {task.privacyChecks.hasPriceInfo && <span>• 有价格信息</span>}
                          {task.privacyChecks.hasCompetitorBrand && <span>• 有竞品露出</span>}
                          {task.privacyChecks.hasClutteredScene && <span>• 现场过于杂乱</span>}
                        </div>
                      </div>
                    )}

                    {/* Duplicate warning */}
                    {isDup && (
                      <div className="mt-3 p-3 bg-orange-50 border border-orange-100 rounded-lg">
                        <p className="text-xs font-medium text-orange-700 flex items-center gap-1">
                          <AlertTriangle size={12} />疑似重复 · 请重点核查
                        </p>
                        <p className="text-xs text-orange-600 mt-1">
                          安装照片与案例 #{task.dupRefTaskId?.toUpperCase()} 相似度较高
                          {(() => {
                            const refTask = tasks.find(t => t.id === task.dupRefTaskId);
                            if (!refTask) return null;
                            return (
                              <span>
                                {refTask.storeName !== task.storeName && (
                                  <span className="text-red-500 font-medium"> · 跨门店重复（{refTask.storeName} ⇄ {task.storeName}）</span>
                                )}
                                {refTask.storeName === task.storeName && (
                                  <span className="text-amber-600"> · 同门店（{task.storeName}）</span>
                                )}
                              </span>
                            );
                          })()}
                        </p>
                      </div>
                    )}

                    {/* Rejected note */}
                    {task.reviewNote && task.reviewStatus === 'rejected' && (
                      <div className="mt-2 p-2 bg-red-50 rounded-lg text-xs text-red-600">
                        驳回原因：{task.reviewNote}
                      </div>
                    )}
                  </div>

                  {/* Action Buttons (for pending) */}
                  {isPending && (
                    <div className="border-t border-gray-50">
                      <button onClick={() => handleApprove(task.id)}
                        className="w-full py-3 text-sm font-semibold text-white bg-green-600 active:bg-green-700 transition-colors flex items-center justify-center gap-1.5">
                        <CheckCircle2 size={16} />审核通过
                      </button>
                      <div className="flex border-t border-gray-100">
                        <button onClick={() => handleReject(task.id)}
                          className="flex-1 py-2.5 text-xs font-medium text-red-500 active:bg-red-50 transition-colors">
                          ↩ 驳回补拍
                        </button>
                        <button onClick={() => handleMarkDuplicate(task.id)}
                          className="flex-1 py-2.5 text-xs font-medium text-orange-500 active:bg-orange-50 transition-colors border-x border-gray-100">
                          <AlertTriangle size={11} className="inline mr-0.5" />判定重复
                        </button>
                        <button onClick={() => handleFeature(task.id)}
                          className="flex-1 py-2.5 text-xs font-medium text-amber-600 active:bg-amber-50 transition-colors">
                          <Star size={12} className="inline mr-0.5" />设为精选
                        </button>
                      </div>
                    </div>
                  )}

                  {/* For approved, show promote button */}
                  {(task.reviewStatus === 'approved') && (
                    <div className="flex border-t border-gray-50">
                      <button onClick={() => handleFeature(task.id)}
                        className="flex-1 py-3 text-sm font-medium text-amber-500 active:bg-amber-50 transition-colors">
                        <Star size={14} className="inline mr-1" />设为精选案例
                      </button>
                    </div>
                  )}

                  {/* For suspected_dup */}
                  {task.reviewStatus === 'suspected_dup' && (
                    <div className="border-t border-gray-50">
                      <button onClick={() => handleApprove(task.id)}
                        className="w-full py-3 text-sm font-semibold text-white bg-green-600 active:bg-green-700 transition-colors flex items-center justify-center gap-1.5">
                        <CheckCircle2 size={16} />不是重复，继续审核
                      </button>
                      <div className="flex border-t border-gray-100">
                        <button onClick={() => handleMarkDuplicate(task.id)}
                          className="flex-1 py-2.5 text-xs font-medium text-orange-500 active:bg-orange-50 transition-colors">
                          <AlertTriangle size={11} className="inline mr-0.5" />确认重复，不发奖励
                        </button>
                        <button onClick={() => handleReject(task.id)}
                          className="py-2.5 px-3 text-xs text-gray-400 active:bg-gray-50 transition-colors border-l border-gray-100">
                          ↩ 驳回补拍
                        </button>
                      </div>
                    </div>
                  )}

                  {/* For rejected */}
                  {task.reviewStatus === 'rejected' && (
                    <div className="flex border-t border-gray-50">
                      <button onClick={() => handleApprove(task.id)}
                        className="flex-1 py-3 text-sm font-semibold text-green-600 active:bg-green-50 transition-colors">
                        <CheckCircle2 size={14} className="inline mr-1" />重新审核通过
                      </button>
                    </div>
                  )}
                </div>
              );
            })
          )}
        </div>
      </>
      )}

      {/* ═══════════════════════════════════ */}
      {/* ── Deal Report Review Tab ── */}
      {/* ═══════════════════════════════════ */}
      {mainTab === 'deal' && (
      <>
        {/* Filter Tabs */}
        <div className="bg-white border-b border-gray-50">
          <div className="category-tabs flex gap-1 px-4 py-2.5 no-scrollbar">
            {dealFilterTabs.map((tab) => (
              <button key={tab.key} onClick={() => setDealFilter(tab.key)}
                className={`flex-shrink-0 px-3.5 py-1.5 rounded-full text-sm font-medium transition-all ${
                  dealFilter === tab.key ? 'bg-primary-600 text-white shadow-sm' : 'bg-gray-50 text-gray-500 active:bg-gray-100'
                }`}>
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {/* Deal reward policy (collapsible) */}
        <div className="px-4 pt-3">
          <button onClick={() => setShowDealRules(!showDealRules)}
            className="w-full bg-amber-50 border border-amber-200 rounded-xl p-3 flex items-center justify-between active:bg-amber-100 transition-colors">
            <div className="flex items-center gap-2">
              <TrendingUp size={14} className="text-amber-600" />
              <p className="text-xs font-semibold text-amber-700">成交喜报奖励规则</p>
            </div>
            {showDealRules ? <ChevronUp size={16} className="text-amber-600" /> : <ChevronDown size={16} className="text-amber-600" />}
          </button>
          {showDealRules && (
            <div className="text-xs text-amber-700 space-y-0.5 mt-2 bg-amber-50/50 rounded-xl p-3 border border-amber-100">
              <p>· 审核通过：+20 成长积分</p>
              <p className="text-red-500">· 不发放案例币</p>
            </div>
          )}
        </div>

        {/* Deal Report List */}
        <div className="px-4 pt-3 pb-4 space-y-3">
          {filteredDeals.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 text-gray-400">
              <TrendingUp size={40} strokeWidth={1} className="mb-3" />
              <p className="text-sm">暂无{dealFilterTabs.find(t => t.key === dealFilter)?.label}成交喜报</p>
            </div>
          ) : (
            filteredDeals.map((report) => {
              const isPending = report.status === 'pending';
              return (
                <div key={report.id} className="bg-white rounded-xl shadow-sm overflow-hidden">
                  <div className="p-4">
                    <div className="flex items-start justify-between mb-2">
                      <div>
                        <h3 className="text-base font-semibold text-gray-900">
                          {report.storeName} · {report.salesName}
                        </h3>
                        <p className="text-xs text-gray-400 mt-0.5">{report.city} · {report.createdAt}</p>
                      </div>
                      <span className={`text-[10px] px-2 py-0.5 rounded-full font-medium flex-shrink-0 ${
                        report.status === 'pending' ? 'bg-blue-100 text-blue-700' :
                        report.status === 'approved' ? 'bg-green-100 text-green-700' :
                        'bg-red-100 text-red-600'
                      }`}>
                        {{pending:'待审核',approved:'已通过',rejected:'已驳回'}[report.status]}
                      </span>
                    </div>

                    <div className="flex items-center gap-2 mb-2">
                      <span className="text-lg font-bold text-warm-600">¥{report.amount.toLocaleString()}</span>
                      <span className="text-xs text-gray-400">|</span>
                      <span className="text-xs text-gray-600">{report.productName} {report.productModel}</span>
                    </div>

                    <div className="grid grid-cols-2 gap-x-4 gap-y-1 text-xs mb-3">
                      <div>
                        <span className="text-gray-400">客户来源：</span>
                        <span className="text-gray-700">{report.customerSource}</span>
                      </div>
                      {report.relatedCaseId && (
                        <div>
                          <span className="text-gray-400">关联案例：</span>
                          <span className="text-navy-600 font-medium">#{report.relatedCaseId.toUpperCase()}</span>
                        </div>
                      )}
                    </div>

                    <p className="text-xs text-surface-600 leading-relaxed line-clamp-3 mb-2">
                      {report.story}
                    </p>
                    <p className="text-xs text-surface-500 italic">
                      —— {report.summary}
                    </p>
                  </div>

                  {isPending && (
                    <div className="flex border-t border-gray-50">
                      <button onClick={() => handleDealReject(report.id)}
                        className="flex-1 py-3 text-sm font-medium text-red-500 active:bg-red-50 transition-colors">
                        ↩ 驳回
                      </button>
                      <button onClick={() => handleDealApprove(report.id)}
                        className="flex-1 py-3 text-sm font-semibold text-green-600 active:bg-green-50 transition-colors">
                        <CheckCircle2 size={14} className="inline mr-1" />审核通过
                      </button>
                    </div>
                  )}
                </div>
              );
            })
          )}
        </div>
      </>
      )}
    </div>
  );
}

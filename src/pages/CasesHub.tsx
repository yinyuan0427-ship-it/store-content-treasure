import { useState, useMemo, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth, useToast } from '../App';
import { getAllDeliveryTasks, mockDeliveryTasks, getShareableCases, canShareCase, mockSalesPersons, getInstallerByUserId, getSalesByUserId } from '../mock/data';
import { Upload, Pencil, FileText, Camera, ChevronRight, Share2, Send, Sparkles, X, Layers } from 'lucide-react';
import { copyText } from '../utils/clipboard';
import CopyModal from '../components/CopyModal';
import { buildShareQuery, getShareUrl } from '../utils/share';

const salesTabs = [
  { key: 'all_shareable', label: '全部案例' },
  { key: 'mine', label: '我的跟进' },
  { key: 'need_story', label: '待补故事' },
  { key: 'pending', label: '待审核' },
  { key: 'approved', label: '已通过' },
  { key: 'rejected', label: '被驳回' },
  { key: 'dup', label: '疑似重复' },
];

const installerTabs = [
  { key: 'mine', label: '全部任务' },
  { key: 'todo', label: '待上传' },
  { key: 'done', label: '已完成' },
];

const ownerTabs = [
  { key: 'mine', label: '本店案例' },
  { key: 'need_story', label: '待补故事' },
  { key: 'pending', label: '待审核' },
  { key: 'approved', label: '已通过' },
  { key: 'shareable', label: '可分享' },
  { key: 'rejected', label: '被驳回' },
];

const statusConfig: Record<string, { label: string; cls: string }> = {
  draft: { label: '待安装', cls: 'bg-surface-100 text-surface-500' },
  photos_uploaded: { label: '待补故事', cls: 'bg-warm-50 text-warm-700' },
  story_done: { label: '待审核', cls: 'bg-blue-50 text-blue-700' },
  pending: { label: '待审核', cls: 'bg-blue-50 text-blue-700' },
  approved: { label: '已通过', cls: 'bg-green-50 text-green-700' },
  rejected: { label: '已驳回', cls: 'bg-red-50 text-red-600' },
  suspected_dup: { label: '疑似重复', cls: 'bg-orange-50 text-orange-700' },
  confirmed_dup: { label: '判定重复', cls: 'bg-surface-100 text-surface-500' },
  featured: { label: '精选案例', cls: 'bg-warm-50 text-warm-700 border border-warm-200' },
};

// ── Product filter helpers ──

function getCategoryGroup(task: typeof mockDeliveryTasks[number]): string {
  const pc = task.productCategory || '';
  const text = `${pc} ${task.productName || ''} ${task.productSeries || ''} ${task.model || ''}`.toLowerCase();
  if (pc === '床垫' || text.includes('床垫') || text.includes('mattress')) return '床垫';
  if (pc === '枕头' || text.includes('枕头') || text.includes('pillow')) return '枕头';
  if (pc === '智能床' || text.includes('智能床') || text.includes('smart base') || text.includes('ergo smart')) return '智能床';
  return '';
}

function getSeriesGroup(task: typeof mockDeliveryTasks[number]): string {
  const text = `${task.productSeries || ''} ${task.productName || ''} ${task.productModel || ''} ${task.model || ''}`.toLowerCase();
  if (text.includes('芸枫') || text.includes('tempur form')) return '芸枫';
  if (text.includes('梵璞怡然') || text.includes('梵璞·怡然') || text.includes('pro 梵璞') || text.includes('tempur pro')) return '梵璞怡然';
  if (text.includes('赛瑞斯')) return '赛瑞斯';
  if (text.includes('赛腾')) return '赛腾';
  if (text.includes('麦凯瑞')) return '麦凯瑞';
  // Category-based series fallback
  const pc = task.productCategory || '';
  if (pc === '枕头' || text.includes('枕头') || text.includes('pillow') || text.includes('ergoplus') || text.includes('感温舒颈枕')) return '枕头';
  if (pc === '智能床' || text.includes('智能床') || text.includes('smart base') || text.includes('ergo smart')) return '智能床';
  return '';
}

function getModelGroup(task: typeof mockDeliveryTasks[number]): string {
  const text = `${task.model || ''} ${task.productModel || ''} ${task.productName || ''}`.toLowerCase();
  if (text.includes('软款') && text.includes('25cm')) return '软款 25cm';
  if (text.includes('中软款') && text.includes('25cm')) return '中软款 25cm';
  if (text.includes('硬款') && text.includes('25cm')) return '硬款 25cm';
  if (text.includes('25cm')) return '25cm';
  if (text.includes('ergoplus') || text.includes('感温舒颈枕')) return 'ErgoPlus';
  if (text.includes('智能床') || text.includes('smart base')) return '智能床';
  return task.productModel || task.model || '';
}

const CATEGORY_OPTIONS = [
  { key: 'all', label: '全部' },
  { key: '床垫', label: '床垫' },
  { key: '枕头', label: '枕头' },
  { key: '智能床', label: '智能床' },
];

const SERIES_OPTIONS = [
  { key: 'all', label: '全部系列' },
  { key: '芸枫', label: '芸枫' },
  { key: '梵璞怡然', label: '梵璞怡然' },
  { key: '赛瑞斯', label: '赛瑞斯' },
  { key: '赛腾', label: '赛腾' },
  { key: '麦凯瑞', label: '麦凯瑞' },
  { key: '枕头', label: '枕头' },
  { key: '智能床', label: '智能床' },
];

export default function CasesHub() {
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useAuth();
  const { showToast } = useToast();
  const [copyModalText, setCopyModalText] = useState('');

  useEffect(() => {
    if (user?.role === 'installer') {
      navigate('/delivery/tasks', { replace: true });
    }
  }, [user?.role, navigate]);

  const getShareSalesId = (task: typeof mockDeliveryTasks[number]) => {
    if (user?.role === 'sales') return getSalesByUserId(user.phone)?.id || task.salesId;
    return task.salesId;
  };

  const handleCopyCaseLink = async (task: typeof mockDeliveryTasks[number]) => {
    const link = getShareUrl(task.id, getShareSalesId(task), {
      storeId: task.storeId,
      channel: 'wechat_private',
      entry: 'cases_hub',
    });
    const result = await copyText(link);
    if (result.success) {
      showToast('案例链接已复制，可以发给意向客户');
    } else {
      setCopyModalText(link);
    }
  };

  const params = new URLSearchParams(location.search);
  const initialTab = params.get('tab') || 'mine';
  const [activeTab, setActiveTab] = useState(initialTab);
  const [salesFilter, setSalesFilter] = useState('all');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [seriesFilter, setSeriesFilter] = useState('all');

  useEffect(() => {
    if (user?.role === 'sales' && !params.get('tab') && activeTab === 'mine') {
      setActiveTab('all_shareable');
    }
  }, [user?.role, activeTab, params]);

  const storeSales = useMemo(() => {
    if (user?.role !== 'dealer_owner') return [];
    return mockSalesPersons.filter(s => s.storeId === user.storeId);
  }, [user?.role, user?.storeId]);

  const { title, tabs, filterFn } = useMemo(() => {
    const allTasks = getAllDeliveryTasks();
    switch (user?.role) {
      case 'installer': {
        const installerId = getInstallerByUserId(user.phone)?.id || '';
        const tasks = allTasks.filter(t => t.installerId === installerId);
        return {
          title: '我的案例采集',
          tabs: installerTabs,
          filterFn: (tab: string) => {
            switch (tab) {
              case 'todo': return tasks.filter(t => t.installImages.length === 0);
              case 'done': return tasks.filter(t => t.installImages.length > 0);
              default: return tasks;
            }
          },
        };
      }
      case 'sales': {
        const salesId = getSalesByUserId(user.phone)?.id || '';
        const tasks = allTasks.filter(t => t.salesId === salesId);
        const shareableTasks = getShareableCases();
        return {
          title: '案例素材库',
          tabs: salesTabs,
          filterFn: (tab: string) => {
            switch (tab) {
              case 'all_shareable': return shareableTasks;
              case 'need_story': return tasks.filter(t => t.installImages.length > 0 && !t.storyWhy && t.reviewStatus !== 'rejected');
              case 'pending': return tasks.filter(t => t.reviewStatus === 'pending' || t.reviewStatus === 'story_done');
              case 'approved': return tasks.filter(t => t.reviewStatus === 'approved' || t.reviewStatus === 'featured');
              case 'rejected': return tasks.filter(t => t.reviewStatus === 'rejected');
              case 'dup': return tasks.filter(t => t.reviewStatus === 'suspected_dup' || t.reviewStatus === 'confirmed_dup');
              default: return tasks;
            }
          },
        };
      }
      case 'dealer_owner': {
        const tasks = allTasks.filter(t => t.storeId === user.storeId);
        return {
          title: `${user.storeName} · 案例`,
          tabs: ownerTabs,
          filterFn: (tab: string) => {
            switch (tab) {
              case 'need_story': return tasks.filter(t => t.installImages.length > 0 && !t.storyWhy && t.reviewStatus !== 'rejected');
              case 'pending': return tasks.filter(t => t.reviewStatus === 'pending' || t.reviewStatus === 'story_done');
              case 'approved': return tasks.filter(t => t.reviewStatus === 'approved' || t.reviewStatus === 'featured');
              case 'shareable': return tasks.filter(t => canShareCase(t));
              case 'rejected': return tasks.filter(t => t.reviewStatus === 'rejected');
              default: return tasks;
            }
          },
        };
      }
      case 'admin': {
        const all = allTasks;
        return {
          title: '全部案例',
          tabs: [
            { key: 'pending', label: '待审核' },
            { key: 'approved', label: '已通过' },
            { key: 'dup', label: '疑似重复' },
            { key: 'mine', label: '全部' },
          ],
          filterFn: (tab: string) => {
            switch (tab) {
              case 'pending': return all.filter(t => t.reviewStatus === 'pending' || t.reviewStatus === 'story_done');
              case 'approved': return all.filter(t => t.reviewStatus === 'approved' || t.reviewStatus === 'featured');
              case 'dup': return all.filter(t => t.reviewStatus === 'suspected_dup' || t.reviewStatus === 'confirmed_dup');
              default: return all;
            }
          },
        };
      }
      default: return { title: '案例', tabs: [] as typeof salesTabs, filterFn: () => [] as typeof mockDeliveryTasks };
    }
  }, [user]);

  // Staged filter chain: tab → category → series
  const tabFiltered = useMemo(() => {
    let tasks = filterFn(activeTab);
    if (user?.role === 'dealer_owner' && salesFilter !== 'all') {
      tasks = tasks.filter(t => t.salesId === salesFilter);
    }
    return tasks;
  }, [activeTab, filterFn, user?.role, salesFilter]);

  const categoryFiltered = useMemo(() => {
    let tasks = tabFiltered;
    if (categoryFilter !== 'all') {
      tasks = tasks.filter(t => getCategoryGroup(t) === categoryFilter);
    }
    return tasks;
  }, [tabFiltered, categoryFilter]);

  const seriesFiltered = useMemo(() => {
    let tasks = categoryFiltered;
    if (seriesFilter !== 'all') {
      tasks = tasks.filter(t => getSeriesGroup(t) === seriesFilter);
    }
    return tasks;
  }, [categoryFiltered, seriesFilter]);

  const needStoryCount = user?.role === 'sales' || user?.role === 'dealer_owner'
    ? filterFn('need_story').length
    : 0;

  const canCreate = ['sales', 'dealer_owner', 'admin'].includes(user?.role || '');
  const canUpload = user?.role === 'installer';
  const currentSalesId = user?.role === 'dealer_owner' ? '' : getSalesByUserId(user?.phone || '')?.id || '';

  const [selectMode, setSelectMode] = useState(false);
  const [selectedCaseIds, setSelectedCaseIds] = useState<Set<string>>(new Set());

  const toggleSelectCase = (taskId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setSelectedCaseIds(prev => {
      const next = new Set(prev);
      if (next.has(taskId)) next.delete(taskId); else next.add(taskId);
      return next;
    });
  };

  const exitSelectMode = () => {
    setSelectMode(false);
    setSelectedCaseIds(new Set());
  };

  const handleGenerateCollection = async () => {
    if (selectedCaseIds.size === 0) { showToast('请至少选择 1 个案例'); return; }
    if (selectedCaseIds.size > 9) { showToast('最多选择 9 个案例'); return; }
    const ids = [...selectedCaseIds].join(',');
    const shareSalesId = user?.role === 'sales' ? currentSalesId : '';
    const firstCase = seriesFiltered.find(t => selectedCaseIds.has(t.id));
    const query = buildShareQuery({
      caseId: firstCase?.id || ids.split(',')[0] || 'collection',
      salesId: shareSalesId,
      storeId: firstCase?.storeId || user?.storeId,
      channel: 'wechat_private',
      entry: 'case_collection',
      extra: { caseIds: ids },
    });
    const link = `${window.location.origin}/share/collection?${query}`;
    const result = await copyText(link);
    if (result.success) {
      showToast('合集链接已复制');
    } else {
      setCopyModalText(link);
    }
    exitSelectMode();
  };

  const handleTabChange = (tab: string) => {
    setActiveTab(tab);
    exitSelectMode();
    navigate(`/cases-hub?tab=${tab}`, { replace: true });
  };

  const handleCategoryChange = (cat: string) => {
    setCategoryFilter(cat);
    exitSelectMode();
    if (cat !== 'all') setSeriesFilter('all');
  };

  const handleSeriesChange = (ser: string) => {
    setSeriesFilter(ser);
    exitSelectMode();
  };

  if (!user) return null;

  return (
    <div className="min-h-screen bg-surface-50 flex flex-col">
      {/* Header */}
      <div className="bg-white px-4 pt-12 pb-3 border-b border-surface-100">
        <div className="flex items-center justify-between">
          <h1 className="text-lg font-semibold text-gray-900">{title}</h1>
          {(user.role === 'sales' || user.role === 'dealer_owner' || user.role === 'admin') && !selectMode && (
            <button
              onClick={() => setSelectMode(true)}
              className="flex items-center gap-1 text-xs text-navy-700 font-medium bg-navy-50 px-3 py-1.5 rounded-full active:bg-navy-100 transition-colors"
            >
              <Layers size={13} />
              生成案例合集
            </button>
          )}
          {selectMode && (
            <button
              onClick={exitSelectMode}
              className="flex items-center gap-1 text-xs text-surface-500 font-medium bg-surface-100 px-3 py-1.5 rounded-full active:bg-surface-200 transition-colors"
            >
              <X size={13} />
              取消
            </button>
          )}
        </div>

        {needStoryCount > 0 && (
          <div className="mt-2 bg-warm-50 border border-warm-200 rounded-xl px-3 py-2 flex items-center gap-2">
            <Pencil size={14} className="text-warm-500 flex-shrink-0" />
            <span className="text-sm text-warm-700">你有 {needStoryCount} 个案例等待补充成交故事</span>
          </div>
        )}
      </div>

      {/* Tabs */}
      <div className="bg-white border-b border-surface-100">
        <div className="category-tabs flex gap-1 px-4 py-2.5 no-scrollbar">
          {tabs.map((tab) => {
            const count = filterFn(tab.key).length;
            return (
              <button
                key={tab.key}
                onClick={() => handleTabChange(tab.key)}
                className={`flex-shrink-0 px-3.5 py-1.5 rounded-full text-sm font-medium transition-all ${
                  activeTab === tab.key
                    ? 'bg-navy-800 text-white shadow-sm'
                    : 'bg-surface-50 text-surface-500 active:bg-surface-100'
                }`}
              >
                {tab.label}
                {count > 0 && (
                  <span className={`ml-1 text-xs ${activeTab === tab.key ? 'text-white/70' : 'text-surface-400'}`}>
                    {count}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Sales Filter (dealer_owner only) */}
      {user.role === 'dealer_owner' && storeSales.length > 0 && (
        <div className="bg-white border-b border-surface-100 px-4 py-2">
          <div className="flex items-center gap-2 overflow-x-auto no-scrollbar">
            <span className="text-[10px] text-surface-400 flex-shrink-0">按导购：</span>
            <button onClick={() => setSalesFilter('all')}
              className={`flex-shrink-0 px-2.5 py-1 rounded-full text-[11px] font-medium transition-all ${
                salesFilter === 'all' ? 'bg-navy-800 text-white' : 'bg-surface-50 text-surface-500 active:bg-surface-100'
              }`}>
              全部
            </button>
            {storeSales.map(s => (
              <button key={s.id} onClick={() => setSalesFilter(s.id)}
                className={`flex-shrink-0 px-2.5 py-1 rounded-full text-[11px] font-medium transition-all ${
                  salesFilter === s.id ? 'bg-navy-800 text-white' : 'bg-surface-50 text-surface-500 active:bg-surface-100'
                }`}>
                {s.name}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Product Filter: Category + Series */}
      <div className="bg-white border-b border-surface-100 px-4 py-2.5 space-y-2">
        {/* Category row */}
        <div className="flex items-center gap-2 overflow-x-auto no-scrollbar">
          {CATEGORY_OPTIONS.map(cat => {
            const count = cat.key === 'all'
              ? tabFiltered.length
              : tabFiltered.filter(t => getCategoryGroup(t) === cat.key).length;
            return (
              <button
                key={cat.key}
                onClick={() => handleCategoryChange(cat.key)}
                className={`flex-shrink-0 px-3 py-1.5 rounded-full text-xs font-medium transition-all ${
                  categoryFilter === cat.key
                    ? 'bg-navy-800 text-white shadow-sm'
                    : 'bg-surface-50 text-surface-500 active:bg-surface-100'
                }`}
              >
                {cat.label}
                {count > 0 && (
                  <span className={`ml-1 ${categoryFilter === cat.key ? 'text-white/70' : 'text-surface-400'}`}>
                    {count}
                  </span>
                )}
              </button>
            );
          })}
        </div>
        {/* Series row */}
        <div className="flex items-center gap-2 overflow-x-auto no-scrollbar">
          {SERIES_OPTIONS.map(ser => {
            const count = ser.key === 'all'
              ? categoryFiltered.length
              : categoryFiltered.filter(t => getSeriesGroup(t) === ser.key).length;
            return (
              <button
                key={ser.key}
                onClick={() => handleSeriesChange(ser.key)}
                className={`flex-shrink-0 px-2.5 py-1 rounded-full text-[11px] font-medium transition-all ${
                  seriesFilter === ser.key
                    ? 'bg-navy-700 text-white shadow-sm'
                    : 'bg-surface-50 text-surface-500 active:bg-surface-100'
                }`}
              >
                {ser.label}
                {count > 0 && (
                  <span className={`ml-1 ${seriesFilter === ser.key ? 'text-white/70' : 'text-surface-400'}`}>
                    {count}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* List */}
      <div className="flex-1 px-4 pt-3 pb-24 space-y-2">
        {seriesFiltered.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-surface-400">
            <FileText size={40} strokeWidth={1} className="mb-3" />
            <p className="text-sm">暂无案例</p>
          </div>
        ) : (
          seriesFiltered.map((task) => {
            const sc = statusConfig[task.reviewStatus] || { label: task.reviewStatus, cls: 'bg-surface-100' };
            const isApproved = task.reviewStatus === 'approved' || task.reviewStatus === 'featured';
            const canShare = canShareCase(task);

            const authLabel = task.authStatus === '可公开使用' ? '可分享' : task.authStatus === '仅内部学习' ? '内部案例' : task.authStatus === '不确定，不可公开' ? '待审核' : '';
            const isSelectable = canShareCase(task);
            const isSelected = selectedCaseIds.has(task.id);

            return (
              <div
                key={task.id}
                onClick={selectMode
                  ? (isSelectable ? ((e) => toggleSelectCase(task.id, e as any)) : undefined)
                  : (() => navigate(`/delivery/detail/${task.id}`))}
                className={`bg-white rounded-xl shadow-card ${
                  selectMode && isSelectable ? 'cursor-pointer active:bg-surface-50' :
                  selectMode ? 'cursor-default opacity-50' :
                  'cursor-pointer active:bg-surface-50'
                } ${
                  canShare ? 'border-l-[3px] border-l-green-400' :
                  task.reviewStatus === 'rejected' ? 'border-l-[3px] border-l-red-300' :
                  'border-l-[3px] border-l-navy-200'
                }`}
              >
                <div className="px-3 py-2.5">
                  {selectMode && (
                    <div className="flex items-center mb-2">
                      <div className={`w-5 h-5 rounded border-2 flex items-center justify-center flex-shrink-0 ${
                        isSelected ? 'bg-navy-800 border-navy-800' :
                        isSelectable ? 'border-surface-300' : 'border-surface-200 bg-surface-100'
                      }`}>
                        {isSelected && (
                          <svg width="12" height="12" viewBox="0 0 24 24" fill="none">
                            <path d="M5 12l4 4L19 7" stroke="white" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"/>
                          </svg>
                        )}
                      </div>
                      <span className={`text-xs ml-2 ${isSelectable ? 'text-gray-700' : 'text-surface-400'}`}>
                        {isSelectable ? '选择此案例' : '不可分享'}
                      </span>
                    </div>
                  )}
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="text-sm font-semibold text-gray-900">{task.customerAlias} · {task.model}</span>
                    <div className="flex items-center gap-1.5">
                      {authLabel && (
                        <span className={`text-[10px] px-1.5 py-0.5 rounded-full font-medium ${
                          task.authStatus === '可公开使用' ? 'bg-green-50 text-green-600' :
                          task.authStatus === '不确定，不可公开' ? 'bg-red-50 text-red-500' :
                          'bg-surface-100 text-surface-400'
                        }`}>{authLabel}</span>
                      )}
                      <span className={`text-[10px] px-2 py-0.5 rounded-full font-medium ${sc.cls}`}>{sc.label}</span>
                    </div>
                  </div>
                  {/* Product labels */}
                  <div className="flex items-center gap-1.5 flex-wrap mb-1">
                    {(() => {
                      const cat = getCategoryGroup(task);
                      const ser = getSeriesGroup(task);
                      const model = getModelGroup(task);
                      const tags: string[] = [];
                      if (cat) tags.push(cat);
                      if (ser) tags.push(ser);
                      if (model && model !== ser && model !== cat) tags.push(model);
                      return tags.map((t, i) => (
                        <span key={i} className="text-[10px] px-1.5 py-0.5 rounded-full bg-navy-50 text-navy-700 font-medium">{t}</span>
                      ));
                    })()}
                  </div>
                  <div className="flex items-center gap-2 text-xs text-surface-400">
                    <span>{task.city}</span>
                    <span>·</span>
                    <span>{task.scene}</span>
                    <span>·</span>
                    <span>{task.salesName}</span>
                    {task.installerName && user.role !== 'installer' && (
                      <><span>·</span><span>{task.installerName}</span></>
                    )}
                  </div>
                  {task.storyFeedback && (
                    <p className="text-xs text-surface-500 mt-2 line-clamp-2 leading-relaxed">"{task.storyFeedback}"</p>
                  )}
                  {task.installImages.length > 0 && (
                    <div className="flex gap-1 mt-2 overflow-x-auto no-scrollbar">
                      {task.installImages.slice(0, 4).map((img, i) => (
                        <div key={i} className="w-12 h-12 rounded-lg overflow-hidden flex-shrink-0">
                          <img src={img} alt="" className="w-full h-full object-cover" />
                        </div>
                      ))}
                    </div>
                  )}
                  {/* Action area */}
                  {(user.role === 'sales' || user.role === 'dealer_owner' || user.role === 'admin') && canShare ? (
                    <div className="mt-2.5 flex items-center gap-2" onClick={(e) => e.stopPropagation()}>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          const url = new URL(getShareUrl(task.id, getShareSalesId(task), {
                            storeId: task.storeId,
                            channel: 'preview',
                            entry: 'cases_hub',
                          }));
                          navigate(`${url.pathname}${url.search}`);
                        }}
                        className="flex-1 h-9 bg-navy-800 text-white font-semibold rounded-xl text-[13px] active:bg-navy-900 transition-colors flex items-center justify-center gap-1.5"
                      >
                        <Send size={14} /> 发给客户
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          const url = new URL(getShareUrl(task.id, getShareSalesId(task), {
                            storeId: task.storeId,
                            channel: 'preview',
                            entry: 'cases_hub',
                          }));
                          navigate(`${url.pathname}${url.search}`);
                        }}
                        className="h-9 px-3 bg-surface-50 text-surface-600 font-medium rounded-xl text-[11px] active:bg-surface-100 transition-colors flex items-center gap-1 border border-surface-200"
                      >
                        <Send size={12} /> 预览
                      </button>
                      {isApproved && (
                        <button
                          onClick={(e) => { e.stopPropagation(); navigate(`/ai-generate/delivery/${task.id}`); }}
                          className="h-9 px-3 bg-purple-50 text-purple-600 font-medium rounded-xl text-[11px] active:bg-purple-100 transition-colors flex items-center gap-1"
                        >
                          <Sparkles size={12} /> 转素材
                        </button>
                      )}
                    </div>
                  ) : (user.role === 'sales' || user.role === 'dealer_owner') ? (
                    <div className="mt-2.5 flex items-center justify-between" onClick={(e) => e.stopPropagation()}>
                      <span className="text-xs text-surface-400">
                        {task.reviewStatus === 'pending' || task.reviewStatus === 'story_done' ? '审核通过后可分享' :
                         task.reviewStatus === 'rejected' ? '需修改后重新提交' :
                         task.installImages.length > 0 && !task.storyWhy ? '补充成交故事后可审核' :
                         '暂不可分享'}
                      </span>
                      <button
                        onClick={(e) => { e.stopPropagation(); navigate(`/delivery/detail/${task.id}`); }}
                        className="text-xs text-navy-700 font-medium flex items-center gap-0.5 flex-shrink-0"
                      >
                        {task.installImages.length > 0 && !task.storyWhy ? '继续完善' :
                         task.reviewStatus === 'rejected' ? '查看驳回原因' :
                         '查看详情'}
                        <ChevronRight size={12} />
                      </button>
                    </div>
                  ) : user.role === 'installer' ? (
                    <div className="mt-2.5 flex items-center justify-end" onClick={(e) => e.stopPropagation()}>
                      <button
                        onClick={(e) => { e.stopPropagation(); navigate(`/delivery/detail/${task.id}`); }}
                        className="text-xs text-navy-700 font-medium flex items-center gap-0.5"
                      >
                        {task.installImages.length === 0 ? '去上传' : '查看详情'} <ChevronRight size={12} />
                      </button>
                    </div>
                  ) : null}
                </div>
              </div>
            );
          })
        )}
      </div>

      {copyModalText && (
        <CopyModal text={copyModalText} onClose={() => setCopyModalText('')} />
      )}

      {/* Share Collection (for sales & dealer_owner) */}
      {!selectMode && (user.role === 'sales' || user.role === 'dealer_owner') && (
        <ShareCollectionSection
          salesId={currentSalesId}
          isOwner={user.role === 'dealer_owner'}
          storeId={user.storeId}
          storeName={user.storeName}
        />
      )}

      {/* Multi-select bottom bar */}
      {selectMode && (
        <div className="fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-app bg-white/95 backdrop-blur border-t border-surface-100 z-40 safe-bottom">
          <div className="flex items-center gap-3 px-4 py-3">
            <span className="text-sm text-gray-700 flex-shrink-0">
              已选择 <span className="font-bold text-navy-800">{selectedCaseIds.size}</span> 个案例
            </span>
            <button onClick={exitSelectMode}
              className="flex-1 h-11 bg-surface-100 text-surface-600 font-medium rounded-xl text-sm active:bg-surface-200 transition-colors">
              取消
            </button>
            <button onClick={handleGenerateCollection}
              className="flex-1 h-11 bg-navy-800 text-white font-semibold rounded-xl text-sm active:bg-navy-900 transition-colors">
              生成合集链接
            </button>
          </div>
        </div>
      )}

      {/* Bottom Action */}
      <div className="fixed bottom-16 left-1/2 -translate-x-1/2 w-full max-w-app z-30 safe-bottom pointer-events-none">
        <div className="px-4 py-3 pointer-events-auto">
          {canCreate && (
            <button
              onClick={() => navigate('/delivery/create')}
              className="w-full h-12 bg-navy-800 text-white font-semibold rounded-xl text-base active:bg-navy-900 transition-colors shadow-lg shadow-navy-200 flex items-center justify-center gap-2"
            >
              <Upload size={18} />
              上传客户案例
            </button>
          )}
          {canUpload && (
            <button
              onClick={() => navigate('/delivery/tasks')}
              className="w-full h-12 bg-navy-800 text-white font-semibold rounded-xl text-base active:bg-navy-900 transition-colors shadow-lg shadow-navy-200 flex items-center justify-center gap-2"
            >
              <Camera size={18} />
              去上传安装照片
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

// ── Share Collection Section ──
function ShareCollectionSection({ salesId, isOwner, storeId, storeName }: { salesId: string; isOwner?: boolean; storeId?: string; storeName?: string }) {
  const navigate = useNavigate();
  const [showCollections, setShowCollections] = useState(false);

  const shareable = getShareableCases().filter(t => {
    if (isOwner && storeId) return t.storeId === storeId;
    return true;
  });
  const ownerQuery = isOwner && storeId
    ? `&sourceStoreId=${encodeURIComponent(storeId)}`
    : '';
  const seriesList = [...new Set(shareable.map(t => t.productSeries).filter(Boolean))];

  if (shareable.length === 0) return null;

  const collectionPath = (extra: Record<string, string>) => {
    const firstCase = shareable[0];
    const query = buildShareQuery({
      caseId: firstCase.id,
      salesId,
      storeId: storeId || firstCase.storeId,
      channel: 'wechat_private',
      entry: 'collection_shortcut',
      extra,
    });
    return `/share/collection?${query}${ownerQuery}`;
  };

  return (
    <div className="px-4 mt-3">
      {!showCollections ? (
        <button
          onClick={() => setShowCollections(true)}
          className="w-full h-11 bg-white border border-navy-200 text-navy-700 font-semibold rounded-xl text-sm active:bg-navy-50 transition-colors flex items-center justify-center gap-2 shadow-card"
        >
          <Share2 size={16} />
          分享案例合集（{shareable.length}个可分享案例）
        </button>
      ) : (
        <div className="bg-white rounded-2xl shadow-card border border-navy-100 overflow-hidden">
          <div className="flex items-center justify-between px-4 py-3 border-b border-surface-100">
            <h3 className="text-sm font-semibold text-gray-700 flex items-center gap-1.5">
              <Share2 size={16} className="text-navy-600" />分享案例合集
            </h3>
            <button onClick={() => setShowCollections(false)}
              className="text-xs text-surface-400 font-medium">收起</button>
          </div>

          {/* By Series */}
          {seriesList.length > 0 && (
            <div className="px-4 py-3">
              <p className="text-xs font-semibold text-surface-400 mb-2">按产品系列</p>
              <div className="flex gap-2 flex-wrap">
                {seriesList.map((series) => {
                  const count = shareable.filter(t => t.productSeries === series).length;
                  return (
                    <button key={series}
                      onClick={() => navigate(collectionPath({ productSeries: series }))}
                      className="px-3 py-1.5 rounded-full bg-surface-50 text-sm font-medium text-surface-600 active:bg-navy-50 active:text-navy-700 transition-colors">
                      {series} ({count})
                    </button>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

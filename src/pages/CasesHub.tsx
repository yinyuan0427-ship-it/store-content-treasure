import { useState, useMemo, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth, useToast } from '../App';
import { getAllDeliveryTasks, mockDeliveryTasks, getShareableCases, canShareCase, mockSalesPersons, getInstallerByUserId, getSalesByUserId } from '../mock/data';
import { Upload, Pencil, FileText, Camera, ChevronRight, Share2, Send, Sparkles, AlertTriangle, Copy } from 'lucide-react';
import { copyText } from '../utils/clipboard';
import CopyModal from '../components/CopyModal';

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
    const link = `${window.location.origin}/share/${task.id}?salesId=${getShareSalesId(task)}`;
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

  const filtered = useMemo(() => {
    let tasks = filterFn(activeTab);
    if (user?.role === 'dealer_owner' && salesFilter !== 'all') {
      tasks = tasks.filter(t => t.salesId === salesFilter);
    }
    return tasks;
  }, [activeTab, filterFn, user?.role, salesFilter]);

  const needStoryCount = user?.role === 'sales' || user?.role === 'dealer_owner'
    ? filterFn('need_story').length
    : 0;

  const canCreate = ['sales', 'dealer_owner', 'admin'].includes(user?.role || '');
  const canUpload = user?.role === 'installer';
  const currentSalesId = user?.role === 'dealer_owner' ? '' : getSalesByUserId(user?.phone || '')?.id || '';

  const handleTabChange = (tab: string) => {
    setActiveTab(tab);
    navigate(`/cases-hub?tab=${tab}`, { replace: true });
  };

  if (!user) return null;

  return (
    <div className="min-h-screen bg-surface-50 flex flex-col">
      {/* Header */}
      <div className="bg-white px-4 pt-12 pb-3 border-b border-surface-100">
        <h1 className="text-lg font-semibold text-gray-900">{title}</h1>

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

      {/* List */}
      <div className="flex-1 px-4 pt-3 pb-24 space-y-2">
        {filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-surface-400">
            <FileText size={40} strokeWidth={1} className="mb-3" />
            <p className="text-sm">暂无案例</p>
          </div>
        ) : (
          filtered.map((task) => {
            const sc = statusConfig[task.reviewStatus] || { label: task.reviewStatus, cls: 'bg-surface-100' };
            const isApproved = task.reviewStatus === 'approved' || task.reviewStatus === 'featured';
            const canShare = canShareCase(task);

            // Determine primary action
            let primaryAction = '';
            let primaryIcon = ChevronRight;
            if (task.installImages.length === 0 && user.role === 'installer') {
              primaryAction = '去上传'; primaryIcon = Camera;
            } else if (task.installImages.length > 0 && !task.storyWhy && (user.role === 'sales' || user.role === 'dealer_owner') && task.reviewStatus !== 'rejected') {
              primaryAction = '补故事'; primaryIcon = Pencil;
            } else if (task.reviewStatus === 'rejected' && (user.role === 'sales' || user.role === 'dealer_owner')) {
              primaryAction = '查看驳回原因'; primaryIcon = AlertTriangle;
            } else if (canShare && (user.role === 'sales' || user.role === 'dealer_owner')) {
              primaryAction = '发给客户'; primaryIcon = Send;
            }

            const authLabel = task.authStatus === '可公开使用' ? '可分享' : task.authStatus === '仅内部学习' ? '内部案例' : task.authStatus === '不确定，不可公开' ? '待审核' : '';
            return (
              <div
                key={task.id}
                onClick={() => navigate(`/delivery/detail/${task.id}`)}
                className={`bg-white rounded-xl shadow-card active:bg-surface-50 cursor-pointer overflow-hidden ${
                  canShare ? 'border-l-[3px] border-l-green-400' :
                  task.reviewStatus === 'rejected' ? 'border-l-[3px] border-l-red-300' :
                  'border-l-[3px] border-l-navy-200'
                }`}
              >
                <div className="p-3">
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
                        <div key={i} className="w-14 h-14 rounded-lg overflow-hidden flex-shrink-0">
                          <img src={img} alt="" className="w-full h-full object-cover" />
                        </div>
                      ))}
                    </div>
                  )}
                  {/* Action buttons */}
                  <div className="mt-2.5 flex items-center justify-end gap-2">
                    {canShare && (user.role === 'sales' || user.role === 'dealer_owner') && (
                      <>
                        <button
                          onClick={(e) => { e.stopPropagation(); handleCopyCaseLink(task); }}
                          className="h-8 px-3 bg-navy-50 text-navy-700 font-medium rounded-lg text-[11px] active:bg-navy-100 transition-colors flex items-center gap-1"
                        >
                          <Copy size={11} /> 一键复制链接
                        </button>
                        <button
                          onClick={(e) => { e.stopPropagation(); navigate(`/share/${task.id}?salesId=${getShareSalesId(task)}`); }}
                          className="h-8 px-3 bg-green-50 text-green-700 font-medium rounded-lg text-[11px] active:bg-green-100 transition-colors flex items-center gap-1"
                        >
                          <Send size={11} /> 发给客户
                        </button>
                      </>
                    )}
                    {isApproved && (user.role === 'sales' || user.role === 'dealer_owner') && (
                      <button
                        onClick={(e) => { e.stopPropagation(); navigate(`/ai-generate/delivery/${task.id}`); }}
                        className="h-8 px-3 bg-purple-50 text-purple-600 font-medium rounded-lg text-[11px] active:bg-purple-100 transition-colors flex items-center gap-1"
                      >
                        <Sparkles size={11} /> 转成素材
                      </button>
                    )}
                    {primaryAction && (
                      <span className="text-xs text-navy-700 font-medium flex items-center gap-0.5">
                        {primaryAction} <ChevronRight size={12} />
                      </span>
                    )}
                  </div>
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
      {(user.role === 'sales' || user.role === 'dealer_owner') && (
        <ShareCollectionSection
          salesId={currentSalesId}
          isOwner={user.role === 'dealer_owner'}
          storeId={user.storeId}
          storeName={user.storeName}
        />
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
              创建案例采集
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
    ? `&sourceStoreId=${encodeURIComponent(storeId)}&sourceStoreName=${encodeURIComponent(storeName || '')}`
    : '';
  const seriesList = [...new Set(shareable.map(t => t.productSeries).filter(Boolean))];
  const cityList = [...new Set(shareable.map(t => t.city).filter(Boolean))];
  const sceneList = [...new Set(shareable.map(t => t.scene).filter(Boolean))];

  if (shareable.length === 0) return null;

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
            <div className="px-4 py-3 border-b border-surface-50">
              <p className="text-xs font-semibold text-surface-400 mb-2">按产品系列</p>
              <div className="flex gap-2 flex-wrap">
                {seriesList.map((series) => {
                  const count = shareable.filter(t => t.productSeries === series).length;
                  return (
                    <button key={series}
                      onClick={() => navigate(`/share/collection?productSeries=${encodeURIComponent(series)}${salesId ? `&salesId=${salesId}` : ''}${ownerQuery}`)}
                      className="px-3 py-1.5 rounded-full bg-surface-50 text-sm font-medium text-surface-600 active:bg-navy-50 active:text-navy-700 transition-colors">
                      {series} ({count})
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* By City */}
          {cityList.length > 0 && (
            <div className="px-4 py-3 border-b border-surface-50">
              <p className="text-xs font-semibold text-surface-400 mb-2">按城市</p>
              <div className="flex gap-2 flex-wrap">
                {cityList.map((c) => {
                  const count = shareable.filter(t => t.city === c).length;
                  return (
                    <button key={c}
                      onClick={() => navigate(`/share/collection?city=${encodeURIComponent(c)}${salesId ? `&salesId=${salesId}` : ''}${ownerQuery}`)}
                      className="px-3 py-1.5 rounded-full bg-surface-50 text-sm font-medium text-surface-600 active:bg-navy-50 active:text-navy-700 transition-colors">
                      {c} ({count})
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* By Scene */}
          {sceneList.length > 0 && (
            <div className="px-4 py-3">
              <p className="text-xs font-semibold text-surface-400 mb-2">按使用场景</p>
              <div className="flex gap-2 flex-wrap">
                {sceneList.map((s) => {
                  const count = shareable.filter(t => t.scene === s).length;
                  return (
                    <button key={s}
                      onClick={() => navigate(`/share/collection?scene=${encodeURIComponent(s)}${salesId ? `&salesId=${salesId}` : ''}${ownerQuery}`)}
                      className="px-3 py-1.5 rounded-full bg-surface-50 text-sm font-medium text-surface-600 active:bg-navy-50 active:text-navy-700 transition-colors">
                      {s} ({count})
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

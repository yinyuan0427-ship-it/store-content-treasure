import { useNavigate } from 'react-router-dom';
import { useAuth } from '../App';
import { getAllDeliveryTasks, mockDeliveryTasks, getDeliveryRewardSummary, getDeliveryPointRecords, getInstallerByUserId } from '../mock/data';
import { useMemo } from 'react';
import { Camera, CheckCircle2, AlertTriangle, ChevronRight, Award, Coins } from 'lucide-react';

export default function InstallerHome() {
  const navigate = useNavigate();
  const { user } = useAuth();

  const uid = user?.phone || '';
  const installerId = getInstallerByUserId(uid)?.id || '';
  const today = new Date();
  const monthStr = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}`;

  const tasks = useMemo(() => {
    return getAllDeliveryTasks().filter(t => t.installerId === installerId);
  }, [installerId]);

  const pendingUpload = tasks.filter(t => t.installImages.length === 0 && t.reviewStatus !== 'rejected');
  const pendingReview = tasks.filter(t => t.installImages.length > 0 && (t.reviewStatus === 'pending' || t.reviewStatus === 'story_done'));
  const approved = tasks.filter(t => t.reviewStatus === 'approved' || t.reviewStatus === 'featured');
  const rejected = tasks.filter(t => t.reviewStatus === 'rejected');

  const rewardSummary = useMemo(() => getDeliveryRewardSummary(uid), [uid]);
  const pointRecords = useMemo(() => getDeliveryPointRecords(uid), [uid]);
  const monthRecords = pointRecords.filter(r => r.createdAt.startsWith(monthStr));
  const monthApproved = monthRecords.filter(r => r.type === 'approved_photo').length;
  const monthFeatured = monthRecords.filter(r => r.type === 'featured_photo').length;

  if (!user) return null;

  const getStatusBadge = (task: typeof mockDeliveryTasks[number]) => {
    if (task.reviewStatus === 'approved' || task.reviewStatus === 'featured') return { label: '已通过', cls: 'bg-green-100 text-green-700' };
    if (task.reviewStatus === 'rejected') return { label: '需补拍', cls: 'bg-red-100 text-red-600' };
    if (task.installImages.length > 0) return { label: '已上传待审核', cls: 'bg-blue-100 text-blue-700' };
    return { label: '待上传照片', cls: 'bg-amber-100 text-amber-700' };
  };

  return (
    <div className="min-h-screen bg-surface-50 pb-6">
      {/* Header */}
      <div className="hero-gradient soft-glow relative overflow-hidden px-5 pt-12 pb-5">
        <div className="absolute top-0 right-0 w-48 h-48 bg-blue-400/8 rounded-full blur-3xl pointer-events-none" />
        <div className="relative z-10">
          <h1 className="text-white text-lg font-semibold">{user.name}，今天需要上传交付照片</h1>
          <p className="text-blue-200/70 text-xs mt-1">{user.storeName} · {user.team}</p>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="px-4 -mt-3 relative z-10">
        <div className="grid grid-cols-4 gap-2">
          <div className="bg-white rounded-xl p-2.5 text-center shadow-card">
            <div className="text-lg font-bold text-green-600">{monthApproved}</div>
            <div className="text-[10px] text-surface-400 mt-0.5">本月合格案例</div>
          </div>
          <div className="bg-white rounded-xl p-2.5 text-center shadow-card">
            <div className="text-lg font-bold text-amber-500">{monthFeatured}</div>
            <div className="text-[10px] text-surface-400 mt-0.5">本月精选案例</div>
          </div>
          <div className="bg-white rounded-xl p-2.5 text-center shadow-card">
            <div className="text-lg font-bold text-red-500">{rejected.length}</div>
            <div className="text-[10px] text-surface-400 mt-0.5">问题照片</div>
          </div>
          <div className="bg-white rounded-xl p-2.5 text-center shadow-card">
            <div className="text-lg font-bold text-navy-700">¥{rewardSummary.totalReward}</div>
            <div className="text-[10px] text-surface-400 mt-0.5">预计奖励</div>
          </div>
        </div>
      </div>

      {/* Reward Summary Card */}
      <div className="px-4 mt-3">
        <div className="bg-white rounded-2xl shadow-card p-4 border border-surface-100">
          <div className="flex items-center gap-2 mb-3">
            <Award size={16} className="text-warm-500" />
            <h2 className="text-sm font-semibold text-gray-900">交付积分与奖励</h2>
          </div>
          <div className="space-y-1.5 text-xs text-surface-500">
            <div className="flex justify-between">
              <span>合格照片案例 {monthApproved} × 5元</span>
              <span className="font-medium text-gray-700">{monthApproved * 5}元</span>
            </div>
            <div className="flex justify-between">
              <span>精选案例 {monthFeatured} × 10元</span>
              <span className="font-medium text-gray-700">{monthFeatured * 10}元</span>
            </div>
            <div className="flex justify-between border-t border-surface-100 pt-1.5 mt-1.5">
              <span className="font-semibold text-gray-700">预计奖励</span>
              <span className="font-bold text-navy-700">¥{rewardSummary.totalReward}</span>
            </div>
          </div>
          <div className="flex items-center gap-2 mt-3">
            <Coins size={14} className="text-navy-500" />
            <span className="text-sm font-semibold text-navy-700">{rewardSummary.totalPoints} 交付积分</span>
          </div>
          <p className="text-[10px] text-surface-400 mt-2">合格 +10积分/例 · 精选额外 +20积分/例 · 待门店确认发放</p>
        </div>
      </div>

      {/* Task List */}
      <div className="px-4 mt-4">
        {pendingUpload.length > 0 && (
          <div className="mb-4 bg-blue-50/50 border border-blue-100 rounded-2xl px-3 py-3 -mx-1">
            <div className="flex items-center gap-2 mb-2 px-1">
              <span className="w-2 h-2 bg-red-500 rounded-full" />
              <h3 className="text-sm font-semibold text-gray-700">今天待上传安装照片</h3>
              <span className="text-xs text-surface-400">({pendingUpload.length})</span>
            </div>
            <div className="space-y-2">
              {pendingUpload.map((task) => {
                const badge = getStatusBadge(task);
                return (
                  <div key={task.id} className="bg-white rounded-xl shadow-card overflow-hidden">
                    <div className="p-3">
                      <div className="flex items-start justify-between mb-1.5">
                        <div>
                          <h4 className="text-sm font-semibold text-gray-900">{task.customerAlias} · {task.model}</h4>
                          <p className="text-xs text-surface-400 mt-0.5">{task.storeName} · {task.city}</p>
                        </div>
                        <span className={`text-[10px] px-2 py-0.5 rounded-full font-medium flex-shrink-0 ${badge.cls}`}>{badge.label}</span>
                      </div>
                      <p className="text-[10px] text-green-600 mt-1.5">审核合格后预计 +5元奖励</p>
                    </div>
                    <div className="flex border-t border-surface-50">
                      <button onClick={() => navigate(`/delivery/detail/${task.id}`)}
                        className="flex-1 py-2.5 text-xs font-medium text-surface-400 active:bg-surface-50">
                        查看详情
                      </button>
                      <button onClick={() => navigate(`/delivery/upload/${task.id}`)}
                        className="flex-1 py-2.5 text-xs font-semibold text-white bg-navy-700 active:bg-navy-800 flex items-center justify-center gap-1">
                        <Camera size={13} />去上传照片
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {pendingReview.length > 0 && (
          <div className="mb-4">
            <div className="flex items-center gap-2 mb-2">
              <span className="w-2 h-2 bg-blue-500 rounded-full" />
              <h3 className="text-sm font-semibold text-gray-700">已上传待审核</h3>
              <span className="text-xs text-surface-400">({pendingReview.length})</span>
            </div>
            <div className="space-y-2">
              {pendingReview.map((task) => (
                <div key={task.id} onClick={() => navigate(`/delivery/detail/${task.id}`)}
                  className="bg-white rounded-xl p-3 shadow-card active:bg-surface-50 cursor-pointer flex items-center justify-between">
                  <div className="min-w-0 flex-1">
                    <h4 className="text-sm font-semibold text-gray-900 truncate">{task.customerAlias} · {task.model}</h4>
                    <p className="text-xs text-surface-400 mt-0.5">{task.storeName} · {task.city}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    {task.installImages.slice(0, 3).map((img, i) => (
                      <div key={i} className="w-10 h-10 rounded-lg overflow-hidden flex-shrink-0">
                        <img src={img} alt="" className="w-full h-full object-cover" />
                      </div>
                    ))}
                    <ChevronRight size={14} className="text-surface-300" />
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {approved.length > 0 && (
          <div className="mb-4">
            <div className="flex items-center gap-2 mb-2">
              <CheckCircle2 size={14} className="text-green-500" />
              <h3 className="text-sm font-semibold text-gray-700">已通过</h3>
              <span className="text-xs text-surface-400">({approved.length})</span>
            </div>
            <div className="space-y-2">
              {approved.slice(0, 5).map((task) => (
                <div key={task.id} onClick={() => navigate(`/delivery/detail/${task.id}`)}
                  className="bg-white rounded-xl p-3 shadow-card active:bg-surface-50 cursor-pointer flex items-center justify-between">
                  <div className="min-w-0 flex-1">
                    <h4 className="text-sm font-semibold text-gray-900 truncate">{task.customerAlias} · {task.model}</h4>
                    <p className="text-xs text-surface-400 mt-0.5">{task.storeName} · {task.city}</p>
                    {pointRecords.filter(r => r.relatedCaseId === task.id).map(r => (
                      <span key={r.id} className="text-[10px] text-green-600 font-medium">+{r.points}积分</span>
                    ))}
                  </div>
                  <div className={`text-[10px] px-2 py-0.5 rounded-full font-medium ${task.reviewStatus === 'featured' ? 'bg-amber-100 text-amber-700' : 'bg-green-100 text-green-700'}`}>
                    {task.reviewStatus === 'featured' ? '精选' : '已通过'}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {rejected.length > 0 && (
          <div>
            <div className="flex items-center gap-2 mb-2">
              <AlertTriangle size={14} className="text-red-500" />
              <h3 className="text-sm font-semibold text-gray-700">需补拍</h3>
              <span className="text-xs text-surface-400">({rejected.length})</span>
            </div>
            <div className="space-y-2">
              {rejected.map((task) => (
                <div key={task.id} onClick={() => navigate(`/delivery/detail/${task.id}`)}
                  className="bg-white rounded-xl p-3 shadow-card active:bg-surface-50 cursor-pointer flex items-center justify-between">
                  <div className="min-w-0 flex-1">
                    <h4 className="text-sm font-semibold text-gray-900 truncate">{task.customerAlias} · {task.model}</h4>
                    <p className="text-xs text-surface-400 mt-0.5">{task.storeName} · {task.city}</p>
                    {task.reviewNote && <p className="text-xs text-red-500 mt-0.5 line-clamp-1">{task.reviewNote}</p>}
                  </div>
                  <span className="text-[10px] px-2 py-0.5 rounded-full bg-red-100 text-red-600 font-medium">需补拍</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {tasks.length === 0 && (
          <div className="flex flex-col items-center justify-center py-20 text-surface-400">
            <Camera size={40} strokeWidth={1} className="mb-3" />
            <p className="text-sm">暂无任务</p>
            <p className="text-xs mt-1">销售创建案例采集后会自动分配给你</p>
          </div>
        )}
      </div>
    </div>
  );
}

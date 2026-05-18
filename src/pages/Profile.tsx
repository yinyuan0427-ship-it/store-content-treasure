import { useNavigate } from 'react-router-dom';
import { useAuth, useFavorites } from '../App';
import { getAllDeliveryTasks, getAllPointRecords, mockSalesRank, mockInstallerRank, mockStoreRank, mockCityRank, mockMaterials, mockDeliveryTasks, POINTS_RULES, getTotalDailyPoints, getCaseCoinBalance, getDeliveryRewardSummary, getDeliveryPointBalance, getDeliveryPointRecords, canShareCase, mockSalesPersons, mockLeads, getLeadsForStore, getInstallerByUserId } from '../mock/data';
import { useMemo, useState } from 'react';
import {
  Star, Trophy, Store, ChevronRight, LogOut, Heart, FileText, Upload, Medal,
  Megaphone, Camera, Sparkles, UserPlus, CheckCircle2, Coins, Award
} from 'lucide-react';

const roleLabels: Record<string, string> = {
  admin: '管理员',
  dealer_owner: '门店老板',
  sales: '销售顾问',
  installer: '安装师傅',
};

const rankTabs = [
  { key: 'sales', label: '销售榜' },
  { key: 'installer', label: '安装榜' },
  { key: 'store', label: '门店榜' },
  { key: 'city', label: '城市榜' },
];

export default function Profile() {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const { favorites } = useFavorites();
  const [rankTab, setRankTab] = useState('sales');

  const uid = user?.phone || '';

  const allPointRecords = useMemo(() => getAllPointRecords(uid), [uid]);
  const totalPoints = useMemo(
    () => allPointRecords.reduce((sum, r) => sum + r.points, 0),
    [allPointRecords]
  );
  const monthPoints = useMemo(
    () => allPointRecords.filter(r => r.createdAt.startsWith('2026-05')).reduce((sum, r) => sum + r.points, 0),
    [allPointRecords]
  );
  const caseCoinBalance = useMemo(() => getCaseCoinBalance(uid), [uid]);

  const rankData = rankTab === 'sales' ? mockSalesRank :
    rankTab === 'installer' ? mockInstallerRank :
    rankTab === 'city' ? mockCityRank : mockStoreRank;

  const myRank = rankData.findIndex(r =>
    r.userName === user?.name || r.storeName === user?.storeName
  ) + 1;

  const favCount = favorites.size;
  const favMaterials = mockMaterials.filter(m => favorites.has(m.id));

  const isInstaller = user?.role === 'installer';
  const isDealerOwner = user?.role === 'dealer_owner';
  const isAdmin = user?.role === 'admin';
  const installerId = getInstallerByUserId(uid)?.id || '';
  const allTasks = getAllDeliveryTasks();

  const storeTasks = isInstaller
    ? allTasks.filter(t => t.installerId === installerId)
    : allTasks.filter(t => t.storeId === user?.storeId);
  const storeApproved = storeTasks.filter(t => t.reviewStatus === 'approved' || t.reviewStatus === 'featured').length;
  const storeTotal = storeTasks.length;

  const dealerProfileStats = useMemo(() => {
    if (!isDealerOwner) return null;
    const shareable = storeTasks.filter(t => canShareCase(t)).length;
    const pendingStory = storeTasks.filter(t => t.installImages.length > 0 && !t.storyWhy && t.reviewStatus !== 'rejected').length;
    const pendingReview = storeTasks.filter(t => t.reviewStatus === 'pending' || t.reviewStatus === 'story_done').length;
    const rejected = storeTasks.filter(t => t.reviewStatus === 'rejected').length;
    const storeSales = mockSalesPersons.filter(s => s.storeId === user?.storeId).length;
    const pendingLeads = mockLeads.filter(l => l.sourceStoreId === user?.storeId && l.status === '待联系').length + getLeadsForStore(user?.storeId || '').length;
    return { shareable, pendingStory, pendingReview, rejected, storeSales, pendingLeads };
  }, [isDealerOwner, storeTasks, user?.storeId]);
  const rewardSummary = useMemo(() => isInstaller ? getDeliveryRewardSummary(uid) : null, [uid, isInstaller]);
  const deliveryBalance = useMemo(() => isInstaller ? getDeliveryPointBalance(uid) : 0, [uid, isInstaller]);
  const deliveryRecords = useMemo(() => isInstaller ? getDeliveryPointRecords(uid) : [], [uid, isInstaller]);

  if (!user) return null;

  return (
    <div className="min-h-screen bg-surface-50 pb-6">
      {/* ── Brand Header ── */}
      <div className="hero-gradient soft-glow relative overflow-hidden px-5 pt-12 pb-8">
        <div className="absolute top-0 right-0 w-48 h-48 bg-blue-400/8 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10">
          <h1 className="text-white text-lg font-semibold mb-6">我的</h1>

          <div className="flex items-center gap-4">
            <div className="w-16 h-16 bg-white/15 backdrop-blur rounded-full flex items-center justify-center text-white text-2xl font-bold border border-white/10">
              {user.name[0]}
            </div>
            <div>
              <h2 className="text-white text-lg font-semibold">{user.name}</h2>
              <p className="text-blue-200/80 text-sm">{user.storeName}</p>
              <p className="text-blue-200/60 text-xs mt-0.5">{user.city}{user.team ? ` · ${user.team}` : ''}</p>
            </div>
          </div>

          <div className="flex items-center gap-1 mt-3 bg-white/10 backdrop-blur rounded-full px-3 py-1.5 w-fit border border-white/5">
            <span className="text-white/80 text-xs">{roleLabels[user.role] || user.role}</span>
          </div>
        </div>
      </div>

      {/* ── Points Card ── */}
      <div className="px-4 -mt-4 relative z-10">
        <div className="glass-card px-4 py-4">
          <div className="grid grid-cols-3 gap-4 text-center">
            <div>
              <div className="text-white text-xl font-bold">{totalPoints}</div>
              <div className="text-blue-200/60 text-[10px] mt-0.5">当前积分</div>
            </div>
            <div>
              <div className="text-white text-xl font-bold">{monthPoints}</div>
              <div className="text-blue-200/60 text-[10px] mt-0.5">本月积分</div>
            </div>
            <div>
              <div className="text-white text-xl font-bold">
                {myRank > 0 ? `#${myRank}` : '-'}
              </div>
              <div className="text-blue-200/60 text-[10px] mt-0.5">排名</div>
            </div>
          </div>
        </div>
      </div>

      {/* ── Installer: Delivery Reward Card ── */}
      {isInstaller && rewardSummary && (
        <div className="px-4 mt-3">
          <div className="bg-white rounded-2xl shadow-card p-4 border border-surface-100">
            <div className="flex items-center gap-2 mb-3">
              <Award size={16} className="text-warm-500" />
              <h2 className="text-sm font-semibold text-gray-900">交付积分与奖励</h2>
            </div>
            <div className="space-y-1.5 text-xs text-surface-500">
              <div className="flex justify-between">
                <span>合格照片案例 × 5元</span>
                <span className="font-medium text-gray-700">{rewardSummary.approvedCount * 5}元</span>
              </div>
              <div className="flex justify-between">
                <span>精选案例 × 10元</span>
                <span className="font-medium text-gray-700">{rewardSummary.featuredCount * 10}元</span>
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
      )}

      {/* ── Store Overview (dealer_owner only) ── */}
      {isDealerOwner && dealerProfileStats && (
      <div className="px-4 mt-3">
        <div className="bg-white rounded-2xl shadow-card p-4 border border-surface-100">
          <h2 className="text-sm font-semibold text-gray-900 mb-3">门店经营数据</h2>
          <div className="grid grid-cols-3 gap-2 mb-3">
            <div className="bg-surface-50 rounded-xl p-2.5 text-center">
              <div className="text-base font-bold text-navy-700">{storeApproved}</div>
              <div className="text-[10px] text-surface-400 mt-0.5">已通过案例</div>
            </div>
            <div className="bg-green-50 rounded-xl p-2.5 text-center">
              <div className="text-base font-bold text-green-600">{dealerProfileStats.shareable}</div>
              <div className="text-[10px] text-green-500 mt-0.5">可分享案例</div>
            </div>
            <div className="bg-warm-50 rounded-xl p-2.5 text-center">
              <div className="text-base font-bold text-warm-600">{dealerProfileStats.pendingStory}</div>
              <div className="text-[10px] text-warm-500 mt-0.5">待补故事</div>
            </div>
            <div className="bg-blue-50 rounded-xl p-2.5 text-center">
              <div className="text-base font-bold text-blue-700">{dealerProfileStats.pendingReview}</div>
              <div className="text-[10px] text-blue-500 mt-0.5">待审核</div>
            </div>
            <div className="bg-red-50 rounded-xl p-2.5 text-center">
              <div className="text-base font-bold text-red-500">{dealerProfileStats.pendingLeads}</div>
              <div className="text-[10px] text-red-400 mt-0.5">待联系线索</div>
            </div>
            <div className="bg-indigo-50 rounded-xl p-2.5 text-center">
              <div className="text-base font-bold text-indigo-600">{dealerProfileStats.storeSales}</div>
              <div className="text-[10px] text-indigo-500 mt-0.5">导购人数</div>
            </div>
          </div>
        </div>
      </div>
      )}

      {/* ── Case Coin Balance ── */}
      {!isInstaller && !isAdmin && (
      <div className="px-4 mt-3">
        <button
          onClick={() => navigate('/my-points')}
          className="w-full bg-white rounded-2xl shadow-card overflow-hidden active:bg-surface-50 transition-colors"
        >
          <div className="flex items-center justify-between px-4 py-3.5">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-amber-50 flex items-center justify-center">
                <Coins size={18} className="text-amber-500" />
              </div>
              <div>
                <span className="text-sm font-medium text-gray-700">案例币余额</span>
                <p className="text-[10px] text-surface-400">上传真实案例获得案例币，用于交换保存其他客户案例高清图</p>
              </div>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="text-lg font-bold text-amber-600">{caseCoinBalance}</span>
              <span className="text-xs text-surface-400">币</span>
              <ChevronRight size={16} className="text-surface-300" />
            </div>
          </div>
        </button>
      </div>
      )}

      {/* ── My Favorites ── */}
      {!isInstaller && !isDealerOwner && (
      <div className="px-4 mt-4">
        <button
          onClick={() => navigate('/library')}
          className="w-full bg-white rounded-2xl shadow-card overflow-hidden active:bg-surface-50 transition-colors"
        >
          <div className="flex items-center justify-between px-4 py-3.5">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-red-50 flex items-center justify-center">
                <Heart size={18} className="text-red-400" fill="#f87171" />
              </div>
              <span className="text-sm font-medium text-gray-700">我的收藏</span>
              {favCount > 0 && (
                <span className="text-xs text-surface-400">({favCount})</span>
              )}
            </div>
            <ChevronRight size={16} className="text-surface-300" />
          </div>
          {favMaterials.length > 0 && (
            <div className="flex gap-1.5 px-4 pb-3 overflow-x-auto no-scrollbar">
              {favMaterials.slice(0, 5).map((m) => (
                <div key={m.id} className="w-14 h-14 rounded-lg overflow-hidden flex-shrink-0 bg-surface-100">
                  <img src={m.images[0]} alt={m.title} className="w-full h-full object-cover" />
                </div>
              ))}
            </div>
          )}
        </button>
      </div>
      )}

      {/* ── My Store ── */}
      {user.role !== 'admin' && (
        <div className="px-4 mt-3">
          <div className="bg-white rounded-2xl shadow-card overflow-hidden">
            <button
              onClick={() => navigate(isInstaller ? '/delivery/tasks' : '/cases-hub')}
              className="w-full flex items-center justify-between px-4 py-3.5 active:bg-surface-50 transition-colors border-b border-surface-100"
            >
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-navy-50 flex items-center justify-center">
                  <Store size={18} className="text-navy-600" />
                </div>
                <span className="text-sm font-medium text-gray-700">
                  {isInstaller ? '我的交付任务' : isDealerOwner ? '门店管理' : '我的门店'}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-xs text-surface-400">{storeApproved}/{storeTotal} 案例</span>
                <ChevronRight size={16} className="text-surface-300" />
              </div>
            </button>

            {!isInstaller && !isDealerOwner && (
            <button
              onClick={() => navigate('/delivery/create')}
              className="w-full flex items-center justify-between px-4 py-3.5 active:bg-surface-50 transition-colors border-b border-surface-100"
            >
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-green-50 flex items-center justify-center">
                  <Upload size={18} className="text-green-600" />
                </div>
                <span className="text-sm font-medium text-gray-700">上传案例</span>
              </div>
              <ChevronRight size={16} className="text-surface-300" />
            </button>
            )}

            {!isInstaller && !isDealerOwner && (
            <button
              onClick={() => navigate('/my-submissions')}
              className="w-full flex items-center justify-between px-4 py-3.5 active:bg-surface-50 transition-colors"
            >
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-blue-50 flex items-center justify-center">
                  <FileText size={18} className="text-blue-600" />
                </div>
                <span className="text-sm font-medium text-gray-700">我的投稿</span>
              </div>
              <ChevronRight size={16} className="text-surface-300" />
            </button>
            )}

            {isInstaller && (
            <button
              onClick={() => navigate('/delivery/tasks')}
              className="w-full flex items-center justify-between px-4 py-3.5 active:bg-surface-50 transition-colors"
            >
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-green-50 flex items-center justify-center">
                  <Camera size={18} className="text-green-600" />
                </div>
                <span className="text-sm font-medium text-gray-700">去交付任务</span>
              </div>
              <ChevronRight size={16} className="text-surface-300" />
            </button>
            )}
          </div>
        </div>
      )}

      {/* ── Ranking ── */}
      {!isInstaller && (
      <div className="px-4 mt-3">
        <div className="bg-white rounded-2xl shadow-card overflow-hidden">
          <div className="flex items-center justify-between px-4 py-3.5 border-b border-surface-100">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-warm-50 flex items-center justify-center">
                <Trophy size={18} className="text-warm-500" />
              </div>
              <span className="text-sm font-medium text-gray-700">排行</span>
            </div>
          </div>

          <div className="category-tabs flex gap-1 px-3 py-2.5 no-scrollbar">
            {rankTabs.map((tab) => (
              <button key={tab.key} onClick={() => setRankTab(tab.key)}
                className={`flex-shrink-0 px-3 py-1 rounded-full text-xs font-medium transition-all ${
                  rankTab === tab.key ? 'bg-navy-800 text-white shadow-sm' : 'bg-surface-50 text-surface-500 active:bg-surface-100'
                }`}>{tab.label}</button>
            ))}
          </div>

          {rankData.slice(0, 3).map((item) => {
            const isMe = item.userName === user.name || item.storeName === user.storeName;
            return (
              <div key={item.rank}
                className={`flex items-center gap-3 px-4 py-3 ${isMe ? 'bg-navy-50 border-l-2 border-navy-600' : 'border-b border-surface-50'}`}
              >
                <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${
                  item.rank === 1 ? 'bg-warm-400 text-white' :
                  item.rank === 2 ? 'bg-surface-300 text-white' :
                  item.rank === 3 ? 'bg-warm-200 text-warm-800' :
                  'bg-surface-100 text-surface-500'
                }`}>{item.rank}</div>
                <div className="flex-1 min-w-0">
                  <p className={`text-sm font-medium truncate ${isMe ? 'text-navy-700' : 'text-gray-700'}`}>
                    {item.storeName || item.userName}
                    {isMe && <span className="text-xs text-navy-500 ml-1">（我）</span>}
                  </p>
                  {item.userTitle && <p className="text-xs text-surface-400">{item.userTitle}</p>}
                </div>
                <div className="text-sm font-bold text-gray-900">{item.points}</div>
              </div>
            );
          })}

          <button
            onClick={() => navigate('/my-points')}
            className="w-full py-3 text-center text-xs text-navy-700 font-medium active:bg-surface-50 transition-colors border-t border-surface-50"
          >
            查看完整排行
          </button>
        </div>
      </div>
      )}

      {/* ── Points Rules ── */}
      {!isInstaller && (
      <div className="px-4 mt-3">
        <div className="bg-white rounded-2xl shadow-card overflow-hidden">
          <div className="flex items-center gap-3 px-4 py-3.5 border-b border-surface-100">
            <div className="w-8 h-8 rounded-lg bg-purple-50 flex items-center justify-center">
              <Sparkles size={18} className="text-purple-500" />
            </div>
            <span className="text-sm font-medium text-gray-700">积分规则</span>
          </div>
          <div className="px-4 py-3 space-y-2.5">
            {[
              { icon: <Megaphone size={14} />, label: '每日完成发圈', pts: POINTS_RULES.daily_posting, color: 'text-warm-500' },
              { icon: <Upload size={14} />, label: '上传案例', pts: POINTS_RULES.upload_case, color: 'text-navy-600' },
              { icon: <CheckCircle2 size={14} />, label: '案例审核通过', pts: POINTS_RULES.case_approved, color: 'text-green-600' },
              { icon: <Star size={14} />, label: '案例被评为精选', pts: POINTS_RULES.case_featured, color: 'text-warm-500' },
              { icon: <Sparkles size={14} />, label: '素材被复用', pts: POINTS_RULES.material_reuse, color: 'text-purple-500' },
              { icon: <UserPlus size={14} />, label: '客户留资/线索', pts: POINTS_RULES.lead_generated, color: 'text-blue-600' },
            ].map((rule) => (
              <div key={rule.label} className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className={rule.color}>{rule.icon}</span>
                  <span className="text-sm text-surface-600">{rule.label}</span>
                </div>
                <span className="text-sm font-bold text-gray-900">+{rule.pts}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
      )}

      {/* ── Account ── */}
      <div className="px-4 mt-3">
        <div className="bg-white rounded-2xl shadow-card overflow-hidden">
          <div className="flex items-center justify-between px-4 py-3.5">
            <span className="text-sm text-surface-500">账号</span>
            <span className="text-sm text-gray-900 font-medium">{user.phone}</span>
          </div>
        </div>
      </div>

      {/* ── Logout ── */}
      <div className="px-4 mt-4">
        <button onClick={logout}
          className="w-full h-12 bg-white border border-surface-200 text-surface-500 font-medium rounded-xl text-sm active:bg-surface-50 transition-colors flex items-center justify-center gap-2 shadow-card">
          <LogOut size={16} />
          退出登录
        </button>
        <p className="text-center text-xs text-surface-400 mt-4">门店案例宝 v0.4.0 · 经销商真实案例营销系统</p>
      </div>
    </div>
  );
}

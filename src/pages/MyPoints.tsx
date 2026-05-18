import { useNavigate } from 'react-router-dom';
import { useMemo, useState } from 'react';
import { useAuth } from '../App';
import { getAllPointRecords, mockSalesRank, mockInstallerRank, mockStoreRank, mockCityRank, getCaseCoinRecords, getCaseCoinBalance, getDeliveryPointRecords, getDeliveryPointBalance, mockSalesPersons } from '../mock/data';
import { Trophy, Truck, FileText, Coins, Award, Camera, Store } from 'lucide-react';

const rankTabs = [
  { key: 'sales', label: '销售榜' },
  { key: 'installer', label: '安装榜' },
  { key: 'store', label: '门店榜' },
  { key: 'city', label: '城市榜' },
];

export default function MyPoints() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [rankTab, setRankTab] = useState('sales');
  const [viewTab, setViewTab] = useState<'points' | 'coins'>('points');

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
  const totalCount = allPointRecords.length;
  const positiveCount = allPointRecords.filter(r => r.points > 0).length;

  const coinBalance = useMemo(() => getCaseCoinBalance(uid), [uid]);
  const coinRecords = useMemo(() => getCaseCoinRecords(uid), [uid]);

  const isInstaller = user?.role === 'installer';
  const isDealerOwner = user?.role === 'dealer_owner';
  const isAdmin = user?.role === 'admin';
  const deliveryBalance = useMemo(() => isInstaller ? getDeliveryPointBalance(uid) : 0, [uid, isInstaller]);
  const deliveryRecords = useMemo(() => isInstaller ? getDeliveryPointRecords(uid) : [], [uid, isInstaller]);

  const storeRankEntry = useMemo(() => {
    if (!isDealerOwner || !user?.storeName) return null;
    return mockStoreRank.find(r => r.storeName === user.storeName) || null;
  }, [isDealerOwner, user?.storeName]);

  const storeSalesCount = useMemo(() => {
    if (!isDealerOwner || !user?.storeId) return 0;
    return mockSalesPersons.filter(s => s.storeId === user.storeId).length;
  }, [isDealerOwner, user?.storeId]);

  const pointTypeConfig: Record<string, { label: string; color: string }> = {
    submission: { label: '投稿奖励', color: 'text-green-600' },
    login: { label: '登录奖励', color: 'text-blue-600' },
    weekly: { label: '满签奖励', color: 'text-purple-600' },
    featured: { label: '精选奖励', color: 'text-amber-600' },
    delivery_create: { label: '创建采集', color: 'text-blue-500' },
    install_upload: { label: '上传照片', color: 'text-green-500' },
    install_note: { label: '完善信息', color: 'text-teal-500' },
    delivery_story: { label: '补充故事', color: 'text-indigo-500' },
    delivery_approved: { label: '案例通过', color: 'text-emerald-600' },
    install_featured: { label: '安装精选', color: 'text-amber-500' },
    sales_featured: { label: '销售精选', color: 'text-amber-500' },
    store_delivery: { label: '门店奖励', color: 'text-orange-500' },
  };

  const coinTypeConfig: Record<string, { label: string; color: string }> = {
    starter: { label: '新人赠送', color: 'text-blue-500' },
    approved_case: { label: '案例通过', color: 'text-emerald-600' },
    featured_case: { label: '精选奖励', color: 'text-amber-500' },
    saved_by_other: { label: '被他人保存', color: 'text-purple-500' },
    save_single: { label: '下载案例图', color: 'text-red-500' },
    save_set: { label: '批量下载图', color: 'text-red-500' },
  };

  const rankData = rankTab === 'sales' ? mockSalesRank :
    rankTab === 'installer' ? mockInstallerRank :
    rankTab === 'city' ? mockCityRank : mockStoreRank;

  const myRank = rankData.findIndex(r =>
    r.userName === user?.name ||
    r.storeName === user?.storeName
  ) + 1;

  return (
    <div className="min-h-screen bg-surface-50 pb-4">
      {/* ── Brand Header ── */}
      <div className="hero-gradient soft-glow relative overflow-hidden px-5 pt-12 pb-8">
        <div className="absolute top-0 right-0 w-48 h-48 bg-blue-400/8 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-32 h-32 bg-amber-400/6 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10">
          <h1 className="text-white text-lg font-semibold mb-6">
            {user?.role === 'installer' ? '交付积分' :
             user?.role === 'dealer_owner' ? '门店积分' :
             user?.role === 'sales' ? '销售积分' : '我的积分'}
          </h1>

          {isInstaller ? (
          <div className="text-center">
            <div className="text-5xl font-bold text-white tracking-tight">{deliveryBalance}</div>
            <p className="text-blue-200/70 text-sm mt-1">交付积分</p>
          </div>
          ) : isDealerOwner ? (
          <div className="text-center">
            <div className="text-5xl font-bold text-white tracking-tight">{storeRankEntry?.points ?? totalPoints}</div>
            <p className="text-blue-200/70 text-sm mt-1">门店总积分</p>
            {storeRankEntry && (
              <div className="inline-flex items-center gap-1 mt-2 bg-white/15 backdrop-blur rounded-full px-3 py-1 border border-white/10">
                <Trophy size={12} className="text-warm-400" />
                <span className="text-white/90 text-xs">门店榜第 {storeRankEntry.rank} 名</span>
              </div>
            )}
          </div>
          ) : (
          <div className="text-center">
            <div className="text-5xl font-bold text-white tracking-tight">{totalPoints}</div>
            <p className="text-blue-200/70 text-sm mt-1">当前积分</p>
            {myRank > 0 && (
              <div className="inline-flex items-center gap-1 mt-2 bg-white/15 backdrop-blur rounded-full px-3 py-1 border border-white/10">
                <Trophy size={12} className="text-warm-400" />
                <span className="text-white/90 text-xs">{rankTabs.find(t => t.key === rankTab)?.label}第 {myRank} 名</span>
              </div>
            )}
          </div>
          )}

          {/* Stats */}
          {isInstaller ? (
          <div className="grid grid-cols-3 gap-3 mt-6">
            {[
              { label: '合格案例', value: deliveryRecords.filter(r => r.type === 'approved_photo').length },
              { label: '精选案例', value: deliveryRecords.filter(r => r.type === 'featured_photo').length },
              { label: '预计奖励', value: `¥${deliveryRecords.reduce((sum, r) => sum + r.rewardAmount, 0)}` },
            ].map((item) => (
              <div key={item.label} className="glass-card-dark py-2.5 text-center">
                <div className="text-white text-lg font-bold">{item.value}</div>
                <div className="text-blue-200/60 text-[10px] mt-0.5">{item.label}</div>
              </div>
            ))}
          </div>
          ) : isDealerOwner ? (
          <div className="grid grid-cols-3 gap-3 mt-6">
            {[
              { label: '门店排名', value: storeRankEntry ? `#${storeRankEntry.rank}` : '-' },
              { label: '导购人数', value: `${storeSalesCount}人` },
              { label: '本月新增', value: monthPoints },
            ].map((item) => (
              <div key={item.label} className="glass-card-dark py-2.5 text-center">
                <div className="text-white text-lg font-bold">{item.value}</div>
                <div className="text-blue-200/60 text-[10px] mt-0.5">{item.label}</div>
              </div>
            ))}
          </div>
          ) : (
          <div className="grid grid-cols-3 gap-3 mt-6">
            {[
              { label: '本月积分', value: monthPoints },
              { label: '记录数', value: totalCount },
              { label: '正向记录', value: positiveCount },
            ].map((item) => (
              <div key={item.label} className="glass-card-dark py-2.5 text-center">
                <div className="text-white text-lg font-bold">{item.value}</div>
                <div className="text-blue-200/60 text-[10px] mt-0.5">{item.label}</div>
              </div>
            ))}
          </div>
          )}
        </div>
      </div>

      {/* ── View Tabs ── */}
      {!isInstaller && !isAdmin && (
      <div className="px-4 -mt-4 relative z-10">
        <div className="flex gap-1 mb-3">
          <button onClick={() => setViewTab('points')}
            className={`flex-1 py-2 rounded-full text-sm font-semibold transition-all ${
              viewTab === 'points' ? 'bg-white text-navy-700 shadow-card' : 'text-blue-200/80'
            }`}>
            成长积分
          </button>
          <button onClick={() => setViewTab('coins')}
            className={`flex-1 py-2 rounded-full text-sm font-semibold transition-all ${
              viewTab === 'coins' ? 'bg-white text-amber-700 shadow-card' : 'text-blue-200/80'
            }`}>
            案例币 · {coinBalance}
          </button>
        </div>
      </div>
      )}

      {/* ── Case Coin Ledger ── */}
      {viewTab === 'coins' && (
        <div className="px-4 mt-2">
          <div className="bg-white rounded-2xl shadow-card p-4 mb-4">
            <div className="flex items-center gap-3 mb-1">
              <Coins size={20} className="text-amber-500" />
              <span className="text-lg font-bold text-amber-600">{coinBalance}</span>
              <span className="text-sm text-surface-400">案例币</span>
            </div>
            <p className="text-xs text-surface-400">上传真实案例获得案例币，用于交换保存其他客户案例高清图</p>
          </div>

          <h3 className="text-sm font-semibold text-gray-900 mb-3">案例币流水</h3>
          {coinRecords.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 text-surface-400">
              <Coins size={40} strokeWidth={1} className="mb-3" />
              <p className="text-sm">暂无案例币记录</p>
              <p className="text-xs mt-1">上传真实客户案例审核通过后获得案例币，用于交换保存案例高清图</p>
            </div>
          ) : (
            <div className="space-y-2">
              {coinRecords.map((record) => {
                const typeCfg = coinTypeConfig[record.type];
                const amt = typeof record.amount === 'number' ? record.amount : 0;
                return (
                <div key={record.id} className="bg-white rounded-xl px-4 py-3 flex items-center justify-between shadow-card">
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-gray-700 truncate">{record.description}</p>
                    <div className="flex items-center gap-2 mt-1">
                      {typeCfg && <span className={`text-[10px] font-medium ${typeCfg.color}`}>{typeCfg.label}</span>}
                      <span className="text-xs text-surface-400">{record.createdAt.slice(0, 16).replace('T', ' ')}</span>
                    </div>
                  </div>
                  <div className={`text-base font-bold ml-3 ${amt >= 0 ? 'text-amber-600' : 'text-red-500'}`}>
                    {amt > 0 ? '+' : ''}{amt}
                  </div>
                </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* ── Installer: Delivery Points View ── */}
      {isInstaller && (
      <div className="px-4 -mt-2 relative z-10">
        <div className="bg-white rounded-2xl shadow-card p-4 mb-4">
          <div className="flex items-center gap-2 mb-3">
            <Award size={18} className="text-warm-500" />
            <h2 className="text-sm font-semibold text-gray-900">交付奖励规则</h2>
          </div>
          <div className="space-y-1.5 text-xs text-surface-500">
            <div className="flex justify-between">
              <span>合格照片奖励</span>
              <span className="font-medium text-green-600">+10积分 · 5元/单</span>
            </div>
            <div className="flex justify-between">
              <span>精选案例奖励</span>
              <span className="font-medium text-amber-500">额外+20积分 · 10元/单</span>
            </div>
          </div>
          <div className="flex items-center gap-2 mt-3 pt-3 border-t border-surface-100">
            <Coins size={16} className="text-navy-500" />
            <span className="text-lg font-bold text-navy-700">{deliveryBalance}</span>
            <span className="text-xs text-surface-400">当前交付积分</span>
          </div>
          <p className="text-[10px] text-surface-400 mt-1.5">待门店确认后发放现金奖励</p>
        </div>

        <h3 className="text-sm font-semibold text-gray-900 mb-3">奖励明细</h3>
        <div className="space-y-2">
          {deliveryRecords.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 text-surface-400">
              <Camera size={40} strokeWidth={1} className="mb-3" />
              <p className="text-sm">暂无交付积分记录</p>
              <p className="text-xs mt-1">上传交付照片审核通过后可获得积分</p>
            </div>
          ) : (
            deliveryRecords.map((record) => (
              <div key={record.id} className="bg-white rounded-xl px-4 py-3 flex items-center justify-between shadow-card">
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-gray-700 truncate">{record.description}</p>
                  <div className="flex items-center gap-2 mt-1">
                    <span className={`text-xs font-medium ${record.type === 'featured_photo' ? 'text-amber-500' : 'text-green-600'}`}>
                      {record.type === 'featured_photo' ? '精选案例' : '合格照片'}
                    </span>
                    <span className="text-xs text-surface-400">{record.createdAt}</span>
                  </div>
                </div>
                <div className="text-right ml-3">
                  <div className="text-base font-bold text-green-600">+{record.points}</div>
                  <div className="text-[10px] text-surface-400">¥{record.rewardAmount}</div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
      )}

      {/* ── Points View ── */}
      {!isInstaller && viewTab === 'points' && (
      <>
      {/* ── Ranking Card ── */}
      <div className="px-4 -mt-2 relative z-10">
        <div className="bg-white rounded-2xl shadow-card overflow-hidden">
          <div className="category-tabs flex gap-1 px-3 py-3 no-scrollbar border-b border-surface-100">
            {rankTabs.map((tab) => (
              <button key={tab.key} onClick={() => setRankTab(tab.key)}
                className={`flex-shrink-0 px-3.5 py-1.5 rounded-full text-sm font-medium transition-all ${
                  rankTab === tab.key ? 'bg-navy-800 text-white shadow-sm' : 'bg-surface-50 text-surface-500 active:bg-surface-100'
                }`}>{tab.label}</button>
            ))}
          </div>
          {rankData.slice(0, 5).map((item) => {
            const isMe = item.userName === user?.name || item.storeName === user?.storeName;
            return (
              <div key={item.rank}
                className={`flex items-center gap-3 px-4 py-3 ${isMe ? 'bg-navy-50 border-l-2 border-navy-600' : 'border-b border-surface-50'}`}>
                <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold ${
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
        </div>
      </div>

      {/* ── Points History ── */}
      <div className="px-4 mt-5">
        <h3 className="text-sm font-semibold text-gray-900 mb-3">积分明细</h3>
        <div className="space-y-2">
          {allPointRecords.map((record) => {
            const typeConfig = pointTypeConfig[record.type] || { label: record.type, color: 'text-gray-600' };
            return (
              <div key={record.id} className="bg-white rounded-xl px-4 py-3 flex items-center justify-between shadow-card">
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-gray-700 truncate">{record.description}</p>
                  <div className="flex items-center gap-2 mt-1">
                    <span className={`text-xs font-medium ${typeConfig.color}`}>{typeConfig.label}</span>
                    <span className="text-xs text-surface-400">{record.createdAt}</span>
                  </div>
                </div>
                <div className={`text-base font-bold ml-3 ${record.points > 0 ? 'text-green-600' : 'text-red-500'}`}>
                  {record.points > 0 ? '+' : ''}{record.points}
                </div>
              </div>
            );
          })}
        </div>
      </div>
      </>
      )}

      {/* ── Bottom CTA ── */}
      <div className="px-4 mt-6 pb-4">
        <button onClick={() => navigate(user?.role === 'installer' ? '/delivery/tasks' : user?.role === 'dealer_owner' ? '/cases-hub' : '/delivery/create')}
          className="w-full h-12 bg-navy-800 text-white font-semibold rounded-xl text-base active:bg-navy-900 transition-colors shadow-lg shadow-navy-200 flex items-center justify-center gap-2">
          {user?.role === 'installer' ? (
            <><Truck size={16} />去案例采集任务</>
          ) : user?.role === 'dealer_owner' ? (
            <><Store size={16} />管理本店案例</>
          ) : (
            <><FileText size={16} />创建案例采集</>
          )}
        </button>
      </div>
    </div>
  );
}

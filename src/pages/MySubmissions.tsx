import { useState, useMemo } from 'react';
import { mockSubmissions } from '../mock/data';

const statusTabs = [
  { key: 'all', label: '全部' },
  { key: 'pending', label: '待审核' },
  { key: 'approved', label: '已通过' },
  { key: 'rejected', label: '已驳回' },
  { key: 'duplicate', label: '重复' },
];

const statusConfig: Record<string, { label: string; color: string; bg: string }> = {
  pending: { label: '待审核', color: 'text-amber-600', bg: 'bg-amber-50' },
  approved: { label: '已通过', color: 'text-green-600', bg: 'bg-green-50' },
  rejected: { label: '已驳回', color: 'text-red-600', bg: 'bg-red-50' },
  suspected_dup: { label: '疑似重复', color: 'text-orange-600', bg: 'bg-orange-50' },
  confirmed_dup: { label: '判定重复', color: 'text-gray-500', bg: 'bg-gray-100' },
};

export default function MySubmissions() {
  const [activeTab, setActiveTab] = useState('all');

  const filtered = useMemo(() => {
    let list = mockSubmissions.filter(s => s.userId === 'dealer001');
    if (activeTab === 'duplicate') {
      list = list.filter(s => s.status === 'suspected_dup' || s.status === 'confirmed_dup');
    } else if (activeTab !== 'all') {
      list = list.filter(s => s.status === activeTab);
    }
    return list;
  }, [activeTab]);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white px-4 pt-12 pb-3 border-b border-gray-100">
        <h1 className="text-lg font-semibold text-gray-900">我的投稿</h1>
      </div>

      {/* Status Tabs */}
      <div className="bg-white border-b border-gray-50">
        <div className="category-tabs flex gap-1 px-4 py-2.5 no-scrollbar">
          {statusTabs.map((tab) => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={`flex-shrink-0 px-3.5 py-1.5 rounded-full text-sm font-medium transition-all ${
                activeTab === tab.key
                  ? 'bg-primary-600 text-white shadow-sm'
                  : 'bg-gray-50 text-gray-500 active:bg-gray-100'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* List */}
      <div className="px-4 pt-3 pb-4 space-y-3">
        {filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-gray-400">
            <svg width="48" height="48" viewBox="0 0 24 24" fill="none">
              <rect x="3" y="3" width="18" height="18" rx="2" stroke="currentColor" strokeWidth="1.5"/>
              <path d="M12 8v4M12 16h.01" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
            </svg>
            <p className="mt-3 text-sm">暂无{activeTab === 'all' ? '' : statusTabs.find(t => t.key === activeTab)?.label}投稿</p>
          </div>
        ) : (
          filtered.map((sub) => {
            const sc = statusConfig[sub.status];
            return (
              <div key={sub.id} className="bg-white rounded-xl overflow-hidden shadow-sm">
                {/* Images */}
                <div className="flex gap-1 p-3 pb-0 overflow-x-auto no-scrollbar">
                  {sub.images.map((img, i) => (
                    <div key={i} className="w-20 h-20 rounded-lg overflow-hidden flex-shrink-0">
                      <img src={img} alt={`投稿图${i + 1}`} className="w-full h-full object-cover" />
                    </div>
                  ))}
                </div>
                <div className="p-3">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex gap-1.5 items-center">
                      <span className="text-xs text-gray-400">{sub.createdAt}</span>
                      <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${sc.bg} ${sc.color}`}>
                        {sc.label}
                      </span>
                      {sub.points > 0 && (
                        <span className="text-xs text-amber-500 font-medium">+{sub.points}积分</span>
                      )}
                    </div>
                  </div>
                  <div className="flex gap-2 text-xs text-gray-500 flex-wrap">
                    <span>{sub.brand}</span>
                    {sub.model && <span>· {sub.model}</span>}
                    <span>· {sub.scene}</span>
                    <span>· {sub.city}</span>
                  </div>
                  {sub.description && (
                    <p className="text-xs text-gray-400 mt-1.5 line-clamp-2">{sub.description}</p>
                  )}
                  {sub.rejectReason && (
                    <div className="mt-2 p-2 bg-red-50 rounded-lg text-xs text-red-600">
                      驳回原因：{sub.rejectReason}
                    </div>
                  )}
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}

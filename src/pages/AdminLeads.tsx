import { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useToast, useAuth } from '../App';
import { getAllDeliveryTasks, loadShareLeads, mockLeads, mockPublicCases, Lead } from '../mock/data';
import { Mail, FileText, Users, UserCheck, Store, CheckCircle2 } from 'lucide-react';

const statusOptions = ['待联系', '已联系', '已到店', '已成交', '无效', '暂不考虑'] as const;
const filterTabs = ['全部', '待联系', '已联系', '已到店', '已成交'];

function loadStoredLeads(): Lead[] {
  try {
    const parsed = loadShareLeads();
    if (!Array.isArray(parsed)) return [];
    return parsed.map((item: any, i: number) => {
      const sourceCase = getAllDeliveryTasks().find(t => t.id === item.sourceCaseId)
        || mockPublicCases.find(c => c.id === item.sourceCaseId);
      return {
        id: `share-${i}`,
        customerAlias: item.alias || '',
        phone: item.phone || '',
        city: item.city || sourceCase?.city || '',
        interestedProduct: item.interestProduct || '',
        interestType: item.interestType || '',
        sourceCaseId: item.sourceCaseId || '',
        sourceStoreId: item.sourceStoreId || sourceCase?.storeId,
        sourceStoreName: item.sourceStoreName || sourceCase?.storeName,
        sourceSalesId: item.sourceSalesId,
        remark: item.remark,
        status: '待联系' as const,
        createdAt: item.createdAt || '',
      };
    });
  } catch {
    return [];
  }
}

export default function AdminLeads() {
  const navigate = useNavigate();
  const { showToast } = useToast();
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('全部');
  const [selectedLead, setSelectedLead] = useState<string | null>(null);
  const [noteText, setNoteText] = useState('');

  const allLeads = useMemo(() => {
    const stored = loadStoredLeads();
    // Sort by createdAt descending (newest first)
    const sorted = [...stored, ...mockLeads].sort((a, b) =>
      b.createdAt.localeCompare(a.createdAt)
    );
    return sorted;
  }, []);

  const filtered = useMemo(() => {
    let list = allLeads;
    if (activeTab !== '全部') {
      list = list.filter(l => l.status === activeTab);
    }
    return list;
  }, [activeTab, allLeads]);

  const leadStats = useMemo(() => ({
    total: allLeads.length,
    pending: allLeads.filter(l => l.status === '待联系').length,
    contacted: allLeads.filter(l => l.status === '已联系').length,
    visited: allLeads.filter(l => l.status === '已到店').length,
    converted: allLeads.filter(l => l.status === '已成交').length,
  }), [allLeads]);

  const handleStatusChange = (leadId: string, newStatus: string) => {
    showToast(`跟进状态已更新为「${newStatus}」`);
  };

  const handleAddNote = (leadId: string) => {
    if (!noteText.trim()) return;
    showToast('备注已添加');
    setNoteText('');
    setSelectedLead(null);
  };

  const statusCls: Record<string, string> = {
    '待联系': 'bg-amber-100 text-amber-700',
    '已联系': 'bg-blue-100 text-blue-700',
    '已到店': 'bg-indigo-100 text-indigo-700',
    '已成交': 'bg-green-100 text-green-700',
    '无效': 'bg-gray-200 text-gray-500',
    '暂不考虑': 'bg-orange-50 text-orange-600',
  };

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
          <h1 className="text-lg font-semibold text-gray-900">客户线索</h1>
          <p className="text-xs text-gray-400">
            {allLeads.filter(l => l.status === '待联系').length} 条待联系 · 共 {allLeads.length} 条
          </p>
        </div>
      </div>

      {/* Stats Overview */}
      <div className="px-4 pt-3">
        <div className="grid grid-cols-5 gap-2">
          <div className="bg-surface-50 rounded-xl p-2 text-center">
            <div className="text-sm font-bold text-gray-700">{leadStats.total}</div>
            <div className="text-[10px] text-gray-400 mt-0.5">全部</div>
          </div>
          <div className="bg-red-50 rounded-xl p-2 text-center">
            <div className="text-sm font-bold text-red-500">{leadStats.pending}</div>
            <div className="text-[10px] text-red-400 mt-0.5">待联系</div>
          </div>
          <div className="bg-blue-50 rounded-xl p-2 text-center">
            <div className="text-sm font-bold text-blue-600">{leadStats.contacted}</div>
            <div className="text-[10px] text-blue-500 mt-0.5">已联系</div>
          </div>
          <div className="bg-indigo-50 rounded-xl p-2 text-center">
            <div className="text-sm font-bold text-indigo-600">{leadStats.visited}</div>
            <div className="text-[10px] text-indigo-500 mt-0.5">已到店</div>
          </div>
          <div className="bg-green-50 rounded-xl p-2 text-center">
            <div className="text-sm font-bold text-green-600">{leadStats.converted}</div>
            <div className="text-[10px] text-green-500 mt-0.5">已成交</div>
          </div>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="bg-white border-b border-gray-50">
        <div className="category-tabs flex gap-1 px-4 py-2.5 no-scrollbar">
          {filterTabs.map((tab) => (
            <button key={tab} onClick={() => setActiveTab(tab)}
              className={`flex-shrink-0 px-3.5 py-1.5 rounded-full text-sm font-medium transition-all ${
                activeTab === tab ? 'bg-primary-600 text-white shadow-sm' : 'bg-gray-50 text-gray-500 active:bg-gray-100'
              }`}>
              {tab}
              <span className={`ml-1 text-[10px] px-1.5 py-0.5 rounded-full ${
                tab === '待联系' ? 'bg-red-500 text-white' :
                tab === '已联系' ? 'bg-blue-500 text-white' :
                tab === '已到店' ? 'bg-indigo-500 text-white' :
                tab === '已成交' ? 'bg-green-500 text-white' :
                'bg-gray-400 text-white'
              }`}>
                {tab === '全部' ? allLeads.length : allLeads.filter(l => l.status === tab).length}
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* Lead List */}
      <div className="px-4 pt-3 pb-4 space-y-3">
        {filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-gray-400">
            <Mail size={40} strokeWidth={1} className="mb-3 text-gray-300" />
            <p className="text-sm">暂无{activeTab === '全部' ? '' : activeTab}线索</p>
          </div>
        ) : (
          filtered.map((lead) => {
            const sourceCase = getAllDeliveryTasks().find(t => t.id === lead.sourceCaseId)
              || mockPublicCases.find(c => c.id === lead.sourceCaseId);
            const sourceStoreName = lead.sourceStoreName || (sourceCase as any)?.storeName || '';
            return (
              <div key={lead.id} className="bg-white rounded-xl shadow-sm overflow-hidden">
                <div className="p-4">
                  <div className="flex items-start justify-between mb-2">
                    <div>
                      <h3 className="text-base font-semibold text-gray-900">{lead.customerAlias}</h3>
                      <p className="text-xs text-gray-400 mt-0.5">{lead.phone}{lead.wechat ? ` · 微信: ${lead.wechat}` : ''}</p>
                    </div>
                    <span className={`text-[10px] px-2 py-0.5 rounded-full font-medium ${statusCls[lead.status]}`}>
                      {lead.status}
                    </span>
                  </div>

                  {/* Info Grid */}
                  <div className="grid grid-cols-2 gap-x-4 gap-y-1.5 text-xs mt-2">
                    <div>
                      <span className="text-gray-400">城市：</span>
                      <span className="text-gray-700">{lead.city}</span>
                    </div>
                    <div>
                      <span className="text-gray-400">意向产品：</span>
                      <span className="text-gray-700 truncate block">{lead.interestedProduct}</span>
                    </div>
                    <div>
                      <span className="text-gray-400">兴趣类型：</span>
                      <span className={`inline-block px-1.5 py-0.5 rounded text-[10px] font-medium ${
                        lead.interestType === '预约到店体验' ? 'bg-green-50 text-green-700' :
                        lead.interestType === '咨询同款价格' ? 'bg-amber-50 text-amber-700' :
                        lead.interestType === '睡眠顾问建议' ? 'bg-indigo-50 text-indigo-700' :
                        'bg-blue-50 text-blue-600'
                      }`}>{lead.interestType}</span>
                    </div>
                    <div>
                      <span className="text-gray-400">提交时间：</span>
                      <span className="text-gray-700 text-[10px]">{lead.createdAt}</span>
                    </div>
                  </div>

                  {/* Source Case */}
                  {sourceCase && (
                    <div className="mt-2 bg-gray-50 rounded-lg px-3 py-1.5 text-xs text-gray-500 flex items-center justify-between">
                      <span>来源：{(sourceCase as any).storeName ? `${(sourceCase as any).storeName} · ` : ''}{sourceCase.brand} {sourceCase.model} · {sourceCase.city}</span>
                      {lead.sourceSalesId && <span className="text-primary-600 font-medium">归属销售</span>}
                    </div>
                  )}

                  {!sourceCase && sourceStoreName && (
                    <div className="mt-2 bg-gray-50 rounded-lg px-3 py-1.5 text-xs text-gray-500 flex items-center justify-between">
                      <span>{`来源：${sourceStoreName} · 案例合集`}</span>
                      <span className="text-primary-600 font-medium">门店线索待分配</span>
                    </div>
                  )}

                  {/* Notes */}
                  {lead.notes && (
                    <div className="mt-2 bg-blue-50 rounded-lg px-3 py-2 text-xs text-blue-700">
                      <FileText size={12} className="inline mr-1" />{lead.notes}
                    </div>
                  )}
                </div>

                {/* Expandable Actions */}
                {selectedLead === lead.id ? (
                  <div className="border-t border-gray-50 p-4 space-y-3">
                    {/* Status Change */}
                    <div>
                      <p className="text-xs font-semibold text-gray-500 mb-2">修改跟进状态</p>
                      <div className="flex gap-1.5 flex-wrap">
                        {statusOptions.map((s) => (
                          <button key={s} onClick={() => handleStatusChange(lead.id, s)}
                            className={`text-xs px-2.5 py-1.5 rounded-lg border transition-all ${
                              lead.status === s
                                ? 'bg-primary-600 border-primary-600 text-white'
                                : 'bg-white border-gray-200 text-gray-500 active:bg-gray-50'
                            }`}>{s}</button>
                        ))}
                      </div>
                    </div>

                    {/* Add Note */}
                    <div>
                      <p className="text-xs font-semibold text-gray-500 mb-2">添加备注</p>
                      <div className="flex gap-2">
                        <input type="text" value={noteText} onChange={(e) => setNoteText(e.target.value)}
                          placeholder="输入跟进备注..."
                          className="flex-1 h-10 px-3 bg-gray-50 border border-gray-200 rounded-xl text-xs focus:outline-none focus:border-primary-400" />
                        <button onClick={() => handleAddNote(lead.id)}
                          className="h-10 px-4 bg-primary-600 text-white text-xs font-semibold rounded-xl active:bg-primary-700 transition-colors">
                          保存
                        </button>
                      </div>
                    </div>

                    <button onClick={() => { setSelectedLead(null); setNoteText(''); }}
                      className="text-xs text-gray-400 font-medium">收起</button>
                  </div>
                ) : (
                  <div className="flex border-t border-gray-50">
                    <button onClick={() => setSelectedLead(lead.id)}
                      className="flex-1 py-3 text-sm font-medium text-primary-600 active:bg-primary-50 transition-colors">
                      跟进处理
                    </button>
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}

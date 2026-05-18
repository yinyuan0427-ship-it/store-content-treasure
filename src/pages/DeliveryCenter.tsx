import { useNavigate } from 'react-router-dom';
import { useAuth } from '../App';
import { getAllDeliveryTasks, getInstallerByUserId, getSalesByUserId } from '../mock/data';
import { useMemo } from 'react';
import { Bell, Plus } from 'lucide-react';

export default function DeliveryCenter() {
  const navigate = useNavigate();
  const { user } = useAuth();

  const roleData = useMemo(() => {
    const allTasks = getAllDeliveryTasks();
    switch (user?.role) {
      case 'installer': {
        const installerId = getInstallerByUserId(user.phone)?.id || '';
        const tasks = allTasks.filter(t => t.installerId === installerId);
        const completed = tasks.filter(t => t.reviewStatus === 'approved' || t.reviewStatus === 'featured');
        const inProgress = tasks.filter(t => t.reviewStatus !== 'approved' && t.reviewStatus !== 'featured' && t.reviewStatus !== 'rejected');
        return {
          title: '我的案例采集',
          sections: [
            { label: '进行中', tasks: inProgress, emptyMsg: '暂无进行中的任务' },
            { label: '已完成', tasks: completed, emptyMsg: '暂无已完成的任务' },
          ],
        };
      }
      case 'sales': {
        const salesId = getSalesByUserId(user.phone)?.id || '';
        const tasks = allTasks.filter(t => t.salesId === salesId);
        const needStory = tasks.filter(t => t.reviewStatus === 'photos_uploaded');
        const pending = tasks.filter(t => t.reviewStatus === 'pending');
        const done = tasks.filter(t => t.reviewStatus === 'approved' || t.reviewStatus === 'featured');
        const draft = tasks.filter(t => t.reviewStatus === 'draft');
        return {
          title: '我的案例采集',
          highlight: needStory.length > 0 ? `你有 ${needStory.length} 个任务等待补充成交故事` : null,
          sections: [
            { label: '待补充故事', tasks: needStory, emptyMsg: '没有需要补充故事的任务', highlight: true },
            { label: '待审核', tasks: pending, emptyMsg: '没有待审核的案例' },
            { label: '已创建', tasks: draft, emptyMsg: '' },
            { label: '已完成', tasks: done, emptyMsg: '暂无已完成的案例' },
          ],
        };
      }
      case 'dealer_owner': {
        const storeTasks = allTasks.filter(t => t.storeId === user.storeId);
        return {
          title: `${user.storeName} · 案例采集`,
          sections: [
            { label: '全部案例', tasks: storeTasks, emptyMsg: '暂无案例' },
          ],
        };
      }
      case 'admin': {
        const pending = allTasks.filter(t => t.reviewStatus === 'pending' || t.reviewStatus === 'story_done');
        const all = allTasks;
        return {
          title: '全部案例',
          highlight: pending.length > 0 ? `${pending.length} 个案例等待审核` : null,
          sections: [
            { label: '待审核', tasks: pending, emptyMsg: '暂无待审核案例', highlight: true },
            { label: '全部', tasks: all, emptyMsg: '暂无案例' },
          ],
        };
      }
      default: return { title: '案例采集', sections: [] };
    }
  }, [user]);

  const statusConfig: Record<string, { label: string; cls: string }> = {
    draft: { label: '待安装', cls: 'bg-gray-100 text-gray-600' },
    photos_uploaded: { label: '待补故事', cls: 'bg-amber-100 text-amber-700' },
    story_done: { label: '待审核', cls: 'bg-blue-100 text-blue-700' },
    pending: { label: '待审核', cls: 'bg-blue-100 text-blue-700' },
    approved: { label: '已通过', cls: 'bg-green-100 text-green-700' },
    rejected: { label: '已驳回', cls: 'bg-red-100 text-red-600' },
    suspected_dup: { label: '疑似重复', cls: 'bg-orange-100 text-orange-700' },
    confirmed_dup: { label: '判定重复', cls: 'bg-gray-200 text-gray-500' },
    featured: { label: '精选', cls: 'bg-amber-100 text-amber-700' },
  };

  if (!user) return null;

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white px-4 pt-12 pb-3 border-b border-gray-100">
        <h1 className="text-lg font-semibold text-gray-900">{roleData.title}</h1>
        {roleData.highlight && (
          <div className="mt-2 bg-amber-50 border border-amber-100 rounded-lg px-3 py-2 flex items-center gap-2">
            <Bell size={14} className="text-amber-500" /><span className="text-sm text-amber-700">{roleData.highlight}</span>
          </div>
        )}
        {/* Create button for sales/dealer/admin */}
        {['sales', 'dealer_owner', 'admin'].includes(user.role) && (
          <button onClick={() => navigate('/delivery/create')}
            className="mt-3 w-full h-10 bg-primary-600 text-white font-semibold rounded-xl text-sm active:bg-primary-700 transition-colors">
            <Plus size={16} className="inline mr-1" />创建案例采集
          </button>
        )}
      </div>

      <div className="px-4 pt-3 pb-4 space-y-4">
        {roleData.sections?.map((section) => {
          if (section.tasks.length === 0 && section.emptyMsg) {
            return (
              <div key={section.label}>
                <h3 className="text-sm font-semibold text-gray-700 mb-2">{section.label}</h3>
                <div className="bg-white rounded-xl p-8 text-center text-gray-400 text-sm">{section.emptyMsg}</div>
              </div>
            );
          }
          if (section.tasks.length === 0) return null;
          return (
            <div key={section.label}>
              <h3 className="text-sm font-semibold text-gray-700 mb-2">
                {'highlight' in section && section.highlight && <span className="inline-block w-2 h-2 bg-amber-400 rounded-full mr-1.5" />}
                {section.label}
                <span className="text-gray-400 font-normal ml-1">({section.tasks.length})</span>
              </h3>
              <div className="space-y-2">
                {section.tasks.map((task) => {
                  const sc = statusConfig[task.reviewStatus] || { label: task.reviewStatus, cls: 'bg-gray-100' };
                  return (
                    <div key={task.id} onClick={() => navigate(`/delivery/detail/${task.id}`)}
                      className="bg-white rounded-xl p-3 shadow-sm active:bg-gray-50 cursor-pointer">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm font-semibold text-gray-900">{task.customerAlias} · {task.model}</span>
                        <span className={`text-[10px] px-2 py-0.5 rounded-full font-medium ${sc.cls}`}>{sc.label}</span>
                      </div>
                      <div className="flex items-center gap-2 text-xs text-gray-400">
                        <span>{task.city}</span>
                        <span>·</span>
                        <span>{task.scene}</span>
                        <span>·</span>
                        <span>销售：{task.salesName}</span>
                        <span>·</span>
                        <span>安装：{task.installerName}</span>
                      </div>
                      {task.installImages.length > 0 && (
                        <div className="flex gap-1 mt-2 overflow-x-auto no-scrollbar">
                          {task.installImages.slice(0, 4).map((img, i) => (
                            <div key={i} className="w-14 h-14 rounded-lg overflow-hidden flex-shrink-0">
                              <img src={img} alt="" className="w-full h-full object-cover" />
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

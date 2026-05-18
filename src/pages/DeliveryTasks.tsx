import { useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../App';
import { getAllDeliveryTasks, mockDeliveryTasks, getInstallerByUserId } from '../mock/data';
import { MapPin, Store, User, ClipboardList, Camera } from 'lucide-react';

export default function DeliveryTasks() {
  const navigate = useNavigate();
  const { user } = useAuth();

  const installerId = getInstallerByUserId(user?.phone || '')?.id || '';

  const assignedTasks = useMemo(() => {
    return getAllDeliveryTasks().filter(t => t.installerId === installerId);
  }, [installerId]);

  const needPhotos = assignedTasks.filter(t => t.installImages.length === 0 && t.reviewStatus !== 'rejected');
  const completed = assignedTasks.filter(t => t.installImages.length > 0);

  const getStatusBadge = (task: typeof mockDeliveryTasks[number]) => {
    if (task.reviewStatus === 'approved' || task.reviewStatus === 'featured') return { label: '已完成', cls: 'bg-green-100 text-green-700' };
    if (task.reviewStatus === 'rejected') return { label: '需修改', cls: 'bg-red-100 text-red-600' };
    if (task.installImages.length > 0) return { label: '已传照片', cls: 'bg-blue-100 text-blue-700' };
    return { label: '待安装', cls: 'bg-amber-100 text-amber-700' };
  };

  if (!user) return null;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-gradient-to-b from-primary-600 to-primary-700 px-5 pt-12 pb-6">
        <h1 className="text-white text-lg font-semibold mb-1">案例采集任务</h1>
        <p className="text-blue-200 text-sm">{user.name} · {user.team}</p>
        <div className="grid grid-cols-3 gap-2 mt-4">
          {[
            { label: '待上传照片', value: needPhotos.length },
            { label: '已传照片', value: completed.length },
            { label: '全部任务', value: assignedTasks.length },
          ].map((s) => (
            <div key={s.label} className="bg-white/20 backdrop-blur rounded-xl py-2.5 text-center">
              <div className="text-white text-xl font-bold">{s.value}</div>
              <div className="text-blue-200 text-[10px]">{s.label}</div>
            </div>
          ))}
        </div>
      </div>

      <div className="px-4 pt-4 pb-4 space-y-4">
        {/* Need Photos */}
        {needPhotos.length > 0 && (
          <div>
            <h3 className="text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2">
              <span className="w-2 h-2 bg-red-500 rounded-full" /> 待上传安装照片
            </h3>
            <div className="space-y-3">
              {needPhotos.map((task) => {
                const badge = getStatusBadge(task);
                return (
                  <div key={task.id} className="bg-white rounded-xl shadow-sm overflow-hidden">
                    <div className="p-4">
                      <div className="flex items-start justify-between mb-3">
                        <div>
                          <h4 className="text-base font-semibold text-gray-900">案例 #{task.id.toUpperCase()}</h4>
                          <p className="text-sm text-gray-500 mt-0.5">{task.model} · {task.size}</p>
                        </div>
                        <span className={`text-[10px] px-2 py-0.5 rounded-full font-medium ${badge.cls}`}>{badge.label}</span>
                      </div>
                      <div className="space-y-1.5 text-sm text-gray-500">
                        <div className="flex items-center gap-2">
                          <MapPin size={14} className="text-gray-400 flex-shrink-0" /> {task.city}{task.district ? ' · ' + task.district : ''} · {task.scene}
                        </div>
                        <div className="flex items-center gap-2">
                          <Store size={14} className="text-gray-400 flex-shrink-0" /> {task.storeName}
                        </div>
                        <div className="flex items-center gap-2">
                          <User size={14} className="text-gray-400 flex-shrink-0" /> 销售：{task.salesName}
                        </div>
                        {task.customerRequirement && (
                          <div className="flex items-start gap-2">
                            <ClipboardList size={14} className="text-gray-400 flex-shrink-0 mt-0.5" />
                            <span className="text-xs text-gray-400 line-clamp-2">拍摄要求：{task.customerRequirement}</span>
                          </div>
                        )}
                      </div>
                    </div>
                    <div className="flex border-t border-gray-50">
                      <button onClick={() => navigate(`/delivery/detail/${task.id}`)}
                        className="flex-1 py-3 text-sm font-medium text-gray-500 active:bg-gray-50">
                        查看详情
                      </button>
                      <button onClick={() => navigate(`/delivery/upload/${task.id}`)}
                        className="flex-1 py-3 text-sm font-semibold text-primary-600 active:bg-primary-50 border-l border-gray-50">
                        <Camera size={14} className="inline mr-1" />上传安装照片
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Completed */}
        {completed.length > 0 && (
          <div>
            <h3 className="text-sm font-semibold text-gray-700 mb-2">已完成</h3>
            <div className="space-y-2">
              {completed.map((task) => {
                const badge = getStatusBadge(task);
                return (
                  <div key={task.id} onClick={() => navigate(`/delivery/detail/${task.id}`)}
                    className="bg-white rounded-xl p-3 shadow-sm active:bg-gray-50 cursor-pointer">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-semibold text-gray-900">案例 #{task.id.toUpperCase()} · {task.model}</span>
                      <span className={`text-[10px] px-2 py-0.5 rounded-full font-medium ${badge.cls}`}>{badge.label}</span>
                    </div>
                    <div className="text-xs text-gray-400 mb-2">{task.city} · {task.storeName} · 销售：{task.salesName}</div>
                    <div className="flex gap-1 overflow-x-auto no-scrollbar">
                      {task.installImages.map((img, i) => (
                        <div key={i} className="w-14 h-14 rounded-lg overflow-hidden flex-shrink-0">
                          <img src={img} alt="" className="w-full h-full object-cover" />
                        </div>
                      ))}
                    </div>
                    {task.installerPoints > 0 && (
                      <div className="flex items-center gap-2 mt-2 text-xs">
                        <span className="text-green-600 font-medium">+{task.installerPoints} 积分</span>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {needPhotos.length === 0 && completed.length === 0 && (
          <div className="flex flex-col items-center justify-center py-20 text-gray-400">
            <svg width="48" height="48" viewBox="0 0 24 24" fill="none">
              <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="1.5"/>
              <path d="M12 6v6l4 2" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
            </svg>
            <p className="mt-3 text-sm">暂无案例采集任务</p>
            <p className="text-xs mt-1">销售创建案例采集任务后会自动分配给你</p>
          </div>
        )}
      </div>
    </div>
  );
}

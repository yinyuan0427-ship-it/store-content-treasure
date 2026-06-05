import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth, useToast } from '../App';
import { getAllDeliveryTasks, getSalesByUserId, updateDeliveryTask } from '../mock/data';
import { PenLine, Shield } from 'lucide-react';

export default function DeliveryStory() {
  const { taskId } = useParams<{ taskId: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { showToast } = useToast();

  const task = getAllDeliveryTasks().find(t => t.id === taskId);

  if (!task) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-400 mb-4">任务不存在</p>
          <button onClick={() => navigate(-1)} className="text-primary-600 font-medium">返回</button>
        </div>
      </div>
    );
  }

  const currentSalesId = user?.role === 'sales'
    ? getSalesByUserId(user?.phone || '')?.id || ''
    : '';
  const isOwnerSales = user?.role === 'sales' && currentSalesId === task.salesId;
  const canEdit = user?.role === 'admin' || user?.role === 'dealer_owner' || isOwnerSales;

  if (!canEdit) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-surface-50">
        <div className="text-center px-5 max-w-sm">
          <div className="w-16 h-16 bg-surface-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Shield size={28} className="text-surface-400" />
          </div>
          <h1 className="text-lg font-semibold text-gray-900 mb-2">无权编辑该案例</h1>
          <p className="text-sm text-surface-500 leading-relaxed mb-6">只能编辑自己名下的案例成交故事。</p>
          <button onClick={() => navigate(-1)} className="px-6 py-2.5 bg-navy-800 text-white font-medium rounded-xl text-sm">返回</button>
        </div>
      </div>
    );
  }

  const initialStoryText = [
    task.storyWhy,
    task.storyFocus,
    task.storyReason,
    task.storyFeedback,
  ].filter(Boolean).join('\n\n');
  const [storyText, setStoryText] = useState(initialStoryText);

  const handleSubmit = () => {
    if (!storyText.trim()) { showToast('请填写成交故事'); return; }

    showToast('成交故事提交成功！等待管理员审核');
    updateDeliveryTask(task.id, {
      storyWhy: storyText.trim(),
      storyFocus: '',
      storyReason: '',
      storyFeedback: '',
      storyPublic: '适合公开传播',
      reviewStatus: 'story_done',
    });
    setTimeout(() => navigate(`/delivery/detail/${task.id}`, { replace: true }), 800);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white px-4 pt-12 pb-3 border-b border-gray-100 flex items-center gap-3">
        <button onClick={() => navigate(-1)} className="text-gray-500">
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
            <path d="M15 18l-6-6 6-6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </button>
        <div>
          <h1 className="text-lg font-semibold text-gray-900">{task.storyWhy ? '编辑成交故事' : '补充成交故事'}</h1>
          <p className="text-xs text-gray-400">{task.customerAlias} · {task.model} · {task.salesName}</p>
        </div>
      </div>

      <div className="px-4 py-4 space-y-4 pb-6">
        {/* Install photos preview */}
        {task.installImages.length > 0 && (
          <div className="bg-white rounded-xl p-4 shadow-sm">
            <h3 className="text-sm font-semibold text-gray-700 mb-2">安装照片（{task.installImages.length}张）</h3>
            <div className="flex gap-2 overflow-x-auto no-scrollbar">
              {task.installImages.map((img, i) => (
                <div key={i} className="w-20 h-20 rounded-lg overflow-hidden flex-shrink-0">
                  <img src={img} alt="" className="w-full h-full object-cover" />
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="bg-white rounded-xl p-4 shadow-sm">
          <div>
            <label className="text-sm font-semibold text-gray-700 mb-1.5 block">
              成交故事 <span className="text-red-400">*</span>
            </label>
            <textarea
              value={storyText}
              onChange={(e) => setStoryText(e.target.value)}
              placeholder="简单写清楚客户怎么来的、为什么选这款、安装后有什么反馈。比如：客户之前睡硬床垫腰不舒服，到店试了两次，最后选了芸枫。送货后说支撑感比原来的好，次卧也睡得舒服。"
              rows={8}
              className="w-full px-3 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm resize-none focus:outline-none focus:border-primary-400 transition-colors leading-relaxed"
            />
            <p className="text-[10px] text-gray-400 mt-1.5">不用分点，像给同事讲这个客户为什么成交一样写即可。</p>
          </div>
        </div>

        <div className="bg-blue-50 border border-blue-100 rounded-xl p-4">
          <p className="text-sm font-medium text-blue-800">为什么要补充成交故事？</p>
          <p className="text-xs text-blue-600 mt-1">真实的成交故事能帮助其他销售学习经验、也能转化为素材库中的案例内容。补充完整故事奖励 +10 积分，审核通过后再奖励 +10 积分。</p>
        </div>

        <button onClick={handleSubmit}
          className="w-full h-12 bg-primary-600 text-white font-semibold rounded-xl text-base active:bg-primary-700 transition-colors shadow-lg shadow-primary-200">
          <PenLine size={16} className="inline mr-1" />{task.storyWhy ? '保存成交故事' : '提交案例故事'}
        </button>
      </div>
    </div>
  );
}

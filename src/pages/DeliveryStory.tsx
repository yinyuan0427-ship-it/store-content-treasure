import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useToast } from '../App';
import { getAllDeliveryTasks, updateDeliveryTask } from '../mock/data';
import { PenLine } from 'lucide-react';

export default function DeliveryStory() {
  const { taskId } = useParams<{ taskId: string }>();
  const navigate = useNavigate();
  const { showToast } = useToast();

  const task = getAllDeliveryTasks().find(t => t.id === taskId);

  const [storyWhy, setStoryWhy] = useState(task?.storyWhy || '');
  const [storyFocus, setStoryFocus] = useState(task?.storyFocus || '');
  const [storyReason, setStoryReason] = useState(task?.storyReason || '');
  const [storyFeedback, setStoryFeedback] = useState(task?.storyFeedback || '');

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

  const handleSubmit = () => {
    if (!storyWhy.trim()) { showToast('请填写客户为什么选择了我们'); return; }
    if (!storyFeedback.trim()) { showToast('请填写客户的评价或感受'); return; }

    showToast('成交故事提交成功！等待管理员审核');
    updateDeliveryTask(task.id, {
      storyWhy: storyWhy.trim(),
      storyFocus: storyFocus.trim(),
      storyReason: storyReason.trim(),
      storyFeedback: storyFeedback.trim(),
      storyPublic: '适合公开传播',
      reviewStatus: 'story_done',
    });
    setTimeout(() => navigate('/delivery'), 800);
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
          <h1 className="text-lg font-semibold text-gray-900">补充成交故事</h1>
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

        <div className="bg-white rounded-xl p-4 shadow-sm space-y-4">
          {/* Why buy */}
          <div>
            <label className="text-sm font-semibold text-gray-700 mb-1.5 block">
              客户为什么选择了我们？ <span className="text-red-400">*</span>
            </label>
            <textarea value={storyWhy} onChange={(e) => setStoryWhy(e.target.value)}
              placeholder="描述客户来店里的过程、试躺体验、对比了哪些品牌..."
              rows={3} className="w-full px-3 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm resize-none focus:outline-none focus:border-primary-400 transition-colors" />
          </div>

          {/* Focus */}
          <div>
            <label className="text-sm font-semibold text-gray-700 mb-1.5 block">客户比较在意哪些方面？</label>
            <textarea value={storyFocus} onChange={(e) => setStoryFocus(e.target.value)}
              placeholder="如：支撑性、透气性、性价比、品牌口碑..."
              rows={2} className="w-full px-3 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm resize-none focus:outline-none focus:border-primary-400 transition-colors" />
          </div>

          {/* Reason */}
          <div>
            <label className="text-sm font-semibold text-gray-700 mb-1.5 block">为什么最终选了这款产品？</label>
            <textarea value={storyReason} onChange={(e) => setStoryReason(e.target.value)}
              placeholder="描述客户为什么最终选了这款产品..."
              rows={2} className="w-full px-3 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm resize-none focus:outline-none focus:border-primary-400 transition-colors" />
          </div>

          {/* Feedback */}
          <div>
            <label className="text-sm font-semibold text-gray-700 mb-1.5 block">
              客户的评价或感受 <span className="text-red-400">*</span>
            </label>
            <textarea value={storyFeedback} onChange={(e) => setStoryFeedback(e.target.value)}
              placeholder="送货后客户的反馈、评价、感受..."
              rows={3} className="w-full px-3 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm resize-none focus:outline-none focus:border-primary-400 transition-colors" />
          </div>
        </div>

        <div className="bg-blue-50 border border-blue-100 rounded-xl p-4">
          <p className="text-sm font-medium text-blue-800">为什么要补充成交故事？</p>
          <p className="text-xs text-blue-600 mt-1">真实的成交故事能帮助其他销售学习经验、也能转化为素材库中的案例内容。补充完整故事奖励 +10 积分，审核通过后再奖励 +10 积分。</p>
        </div>

        <button onClick={handleSubmit}
          className="w-full h-12 bg-primary-600 text-white font-semibold rounded-xl text-base active:bg-primary-700 transition-colors shadow-lg shadow-primary-200">
          <PenLine size={16} className="inline mr-1" />提交案例故事
        </button>
      </div>
    </div>
  );
}

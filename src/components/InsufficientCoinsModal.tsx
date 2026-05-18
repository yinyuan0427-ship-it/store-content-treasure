import { useNavigate } from 'react-router-dom';
import { Coins, X } from 'lucide-react';

interface Props {
  onClose: () => void;
}

export default function InsufficientCoinsModal({ onClose }: Props) {
  const navigate = useNavigate();

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/40 backdrop-blur-sm" onClick={onClose}>
      <div className="bg-white rounded-t-2xl w-full max-w-app px-6 pt-6 pb-8" onClick={e => e.stopPropagation()}>
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Coins size={20} className="text-amber-500" />
            <h2 className="text-lg font-semibold text-gray-900">案例币不足</h2>
          </div>
          <button onClick={onClose} className="w-8 h-8 rounded-full bg-surface-100 flex items-center justify-center">
            <X size={16} className="text-surface-500" />
          </button>
        </div>

        <p className="text-sm text-surface-600 leading-relaxed mb-6">
          案例币是案例交换凭证。上传真实客户案例并审核通过后获得案例币，用于交换保存其他人的客户案例高清图。复制文案、复制链接、浏览案例均免费。
        </p>

        <div className="flex gap-3">
          <button
            onClick={() => { onClose(); navigate('/delivery/create'); }}
            className="flex-1 h-11 bg-navy-800 text-white font-semibold rounded-xl text-sm active:bg-navy-900 transition-colors"
          >
            去上传案例
          </button>
          <button
            onClick={onClose}
            className="flex-1 h-11 bg-surface-100 text-surface-600 font-medium rounded-xl text-sm active:bg-surface-200 transition-colors"
          >
            知道了
          </button>
        </div>
      </div>
    </div>
  );
}

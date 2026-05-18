import { X, Copy } from 'lucide-react';

interface Props {
  text: string;
  onClose: () => void;
}

export default function CopyModal({ text, onClose }: Props) {
  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center">
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />
      <div className="relative bg-white rounded-t-3xl sm:rounded-3xl w-full sm:max-w-sm shadow-premium animate-fade-up p-6 safe-bottom">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-base font-semibold text-gray-900">手动复制</h3>
          <button onClick={onClose} className="w-8 h-8 rounded-full bg-surface-50 flex items-center justify-center">
            <X size={16} className="text-surface-500" />
          </button>
        </div>
        <p className="text-xs text-surface-400 mb-3">当前浏览器限制自动复制，请长按文字手动复制</p>
        <div className="bg-surface-50 rounded-xl p-3 max-h-64 overflow-y-auto">
          <p className="text-sm text-gray-700 whitespace-pre-wrap leading-relaxed select-all">{text}</p>
        </div>
        <button
          onClick={onClose}
          className="w-full h-11 bg-navy-800 text-white font-semibold rounded-xl text-sm mt-4 active:bg-navy-900 transition-colors"
        >
          知道了
        </button>
      </div>
    </div>
  );
}

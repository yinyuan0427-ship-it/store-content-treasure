import { useParams, useNavigate } from 'react-router-dom';
import { useState } from 'react';
import { mockMaterials, isCaseMaterial } from '../mock/data';
import { useToast } from '../App';
import CopyModal from '../components/CopyModal';
import { copyText } from '../utils/clipboard';
import { Download, Copy, ArrowDown, ArrowUp, Coins } from 'lucide-react';

export default function ImageSave() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { showToast } = useToast();
  const [currentIdx, setCurrentIdx] = useState(0);
  const [copyModalText, setCopyModalText] = useState('');

  const material = mockMaterials.find(m => m.id === id);

  if (!material) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-400 text-lg mb-4">素材不存在</p>
          <button onClick={() => navigate('/library')} className="text-primary-600 font-medium">返回素材库</button>
        </div>
      </div>
    );
  }

  const handleCopy = async (text: string, _label?: string) => {
    const result = await copyText(text);
    if (result.success) {
      showToast('已复制，可直接粘贴发布');
    } else {
      setCopyModalText(text);
    }
  };

  return (
    <div className="min-h-screen bg-black flex flex-col">
      {/* Top Bar */}
      <div className="bg-black/90 backdrop-blur px-4 pt-12 pb-3 flex items-center justify-between z-10">
        <button onClick={() => navigate(-1)} className="text-white flex items-center gap-1">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
            <path d="M15 18l-6-6 6-6" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
          <span className="text-sm">返回</span>
        </button>
        <span className="text-white/80 text-sm">
          第 {currentIdx + 1} 张 / 共 {material.images.length} 张
        </span>
        <div className="w-16" />
      </div>

      {/* Case Coin Info Banner */}
      {isCaseMaterial(material) && (
        <div className="bg-emerald-500/90 mx-4 mt-3 rounded-xl px-4 py-3 flex items-center gap-3">
          <Coins size={24} strokeWidth={1.5} className="text-white" />
          <div>
            <p className="text-white text-sm font-medium">已消耗案例币，可长按保存本组高清案例图片</p>
            <p className="text-emerald-200 text-xs mt-0.5">上传真实案例获得案例币，用于交换保存其他客户案例高清图</p>
          </div>
        </div>
      )}

      {/* Hint Banner */}
      <div className="bg-blue-600/90 mx-4 mt-3 rounded-xl px-4 py-3 flex items-center gap-3">
        <ArrowDown size={24} strokeWidth={1.5} className="text-gray-400" />
        <div>
          <p className="text-white text-sm font-medium">微信内请长按图片</p>
          <p className="text-blue-200 text-xs mt-0.5">选择「保存到相册」即可保存</p>
        </div>
      </div>

      {/* Images */}
      <div className="flex-1 overflow-y-auto px-3 py-4 space-y-4">
        {material.images.map((img, i) => (
          <div key={i} className="rounded-xl overflow-hidden bg-gray-800 shadow-2xl">
            <div className="flex items-center justify-between px-4 py-2 bg-gray-900/80">
              <span className="text-white/70 text-xs font-medium">
                第 {i + 1} 张 / 共 {material.images.length} 张
              </span>
              <span className="text-gray-400 text-xs">长按保存到相册</span>
            </div>
            <img
              src={img}
              alt={`${material.title} - 图${i + 1}`}
              className="w-full h-auto"
              style={{ WebkitTouchCallout: 'default' }}
            />
            <div className="px-4 py-2 bg-gray-900/80">
              <p className="text-white/60 text-xs"><ArrowUp size={14} className="inline mr-1" />长按上方图片 → 保存到相册</p>
            </div>
          </div>
        ))}
      </div>

      {/* Bottom Actions */}
      <div className="bg-gray-900/95 backdrop-blur border-t border-gray-800 safe-area-bottom">
        <div className="flex items-center gap-2 px-4 py-3">
          {material.xhsContent ? (
            <>
              <button
                onClick={() => handleCopy(material.content, '朋友圈文案')}
                className="flex-1 h-11 bg-green-600 text-white font-semibold rounded-xl text-sm active:bg-green-700 transition-colors"
              >
                <Copy size={14} className="inline mr-1" />复制朋友圈文案
              </button>
              <button
                onClick={() => handleCopy(material.xhsContent!, '小红书文案')}
                className="flex-1 h-11 bg-red-600 text-white font-semibold rounded-xl text-sm active:bg-red-700 transition-colors"
              >
                <Copy size={14} className="inline mr-1" />复制小红书文案
              </button>
            </>
          ) : (
            <button
              onClick={() => handleCopy(material.content, '文案')}
              className="flex-1 h-11 bg-blue-600 text-white font-semibold rounded-xl text-sm active:bg-blue-700 transition-colors"
            >
              <Copy size={14} className="inline mr-1" />复制文案
            </button>
          )}
          <button
            onClick={() => navigate(`/material/${material.id}`)}
            className="flex-1 h-11 bg-gray-700 text-white font-semibold rounded-xl text-sm active:bg-gray-600 transition-colors"
          >
            ← 返回素材
          </button>
        </div>
      </div>

      {copyModalText && (
        <CopyModal text={copyModalText} onClose={() => setCopyModalText('')} />
      )}
    </div>
  );
}

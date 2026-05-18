import { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth, useToast } from '../App';
import { X, CheckCircle2 } from 'lucide-react';

const scenes = ['送货安装', '客户卧室实拍', '门店试睡', '新品到店', '客户成交', '售后服务'];

export default function Submit() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { showToast } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [images, setImages] = useState<string[]>([]);
  const [brand, setBrand] = useState('');
  const [model, setModel] = useState('');
  const [scene, setScene] = useState('');
  const [city, setCity] = useState(user?.city || '');
  const [description, setDescription] = useState('');

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;
    const newImages: string[] = [];
    for (let i = 0; i < files.length && images.length + newImages.length < 9; i++) {
      newImages.push(URL.createObjectURL(files[i]));
    }
    setImages(prev => [...prev, ...newImages].slice(0, 9));
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const removeImage = (idx: number) => {
    setImages(prev => prev.filter((_, i) => i !== idx));
  };

  const handleSubmit = () => {
    if (images.length === 0) { showToast('请至少上传一张图片'); return; }
    if (!brand.trim()) { showToast('请填写产品品牌'); return; }
    if (!scene) { showToast('请选择使用场景'); return; }
    if (!city.trim()) { showToast('请填写所在城市'); return; }

    showToast('提交成功！等待审核');
    setTimeout(() => navigate('/my-submissions'), 1000);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white px-4 pt-12 pb-4 border-b border-gray-100">
        <h1 className="text-lg font-semibold text-gray-900">上传案例</h1>
        <p className="text-xs text-gray-400 mt-1">像发朋友圈一样简单</p>
      </div>

      <div className="px-4 py-4 space-y-5 pb-6">
        {/* Image Upload */}
        <div className="bg-white rounded-xl p-4 shadow-sm">
          <label className="text-sm font-semibold text-gray-700 mb-3 block">
            上传图片 <span className="text-red-400">*</span>
            <span className="text-xs text-gray-400 font-normal ml-2">最多 9 张</span>
          </label>
          <div className="grid grid-cols-3 gap-2">
            {images.map((img, i) => (
              <div key={i} className="aspect-square rounded-lg overflow-hidden relative group">
                <img src={img} alt={`上传图${i + 1}`} className="w-full h-full object-cover" />
                <button
                  onClick={() => removeImage(i)}
                  className="absolute top-1 right-1 w-6 h-6 bg-black/50 rounded-full flex items-center justify-center text-white text-xs"
                >
                  <X size={12} />
                </button>
              </div>
            ))}
            {images.length < 9 && (
              <button
                onClick={() => fileInputRef.current?.click()}
                className="aspect-square rounded-lg border-2 border-dashed border-gray-200 flex flex-col items-center justify-center gap-1 text-gray-400 active:bg-gray-50 transition-colors"
              >
                <svg width="28" height="28" viewBox="0 0 24 24" fill="none">
                  <path d="M12 5v14M5 12h14" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"/>
                </svg>
                <span className="text-xs">{images.length === 0 ? '添加图片' : `${images.length}/9`}</span>
              </button>
            )}
          </div>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            multiple
            onChange={handleImageSelect}
            className="hidden"
          />
        </div>

        {/* Form Fields */}
        <div className="bg-white rounded-xl p-4 shadow-sm space-y-4">
          {/* Brand */}
          <div>
            <label className="text-sm font-semibold text-gray-700 mb-1.5 block">
              产品品牌 <span className="text-red-400">*</span>
            </label>
            <input
              type="text"
              value={brand}
              onChange={(e) => setBrand(e.target.value)}
              placeholder="如：TEMPUR"
              className="w-full h-11 px-3 bg-gray-50 border border-gray-200 rounded-xl text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:border-primary-400 transition-colors"
            />
          </div>

          {/* Model */}
          <div>
            <label className="text-sm font-semibold text-gray-700 mb-1.5 block">产品型号</label>
            <input
              type="text"
              value={model}
              onChange={(e) => setModel(e.target.value)}
              placeholder="如：TEMPUR FORM™ 芸枫系列"
              className="w-full h-11 px-3 bg-gray-50 border border-gray-200 rounded-xl text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:border-primary-400 transition-colors"
            />
          </div>

          {/* Scene */}
          <div>
            <label className="text-sm font-semibold text-gray-700 mb-1.5 block">
              使用场景 <span className="text-red-400">*</span>
            </label>
            <div className="grid grid-cols-3 gap-2">
              {scenes.map((s) => (
                <button
                  key={s}
                  onClick={() => setScene(s)}
                  className={`py-2.5 px-2 rounded-xl text-xs font-medium border transition-all ${
                    scene === s
                      ? 'bg-primary-50 border-primary-400 text-primary-700'
                      : 'bg-gray-50 border-gray-200 text-gray-500 active:bg-gray-100'
                  }`}
                >
                  {s}
                </button>
              ))}
            </div>
          </div>

          {/* City */}
          <div>
            <label className="text-sm font-semibold text-gray-700 mb-1.5 block">
              所在城市 <span className="text-red-400">*</span>
            </label>
            <input
              type="text"
              value={city}
              onChange={(e) => setCity(e.target.value)}
              placeholder="如：苏州"
              className="w-full h-11 px-3 bg-gray-50 border border-gray-200 rounded-xl text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:border-primary-400 transition-colors"
            />
          </div>

          {/* Description */}
          <div>
            <label className="text-sm font-semibold text-gray-700 mb-1.5 block">案例说明 <span className="text-xs text-gray-400 font-normal">（可选）</span></label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="简单描述这个案例，帮助审核人员理解..."
              rows={3}
              className="w-full px-3 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:border-primary-400 transition-colors resize-none"
            />
          </div>
        </div>

        {/* Tips */}
        <div className="bg-green-50 border border-green-100 rounded-xl p-4">
          <div className="flex items-start gap-2">
            <CheckCircle2 size={16} className="text-green-500 mt-0.5" />
            <div>
              <p className="text-sm font-medium text-green-800">审核通过后可获得积分</p>
              <p className="text-xs text-green-600 mt-1">原创实拍图审核通过奖励 +10 积分，重复图片无法获得积分。优质案例有机会被总部选用并额外奖励。</p>
            </div>
          </div>
        </div>

        {/* Submit Button */}
        <button
          onClick={handleSubmit}
          className="w-full h-12 bg-primary-600 text-white font-semibold rounded-xl text-base active:bg-primary-700 transition-colors shadow-lg shadow-primary-200"
        >
          提交审核
        </button>
      </div>
    </div>
  );
}

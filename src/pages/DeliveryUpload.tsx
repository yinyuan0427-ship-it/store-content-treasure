import { useState, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth, useToast } from '../App';
import { getAllDeliveryTasks, updateDeliveryTask, getInstallerByUserId } from '../mock/data';
import { ArrowLeft, Camera, Send, ShieldCheck, CheckCircle2, AlertTriangle, X, Plus } from 'lucide-react';

const installStatuses = [
  { key: 'completed', label: '已完成安装' },
  { key: 'customer_not_home', label: '客户未在家' },
  { key: 'site_issue', label: '现场异常' },
  { key: 'need_after_sales', label: '需要售后跟进' },
];

const privacyItems = [
  { key: 'noFace', label: '未包含客户人脸' },
  { key: 'noDoorNumber', label: '未包含门牌号' },
  { key: 'noDeliveryDoc', label: '未包含快递单/送货单' },
  { key: 'noPhone', label: '未包含手机号' },
  { key: 'noAddress', label: '未包含详细地址' },
  { key: 'noContract', label: '未包含合同/发票' },
  { key: 'noPrice', label: '未包含价格牌' },
  { key: 'noIdCard', label: '未包含身份证件' },
];

export default function DeliveryUpload() {
  const { taskId } = useParams<{ taskId: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { showToast } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const task = getAllDeliveryTasks().find(t => t.id === taskId);
  const [images, setImages] = useState<string[]>([]);
  const [status, setStatus] = useState('');
  const [note, setNote] = useState('');
  const [privacyConfirmed, setPrivacyConfirmed] = useState(false);
  const isRejected = task?.reviewStatus === 'rejected';

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

  const isInstaller = user?.role === 'installer';
  const installerId = isInstaller ? getInstallerByUserId(user?.phone || '')?.id || null : null;
  if (isInstaller && task.installerId !== installerId) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center px-6">
          <AlertTriangle size={40} strokeWidth={1} className="mx-auto mb-3 text-amber-500" />
          <p className="text-gray-700 font-medium mb-1">无权访问该任务</p>
          <p className="text-sm text-gray-400 mb-4">你只能查看自己被分配的安装任务</p>
          <button onClick={() => navigate('/delivery/tasks', { replace: true })} className="text-navy-700 font-medium text-sm">返回交付任务</button>
        </div>
      </div>
    );
  }

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;
    const slots = Math.max(0, 9 - images.length);
    Array.from(files).slice(0, slots).forEach((file) => {
      const reader = new FileReader();
      reader.onload = () => {
        if (typeof reader.result === 'string') {
          setImages(prev => [...prev, reader.result as string].slice(0, 9));
        }
      };
      reader.readAsDataURL(file);
    });
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const removeImage = (idx: number) => {
    setImages(prev => prev.filter((_, i) => i !== idx));
  };

  const handleSubmit = () => {
    if (images.length === 0) { showToast('请至少上传一张安装照片'); return; }
    if (!status) { showToast('请选择安装状态'); return; }
    if (!privacyConfirmed) { showToast('请确认照片中未包含客户隐私信息'); return; }

    updateDeliveryTask(task.id, {
      installImages: images,
      installStatus: status as any,
      installNote: note.trim(),
      reviewStatus: 'photos_uploaded',
      reviewNote: '',
      dupRefTaskId: undefined,
      privacyChecks: {
        hasFace: false,
        hasDoorNumber: false,
        hasPhoneOrAddress: false,
        hasDeliveryDocOrContract: false,
        hasPriceInfo: false,
        hasCompetitorBrand: false,
        hasClutteredScene: false,
      },
    });
    showToast(isRejected ? '补拍照片提交成功，等待重新审核' : '照片提交成功！销售将补充成交故事');
    setTimeout(() => navigate(`/delivery/detail/${task.id}`, { replace: true }), 800);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white px-4 pt-12 pb-3 border-b border-gray-100 flex items-center gap-3">
        <button onClick={() => navigate(-1)} className="text-gray-500">
          <ArrowLeft size={22} />
        </button>
        <div>
          <h1 className="text-lg font-semibold text-gray-900">{isRejected ? '重新上传安装照片' : '上传安装照片'}</h1>
          <p className="text-xs text-gray-400">案例 #{task.id.toUpperCase()} · {task.model}</p>
        </div>
      </div>

      <div className="px-4 py-4 space-y-5 pb-6">
        {isRejected && task.reviewNote && (
          <div className="bg-red-50 border border-red-200 rounded-xl p-4">
            <div className="flex items-center gap-2 mb-2">
              <AlertTriangle size={16} className="text-red-500" />
              <p className="text-sm font-semibold text-red-700">本次需要补拍重提</p>
            </div>
            <p className="text-sm text-red-700 leading-relaxed">{task.reviewNote}</p>
            <p className="text-xs text-red-500 mt-2">请重新选择干净照片，提交后会替换旧照片并进入重新审核。</p>
          </div>
        )}

        {/* Upload Requirements */}
        <div className="bg-navy-50 border border-navy-200 rounded-xl p-4">
          <div className="flex items-center gap-2 mb-2">
            <ShieldCheck size={16} className="text-navy-600" />
            <p className="text-sm font-semibold text-navy-700">上传要求</p>
          </div>
          <div className="space-y-1 text-xs text-navy-600">
            <p>· 必须为自己门店真实交付照片</p>
            <p>· 不得上传其他导购/其他门店案例照片</p>
            <p>· 不得包含第三方水印或平台截图水印</p>
            <p>· 不得包含客户隐私信息</p>
            <p>· 疑似重复或带水印不会获得积分</p>
          </div>
        </div>

        {/* Privacy Warning - top priority */}
        <div className="bg-red-50 border border-red-200 rounded-xl p-4">
          <div className="flex items-center gap-2 mb-2">
            <AlertTriangle size={16} className="text-red-500" />
            <p className="text-sm font-semibold text-red-700">请勿上传包含以下信息的照片</p>
          </div>
          <div className="grid grid-cols-2 gap-x-4 gap-y-1 mt-2">
            {[
              '客户人脸', '门牌号', '快递单/送货单', '手机号',
              '详细地址', '合同/发票', '价格牌', '身份证件',
            ].map((item) => (
              <div key={item} className="flex items-center gap-1.5 text-xs text-red-600">
                <span className="w-1 h-1 bg-red-400 rounded-full flex-shrink-0" />
                {item}
              </div>
            ))}
          </div>
        </div>

        {/* Image Upload */}
        <div className="bg-white rounded-xl p-4 shadow-card">
          <div className="flex items-center gap-1.5 mb-3">
            <Camera size={16} className="text-gray-600" />
            <span className="text-sm font-semibold text-gray-700">
              安装照片 <span className="text-red-400">*</span>
            </span>
            <span className="text-xs text-gray-400 font-normal ml-2">最多 9 张</span>
          </div>
          <div className="grid grid-cols-3 gap-2">
            {images.map((img, i) => (
              <div key={i} className="aspect-square rounded-lg overflow-hidden relative">
                <img src={img} alt={`安装图${i + 1}`} className="w-full h-full object-cover" />
                <button onClick={() => removeImage(i)}
                  className="absolute top-1 right-1 w-6 h-6 bg-black/50 rounded-full flex items-center justify-center text-white">
                  <X size={12} />
                </button>
              </div>
            ))}
            {images.length < 9 && (
              <button onClick={() => fileInputRef.current?.click()}
                className="aspect-square rounded-lg border-2 border-dashed border-gray-200 flex flex-col items-center justify-center gap-1 text-gray-400 active:bg-gray-50 transition-colors">
                <Plus size={28} strokeWidth={1.5} />
                <span className="text-xs">{images.length === 0 ? '添加照片' : `${images.length}/9`}</span>
              </button>
            )}
          </div>
          <input ref={fileInputRef} type="file" accept="image/*" multiple onChange={handleImageSelect} className="hidden" />
        </div>

        {/* Privacy Checklist — read-only reference */}
        <div className="bg-white rounded-xl p-4 shadow-card">
          <div className="flex items-center gap-1.5 mb-1">
            <ShieldCheck size={16} className="text-gray-600" />
            <span className="text-sm font-semibold text-gray-700">隐私检查清单</span>
          </div>
          <p className="text-[10px] text-surface-400 mb-3">上传前快速对照即可，不需要逐项勾选</p>
          <div className="grid grid-cols-2 gap-x-4 gap-y-2">
            {privacyItems.map((item) => (
              <div key={item.key} className="flex items-center gap-2 text-sm text-gray-500">
                <div className="w-1.5 h-1.5 rounded-full bg-green-400 flex-shrink-0" />
                <span>{item.label}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Privacy Confirmation Checkbox */}
        <div className="bg-white rounded-xl p-4 shadow-card">
          <button
            onClick={() => setPrivacyConfirmed(!privacyConfirmed)}
            className="flex items-start gap-3 w-full text-left"
          >
            <div className={`w-5 h-5 rounded border-2 flex items-center justify-center flex-shrink-0 mt-0.5 transition-colors ${
              privacyConfirmed ? 'bg-green-500 border-green-500' : 'border-gray-300'
            }`}>
              {privacyConfirmed && (
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none">
                  <path d="M5 12l4 4L19 7" stroke="white" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              )}
            </div>
            <span className={`text-sm leading-relaxed ${privacyConfirmed ? 'text-green-700 font-medium' : 'text-gray-600'}`}>
              我确认照片中未包含客户隐私信息 <span className="text-red-400">*</span>
            </span>
          </button>
          {!privacyConfirmed && (
            <p className="text-xs text-gray-400 mt-2 ml-8">对照上方清单确认后勾选即可，不勾选不能提交</p>
          )}
        </div>

        {/* Install Status */}
        <div className="bg-white rounded-xl p-4 shadow-card">
          <div className="flex items-center gap-1.5 mb-3">
            <CheckCircle2 size={16} className="text-gray-600" />
            <span className="text-sm font-semibold text-gray-700">安装状态 <span className="text-red-400">*</span></span>
          </div>
          <div className="space-y-2">
            {installStatuses.map((s) => (
              <button key={s.key} onClick={() => setStatus(s.key)}
                className={`w-full p-3 rounded-xl border text-left transition-all ${
                  status === s.key ? 'bg-primary-50 border-primary-400' : 'bg-gray-50 border-gray-200 active:bg-gray-100'
                }`}>
                <span className="text-sm font-medium">{s.label}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Note */}
        <div className="bg-white rounded-xl p-4 shadow-card">
          <label className="text-sm font-semibold text-gray-700 mb-1.5 block">现场备注 <span className="text-xs text-gray-400 font-normal">（可选）</span></label>
          <textarea value={note} onChange={(e) => setNote(e.target.value)}
            placeholder="如：楼梯窄搬运费劲但顺利完成。客户现场试躺很满意。（不记录客户隐私信息）"
            rows={3} className="w-full px-3 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm resize-none focus:outline-none focus:border-primary-400 transition-colors" />
        </div>

        <button onClick={handleSubmit}
          className="w-full h-12 bg-primary-600 text-white font-semibold rounded-xl text-base active:bg-primary-700 transition-colors shadow-lg shadow-primary-200 flex items-center justify-center gap-2">
          <Send size={18} />
          {isRejected ? '提交补拍照片' : '提交照片'}
        </button>
      </div>
    </div>
  );
}

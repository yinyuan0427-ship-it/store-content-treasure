import { useState, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth, useToast } from '../App';
import { getAllDeliveryTasks, mockMaterials } from '../mock/data';
import { generateMarketingContent } from '../services/ai/aiService';
import type {
  AiPlatform,
  AiRole,
  AiTone,
  AiSourceType,
  AiGenerateParams,
  AiGenerateResponse,
} from '../types/ai';
import { ArrowLeft, Loader2, Sparkles, Target, FileText, Copy, Lightbulb } from 'lucide-react';
import CopyModal from '../components/CopyModal';
import { copyText } from '../utils/clipboard';

const platforms: AiPlatform[] = ['朋友圈', '小红书', '抖音', '视频号', '微信私聊'];
const roles: AiRole[] = ['门店老板', '销售顾问', '安装师傅', '品牌运营'];
const tones: AiTone[] = ['高级专业', '真实案例', '轻松口语', '毒舌观点', '温暖感谢'];

export default function AiGenerate() {
  const { sourceType, id } = useParams<{ sourceType: string; id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { showToast } = useToast();
  const [copyModalText, setCopyModalText] = useState('');

  const validSourceType: AiSourceType =
    sourceType === 'delivery' ? 'delivery' : 'material';

  const source = useMemo(() => {
    if (validSourceType === 'delivery') {
      return getAllDeliveryTasks().find((t) => t.id === id);
    }
    return mockMaterials.find((m) => m.id === id);
  }, [validSourceType, id]);

  const [platform, setPlatform] = useState<AiPlatform>('朋友圈');
  const [role, setRole] = useState<AiRole>(
    user?.role === 'installer' ? '安装师傅' :
    user?.role === 'sales' ? '销售顾问' :
    user?.role === 'dealer_owner' ? '门店老板' :
    '品牌运营'
  );
  const [tone, setTone] = useState<AiTone>('真实案例');
  const [personalTouch, setPersonalTouch] = useState(true);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<AiGenerateResponse | null>(null);
  const [activeVersion, setActiveVersion] = useState(0);

  if (!source) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-400 mb-4">
            {validSourceType === 'delivery' ? '交付案例不存在' : '素材不存在'}
          </p>
          <button onClick={() => navigate(-1)} className="text-primary-600 font-medium">返回</button>
        </div>
      </div>
    );
  }

  const sourceContent = validSourceType === 'delivery'
    ? `${(source as any).customerAlias} · ${(source as any).model} · ${(source as any).storyWhy || ''} · ${(source as any).storyFeedback || ''}`
    : `${(source as any).title}\n${(source as any).content}`;

  const productName = validSourceType === 'delivery'
    ? `${(source as any).brand} ${(source as any).model}`
    : ((source as any).title?.split('|')[0] || 'TEMPUR');

  const scene = validSourceType === 'delivery'
    ? '送货安装'
    : ((source as any).scene || '客户案例');

  const imageCount = validSourceType === 'delivery'
    ? ((source as any).installImages?.length || 1)
    : ((source as any).images?.length || 1);

  const handleGenerate = async () => {
    setLoading(true);
    setResult(null);

    const params: AiGenerateParams = {
      sourceType: validSourceType,
      sourceId: id!,
      platform,
      role,
      city: user?.city || '苏州',
      storeName: user?.storeName || '苏州体验店',
      productName,
      scene,
      tone,
      personalTouch,
      sourceContent,
      imageCount,
      customerNeeds: validSourceType === 'delivery' ? (source as any).customerRequirement : undefined,
      deliveryStory: validSourceType === 'delivery'
        ? (source as any).storyFeedback
        : undefined,
    };

    try {
      const res = await generateMarketingContent(params);
      setResult(res);
      if (res.success) {
        showToast('AI 生成完成！3 个版本已就绪');
      } else {
        showToast('生成失败：' + (res.error || '未知错误'));
      }
    } catch {
      showToast('生成失败，请重试');
    }
    setLoading(false);
  };

  const handleCopy = async (text: string) => {
    const result = await copyText(text);
    if (result.success) {
      showToast('已复制，可直接粘贴发布');
    } else {
      setCopyModalText(text);
    }
  };

  const dupColors = { low: 'bg-green-50 text-green-600', medium: 'bg-amber-50 text-amber-600', high: 'bg-red-50 text-red-600' };
  const dupLabels = { low: '低重复风险', medium: '中重复风险', high: '高重复风险' };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white px-4 pt-12 pb-3 border-b border-gray-100 flex items-center gap-3">
        <button onClick={() => navigate(-1)} className="text-gray-500">
          <ArrowLeft size={22} />
        </button>
        <div>
          <h1 className="text-lg font-semibold text-gray-900">AI 文案生成</h1>
          <p className="text-xs text-gray-400">
            {validSourceType === 'delivery' ? '基于交付案例生成' : '基于素材库生成'}
            {' · '}{productName}
          </p>
        </div>
      </div>

      <div className="px-4 py-4 space-y-4 pb-6">
        {/* Config Panel */}
        <div className="bg-white rounded-xl p-4 shadow-card space-y-4">
          <h3 className="text-sm font-semibold text-gray-700 flex items-center gap-1.5">
            <Target size={16} className="text-primary-600" />
            生成设置
          </h3>

          {/* Platform */}
          <div>
            <label className="text-xs font-medium text-gray-500 mb-2 block">目标平台</label>
            <div className="flex gap-2 flex-wrap">
              {platforms.map((p) => (
                <button key={p} onClick={() => setPlatform(p)}
                  className={`px-3.5 py-2 rounded-xl text-sm font-medium transition-all ${
                    platform === p ? 'bg-primary-600 text-white shadow-sm' : 'bg-gray-50 text-gray-500 active:bg-gray-100'
                  }`}>{p}</button>
              ))}
            </div>
          </div>

          {/* Role */}
          <div>
            <label className="text-xs font-medium text-gray-500 mb-2 block">发布角色</label>
            <div className="flex gap-2 flex-wrap">
              {roles.map((r) => (
                <button key={r} onClick={() => setRole(r)}
                  className={`px-3.5 py-2 rounded-xl text-sm font-medium transition-all ${
                    role === r ? 'bg-primary-600 text-white shadow-sm' : 'bg-gray-50 text-gray-500 active:bg-gray-100'
                  }`}>{r}</button>
              ))}
            </div>
          </div>

          {/* Tone */}
          <div>
            <label className="text-xs font-medium text-gray-500 mb-2 block">文案语气</label>
            <div className="flex gap-2 flex-wrap">
              {tones.map((t) => (
                <button key={t} onClick={() => setTone(t)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-medium transition-all ${
                    tone === t ? 'bg-primary-600 text-white shadow-sm' : 'bg-gray-50 text-gray-500 active:bg-gray-100'
                  }`}>{t}</button>
              ))}
            </div>
          </div>

          {/* Personal Touch */}
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-gray-500">加入个人感受</span>
            <button onClick={() => setPersonalTouch(!personalTouch)}
              className={`w-12 h-7 rounded-full transition-colors relative ${personalTouch ? 'bg-primary-600' : 'bg-gray-300'}`}>
              <div className={`w-5 h-5 bg-white rounded-full absolute top-1 transition-all ${personalTouch ? 'left-6' : 'left-1'}`} />
            </button>
          </div>
        </div>

        {/* Source Preview */}
        <div className="bg-white rounded-xl p-4 shadow-card">
          <h3 className="text-sm font-semibold text-gray-700 mb-2 flex items-center gap-1.5">
            <FileText size={16} className="text-gray-500" />
            原始素材预览
          </h3>
          <div className="bg-gray-50 rounded-xl p-3 text-xs text-gray-500 max-h-32 overflow-y-auto whitespace-pre-wrap leading-relaxed">
            {sourceContent}
          </div>
        </div>

        {/* Generate Button */}
        <button onClick={handleGenerate} disabled={loading}
          className="w-full h-12 bg-gradient-to-r from-purple-600 to-primary-600 text-white font-semibold rounded-xl text-base active:opacity-90 disabled:opacity-50 transition-all shadow-lg shadow-purple-200 flex items-center justify-center gap-2">
          {loading ? (
            <>
              <Loader2 size={20} className="animate-spin" />
              AI 生成中...
            </>
          ) : (
            <>
              <Sparkles size={20} />
              AI 生成文案
            </>
          )}
        </button>

        {/* AI Disclaimer */}
        <p className="text-center text-[10px] text-gray-400 px-4">
          内容由 AI 生成，仅供参考。发布前请检查是否符合广告法和平台规范。
          {result && <span> 当前使用：{result.provider === 'mock' ? 'Mock 模拟' : result.provider}。</span>}
        </p>

        {/* Results */}
        {result?.success && result.versions.length > 0 && (
          <div className="space-y-4">
            {/* Version Tabs */}
            <div className="flex gap-2">
              {result.versions.map((v, i) => (
                <button key={i} onClick={() => setActiveVersion(i)}
                  className={`flex-1 py-2.5 rounded-xl text-sm font-medium transition-all ${
                    activeVersion === i
                      ? 'bg-primary-600 text-white shadow-sm'
                      : 'bg-white text-gray-500 border border-gray-200'
                  }`}>
                  版本 {v.index}
                </button>
              ))}
            </div>

            {/* Active Version Card */}
            {result.versions[activeVersion] && (() => {
              const v = result.versions[activeVersion];
              return (
                <div className="bg-white rounded-xl shadow-card overflow-hidden">
                  {/* Title */}
                  <div className="p-4 border-b border-gray-50">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-xs text-gray-400">标题</span>
                      <span className={`text-[10px] px-2 py-0.5 rounded-full font-medium ${dupColors[v.duplicateRisk]}`}>
                        {dupLabels[v.duplicateRisk]}
                      </span>
                    </div>
                    <h3 className="text-base font-bold text-gray-900">{v.title}</h3>
                  </div>

                  {/* Body */}
                  <div className="p-4 border-b border-gray-50">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-xs text-gray-400">正文</span>
                      <button onClick={() => handleCopy(v.body)}
                        className="text-xs text-primary-600 font-medium active:text-primary-700 flex items-center gap-1">
                        <Copy size={13} />
                        复制
                      </button>
                    </div>
                    <p className="text-sm text-gray-700 whitespace-pre-wrap leading-relaxed">{v.body}</p>
                  </div>

                  {/* Cover Text */}
                  <div className="p-4 border-b border-gray-50">
                    <span className="text-xs text-gray-400 mb-1 block">封面文案</span>
                    <p className="text-sm text-gray-700">{v.coverText}</p>
                  </div>

                  {/* Tags */}
                  <div className="p-4 border-b border-gray-50">
                    <span className="text-xs text-gray-400 mb-2 block">推荐标签</span>
                    <div className="flex gap-1.5 flex-wrap">
                      {v.tags.map((tag) => (
                        <span key={tag} className="text-xs px-2.5 py-1 rounded-full bg-blue-50 text-blue-600">#{tag}</span>
                      ))}
                    </div>
                  </div>

                  {/* Image Order */}
                  <div className="p-4 border-b border-gray-50">
                    <span className="text-xs text-gray-400 mb-2 block">图片顺序建议</span>
                    <div className="flex items-center gap-1.5">
                      {v.imageOrder.map((n, i) => (
                        <span key={i} className="w-8 h-8 rounded-lg bg-gray-100 flex items-center justify-center text-xs font-medium text-gray-600">
                          {n}
                          {i === 0 && <span className="text-[8px] text-primary-500 ml-0.5">封面</span>}
                        </span>
                      ))}
                      <span className="text-xs text-gray-400 ml-1">按此顺序排列图片</span>
                    </div>
                  </div>

                  {/* Suggestions */}
                  <div className="p-4 bg-amber-50">
                    <div className="flex items-center gap-1.5 mb-1">
                      <Lightbulb size={14} className="text-amber-500" />
                      <span className="text-xs text-amber-600 font-medium">使用建议</span>
                    </div>
                    <p className="text-xs text-amber-700">{v.suggestions}</p>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex border-t border-gray-50">
                    <button onClick={() => handleCopy(v.title + '\n\n' + v.body)}
                      className="flex-1 py-3 text-sm font-semibold text-primary-600 active:bg-primary-50 transition-colors flex items-center justify-center gap-1.5">
                      <Copy size={15} />
                      复制完整文案
                    </button>
                    <button onClick={() => handleCopy(v.body)}
                      className="flex-1 py-3 text-sm font-medium text-gray-500 active:bg-gray-50 transition-colors border-l border-gray-50">
                      仅复制正文
                    </button>
                  </div>
                </div>
              );
            })()}
          </div>
        )}
      </div>

      {copyModalText && (
        <CopyModal text={copyModalText} onClose={() => setCopyModalText('')} />
      )}
    </div>
  );
}

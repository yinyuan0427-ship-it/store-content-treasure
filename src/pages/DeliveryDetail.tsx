import { useParams, useNavigate } from 'react-router-dom';
import { useAuth, useToast, useFavorites } from '../App';
import { canShareCase, getAllDeliveryTasks, getInstallerByUserId, getSalesByUserId, updateDeliveryTask, getStoryText } from '../mock/data';
import { useState } from 'react';
import CopyModal from '../components/CopyModal';
import { copyText } from '../utils/clipboard';
import { generateCustomerShareText, getShareUrl, truncateForPoster } from '../utils/share';
import { QRCodeSVG } from 'qrcode.react';
import { ArrowLeft, Star, MapPin, Store, Camera, PenLine, Eye, CheckCircle2, Share2, Copy, Sparkles, QrCode, X, Image } from 'lucide-react';

export default function DeliveryDetail() {
  const { taskId } = useParams<{ taskId: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { showToast } = useToast();
  const { toggleFavorite, isFavorited } = useFavorites();
  const [copyModalText, setCopyModalText] = useState('');
  const [previewImageIndex, setPreviewImageIndex] = useState<number | null>(null);

  const task = getAllDeliveryTasks().find(t => t.id === taskId);

  if (!task) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-surface-50">
        <div className="text-center">
          <p className="text-surface-400 mb-4">案例不存在</p>
          <button onClick={() => navigate(-1)} className="text-navy-700 font-medium">返回</button>
        </div>
      </div>
    );
  }

  const isInstaller = user?.role === 'installer';
  const currentInstallerId = isInstaller ? getInstallerByUserId(user?.phone || '')?.id || null : null;

  const currentSalesId = user?.role === 'sales'
    ? getSalesByUserId(user?.phone || '')?.id || ''
    : '';
  const isOwnerSales = user?.role === 'sales' && currentSalesId === task.salesId;
  const isDealerOwner = user?.role === 'dealer_owner';
  const isAdmin = user?.role === 'admin';
  const canEditCaseContent = isOwnerSales || isDealerOwner || isAdmin;

  const canEditRequirement = canEditCaseContent;
  const [editRequirementModal, setEditRequirementModal] = useState(false);
  const [editRequirementText, setEditRequirementText] = useState('');
  if (isInstaller && task.installerId !== currentInstallerId) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-surface-50">
        <div className="text-center px-6">
          <svg width="40" height="40" viewBox="0 0 24 24" fill="none" className="mx-auto mb-3 text-amber-500">
            <path d="M12 2L2 20h20L12 2z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
            <path d="M12 10v4" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
            <circle cx="12" cy="17" r="1" fill="currentColor"/>
          </svg>
          <p className="text-gray-700 font-medium mb-1">无权访问该任务</p>
          <p className="text-sm text-surface-400 mb-4">你只能查看自己被分配的安装任务</p>
          <button onClick={() => navigate('/delivery/tasks', { replace: true })} className="text-navy-700 font-medium text-sm">返回交付任务</button>
        </div>
      </div>
    );
  }

  const statusConfig: Record<string, { label: string; cls: string }> = {
    draft: { label: '待安装', cls: 'bg-surface-100 text-surface-500' },
    photos_uploaded: { label: '待补故事', cls: 'bg-warm-50 text-warm-700' },
    story_done: { label: '待审核', cls: 'bg-blue-50 text-blue-700' },
    pending: { label: '待审核', cls: 'bg-blue-50 text-blue-700' },
    approved: { label: '已通过', cls: 'bg-green-50 text-green-700' },
    rejected: { label: '已驳回', cls: 'bg-red-50 text-red-600' },
    suspected_dup: { label: '疑似重复', cls: 'bg-orange-50 text-orange-700' },
    confirmed_dup: { label: '判定重复', cls: 'bg-surface-100 text-surface-500' },
    featured: { label: '精选案例', cls: 'bg-warm-50 text-warm-700 border border-warm-200' },
  };

  const sc = statusConfig[task.reviewStatus] || { label: task.reviewStatus, cls: 'bg-surface-100' };

  const handleCopy = async (text: string) => {
    const result = await copyText(text);
    if (result.success) {
      showToast('已复制，可直接粘贴发布');
    } else {
      setCopyModalText(text);
    }
  };

  const [showPosterModal, setShowPosterModal] = useState(false);
  const shareSalesId = currentSalesId || task.salesId;

  const canUploadPhoto = isInstaller && task.installImages.length === 0;
  const canOwnerUploadPhoto = canEditCaseContent && task.installImages.length === 0;
  const canEditStory = canEditCaseContent && task.installImages.length > 0;
  const canAddStory = canEditStory && !getStoryText(task);
  const canReuploadCleanPhotos = isInstaller && (
    task.reviewStatus === 'rejected' ||
    task.reviewStatus === 'suspected_dup' ||
    task.reviewStatus === 'confirmed_dup'
  );

  return (
    <div className="min-h-screen bg-surface-50 flex flex-col">
      {/* Header */}
      <div className="bg-white px-4 pt-12 pb-3 border-b border-surface-100 flex items-center gap-3">
        <button onClick={() => navigate(-1)} className="text-surface-500">
          <ArrowLeft size={22} />
        </button>
        <h1 className="text-lg font-semibold text-gray-900">{isInstaller ? '交付任务详情' : '案例详情'}</h1>
      </div>

      <div className="flex-1 px-4 py-4 space-y-4 pb-24">
        {/* Status row */}
        <div className="flex items-center justify-between">
          <span className="text-sm text-surface-400">案例 #{task.id.toUpperCase()}</span>
          <span className={`text-xs px-3 py-1 rounded-full font-medium ${sc.cls}`}>{sc.label}</span>
        </div>

        {/* Customer & Product Info */}
        <div className="bg-white rounded-2xl p-4 shadow-card">
          <h2 className="text-lg font-bold text-gray-900">{task.city} · {task.scene}</h2>
          <p className="text-sm text-surface-500 mt-0.5">{task.customerAlias}</p>
          <div className="flex flex-wrap gap-2 mt-2 text-sm text-surface-500">
            <span className="flex items-center gap-1"><Store size={14} />{task.storeName}</span>
            {task.district && <><span>·</span><span className="flex items-center gap-1"><MapPin size={14} />{task.district}</span></>}
          </div>
          <div className="mt-3 p-3 bg-surface-50 rounded-xl space-y-1.5 text-sm">
            <div className="flex justify-between"><span className="text-surface-400">产品</span><span className="text-gray-900 font-medium">{task.brand} {task.model}</span></div>
            <div className="flex justify-between"><span className="text-surface-400">尺寸</span><span className="text-gray-900">{task.size}</span></div>
            <div className="flex justify-between"><span className="text-surface-400">场景</span><span className="text-gray-900">{task.scene}</span></div>
            <div className="flex justify-between"><span className="text-surface-400">销售</span><span className="text-gray-900">{task.salesName}</span></div>
            {task.installerName ? (
              <div className="flex justify-between"><span className="text-surface-400">安装师傅</span><span className="text-gray-900">{task.installerName}</span></div>
            ) : (
              <div className="flex justify-between"><span className="text-surface-400">采集方式</span><span className="text-gray-900">导购上传</span></div>
            )}
            {!isInstaller && (
            <div className="flex justify-between"><span className="text-surface-400">分享状态</span><span className={`font-medium ${task.authStatus === '可公开使用' ? 'text-green-600' : task.authStatus === '仅内部学习' ? 'text-warm-600' : 'text-surface-500'}`}>{task.authStatus === '可公开使用' ? '可分享' : task.authStatus === '仅内部学习' ? '内部案例' : '待审核'}</span></div>
            )}
          </div>
          {task.customerRequirement && (
            <div className="mt-3 p-3 bg-blue-50 rounded-xl border border-blue-100">
              <div className="flex items-center justify-between mb-1">
                <p className="text-xs text-blue-500 font-medium">客户需求</p>
                {canEditRequirement && (
                  <button
                    onClick={() => { setEditRequirementText(task.customerRequirement); setEditRequirementModal(true); }}
                    className="text-xs text-navy-700 font-medium bg-navy-50 px-2 py-1 rounded-full active:bg-navy-100 transition-colors"
                  >编辑</button>
                )}
              </div>
              <p className="text-sm text-blue-800">{task.customerRequirement}</p>
            </div>
          )}
        </div>

        {/* Install Photos */}
        <div className="bg-white rounded-2xl p-4 shadow-card">
          <h3 className="text-sm font-semibold text-gray-700 mb-3 flex items-center gap-1.5">
            <Camera size={16} />
            {task.installerId ? '安装照片' : '案例照片'}
            {task.installImages.length > 0 && <span className="text-surface-400 font-normal ml-1">({task.installImages.length}张)</span>}
          </h3>
          {task.installImages.length > 0 ? (
            <>
            <div className="grid grid-cols-3 gap-2">
              {task.installImages.map((img, i) => (
                <button
                  key={i}
                  onClick={() => setPreviewImageIndex(i)}
                  className="aspect-square rounded-xl overflow-hidden bg-surface-100 active:opacity-80"
                >
                  <img
                    src={img}
                    alt={`照片${i + 1}`}
                    className="w-full h-full object-cover"
                    style={{ WebkitTouchCallout: 'default', WebkitUserSelect: 'auto', userSelect: 'auto' }}
                  />
                </button>
              ))}
            </div>
            <p className="text-[10px] text-surface-400 mt-2">点击图片查看大图，手机上长按大图可保存到相册</p>
            {isInstaller && (
              <div className="mt-3 p-3 rounded-xl text-sm font-medium text-center
                {task.reviewStatus === 'featured' ? 'bg-warm-50 text-warm-700 border border-warm-200' :
                 task.reviewStatus === 'approved' ? 'bg-green-50 text-green-700 border border-green-200' :
                 task.reviewStatus === 'rejected' ? 'bg-red-50 text-red-600 border border-red-100' :
                 'bg-blue-50 text-blue-700 border border-blue-100'}">
                {task.reviewStatus === 'featured' && '已评为精选案例，预计奖励 +10元'}
                {task.reviewStatus === 'approved' && '照片已通过审核，预计奖励 +5元'}
                {(task.reviewStatus === 'pending' || task.reviewStatus === 'story_done') && '照片已上传，等待管理员审核'}
                {task.reviewStatus === 'rejected' && '照片需补拍，请查看下方审核备注后重新上传'}
                {task.reviewStatus === 'suspected_dup' && '照片疑似重复，等待管理员判定'}
                {task.reviewStatus === 'confirmed_dup' && '照片被判定为重复，未获得奖励'}
              </div>
            )}
            </>
          ) : (
            <div className="text-center py-8 text-surface-400 text-sm">
              <Camera size={32} className="mx-auto mb-2" strokeWidth={1} />
              <p>{task.installerId ? '安装师傅还未上传照片' : '还未上传案例照片'}</p>
            </div>
          )}
          {task.installStatus && (
            <div className="mt-3 flex items-center gap-2 text-sm">
              <span className="text-surface-400">安装状态：</span>
              <span className="font-medium text-gray-700">
                {task.installStatus === 'completed' ? '已完成安装' :
                 task.installStatus === 'customer_not_home' ? '客户未在家' :
                 task.installStatus === 'site_issue' ? '现场异常' : '需要售后跟进'}
              </span>
            </div>
          )}
          {task.installNote && (
            <div className="mt-2 p-3 bg-surface-50 rounded-xl text-sm text-surface-600">{task.installNote}</div>
          )}
        </div>

        {/* Sales Story */}
        {!isInstaller && (getStoryText(task) || canEditStory) && (
          <div className="bg-white rounded-2xl p-4 shadow-card">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-semibold text-gray-700 flex items-center gap-1.5">
                <PenLine size={16} />
                成交故事
              </h3>
              {getStoryText(task) && canEditStory && (
                <button
                  onClick={() => navigate(`/delivery/story/${task.id}`)}
                  className="text-xs text-navy-700 font-medium bg-navy-50 px-3 py-1.5 rounded-full active:bg-navy-100 transition-colors"
                >
                  编辑
                </button>
              )}
            </div>
            {getStoryText(task) ? (
              <div className="text-sm text-gray-700 leading-relaxed whitespace-pre-wrap">
                {getStoryText(task)}
                {user?.role === 'admin' && task.storyPublic && (
                  <div className="mt-2">
                    <span className={`inline-block text-xs px-2 py-1 rounded-full ${
                      task.storyPublic === '适合公开传播' ? 'bg-green-50 text-green-600' : 'bg-surface-50 text-surface-500'
                    }`}>{task.storyPublic}</span>
                  </div>
                )}
              </div>
            ) : (
              <div className="text-center py-6 text-surface-400 text-sm">
                <PenLine size={32} className="mx-auto mb-2" strokeWidth={1} />
                <p className="mb-3">等待销售补充成交故事</p>
                {canEditStory && (
                  <button
                    onClick={() => navigate(`/delivery/story/${task.id}`)}
                    className="h-10 px-5 bg-navy-800 text-white font-semibold rounded-xl text-sm active:bg-navy-900 transition-colors inline-flex items-center justify-center gap-1.5"
                  >
                    <PenLine size={15} />
                    补充成交故事
                  </button>
                )}
              </div>
            )}
          </div>
        )}

        {/* Points */}
        {!isInstaller && (task.salesPoints > 0 || task.installerPoints > 0 || task.storePoints > 0) && (
          <div className="bg-white rounded-2xl p-4 shadow-card">
            <h3 className="text-sm font-semibold text-gray-700 mb-3 flex items-center gap-1.5">
              <Star size={16} className="text-warm-500" />
              积分明细
            </h3>
            <div className="space-y-2 text-sm">
              {task.salesPoints > 0 && (
                <div className="flex justify-between"><span className="text-surface-500">销售积分</span><span className="text-green-600 font-bold">+{task.salesPoints}</span></div>
              )}
              {task.installerPoints > 0 && (
                <div className="flex justify-between"><span className="text-surface-500">安装师傅积分</span><span className="text-green-600 font-bold">+{task.installerPoints}</span></div>
              )}
              {task.storePoints > 0 && (
                <div className="flex justify-between"><span className="text-surface-500">门店积分</span><span className="text-green-600 font-bold">+{task.storePoints}</span></div>
              )}
            </div>
          </div>
        )}

        {/* AI Generate Section */}
        {!isInstaller && canEditCaseContent && task.installImages.length > 0 && (
          <div className="bg-white rounded-2xl p-4 shadow-card border border-purple-100">
            <div className="mb-3">
              <h3 className="text-sm font-semibold text-gray-700 flex items-center gap-1.5">
                <Sparkles size={16} className="text-purple-500" />
                AI 文案生成
              </h3>
              <p className="text-xs text-surface-400 mt-0.5">基于交付案例生成各平台文案</p>
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => navigate(`/ai-generate/delivery/${task.id}`)}
                className="flex-1 h-10 bg-green-500 text-white font-semibold rounded-xl text-sm active:bg-green-600 transition-colors"
              >
                朋友圈
              </button>
              <button
                onClick={() => navigate(`/ai-generate/delivery/${task.id}`)}
                className="flex-1 h-10 bg-red-500 text-white font-semibold rounded-xl text-sm active:bg-red-600 transition-colors"
              >
                小红书
              </button>
              <button
                onClick={() => navigate(`/ai-generate/delivery/${task.id}`)}
                className="flex-1 h-10 bg-navy-800 text-white font-semibold rounded-xl text-sm active:bg-navy-900 transition-colors"
              >
                抖音
              </button>
            </div>
          </div>
        )}

        {/* Client Share Section — not visible to installer */}
        {!isInstaller && (() => {
          const canShare = canShareCase(task);
          const isApproved = task.reviewStatus === 'approved' || task.reviewStatus === 'featured';
          const isAuthorized = task.authStatus === '可公开使用';
          const hasImages = task.installImages.length > 0;
          const hasPrivacyIssue = task.privacyChecks && (
            task.privacyChecks.hasFace || task.privacyChecks.hasDoorNumber ||
            task.privacyChecks.hasPhoneOrAddress || task.privacyChecks.hasDeliveryDocOrContract ||
            task.privacyChecks.hasPriceInfo || task.privacyChecks.hasCompetitorBrand ||
            task.privacyChecks.hasClutteredScene
          );

          let reasonText = '';
          let actionText = '';
          let actionClick: (() => void) | null = null;
          let borderCls = 'border-green-200';

          if (canShare) {
            reasonText = '';
            borderCls = 'border-green-200';
          } else if (!hasImages) {
            reasonText = '请先上传交付照片，审核通过后可分享';
            actionText = '去上传照片';
            actionClick = () => navigate(`/delivery/upload/${task.id}`);
            borderCls = 'border-surface-200';
          } else if (!isApproved) {
            reasonText = '案例审核通过后，可一键分享给客户';
            actionText = '待审核通过';
            borderCls = 'border-warm-200';
          } else if (!isAuthorized) {
            reasonText = '该案例暂不适合分享给客户';
            actionText = '不可分享';
            borderCls = 'border-red-200';
          } else if (hasPrivacyIssue) {
            reasonText = '该案例含隐私风险，需处理后才能公开分享';
            actionText = '查看隐私问题';
            borderCls = 'border-red-200';
          }

          return (
          <div className={`bg-white rounded-2xl p-4 shadow-card border ${borderCls}`}>
            <div className="mb-3">
              <h3 className="text-sm font-semibold text-gray-700 flex items-center gap-1.5">
                <Share2 size={16} className={canShare ? 'text-green-600' : 'text-surface-400'} />
                {canShare ? '一键分享案例给客户' : '客户分享'}
              </h3>
              <p className="text-xs text-surface-400 mt-0.5">
                {canShare
                  ? '生成客户专属分享页，用于成交转化'
                  : reasonText}
              </p>
            </div>

            {canShare ? (
              <>
                <div className="flex gap-2 mb-2">
                  <button
                    onClick={() => {
                      const url = getShareUrl(task.id, shareSalesId, {
                        storeId: task.storeId,
                        channel: 'wechat_private',
                        entry: 'delivery_detail',
                      });
                      copyText(url).then((result) => {
                        if (result.success) showToast('链接已复制，发送到微信后将展示案例卡片');
                        else setCopyModalText(url);
                      });
                    }}
                    className="flex-1 h-11 bg-navy-800 text-white font-semibold rounded-xl text-sm active:bg-navy-900 transition-colors flex items-center justify-center gap-1.5"
                  >
                    <Copy size={15} />
                    复制微信卡片链接
                  </button>
                  <button
                    onClick={() => {
                      const url = new URL(getShareUrl(task.id, shareSalesId, {
                        storeId: task.storeId,
                        channel: 'preview',
                        entry: 'delivery_detail',
                      }));
                      navigate(`${url.pathname}${url.search}`);
                    }}
                    className="flex-1 h-11 bg-white border border-surface-200 text-gray-700 font-semibold rounded-xl text-sm active:bg-surface-50 transition-colors flex items-center justify-center gap-1.5"
                  >
                    <Eye size={15} />
                    预览客户看到的页面
                  </button>
                </div>
                <button
                  onClick={() => setShowPosterModal(true)}
                  className="w-full h-10 bg-white border border-navy-200 text-navy-700 font-semibold rounded-xl text-sm active:bg-navy-50 transition-colors flex items-center justify-center gap-1.5 mb-2"
                >
                  <QrCode size={15} />
                  生成分享海报
                </button>
                <p className="text-[10px] text-surface-400 leading-relaxed">
                  复制链接到微信发送后，会以案例卡片形式展示标题、摘要和封面图。本地 localhost 环境无法预览卡片效果，需部署到正式 HTTPS 域名后生效。
                </p>
              </>
            ) : (
              <div>
                {actionClick ? (
                  <button onClick={actionClick}
                    className="w-full h-10 bg-surface-100 text-surface-600 font-medium rounded-xl text-sm active:bg-surface-200 transition-colors">
                    {actionText}
                  </button>
                ) : (
                  <p className="h-10 bg-surface-50 rounded-xl text-sm text-surface-400 flex items-center justify-center font-medium">
                    {actionText}
                  </p>
                )}
              </div>
            )}
          </div>
          );
        })()}

        {/* Review Note */}
        {task.reviewNote && (
          <div className={`rounded-2xl p-4 ${task.reviewStatus === 'rejected' ? 'bg-red-50 border border-red-100' : task.reviewStatus === 'suspected_dup' ? 'bg-orange-50 border border-orange-100' : 'bg-surface-50'}`}>
            <p className="text-xs font-medium text-surface-500 mb-1">审核备注</p>
            <p className="text-sm text-gray-700">{task.reviewNote}</p>
            {task.dupRefTaskId && (
              <p className="text-xs text-orange-500 mt-1">疑似与案例 #{task.dupRefTaskId.toUpperCase()} 图片相似</p>
            )}
          </div>
        )}
      </div>

      {/* Bottom Actions */}
      {(!isInstaller || task.installImages.length === 0 || task.reviewStatus === 'rejected' || task.reviewStatus === 'suspected_dup' || task.reviewStatus === 'confirmed_dup') && (
      <div className="fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-app bg-white/95 backdrop-blur border-t border-surface-100 z-40 safe-bottom">
        <div className="flex items-center gap-2 px-4 py-3">
          {!isInstaller && (
          <button onClick={() => toggleFavorite(task.id)}
            className={`w-11 h-11 rounded-xl flex items-center justify-center border transition-colors flex-shrink-0 ${
              isFavorited(task.id) ? 'bg-warm-50 border-warm-300' : 'bg-surface-50 border-surface-200'
            }`}>
            <Star size={18} fill={isFavorited(task.id) ? '#f5a932' : 'none'} stroke={isFavorited(task.id) ? '#f5a932' : '#9ca3af'} />
          </button>
          )}
          {!isInstaller && (
            <button onClick={() => handleCopy(generateCustomerShareText(task, shareSalesId))}
              className="flex-1 h-11 bg-navy-50 text-navy-700 font-semibold rounded-xl text-sm active:bg-navy-100 transition-colors flex items-center justify-center gap-1.5">
              <Copy size={15} />
              复制客户分享话术
            </button>
          )}
          {canUploadPhoto && (
            <button onClick={() => navigate(`/delivery/upload/${task.id}`)}
              className="flex-1 h-11 bg-navy-800 text-white font-semibold rounded-xl text-sm active:bg-navy-900 transition-colors flex items-center justify-center gap-1.5">
              <Camera size={15} />
              上传安装照片
            </button>
          )}
          {canOwnerUploadPhoto && (
            <button onClick={() => navigate(`/delivery/upload/${task.id}`)}
              className="flex-1 h-11 bg-navy-800 text-white font-semibold rounded-xl text-sm active:bg-navy-900 transition-colors flex items-center justify-center gap-1.5">
              <Camera size={15} />
              上传案例照片
            </button>
          )}
          {canReuploadCleanPhotos && (
            <button onClick={() => navigate(`/delivery/upload/${task.id}`)}
              className="flex-1 h-11 bg-navy-800 text-white font-semibold rounded-xl text-sm active:bg-navy-900 transition-colors flex items-center justify-center gap-1.5">
              <Camera size={15} />
              重新上传干净照片
            </button>
          )}
          {!isInstaller && canAddStory && (
            <button onClick={() => navigate(`/delivery/story/${task.id}`)}
              className="flex-1 h-11 bg-navy-800 text-white font-semibold rounded-xl text-sm active:bg-navy-900 transition-colors flex items-center justify-center gap-1.5">
              <PenLine size={15} />
              补充成交故事
            </button>
          )}
          {!isInstaller && user?.role === 'admin' && task.reviewStatus === 'pending' && (
            <button onClick={() => navigate('/admin/delivery')}
              className="flex-1 h-11 bg-green-600 text-white font-semibold rounded-xl text-sm active:bg-green-700 transition-colors flex items-center justify-center gap-1.5">
              <CheckCircle2 size={15} />
              去审核
            </button>
          )}
        </div>
      </div>
      )}

      {copyModalText && (
        <CopyModal text={copyModalText} onClose={() => setCopyModalText('')} />
      )}

      {/* Share Poster Modal */}
      {showPosterModal && (
        <SharePosterModal
          task={task}
          shareUrl={getShareUrl(task.id, shareSalesId, {
            storeId: task.storeId,
            channel: 'poster',
            entry: 'delivery_detail',
          })}
          onClose={() => setShowPosterModal(false)}
        />
      )}

      {/* Edit customer requirement modal */}
      {editRequirementModal && (
        <div className="fixed inset-0 z-[70] flex items-end sm:items-center justify-center">
          <div className="absolute inset-0 bg-black/50" onClick={() => setEditRequirementModal(false)} />
          <div className="relative bg-white rounded-t-3xl sm:rounded-2xl w-full sm:max-w-md p-5 animate-fade-up">
            <h3 className="text-base font-bold text-gray-900 mb-3">编辑客户需求</h3>
            <textarea
              value={editRequirementText}
              onChange={(e) => setEditRequirementText(e.target.value)}
              className="w-full h-[120px] px-3 py-2.5 bg-surface-50 border border-surface-200 rounded-xl text-sm resize-none focus:outline-none focus:border-navy-400 transition-colors"
              placeholder="请填写客户需求"
            />
            <div className="flex gap-2.5 mt-4">
              <button
                onClick={() => setEditRequirementModal(false)}
                className="flex-1 h-11 bg-surface-100 text-surface-600 font-medium rounded-xl text-sm active:bg-surface-200 transition-colors"
              >取消</button>
              <button
                onClick={() => {
                  const trimmed = editRequirementText.trim();
                  if (!trimmed) { showToast('请填写客户需求'); return; }
                  updateDeliveryTask(task.id, { customerRequirement: trimmed });
                  setEditRequirementModal(false);
                  showToast('客户需求已更新');
                }}
                className="flex-1 h-11 bg-navy-800 text-white font-medium rounded-xl text-sm active:bg-navy-900 transition-colors"
              >保存</button>
            </div>
          </div>
        </div>
      )}

      {previewImageIndex !== null && task.installImages[previewImageIndex] && (
        <div className="fixed inset-0 z-[80] bg-black flex flex-col">
          <div className="flex items-center justify-between px-4 pt-12 pb-3 text-white/80">
            <button onClick={() => setPreviewImageIndex(null)} className="text-sm flex items-center gap-1">
              <ArrowLeft size={18} />
              返回
            </button>
            <span className="text-sm">第 {previewImageIndex + 1} 张 / 共 {task.installImages.length} 张</span>
            <div className="w-12" />
          </div>
          <div className="flex-1 overflow-y-auto px-3 pb-6">
            <img
              src={task.installImages[previewImageIndex]}
              alt={`大图${previewImageIndex + 1}`}
              className="w-full h-auto rounded-xl"
              style={{ WebkitTouchCallout: 'default', WebkitUserSelect: 'auto', userSelect: 'auto' }}
            />
            <p className="text-white/70 text-xs text-center mt-3">手机上长按图片，选择保存到相册</p>
            {task.installImages.length > 1 && (
              <div className="flex gap-2 mt-4">
                <button
                  onClick={() => setPreviewImageIndex((previewImageIndex - 1 + task.installImages.length) % task.installImages.length)}
                  className="flex-1 h-10 rounded-xl bg-white/10 text-white text-sm active:bg-white/15"
                >
                  上一张
                </button>
                <button
                  onClick={() => setPreviewImageIndex((previewImageIndex + 1) % task.installImages.length)}
                  className="flex-1 h-10 rounded-xl bg-white/10 text-white text-sm active:bg-white/15"
                >
                  下一张
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

// ── Share Poster Modal ──
function SharePosterModal({
  task, shareUrl, onClose,
}: {
  task: NonNullable<ReturnType<typeof getAllDeliveryTasks>[number]>;
  shareUrl: string;
  onClose: () => void;
}) {
  const solution = task.productName || `${task.brand} ${task.model}`;
  const requirement = truncateForPoster(
    task.customerRequirement || '想改善睡眠质量，找一款合适的床垫/枕头',
    50,
  );
  const feedback = truncateForPoster(
    getStoryText(task) || '使用后睡眠质量明显改善，非常满意',
    60,
  );
  const heroImage = task.installImages[0] || '';

  return (
    <div className="fixed inset-0 z-[90] flex items-end sm:items-center justify-center">
      <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={onClose} />
      <div className="relative bg-white rounded-t-3xl sm:rounded-3xl w-full sm:max-w-sm shadow-premium animate-fade-up max-h-[92vh] overflow-y-auto">
        <div className="flex justify-center pt-3 pb-1">
          <div className="w-10 h-1 rounded-full bg-surface-200" />
        </div>

        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 w-8 h-8 bg-surface-100 rounded-full flex items-center justify-center active:bg-surface-200 transition-colors z-10"
        >
          <X size={16} className="text-surface-500" />
        </button>

        <div className="px-5 pb-6">
          <h3 className="text-lg font-bold text-gray-900 mb-1">分享海报</h3>
          <p className="text-xs text-surface-400 mb-4">长按海报图片可保存到相册，发给客户</p>

          {/* Poster Card */}
          <div className="bg-white border border-surface-200 rounded-2xl overflow-hidden shadow-lg">
            {/* Hero Image */}
            <div className="aspect-[4/3] bg-surface-100 relative">
              {heroImage ? (
                <img src={heroImage} alt={solution} className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-surface-300">
                  <Image size={48} strokeWidth={1} />
                </div>
              )}
              {/* Badge */}
              <div className="absolute top-3 left-3 bg-navy-900/80 backdrop-blur rounded-full px-3 py-1 text-white text-[10px] font-medium">
                真实交付案例
              </div>
            </div>

            {/* Content */}
            <div className="p-4 space-y-3">
              <h4 className="text-base font-bold text-gray-900">{solution}</h4>

              <div className="space-y-2">
                <div className="flex items-start gap-2">
                  <span className="text-xs text-surface-400 flex-shrink-0 mt-0.5">需求</span>
                  <p className="text-sm text-gray-700 leading-relaxed">{requirement}</p>
                </div>
                <div className="flex items-start gap-2">
                  <span className="text-xs text-surface-400 flex-shrink-0 mt-0.5">反馈</span>
                  <p className="text-sm text-gray-700 leading-relaxed">{feedback}</p>
                </div>
              </div>

              {/* Trust badge */}
              <div className="flex items-center gap-1.5 text-[10px] text-green-600">
                <CheckCircle2 size={12} />
                隐私已处理的真实交付案例
              </div>
            </div>

            {/* QR Code Section */}
            <div className="border-t border-surface-100 p-4 flex items-center gap-4">
              <div className="flex-shrink-0 w-[88px] h-[88px] bg-white border border-surface-200 rounded-xl p-1.5 flex items-center justify-center">
                <QRCodeSVG value={shareUrl} size={72} level="M" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs font-semibold text-gray-700 mb-1">扫码查看详情</p>
                <p className="text-[11px] text-surface-400 leading-relaxed">长按识别二维码，查看真实案例详情并预约体验</p>
              </div>
            </div>
          </div>

          {/* Hint */}
          <p className="text-[10px] text-surface-400 text-center mt-3 leading-relaxed">
            截图或长按海报保存到相册，分享给客户
          </p>
        </div>
      </div>
    </div>
  );
}

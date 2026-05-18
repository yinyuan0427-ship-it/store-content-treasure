import { useNavigate } from 'react-router-dom';
import { useAuth, useToast } from '../App';
import { mockMaterials, mockDeliveryTasks, getAllDeliveryTasks, getAllPointRecords, getTodayPostingStatus, markTodayPosting, getMonthlyPostingDays, getConsecutiveDays, getDailyMaterial, POINTS_RULES, getShareableCases, getTodayXhsStatus, markTodayXhs, getMonthlyXhsDays, getXhsWeeklyCount, getDailyXhsMaterial, getDailyMomentsMaterial, ensureStarterCaseCoins, getApprovedDealReports, getAllDealReports, mockLeads, mockSalesPersons, canShareCase, getLeadsForStore, getInstallerByUserId, getSalesByUserId } from '../mock/data';
import { useMemo, useState, useEffect } from 'react';
import {
  Camera, CheckCircle2, Upload, Sparkles, Copy, ChevronRight,
  Trophy, Star, Clock, Flame, RefreshCw, AlertCircle, ArrowRight,
  Store, Shield, MessageCircle, TrendingUp, Send, Mail, Users, Image
} from 'lucide-react';
import { copyText } from '../utils/clipboard';
import CopyModal from '../components/CopyModal';

export default function Home() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { showToast } = useToast();
  const [copyModalText, setCopyModalText] = useState('');

  const today = new Date();
  const weekDays = ['日', '一', '二', '三', '四', '五', '六'];
  const dateStr = `${today.getMonth() + 1}月${today.getDate()}日 周${weekDays[today.getDay()]}`;
  const monthStr = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}`;

  // ── 朋友圈 posting state ──
  const [postingStatus, setPostingStatus] = useState<'idle' | 'copied' | 'done'>(
    () => getTodayPostingStatus(user?.phone || '')
  );
  const [momentsMaterial, setMomentsMaterial] = useState(
    () => getDailyMomentsMaterial(user?.phone || '')
  );
  const monthlyDays = getMonthlyPostingDays(user?.phone || '');
  const consecutiveDays = getConsecutiveDays(user?.phone || '');

  // ── 小红书 posting state ──
  const [xhsStatus, setXhsStatus] = useState<'idle' | 'copied' | 'done'>(
    () => getTodayXhsStatus(user?.phone || '')
  );
  const [xhsMaterial, setXhsMaterial] = useState(
    () => getDailyXhsMaterial(user?.phone || '')
  );
  const monthlyXhsDays = getMonthlyXhsDays(user?.phone || '');
  const weeklyXhsCount = getXhsWeeklyCount(user?.phone || '');

  const handleCopyPosting = async () => {
    const result = await copyText(momentsMaterial.content);
    if (result.success) {
      markTodayPosting(user!.phone, 'copied');
      setPostingStatus('copied');
      showToast('朋友圈文案已复制，请打开微信发布');
    } else {
      setCopyModalText(momentsMaterial.content);
    }
  };

  const handleConfirmPosting = () => {
    markTodayPosting(user!.phone, 'done');
    setPostingStatus('done');
    const xhsDone = getTodayXhsStatus(user!.phone) === 'done';
    const bonus = xhsDone ? POINTS_RULES.dual_platform_bonus : 0;
    showToast(`太棒了！+${POINTS_RULES.daily_posting} 积分${bonus ? `，双平台额外 +${bonus}` : ''}`);
  };

  const handleSwapMoments = () => {
    const pool = mockMaterials.filter(m => m.platforms.includes('微信朋友圈'));
    const currentIdx = pool.findIndex(m => m.id === momentsMaterial.id);
    const nextIdx = (currentIdx + 1) % pool.length;
    setMomentsMaterial(pool[nextIdx]);
  };

  // ── 小红书 handlers ──
  const handleCopyXhs = async () => {
    const text = xhsMaterial.xhsContent || xhsMaterial.content;
    const result = await copyText(text);
    if (result.success) {
      markTodayXhs(user!.phone, 'copied');
      setXhsStatus('copied');
      showToast('小红书文案已复制，请打开小红书发布');
    } else {
      setCopyModalText(text);
    }
  };

  const handleConfirmXhs = () => {
    markTodayXhs(user!.phone, 'done');
    setXhsStatus('done');
    const momentsDone = postingStatus === 'done' || getTodayPostingStatus(user!.phone) === 'done';
    const bonus = momentsDone ? POINTS_RULES.dual_platform_bonus : 0;
    showToast(`太棒了！+${POINTS_RULES.xhs_posting} 积分${bonus ? `，双平台额外 +${bonus}` : ''}`);
  };

  const handleSwapXhs = () => {
    const pool = mockMaterials.filter(m => m.platforms.includes('小红书'));
    const currentIdx = pool.findIndex(m => m.id === xhsMaterial.id);
    const nextIdx = (currentIdx + 1) % pool.length;
    setXhsMaterial(pool[nextIdx]);
  };

  // ── 分享案例 handlers ──
  const handleCopyCaseLink = async () => {
    if (!shareCase) return;
    const salesId = shareCase.salesId || '';
    const link = `${window.location.origin}/share/${shareCase.id}?salesId=${salesId}`;
    const result = await copyText(link);
    if (result.success) {
      showToast('案例链接已复制，可以发给意向客户');
    } else {
      setCopyModalText(link);
    }
  };

  const generateSendScript = () => {
    if (!shareCase) return '';
    const product = shareCase.productName || `${shareCase.brand} ${shareCase.model}`;
    return `这个是我们${shareCase.city}客户${shareCase.scene}的真实案例，用的是 ${product}，你可以先看看，和你家的情况有点像。如果你也想了解同款，我可以帮你约到店体验。`;
  };

  const handleCopyScript = async () => {
    const script = generateSendScript();
    if (!script) return;
    const result = await copyText(script);
    if (result.success) {
      showToast('发送话术已复制，可以和案例链接一起发给客户');
    } else {
      setCopyModalText(script);
    }
  };

  const handlePreviewCase = () => {
    if (!shareCase) return;
    const salesId = shareCase.salesId || '';
    navigate(`/share/${shareCase.id}?salesId=${salesId}`);
  };

  const handleSwitchCase = () => {
    if (shareableCases.length <= 1) return;
    setShareCaseIdx((prev) => (prev + 1) % shareableCases.length);
  };

  // ── Task data ──
  const taskData = useMemo(() => {
    if (!user) return null;
    const uid = user.phone;
    const allPts = getAllPointRecords(uid);
    const totalPts = allPts.reduce((s, r) => s + r.points, 0);
    const monthPts = allPts.filter(r => r.createdAt.startsWith(monthStr)).reduce((s, r) => s + r.points, 0);

    const allTasks = getAllDeliveryTasks();
    let myTasks: typeof mockDeliveryTasks = [];
    let pendingUpload = 0;
    let pendingStory = 0;
    let pendingReview = 0;
    let rejectedCount = 0;

    switch (user.role) {
      case 'installer': {
        const installerId = getInstallerByUserId(user.phone)?.id || '';
        myTasks = allTasks.filter(t => t.installerId === installerId);
        pendingUpload = myTasks.filter(t => t.installImages.length === 0).length;
        break;
      }
      case 'sales': {
        const salesId = getSalesByUserId(user.phone)?.id || '';
        myTasks = allTasks.filter(t => t.salesId === salesId);
        pendingStory = myTasks.filter(t => t.installImages.length > 0 && !t.storyWhy && t.reviewStatus !== 'rejected').length;
        pendingReview = myTasks.filter(t => t.reviewStatus === 'pending' || t.reviewStatus === 'story_done').length;
        rejectedCount = myTasks.filter(t => t.reviewStatus === 'rejected').length;
        break;
      }
      case 'dealer_owner': {
        myTasks = allTasks.filter(t => t.storeId === user.storeId);
        pendingStory = myTasks.filter(t => t.installImages.length > 0 && !t.storyWhy && t.reviewStatus !== 'rejected').length;
        pendingReview = myTasks.filter(t => t.reviewStatus === 'pending' || t.reviewStatus === 'story_done').length;
        rejectedCount = myTasks.filter(t => t.reviewStatus === 'rejected').length;
        break;
      }
      case 'admin': {
        myTasks = allTasks;
        pendingReview = myTasks.filter(t => t.reviewStatus === 'pending' || t.reviewStatus === 'story_done').length;
        break;
      }
    }

    const monthCases = myTasks.filter(t => t.createdAt.startsWith(monthStr)).length;
    const approvedCases = myTasks.filter(t => t.reviewStatus === 'approved' || t.reviewStatus === 'featured').length;

    return { myTasks, totalPts, monthPts, pendingUpload, pendingStory, pendingReview, rejectedCount, monthCases, approvedCases };
  }, [user, monthStr]);

  const {
    myTasks, totalPts, monthPts, pendingUpload, pendingStory, pendingReview, rejectedCount, monthCases, approvedCases
  } = taskData || {
    myTasks: [] as typeof mockDeliveryTasks,
    totalPts: 0,
    monthPts: 0,
    pendingUpload: 0,
    pendingStory: 0,
    pendingReview: 0,
    rejectedCount: 0,
    monthCases: 0,
    approvedCases: 0,
  };

  const handleCopyText = async (text: string) => {
    const result = await copyText(text);
    if (result.success) {
      showToast('已复制，可直接粘贴发布');
    } else {
      setCopyModalText(text);
    }
  };

  const recommendedMaterials = mockMaterials.filter(m => m.isRecommended && m.id !== momentsMaterial.id && m.id !== xhsMaterial.id).slice(0, 2);
  const shareableCases = useMemo(() => getShareableCases(), []);
  const [shareCaseIdx, setShareCaseIdx] = useState(0);
  const shareCase = shareableCases.length > 0 ? shareableCases[shareCaseIdx % shareableCases.length] : null;

  // ── Admin stats ──
  const adminStats = useMemo(() => {
    if (user?.role !== 'admin') return null;
    const allTasks = getAllDeliveryTasks();
    const pendingCases = allTasks.filter(t => t.reviewStatus === 'pending' || t.reviewStatus === 'story_done').length;
    const suspectedDup = allTasks.filter(t => t.reviewStatus === 'suspected_dup').length;
    const pendingDeals = getAllDealReports().filter(d => d.status === 'pending').length;
    const todayStr = today.toISOString().slice(0, 10);
    const storedLeads = (() => {
      try {
        const raw = localStorage.getItem('sct-share-leads');
        if (!raw) return [];
        return JSON.parse(raw);
      } catch { return []; }
    })();
    const allLeads = [
      ...mockLeads,
      ...storedLeads.map((item: any) => ({ status: '待联系' as const, createdAt: item.createdAt || '' })),
    ];
    const todayLeads = allLeads.filter(l => l.createdAt.startsWith(todayStr)).length;
    const pendingLeads = allLeads.filter(l => l.status === '待联系').length;
    const priorityCases = allTasks
      .filter(t => t.reviewStatus === 'pending' || t.reviewStatus === 'story_done' || t.reviewStatus === 'suspected_dup')
      .sort((a, b) => (b.reviewStatus === 'suspected_dup' ? 1 : 0) - (a.reviewStatus === 'suspected_dup' ? 1 : 0))
      .slice(0, 3);
    return { pendingCases, suspectedDup, pendingDeals, todayLeads, pendingLeads, priorityCases };
  }, [user?.role]);

  // ── Dealer Owner stats ──
  const dealerStats = useMemo(() => {
    if (user?.role !== 'dealer_owner') return null;
    const storeTasks = getAllDeliveryTasks().filter(t => t.storeId === user.storeId);
    const pendingStory = storeTasks.filter(t => t.installImages.length > 0 && !t.storyWhy && t.reviewStatus !== 'rejected').length;
    const pendingReview = storeTasks.filter(t => t.reviewStatus === 'pending' || t.reviewStatus === 'story_done').length;
    const shareable = storeTasks.filter(t => canShareCase(t)).length;
    const rejected = storeTasks.filter(t => t.reviewStatus === 'rejected').length;
    const approvedDeals = getApprovedDealReports().filter(d => d.storeId === user.storeId && d.createdAt.startsWith(monthStr)).length;
    const pendingLeads = mockLeads.filter(l => l.sourceStoreId === user.storeId && l.status === '待联系').length + getLeadsForStore(user.storeId).length;
    const storeSales = mockSalesPersons.filter(s => s.storeId === user.storeId);
    const salesCompletion = storeSales.map(s => {
      const salesTasks = storeTasks.filter(t => t.salesId === s.id);
      return {
        name: s.name,
        total: salesTasks.length,
        pendingStory: salesTasks.filter(t => t.installImages.length > 0 && !t.storyWhy && t.reviewStatus !== 'rejected').length,
        approved: salesTasks.filter(t => t.reviewStatus === 'approved' || t.reviewStatus === 'featured').length,
      };
    });
    return { storeTasks, pendingStory, pendingReview, shareable, rejected, approvedDeals, pendingLeads, storeSales, salesCompletion, totalTasks: storeTasks.length };
  }, [user?.role, user?.storeId, monthStr]);

  // ── Deal Reports ──
  const approvedDeals = useMemo(() => getApprovedDealReports().slice(0, 2), []);
  const [dealCopyText, setDealCopyText] = useState('');

  const getDealReportScript = (deal: typeof approvedDeals[0]) => {
    return `🎉🎉🎉成交喜报🎉🎉🎉\n城市：${deal.city}\n门店/人员：${deal.storeName} · ${deal.salesName}\n整单金额：${deal.amount}元\n销售产品：${deal.productName} ${deal.productModel}\n\n客户来源：\n${deal.customerSource}\n\n成交过程：\n${deal.story}\n\n成交总结：\n${deal.summary}`;
  };

  const handleCopyDealReport = async (deal: typeof approvedDeals[0]) => {
    const script = getDealReportScript(deal);
    const result = await copyText(script);
    if (result.success) {
      showToast('成交喜报文案已复制，可发到微信群里');
    } else {
      setDealCopyText(script);
    }
  };

  useEffect(() => {
    if (user?.phone) ensureStarterCaseCoins(user.phone);
  }, [user?.phone]);

  const platformColors: Record<string, string> = {
    '微信朋友圈': 'bg-green-50 text-green-600 border border-green-100',
    '小红书': 'bg-red-50 text-red-500 border border-red-100',
    '抖音': 'bg-gray-800 text-white',
    '视频号': 'bg-orange-50 text-orange-600 border border-orange-100',
    '线下销售': 'bg-blue-50 text-blue-600 border border-blue-100',
    '门店展示': 'bg-purple-50 text-purple-600 border border-purple-100',
  };

  const pendingTasks = myTasks.filter(
    t => t.reviewStatus !== 'approved' && t.reviewStatus !== 'featured' && t.reviewStatus !== 'rejected'
  );

  if (!taskData || !user) return null;

  return (
    <div className="min-h-screen bg-surface-50 pb-6">
      {/* ── Header ── */}
      <div className="hero-gradient soft-glow relative overflow-hidden px-5 pt-12 pb-5">
        <div className="absolute top-0 right-0 w-48 h-48 bg-blue-400/8 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-32 h-32 bg-amber-400/6 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10">
          <div className="flex items-center justify-between mb-3">
            <div>
              <h1 className="text-white text-lg font-semibold">{user.role === 'admin' ? '总部工作台' : user.role === 'dealer_owner' ? '门店经营工作台' : `你好，${user.name}`}</h1>
              <p className="text-blue-200/70 text-xs mt-0.5">{user.role === 'admin' ? `品牌总部 · ${dateStr}` : user.role === 'dealer_owner' ? `${user.storeName} · 店长视角 · ${dateStr}` : `${user.storeName} · ${dateStr}`}</p>
            </div>
            <button onClick={() => navigate('/profile')}
              className="w-10 h-10 bg-white/15 backdrop-blur rounded-full flex items-center justify-center text-white font-semibold text-sm active:scale-95 transition-transform border border-white/10">
              {user.name[0]}
            </button>
          </div>

          {/* Stats row */}
          {user.role === 'admin' && adminStats ? (
            <div className="flex items-center gap-2 flex-wrap">
              <div className="flex items-center gap-1 bg-white/10 backdrop-blur rounded-full px-2.5 py-1 border border-white/5">
                <span className="text-white/60 text-[11px]">待审核</span>
                <span className="text-white text-[11px] font-semibold">{adminStats.pendingCases}</span>
              </div>
              <div className="flex items-center gap-1 bg-white/10 backdrop-blur rounded-full px-2.5 py-1 border border-white/5">
                <span className="text-white/60 text-[11px]">疑似重复</span>
                <span className="text-orange-300 text-[11px] font-semibold">{adminStats.suspectedDup}</span>
              </div>
              <div className="flex items-center gap-1 bg-white/10 backdrop-blur rounded-full px-2.5 py-1 border border-white/5">
                <span className="text-white/60 text-[11px]">待审喜报</span>
                <span className="text-white text-[11px] font-semibold">{adminStats.pendingDeals}</span>
              </div>
              <div className="flex items-center gap-1 bg-white/10 backdrop-blur rounded-full px-2.5 py-1 border border-white/5">
                <span className="text-white/60 text-[11px]">待联系线索</span>
                <span className="text-red-300 text-[11px] font-semibold">{adminStats.pendingLeads}</span>
              </div>
            </div>
          ) : user.role === 'dealer_owner' && dealerStats ? (
            <div className="flex items-center gap-2 flex-wrap">
              <div className="flex items-center gap-1 bg-white/10 backdrop-blur rounded-full px-2.5 py-1 border border-white/5">
                <span className="text-white/60 text-[11px]">本店案例</span>
                <span className="text-white text-[11px] font-semibold">{dealerStats.totalTasks}</span>
              </div>
              <div className="flex items-center gap-1 bg-white/10 backdrop-blur rounded-full px-2.5 py-1 border border-white/5">
                <span className="text-white/60 text-[11px]">可分享</span>
                <span className="text-green-300 text-[11px] font-semibold">{dealerStats.shareable}</span>
              </div>
              <div className="flex items-center gap-1 bg-white/10 backdrop-blur rounded-full px-2.5 py-1 border border-white/5">
                <span className="text-white/60 text-[11px]">本月喜报</span>
                <span className="text-amber-300 text-[11px] font-semibold">{dealerStats.approvedDeals}</span>
              </div>
              <div className="flex items-center gap-1 bg-white/10 backdrop-blur rounded-full px-2.5 py-1 border border-white/5">
                <span className="text-white/60 text-[11px]">待联系线索</span>
                <span className="text-red-300 text-[11px] font-semibold">{dealerStats.pendingLeads}</span>
              </div>
            </div>
          ) : (
            <div className="flex items-center gap-2 flex-wrap">
              <div className="flex items-center gap-1 bg-white/10 backdrop-blur rounded-full px-2.5 py-1 border border-white/5">
                <Star size={11} className="text-warm-400" fill="#f5a932" />
                <span className="text-white/80 text-[11px]">{totalPts} 积分</span>
              </div>
              <div className="flex items-center gap-1 bg-white/10 backdrop-blur rounded-full px-2.5 py-1 border border-white/5">
                <span className="text-white/60 text-[11px]">本月发圈</span>
                <span className="text-white text-[11px] font-semibold">{monthlyDays}/30</span>
              </div>
              {monthlyXhsDays > 0 && (
                <div className="flex items-center gap-1 bg-white/10 backdrop-blur rounded-full px-2.5 py-1 border border-white/5">
                  <span className="text-white/60 text-[11px]">小红书本月</span>
                  <span className="text-white text-[11px] font-semibold">{monthlyXhsDays}篇</span>
                </div>
              )}
              <div className="flex items-center gap-1 bg-white/10 backdrop-blur rounded-full px-2.5 py-1 border border-white/5">
                <span className="text-white/60 text-[11px]">本月案例</span>
                <span className="text-white text-[11px] font-semibold">{monthCases}</span>
              </div>
              {consecutiveDays > 0 && (
                <div className="flex items-center gap-1 bg-white/10 backdrop-blur rounded-full px-2.5 py-1 border border-white/5">
                  <Flame size={11} className="text-orange-400" />
                  <span className="text-white/80 text-[11px]">连续{consecutiveDays}天</span>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* ═══════════════════════════════════ */}
      {/* ── 今日建议完成 ── */}
      {/* ═══════════════════════════════════ */}
      <div className="px-4 -mt-3 relative z-10">
        <div className="bg-white rounded-2xl shadow-card border border-surface-100 px-4 py-4">
          <h2 className="text-[15px] font-bold text-gray-900 mb-3">今日建议完成</h2>
          <div className="space-y-2.5">
            {user.role === 'installer' ? (
              <>
                <div className="flex items-start gap-3">
                  <span className="w-5 h-5 rounded-full bg-navy-800 text-white text-[10px] font-bold flex items-center justify-center flex-shrink-0 mt-0.5">1</span>
                  <div>
                    <p className="text-sm font-medium text-gray-800">查看待安装任务</p>
                    <p className="text-xs text-surface-400">确认今天的上门安装安排</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <span className="w-5 h-5 rounded-full bg-navy-800 text-white text-[10px] font-bold flex items-center justify-center flex-shrink-0 mt-0.5">2</span>
                  <div>
                    <p className="text-sm font-medium text-gray-800">拍照上传安装照片</p>
                    <p className="text-xs text-surface-400">安装完成后及时拍照提交</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <span className="w-5 h-5 rounded-full bg-navy-800 text-white text-[10px] font-bold flex items-center justify-center flex-shrink-0 mt-0.5">3</span>
                  <div>
                    <p className="text-sm font-medium text-gray-800">确认安装完成</p>
                    <p className="text-xs text-surface-400">选择安装状态，完成本次任务</p>
                  </div>
                </div>
              </>
            ) : user.role === 'admin' ? (
              <>
                <div className="flex items-start gap-3">
                  <span className="w-5 h-5 rounded-full bg-navy-800 text-white text-[10px] font-bold flex items-center justify-center flex-shrink-0 mt-0.5">1</span>
                  <div>
                    <p className="text-sm font-medium text-gray-800">审核待处理的案例</p>
                    <p className="text-xs text-surface-400">审核安装照片和成交故事</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <span className="w-5 h-5 rounded-full bg-navy-800 text-white text-[10px] font-bold flex items-center justify-center flex-shrink-0 mt-0.5">2</span>
                  <div>
                    <p className="text-sm font-medium text-gray-800">审核成交喜报</p>
                    <p className="text-xs text-surface-400">审核销售提交的成交战报</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <span className="w-5 h-5 rounded-full bg-navy-800 text-white text-[10px] font-bold flex items-center justify-center flex-shrink-0 mt-0.5">3</span>
                  <div>
                    <p className="text-sm font-medium text-gray-800">精选优质案例</p>
                    <p className="text-xs text-surface-400">将好案例标记为精选，激励全员</p>
                  </div>
                </div>
              </>
            ) : user.role === 'dealer_owner' ? (
              <>
                <div className="flex items-start gap-3">
                  <span className="w-5 h-5 rounded-full bg-navy-800 text-white text-[10px] font-bold flex items-center justify-center flex-shrink-0 mt-0.5">1</span>
                  <div>
                    <p className="text-sm font-medium text-gray-800">检查本店待补故事</p>
                    <p className="text-xs text-surface-400">督促导购补充成交故事，提升案例质量</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <span className="w-5 h-5 rounded-full bg-navy-800 text-white text-[10px] font-bold flex items-center justify-center flex-shrink-0 mt-0.5">2</span>
                  <div>
                    <p className="text-sm font-medium text-gray-800">提醒导购完成内容任务</p>
                    <p className="text-xs text-surface-400">确保门店朋友圈、小红书内容按时发布</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <span className="w-5 h-5 rounded-full bg-navy-800 text-white text-[10px] font-bold flex items-center justify-center flex-shrink-0 mt-0.5">3</span>
                  <div>
                    <p className="text-sm font-medium text-gray-800">分享门店案例给意向客户</p>
                    <p className="text-xs text-surface-400">用真实交付案例加速客户成交决策</p>
                  </div>
                </div>
              </>
            ) : (
              <>
                <div className="flex items-start gap-3">
                  <span className="w-5 h-5 rounded-full bg-navy-800 text-white text-[10px] font-bold flex items-center justify-center flex-shrink-0 mt-0.5">1</span>
                  <div>
                    <p className="text-sm font-medium text-gray-800">发布一条朋友圈</p>
                    <p className="text-xs text-surface-400">复制文案发到微信，每日必做 +{POINTS_RULES.daily_posting}积分</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <span className="w-5 h-5 rounded-full bg-navy-800 text-white text-[10px] font-bold flex items-center justify-center flex-shrink-0 mt-0.5">2</span>
                  <div>
                    <p className="text-sm font-medium text-gray-800">分享案例给意向客户</p>
                    <p className="text-xs text-surface-400">把真实交付案例发给客户，加速成交</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <span className="w-5 h-5 rounded-full bg-navy-800 text-white text-[10px] font-bold flex items-center justify-center flex-shrink-0 mt-0.5">3</span>
                  <div>
                    <p className="text-sm font-medium text-gray-800">上传今日交付案例</p>
                    <p className="text-xs text-surface-400">有成交就上传，审核通过 +20 积分</p>
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
      </div>

      {user.role === 'admin' && adminStats ? (<>
        {/* ── Admin Stats Overview ── */}
        <div className="px-4 -mt-3 relative z-10">
          <div className="bg-white rounded-2xl shadow-card border border-surface-100 px-4 py-4">
            <h2 className="text-[15px] font-bold text-gray-900 mb-3">审核概览</h2>
            <div className="grid grid-cols-3 gap-2">
              <div className="bg-blue-50 rounded-xl p-2.5 text-center">
                <div className="text-lg font-bold text-blue-700">{adminStats.pendingCases}</div>
                <div className="text-[10px] text-blue-600 mt-0.5">待审核案例</div>
              </div>
              <div className="bg-orange-50 rounded-xl p-2.5 text-center">
                <div className="text-lg font-bold text-orange-600">{adminStats.suspectedDup}</div>
                <div className="text-[10px] text-orange-500 mt-0.5">疑似重复</div>
              </div>
              <div className="bg-amber-50 rounded-xl p-2.5 text-center">
                <div className="text-lg font-bold text-amber-600">{adminStats.pendingDeals}</div>
                <div className="text-[10px] text-amber-500 mt-0.5">待审喜报</div>
              </div>
              <div className="bg-green-50 rounded-xl p-2.5 text-center">
                <div className="text-lg font-bold text-green-600">{adminStats.todayLeads}</div>
                <div className="text-[10px] text-green-500 mt-0.5">今日新增线索</div>
              </div>
              <div className="bg-red-50 rounded-xl p-2.5 text-center">
                <div className="text-lg font-bold text-red-500">{adminStats.pendingLeads}</div>
                <div className="text-[10px] text-red-400 mt-0.5">待联系线索</div>
              </div>
            </div>
          </div>
        </div>

        {/* ── Quick Actions ── */}
        <div className="px-4 mt-3">
          <div className="grid grid-cols-4 gap-2">
            <button onClick={() => navigate('/admin/delivery')}
              className="bg-navy-800 text-white rounded-xl p-3 text-center active:bg-navy-900 transition-colors shadow-sm">
              <CheckCircle2 size={20} className="mx-auto mb-1" />
              <span className="text-xs font-semibold">去审核案例</span>
            </button>
            <button onClick={() => navigate('/admin/delivery?tab=deal')}
              className="bg-amber-500 text-white rounded-xl p-3 text-center active:bg-amber-600 transition-colors shadow-sm">
              <TrendingUp size={20} className="mx-auto mb-1" />
              <span className="text-xs font-semibold">审核成交喜报</span>
            </button>
            <button onClick={() => navigate('/admin/leads')}
              className="bg-green-600 text-white rounded-xl p-3 text-center active:bg-green-700 transition-colors shadow-sm">
              <Mail size={20} className="mx-auto mb-1" />
              <span className="text-xs font-semibold">查看客户线索</span>
            </button>
            <button onClick={() => navigate('/admin/products')}
              className="bg-purple-600 text-white rounded-xl p-3 text-center active:bg-purple-700 transition-colors shadow-sm">
              <Image size={20} className="mx-auto mb-1" />
              <span className="text-xs font-semibold">产品资料管理</span>
            </button>
          </div>
        </div>

        {/* ── Priority Review List ── */}
        {adminStats.priorityCases.length > 0 && (
          <div className="px-4 mt-4">
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-sm font-semibold text-gray-900">优先审核</h2>
              <button onClick={() => navigate('/admin/delivery')} className="text-xs text-navy-700 font-medium flex items-center gap-1">
                全部 <ChevronRight size={14} />
              </button>
            </div>
            <div className="space-y-2">
              {adminStats.priorityCases.map((task) => {
                const isDup = task.reviewStatus === 'suspected_dup';
                return (
                  <button
                    key={task.id}
                    onClick={() => navigate(`/delivery/detail/${task.id}`)}
                    className="w-full bg-white rounded-xl p-3 shadow-card active:bg-surface-50 transition-colors text-left flex items-center justify-between"
                  >
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2 mb-0.5">
                        <p className="text-sm font-semibold text-gray-900 truncate">{task.customerAlias} · {task.model}</p>
                        {isDup ? (
                          <span className="text-[10px] px-1.5 py-0.5 rounded bg-orange-50 text-orange-600 flex-shrink-0">疑似重复</span>
                        ) : (
                          <span className="text-[10px] px-1.5 py-0.5 rounded bg-blue-50 text-blue-600 flex-shrink-0">待审核</span>
                        )}
                      </div>
                      <p className="text-xs text-surface-400">{task.storeName} · {task.city} · {task.salesName}</p>
                    </div>
                    <span className="text-xs text-navy-700 font-medium flex items-center gap-0.5 flex-shrink-0 ml-2">
                      去审核 <ChevronRight size={12} />
                    </span>
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* ── Upload CTA for admin ── */}
        <div className="px-4 mt-4">
          <div className="bg-white rounded-2xl shadow-card p-4 border border-surface-100">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-9 h-9 rounded-xl bg-navy-50 flex items-center justify-center">
                <CheckCircle2 size={20} className="text-navy-700" />
              </div>
              <div className="flex-1">
                <h2 className="text-sm font-semibold text-gray-900">审核交付案例和成交喜报</h2>
                <p className="text-xs text-surface-400 mt-0.5">审核安装照片、成交故事和成交喜报，发放奖励</p>
              </div>
            </div>
            {(adminStats.pendingCases > 0 || adminStats.pendingDeals > 0) && (
              <div className="flex gap-2 mb-3 flex-wrap">
                {adminStats.pendingCases > 0 && (
                  <span className="text-[11px] px-2.5 py-1 rounded-full bg-blue-50 text-blue-700 font-medium">
                    待审核案例 {adminStats.pendingCases}
                  </span>
                )}
                {adminStats.suspectedDup > 0 && (
                  <span className="text-[11px] px-2.5 py-1 rounded-full bg-orange-50 text-orange-700 font-medium">
                    疑似重复 {adminStats.suspectedDup}
                  </span>
                )}
                {adminStats.pendingDeals > 0 && (
                  <span className="text-[11px] px-2.5 py-1 rounded-full bg-amber-50 text-amber-700 font-medium">
                    待审喜报 {adminStats.pendingDeals}
                  </span>
                )}
              </div>
            )}
            <button
              onClick={() => navigate('/admin/delivery')}
              className="w-full h-11 bg-navy-800 text-white font-semibold rounded-xl text-sm active:bg-navy-900 transition-colors flex items-center justify-center gap-2 shadow-sm"
            >
              <CheckCircle2 size={16} />
              去审核案例
            </button>
            <button
              onClick={() => navigate('/cases-hub')}
              className="w-full mt-2 h-9 text-surface-500 text-xs font-medium rounded-xl active:bg-surface-50 transition-colors flex items-center justify-center gap-1"
            >
              查看全部案例 ({getAllDeliveryTasks().length}) <ChevronRight size={14} />
            </button>
          </div>
        </div>
      </>) : user.role === 'dealer_owner' && dealerStats ? (<>
        {/* ── Store Overview Stats ── */}
        <div className="px-4 -mt-3 relative z-10">
          <div className="bg-white rounded-2xl shadow-card border border-surface-100 px-4 py-4">
            <h2 className="text-[15px] font-bold text-gray-900 mb-3">门店经营概览</h2>
            <div className="grid grid-cols-3 gap-2">
              <div className="bg-warm-50 rounded-xl p-2.5 text-center">
                <div className="text-lg font-bold text-warm-600">{dealerStats.pendingStory}</div>
                <div className="text-[10px] text-warm-500 mt-0.5">待补故事</div>
              </div>
              <div className="bg-blue-50 rounded-xl p-2.5 text-center">
                <div className="text-lg font-bold text-blue-700">{dealerStats.pendingReview}</div>
                <div className="text-[10px] text-blue-600 mt-0.5">待审核案例</div>
              </div>
              <div className="bg-green-50 rounded-xl p-2.5 text-center">
                <div className="text-lg font-bold text-green-600">{dealerStats.shareable}</div>
                <div className="text-[10px] text-green-500 mt-0.5">可分享案例</div>
              </div>
              <div className="bg-amber-50 rounded-xl p-2.5 text-center">
                <div className="text-lg font-bold text-amber-600">{dealerStats.approvedDeals}</div>
                <div className="text-[10px] text-amber-500 mt-0.5">本月成交喜报</div>
              </div>
              <div className="bg-red-50 rounded-xl p-2.5 text-center">
                <div className="text-lg font-bold text-red-500">{dealerStats.pendingLeads}</div>
                <div className="text-[10px] text-red-400 mt-0.5">待跟进线索</div>
              </div>
              <div className="bg-indigo-50 rounded-xl p-2.5 text-center">
                <div className="text-lg font-bold text-indigo-600">{dealerStats.storeSales.length}</div>
                <div className="text-[10px] text-indigo-500 mt-0.5">本店导购</div>
              </div>
            </div>
          </div>
        </div>

        {/* ── Quick Actions ── */}
        <div className="px-4 mt-3">
          <div className="grid grid-cols-4 gap-2">
            <button onClick={() => navigate('/cases-hub')}
              className="bg-navy-800 text-white rounded-xl p-2.5 text-center active:bg-navy-900 transition-colors shadow-sm">
              <Store size={18} className="mx-auto mb-0.5" />
              <span className="text-[10px] font-semibold">本店案例</span>
            </button>
            <button onClick={() => navigate('/delivery/create')}
              className="bg-green-600 text-white rounded-xl p-2.5 text-center active:bg-green-700 transition-colors shadow-sm">
              <Upload size={18} className="mx-auto mb-0.5" />
              <span className="text-[10px] font-semibold">创建采集</span>
            </button>
            <button onClick={() => navigate('/cases-hub?tab=shareable')}
              className="bg-amber-500 text-white rounded-xl p-2.5 text-center active:bg-amber-600 transition-colors shadow-sm">
              <Send size={18} className="mx-auto mb-0.5" />
              <span className="text-[10px] font-semibold">可分享案例</span>
            </button>
            <button onClick={() => navigate('/profile')}
              className="bg-indigo-600 text-white rounded-xl p-2.5 text-center active:bg-indigo-700 transition-colors shadow-sm">
              <Users size={18} className="mx-auto mb-0.5" />
              <span className="text-[10px] font-semibold">导购完成</span>
            </button>
          </div>
        </div>

        {/* ── Sales Completion ── */}
        {dealerStats.salesCompletion.length > 0 && (
          <div className="px-4 mt-3">
            <div className="bg-white rounded-2xl shadow-card p-4 border border-surface-100">
              <div className="flex items-center gap-2 mb-3">
                <Users size={16} className="text-indigo-500" />
                <h2 className="text-sm font-semibold text-gray-900">导购任务完成情况</h2>
              </div>
              <div className="space-y-2">
                {dealerStats.salesCompletion.map((s) => (
                  <div key={s.name} className="flex items-center justify-between bg-surface-50 rounded-xl px-3 py-2.5">
                    <span className="text-sm font-medium text-gray-700">{s.name}</span>
                    <div className="flex items-center gap-2 text-[10px]">
                      <span className="text-surface-400">{s.total}个案例</span>
                      {s.pendingStory > 0 && (
                        <span className="text-warm-600 font-medium bg-warm-50 px-1.5 py-0.5 rounded">{s.pendingStory}待补</span>
                      )}
                      <span className="text-green-600 font-medium">{s.approved}通过</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* ── 今日门店内容任务 ── */}
        <div className="px-4 mt-3">
          <div className={`rounded-2xl shadow-card border ${postingStatus === 'done' ? 'bg-green-50/40 border-green-200' : 'bg-white border-surface-100'}`}>
            <div className="px-4 pt-4 pb-2 flex items-center justify-between">
              <h2 className="text-[15px] font-bold text-gray-900">今日门店内容任务</h2>
              {postingStatus === 'done' ? (
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-green-50 text-green-700 font-medium">已完成</span>
              ) : (
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-surface-100 text-surface-500 font-medium">提醒导购完成</span>
              )}
            </div>
            <div className="mx-4 mb-2 rounded-xl p-3 bg-surface-50 border border-surface-200">
              <div className="flex items-center gap-2 mb-2">
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-green-50 text-green-700 font-medium border border-green-100">微信朋友圈</span>
                <span className="text-[10px] text-surface-500">门店每日必做 · +{POINTS_RULES.daily_posting}积分</span>
              </div>
              <p className="text-xs text-surface-600 line-clamp-2 leading-relaxed mb-2">{momentsMaterial.content}</p>
              <div className="flex gap-2">
                <button onClick={handleCopyPosting}
                  className="flex-1 h-10 bg-navy-800 text-white font-semibold rounded-lg text-xs active:bg-navy-900 transition-colors flex items-center justify-center gap-1.5">
                  <Copy size={13} />一键复制门店文案
                </button>
                <button onClick={handleSwapMoments}
                  className="px-3 h-10 text-surface-400 text-[11px] rounded-lg active:bg-white/60 transition-colors flex items-center gap-1 flex-shrink-0">
                  <RefreshCw size={13} />换一条
                </button>
              </div>
            </div>
            <div className="px-4 pb-3 flex items-center gap-1 text-[10px] text-surface-400 border-t border-surface-100 pt-2 mx-4">
              <Sparkles size={10} />
              朋友圈 +{POINTS_RULES.daily_posting} · 双平台完成额外 +{POINTS_RULES.dual_platform_bonus}
            </div>
          </div>
        </div>

        {/* ── 本店案例概览 ── */}
        <div className="px-4 mt-4">
          <div className="bg-white rounded-2xl shadow-card p-4 border border-surface-100">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-9 h-9 rounded-xl bg-navy-50 flex items-center justify-center">
                <Store size={20} className="text-navy-700" />
              </div>
              <div className="flex-1">
                <h2 className="text-sm font-semibold text-gray-900">本店案例概览</h2>
                <p className="text-xs text-surface-400 mt-0.5">管理门店案例采集和分享，提醒导购补充故事</p>
              </div>
            </div>
            {(dealerStats.pendingStory > 0 || dealerStats.pendingReview > 0 || dealerStats.rejected > 0) && (
              <div className="flex gap-2 mb-3 flex-wrap">
                {dealerStats.pendingStory > 0 && (
                  <span className="text-[11px] px-2.5 py-1 rounded-full bg-warm-50 text-warm-700 font-medium">
                    待补故事 {dealerStats.pendingStory}
                  </span>
                )}
                {dealerStats.pendingReview > 0 && (
                  <span className="text-[11px] px-2.5 py-1 rounded-full bg-blue-50 text-blue-700 font-medium">
                    待审核 {dealerStats.pendingReview}
                  </span>
                )}
                {dealerStats.rejected > 0 && (
                  <span className="text-[11px] px-2.5 py-1 rounded-full bg-red-50 text-red-600 font-medium">
                    需修改 {dealerStats.rejected}
                  </span>
                )}
              </div>
            )}
            <button
              onClick={() => navigate('/cases-hub')}
              className="w-full h-11 bg-navy-800 text-white font-semibold rounded-xl text-sm active:bg-navy-900 transition-colors flex items-center justify-center gap-2 shadow-sm"
            >
              <Store size={16} />
              查看本店案例 ({dealerStats.totalTasks})
            </button>
          </div>
        </div>
      </>) : (<>
      {/* ═══════════════════════════════════ */}
      {/* ── 今日内容任务 ── */}
      {/* ═══════════════════════════════════ */}
      <div className="px-4 -mt-3 relative z-10">
        <div className={`rounded-2xl shadow-card border ${postingStatus === 'done' ? 'bg-green-50/40 border-green-200' : 'bg-white border-surface-100'}`}>
          {/* Module header */}
          <div className="px-4 pt-4 pb-2 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <h2 className="text-[15px] font-bold text-gray-900">今日内容任务</h2>
              {postingStatus === 'done' ? (
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-green-50 text-green-700 font-medium">已完成</span>
              ) : postingStatus === 'copied' ? (
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-warm-50 text-warm-700 font-medium">待确认</span>
              ) : (
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-red-50 text-red-600 font-medium">未完成</span>
              )}
            </div>
            {(postingStatus === 'done' && xhsStatus === 'done') && (
              <span className="text-[10px] text-green-600 font-medium bg-green-50 px-2 py-0.5 rounded-full">双平台达成</span>
            )}
          </div>

          {/* ═══ 微信朋友圈任务 ═══ */}
          <div className={`mx-4 mb-2 rounded-xl p-3 ${postingStatus === 'done' ? 'bg-green-50/50 border border-green-200' :
            postingStatus === 'copied' ? 'bg-warm-50/50 border border-warm-200' :
            'bg-surface-50 border border-surface-200'}`}>
            <div className="flex items-center gap-2 mb-2">
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-green-50 text-green-700 font-medium border border-green-100">微信朋友圈</span>
              <span className="text-[10px] text-surface-500">每日必做 · +{POINTS_RULES.daily_posting}积分</span>
              {postingStatus === 'done' && (
                <CheckCircle2 size={14} className="text-green-500 ml-auto" />
              )}
            </div>
            {postingStatus !== 'done' ? (
              <>
                <p className="text-xs text-surface-600 line-clamp-2 leading-relaxed mb-2">{momentsMaterial.content}</p>
                <div className="flex gap-2">
                  {postingStatus === 'idle' ? (
                    <button onClick={handleCopyPosting}
                      className="flex-1 h-10 bg-navy-800 text-white font-semibold rounded-lg text-xs active:bg-navy-900 transition-colors flex items-center justify-center gap-1.5">
                      <Copy size={13} />一键复制朋友圈文案
                    </button>
                  ) : (
                    <button onClick={handleConfirmPosting}
                      className="flex-1 h-10 bg-green-600 text-white font-semibold rounded-lg text-xs active:bg-green-700 transition-colors flex items-center justify-center gap-1.5">
                      <CheckCircle2 size={13} />我已发布，完成今日任务
                    </button>
                  )}
                  <button onClick={handleSwapMoments}
                    className="px-3 h-10 text-surface-400 text-[11px] rounded-lg active:bg-white/60 transition-colors flex items-center gap-1 flex-shrink-0">
                    <RefreshCw size={13} />换一条
                  </button>
                </div>
              </>
            ) : (
              <div className="flex items-center gap-3 text-xs text-green-700">
                <Flame size={14} className="text-orange-500" />
                <span>连续 {consecutiveDays + 1} 天 · 本月 {monthlyDays}/30 天</span>
              </div>
            )}
          </div>

          {/* ═══ 小红书任务 ═══ */}
          <div className={`mx-4 mb-3 rounded-xl p-3 ${xhsStatus === 'done' ? 'bg-red-50/30 border border-red-200' :
            xhsStatus === 'copied' ? 'bg-red-50/40 border border-red-200' :
            'bg-surface-50 border border-surface-200'}`}>
            <div className="flex items-center gap-2 mb-2">
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-red-50 text-red-500 font-medium border border-red-100">小红书</span>
              <span className="text-[10px] text-surface-500">加分任务 · +{POINTS_RULES.xhs_posting}积分</span>
              {xhsStatus === 'done' && (
                <CheckCircle2 size={14} className="text-red-400 ml-auto" />
              )}
            </div>
            {xhsStatus !== 'done' ? (
              <>
                <p className="text-xs text-surface-600 line-clamp-2 leading-relaxed mb-2">{xhsMaterial.xhsContent || xhsMaterial.content}</p>
                <div className="flex gap-2">
                  {xhsStatus === 'idle' ? (
                    <button onClick={handleCopyXhs}
                      className="flex-1 h-10 bg-red-600 text-white font-semibold rounded-lg text-xs active:bg-red-700 transition-colors flex items-center justify-center gap-1.5">
                      <Copy size={13} />一键复制小红书文案
                    </button>
                  ) : (
                    <button onClick={handleConfirmXhs}
                      className="flex-1 h-10 bg-red-500 text-white font-semibold rounded-lg text-xs active:bg-red-600 transition-colors flex items-center justify-center gap-1.5">
                      <CheckCircle2 size={13} />我已发布，记入加分
                    </button>
                  )}
                  <button onClick={handleSwapXhs}
                    className="px-3 h-10 text-surface-400 text-[11px] rounded-lg active:bg-white/60 transition-colors flex items-center gap-1 flex-shrink-0">
                    <RefreshCw size={13} />换一条
                  </button>
                </div>
              </>
            ) : (
              <div className="text-xs text-red-600">
                本周已发布 {weeklyXhsCount} 篇 · 本月 {monthlyXhsDays} 篇
              </div>
            )}
          </div>

          {/* ── Points summary ── */}
          <div className="px-4 pb-3 flex items-center gap-1 text-[10px] text-surface-400 border-t border-surface-100 pt-2 mx-4">
            <Sparkles size={10} />
            朋友圈 +{POINTS_RULES.daily_posting} · 小红书 +{POINTS_RULES.xhs_posting} · 双平台完成额外 +{POINTS_RULES.dual_platform_bonus}
          </div>
        </div>
      </div>

      {/* ════════════════════════════════════ */}
      {/* ── 今天分享一个真实案例吗？（第二优先级）── */}
      {/* ════════════════════════════════════ */}
      <div className="px-4 mt-3">
        <div className="bg-white rounded-2xl shadow-card border border-surface-100 overflow-hidden">
          <div className="px-4 pt-4 pb-1">
            <h2 className="text-[15px] font-bold text-gray-900">今天分享一个真实案例吗？</h2>
            <p className="text-xs text-surface-400 mt-0.5">
              {shareCase ? '把真实交付案例发给意向客户，加速成交' : '上传并通过审核后可分享给意向客户'}
            </p>
          </div>

          {shareCase ? (
            <>
              {/* Case preview card */}
              <div className="px-4 py-3 flex gap-3 items-start">
                <div className="w-[72px] h-[72px] rounded-xl overflow-hidden flex-shrink-0 bg-surface-100">
                  <img src={shareCase.installImages[0]} alt={shareCase.customerAlias}
                    className="w-full h-full object-cover" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex gap-1.5 mb-1 flex-wrap">
                    <span className="text-[10px] px-2 py-0.5 rounded-full bg-navy-50 text-navy-700 font-medium">
                      {shareCase.productName || shareCase.brand}
                    </span>
                    <span className="text-[10px] px-2 py-0.5 rounded-full bg-surface-50 text-surface-500">
                      {shareCase.scene}
                    </span>
                  </div>
                  <p className="text-sm font-semibold text-gray-900 line-clamp-1">
                    {shareCase.city}{shareCase.customerAlias} · {shareCase.model}
                  </p>
                  <p className="text-xs text-surface-400 mt-0.5">
                    <Store size={10} className="inline mr-0.5" />{shareCase.storeName}
                    {shareCase.storyFeedback && (
                      <span className="ml-2 text-warm-600 line-clamp-1">{shareCase.storyFeedback}</span>
                    )}
                  </p>
                </div>
              </div>

              {/* Action buttons */}
              <div className="px-4 pb-4 space-y-2">
                <button onClick={handlePreviewCase}
                  className="w-full h-11 bg-navy-800 text-white font-semibold rounded-xl text-sm active:bg-navy-900 transition-colors flex items-center justify-center gap-2 shadow-sm">
                  <Send size={16} />发给意向客户
                </button>
                <div className="flex gap-2">
                  <button onClick={handleCopyCaseLink}
                    className="flex-1 h-10 bg-navy-50 text-navy-700 font-semibold rounded-xl text-xs active:bg-navy-100 transition-colors flex items-center justify-center gap-1.5">
                    <Copy size={14} />一键复制案例链接
                  </button>
                  <button onClick={handleCopyScript}
                    className="flex-1 h-10 bg-warm-50 text-warm-700 font-semibold rounded-xl text-xs active:bg-warm-100 transition-colors flex items-center justify-center gap-1.5 border border-warm-200">
                    <MessageCircle size={14} />复制发送话术
                  </button>
                </div>
                <div className="flex gap-2">
                  <button onClick={handlePreviewCase}
                    className="flex-1 h-10 bg-white border border-surface-200 text-gray-700 font-semibold rounded-xl text-xs active:bg-surface-50 transition-colors flex items-center justify-center gap-1.5">
                    预览客户看到的页面 <ChevronRight size={14} />
                  </button>
                  {shareableCases.length > 1 && (
                    <button onClick={handleSwitchCase}
                      className="flex-1 h-10 text-surface-500 text-xs font-medium rounded-xl active:bg-surface-50 transition-colors flex items-center justify-center gap-1 border border-surface-200">
                      <RefreshCw size={13} />换一个案例
                    </button>
                  )}
                </div>
              </div>
            </>
          ) : (
            /* Empty state */
            <div className="px-4 pb-4">
              <div className="bg-surface-50 rounded-xl p-4 text-center">
                <Shield size={28} className="text-surface-300 mx-auto mb-2" />
                <p className="text-xs text-surface-500 leading-relaxed mb-3">
                  暂无可公开分享案例<br />先上传并通过审核后可用于客户转化
                </p>
                <button onClick={() => navigate('/delivery/create')}
                  className="inline-flex px-5 py-2 bg-navy-800 text-white font-medium rounded-xl text-xs active:bg-navy-900 transition-colors items-center gap-1.5">
                  去上传案例 <ArrowRight size={13} />
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* ════════════════════════════════════ */}
      {/* ── 今日成交喜报（第三优先级）── */}
      {/* ════════════════════════════════════ */}
      {approvedDeals.length > 0 && (
        <div className="px-4 mt-3">
          <div className="bg-white rounded-2xl shadow-card overflow-hidden border border-warm-100">
            <div className="px-4 pt-4 pb-1 flex items-center justify-between">
              <div>
                <h2 className="text-[15px] font-bold text-gray-900">今日成交喜报</h2>
                <p className="text-xs text-surface-400 mt-0.5">最新成交战报，激励全员</p>
              </div>
              <button
                onClick={() => navigate('/deal-report/submit')}
                className="text-xs text-navy-700 font-medium bg-navy-50 px-3 py-1.5 rounded-full active:bg-navy-100 transition-colors flex items-center gap-1"
              >
                <TrendingUp size={12} />
                发布成交喜报
              </button>
            </div>

            {approvedDeals.map((deal, idx) => (
              <div key={deal.id} className={`px-4 py-3 ${idx > 0 ? 'border-t border-surface-50' : ''}`}>
                <div className="flex items-start gap-2 mb-2">
                  <span className="text-2xl">🎉</span>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-gray-900">
                      {deal.storeName} · {deal.salesName}
                    </p>
                    <p className="text-xs text-surface-400 mt-0.5">
                      {deal.city} · {deal.createdAt.slice(0, 10)}
                    </p>
                  </div>
                  <span className="text-sm font-bold text-warm-600 flex-shrink-0">
                    ¥{deal.amount.toLocaleString()}
                  </span>
                </div>
                <div className="flex flex-wrap gap-1.5 text-[10px] mb-2">
                  <span className="px-2 py-0.5 rounded-full bg-navy-50 text-navy-700 font-medium">
                    {deal.productModel}
                  </span>
                  <span className="px-2 py-0.5 rounded-full bg-surface-50 text-surface-500">
                    {deal.customerSource}
                  </span>
                </div>
                <p className="text-xs text-surface-600 leading-relaxed line-clamp-2 mb-1">
                  {deal.summary}
                </p>
                <button
                  onClick={() => handleCopyDealReport(deal)}
                  className="text-[11px] text-navy-700 font-medium active:text-navy-900 flex items-center gap-1"
                >
                  <Copy size={12} />
                  复制喜报文案发到微信群
                </button>
              </div>
            ))}

            {approvedDeals.length === 0 && (
              <div className="px-4 pb-4 text-center text-xs text-surface-400">
                暂无已审核的成交喜报
              </div>
            )}
          </div>
        </div>
      )}

      {approvedDeals.length === 0 && (
        <div className="px-4 mt-3">
          <div className="bg-white rounded-2xl shadow-card p-4 border border-surface-100">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-[15px] font-bold text-gray-900">今日成交喜报</h2>
                <p className="text-xs text-surface-400 mt-0.5">还没有成交喜报，发布第一条</p>
              </div>
              <button
                onClick={() => navigate('/deal-report/submit')}
                className="px-4 py-2 bg-navy-800 text-white font-medium rounded-xl text-xs active:bg-navy-900 transition-colors flex items-center gap-1.5"
              >
                <TrendingUp size={14} />
                发布成交喜报
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ═══════════════════════════════════ */}
      {/* ── 上传今日交付案例（第四优先级）── */}
      {/* ═══════════════════════════════════ */}
      <div className="px-4 mt-3">
        <div className="bg-white rounded-2xl shadow-card p-4 border border-surface-100">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-9 h-9 rounded-xl bg-navy-50 flex items-center justify-center">
              <Camera size={20} className="text-navy-700" />
            </div>
            <div className="flex-1">
              <h2 className="text-sm font-semibold text-gray-900">今天有成交或交付吗？</h2>
              <p className="text-xs text-surface-400 mt-0.5">
                {user.role === 'installer'
                  ? '拍照上传安装照片，审核通过获得积分'
                  : user.role === 'sales'
                  ? '上传交付案例，审核通过 +20 积分'
                  : user.role === 'admin'
                  ? '审核交付案例和成交喜报'
                  : '上传门店交付案例，积累可分享素材'
                }
              </p>
            </div>
          </div>

          {/* Pending status chips */}
          {(pendingUpload > 0 || pendingStory > 0 || pendingReview > 0 || rejectedCount > 0) && (
            <div className="flex gap-2 mb-3 flex-wrap">
              {pendingUpload > 0 && (
                <span className="text-[11px] px-2.5 py-1 rounded-full bg-surface-100 text-surface-600 font-medium">
                  待上传 {pendingUpload}
                </span>
              )}
              {pendingStory > 0 && (
                <span className="text-[11px] px-2.5 py-1 rounded-full bg-warm-50 text-warm-700 font-medium">
                  待补故事 {pendingStory}
                </span>
              )}
              {pendingReview > 0 && (
                <span className="text-[11px] px-2.5 py-1 rounded-full bg-blue-50 text-blue-700 font-medium">
                  待审核 {pendingReview}
                </span>
              )}
              {rejectedCount > 0 && (
                <span className="text-[11px] px-2.5 py-1 rounded-full bg-red-50 text-red-600 font-medium">
                  需修改 {rejectedCount}
                </span>
              )}
            </div>
          )}

          {/* Role-specific CTA */}
          {user.role === 'installer' ? (
            <button
              onClick={() => navigate('/delivery/tasks')}
              className="w-full h-11 bg-navy-800 text-white font-semibold rounded-xl text-sm active:bg-navy-900 transition-colors flex items-center justify-center gap-2 shadow-sm"
            >
              <Camera size={16} />
              上传安装照片
            </button>
          ) : user.role === 'admin' ? (
            <button
              onClick={() => navigate('/admin/delivery')}
              className="w-full h-11 bg-navy-800 text-white font-semibold rounded-xl text-sm active:bg-navy-900 transition-colors flex items-center justify-center gap-2 shadow-sm"
            >
              <CheckCircle2 size={16} />
              去审核案例
            </button>
          ) : (
            <button
              onClick={() => navigate('/delivery/create')}
              className="w-full h-11 bg-navy-800 text-white font-semibold rounded-xl text-sm active:bg-navy-900 transition-colors flex items-center justify-center gap-2 shadow-sm"
            >
              <Upload size={16} />
              上传今日交付案例
            </button>
          )}

          {/* Link to case hub */}
          <button
            onClick={() => navigate('/cases-hub')}
            className="w-full mt-2 h-9 text-surface-500 text-xs font-medium rounded-xl active:bg-surface-50 transition-colors flex items-center justify-center gap-1"
          >
            查看全部案例 ({myTasks.length}) <ChevronRight size={14} />
          </button>
        </div>
      </div>

      {/* ── Pending Cases ── */}
      {pendingTasks.length > 0 && (
        <div className="px-4 mt-4">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-sm font-semibold text-gray-900">待处理</h2>
            <button onClick={() => navigate('/cases-hub')} className="text-xs text-navy-700 font-medium flex items-center gap-1">
              全部 <ChevronRight size={14} />
            </button>
          </div>
          <div className="space-y-2">
            {pendingTasks.slice(0, 3).map((task) => {
              const actionLabel =
                task.installImages.length === 0 && user.role === 'installer' ? '去上传' :
                task.installImages.length > 0 && !task.storyWhy && (user.role === 'sales' || user.role === 'dealer_owner') ? '补故事' :
                task.reviewStatus === 'rejected' && (user.role === 'sales' || user.role === 'dealer_owner') ? '查看驳回原因' :
                (user.role === 'admin' && (task.reviewStatus === 'pending' || task.reviewStatus === 'story_done')) ? '去审核' :
                task.reviewStatus === 'draft' && (user.role === 'sales' || user.role === 'dealer_owner') ? '等待安装' : '';
              return (
                <button
                  key={task.id}
                  onClick={() => navigate(`/delivery/detail/${task.id}`)}
                  className="w-full bg-white rounded-xl p-3 shadow-card active:bg-surface-50 transition-colors text-left flex items-center justify-between"
                >
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2 mb-0.5">
                      <p className="text-sm font-semibold text-gray-900 truncate">{task.customerAlias} · {task.model}</p>
                      {task.reviewStatus === 'rejected' && (
                        <span className="text-[10px] px-1.5 py-0.5 rounded bg-red-50 text-red-600 flex-shrink-0">驳回</span>
                      )}
                    </div>
                    <p className="text-xs text-surface-400">{task.city} · {task.scene} · {task.salesName}</p>
                  </div>
                  {actionLabel && (
                    <span className="text-xs text-navy-700 font-medium flex items-center gap-0.5 flex-shrink-0 ml-2">
                      {actionLabel} <ChevronRight size={12} />
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* ── Recommended Materials (kept lower priority) ── */}
      {recommendedMaterials.length > 0 && (
        <div className="px-4 mt-5">
          <div className="flex items-center justify-between mb-3">
            <div>
              <h2 className="text-sm font-semibold text-gray-900">更多素材</h2>
              <p className="text-xs text-surface-400 mt-0.5">更多朋友圈、小红书内容供你使用</p>
            </div>
            <button onClick={() => navigate('/library')} className="text-xs text-navy-700 font-medium flex items-center gap-1">
              素材库 <ChevronRight size={14} />
            </button>
          </div>

          <div className="space-y-2">
            {recommendedMaterials.map((m) => (
              <div key={m.id} className="bg-white rounded-xl shadow-card overflow-hidden">
                <div className="flex gap-3 p-3">
                  <button onClick={() => navigate(`/material/${m.id}`)}
                    className="w-[72px] h-[72px] rounded-lg overflow-hidden flex-shrink-0 bg-surface-100">
                    <img src={m.images[0]} alt={m.title} className="w-full h-full object-cover" loading="lazy" />
                  </button>
                  <div className="flex-1 min-w-0 flex flex-col justify-between">
                    <button onClick={() => navigate(`/material/${m.id}`)} className="text-left">
                      <div className="flex gap-1 mb-1">
                        {m.platforms.slice(0, 2).map((p) => (
                          <span key={p} className={`text-[10px] px-1.5 py-0.5 rounded-full font-medium ${platformColors[p] || 'bg-gray-100 text-gray-600'}`}>
                            {p}
                          </span>
                        ))}
                      </div>
                      <h3 className="text-sm font-semibold text-gray-900 line-clamp-1">{m.title}</h3>
                      <p className="text-xs text-surface-400 mt-0.5 line-clamp-1">{m.content}</p>
                    </button>
                    <div className="flex gap-1.5 mt-1.5">
                      <button
                        onClick={(e) => { e.stopPropagation(); handleCopyText(m.content); }}
                        className="h-7 px-3 bg-surface-50 text-surface-600 font-medium rounded-lg text-[11px] active:bg-surface-100 transition-colors flex items-center gap-1">
                        <Copy size={11} /> 复制
                      </button>
                      <button
                        onClick={() => navigate(`/ai-generate/material/${m.id}`)}
                        className="h-7 px-3 bg-gradient-to-r from-purple-50 to-navy-50 text-navy-700 font-medium rounded-lg text-[11px] active:opacity-80 transition-all flex items-center gap-1">
                        <Sparkles size={11} /> AI改写
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ── Store Points / Ranking Brief ── */}
      {user.role !== 'admin' && (
        <div className="px-4 mt-4">
          <button
            onClick={() => navigate('/profile')}
            className="w-full bg-white rounded-xl p-3.5 shadow-card active:bg-surface-50 transition-colors text-left flex items-center justify-between"
          >
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-warm-50 flex items-center justify-center">
                <Trophy size={18} className="text-warm-500" />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-900">积分与排行</p>
                <p className="text-xs text-surface-400 mt-0.5">
                  {approvedCases} 个精选案例 · {totalPts} 积分
                </p>
              </div>
            </div>
            <ChevronRight size={16} className="text-surface-300" />
          </button>
        </div>
      )}

      </>)}

      {copyModalText && (
        <CopyModal text={copyModalText} onClose={() => setCopyModalText('')} />
      )}
      {dealCopyText && (
        <CopyModal text={dealCopyText} onClose={() => setDealCopyText('')} />
      )}
    </div>
  );
}

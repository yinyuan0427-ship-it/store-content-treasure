import { img, bedImg, mattressImg, luxuryImg, storeImg, deliveryImg, factoryImg, detailImg, caseImg, pillowImg } from '../utils/images';
import { syncJson } from '../api/client';

// ========== 类型定义 ==========

export interface User {
  phone: string;
  password: string;
  name: string;
  role: 'admin' | 'dealer_owner' | 'sales' | 'installer';
  storeName: string;
  storeId: string;
  city: string;
  team?: string;
}

export interface Store {
  id: string;
  name: string;
  city: string;
}

export interface SalesPerson {
  id: string;
  name: string;
  storeId: string;
  storeName: string;
  userId: string;
}

export interface Installer {
  id: string;
  name: string;
  city: string;
  serviceStoreIds: string[];
  team: string;
  userId: string;
}

export interface DeliveryTask {
  id: string;
  storeId: string;
  storeName: string;
  salesId: string;
  salesName: string;
  installerId: string;
  installerName: string;
  customerAlias: string;
  city: string;
  district?: string;
  scene: string;
  brand: string;
  model: string;
  size: string;
  customerRequirement: string;
  authStatus: '可公开使用' | '仅内部学习' | '不确定，不可公开';
  installImages: string[];
  installStatus: '' | 'completed' | 'customer_not_home' | 'site_issue' | 'need_after_sales';
  installNote: string;
  storyWhy: string;
  storyFocus: string;
  storyReason: string;
  storyFeedback: string;
  storyPublic: string;
  reviewStatus: 'draft' | 'photos_uploaded' | 'story_done' | 'pending' | 'approved' | 'rejected' | 'suspected_dup' | 'confirmed_dup' | 'featured';
  reviewNote: string;
  salesPoints: number;
  installerPoints: number;
  storePoints: number;
  createdAt: string;
  dupRefTaskId?: string;
  productName: string;
  productSeries: string;
  productCategory: string;
  productModel: string;
  keywords: string[];
  privacyChecks?: {
    hasFace: boolean;
    hasDoorNumber: boolean;
    hasPhoneOrAddress: boolean;
    hasDeliveryDocOrContract: boolean;
    hasPriceInfo: boolean;
    hasCompetitorBrand: boolean;
    hasClutteredScene: boolean;
  };
}

export interface Material {
  id: string;
  title: string;
  content: string;
  xhsContent?: string;
  dyScript?: string;
  images: string[];
  category: 'moments' | 'xhs' | 'douyin' | 'script' | 'activity' | 'delivery' | 'factory';
  categoryLabel: string;
  platforms: string[];
  scene: string;
  usageTip: string;
  isRecommended: boolean;
  createdAt: string;
  productName: string;
  productSeries: string;
  productCategory: string;
  productModel: string;
  keywords: string[];
}

export interface Submission {
  id: string;
  userId: string;
  images: string[];
  brand: string;
  model: string;
  scene: string;
  city: string;
  authStatus: string;
  description: string;
  status: 'pending' | 'approved' | 'rejected' | 'suspected_dup' | 'confirmed_dup';
  rejectReason?: string;
  points: number;
  createdAt: string;
}

export interface ShareLeadPayload {
  id?: string;
  alias: string;
  phone: string;
  city?: string;
  remark?: string;
  sourceCaseId: string;
  sourceStoreId?: string;
  sourceStoreName?: string;
  sourceSalesId?: string;
  interestProduct: string;
  interestType: string;
  sourceAction: string;
  sourceChannel?: string;
  sourceEntry?: string;
  sourceUrl?: string;
  status?: '待联系' | '已联系' | '已到店' | '已成交' | '无效' | '暂不考虑';
  notes?: string;
  lastOperatorId?: string;
  lastOperatedAt?: string;
  createdAt: string;
}

const SHARE_LEADS_KEY = 'sct-share-leads';

export function loadShareLeads(): ShareLeadPayload[] {
  try {
    const raw = localStorage.getItem(SHARE_LEADS_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return parsed
      .filter((item): item is Partial<ShareLeadPayload> => Boolean(item) && typeof item === 'object')
      .map(item => ({
        alias: item.alias || '客户',
        phone: item.phone || '',
        city: item.city || '',
        remark: item.remark || '',
        sourceCaseId: item.sourceCaseId || '',
        sourceStoreId: item.sourceStoreId,
        sourceStoreName: item.sourceStoreName,
        sourceSalesId: item.sourceSalesId,
        interestProduct: item.interestProduct || '',
        interestType: item.interestType || '咨询同款产品',
        sourceAction: item.sourceAction || 'consult_same_product',
        sourceChannel: item.sourceChannel,
        sourceEntry: item.sourceEntry,
        sourceUrl: item.sourceUrl,
        status: item.status,
        notes: item.notes,
        lastOperatorId: item.lastOperatorId,
        lastOperatedAt: item.lastOperatedAt,
        id: item.id,
        createdAt: item.createdAt || new Date().toISOString(),
      }));
  } catch { return []; }
}

export function addShareLead(payload: ShareLeadPayload): void {
  localStorage.setItem(SHARE_LEADS_KEY, JSON.stringify([payload, ...loadShareLeads()]));
  void syncJson('/api/leads', payload);
}

export function getLeadsForStore(storeId: string): ShareLeadPayload[] {
  if (!storeId) return [];
  return loadShareLeads().filter(l => l.sourceStoreId === storeId);
}

export interface PointRecord {
  id: string;
  userId: string;
  type: string;
  description: string;
  points: number;
  relatedCaseId?: string;
  createdAt: string;
  status?: 'credited' | 'pending' | 'revoked';
}

export interface RankItem {
  rank: number;
  storeName?: string;
  userName: string;
  userTitle?: string;
  points: number;
}

// ========== 公开案例（客户可见） ==========
export interface PublicCase {
  id: string;
  city: string;
  district?: string;
  brand: string;
  model: string;
  size: string;
  scene: string;
  sceneLabel: string;
  customerRequirement: string;
  requirementTags: string[];
  images: string[];
  story: string;
  storyTitle: string;
  highlights: string[];
  serviceFlow: string[];
  storeName: string;
  salesName: string;
  salesId: string;
  storeId: string;
  publicVisible: boolean;
  productName: string;
  productSeries: string;
  productCategory: string;
  productModel: string;
  keywords: string[];
}

// ========== 客户线索 ==========
export interface Lead {
  id: string;
  customerAlias: string;
  phone: string;
  wechat?: string;
  city: string;
  interestedProduct: string;
  interestType: string;
  sourceCaseId: string;
  sourceStoreId?: string;
  sourceStoreName?: string;
  sourceSalesId?: string;
  remark?: string;
  status: '待联系' | '已联系' | '已到店' | '已成交' | '无效' | '暂不考虑';
  notes?: string;
  assignedToId?: string;
  createdAt: string;
}


// ========== 门店数据 ==========
export const mockStores: Store[] = [
  { id: 'store_sz', name: '苏州体验店', city: '苏州' },
  { id: 'store_nj', name: '南京体验店', city: '南京' },
];

// ========== 测试账号 ==========
export const testUsers: User[] = [
  {
    phone: 'admin', password: 'admin123', name: '王经理',
    role: 'admin', storeName: '品牌总部', storeId: 'store_hq', city: '上海',
  },
  {
    phone: 'dealer001', password: '123456', name: '张店长',
    role: 'dealer_owner', storeName: '苏州体验店', storeId: 'store_sz', city: '苏州',
  },
  {
    phone: 'sales001', password: '123456', name: '张顾问',
    role: 'sales', storeName: '苏州体验店', storeId: 'store_sz', city: '苏州',
  },
  {
    phone: 'sales002', password: '123456', name: '李顾问',
    role: 'sales', storeName: '苏州体验店', storeId: 'store_sz', city: '苏州',
  },
  {
    phone: 'sales003', password: '123456', name: '新导购',
    role: 'sales', storeName: '苏州体验店', storeId: 'store_sz', city: '苏州',
  },
  {
    phone: 'installer001', password: '123456', name: '王师傅',
    role: 'installer', storeName: '安装团队A', storeId: '', city: '苏州', team: '安装团队A',
  },
  {
    phone: 'installer002', password: '123456', name: '刘师傅',
    role: 'installer', storeName: '安装团队B', storeId: '', city: '南京', team: '安装团队B',
  },
];

// ========== 销售数据 ==========
export const mockSalesPersons: SalesPerson[] = [
  { id: 'sales_zhang', name: '张顾问', storeId: 'store_sz', storeName: '苏州体验店', userId: 'sales001' },
  { id: 'sales_li', name: '李顾问', storeId: 'store_sz', storeName: '苏州体验店', userId: 'sales002' },
  { id: 'sales_new', name: '新导购', storeId: 'store_sz', storeName: '苏州体验店', userId: 'sales003' },
];

// ========== 安装师傅数据 ==========
export const mockInstallers: Installer[] = [
  { id: 'installer_wang', name: '王师傅', city: '苏州', serviceStoreIds: ['store_sz'], team: '安装团队A', userId: 'installer001' },
  { id: 'installer_liu', name: '刘师傅', city: '南京', serviceStoreIds: ['store_nj'], team: '安装团队B', userId: 'installer002' },
];

// ========== 案例采集任务数据 ==========
export const mockDeliveryTasks: DeliveryTask[] = [
  {
    id: 'd1',
    storeId: 'store_sz', storeName: '苏州体验店',
    salesId: 'sales_zhang', salesName: '张顾问',
    installerId: 'installer_wang', installerName: '王师傅',
    customerAlias: '李女士',
    city: '苏州',
    district: '工业园区',
    scene: '新房主卧',
    brand: 'TEMPUR',
    model: 'TEMPUR FORM™ 芸枫系列床垫',
    size: '1.8m × 2.0m',
    customerRequirement: '客户家有电梯，旧床垫需要帮忙搬走。客户说床垫偏硬一点，之前试过软款觉得腰不舒服。',
    authStatus: '可公开使用',
    installImages: [],
    installStatus: '',
    installNote: '',
    storyWhy: '',
    storyFocus: '',
    storyReason: '',
    storyFeedback: '',
    storyPublic: '',
    reviewStatus: 'draft',
    reviewNote: '',
    salesPoints: 0,
    installerPoints: 0,
    storePoints: 0,
    createdAt: '2026-05-12 09:30',
    productName: 'TEMPUR FORM™ 芸枫系列',
    productSeries: 'TEMPUR FORM™ 芸枫系列',
    productCategory: '床垫',
    productModel: 'TEMPUR FORM™ 芸枫系列床垫',
    keywords: ['TEMPUR FORM', '芸枫系列', '床垫', 'TEMPUR'],
  },
  {
    id: 'd2',
    storeId: 'store_sz', storeName: '苏州体验店',
    salesId: 'sales_li', salesName: '李顾问',
    installerId: 'installer_wang', installerName: '王师傅',
    customerAlias: '王先生',
    city: '苏州',
    district: '姑苏区',
    scene: '旧床换新',
    brand: 'TEMPUR',
    model: 'Pro Air 梵璞·怡风',
    size: '1.5m × 2.0m',
    customerRequirement: '老小区无电梯，需要两个师傅一起搬。客户腰椎不好，对床垫硬度要求比较高。',
    authStatus: '可公开使用',
    installImages: [deliveryImg(0, 800, 600), deliveryImg(1, 800, 600), deliveryImg(2, 800, 600)],
    installStatus: 'completed',
    installNote: '老小区楼梯窄，搬运比较费劲但顺利完成。客户现场试躺很满意。',
    storyWhy: '',
    storyFocus: '',
    storyReason: '',
    storyFeedback: '',
    storyPublic: '',
    reviewStatus: 'photos_uploaded',
    reviewNote: '',
    salesPoints: 0,
    installerPoints: 0,
    storePoints: 0,
    createdAt: '2026-05-12 08:00',
    productName: 'Pro Air 梵璞·怡风',
    productSeries: 'Pro Air 梵璞·怡风',
    productCategory: '床垫',
    productModel: 'Pro Air 梵璞·怡风',
    keywords: ['Pro Air', '梵璞·怡风', '床垫', 'TEMPUR'],
  },
  {
    id: 'd3',
    storeId: 'store_sz', storeName: '苏州体验店',
    salesId: 'sales_zhang', salesName: '张顾问',
    installerId: 'installer_wang', installerName: '王师傅',
    customerAlias: '赵姐',
    city: '苏州',
    district: '吴中区',
    scene: '新房主卧',
    brand: 'TEMPUR',
    model: 'TEMPUR® North 泰普尔极光系列',
    size: '1.8m × 2.0m',
    customerRequirement: '新房装修，主卧床垫。客户对颜值有要求，选了浅色系床垫搭配整体装修风格。',
    authStatus: '可公开使用',
    installImages: [deliveryImg(3, 800, 600), deliveryImg(4, 800, 600), deliveryImg(5, 800, 600), deliveryImg(6, 800, 600)],
    installStatus: 'completed',
    installNote: '新房在高层有电梯。安装顺利，客户很满意。',
    storyWhy: '赵姐来店里试了5次，每次都带着家人一起来，非常认真。之前睡的是棕垫，总觉得腰不舒服。',
    storyFocus: '最关注床垫的支撑性和透气性。赵姐说夏天怕热，想要透气的材质。',
    storyReason: '最终选了 TEMPUR® North 泰普尔极光系列，因为这款用的是天然乳胶+独立袋装弹簧，支撑好的同时透气性也好，而且面料是凉感面料，夏天不会闷热。',
    storyFeedback: '安装好后赵姐当场试躺了10分钟，说比她之前那张舒服太多了，腰部的支撑感刚好。',
    storyPublic: '适合公开传播',
    reviewStatus: 'pending',
    reviewNote: '',
    salesPoints: 0,
    installerPoints: 0,
    storePoints: 0,
    createdAt: '2026-05-11 10:00',
    productName: 'TEMPUR® North 泰普尔极光系列',
    productSeries: 'TEMPUR® North 泰普尔极光系列',
    productCategory: '床垫',
    productModel: 'TEMPUR® North 泰普尔极光系列',
    keywords: ['TEMPUR North', '泰普尔极光', '极光系列', '床垫', 'TEMPUR'],
  },
  {
    id: 'd4',
    storeId: 'store_sz', storeName: '苏州体验店',
    salesId: 'sales_li', salesName: '李顾问',
    installerId: 'installer_wang', installerName: '王师傅',
    customerAlias: '陈先生',
    city: '苏州',
    district: '高新区',
    scene: '父母房',
    brand: 'TEMPUR',
    model: '梵璞·怡然 25cm 酷爽系列床垫',
    size: '1.8m × 2.0m',
    customerRequirement: '客户是回头客，之前买过一张，这次给父母买。',
    authStatus: '可公开使用',
    installImages: [deliveryImg(7, 800, 600), deliveryImg(8, 800, 600), deliveryImg(9, 800, 600)],
    installStatus: 'completed',
    installNote: '客户父母家在一楼，搬运方便。老人现场试躺很满意。',
    storyWhy: '陈先生去年自己买了一张梵璞·怡然 25cm 酷爽系列床垫，睡了半年觉得腰不疼了，这次专门带父母来店里试。',
    storyFocus: '给父母买最看重安全性和舒适度。父母年纪大了，床垫不能太软也不能太硬。',
    storyReason: '梵璞·怡然酷爽系列软硬适中，边缘加固设计对老人上下床很安全。而且面料是防螨抗菌的，对老人健康好。',
    storyFeedback: '陈先生反馈：父母睡了第一晚就说比以前那个好太多了，早上起来腰不酸了。',
    storyPublic: '适合公开传播',
    reviewStatus: 'approved',
    reviewNote: '案例完整，图片清晰，故事真实感人。已发放积分。',
    salesPoints: 23,
    installerPoints: 15,
    storePoints: 20,
    createdAt: '2026-05-10 14:00',
    productName: '梵璞·怡然酷爽系列',
    productSeries: '梵璞·怡然酷爽系列',
    productCategory: '床垫',
    productModel: '梵璞·怡然 25cm 酷爽系列床垫',
    keywords: ['梵璞·怡然', '酷爽系列', '床垫', 'TEMPUR', '25cm'],
    privacyChecks: { hasFace: false, hasDoorNumber: false, hasPhoneOrAddress: false, hasDeliveryDocOrContract: false, hasPriceInfo: false, hasCompetitorBrand: false, hasClutteredScene: false },
  },
  {
    id: 'd5',
    storeId: 'store_sz', storeName: '苏州体验店',
    salesId: 'sales_zhang', salesName: '张顾问',
    installerId: 'installer_wang', installerName: '王师傅',
    customerAlias: '刘先生',
    city: '苏州',
    scene: '新房次卧',
    brand: 'TEMPUR',
    model: 'TEMPUR FORM™ 芸枫系列床垫',
    size: '1.5m × 2.0m',
    customerRequirement: '次卧床垫，预算3000以内。',
    authStatus: '仅内部学习',
    installImages: [deliveryImg(10, 800, 600), deliveryImg(11, 800, 600)],
    installStatus: 'completed',
    installNote: '正常安装完成。',
    storyWhy: '',
    storyFocus: '',
    storyReason: '',
    storyFeedback: '',
    storyPublic: '',
    reviewStatus: 'rejected',
    reviewNote: '照片中可见门牌号，且客户授权为"仅内部学习"，不能作为公开案例。请重新上传不含隐私的照片。',
    salesPoints: 0,
    installerPoints: 0,
    storePoints: 0,
    createdAt: '2026-05-09 08:30',
    productName: 'TEMPUR FORM™ 芸枫系列',
    productSeries: 'TEMPUR FORM™ 芸枫系列',
    productCategory: '床垫',
    productModel: 'TEMPUR FORM™ 芸枫系列床垫',
    keywords: ['TEMPUR FORM', '芸枫系列', '床垫', 'TEMPUR'],
    privacyChecks: { hasFace: false, hasDoorNumber: true, hasPhoneOrAddress: false, hasDeliveryDocOrContract: false, hasPriceInfo: false, hasCompetitorBrand: false, hasClutteredScene: false },
  },
  {
    id: 'd6',
    storeId: 'store_sz', storeName: '苏州体验店',
    salesId: 'sales_li', salesName: '李顾问',
    installerId: 'installer_wang', installerName: '王师傅',
    customerAlias: '周女士',
    city: '苏州',
    scene: '婚房布置',
    brand: 'TEMPUR',
    model: 'TEMPUR® North 泰普尔极光系列',
    size: '1.8m × 2.0m',
    customerRequirement: '婚房主卧床垫，要求颜值高。',
    authStatus: '可公开使用',
    installImages: [deliveryImg(12, 800, 600), deliveryImg(13, 800, 600)],
    installStatus: 'completed',
    installNote: '婚房安装，客户还给了喜糖。',
    storyWhy: '周女士和未婚夫一起来选的，看了很多品牌，最后选了我们的。',
    storyFocus: '颜值和舒适度并重，因为是婚房，希望整体看起来漂亮。',
    storyReason: '泰普尔极光系列的浅色面料很配婚房的装修风格，而且独立袋装弹簧两个人睡互不影响。',
    storyFeedback: '客户发来婚房照片，床垫和整体风格非常搭。周女士说睡了很舒服。',
    storyPublic: '适合公开传播',
    reviewStatus: 'suspected_dup',
    reviewNote: '安装照片与案例 d3 相似度较高，疑似使用同一组图片。待管理员人工核查。',
    dupRefTaskId: 'd3',
    salesPoints: 0,
    installerPoints: 0,
    storePoints: 0,
    createdAt: '2026-05-08 16:00',
    productName: 'TEMPUR® North 泰普尔极光系列',
    productSeries: 'TEMPUR® North 泰普尔极光系列',
    productCategory: '床垫',
    productModel: 'TEMPUR® North 泰普尔极光系列',
    keywords: ['TEMPUR North', '泰普尔极光', '极光系列', '床垫', 'TEMPUR'],
    privacyChecks: { hasFace: false, hasDoorNumber: false, hasPhoneOrAddress: true, hasDeliveryDocOrContract: false, hasPriceInfo: false, hasCompetitorBrand: false, hasClutteredScene: false },
  },
  {
    id: 'd7',
    storeId: 'store_nj', storeName: '南京体验店',
    salesId: 'sales_zhang', salesName: '张顾问',
    installerId: 'installer_liu', installerName: '刘师傅',
    customerAlias: '吴先生',
    city: '南京',
    district: '鼓楼区',
    scene: '客户卧室实拍',
    brand: 'TEMPUR',
    model: 'Pro Air 梵璞·怡风',
    size: '1.8m × 2.0m',
    customerRequirement: '注意不要刮到客户家里的木地板。',
    authStatus: '不确定，不可公开',
    installImages: [],
    installStatus: '',
    installNote: '',
    storyWhy: '',
    storyFocus: '',
    storyReason: '',
    storyFeedback: '',
    storyPublic: '',
    reviewStatus: 'draft',
    reviewNote: '',
    salesPoints: 0,
    installerPoints: 0,
    storePoints: 0,
    createdAt: '2026-05-12 11:00',
    productName: 'Pro Air 梵璞·怡风',
    productSeries: 'Pro Air 梵璞·怡风',
    productCategory: '床垫',
    productModel: 'Pro Air 梵璞·怡风',
    keywords: ['Pro Air', '梵璞·怡风', '床垫', 'TEMPUR'],
  },
  {
    id: 'd101',
    storeId: 'store_sz', storeName: '苏州体验店',
    salesId: 'sales_zhang', salesName: '张顾问',
    installerId: 'installer_wang', installerName: '王师傅',
    customerAlias: '王先生',
    city: '苏州',
    district: '工业园区',
    scene: '新房主卧',
    brand: 'TEMPUR',
    model: '梵璞·怡然 软款 25cm',
    size: '1.8m × 2.0m',
    customerRequirement: '新房装修主卧床垫。王先生喜欢睡偏软一点的床，之前睡的棕垫太硬，每天早上起来肩膀压得酸。但太太担心太软的床垫对腰不好。',
    authStatus: '可公开使用',
    installImages: [deliveryImg(14, 800, 600), deliveryImg(15, 800, 600), deliveryImg(16, 800, 600)],
    installStatus: 'completed',
    installNote: '新房高层有电梯，安装顺利。客户现场试躺了快二十分钟才让师傅走，说太舒服了不想起来。',
    storyWhy: '王先生和太太在三个品牌之间对比了快一个月。之前一直认为软床垫伤腰，来店里试了才发现好的软床垫是有支撑层的，不是那种一躺就陷下去的软。',
    storyFocus: '最关注软硬度平衡。王先生喜欢软一点的包裹感，太太担心腰部支撑不够。两人一起在店里试了软款和中软款各15分钟。',
    storyReason: '最终选了梵璞·怡然软款。独立袋装弹簧提供了足够的腰部支撑，天然乳胶层又给了王先生喜欢的柔软包裹感。导购让他们侧躺试了十分钟，太太说翻身的时候腰没有被顶起来的感觉，才放心选软款。',
    storyFeedback: '送货后一周回访，王先生说「现在早上起来肩膀不酸了，而且翻身不会吵到太太」。太太说「之前担心太软，现在睡了快半个月腰没疼过，白担心了」。',
    storyPublic: '适合公开传播',
    reviewStatus: 'approved',
    reviewNote: '案例故事完整，产品对比有理有据，客户反馈真实。已发放积分。',
    salesPoints: 25,
    installerPoints: 15,
    storePoints: 20,
    createdAt: '2026-05-15 10:30',
    productName: 'TEMPUR Pro 梵璞·怡然',
    productSeries: 'TEMPUR Pro 梵璞·怡然',
    productCategory: '床垫',
    productModel: '梵璞·怡然 软款 25cm',
    keywords: ['TEMPUR Pro', '梵璞·怡然', '床垫', 'TEMPUR', '软款', '新房装修'],
    privacyChecks: { hasFace: false, hasDoorNumber: false, hasPhoneOrAddress: false, hasDeliveryDocOrContract: false, hasPriceInfo: false, hasCompetitorBrand: false, hasClutteredScene: false },
  },
  {
    id: 'd102',
    storeId: 'store_nj', storeName: '南京体验店',
    salesId: 'sales_zhang', salesName: '张顾问',
    installerId: 'installer_liu', installerName: '刘师傅',
    customerAlias: '李女士',
    city: '南京',
    district: '建邺区',
    scene: '夫妻主卧',
    brand: 'TEMPUR',
    model: '梵璞·怡然 中软款 25cm',
    size: '1.8m × 2.0m',
    customerRequirement: '夫妻对床垫硬度偏好不同。先生体重偏重喜欢硬一点的支撑感，太太体型偏瘦喜欢软一点的包裹感。两人为选床垫争执不下，需要一个双方都能接受的方案。',
    authStatus: '可公开使用',
    installImages: [deliveryImg(17, 800, 600), deliveryImg(18, 800, 600), deliveryImg(19, 800, 600)],
    installStatus: 'completed',
    installNote: '客户家在十楼有电梯，安装过程顺利。师傅让夫妻两人都现场试躺确认满意后才离开。',
    storyWhy: '李女士和先生前后来了店里四次。前三次都在纠结硬度，选了硬款太太觉得硌，选了软款先生觉得腰悬空。第四次两人专门挑了周末下午，在店里试了一个多小时。',
    storyFocus: '最关注的是「一张床垫怎么同时满足两个人的硬度需求」。导购建议选中软款，两人各躺十分钟以上，用平时睡觉的姿势去感受。',
    storyReason: '梵璞·怡然中软款的独立袋装弹簧很关键——每个弹簧独立响应压力，先生体重重的位置支撑更实，太太体重轻的位置感觉更软。等于一张床垫自动适应两个人的体重，不需要互相迁就。乳胶层又保证了侧睡的肩部舒适度。',
    storyFeedback: '送货一周后李女士发来消息：「太神奇了，之前我们俩一翻身对方就醒，现在基本感觉不到了。而且我侧睡肩膀不麻了，他说腰那边有支撑不会悬着。终于不用讨论换床垫的事了！」',
    storyPublic: '适合公开传播',
    reviewStatus: 'approved',
    reviewNote: '夫妻硬度偏好冲突的场景很有代表性，故事真实。已发放积分。',
    salesPoints: 25,
    installerPoints: 15,
    storePoints: 20,
    createdAt: '2026-05-16 14:00',
    productName: 'TEMPUR Pro 梵璞·怡然',
    productSeries: 'TEMPUR Pro 梵璞·怡然',
    productCategory: '床垫',
    productModel: '梵璞·怡然 中软款 25cm',
    keywords: ['TEMPUR Pro', '梵璞·怡然', '床垫', 'TEMPUR', '中软款', '夫妻', '独立袋装弹簧'],
    privacyChecks: { hasFace: false, hasDoorNumber: false, hasPhoneOrAddress: false, hasDeliveryDocOrContract: false, hasPriceInfo: false, hasCompetitorBrand: false, hasClutteredScene: false },
  },
  {
    id: 'd103',
    storeId: 'store_sz', storeName: '苏州体验店',
    salesId: 'sales_li', salesName: '李顾问',
    installerId: 'installer_wang', installerName: '王师傅',
    customerAlias: '陈姐',
    city: '苏州',
    district: '吴江区',
    scene: '旧床换新',
    brand: 'TEMPUR',
    model: 'Pro Air 梵璞·怡风',
    size: '1.5m × 2.0m',
    customerRequirement: '陈姐特别怕热，一到夏天旧床垫就闷汗，半夜经常热醒翻来覆去。这次换床垫最看重的就是透气性和凉爽感，其次才是支撑和舒适。',
    authStatus: '可公开使用',
    installImages: [deliveryImg(20, 800, 600), deliveryImg(21, 800, 600)],
    installStatus: 'completed',
    installNote: '客户家在多层三楼，搬运方便。五月天气已经开始热了，师傅安装完陈姐当场摸了床垫表面说确实凉凉的。',
    storyWhy: '陈姐之前那张床垫是三四年前随便买的，夏天背面闷热难忍，只能铺凉席，但凉席又硬又不舒服。今年下定决心换一张专门针对透气性设计的床垫。',
    storyFocus: '核心关注两点：一是面料是不是真的有凉感，二是透气层能不能把身体的热气排出去，而不是闷在床垫里。陈姐说「夏天不开空调的时候躺下去，能明显感觉到凉不凉」。',
    storyReason: '推荐了Pro Air梵璞·怡风。这款用的凉感面料触感就有降温效果，加上内部透气通道设计加快空气流通，热气和湿气不容易积聚。陈姐在店里试躺了二十多分钟，说背面没有发热的感觉，当场就定了。',
    storyFeedback: '安装后第三天陈姐发来消息：「昨天晚上没开空调只开了风扇，居然没热醒！后背不闷汗了，摸床单也是干爽的。早知道早换了，白受了好几个夏天的罪。」',
    storyPublic: '适合公开传播',
    reviewStatus: 'approved',
    reviewNote: '易出汗客户的真实需求场景，产品卖点匹配用户痛点。已发放积分。',
    salesPoints: 25,
    installerPoints: 15,
    storePoints: 20,
    createdAt: '2026-05-17 09:15',
    productName: 'Pro Air 梵璞·怡风',
    productSeries: 'Pro Air 梵璞·怡风',
    productCategory: '床垫',
    productModel: 'Pro Air 梵璞·怡风',
    keywords: ['Pro Air', '梵璞·怡风', '床垫', 'TEMPUR', '透气', '凉感', '夏季'],
    privacyChecks: { hasFace: false, hasDoorNumber: false, hasPhoneOrAddress: false, hasDeliveryDocOrContract: false, hasPriceInfo: false, hasCompetitorBrand: false, hasClutteredScene: false },
  },
  {
    id: 'd104',
    storeId: 'store_nj', storeName: '南京体验店',
    salesId: 'sales_zhang', salesName: '张顾问',
    installerId: 'installer_liu', installerName: '刘师傅',
    customerAlias: '赵先生',
    city: '南京',
    district: '秦淮区',
    scene: '父母房',
    brand: 'TEMPUR',
    model: 'TEMPUR FORM™ 芸枫系列 25cm',
    size: '1.5m × 2.0m',
    customerRequirement: '赵先生父亲退休后腰部不适加重，早上起床要扶着床沿缓好一会儿才能站直。旧床垫用了快十年中间明显塌陷。赵先生想给父亲换一张腰部支撑好的床垫。',
    authStatus: '可公开使用',
    installImages: [deliveryImg(22, 800, 600), deliveryImg(23, 800, 600), deliveryImg(24, 800, 600)],
    installStatus: 'completed',
    installNote: '老小区二楼无电梯但搬运方便。老人很仔细，师傅安装的时候全程在旁边看，装完还用手按了按不同位置试弹性。',
    storyWhy: '赵老先生退休前是中学教师，长期站着上课本来腰椎就不好，退休后旧床垫又塌了，每天早上起床成了最痛苦的事。赵先生带父亲跑了三家店，老人家每一张床垫都要躺十分钟以上才给评价。',
    storyFocus: '老先生最在意的是「腰部这里有没有东西撑着」。他自己总结了一套判断标准：平躺的时候手掌插进腰和床垫之间的缝隙，如果手掌能轻松进去就没支撑，有阻力才算到位。',
    storyReason: '最终选了TEMPUR FORM芸枫系列，因为芸枫用了双层独立弹簧+高密度支撑棉的组合，腰部区域做了针对性加固。老先生躺上去手掌插不进去，说「这就对了，感觉腰后面有东西托着」。而且边缘加固做得扎实，老人起夜的时候坐床边不会滑。',
    storyFeedback: '安装后第十天赵先生来店里道谢：「我爸说现在早上起来可以直接站起来，不用扶床沿了。他说睡了十年才发现之前那根本不叫床垫。」',
    storyPublic: '适合公开传播',
    reviewStatus: 'approved',
    reviewNote: '老人腰部支撑需求典型，客户自创的"手掌测试法"有传播力。已发放积分。',
    salesPoints: 25,
    installerPoints: 15,
    storePoints: 20,
    createdAt: '2026-05-18 11:00',
    productName: 'TEMPUR FORM™ 芸枫系列',
    productSeries: 'TEMPUR FORM™ 芸枫系列',
    productCategory: '床垫',
    productModel: 'TEMPUR FORM™ 芸枫系列 25cm',
    keywords: ['TEMPUR FORM', '芸枫系列', '床垫', 'TEMPUR', '腰部支撑', '老人', '父母房'],
    privacyChecks: { hasFace: false, hasDoorNumber: false, hasPhoneOrAddress: false, hasDeliveryDocOrContract: false, hasPriceInfo: false, hasCompetitorBrand: false, hasClutteredScene: false },
  },
  {
    id: 'd105',
    storeId: 'store_sz', storeName: '苏州体验店',
    salesId: 'sales_zhang', salesName: '张顾问',
    installerId: 'installer_wang', installerName: '王师傅',
    customerAlias: '张姐',
    city: '苏州',
    district: '虎丘区',
    scene: '客户卧室实拍',
    brand: 'TEMPUR',
    model: 'ErgoPlus 感温舒颈枕',
    size: '标准尺寸 65cm × 40cm',
    customerRequirement: '张姐长期在办公室看电脑，颈椎一直不舒服，偶尔还会手麻。睡眠姿势是侧睡为主，晚上经常要换两三个枕头调整高度。医生建议她换一个能固定颈部曲线的枕头。',
    authStatus: '可公开使用',
    installImages: [pillowImg(0, 800, 600), bedImg(10, 800, 600), bedImg(11, 800, 600)],
    installStatus: 'completed',
    installNote: '张姐是门店老客户介绍来的，到店时特意带了平时穿的睡衣来试枕。导购帮她测了肩宽和颈部曲线后才推荐型号。',
    storyWhy: '张姐之前买枕头基本是超市随便拿的，要么太高侧睡脖子被顶着，要么太低头陷下去颈椎悬空。换过的枕头不下五六个，最贵的八百多也没解决问题。后来同事推荐来店里看看专业的枕头。',
    storyFocus: '张姐最在意的是侧睡时颈椎能不能保持在一条直线上——因为侧睡肩宽会抬高头部，如果枕头高度不够或者材质太软压下去，颈椎就会歪。导购现场用肩宽测试帮她确定了合适的高度。',
    storyReason: '推荐了感温舒颈枕。核心原因：一是它会根据体温微调形状，正好贴合颈部曲线，不像普通记忆棉那样冬天硬夏天软；二是蝴蝶形设计侧睡的时候肩膀不会压到枕边，颈椎能保持在自然位置。张姐试了十分钟侧睡姿势说「脖子第一次有被东西稳稳托住的感觉」。',
    storyFeedback: '使用一周后张姐发来反馈：「早上起来脖子不那么僵硬了，手麻的频率也少了。最明显的是睡觉踏实了，半夜不用翻来覆去换枕头。我老公现在也想要一个。」',
    storyPublic: '适合公开传播',
    reviewStatus: 'approved',
    reviewNote: '枕头类案例，填补了现有案例的产品品类空白。颈椎+侧睡场景典型。已发放积分。',
    salesPoints: 20,
    installerPoints: 5,
    storePoints: 15,
    createdAt: '2026-05-19 15:45',
    productName: 'TEMPUR ErgoPlus™ Pillow 感温舒颈枕',
    productSeries: 'TEMPUR ErgoPlus™ Pillow 感温舒颈枕',
    productCategory: '枕头',
    productModel: 'ErgoPlus 感温舒颈枕',
    keywords: ['ErgoPlus', '感温舒颈枕', '枕头', 'TEMPUR', '颈椎', '侧睡', '温感'],
    privacyChecks: { hasFace: false, hasDoorNumber: false, hasPhoneOrAddress: false, hasDeliveryDocOrContract: false, hasPriceInfo: false, hasCompetitorBrand: false, hasClutteredScene: false },
  },
];

// ========== 素材数据 ==========
export const mockMaterials: Material[] = [
  {
    id: 'm1', title: '新家入住第一晚，好睡眠从一张好床垫开始',
    content: '客户李姐今天发来照片，新家入住第一晚，她说「终于睡了一个好觉」。\n\n好的床垫不需要适应期，躺下去那一刻你就知道——对了。\n\n#苏州好床垫 #新家入住 #好睡眠',
    xhsContent: '新家入住第一晚🏠\n换了这张床垫后，睡眠质量直接翻倍✨\n\n客户李姐的反馈：\n「终于睡了一个好觉，腰不酸了」\n\n好床垫的标准其实很简单——\n躺下去那一刻，你就知道对了💯\n\n#新家入住 #卧室改造 #床垫推荐 #好睡眠',
    images: [bedImg(0), bedImg(1), bedImg(2)], category: 'moments', categoryLabel: '朋友圈素材',
    platforms: ['微信朋友圈'], scene: '客户案例',
    usageTip: '建议晚上 8-10 点发布，配上一张客户家的实拍图效果最好。记得 @客户，客户会很开心帮你转发。',
    isRecommended: true, createdAt: '2026-05-12',
    productName: 'TEMPUR FORM™ 芸枫系列', productSeries: 'TEMPUR FORM™ 芸枫系列', productCategory: '床垫', productModel: '',
    keywords: ['TEMPUR FORM', '芸枫系列', '床垫', 'TEMPUR', '泰普尔', '朋友圈素材', '客户案例', '新家入住'],
  },
  {
    id: 'm2', title: '客户说：这张床垫是我今年最值得的投资',
    content: '王先生上个月买了我们的深睡系列，今天特意来店里说：「以前每天醒来腰酸背痛，现在早上都不想起来了。」\n\n我们一天有三分之一的时间在床上度过，一张好床垫不是消费，是投资。',
    images: [mattressImg(0), storeImg(0)], category: 'moments', categoryLabel: '朋友圈素材',
    platforms: ['微信朋友圈'], scene: '客户见证',
    usageTip: '配上客户在店里的实拍照片会更真实，建议先征求客户同意再发。',
    isRecommended: true, createdAt: '2026-05-11',
    productName: 'TEMPUR Pro 梵璞系列', productSeries: 'TEMPUR Pro 梵璞系列', productCategory: '床垫', productModel: '',
    keywords: ['TEMPUR Pro', '梵璞系列', '床垫', 'TEMPUR', '泰普尔', '朋友圈素材', '客户见证'],
  },
  {
    id: 'm3', title: '周末到店试睡，免费体验半小时',
    content: '这个周末，来我们店里试睡吧！\n\n不是躺一下就走，是真的躺 30 分钟。\n\n地址：苏州工业园区××路××号',
    images: [storeImg(1), storeImg(2)], category: 'moments', categoryLabel: '朋友圈素材',
    platforms: ['微信朋友圈'], scene: '门店活动',
    usageTip: '加上门店地址定位，周末发布效果更好。可以在评论区和客户互动。',
    isRecommended: true, createdAt: '2026-05-10',
    productName: 'TEMPUR® North 泰普尔极光系列', productSeries: 'TEMPUR® North 泰普尔极光系列', productCategory: '床垫', productModel: '',
    keywords: ['TEMPUR North', '泰普尔极光', '极光系列', '床垫', 'TEMPUR', '泰普尔', '朋友圈素材', '门店活动'],
  },
  {
    id: 'm4', title: '夏季床品搭配指南：清凉一夏',
    content: '天气热了，给大家推荐几组夏季床品搭配：\n\n1. 天丝四件套 + 乳胶枕——透气凉爽\n2. 冰丝凉席 + 记忆棉床垫——软硬适中\n3. 纯棉床笠 + 羽丝绒枕——吸湿亲肤',
    images: [bedImg(3), bedImg(4), bedImg(5)], category: 'moments', categoryLabel: '朋友圈素材',
    platforms: ['微信朋友圈'], scene: '知识科普',
    usageTip: '可以在评论区和客户互动，收集他们的偏好，后续精准推荐。',
    isRecommended: false, createdAt: '2026-05-08',
    productName: 'Pro 梵璞·怡然', productSeries: 'Pro 梵璞·怡然', productCategory: '床垫', productModel: '',
    keywords: ['Pro 梵璞·怡然', '梵璞·怡然', '床垫', 'TEMPUR', '泰普尔', '朋友圈素材', '知识科普', '夏季床品'],
  },
  {
    id: 'm5', title: '送货师傅的一天：用心服务每一位客户',
    content: '今天跟车送货，师傅从早上 7 点忙到晚上 8 点。\n\n每张床垫上楼前先检查包装，进门戴鞋套，安装完把旧床垫帮忙搬下楼。',
    images: [deliveryImg(0, 800, 600), deliveryImg(1, 800, 600), deliveryImg(2, 800, 600)], category: 'moments', categoryLabel: '朋友圈素材',
    platforms: ['微信朋友圈'], scene: '品牌故事',
    usageTip: '这类真实故事最容易引发共鸣，建议在送货当天发，配现场实拍图。',
    isRecommended: false, createdAt: '2026-05-06',
    productName: '梵璞·怡然酷爽系列', productSeries: '梵璞·怡然酷爽系列', productCategory: '床垫', productModel: '',
    keywords: ['梵璞·怡然', '酷爽系列', '床垫', 'TEMPUR', '泰普尔', '朋友圈素材', '送货实拍', '品牌故事'],
  },
  {
    id: 'm6', title: '卧室改造 | 换了这张床垫后睡眠质量飙升',
    content: '用了 3 年的旧床垫终于换掉了！',
    xhsContent: '🏠 卧室改造第 1 步：换床垫！\n\n之前那个床垫睡了 3 年，中间已经塌了😭\n每天起来腰酸背痛，还以为是年纪大了…\n\n上周末去店里试了 8 款床垫\n最后选了 Pro Air 梵璞·怡风\n\n✨ 睡了 7 天后的感受：\n• 翻身次数少了，深度睡眠时间变长\n• 早上起来腰不酸了\n• 老公打鼾都减轻了\n\n#卧室改造 #床垫推荐 #睡眠好物 #家居好物',
    images: [bedImg(6), bedImg(7), mattressImg(1), mattressImg(2)], category: 'xhs', categoryLabel: '小红书素材',
    platforms: ['小红书'], scene: '客户案例',
    usageTip: '小红书封面图要干净、明亮、有生活气息。用 3:4 竖图效果最好。',
    isRecommended: true, createdAt: '2026-05-12',
    productName: 'Pro Air 梵璞·怡风', productSeries: 'Pro Air 梵璞·怡风', productCategory: '床垫', productModel: '',
    keywords: ['Pro Air', '梵璞·怡风', '床垫', 'TEMPUR', '泰普尔', '小红书素材', '客户案例', '卧室改造'],
  },
  {
    id: 'm7', title: '被问了 800 遍的床垫，今天一次性说清楚',
    content: '这款床垫从去年火到今年',
    xhsContent: '🔥 被问了 800 遍的床垫，今天一次性说清楚！\n\n每次发卧室照片都有姐妹问床垫\n今天认真写一篇，建议收藏⭐\n\n🛏 品牌：××家居\n📐 尺寸：1.8m × 2.0m\n💰 价格：4280 元\n\n✅ 优点：\n• 独立袋装弹簧，翻身不影响另一半\n• 表层是天然乳胶，透气不闷热\n\n#床垫测评 #家居好物分享 #卧室好物',
    images: [mattressImg(3), mattressImg(4), mattressImg(5)], category: 'xhs', categoryLabel: '小红书素材',
    platforms: ['小红书'], scene: '产品测评',
    usageTip: '小红书用户喜欢看真实的优缺点，不要只说好话。真实感 > 精致感。',
    isRecommended: true, createdAt: '2026-05-11',
    productName: 'TEMPUR FORM™ 芸枫系列', productSeries: 'TEMPUR FORM™ 芸枫系列', productCategory: '床垫', productModel: '',
    keywords: ['TEMPUR FORM', '芸枫系列', '床垫', 'TEMPUR', '泰普尔', '小红书素材', '产品测评'],
  },
  {
    id: 'm8', title: '新家装修日记 | 主卧床垫开箱',
    content: '装修终于到了买床垫这一步！',
    xhsContent: '📦 装修进度 80%：今天主卧床垫到了！\n\n最后选了这款，原因很简单：\n躺上去 5 分钟就想睡觉了😂\n\n送货师傅很专业，进门戴鞋套\n帮我把旧床垫也搬走了，好评！\n\n#装修日记 #新家入住 #床垫开箱',
    images: [deliveryImg(3, 800, 600), deliveryImg(4, 800, 600), deliveryImg(5, 800, 600)], category: 'xhs', categoryLabel: '小红书素材',
    platforms: ['小红书'], scene: '开箱体验',
    usageTip: '开箱类内容在小红书很受欢迎，建议用 4 张以上图呈现从拆箱到使用的完整过程。',
    isRecommended: false, createdAt: '2026-05-09',
    productName: 'Pro 梵璞·怡然', productSeries: 'Pro 梵璞·怡然', productCategory: '床垫', productModel: '',
    keywords: ['Pro 梵璞·怡然', '梵璞·怡然', '床垫', 'TEMPUR', '泰普尔', '小红书素材', '开箱体验', '装修日记'],
  },
  {
    id: 'm9', title: '租房改造 | 百元提升卧室幸福感',
    content: '租房党看过来！',
    xhsContent: '💡 租房党必看！百元内提升卧室幸福感的小物\n\n#租房改造 #卧室好物 #出租屋改造',
    images: [bedImg(8), bedImg(9)], category: 'xhs', categoryLabel: '小红书素材',
    platforms: ['小红书'], scene: '知识科普',
    usageTip: '平价、实用、颜值高是小红书租房内容的核心关键词。',
    isRecommended: false, createdAt: '2026-05-07',
    productName: 'TEMPUR Pro 梵璞系列', productSeries: 'TEMPUR Pro 梵璞系列', productCategory: '床垫', productModel: '',
    keywords: ['TEMPUR Pro', '梵璞系列', '床垫', 'TEMPUR', '泰普尔', '小红书素材', '租房改造'],
  },
  {
    id: 'm10', title: '你的床垫真的适合你吗？3 个自测方法',
    content: '很多人睡不好不是身体问题，是床垫问题。',
    xhsContent: '😴 睡不好？可能是床垫的锅！3 个自测方法\n\n#睡眠科普 #床垫怎么选 #健康睡眠',
    images: [detailImg(0), detailImg(1)], category: 'xhs', categoryLabel: '小红书素材',
    platforms: ['小红书'], scene: '知识科普',
    usageTip: '科普类内容自带收藏属性，是引流利器。',
    isRecommended: false, createdAt: '2026-05-05',
    productName: 'TEMPUR® North 泰普尔极光系列', productSeries: 'TEMPUR® North 泰普尔极光系列', productCategory: '床垫', productModel: '',
    keywords: ['TEMPUR North', '泰普尔极光', '极光系列', '床垫', 'TEMPUR', '泰普尔', '小红书素材', '知识科普', '睡眠科普'],
  },
  {
    id: 'm11', title: '床垫拆盲盒：一刀切开看里面长什么样',
    content: '一刀切开看里面长什么样',
    dyScript: '【视频脚本】床垫拆盲盒\n⏱ 时长：30-45 秒\n🎵 BGM：轻快节奏\n\n【0-5秒】开场\n"今天带大家看看，4000块的床垫里面到底长什么样"\n\n【5-15秒】切开过程\n特写镜头：切开的过程\n\n【15-25秒】展示内部结构\n- 面料层- 乳胶层- 弹簧层\n\n【25-35秒】总结\n"4000块，这个做工你觉得值吗？"',
    images: [factoryImg(0), factoryImg(1)], category: 'douyin', categoryLabel: '抖音素材',
    platforms: ['抖音', '视频号'], scene: '产品展示',
    usageTip: '抖音前 3 秒决定完播率，视觉冲击力强的开场最容易留住用户。',
    isRecommended: true, createdAt: '2026-05-12',
    productName: 'Pro 梵璞·怡然', productSeries: 'Pro 梵璞·怡然', productCategory: '床垫', productModel: '',
    keywords: ['Pro 梵璞·怡然', '梵璞·怡然', '床垫', 'TEMPUR', '泰普尔', '抖音素材', '产品展示'],
  },
  {
    id: 'm12', title: '一镜到底看工厂：一张床垫是怎么做出来的',
    content: '一张床垫是怎么做出来的',
    dyScript: '【视频脚本】一镜到底看工厂\n⏱ 时长：45-60 秒\n🎵 BGM：工业风节奏感\n\n【0-5秒】开场\n工厂外景 → 推门进入\n\n【5-20秒】生产线\n一镜到底穿越生产线\n\n【35-45秒】成品出库\n"从工厂到你家，每一张床垫都经得起考验"',
    images: [factoryImg(2), factoryImg(3)], category: 'douyin', categoryLabel: '抖音素材',
    platforms: ['抖音', '视频号'], scene: '工厂实拍',
    usageTip: '工厂类内容在抖音有天然的信任感加成。',
    isRecommended: false, createdAt: '2026-05-10',
    productName: '梵璞·怡然酷爽系列', productSeries: '梵璞·怡然酷爽系列', productCategory: '床垫', productModel: '',
    keywords: ['梵璞·怡然', '酷爽系列', '床垫', 'TEMPUR', '泰普尔', '抖音素材', '工厂实拍'],
  },
  {
    id: 'm13', title: '导购小姐姐的日常：一天接待 20 组客户',
    content: '一天接待 20 组客户是什么体验',
    dyScript: '【视频脚本】导购日常 Vlog\n⏱ 时长：30-40 秒\n🎵 BGM：轻松日常系\n\n【0-3秒】开场\n"早上 9 点，开始营业"\n\n【3-15秒】接待片段\n快剪多个接待场景\n\n【25-35秒】下班\n"晚上 9 点，下班。"',
    images: [storeImg(3), storeImg(4)], category: 'douyin', categoryLabel: '抖音素材',
    platforms: ['抖音', '视频号'], scene: '人物故事',
    usageTip: '人物 IP 类内容最容易建立信任。',
    isRecommended: false, createdAt: '2026-05-08',
    productName: 'Pro Air 梵璞·怡风', productSeries: 'Pro Air 梵璞·怡风', productCategory: '床垫', productModel: '',
    keywords: ['Pro Air', '梵璞·怡风', '床垫', 'TEMPUR', '泰普尔', '抖音素材', '人物故事'],
  },
  {
    id: 'm14', title: '客户问「你们家床垫和某品牌比怎么样」',
    content: '记住这个回答框架：不贬低竞品，诚实说差异，引导客户自己感受。',
    images: [storeImg(5)], category: 'script', categoryLabel: '客户话术',
    platforms: ['线下销售'], scene: '销售话术',
    usageTip: '话术是引子，体验才是成交的关键。',
    isRecommended: false, createdAt: '2026-05-05',
    productName: 'TEMPUR ErgoPlus™ Pillow 感温舒颈枕', productSeries: 'TEMPUR ErgoPlus™ Pillow 感温舒颈枕', productCategory: '枕头', productModel: '',
    keywords: ['感温舒颈枕', 'ErgoPlus', '枕头', '销售话术', '线下销售', 'TEMPUR', '泰普尔'],
  },
  {
    id: 'm15', title: '五一焕新季活动海报 + 文案模板',
    content: '五一大促活动素材包，含朋友圈海报、门店横幅、活动话术。',
    images: [storeImg(6), storeImg(7)], category: 'activity', categoryLabel: '活动模板',
    platforms: ['微信朋友圈', '门店展示'], scene: '促销活动',
    usageTip: '活动素材可以提前 3 天预热，活动当天加大发布频率。',
    isRecommended: false, createdAt: '2026-04-28',
    productName: 'TEMPUR® Ergo Smart Base AI 智能床', productSeries: 'TEMPUR® Ergo Smart Base AI 智能床', productCategory: '智能床', productModel: '',
    keywords: ['Ergo Smart Base', 'AI 智能床', '活动模板', '促销活动', '五一', '朋友圈'],
  },
  {
    id: 'm16', title: '苏州园区送货实拍',
    content: '今天苏州园区 3 单送货，全部顺利完成。',
    images: [deliveryImg(6, 800, 600), deliveryImg(7, 800, 600), deliveryImg(8, 800, 600), deliveryImg(9, 800, 600)], category: 'delivery', categoryLabel: '送货实拍',
    platforms: ['微信朋友圈'], scene: '送货实拍',
    usageTip: '送货实拍是朋友圈最真实的内容，直接发原图就很赞。',
    isRecommended: false, createdAt: '2026-05-12',
    productName: 'Pro Air 梵璞·怡风', productSeries: 'Pro Air 梵璞·怡风', productCategory: '床垫', productModel: '',
    keywords: ['Pro Air', '梵璞·怡风', '床垫', '送货实拍', '朋友圈素材', '苏州'],
  },
  {
    id: 'm17', title: '上海浦东送货实拍',
    content: '浦东新区高档小区送货，电梯房 18 楼。',
    images: [deliveryImg(10, 800, 600), deliveryImg(11, 800, 600), deliveryImg(12, 800, 600)], category: 'delivery', categoryLabel: '送货实拍',
    platforms: ['微信朋友圈'], scene: '送货实拍',
    usageTip: '高端小区的送货照片能提升品牌调性。',
    isRecommended: false, createdAt: '2026-05-11',
    productName: 'TEMPUR® North 泰普尔极光系列', productSeries: 'TEMPUR® North 泰普尔极光系列', productCategory: '床垫', productModel: '',
    keywords: ['TEMPUR North', '泰普尔极光', '极光系列', '床垫', '送货实拍', '朋友圈素材', '上海'],
  },
  {
    id: 'm18', title: '杭州西湖区送货实拍',
    content: '老小区 5 楼无电梯，师傅一个人扛上去的。',
    images: [deliveryImg(13, 800, 600), deliveryImg(14, 800, 600), deliveryImg(15, 800, 600)], category: 'delivery', categoryLabel: '送货实拍',
    platforms: ['微信朋友圈'], scene: '送货实拍',
    usageTip: '有故事的送货实拍最容易打动人。',
    isRecommended: false, createdAt: '2026-05-10',
    productName: 'Pro 梵璞·怡然', productSeries: 'Pro 梵璞·怡然', productCategory: '床垫', productModel: '',
    keywords: ['Pro 梵璞·怡然', '梵璞·怡然', '床垫', '送货实拍', '朋友圈素材', '杭州'],
  },
  {
    id: 'm19', title: '工厂生产线实拍',
    content: '带经销商参观工厂生产线，从原材料到成品，每一步都看得见。',
    images: [factoryImg(4), factoryImg(5), factoryImg(6)], category: 'factory', categoryLabel: '工厂案例',
    platforms: ['微信朋友圈', '抖音', '视频号'], scene: '工厂实拍',
    usageTip: '工厂实拍是建立客户信任的有力素材。',
    isRecommended: false, createdAt: '2026-05-09',
    productName: '梵璞·怡然酷爽系列', productSeries: '梵璞·怡然酷爽系列', productCategory: '床垫', productModel: '',
    keywords: ['梵璞·怡然', '酷爽系列', '床垫', '工厂实拍', '朋友圈素材', '抖音'],
  },
  {
    id: 'm20', title: '原材料展示区',
    content: '门店原材料展示区，客户可以亲自触摸感受每一种材料。',
    images: [factoryImg(7), factoryImg(8), factoryImg(9)], category: 'factory', categoryLabel: '工厂案例',
    platforms: ['微信朋友圈', '小红书'], scene: '材料展示',
    usageTip: '原材料展示适合发小红书"探店"类内容。',
    isRecommended: false, createdAt: '2026-05-08',
    productName: 'TEMPUR Pro 梵璞系列', productSeries: 'TEMPUR Pro 梵璞系列', productCategory: '床垫', productModel: '',
    keywords: ['TEMPUR Pro', '梵璞系列', '床垫', '工厂案例', '小红书素材', '材料展示'],
  },
];

// ========== 投稿数据 ==========
export const mockSubmissions: Submission[] = [
  {
    id: 's1', userId: 'dealer001', images: [deliveryImg(0, 800, 600), deliveryImg(1, 800, 600), deliveryImg(2, 800, 600)],
    brand: 'TEMPUR', model: 'TEMPUR FORM™ 芸枫系列床垫', scene: '送货安装', city: '苏州',
    authStatus: '可公开使用', description: '今天给园区客户送货，客户特别满意。',
    status: 'approved', points: 10, createdAt: '2026-05-10',
  },
  {
    id: 's2', userId: 'dealer001', images: [bedImg(3, 800, 600), bedImg(4, 800, 600)],
    brand: 'TEMPUR', model: 'Pro Air 梵璞·怡风', scene: '客户卧室实拍', city: '苏州',
    authStatus: '可公开使用', description: '老客户王姐家卧室实拍，用了半年了。',
    status: 'pending', points: 0, createdAt: '2026-05-12',
  },
  {
    id: 's3', userId: 'dealer001', images: [storeImg(5, 800, 600)],
    brand: 'TEMPUR', model: 'TEMPUR® North 泰普尔极光系列', scene: '门店试睡', city: '苏州',
    authStatus: '不确定，不可公开', description: '客户在店里试睡的照片',
    status: 'rejected', rejectReason: '图片清晰度不够，建议用原图上传。', points: 0, createdAt: '2026-05-08',
  },
];

// ========== 积分流水 ==========
export const mockPointRecords: PointRecord[] = [
  { id: 'p1', userId: 'dealer001', type: 'submission', description: '上传案例通过审核：苏州园区送货实拍', points: 10, createdAt: '2026-05-10 14:30' },
  { id: 'p2', userId: 'dealer001', type: 'login', description: '每日登录奖励', points: 2, createdAt: '2026-05-10 09:15' },
  { id: 'p3', userId: 'dealer001', type: 'submission', description: '上传案例通过审核：客户卧室实拍', points: 10, createdAt: '2026-05-08 16:20' },
  { id: 'p4', userId: 'dealer001', type: 'login', description: '每日登录奖励', points: 2, createdAt: '2026-05-08 08:30' },
  { id: 'p5', userId: 'dealer001', type: 'weekly', description: '上周登录满 5 天奖励', points: 10, createdAt: '2026-05-06 00:01' },
  { id: 'p6', userId: 'dealer001', type: 'submission', description: '上传案例通过审核：门店试睡体验', points: 10, createdAt: '2026-05-05 11:45' },
  { id: 'p7', userId: 'dealer001', type: 'login', description: '每日登录奖励', points: 2, createdAt: '2026-05-05 09:00' },
  { id: 'p8', userId: 'dealer001', type: 'featured', description: '案例被评为精选：送货实拍', points: 20, createdAt: '2026-05-03 15:10' },
  { id: 'p9', userId: 'dealer001', type: 'login', description: '每日登录奖励', points: 2, createdAt: '2026-05-03 08:45' },
  { id: 'p10', userId: 'dealer001', type: 'submission', description: '上传案例通过审核：新品到店实拍', points: 10, createdAt: '2026-05-01 10:30' },
  { id: 'pd1', userId: 'sales_zhang', type: 'delivery_create', description: '创建案例采集任务：TEMPUR FORM™ 芸枫系列', points: 3, createdAt: '2026-05-12 09:30' },
  { id: 'pd2', userId: 'sales_li', type: 'delivery_create', description: '创建案例采集任务：Pro Air 梵璞·怡风', points: 3, createdAt: '2026-05-12 08:00' },
  { id: 'pd3', userId: 'installer001', type: 'install_upload', description: '上传安装照片：王先生-Pro Air 梵璞·怡风', points: 10, createdAt: '2026-05-12 15:00' },
  { id: 'pd4', userId: 'installer001', type: 'install_note', description: '安装状态填写完整：王先生', points: 5, createdAt: '2026-05-12 15:05' },
  { id: 'pd5', userId: 'sales_zhang', type: 'delivery_create', description: '创建案例采集任务：赵姐-TEMPUR® North 泰普尔极光系列', points: 3, createdAt: '2026-05-11 10:00' },
  { id: 'pd6', userId: 'installer001', type: 'install_upload', description: '上传安装照片：赵姐-TEMPUR® North 泰普尔极光系列', points: 10, createdAt: '2026-05-11 14:00' },
  { id: 'pd7', userId: 'installer001', type: 'install_note', description: '安装状态填写完整：赵姐', points: 5, createdAt: '2026-05-11 14:05' },
  { id: 'pd8', userId: 'sales_zhang', type: 'delivery_story', description: '补充成交故事：赵姐-TEMPUR® North 泰普尔极光系列', points: 10, createdAt: '2026-05-11 18:00' },
  { id: 'pd9', userId: 'sales_li', type: 'delivery_create', description: '创建案例采集任务：陈先生-梵璞·怡然酷爽系列', points: 3, createdAt: '2026-05-10 14:00' },
  { id: 'pd10', userId: 'installer001', type: 'install_upload', description: '上传安装照片：陈先生-梵璞·怡然酷爽系列', points: 10, createdAt: '2026-05-10 17:00' },
  { id: 'pd11', userId: 'installer001', type: 'install_note', description: '安装状态填写完整：陈先生', points: 5, createdAt: '2026-05-10 17:05' },
  { id: 'pd12', userId: 'sales_li', type: 'delivery_story', description: '补充成交故事：陈先生-梵璞·怡然酷爽系列', points: 10, createdAt: '2026-05-10 20:00' },
  { id: 'pd13', userId: 'sales_li', type: 'delivery_approved', description: '案例审核通过：陈先生-梵璞·怡然酷爽系列', points: 10, createdAt: '2026-05-11 10:00' },
  { id: 'pd14', userId: 'installer001', type: 'install_featured', description: '安装案例被评为精选：陈先生', points: 20, createdAt: '2026-05-11 10:30' },
  { id: 'pd15', userId: 'sales_li', type: 'sales_featured', description: '销售案例被评为精选：陈先生', points: 20, createdAt: '2026-05-11 10:30' },
  { id: 'pd16', userId: 'dealer001', type: 'store_delivery', description: '门店案例审核通过：陈先生-梵璞·怡然酷爽系列', points: 20, createdAt: '2026-05-11 10:30' },
];

// ========== 排行榜 ==========
export const mockSalesRank: RankItem[] = [
  { rank: 1, userName: '李顾问', userTitle: '苏州体验店', points: 76 },
  { rank: 2, userName: '张顾问', userTitle: '苏州体验店', points: 52 },
  { rank: 3, userName: '王顾问', userTitle: '南京体验店', points: 38 },
  { rank: 4, userName: '刘顾问', userTitle: '南京体验店', points: 25 },
  { rank: 5, userName: '陈顾问', userTitle: '上海旗舰店', points: 18 },
];

export const mockInstallerRank: RankItem[] = [
  { rank: 1, userName: '王师傅', userTitle: '安装团队A · 苏州', points: 85 },
  { rank: 2, userName: '李师傅', userTitle: '安装团队A · 苏州', points: 60 },
  { rank: 3, userName: '刘师傅', userTitle: '安装团队B · 南京', points: 45 },
  { rank: 4, userName: '赵师傅', userTitle: '安装团队C · 上海', points: 32 },
  { rank: 5, userName: '孙师傅', userTitle: '安装团队C · 上海', points: 20 },
];

export const mockStoreRank: RankItem[] = [
  { rank: 1, storeName: '苏州体验店', userName: '', points: 280 },
  { rank: 2, storeName: '南京体验店', userName: '', points: 195 },
  { rank: 3, storeName: '上海旗舰店', userName: '', points: 160 },
  { rank: 4, storeName: '杭州西湖店', userName: '', points: 130 },
  { rank: 5, storeName: '无锡滨湖店', userName: '', points: 95 },
];

export const mockCityRank: RankItem[] = [
  { rank: 1, storeName: '苏州', userName: '', points: 520 },
  { rank: 2, storeName: '南京', userName: '', points: 380 },
  { rank: 3, storeName: '上海', userName: '', points: 310 },
  { rank: 4, storeName: '杭州', userName: '', points: 245 },
  { rank: 5, storeName: '无锡', userName: '', points: 160 },
];

export const mockRankList: RankItem[] = mockStoreRank;

// ========== 本地案例采集任务持久化 ==========
const DELIVERY_TASKS_KEY = 'sct-delivery-tasks';

function normalizeStoredDeliveryTask(item: unknown): DeliveryTask | null {
  if (!item || typeof item !== 'object') return null;
  const task = item as Partial<DeliveryTask>;
  if (!task.id) return null;

  return {
    ...task,
    storeId: task.storeId || '',
    storeName: task.storeName || '',
    salesId: task.salesId || '',
    salesName: task.salesName || '',
    installerId: task.installerId || '',
    installerName: task.installerName || '',
    customerAlias: task.customerAlias || '客户',
    city: task.city || '',
    scene: task.scene || '',
    brand: task.brand || 'TEMPUR',
    model: task.model || '',
    size: task.size || '',
    customerRequirement: task.customerRequirement || '',
    authStatus: task.authStatus || '可公开使用',
    installImages: Array.isArray(task.installImages) ? task.installImages : [],
    installStatus: task.installStatus || '',
    installNote: task.installNote || '',
    storyWhy: task.storyWhy || '',
    storyFocus: task.storyFocus || '',
    storyReason: task.storyReason || '',
    storyFeedback: task.storyFeedback || '',
    storyPublic: task.storyPublic || '',
    reviewStatus: task.reviewStatus || 'draft',
    reviewNote: task.reviewNote || '',
    salesPoints: task.salesPoints || 0,
    installerPoints: task.installerPoints || 0,
    storePoints: task.storePoints || 0,
    createdAt: task.createdAt || new Date().toISOString().slice(0, 10),
    dupRefTaskId: task.dupRefTaskId,
    productName: task.productName || task.model || '',
    productSeries: task.productSeries || '',
    productCategory: task.productCategory || '',
    productModel: task.productModel || task.model || '',
    keywords: Array.isArray(task.keywords) ? task.keywords : [],
    privacyChecks: task.privacyChecks || {
      hasFace: false,
      hasDoorNumber: false,
      hasPhoneOrAddress: false,
      hasDeliveryDocOrContract: false,
      hasPriceInfo: false,
      hasCompetitorBrand: false,
      hasClutteredScene: false,
    },
  } as DeliveryTask;
}

function loadStoredDeliveryTasks(): DeliveryTask[] {
  try {
    const raw = localStorage.getItem(DELIVERY_TASKS_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return parsed
      .map(normalizeStoredDeliveryTask)
      .filter((task): task is DeliveryTask => Boolean(task));
  } catch { return []; }
}

function saveStoredDeliveryTasks(tasks: DeliveryTask[]): void {
  try { localStorage.setItem(DELIVERY_TASKS_KEY, JSON.stringify(tasks)); } catch {}
}

export function getAllDeliveryTasks(): DeliveryTask[] {
  const stored = loadStoredDeliveryTasks();
  const storedById = new Map(stored.map(t => [t.id, t]));
  const mergedMock = mockDeliveryTasks.map(t => storedById.get(t.id) || t);
  const created = stored.filter(t => !mockDeliveryTasks.some(m => m.id === t.id));
  return [...created, ...mergedMock].sort((a, b) => (b.createdAt || '').localeCompare(a.createdAt || ''));
}

export function addDeliveryTask(task: Omit<DeliveryTask, 'id' | 'createdAt'>): DeliveryTask {
  const newTask: DeliveryTask = {
    ...task,
    id: `d-${Date.now()}`,
    createdAt: new Date().toISOString().slice(0, 10),
  };
  saveStoredDeliveryTasks([newTask, ...loadStoredDeliveryTasks()]);
  void syncJson('/api/delivery-tasks', newTask);
  return newTask;
}

export function updateDeliveryTask(id: string, patch: Partial<DeliveryTask>): void {
  const target = getAllDeliveryTasks().find(t => t.id === id);
  if (!target) return;
  const updated = { ...target, ...patch };
  const stored = loadStoredDeliveryTasks();
  const idx = stored.findIndex(t => t.id === id);
  if (idx >= 0) stored[idx] = updated;
  else stored.unshift(updated);
  saveStoredDeliveryTasks(stored);
  void syncJson(`/api/delivery-tasks/${id}`, updated, 'PUT');
}

// ========== 公开案例数据 ==========
const caseSceneLabels: Record<string, string> = {
  '新房主卧': '新房装修', '新房次卧': '新房装修', '旧床换新': '客户卧室',
  '父母房': '老人房', '婚房布置': '婚房', '儿童房': '儿童房',
  '客户卧室实拍': '客户卧室', '客厅': '高端改善', '门店试睡体验': '客户卧室',
};

function toPublicCase(task: DeliveryTask): PublicCase {
  return {
    id: task.id,
    city: task.city,
    district: task.district,
    brand: task.brand,
    model: task.model,
    size: task.size,
    scene: task.scene,
    sceneLabel: caseSceneLabels[task.scene] || '客户卧室',
    customerRequirement: task.customerRequirement,
    requirementTags: task.customerRequirement ? task.customerRequirement.slice(0, 30).split(/[，,。]/).filter(Boolean).slice(0, 3) : [],
    images: task.installImages,
    story: task.storyFeedback || task.storyWhy || '',
    storyTitle: task.storyPublic === '适合公开传播' ? '真实客户案例' : '',
    highlights: task.storyFocus ? [task.storyFocus] : [],
    serviceFlow: ['线上预约', '到店体验', '专业测量', '送货安装', '售后回访'],
    storeName: task.storeName,
    salesName: task.salesName,
    salesId: task.salesId,
    storeId: task.storeId,
    publicVisible: task.reviewStatus === 'approved' && task.authStatus === '可公开使用',
    productName: task.productName,
    productSeries: task.productSeries,
    productCategory: task.productCategory,
    productModel: task.productModel,
    keywords: task.keywords,
  };
}

// 从内部案例中提取公开案例
export const mockPublicCases: PublicCase[] = [
  toPublicCase(mockDeliveryTasks.find(t => t.id === 'd4')!),
  {
    id: 'pc1',
    city: '苏州', district: '工业园区',
    brand: 'TEMPUR', model: 'TEMPUR FORM™ 芸枫系列',
    size: '1.8m × 2.0m',
    scene: '新房主卧', sceneLabel: '新房装修',
    customerRequirement: '新房装修主卧床垫，客户对睡眠质量要求高，试过多家品牌最终选择TEMPUR',
    requirementTags: ['新房主卧', '睡眠质量', '多品牌对比'],
    images: [caseImg(0), caseImg(1), caseImg(2)],
    story: '张女士和先生一起来店里体验，之前已经对比了3个进口品牌。躺上TEMPUR芸枫的瞬间，两人都觉得很特别——那种贴合感和其他品牌完全不同。最终选了整套卧室方案，包括床垫和枕头。',
    storyTitle: '3 个品牌对比后，这对夫妻选了 TEMPUR',
    highlights: ['进口品牌对比', '夫妻共同决策', '整套卧室方案'],
    serviceFlow: ['线上咨询', '到店体验 3 次', '专业睡眠测评', '送货安装', '90天试用'],
    storeName: '苏州体验店', salesName: '张顾问', salesId: 'sales_zhang', storeId: 'store_sz',
    publicVisible: true,
    productName: 'TEMPUR FORM™ 芸枫系列', productSeries: 'TEMPUR FORM™ 芸枫系列', productCategory: '床垫', productModel: '',
    keywords: ['TEMPUR FORM', '芸枫系列', '床垫', 'TEMPUR', '泰普尔', '客户案例', '新房装修'],
  },
  {
    id: 'pc2',
    city: '南京', district: '鼓楼区',
    brand: 'TEMPUR', model: 'Pro 梵璞·怡然',
    size: '1.5m × 2.0m',
    scene: '旧床换新', sceneLabel: '客户卧室',
    customerRequirement: '旧床垫睡了8年塌陷严重，早上起来腰酸背痛，想换一张支撑好的床垫',
    requirementTags: ['旧床换新', '腰酸背痛', '支撑性'],
    images: [caseImg(1), caseImg(2), caseImg(0)],
    story: '刘先生原来那张床垫睡了8年，中间已经明显塌陷。来店里时他说"每天早上起来像被人打了一顿"。试了怡然系列后，他当场就在店里躺着不想起来了。送货后一周回访，他说腰不酸了，老婆也不抱怨他翻身吵人了。',
    storyTitle: '睡了 8 年的旧床垫退役，刘先生的腰终于不疼了',
    highlights: ['旧床垫塌陷', '现场试躺体验', '一周回访好评'],
    serviceFlow: ['线上预约', '到店试躺', '旧床垫回收', '新床垫安装', '7天回访'],
    storeName: '南京体验店', salesName: '张顾问', salesId: 'sales_zhang', storeId: 'store_nj',
    publicVisible: true,
    productName: 'Pro 梵璞·怡然', productSeries: 'Pro 梵璞·怡然', productCategory: '床垫', productModel: '',
    keywords: ['Pro 梵璞·怡然', '梵璞·怡然', '床垫', 'TEMPUR', '客户案例', '旧床换新'],
  },
  {
    id: 'pc3',
    city: '无锡', district: '滨湖区',
    brand: 'TEMPUR', model: 'TEMPUR® North 泰普尔极光系列 + 乳胶枕',
    size: '1.8m × 2.0m',
    scene: '客户卧室实拍', sceneLabel: '客户卧室',
    customerRequirement: '睡眠浅容易醒，想通过升级床垫和枕头改善深度睡眠',
    requirementTags: ['睡眠浅', '深度睡眠', '枕头升级'],
    images: [caseImg(2), caseImg(0), caseImg(1)],
    story: '王女士是典型的"睡眠困难户"，入睡不难但容易醒。我们给她做了睡眠测评，发现主要问题是枕头高度不合适。换了乳胶枕 + TEMPUR® North 泰普尔极光系列 的组合后，她发来睡眠监测截图——深度睡眠从 40 分钟提升到了 1 小时 50 分钟。',
    storyTitle: '从浅睡到深睡，王女士的睡眠翻倍改善',
    highlights: ['睡眠测评', '枕头+床垫组合', '深度睡眠翻倍'],
    serviceFlow: ['睡眠测评', '方案推荐', '到店体验', '送货安装', '30天睡眠跟踪'],
    storeName: '无锡滨湖店', salesName: '李顾问', salesId: 'sales_li', storeId: 'store_sz',
    publicVisible: true,
    productName: 'TEMPUR® North 泰普尔极光系列', productSeries: 'TEMPUR® North 泰普尔极光系列', productCategory: '床垫', productModel: 'TEMPUR® North 泰普尔极光系列',
    keywords: ['TEMPUR North', '泰普尔极光', '极光系列', '床垫', 'TEMPUR', '客户案例', '枕头', '深度睡眠'],
  },
  {
    id: 'pc4',
    city: '上海', district: '浦东新区',
    brand: 'TEMPUR', model: '高端定制系列',
    size: '2.0m × 2.2m',
    scene: '新房主卧', sceneLabel: '高端改善',
    customerRequirement: '高端改善型需求，对品牌、材质、工艺都有很高要求，预算充足',
    requirementTags: ['高端改善', '品牌要求', '定制需求'],
    images: [caseImg(0), caseImg(1), caseImg(2), caseImg(0), caseImg(1)],
    story: '陈总是朋友推荐来的，在浦东有一套大平层正在装修。他对睡眠环境的要求很高——床垫要进口、面料要天然、要有定制服务。我们专程上门测量了卧室尺寸，给出了整套睡眠方案。最终他选了 TEMPUR 高端定制系列，配了两只不同高度的感温枕。',
    storyTitle: '浦东大平层业主的睡眠升级方案',
    highlights: ['大平层装修', '上门测量', '定制睡眠方案', '整套配置'],
    serviceFlow: ['线上咨询', '上门测量', '方案定制', '专车配送', 'VIP安装', '季度保养'],
    storeName: '上海旗舰店', salesName: '王顾问', salesId: 'sales_zhang', storeId: 'store_sz',
    publicVisible: true,
    productName: 'TEMPUR Pro 梵璞系列', productSeries: 'TEMPUR Pro 梵璞系列', productCategory: '床垫', productModel: '高端定制',
    keywords: ['TEMPUR Pro', '梵璞系列', '床垫', 'TEMPUR', '泰普尔', '高端定制', '客户案例', '高端改善'],
  },
  {
    id: 'pc5',
    city: '苏州', district: '吴中区',
    brand: 'TEMPUR', model: '客厅功能沙发 + 电动躺椅',
    size: '三人位 + 单人位',
    scene: '客厅', sceneLabel: '高端改善',
    customerRequirement: '新房客厅配置，想要功能沙发+电动躺椅，兼顾舒适和颜值',
    requirementTags: ['新房配置', '功能沙发', '电动躺椅'],
    images: [caseImg(2), caseImg(1), caseImg(0)],
    story: '孙先生和太太的新房客厅很大，想打造成"家庭影院+会客"双模式。我们推荐了三人位功能沙发搭配单人电动躺椅的方案。孙太太最满意的是沙发的USB充电口设计——"追剧再也不用担心手机没电了"。',
    storyTitle: '家庭影院 + 会客厅，一套沙发两种模式',
    highlights: ['家庭影院', '双模式客厅', 'USB充电', '夫妻满意'],
    serviceFlow: ['到店体验', '方案设计', '上门量尺', '送货安装', '使用指导'],
    storeName: '苏州体验店', salesName: '张顾问', salesId: 'sales_zhang', storeId: 'store_sz',
    publicVisible: true,
    productName: 'TEMPUR® Ergo Smart Base AI 智能床', productSeries: 'TEMPUR® Ergo Smart Base AI 智能床', productCategory: '智能床', productModel: '',
    keywords: ['Ergo Smart Base', 'AI 智能床', '功能沙发', '客厅', '客户案例', '高端改善'],
  },
];

// ========== 客户线索数据 ==========
export const mockLeads: Lead[] = [
  {
    id: 'lead1', customerAlias: '王女士', phone: '139****5678', wechat: 'wangxiaomei',
    city: '苏州', interestedProduct: 'TEMPUR FORM™ 芸枫系列',
    interestType: '预约到店体验', sourceCaseId: 'pc1', sourceSalesId: 'sales_zhang',
    status: '待联系', createdAt: '2026-05-12 14:30',
  },
  {
    id: 'lead2', customerAlias: '赵先生', phone: '138****1234',
    city: '南京', interestedProduct: 'TEMPUR Pro 梵璞·怡然',
    interestType: '咨询同款价格', sourceCaseId: 'pc2',
    status: '已联系', createdAt: '2026-05-12 10:15',
    notes: '客户说周末有空来店里看看，已告知地址',
  },
  {
    id: 'lead3', customerAlias: '陈女士', phone: '186****8899', wechat: 'chenchen_mm',
    city: '无锡', interestedProduct: 'TEMPUR® North 泰普尔极光系列',
    interestType: '睡眠顾问建议', sourceCaseId: 'pc3',
    status: '已到店', createdAt: '2026-05-11 16:00',
    notes: '周末到店体验了，对枕头也有兴趣，下周带先生再来',
  },
  {
    id: 'lead4', customerAlias: '周先生', phone: '150****6789',
    city: '上海', interestedProduct: 'TEMPUR 高端定制',
    interestType: '获取更多案例', sourceCaseId: 'pc4', sourceSalesId: 'sales_zhang',
    status: '已成交', createdAt: '2026-05-10 09:20',
    notes: '看了案例后主动联系，到店2次后成交，金额超预算但客户很满意',
  },
  {
    id: 'lead5', customerAlias: '孙太太', phone: '177****3456', wechat: 'suntai0520',
    city: '苏州', interestedProduct: '功能沙发',
    interestType: '预约到店体验', sourceCaseId: 'pc5', sourceSalesId: 'sales_zhang',
    status: '暂不考虑', createdAt: '2026-05-09 11:45',
    notes: '近期装修暂停，预计3个月后重新启动，到时再联系',
  },
];

export function getPublicCases(): PublicCase[] {
  return mockPublicCases.filter(c => c.publicVisible && c.images.length > 0);
}

// ========== 成交故事合并工具 ==========

export function getStoryText(task: DeliveryTask): string {
  const merged = [
    task.storyWhy,
    task.storyFocus,
    task.storyReason,
    task.storyFeedback,
  ].filter(Boolean).join('\n\n');
  return merged || '';
}

// ========== 客户分享辅助 ==========
export function canShareCase(task: DeliveryTask): boolean {
  if (task.reviewStatus !== 'approved' && task.reviewStatus !== 'featured') return false;
  if (task.authStatus !== '可公开使用') return false;
  if (task.installImages.length === 0) return false;
  if (task.privacyChecks) {
    const pc = task.privacyChecks;
    if (pc.hasFace || pc.hasDoorNumber || pc.hasPhoneOrAddress || pc.hasDeliveryDocOrContract || pc.hasPriceInfo || pc.hasCompetitorBrand || pc.hasClutteredScene) return false;
  }
  return true;
}

export function getShareableCases(): DeliveryTask[] {
  return getAllDeliveryTasks().filter(canShareCase);
}

export function getShareableCasesBySeries(series: string): DeliveryTask[] {
  return getShareableCases().filter(t => t.productSeries === series);
}

export function getShareableCasesByCity(city: string): DeliveryTask[] {
  return getShareableCases().filter(t => t.city === city);
}

export function getShareableCasesByScene(scene: string): DeliveryTask[] {
  return getShareableCases().filter(t => t.scene === scene);
}

// ========== 积分规则 ==========
export const POINTS_RULES = {
  daily_posting: 10,
  xhs_posting: 20,
  dual_platform_bonus: 5,
  upload_case: 5,
  case_approved: 20,
  case_featured: 50,
  material_reuse: 10,
  lead_generated: 100,
};

// ========== 案例币 ==========
export interface CaseCoinRecord {
  id: string;
  userId: string;
  type: 'starter' | 'approved_case' | 'featured_case' | 'saved_by_other' | 'save_single' | 'save_set';
  description: string;
  amount: number;
  relatedCaseId?: string;
  relatedMaterialId?: string;
  createdAt: string;
  status?: 'issued' | 'pending' | 'revoked';
}

export const CASE_COIN_RULES = {
  starter_bonus: 20,
  approved_case: 20,
  featured_case: 30,
  saved_by_other: 2,
  save_single_case: -5,
  save_case_set: -10,
};

const CASE_COIN_KEY = 'sct-case-coin-records';

function loadCaseCoinRecords(): CaseCoinRecord[] {
  try {
    const raw = localStorage.getItem(CASE_COIN_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch { return []; }
}

function saveCaseCoinRecords(records: CaseCoinRecord[]): void {
  try { localStorage.setItem(CASE_COIN_KEY, JSON.stringify(records)); } catch {}
}

export function getCaseCoinBalance(userId: string): number {
  return loadCaseCoinRecords()
    .filter(r => r.userId === userId)
    .reduce((sum, r) => sum + r.amount, 0);
}

export function getCaseCoinRecords(userId: string): CaseCoinRecord[] {
  return loadCaseCoinRecords()
    .filter(r => r.userId === userId)
    .sort((a, b) => b.createdAt.localeCompare(a.createdAt));
}

export function ensureStarterCaseCoins(userId: string): void {
  if (!userId) return;
  const records = loadCaseCoinRecords();
  const alreadyGiven = records.some(r => r.userId === userId && r.type === 'starter');
  if (alreadyGiven) return;
  records.push({
    id: `cc-${Date.now()}`,
    userId,
    type: 'starter',
    description: '新用户注册赠送案例币',
    amount: CASE_COIN_RULES.starter_bonus,
    createdAt: new Date().toISOString(),
  });
  saveCaseCoinRecords(records);
}

export function addCaseCoins(
  userId: string, amount: number, type: CaseCoinRecord['type'],
  description: string, relatedCaseId?: string
): void {
  if (!userId || amount <= 0) return;
  const records = loadCaseCoinRecords();
  records.push({
    id: `cc-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
    userId,
    type,
    description,
    amount,
    relatedCaseId,
    createdAt: new Date().toISOString(),
  });
  saveCaseCoinRecords(records);
}

export function spendCaseCoins(
  userId: string, amount: number, type: CaseCoinRecord['type'],
  description: string, relatedCaseId?: string, relatedMaterialId?: string
): boolean {
  if (!userId || amount >= 0) return false;
  const balance = getCaseCoinBalance(userId);
  if (balance < Math.abs(amount)) return false;
  const records = loadCaseCoinRecords();
  records.push({
    id: `cc-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
    userId,
    type,
    description,
    amount,
    relatedCaseId,
    relatedMaterialId,
    createdAt: new Date().toISOString(),
  });
  saveCaseCoinRecords(records);
  return true;
}

export function canSpendCaseCoins(userId: string, amount: number): boolean {
  return getCaseCoinBalance(userId) >= amount;
}

export function hasUnlockedCaseMaterial(userId: string, materialId: string): boolean {
  if (!userId || !materialId) return false;
  return loadCaseCoinRecords().some(
    r => r.userId === userId && r.relatedMaterialId === materialId && r.amount < 0
  );
}

export function hasCoinAward(userId: string, type: CaseCoinRecord['type'], relatedCaseId: string): boolean {
  if (!userId || !relatedCaseId) return false;
  return loadCaseCoinRecords().some(
    r => r.userId === userId && r.type === type && r.relatedCaseId === relatedCaseId
  );
}

export function getUserIdBySalesId(salesId: string): string {
  return mockSalesPersons.find(s => s.id === salesId)?.userId || '';
}

export function getUserIdByInstallerId(installerId: string): string {
  return mockInstallers.find(i => i.id === installerId)?.userId || '';
}

// ========== 动态积分记录 ==========
const POINT_RECORDS_KEY = 'sct-point-records';

function loadDynamicPointRecords(): PointRecord[] {
  try {
    const raw = localStorage.getItem(POINT_RECORDS_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch { return []; }
}

function saveDynamicPointRecords(records: PointRecord[]): void {
  try { localStorage.setItem(POINT_RECORDS_KEY, JSON.stringify(records)); } catch {}
}

export function getAllPointRecords(userId: string): PointRecord[] {
  const dynamic = loadDynamicPointRecords();
  const combined = [...mockPointRecords, ...dynamic];
  return combined.filter(r => r.userId === userId).sort((a, b) => b.createdAt.localeCompare(a.createdAt));
}

export function addPointRecord(
  userId: string, points: number, type: PointRecord['type'],
  description: string, relatedCaseId?: string
): void {
  if (!userId || points === 0) return;
  const records = loadDynamicPointRecords();
  records.push({
    id: `pr-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
    userId,
    type,
    description,
    points,
    relatedCaseId,
    createdAt: new Date().toISOString().replace('T', ' ').slice(0, 19),
  });
  saveDynamicPointRecords(records);
}

export function hasPointRecord(userId: string, type: PointRecord['type'], relatedCaseId: string): boolean {
  if (!userId || !relatedCaseId) return false;
  const dynamic = loadDynamicPointRecords();
  return mockPointRecords.some(r => r.userId === userId && r.type === type && r.relatedCaseId === relatedCaseId)
    || dynamic.some(r => r.userId === userId && r.type === type && r.relatedCaseId === relatedCaseId);
}

// ========== 安装师傅交付积分 ==========
export interface DeliveryPointRecord {
  id: string;
  userId: string;
  type: 'approved_photo' | 'featured_photo';
  description: string;
  points: number;
  rewardAmount: number;
  relatedCaseId: string;
  createdAt: string;
}

const DELIVERY_POINTS_KEY = 'sct-delivery-points';

function loadDeliveryPointRecords(): DeliveryPointRecord[] {
  try {
    const raw = localStorage.getItem(DELIVERY_POINTS_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch { return []; }
}

function saveDeliveryPointRecords(records: DeliveryPointRecord[]): void {
  try { localStorage.setItem(DELIVERY_POINTS_KEY, JSON.stringify(records)); } catch {}
}

export function addDeliveryPoints(
  userId: string, points: number, type: DeliveryPointRecord['type'],
  description: string, relatedCaseId: string, rewardAmount: number
): void {
  if (!userId || points <= 0) return;
  const records = loadDeliveryPointRecords();
  const alreadyGiven = records.some(
    r => r.userId === userId && r.type === type && r.relatedCaseId === relatedCaseId
  );
  if (alreadyGiven) return;
  records.push({
    id: `dp-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
    userId, type, description, points, rewardAmount, relatedCaseId,
    createdAt: new Date().toISOString(),
  });
  saveDeliveryPointRecords(records);
}

export function getDeliveryPointRecords(userId: string): DeliveryPointRecord[] {
  return loadDeliveryPointRecords()
    .filter(r => r.userId === userId)
    .sort((a, b) => b.createdAt.localeCompare(a.createdAt));
}

export function getDeliveryPointBalance(userId: string): number {
  return loadDeliveryPointRecords()
    .filter(r => r.userId === userId)
    .reduce((sum, r) => sum + r.points, 0);
}

export function getDeliveryRewardSummary(userId: string) {
  const records = loadDeliveryPointRecords().filter(r => r.userId === userId);
  const approvedRecords = records.filter(r => r.type === 'approved_photo');
  const featuredRecords = records.filter(r => r.type === 'featured_photo');
  const approvedCount = approvedRecords.length;
  const featuredCount = featuredRecords.length;
  const totalReward = approvedCount * 5 + featuredCount * 10;
  const totalPoints = records.reduce((sum, r) => sum + r.points, 0);
  return { approvedCount, featuredCount, totalReward, totalPoints };
}

// ========== 成交喜报 ==========
export interface DealReport {
  id: string;
  city: string;
  storeId: string;
  storeName: string;
  salesId: string;
  salesName: string;
  amount: number;
  productName: string;
  productModel: string;
  customerSource: string;
  story: string;
  summary: string;
  relatedCaseId?: string;
  status: 'pending' | 'approved' | 'rejected';
  createdAt: string;
}

export const mockDealReports: DealReport[] = [
  {
    id: 'dr1',
    city: '苏州',
    storeId: 'store_sz',
    storeName: '苏州体验店',
    salesId: 'sales_zhang',
    salesName: '张顾问',
    amount: 33000,
    productName: 'TEMPUR',
    productModel: 'TEMPUR FORM™ 芸枫系列床垫 + 乳胶枕',
    customerSource: '老客户介绍',
    story: '客户前期犹豫，对比了多个品牌。导购持续跟进2周，通过发送真实客户案例和邀请到店试睡体验，逐步建立信任。最终客户被芸枫系列的贴合感打动，连带购买了乳胶枕。',
    summary: '不到最后时刻，不轻易放弃任何一个客户。持续用真实案例建立信任是关键。',
    relatedCaseId: 'task1',
    status: 'approved',
    createdAt: '2026-05-14 10:30',
  },
  {
    id: 'dr2',
    city: '南京',
    storeId: 'store_nj',
    storeName: '南京体验店',
    salesId: 'sales_zhang',
    salesName: '张顾问',
    amount: 28000,
    productName: 'TEMPUR',
    productModel: 'Pro Air 梵璞·怡风 床垫',
    customerSource: '自然进店',
    story: '客户第一次进店只是随便看看，导购耐心讲解了TEMPUR材质特点和护脊优势。一周后客户带着家人再次来店，经过对比体验后当场下单。',
    summary: '专业讲解+耐心跟进，自然进店也能成交高品质客户。',
    status: 'approved',
    createdAt: '2026-05-13 15:20',
  },
  {
    id: 'dr3',
    city: '苏州',
    storeId: 'store_sz',
    storeName: '苏州体验店',
    salesId: 'sales_li',
    salesName: '李顾问',
    amount: 42000,
    productName: 'TEMPUR',
    productModel: 'TEMPUR® North 泰普尔极光系列 + 智能床',
    customerSource: '线上咨询',
    story: '客户通过小红书案例联系到店，对极光系列一见钟情。导购通过分享多个真实交付案例打消客户顾虑，最终成交高端组合。',
    summary: '线上内容种草+线下体验转化，高端产品依然能快速成交。',
    status: 'pending',
    createdAt: '2026-05-15 09:15',
  },
];

const DEAL_REPORT_KEY = 'sct-deal-reports';

function loadDealReports(): DealReport[] {
  try {
    const raw = localStorage.getItem(DEAL_REPORT_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch { return []; }
}

function saveDealReports(reports: DealReport[]): void {
  try { localStorage.setItem(DEAL_REPORT_KEY, JSON.stringify(reports)); } catch {}
}

export function getAllDealReports(): DealReport[] {
  const dynamic = loadDealReports();
  const all = [...mockDealReports, ...dynamic];
  return all.sort((a, b) => b.createdAt.localeCompare(a.createdAt));
}

export function getApprovedDealReports(): DealReport[] {
  return getAllDealReports().filter(r => r.status === 'approved');
}

export function addDealReport(report: Omit<DealReport, 'id' | 'status' | 'createdAt'>): void {
  const reports = loadDealReports();
  const saved = {
    ...report,
    id: `dr-${Date.now()}`,
    status: 'pending' as const,
    createdAt: new Date().toISOString().replace('T', ' ').slice(0, 19),
  };
  reports.push(saved);
  saveDealReports(reports);
  void syncJson('/api/deal-reports', saved);
}

export function updateDealReportStatus(id: string, status: DealReport['status']): void {
  const dynamic = loadDealReports();
  const idx = dynamic.findIndex(r => r.id === id);
  if (idx >= 0) {
    dynamic[idx].status = status;
    saveDealReports(dynamic);
    void syncJson(`/api/deal-reports/${id}/review`, { status }, 'PUT');
    return;
  }
  const mockIdx = mockDealReports.findIndex(r => r.id === id);
  if (mockIdx >= 0) {
    mockDealReports[mockIdx].status = status;
    void syncJson(`/api/deal-reports/${id}/review`, { status }, 'PUT');
  }
}

export function isCaseMaterial(material: Material): boolean {
  if (material.scene.includes('客户案例')) return true;
  if (material.category === 'delivery') return true;
  if (material.categoryLabel.includes('案例')) return true;
  if (material.keywords.some(k => k.includes('客户案例') || k.includes('交付案例'))) return true;
  return false;
}

// ========== 每日发圈状态管理 ==========
const DAILY_POSTING_KEY = (userId: string) => `sct-daily-posting-${userId}`;

export function getDailyPostingState(userId: string): Record<string, 'copied' | 'done'> {
  try {
    const stored = localStorage.getItem(DAILY_POSTING_KEY(userId));
    return stored ? JSON.parse(stored) : {};
  } catch { return {}; }
}

export function getTodayPostingStatus(userId: string): 'idle' | 'copied' | 'done' {
  const today = new Date().toISOString().slice(0, 10);
  return getDailyPostingState(userId)[today] || 'idle';
}

export function markTodayPosting(userId: string, status: 'copied' | 'done'): void {
  const state = getDailyPostingState(userId);
  const today = new Date().toISOString().slice(0, 10);
  state[today] = status;
  localStorage.setItem(DAILY_POSTING_KEY(userId), JSON.stringify(state));
}

export function getMonthlyPostingDays(userId: string): number {
  const state = getDailyPostingState(userId);
  const month = new Date().toISOString().slice(0, 7);
  return Object.entries(state).filter(([date, s]) => date.startsWith(month) && s === 'done').length;
}

export function getConsecutiveDays(userId: string): number {
  const state = getDailyPostingState(userId);
  let count = 0;
  const d = new Date();
  d.setDate(d.getDate() - 1); // start from yesterday
  while (true) {
    const key = d.toISOString().slice(0, 10);
    if (state[key] === 'done') { count++; d.setDate(d.getDate() - 1); }
    else break;
  }
  return count;
}

export function getDailyMaterial(userId: string): Material {
  const recommended = mockMaterials.filter(m => m.isRecommended);
  const today = new Date().toISOString().slice(0, 10);
  const hash = userId.split('').reduce((acc, c) => acc + c.charCodeAt(0), 0);
  const idx = Math.abs(hash + today.length) % recommended.length;
  return recommended[idx];
}

export function getTotalDailyPoints(userId: string): number {
  const state = getDailyPostingState(userId);
  return Object.values(state).filter(s => s === 'done').length * POINTS_RULES.daily_posting;
}

// ========== 小红书内容任务状态管理（独立于朋友圈）==========
const XHS_POSTING_KEY = (userId: string) => `sct-xhs-posting-${userId}`;

function getXhsPostingState(userId: string): Record<string, 'copied' | 'done'> {
  try {
    const stored = localStorage.getItem(XHS_POSTING_KEY(userId));
    return stored ? JSON.parse(stored) : {};
  } catch { return {}; }
}

export function getTodayXhsStatus(userId: string): 'idle' | 'copied' | 'done' {
  const today = new Date().toISOString().slice(0, 10);
  return getXhsPostingState(userId)[today] || 'idle';
}

export function markTodayXhs(userId: string, status: 'copied' | 'done'): void {
  const state = getXhsPostingState(userId);
  const today = new Date().toISOString().slice(0, 10);
  state[today] = status;
  localStorage.setItem(XHS_POSTING_KEY(userId), JSON.stringify(state));
}

export function getMonthlyXhsDays(userId: string): number {
  const state = getXhsPostingState(userId);
  const month = new Date().toISOString().slice(0, 7);
  return Object.entries(state).filter(([date, s]) => date.startsWith(month) && s === 'done').length;
}

export function getXhsWeeklyCount(userId: string): number {
  const state = getXhsPostingState(userId);
  const now = new Date();
  const dayOfWeek = now.getDay();
  const monday = new Date(now);
  monday.setDate(now.getDate() - dayOfWeek + (dayOfWeek === 0 ? -6 : 1));
  monday.setHours(0, 0, 0, 0);
  let count = 0;
  for (let i = 0; i < 7; i++) {
    const d = new Date(monday);
    d.setDate(monday.getDate() + i);
    const key = d.toISOString().slice(0, 10);
    if (state[key] === 'done') count++;
  }
  return count;
}

export function getDailyXhsMaterial(userId: string): Material {
  const xhsMaterials = mockMaterials.filter(m => m.platforms.includes('小红书'));
  if (xhsMaterials.length === 0) {
    // fallback to any material if no xhs-specific ones
    return mockMaterials[mockMaterials.length - 1];
  }
  const today = new Date().toISOString().slice(0, 10);
  const hash = userId.split('').reduce((acc, c) => acc + c.charCodeAt(0), 0);
  const idx = Math.abs(hash + today.length + 7) % xhsMaterials.length; // +7 offset to differ from moments
  return xhsMaterials[idx];
}

// Get today's moments-specific material
export function getDailyMomentsMaterial(userId: string): Material {
  const momentsMaterials = mockMaterials.filter(m => m.platforms.includes('微信朋友圈'));
  if (momentsMaterials.length === 0) return getDailyMaterial(userId); // fallback to existing
  const today = new Date().toISOString().slice(0, 10);
  const hash = userId.split('').reduce((acc, c) => acc + c.charCodeAt(0), 0);
  const idx = Math.abs(hash + today.length) % momentsMaterials.length;
  return momentsMaterials[idx];
}

// ========== 辅助函数 ==========
export function getUserById(userId: string): User | undefined {
  return testUsers.find(u => u.phone === userId);
}

export function getStoreById(storeId: string): Store | undefined {
  return mockStores.find(s => s.id === storeId);
}

export function getSalesByUserId(userId: string): SalesPerson | undefined {
  return mockSalesPersons.find(s => s.userId === userId);
}

export function getInstallerByUserId(userId: string): Installer | undefined {
  return mockInstallers.find(i => i.userId === userId);
}

export function getInstallersByCity(city: string): Installer[] {
  return mockInstallers.filter(i => i.city === city);
}

export function getInstallersByStore(storeId: string): Installer[] {
  return mockInstallers.filter(i => i.serviceStoreIds.includes(storeId));
}

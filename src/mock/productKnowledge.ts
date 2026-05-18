import { productImage } from '../utils/images';
import type { DeliveryTask } from './data';

export type ProductVisibility = 'public' | 'internal';

export interface ProductKnowledge {
  id: string;
  series: string;
  model: string;
  category: '床垫' | '枕头' | '智能床' | '配件';
  firmness?: string;
  image: string;
  coreSellingPoints: string[];
  fitCustomers: string[];
  painPoints: string[];
  salesScript: string;
  objectionReplies: Array<{ question: string; answer: string }>;
  momentsCopy: string;
  xhsCopy: string;
  customerPageCopy: string;
  internalNotes: string;
  sourceDocs: Array<{ name: string; pages: string }>;
  visibility: ProductVisibility;
  keywords: string[];
}

const proDocs = [
  { name: '2025最新培训资料.pdf', pages: 'P80-P116' },
  { name: '2024 TEMPUR 泰普尔 Catalogue.pdf', pages: 'P20-P25' },
];
const formDocs = [
  { name: 'FORM 无价格 15102024-Final.pdf', pages: 'P17-P23' },
  { name: '2024 TEMPUR 泰普尔 Catalogue.pdf', pages: 'P26-P28' },
];
const livingDocs = [{ name: '2024-Tempurliving-catalogue.pdf', pages: 'P3-P10' }];
const pillowDocs = [{ name: 'TEMPUR 产品手册 v01(1).pdf', pages: 'P1-P22' }];

export const productKnowledgeList: ProductKnowledge[] = [
  {
    id: 'tempur-pro-yiran-soft', series: 'TEMPUR Pro 梵璞·怡然', model: '怡然-软', category: '床垫', firmness: '软', image: productImage('tempur-pro-yiran-soft'),
    coreSellingPoints: ['柔软包裹感强，躺下后更容易释放身体压力', '泰普尔材质贴合身形曲线，减少局部压迫感', '适合喜欢放松、包裹、轻盈睡感的客户'],
    fitCustomers: ['偏瘦体型或对硬床敏感的人群', '喜欢柔软包裹感的人群', '睡眠浅、压力大、入睡前不容易放松的人群'],
    painPoints: ['偏硬床垫容易让肩胯腰背有压迫感', '普通软床容易塌陷，缺少稳定承托', '精神压力大，睡前身体很难放松'],
    salesScript: '如果您喜欢柔软一点、包裹感明显一点的睡感，可以重点试一下怡然-软。它不是单纯地软，而是在柔软里保持承托。',
    objectionReplies: [{ question: '软床会不会睡久了没有支撑？', answer: '怡然-软不是塌陷式的软，它会先柔和贴合身体，再给到稳定承托。' }],
    momentsCopy: '真正舒服的软，不是陷进去，而是身体被温柔托住。TEMPUR Pro 梵璞·怡然-软，适合喜欢包裹感、想让身体更快放松的人。',
    xhsCopy: '偏瘦体型选床垫，真的不要盲目追求硬。怡然-软柔软包裹，但腰背不会空，肩膀和胯部也不容易被顶得难受。#床垫推荐 #TEMPUR',
    customerPageCopy: '怡然-软主打柔软包裹与稳定承托，适合偏瘦、压力大、喜欢放松睡感的客户。',
    internalNotes: '', sourceDocs: proDocs, visibility: 'public', keywords: ['怡然', '怡然-软', '软', '偏软', 'Soft', '包裹感', '偏瘦', '减压'],
  },
  {
    id: 'tempur-pro-yiran-medium', series: 'TEMPUR Pro 梵璞·怡然', model: '怡然-中', category: '床垫', firmness: '中', image: productImage('tempur-pro-yiran-medium'),
    coreSellingPoints: ['软硬适中，兼顾舒适包裹和稳固承托', '适配大多数标准体型，是门店主推体验基准款', '适合夫妻双方睡感偏好不完全一致的家庭'],
    fitCustomers: ['第一次体验 TEMPUR 的大多数客户', '标准体型、没有明确软硬偏好的人群', '伴侣体重和睡姿差异较大的家庭'],
    painPoints: ['不知道自己适合软床还是硬床', '夫妻双方睡感偏好不同', '久坐办公后腰背容易疲劳'],
    salesScript: '怡然-中是最适合作为第一张体验床垫的款式。不软不硬，既有泰普尔材质的贴合感，也有稳定的腰背承托。',
    objectionReplies: [{ question: '我和家人体重差异比较大，这款合适吗？', answer: '可以重点试这款。怡然-中对不同体型的适配度更高，适合作为家庭主卧的稳妥选择。' }],
    momentsCopy: '选床垫不一定要一上来就纠结软硬。怡然-中是不容易出错的百搭睡感，柔软贴合和稳固支撑都有。',
    xhsCopy: '不知道买软床还是硬床？可以先试怡然-中。睡感比较平衡，腰背有托住的感觉，肩颈又不会被顶得很硬。#床垫怎么选',
    customerPageCopy: '怡然-中是软硬适中的百搭款，兼顾包裹感与支撑力，适合大多数标准体型客户。',
    internalNotes: '', sourceDocs: proDocs, visibility: 'public', keywords: ['怡然', '怡然-中', '中', '适中', 'Medium', '百搭', '标准体型', '夫妻'],
  },
  {
    id: 'tempur-pro-yiran-medium-firm', series: 'TEMPUR Pro 梵璞·怡然', model: '怡然-中偏硬', category: '床垫', firmness: '中偏硬', image: productImage('tempur-pro-yiran-medium-firm'),
    coreSellingPoints: ['保留熟悉的弹性支撑感，翻身起身更轻松', '比传统硬床更贴合身体曲线，减少悬空感', '适合从弹簧床升级到 TEMPUR 的过渡选择'],
    fitCustomers: ['习惯弹簧床或偏硬床的人群', '不喜欢过深包裹感的人群', '作息不规律、希望起身翻身更轻松的人群'],
    painPoints: ['担心记忆绵包裹感太强', '传统硬床贴合度不够', '睡眠时间不规律，醒来后需要快速清醒'],
    salesScript: '如果您以前一直睡弹簧床，或者不太喜欢陷进去的感觉，怡然-中偏硬会更容易接受。它保留了更清晰的支撑和回弹感。',
    objectionReplies: [{ question: '我不喜欢太包裹的床垫，这款会不会闷？', answer: '这款包裹感相对克制，支撑和回弹更明显，适合从传统弹簧床过渡过来的客户。' }],
    momentsCopy: '很多习惯弹簧床的人，第一次换床垫最怕“陷进去”。怡然-中偏硬保留清晰支撑感，又比传统硬床更贴合身体。',
    xhsCopy: '喜欢硬一点，但又不想睡硬板床？怡然-中偏硬可以试试。它不是硬顶着身体，而是支撑感更明显，翻身轻松。#中偏硬床垫',
    customerPageCopy: '怡然-中偏硬适合喜欢支撑感、习惯弹簧床或担心包裹感过强的客户。',
    internalNotes: '', sourceDocs: proDocs, visibility: 'public', keywords: ['怡然', '怡然-中偏硬', '中偏硬', 'Medium Firm', '弹簧床', '翻身', '支撑'],
  },
  {
    id: 'tempur-pro-yiran-firm', series: 'TEMPUR Pro 梵璞·怡然', model: '怡然-硬', category: '床垫', firmness: '硬', image: productImage('tempur-pro-yiran-firm'),
    coreSellingPoints: ['支撑感更强，适合偏爱硬睡感的客户', '贴合身体曲线，不是传统硬板床的生硬顶托', '适合长辈、大体重或重视腰背支撑的人群'],
    fitCustomers: ['长期习惯硬床的人群', '大体重或偏爱稳固支撑的人群', '给长辈、青少年或客房选择床垫的家庭'],
    painPoints: ['软床下陷明显，腰背缺少安全感', '硬板床太生硬，身体曲线贴合不足', '长辈睡眠时间短，希望有限睡眠更踏实'],
    salesScript: '怡然-硬适合明确喜欢硬一点、稳一点的客户。它不是像硬板床那样顶着身体，而是在更强支撑的基础上仍然贴合腰背。',
    objectionReplies: [{ question: '硬床是不是对腰更好？', answer: '关键不是越硬越好，而是既要托住腰背，也要贴合身体曲线。' }],
    momentsCopy: '给长辈选床垫，很多人第一反应是“要硬一点”。但好床垫不是硬顶，而是稳稳托住。怡然-硬支撑感更强。',
    xhsCopy: '偏爱硬床的人可以看看怡然-硬。它的感觉是稳、托得住，但不是硬板床那种硌人的硬。#硬床垫 #长辈床垫',
    customerPageCopy: '怡然-硬主打更强支撑与稳固睡感，适合偏爱硬床、长辈或大体重客户。',
    internalNotes: '', sourceDocs: proDocs, visibility: 'public', keywords: ['怡然', '怡然-硬', '硬', '偏硬', 'Firm', '长辈', '大体重', '腰背支撑'],
  },
  {
    id: 'tempur-pro-air-yifeng-medium', series: 'TEMPUR Pro Air 梵璞·怡风', model: '怡风-中', category: '床垫', firmness: '中', image: productImage('tempur-pro-air-yifeng-medium'),
    coreSellingPoints: ['主打透气凉爽，适合怕热、易出汗客户', '呼吸材质帮助热量散发，减少夜间闷热感', 'QuickRefresh Air 床垫套，40度以下可水洗'],
    fitCustomers: ['怕热、易出汗、夏天睡眠容易被热醒的人群', '偏胖体质或喜欢清爽睡感的人群', '南方潮湿环境、主卧通风一般的家庭'],
    painPoints: ['夜间闷热出汗，睡眠被打断', '传统包裹型床垫容易积热', '希望床垫既有贴合感又更清爽透气'],
    salesScript: '如果客户提到怕热、出汗、夏天睡不好，优先让他试怡风。怡风通过透气材质和 Air 床垫套，让热量和湿气更容易散出去。',
    objectionReplies: [{ question: '透气床垫会不会牺牲支撑？', answer: '不会。怡风仍然保留 TEMPUR Pro 系列的贴合减压和腰背承托。' }],
    momentsCopy: '夏天睡不好，很多时候不是不困，是床垫太闷。TEMPUR Pro Air 梵璞·怡风主打透气清爽，适合怕热、易出汗的人。',
    xhsCopy: '怕热星人选床垫，一定要看透气性。怡风通过透气材质和 Air 床垫套，帮助热量散出去，晚上没那么闷。#透气床垫',
    customerPageCopy: '怡风主打透气凉爽与舒适承托，适合怕热、易出汗、追求清爽睡感的客户。',
    internalNotes: '', sourceDocs: proDocs, visibility: 'public', keywords: ['怡风', 'Pro Air', '梵璞怡风', '透气', '凉爽', '怕热', '易出汗', 'SmartCool'],
  },
  {
    id: 'tempur-form-original', series: 'TEMPUR FORM 芸枫', model: 'Original 22cm', category: '床垫', firmness: '适中/偏硬可选', image: productImage('tempur-form-original'),
    coreSellingPoints: ['全新 FORM 芸枫系列，主打稳定承托和环保安心', '黑灰白外观设计，尾部有品牌睡眠曲线识别', '适合预算更清晰、重视进口品质的客户'],
    fitCustomers: ['想体验 TEMPUR 品质但预算更理性的客户', '关注环保认证、卧室安全感的家庭', '喜欢稳固睡感和简洁外观的人群'],
    painPoints: ['担心床垫材料环保和气味问题', '预算有限但仍希望买到进口品质', '不知道入门款和旗舰款该怎么取舍'],
    salesScript: '芸枫 Original 更适合想要 TEMPUR 品质、但预算更理性的客户。它保留品牌核心的舒压和承托体验，外观更年轻简洁。',
    objectionReplies: [{ question: '芸枫和梵璞怎么选？', answer: '梵璞更偏旗舰体验和精细睡感选择；芸枫更适合预算明确、重视稳定品质和环保安心的客户。' }],
    momentsCopy: '想换一张安心、耐看、睡感稳的进口床垫，可以看看 TEMPUR FORM 芸枫 Original。简洁外观加稳定承托，适合卧室升级。',
    xhsCopy: '预算更理性，但又想买靠谱进口床垫，可以试试 TEMPUR FORM 芸枫 Original。稳定、安心、好搭卧室。#进口床垫',
    customerPageCopy: '芸枫 Original 适合预算清晰、重视环保安心和稳定承托的客户。',
    internalNotes: '', sourceDocs: formDocs, visibility: 'public', keywords: ['FORM', '芸枫', 'Original', '22cm', '环保', '进口', '适中', '偏硬'],
  },
  {
    id: 'tempur-form-plus', series: 'TEMPUR FORM 芸枫', model: 'Plus 25cm', category: '床垫', firmness: '适中/偏硬可选', image: productImage('tempur-form-plus'),
    coreSellingPoints: ['25cm 标准厚度，舒适层次比 Original 更充足', '兼顾承托、舒适和卧室视觉厚度', '适合主卧升级和长期自用客户'],
    fitCustomers: ['主卧自用、希望一步到位的人群', '希望床垫厚度和舒适度更有分量的家庭', '关注环保、耐用和品牌质保的客户'],
    painPoints: ['原有床垫承托不足，睡醒腰背累', '希望主卧床垫更有品质感', '担心普通床垫使用几年后塌陷变形'],
    salesScript: '芸枫 Plus 更适合主卧长期使用。相比 Original，它的厚度和舒适层次更充足，整体睡感更完整。',
    objectionReplies: [{ question: 'Plus 和 Original 差别大吗？', answer: '如果是主卧长期自用，Plus 的厚度和舒适层次会更值得体验。' }],
    momentsCopy: '主卧床垫真的值得认真选。TEMPUR FORM 芸枫 Plus 25cm，厚度、承托和舒适层次更完整。',
    xhsCopy: '床垫别只看软硬，也要看厚度和层次。芸枫 Plus 25cm 更适合主卧长期自用。#主卧床垫',
    customerPageCopy: '芸枫 Plus 25cm 适合主卧升级，兼顾舒适层次、稳定承托和品质感。',
    internalNotes: '', sourceDocs: formDocs, visibility: 'public', keywords: ['FORM', '芸枫', 'Plus', '25cm', '主卧', '升级', '承托'],
  },
  {
    id: 'tempur-living-mercurie', series: 'TEMPUR Living 麦凯瑞', model: 'Classic / Hybrid', category: '床垫', firmness: '适中', image: productImage('tempur-living-mercurie'),
    coreSellingPoints: ['新一代泰普尔感应材质，强调柔软包裹与身体贴合', 'PUROTEX+ 面料，主打益生菌抑过敏，适合有宠物家庭', 'Classic 与 Hybrid 两种结构，可按包裹感和支撑感选择'],
    fitCustomers: ['有宠物、关注面料安心和日常清洁的家庭', '喜欢柔软亲肤、包裹感更明显的人群', '想在 Living 系列里选择更温和睡感的客户'],
    painPoints: ['担心床垫面料过敏源和尘螨问题', '普通床垫亲肤感不足，睡感偏生硬', '既想要柔软包裹，又担心缺少支撑'],
    salesScript: '麦凯瑞适合关注亲肤、安心和柔软包裹感的客户。它的面料主打 PUROTEX+ 抑过敏技术，尤其适合有宠物或对卧室洁净度更敏感的家庭。',
    objectionReplies: [{ question: 'Classic 和 Hybrid 怎么选？', answer: 'Classic 更偏柔软贴合，Hybrid 加入独立袋装弹簧，支撑反馈更明显。' }],
    momentsCopy: '家里有宠物，选床垫除了睡感，也要关注面料安心。TEMPUR Living 麦凯瑞采用 PUROTEX+ 面料，柔软亲肤。',
    xhsCopy: '有宠物家庭选床垫，我会特别看面料。麦凯瑞主打 PUROTEX+ 抑过敏面料，Classic 更包裹，Hybrid 支撑更明显。#宠物家庭',
    customerPageCopy: '麦凯瑞主打柔软亲肤与安心面料，适合有宠物、重视卧室洁净感和包裹睡感的客户。',
    internalNotes: '', sourceDocs: livingDocs, visibility: 'public', keywords: ['Living', '麦凯瑞', 'Mercurie', 'Classic', 'Hybrid', '宠物', 'PUROTEX', '抑过敏', '柔软'],
  },
  {
    id: 'tempur-living-saturn', series: 'TEMPUR Living 赛腾', model: 'Classic / Hybrid', category: '床垫', firmness: '适中', image: productImage('tempur-living-saturn'),
    coreSellingPoints: ['TENCEL 零碳天丝面料，触感亲肤顺滑', 'PPPRMNT 薄荷萃取，主打抗菌防螨和安心使用', 'Classic 与 Hybrid 两种结构，兼顾贴合与弹性支撑'],
    fitCustomers: ['重视环保面料和可持续理念的客户', '喜欢亲肤、顺滑、舒适触感的人群', '希望床垫更适合日常家庭长期使用的客户'],
    painPoints: ['担心床垫面料不亲肤、不透气', '想要更安心的抗菌防螨配置', '普通床垫睡感单薄，贴合和支撑难兼顾'],
    salesScript: '赛腾适合对面料触感、环保和安心感更敏感的客户。它用 TENCEL 零碳天丝面料，触感更顺滑亲肤。',
    objectionReplies: [{ question: '赛腾和麦凯瑞有什么区别？', answer: '麦凯瑞更强调 PUROTEX+ 抑过敏和宠物家庭友好；赛腾更强调 TENCEL 天丝的亲肤顺滑、环保感和抗菌防螨。' }],
    momentsCopy: '床垫的面料触感，会影响每天躺下去的第一感受。TEMPUR Living 赛腾采用 TENCEL 零碳天丝面料，亲肤顺滑。',
    xhsCopy: '喜欢亲肤顺滑面料的人，可以试试 TEMPUR Living 赛腾。TENCEL 零碳天丝触感舒服，又有抗菌防螨卖点。#天丝床垫',
    customerPageCopy: '赛腾主打 TENCEL 零碳天丝面料、亲肤顺滑和抗菌防螨，适合重视环保安心的家庭。',
    internalNotes: '', sourceDocs: livingDocs, visibility: 'public', keywords: ['Living', '赛腾', 'Saturn', 'TENCEL', '天丝', '零碳', '抗菌', '防螨', '亲肤'],
  },
  {
    id: 'tempur-living-cyres', series: 'TEMPUR Living 赛瑞斯', model: 'Classic / Hybrid', category: '床垫', firmness: '适中', image: productImage('tempur-living-cyres'),
    coreSellingPoints: ['Living 高端系列，28-30cm 厚度更有品质感', 'Intense 抗静电面料结合 fresche 技术，强调低致敏和抗菌', 'Hybrid 版本搭载 Smart 智慧自适应弹簧系统，支撑反馈更强'],
    fitCustomers: ['预算更充足、想要 Living 高端款的客户', '关注抗静电、低致敏和长期睡眠品质的人群', '喜欢更厚实、更有支撑反馈的家庭主卧客户'],
    painPoints: ['普通床垫厚度和支撑层次不够', '睡眠中翻身产生静电或面料舒适度不足', '高端客户需要更清晰的产品差异点'],
    salesScript: '赛瑞斯是 Living 里面更高端的选择，适合预算更充足、希望床垫厚度和支撑层次更完整的客户。',
    objectionReplies: [{ question: '赛瑞斯为什么更高端？', answer: '它的厚度、面料科技和支撑结构层级更高，尤其 Hybrid 版本还有 Smart 智慧自适应弹簧系统。' }],
    momentsCopy: '高端主卧选床垫，可以重点看厚度、面料和支撑结构。TEMPUR Living 赛瑞斯 28-30cm 厚度更有分量。',
    xhsCopy: '如果你想在 Living 系列里选更高配的床垫，可以看赛瑞斯。厚度 28-30cm，面料主打抗静电和低致敏。#高端床垫',
    customerPageCopy: '赛瑞斯是 TEMPUR Living 高端系列，主打厚实层次、抗静电面料和更完整支撑体验。',
    internalNotes: '', sourceDocs: livingDocs, visibility: 'public', keywords: ['Living', '赛瑞斯', 'Cyres', '高端', '28cm', '30cm', '抗静电', 'fresche', 'Smart弹簧'],
  },
  {
    id: 'tempur-pillow-original', series: 'TEMPUR 枕头', model: '感温枕', category: '枕头', firmness: '颈椎承托', image: productImage('tempur-pillow-original'),
    coreSellingPoints: ['经典波浪形设计，贴合颈椎自然曲线', '高低两侧可根据睡姿和肩颈高度选择', '泰普尔材质缓慢贴合，减少颈肩压力'],
    fitCustomers: ['颈肩紧张、长期低头办公的人群', '习惯仰睡或侧睡的人群', '想从普通枕头升级到功能枕的客户'],
    painPoints: ['早起脖子僵硬、肩颈酸胀', '普通枕头容易塌，颈部悬空', '不知道枕头高度该怎么选'],
    salesScript: '感温枕是经典功能枕，重点是让颈椎有自然承托。现场试枕时注意让颈部被托住，而不是只把头垫高。',
    objectionReplies: [{ question: '功能枕需要适应吗？', answer: '需要一点适应期。它和普通软枕不同，更强调颈椎曲线承托。' }],
    momentsCopy: '很多人睡不好，不一定只怪床垫，枕头也很关键。TEMPUR 感温枕贴合颈椎曲线，适合长期低头、肩颈紧张的人。',
    xhsCopy: '早上起来脖子僵，可能是枕头高度不对。感温枕的波浪形设计能托住颈椎，高低两侧可选。#枕头推荐',
    customerPageCopy: '感温枕主打颈椎曲线承托，适合肩颈紧张、长期低头办公或想升级功能枕的客户。',
    internalNotes: '', sourceDocs: pillowDocs, visibility: 'public', keywords: ['感温枕', '枕头', '颈椎', '肩颈', '波浪形', '仰睡', '侧睡'],
  },


  {
    id: 'tempur-pillow-neck', series: 'TEMPUR 枕头', model: '感温舒颈枕', category: '枕头', firmness: '进阶承托', image: productImage('tempur-pillow-neck'),
    coreSellingPoints: ['凹槽造型更强调颈部贴合与头部稳定', '适合对肩颈承托要求更高的客户', '经典功能枕进阶选择，睡姿稳定感更强'],
    fitCustomers: ['颈肩压力更明显的人群', '希望头颈位置更稳定的人群', '已经习惯功能枕、想升级的人群'],
    painPoints: ['睡觉时头颈位置容易跑偏', '普通枕头托不住颈部弧度', '侧睡和仰睡切换时肩颈不舒服'],
    salesScript: '感温舒颈枕更强调头颈位置的稳定和贴合。客户如果肩颈压力更明显，或者已经习惯功能枕，可以引导他试这一款。',
    objectionReplies: [{ question: '感温舒颈枕和感温枕怎么选？', answer: '感温枕更经典基础，感温舒颈枕对头颈位置的包裹和稳定更明显。建议现场试枕，看哪款更贴合颈部。' }],
    momentsCopy: '枕头不是越软越好，关键是颈部有没有被稳稳托住。TEMPUR 感温舒颈枕更强调头颈稳定，适合肩颈压力比较明显的人。',
    xhsCopy: '如果你觉得普通枕头总是托不住脖子，可以看看 TEMPUR 感温舒颈枕。凹槽造型让头颈位置更稳定，适合对承托要求更高的人。#功能枕 #颈椎枕',
    customerPageCopy: '感温舒颈枕适合对肩颈承托和头颈稳定性要求更高的客户。',
    internalNotes: '', sourceDocs: pillowDocs, visibility: 'public', keywords: ['感温舒颈枕', '枕头', '颈椎', '肩颈', '凹槽', '头颈稳定', '功能枕'],
  },
  {
    id: 'tempur-pillow-crescent', series: 'TEMPUR 枕头', model: '新月枕', category: '枕头', firmness: '多睡姿', image: productImage('tempur-pillow-crescent'),
    coreSellingPoints: ['弧形造型贴合肩颈，适合侧睡与仰睡切换', '睡姿变化时更容易找到舒适支撑点', '比传统波浪枕更灵活，适应门槛更低'],
    fitCustomers: ['夜间经常翻身、睡姿变化多的人群', '侧睡比例较高的人群', '不适应传统波浪枕造型的客户'],
    painPoints: ['睡姿变化多，普通枕头很难一直合适', '侧睡时肩膀和脖子位置不舒服', '传统功能枕造型适应难度较高'],
    salesScript: '如果客户晚上翻身多、侧睡多，可以让他试新月枕。它比传统波浪枕更灵活，适合睡姿变化比较多的人。',
    objectionReplies: [{ question: '我不知道自己适合哪种枕头？', answer: '先看睡姿。仰睡多可以试感温枕，侧睡和翻身多可以试新月枕，关键是现场让颈部自然放松。' }],
    momentsCopy: '睡姿经常变的人，枕头也要更灵活。TEMPUR 新月枕适合侧睡、翻身多的人，让肩颈更容易找到舒服位置。',
    xhsCopy: '不是每个人都适合传统波浪枕。如果你晚上翻身多、侧睡多，可以试试 TEMPUR 新月枕，贴合肩颈的同时不那么固定。#枕头怎么选 #侧睡枕',
    customerPageCopy: '新月枕适合睡姿变化多、侧睡比例高或不适应传统波浪枕的客户。',
    internalNotes: '', sourceDocs: pillowDocs, visibility: 'public', keywords: ['新月枕', '枕头', '侧睡', '翻身', '多睡姿', '肩颈'],
  },
  {
    id: 'tempur-pillow-butterfly', series: 'TEMPUR 枕头', model: '蝴蝶枕', category: '枕头', firmness: '侧睡友好', image: productImage('tempur-pillow-butterfly'),
    coreSellingPoints: ['造型为肩颈留出空间，侧睡时更舒展', '兼顾仰睡和侧睡，睡姿切换更自然', '泰普尔材质贴合头颈压力点，支撑不生硬'],
    fitCustomers: ['侧睡较多、肩膀容易顶到枕头的人群', '翻身频繁、需要枕头更好适配的人群', '喜欢功能性但不想太硬的人群'],
    painPoints: ['侧睡时肩膀被挤压，脖子不舒服', '普通枕头高度不稳定，翻身后容易落空', '传统功能枕太固定，睡姿切换不自然'],
    salesScript: '蝴蝶枕适合侧睡比较多的客户。它的造型能给肩颈留出空间，让侧睡时头颈更容易保持自然角度。',
    objectionReplies: [{ question: '蝴蝶枕会不会很难适应？', answer: '它比强波浪造型更灵活，建议客户仰睡和侧睡都试一下，感受肩颈是否自然放松。' }],
    momentsCopy: '侧睡多的人，枕头一定要给肩颈留空间。TEMPUR 蝴蝶枕让侧睡时头颈更自然，翻身也更容易找到舒适位置。',
    xhsCopy: '侧睡党选枕头，别只看高度。TEMPUR 蝴蝶枕的造型能给肩颈留空间，侧睡时不会那么顶肩。#侧睡枕 #枕头推荐',
    customerPageCopy: '蝴蝶枕适合侧睡较多、翻身频繁、希望肩颈更自然放松的客户。',
    internalNotes: '', sourceDocs: pillowDocs, visibility: 'public', keywords: ['蝴蝶枕', '枕头', '侧睡', '肩颈', '翻身', '功能枕'],
  },
  {
    id: 'tempur-pillow-soft', series: 'TEMPUR 枕头', model: '馨尚枕 / 和悦枕', category: '枕头', firmness: '柔软舒适', image: productImage('tempur-pillow-soft'),
    coreSellingPoints: ['外观更接近传统枕头，接受度更高', '柔软舒适，适合喜欢蓬松感的客户', '可作为床垫连带搭配，提高整套睡眠体验'],
    fitCustomers: ['不喜欢强功能枕造型的人群', '喜欢柔软、传统枕型的人群', '购买床垫后需要成套搭配的客户'],
    painPoints: ['传统枕头容易塌陷或支撑不足', '功能枕造型太明显，客户不适应', '卧室升级时忽略了枕头搭配'],
    salesScript: '馨尚枕和和悦枕更适合喜欢传统枕型、希望柔软舒适的客户。它们更容易被接受，也很适合作为购买床垫后的搭配推荐。',
    objectionReplies: [{ question: '这种传统枕型还有 TEMPUR 的优势吗？', answer: '有。它外观看起来更接近传统枕头，但内部仍然强调贴合与支撑，比普通棉枕更不容易简单塌陷。' }],
    momentsCopy: '换床垫的时候，也别忘了枕头。馨尚枕/和悦枕外观更接近传统枕型，柔软好适应，适合喜欢蓬松舒适感的人。',
    xhsCopy: '如果你不习惯波浪形功能枕，可以看看馨尚枕/和悦枕。传统枕型更容易适应，睡感柔软，也适合和床垫一起搭配。#枕头推荐 #卧室好物',
    customerPageCopy: '馨尚枕/和悦枕适合喜欢传统枕型、柔软舒适睡感的客户。',
    internalNotes: '', sourceDocs: pillowDocs, visibility: 'public', keywords: ['馨尚枕', '和悦枕', '枕头', '传统枕型', '柔软', '搭配', '连带'],
  },
  {
    id: 'tempur-living-pillow-dream', series: 'TEMPUR Living 星梦系列', model: '星梦经典枕 / 星梦清爽枕 / 星梦活力枕', category: '枕头', firmness: '柔软亲肤', image: productImage('tempur-living-pillow-dream'),
    coreSellingPoints: ['不同枕型覆盖不同睡姿需求', '轻柔环抱肩颈，触感柔软亲肤', '可水洗枕套，3 年质保'],
    fitCustomers: ['喜欢柔软枕感的人群', '睡姿变化多、希望枕头更好适应的人群', '想搭配 Living 系列床垫的客户'],
    painPoints: ['普通枕头不贴合肩颈', '功能枕造型太固定不易适应', '想要更柔软亲肤的枕头搭配'],
    salesScript: '星梦系列适合喜欢柔软亲肤枕感的客户。经典枕、清爽枕、活力枕覆盖不同睡姿和支撑需求，可以和 Living 系列床垫一起推荐。',
    objectionReplies: [{ question: '星梦系列和感温枕怎么选？', answer: '感温枕更强调颈椎曲线承托；星梦系列更强调柔软亲肤和不同睡姿适配。' }],
    momentsCopy: '枕头也要按睡姿选。TEMPUR Living 星梦系列轻柔环抱肩颈，经典枕、清爽枕、活力枕可以满足不同睡姿需求。',
    xhsCopy: '喜欢柔软亲肤枕感的人，可以看看 TEMPUR Living 星梦系列。不同枕型适配不同睡姿，适合和床垫一起升级。#枕头推荐',
    customerPageCopy: '星梦系列主打柔软亲肤和多睡姿适配，适合喜欢轻柔枕感的客户。',
    internalNotes: '', sourceDocs: [{ name: '2024-Tempurliving-catalogue.pdf', pages: 'P11-P13' }], visibility: 'public', keywords: ['Living', '星梦', '星梦经典枕', '星梦清爽枕', '星梦活力枕', '枕头', '柔软', '亲肤', '多睡姿'],
  },  {
    id: 'tempur-smart-ergo', series: 'TEMPUR 智能床', model: '智选 X / N 系列', category: '智能床', firmness: '电动调节', image: productImage('tempur-smart-ergo'),
    coreSellingPoints: ['头部和脚部可调节，适合阅读、观影和放松', '位置预设、一键放平、无线遥控，使用更方便', '智选 N 系列增加腰部支撑和按摩功能'],
    fitCustomers: ['高端主卧升级客户', '喜欢床上阅读、看电视、放松的人群', '希望改善卧室生活方式的家庭'],
    painPoints: ['普通床只能平躺，使用场景单一', '睡前阅读或看电视时腰背缺少支撑', '高端客户需要更完整的睡眠解决方案'],
    salesScript: '智能床不是单独卖一张床架，而是把卧室从“只能睡觉”升级成放松空间。可以让客户现场感受头脚调节、预设位置和腰部支撑。',
    objectionReplies: [{ question: '智能床是不是只是功能噱头？', answer: '建议客户现场体验。真正有价值的是阅读、观影、放松和入睡前的角度调节。' }],
    momentsCopy: '卧室不只是睡觉的地方，也可以是每天真正放松的空间。TEMPUR 智能床可调节头部和脚部角度，阅读、观影、休息都更舒服。',
    xhsCopy: '高端主卧升级，床架真的可以不一样。TEMPUR 智能床能调节头部和脚部角度，睡前看书、追剧、放松都更舒服。#智能床',
    customerPageCopy: 'TEMPUR 智能床适合高端主卧升级，可调节头部和脚部角度，提升睡前放松体验。',
    internalNotes: '', sourceDocs: [{ name: '2024-Tempurliving-catalogue.pdf', pages: 'P21-P22' }], visibility: 'public', keywords: ['智能床', '智选X', '智选N', '电动床', '床架', '主卧', '按摩', '腰部支撑'],
  },
];

export function searchProductKnowledge(query: string): ProductKnowledge[] {
  const q = query.trim().toLowerCase();
  if (!q) return productKnowledgeList;
  return productKnowledgeList.filter(item => [
    item.series,
    item.model,
    item.category,
    item.firmness || '',
    item.salesScript,
    item.customerPageCopy,
    item.momentsCopy,
    item.xhsCopy,
    ...item.coreSellingPoints,
    ...item.fitCustomers,
    ...item.painPoints,
    ...item.keywords,
  ].some(text => text.toLowerCase().includes(q)));
}

export function getProductKnowledgeById(id?: string): ProductKnowledge | undefined {
  if (!id) return undefined;
  return productKnowledgeList.find(item => item.id === id);
}

export function findProductKnowledgeForTask(task: Pick<DeliveryTask, 'productSeries' | 'productModel' | 'model' | 'productCategory'>): ProductKnowledge | undefined {
  const haystack = [task.productSeries, task.productModel, task.model, task.productCategory].filter(Boolean).join(' ').toLowerCase();
  return productKnowledgeList.find(item =>
    haystack.includes(item.series.toLowerCase()) ||
    haystack.includes(item.model.toLowerCase()) ||
    item.keywords.some(keyword => haystack.includes(keyword.toLowerCase()))
  );
}



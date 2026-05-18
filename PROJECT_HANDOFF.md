# PROJECT_HANDOFF — 门店内容宝 (Store Content Treasure)

## 项目定位

TEMPUR 经销商 H5 案例营销工具。帮助 TEMPUR 门店销售顾问和安装师傅完成客户案例采集、交付、审核、展示和客户留资的闭环。产品资料库支持管理员自定义编辑，素材库提供朋友圈/小红书文案一键复制。

## 技术栈

| 层级 | 技术 |
|------|------|
| 框架 | React 18 + TypeScript |
| 构建 | Vite 5 |
| 路由 | react-router-dom v6 |
| 样式 | Tailwind CSS 3 |
| 图标 | lucide-react |
| 存储 | localStorage（临时 mock 后端） |
| 图片 | public/assets/images/（默认图），dataURL（管理员上传覆盖图） |

## 角色体系

| 角色 | 登录 | 核心功能 |
|------|------|----------|
| admin（管理员） | admin / admin123 | 审核案例、查看线索、产品资料管理 |
| dealer_owner（门店老板） | dealer001 / 123456 | 门店数据看板、管理导购和安装师傅 |
| sales（销售顾问） | sales001 / 123456 | 素材库、发圈/发小红书、建案例、上传案例、客户留资 |
| installer（安装师傅） | installer001 / 123456 | 接收交付任务、上传安装照片、补成交故事 |
| 客户（无需登录） | - | 查看公开案例、留资表单 |

## 测试账号

| 角色 | 账号 | 密码 |
|------|------|------|
| 管理员 | admin | admin123 |
| 门店老板 | dealer001 | 123456 |
| 销售顾问 | sales001 | 123456 |
| 销售顾问2 | sales002 | 123456 |
| 安装师傅 | installer001 | 123456 |
| 安装师傅2 | installer002 | 123456 |

## 路由表

### 公开页（无需登录）
| 路径 | 页面 | 说明 |
|------|------|------|
| /login | Login | 登录页 |
| /cases | Cases | 公开案例列表 |
| /cases/:caseId | CaseDetail | 案例详情 |
| /share/:caseId | CustomerCaseShare | 客户分享页（H5单页） |
| /share/collection | CaseCollectionShare | 案例合集分享页 |
| /lead-form/:caseId | LeadForm | 客户留资表单 |

### 内部功能（需登录）
| 路径 | 页面 | 角色限制 |
|------|------|----------|
| / | Home / InstallerHome | 首页 |
| /library?cat= | MaterialList | 素材库（installer禁止） |
| /material/:id | MaterialDetail | 素材详情 |
| /product-knowledge/:id | ProductKnowledgeDetail | 产品资料详情 |
| /save-images/:id | ImageSave | 保存图片 |
| /submit | Submit | 投稿 |
| /my-submissions | MySubmissions | 我的投稿 |
| /my-points | MyPoints | 积分明细 |
| /profile | Profile | 个人中心 |
| /cases-hub | CasesHub | 案例工作台 |
| /delivery/create | DeliveryCreate | 创建交付任务 |
| /delivery/tasks | DeliveryTasks | 交付任务列表 |
| /delivery/upload/:taskId | DeliveryUpload | 上传安装照片 |
| /delivery/story/:taskId | DeliveryStory | 补充成交故事 |
| /delivery/detail/:taskId | DeliveryDetail | 任务详情 |
| /ai-generate/:sourceType/:id | AiGenerate | AI改写 |
| /deal-report/submit | DealReportSubmit | 成交喜报 |

### 管理员后台（仅 admin）
| 路径 | 页面 | 说明 |
|------|------|------|
| /admin/delivery | AdminDelivery | 审核案例、成交喜报 |
| /admin/leads | AdminLeads | 客户线索列表 |
| /admin/products | AdminProducts | 产品资料管理 |
| /admin/products/:id | AdminProductEdit | 编辑/新增产品 |

## 图片路径

### 默认图片
- 产品图：`public/assets/images/products/` 下，通过 `src/utils/images.ts` 的 `productImage(id)` 映射
- 案例图：`public/assets/images/` 下，通过 `library` 分类索引轮询

### 管理员覆盖图
- 通过 `getProductImage(productId)` 优先读取 localStorage
- 存储 key：`sct-admin-product-image-{productId}`
- 存储格式：dataURL（JPEG 压缩，max 1200px，quality 0.82）
- 多图存储 key：`sct-admin-product-override-{productId}`（ProductOverride.images）

## localStorage 数据模型

| Key | 内容 | 写入方 |
|-----|------|--------|
| sct-user | 当前登录用户 JSON | App.tsx (login) |
| sct-share-leads | 客户留资记录 JSON[] | mock/data.ts |
| sct-delivery-tasks | 交付任务 JSON[] | mock/data.ts |
| sct-case-coin-records | 案例币流水 JSON[] | mock/data.ts |
| sct-point-records | 成长积分流水 JSON[] | mock/data.ts |
| sct-delivery-point-records | 交付积分流水 JSON[] | mock/data.ts |
| sct-deal-reports | 成交喜报 JSON[] | mock/data.ts |
| sct-daily-posting-{userId} | 每日发圈状态 JSON | mock/data.ts |
| sct-xhs-posting-{userId} | 每日小红书状态 JSON | mock/data.ts |
| sct-admin-product-override-{id} | 管理员产品内容覆盖 JSON | productOverrides.ts |
| sct-admin-product-image-{id} | 管理员产品主图 dataURL | productOverrides.ts |
| sct-admin-products-created | 管理员新增产品 JSON[] | productOverrides.ts |

## 核心数据源

| 文件 | 用途 | 性质 |
|------|------|------|
| src/mock/data.ts | 用户、案例、素材、交付任务、积分、案例币 | 默认 mock + localStorage 持久化 |
| src/mock/productKnowledge.ts | 17 款产品默认资料 | 默认兜底，管理员可覆盖 |
| src/utils/productOverrides.ts | 产品覆盖层 + 自定义产品管理 | 统一读写 localStorage |

## 管理员产品资料管理流程

1. admin 登录后首页点击「产品资料管理」→ /admin/products
2. 列表显示所有产品（默认 + 自定义），已修改产品有标签
3. 点击产品进入编辑页 → /admin/products/:id
4. 编辑页可修改：基础信息、多图、卖点、话术、文案、关键词
5. 保存后写入 localStorage，前台同步刷新
6. 点击「新增产品」→ /admin/products/new，填写后保存
7. 自定义产品可删除（默认产品只能恢复默认）

## 素材库筛选逻辑

- 产品资料：搜索 `mergeProductWithOverride` + 自定义产品
- 系列筛选：怡然（含怡风）、芸枫（FORM）、Living、枕头、智能床
- 朋友圈/小红书：从 mockMaterials 筛选平台标签，排除送货/安装/交付关键词

## 后续真实后端规划

当前全部使用 localStorage mock 后端，最终可替换为：

| 模块 | 当前方案 | 最终方案 |
|------|----------|----------|
| 用户认证 | localStorage JSON | JWT + OAuth |
| 案例/交付 | localStorage 数组 | REST API + MySQL/PostgreSQL |
| 产品资料 | localStorage dataURL | OSS/COS 图片上传 + CDN |
| 积分/案例币 | localStorage 计数 | 服务端事务 |
| 客户线索 | localStorage 追加 | CRM 接口对接 |
| 搜索 | 前端全量匹配 | 后端全文索引 |

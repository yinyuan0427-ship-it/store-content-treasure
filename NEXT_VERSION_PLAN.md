# NEXT_VERSION_PLAN — 门店内容宝 版本路线图

---

## V0.4 — 可演示版（当前阶段）

**状态：已完成**

### 已实现功能

- [x] 4 角色体系：admin / dealer_owner / sales / installer
- [x] 测试账号登录（localStorage）
- [x] 素材库：产品资料 / 朋友圈 / 小红书 三分类
- [x] 产品资料库：17 款 TEMPUR 产品默认数据
- [x] 产品搜索 + 系列筛选（怡然/芸枫/Living/枕头/智能床）
- [x] 产品详情页：卖点、话术、FAQ、文案复制
- [x] 朋友圈/小红书素材列表 + 一键复制文案
- [x] AI 改写入口（前端占位）
- [x] 案例上传 + 交付任务流程
- [x] 安装师傅照片上传 + 成交故事
- [x] 管理员审核案例 + 设为精选
- [x] 公开案例 H5 分享页
- [x] 客户留资表单 + 线索管理
- [x] 成长积分 + 案例币体系
- [x] 排行榜（销售/安装/门店/城市）
- [x] 管理员产品资料后台（编辑/新增/删除/多图）
- [x] localStorage 产品覆盖层
- [x] 成交喜报

### 技术债务

- [ ] 所有数据存储在 localStorage，无持久化保障
- [ ] 图片上传为 dataURL，清单页体积膨胀
- [ ] 产品图片使用本地 public/assets，无 CDN
- [ ] 搜索为前端全量匹配，产品数量增加后会卡
- [ ] 无接口抽象层，mock 数据直接耦合业务逻辑
- [ ] 无真机兼容性测试

---

## V0.5 — 真实后端版

**目标：将 localStorage mock 替换为真实后端，可部署到测试服务器**

### 后端选型建议

| 方案 | 适用场景 | 推荐度 |
|------|----------|--------|
| Node.js + Express + SQLite | 快速原型、单机部署 | ★★★ |
| Node.js + Express + PostgreSQL | 正式上线 | ★★★★★ |
| Supabase (BaaS) | 免运维、自带 Auth + Storage | ★★★★ |
| 微信云开发 | 已用微信生态 | ★★★ |

### 后端接口设计

```
POST   /api/auth/login              # 登录，返回 JWT
GET    /api/auth/me                  # 获取当前用户

GET    /api/products                 # 产品列表（支持搜索/筛选）
GET    /api/products/:id             # 产品详情
POST   /api/products                 # 新增产品（admin）
PUT    /api/products/:id             # 编辑产品（admin）
DELETE /api/products/:id             # 删除产品（admin）
POST   /api/products/:id/images      # 上传产品图片

GET    /api/materials                # 素材列表（按平台筛选）
GET    /api/materials/:id            # 素材详情

POST   /api/delivery-tasks           # 创建交付任务
GET    /api/delivery-tasks           # 交付任务列表
GET    /api/delivery-tasks/:id       # 任务详情
PUT    /api/delivery-tasks/:id       # 更新任务（上传照片、补故事）
PUT    /api/delivery-tasks/:id/review # 审核（admin）

POST   /api/cases                    # 发布案例
GET    /api/cases                    # 案例列表
GET    /api/cases/:id                # 案例详情
GET    /api/cases/share/:id          # 公开分享页数据

POST   /api/leads                    # 客户留资

GET    /api/points                   # 积分记录
GET    /api/points/rank              # 排行榜

GET    /api/deal-reports             # 成交喜报
POST   /api/deal-reports             # 提交喜报
PUT    /api/deal-reports/:id/review  # 审核喜报

POST   /api/upload                   # 图片上传 → OSS/CDN 返回 URL
```

### 图片方案升级

| 环节 | 当前 | V0.5 |
|------|------|------|
| 上传 | FileReader → dataURL | FormData → 服务端 → OSS |
| 存储 | localStorage | OSS/阿里云COS/腾讯云COS |
| 读取 | dataURL 直接渲染 | CDN URL |
| 压缩 | 前端 canvas | 前端预压 + 服务端二次压 |

### 前端改造

- [ ] 抽象 API 层：创建 `src/api/` 目录，封装 fetch 调用
- [ ] 保留 mock 兜底：开发环境使用 mock，生产环境走真实 API
- [ ] 图片组件统一：`<ProductImage>` / `<MaterialImage>` 组件
- [ ] 加入 loading/skeleton 状态
- [ ] 加入错误边界 + 重试逻辑
- [ ] 加入 JWT token 管理 + 自动刷新

### 数据库表设计

```
users (phone, password_hash, name, role, store_id, city, team)
stores (id, name, city)
products (id, series, model, category, firmness, ...)
product_images (product_id, url, sort_order)
materials (id, title, content, platform, scene, images, ...)
delivery_tasks (id, store_id, sales_id, installer_id, ...)
task_images (task_id, url, sort_order)
cases (id, task_id, visibility, review_status, ...)
leads (id, case_id, name, phone, city, requirement, ...)
point_records (id, user_id, points, type, ...)
deal_reports (id, store_id, amount, ...)
```

---

## V1.0 — 门店试点版

**目标：苏州 1-2 家门店实际试用，收集反馈**

### 功能补齐

- [ ] 微信 JSSDK 集成：在微信内置浏览器中一键保存图片到相册
- [ ] 推送通知：案例审核结果通知、新交付任务通知
- [ ] 数据看板：门店维度的案例数、留资数、分享次数
- [ ] 素材推荐：根据销售历史推荐朋友圈/小红书素材
- [ ] 案例模板：预设成交故事模板，降低填写门槛
- [ ] 批量导入：Excel 导入产品资料

### 运营准备

- [ ] 为试点门店预置 20+ 真实案例素材
- [ ] 拍摄高质量产品图替换占位图
- [ ] 编写朋友圈/小红书文案模板各 30 条
- [ ] 培训文档：管理员操作手册、销售使用指南、安装师傅使用指南
- [ ] 准备 FAQ 页面和客服群

### 稳定性

- [ ] 真机兼容性测试（iOS Safari / 微信内置浏览器 / Android Chrome）
- [ ] 弱网环境测试
- [ ] 图片上传失败重试
- [ ] 接口超时处理
- [ ] localStorage → 服务端数据迁移脚本

### 试点指标

- [ ] 日活跃销售数
- [ ] 日均发圈/发小红书数
- [ ] 案例上传完成率（创建→照片→故事→审核通过）
- [ ] 客户留资转化率
- [ ] 管理员审核时效
- [ ] 安装师傅任务完成率

---

## 长期规划

### V1.5 — 多门店推广
- 多门店数据隔离
- 城市/区域排行榜
- 总部运营后台加强
- 数据导出（Excel）

### V2.0 — AI 增强
- AI 改写小红书/朋友圈文案（接入 Claude API）
- 图片自动打标/分类
- 智能推荐素材
- 客户意图分析

### V3.0 — 生态打通
- TEMPUR 官方 CRM 对接
- 企业微信/钉钉集成
- 小程序版本
- 多渠道留资归因

# DEPLOY_GUIDE — 门店案例宝 部署指南

## 一、部署检查清单（已通过）

| 检查项 | 状态 |
|--------|------|
| `npm run build` 无报错 | ✅ |
| dist 文件夹生成（index.html + assets） | ✅ |
| 无硬编码 localhost 地址 | ✅ |
| 图片路径均为 `/assets/images/` 相对路径 | ✅ |
| 公开页（/cases /share /lead-form）无需登录 | ✅ |
| 内部页未登录自动跳转 /login | ✅ |
| SPA 回退路由配置（vercel.json） | ✅ |
| 外部图片（TEMPUR LOGO）来自 tempurchina.com | ⚠️ 依赖外部站点 |

## 二、部署到 Vercel

### 方式 A：CLI 部署（推荐）

```bash
# 1. 安装 Vercel CLI（一次性）
npm i -g vercel

# 2. 在项目根目录执行
cd store-content-treasure
vercel

# 3. 按提示配置：
#    - Set up and deploy? → Y
#    - Which scope? → 选择你的账号
#    - Link to existing project? → N
#    - Project name → store-content-treasure（或自定义）
#    - In which directory is your code? → ./
#    - Want to override settings? → N

# 4. 部署完成后会生成一个预览 URL，例如：
#    https://store-content-treasure.vercel.app

# 5. 如需正式发布到生产环境：
vercel --prod
```

### 方式 B：Git 自动部署

1. 将代码推送到 GitHub / GitLab / Bitbucket
2. 在 [vercel.com](https://vercel.com) 点击「New Project」
3. 导入你的仓库
4. Vercel 会自动识别 Vite 项目，无需手动配置
5. 点击 Deploy，每次 `git push` 都会自动部署

### 关键配置说明

项目根目录已包含 `vercel.json`，用于 SPA 路由回退：

```json
{
  "rewrites": [
    { "source": "/((?!assets/).*)", "destination": "/index.html" }
  ]
}
```

这个配置确保用户在浏览器直接访问 `/library?cat=product` 或 `/admin/products` 等路径时，Vercel 会返回 `index.html`，由 React Router 接管路由。

## 三、部署前需确认的问题

### 1. 无真实后端——纯前端演示

当前版本所有数据存储在浏览器的 localStorage 中。这意味着：

- 每个浏览器/设备的数据是独立的
- 清除浏览器数据会丢失所有修改
- 不同用户看不到同一份数据
- 管理员添加的产品只有该浏览器看得到

**演示建议**：演示时使用同一个浏览器，提前用 admin 账号登录，预先修改几个产品资料、上传一些案例。

### 2. 图片性能

`public/assets/images/` 中有几张大图（8MB+），会影响加载速度。部署到 Vercel 后，Vercel 的 CDN 会缓存，但首次加载仍较慢。

**建议**：部署前对大图进行压缩（特别是 PNG 文件可转为 WebP/JPG）。

### 3. TEMPUR LOGO 依赖外部站点

登录页的 TEMPUR LOGO 图片引用自 `https://www.tempurchina.com/uploadfiles/...`。如果该站点修改路径或下线，LOGO 会展示为裂图。

## 四、演示 URL 参考

部署后主要演示路径：

| 页面 | 路径 | 说明 |
|------|------|------|
| 登录页 | /login | 测试账号见下方 |
| 销售首页 | / | 先以 sales001 登录 |
| 素材库 | /library?cat=product | 产品资料列表 |
| 产品详情 | /product-knowledge/tempur-pro-yiran-soft | 怡然-软 详情 |
| 管理员后台 | /admin/products | 产品资料管理 |
| 公开案例 | /cases | 无需登录 |
| 客户分享 | /share/{caseId} | 客户视角 |

测试账号：admin/admin123 · dealer001/123456 · sales001/123456 · installer001/123456

## 五、Vercel 兼容性总结

**当前项目适合直接部署到 Vercel**，原因：

- Vite 构建的 SPA 应用，Vercel 原生支持
- 已配置 `vercel.json` 路由回退
- 无服务端依赖，纯静态文件
- 无环境变量依赖（当前版本）

唯一需要注意的是：这是一个纯前端原型，没有真实后端，数据不持久。

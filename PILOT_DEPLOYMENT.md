# 门店案例宝生产试点部署

## 本地验证

```powershell
npm install
npm run build
```

准备 PostgreSQL 后初始化表和 3 家门店的基础试点账号：

```powershell
Copy-Item .env.example .env
# 修改 .env 中的 PG* 和 AUTH_SECRET
npm run db:init
npm start
```

验证：

```powershell
curl http://127.0.0.1:3001/api/health
curl -X POST http://127.0.0.1:3001/api/auth/login -H "Content-Type: application/json" -d "{\"phone\":\"admin\",\"password\":\"admin123\"}"
```

## 腾讯云部署

1. 安装 Node.js 20、PostgreSQL、Nginx。
2. 创建数据库 `store_content_treasure`，配置 `.env`。
3. 在项目目录执行：

```bash
npm ci
npm run build
npm run db:init
PORT=3001 npm start
```

4. 将 `deploy/tencent-cloud-nginx.conf` 放入 `/etc/nginx/conf.d/store-content-treasure.conf`，执行：

```bash
sudo nginx -t
sudo systemctl reload nginx
```

## 试点账号

- 总部管理员：`admin / admin123`
- 苏州体验店：`dealer001 / 123456`、`sales001 / 123456`、`installer001 / 123456`
- 南京体验店：`dealer002 / 123456`、`sales002 / 123456`、`installer002 / 123456`
- 无锡滨湖店：`dealer003 / 123456`、`sales003 / 123456`、`installer003 / 123456`

正式给门店前必须修改默认密码，并把 `AUTH_SECRET` 换成随机长字符串。

## 试点验收

- 3 家门店分别使用正式账号登录。
- 每家门店至少完成：浏览产品/素材、查看或创建案例、提交或查看线索/交付任务。
- 管理员确认跨门店数据隔离：门店账号不能看到其他门店的线索、任务和后台数据。
- 记录 3 家门店反馈结论；若出现无法登录、数据串店、核心流程无法完成，暂停扩展试点并修复。

#!/bin/bash
# ═══════════════════════════════════════════════════════
# TEMPUR 门店内容宝 · 腾讯云轻量服务器部署脚本
# ═══════════════════════════════════════════════════════
# 使用：
#   chmod +x deploy/setup.sh
#   ./deploy/setup.sh
#
# 适用系统：Ubuntu 22.04 / 24.04
# ═══════════════════════════════════════════════════════

set -e

GREEN='\033[0;32m'
BLUE='\033[0;34m'
NC='\033[0m'

log()  { echo -e "${GREEN}[✓]${NC} $1"; }
step() { echo -e "\n${BLUE}═══ $1 ═══${NC}"; }

# ── 检查是否为 root ──
if [ "$EUID" -eq 0 ]; then
  SUDO=""
else
  SUDO="sudo"
fi

PROJECT_DIR="$HOME/store-content-treasure"

# ═══════════════════════════════════════════
step "1/6 更新系统包"
$SUDO apt-get update -qq
$SUDO apt-get upgrade -y -qq
log "系统包已更新"

# ═══════════════════════════════════════════
step "2/6 安装 Node.js 20"
if ! command -v node &> /dev/null; then
  curl -fsSL https://deb.nodesource.com/setup_20.x | $SUDO -E bash -
  $SUDO apt-get install -y nodejs
  log "Node.js $(node -v) 已安装"
else
  log "Node.js $(node -v) 已存在，跳过"
fi

# ═══════════════════════════════════════════
step "3/6 安装 Nginx + PM2 + Git"
$SUDO apt-get install -y nginx git

if ! command -v pm2 &> /dev/null; then
  $SUDO npm install -g pm2
  log "PM2 已安装"
else
  log "PM2 已存在，跳过"
fi

# ═══════════════════════════════════════════
step "4/6 克隆/更新项目"
if [ -d "$PROJECT_DIR" ]; then
  cd "$PROJECT_DIR"
  git pull origin main
  log "项目已更新"
else
  git clone https://github.com/yinyuan0427-ship-it/store-content-treasure.git "$PROJECT_DIR"
  cd "$PROJECT_DIR"
  log "项目已克隆"
fi

npm install
log "依赖已安装"

# ═══════════════════════════════════════════
step "5/6 配置环境变量"
if [ ! -f "$PROJECT_DIR/.env" ]; then
  cp .env.example .env
  # 生成随机密钥
  RANDOM_SECRET=$(node -e "console.log(require('crypto').randomBytes(32).toString('hex'))")
  sed -i "s/replace-with-a-long-random-secret/$RANDOM_SECRET/" .env
  log ".env 已创建，AUTH_SECRET 已随机生成"
else
  log ".env 已存在，跳过"
fi

# ═══════════════════════════════════════════
step "6/6 构建 + 部署"
# 构建前端
npm run build
log "前端构建完成 → dist/"

# 创建日志目录
mkdir -p logs uploads

# 重启后端
pm2 delete store-api 2>/dev/null || true
pm2 start deploy/ecosystem.config.cjs
pm2 save
pm2 startup systemd -u "$USER" --hp "$HOME" 2>/dev/null || true
log "后端已启动（LOCAL_STORE=1 免数据库模式）"

# 配置 Nginx
$SUDO cp deploy/tencent-cloud-nginx.conf /etc/nginx/sites-available/store-content
$SUDO ln -sf /etc/nginx/sites-available/store-content /etc/nginx/sites-enabled/
$SUDO rm -f /etc/nginx/sites-enabled/default

# 修正 dist 路径
$SUDO sed -i "s|/home/ubuntu/store-content-treasure/dist|$PROJECT_DIR/dist|g" /etc/nginx/sites-available/store-content

$SUDO nginx -t && $SUDO systemctl reload nginx
log "Nginx 已配置并重载"

# ═══════════════════════════════════════════
echo ""
echo -e "${GREEN}════════════════════════════════════${NC}"
echo -e "${GREEN}  部署完成！${NC}"
echo -e "${GREEN}════════════════════════════════════${NC}"
echo ""
echo "  访问地址：http://$(curl -s ifconfig.me 2>/dev/null || echo 'YOUR_IP')"
echo ""
echo "  测试账号：sales001 / 123456"
echo ""
echo "  常用命令："
echo "    pm2 status         查看进程状态"
echo "    pm2 logs store-api 查看后端日志"
echo "    pm2 restart all    重启所有服务"
echo "    sudo nginx -t      检查 Nginx 配置"
echo ""

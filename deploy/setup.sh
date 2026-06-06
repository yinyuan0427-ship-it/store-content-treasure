#!/bin/bash
# ═══════════════════════════════════════════════════════
# TEMPUR 门店内容宝 · 腾讯云轻量服务器部署脚本
# ═══════════════════════════════════════════════════════
# 使用：
#   chmod +x setup.sh
#   ./setup.sh
#
# 适用系统：
#   Ubuntu 22.04+ / Debian 11+      → apt-get
#   OpenCloudOS 9 / CentOS Stream   → dnf
#   Rocky Linux / AlmaLinux / RHEL  → dnf
#   CentOS 7                        → yum
# ═══════════════════════════════════════════════════════

set -e

GREEN='\033[0;32m'
BLUE='\033[0;34m'
RED='\033[0;31m'
NC='\033[0m'

log()  { echo -e "${GREEN}[✓]${NC} $1"; }
warn() { echo -e "${RED}[!]${NC} $1"; }
step() { echo -e "\n${BLUE}═══ $1 ═══${NC}"; }

# ── 检测操作系统 ──
detect_os() {
  if [ -f /etc/os-release ]; then
    . /etc/os-release
    OS_ID="${ID}"
    OS_ID_LIKE="${ID_LIKE:-}"
    OS_VERSION="${VERSION_ID:-}"
  elif [ -f /etc/redhat-release ]; then
    OS_ID="rhel"
    OS_VERSION=$(rpm -E %rhel)
  else
    warn "无法检测操作系统类型"
    exit 1
  fi

  # 判断包管理器
  if command -v apt-get &> /dev/null; then
    PKG_MGR="apt"
    PKG_UPDATE="apt-get update -qq"
    PKG_INSTALL="apt-get install -y -qq"
    PKG_UPGRADE="apt-get upgrade -y -qq"
  elif command -v dnf &> /dev/null; then
    PKG_MGR="dnf"
    PKG_UPDATE="dnf check-update -q || true"
    PKG_INSTALL="dnf install -y -q"
    PKG_UPGRADE="dnf upgrade -y -q"
  elif command -v yum &> /dev/null; then
    PKG_MGR="yum"
    PKG_UPDATE="yum check-update -q || true"
    PKG_INSTALL="yum install -y -q"
    PKG_UPGRADE="yum update -y -q"
  else
    warn "未找到包管理器 (apt-get/dnf/yum)"
    exit 1
  fi

  log "检测到系统: ${OS_ID} ${OS_VERSION} (包管理器: ${PKG_MGR})"
}

is_debian() { [ "$PKG_MGR" = "apt" ]; }
is_rhel()   { [ "$PKG_MGR" = "dnf" ] || [ "$PKG_MGR" = "yum" ]; }

# ── 检查是否为 root ──
if [ "$EUID" -eq 0 ]; then
  SUDO=""
else
  SUDO="sudo"
fi

PROJECT_DIR="$HOME/store-content-treasure"

# ═══════════════════════════════════════════
detect_os

# ═══════════════════════════════════════════
step "1/7 更新系统包"
$SUDO $PKG_UPDATE
$SUDO $PKG_UPGRADE
log "系统包已更新"

# ═══════════════════════════════════════════
step "2/7 安装 Node.js 20"
if ! command -v node &> /dev/null; then
  if is_debian; then
    curl -fsSL https://deb.nodesource.com/setup_20.x | $SUDO -E bash -
  else
    curl -fsSL https://rpm.nodesource.com/setup_20.x | $SUDO bash -
  fi
  $SUDO $PKG_INSTALL nodejs
  log "Node.js $(node -v) 已安装"
else
  log "Node.js $(node -v) 已存在，跳过"
fi

# ═══════════════════════════════════════════
step "3/7 安装 Git"
if ! command -v git &> /dev/null; then
  $SUDO $PKG_INSTALL git
  log "Git 已安装"
else
  log "Git $(git --version | cut -d' ' -f3) 已存在，跳过"
fi

# ═══════════════════════════════════════════
step "4/7 安装 Nginx"
if ! command -v nginx &> /dev/null; then
  if is_rhel; then
    $SUDO $PKG_INSTALL nginx
    $SUDO systemctl enable nginx
    $SUDO systemctl start nginx
  else
    $SUDO $PKG_INSTALL nginx
  fi
  log "Nginx 已安装"
else
  log "Nginx $(nginx -v 2>&1 | cut -d'/' -f2) 已存在，跳过"
fi

# ═══════════════════════════════════════════
step "5/7 安装 PM2"
if ! command -v pm2 &> /dev/null; then
  $SUDO npm install -g pm2
  log "PM2 已安装"
else
  log "PM2 已存在，跳过"
fi

# ═══════════════════════════════════════════
step "6/7 克隆/更新项目"
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
step "7/7 配置环境变量"
if [ ! -f "$PROJECT_DIR/.env" ]; then
  cp .env.example .env
  RANDOM_SECRET=$(node -e "console.log(require('crypto').randomBytes(32).toString('hex'))")
  sed -i "s/replace-with-a-long-random-secret/$RANDOM_SECRET/" .env
  log ".env 已创建，AUTH_SECRET 已随机生成"
else
  log ".env 已存在，跳过"
fi

# ═══════════════════════════════════════════
step "8/7 构建前端 + 启动后端"
# 构建前端
npm run build
log "前端构建完成 → dist/"

# 创建运行时目录
mkdir -p logs uploads
log "运行时目录已创建"

# 启动/重启后端
pm2 delete store-api 2>/dev/null || true
pm2 start deploy/ecosystem.config.cjs
pm2 save
pm2 startup systemd -u "$USER" --hp "$HOME" 2>/dev/null || true
log "后端已启动（LOCAL_STORE=1 免数据库模式）"

# ═══════════════════════════════════════════
step "9/7 配置 Nginx"
NGINX_CONF="$PROJECT_DIR/deploy/tencent-cloud-nginx.conf"

if is_debian; then
  # Debian/Ubuntu：sites-available → sites-enabled
  NGINX_AVAIL="/etc/nginx/sites-available"
  NGINX_ENABLED="/etc/nginx/sites-enabled"
  $SUDO mkdir -p "$NGINX_AVAIL" "$NGINX_ENABLED"
  $SUDO cp "$NGINX_CONF" "$NGINX_AVAIL/store-content"
  $SUDO ln -sf "$NGINX_AVAIL/store-content" "$NGINX_ENABLED/store-content"
  $SUDO rm -f "$NGINX_ENABLED/default"
  # 确保 Nginx 主配置 include sites-enabled
  if ! grep -q "sites-enabled" /etc/nginx/nginx.conf; then
    warn "Nginx 主配置未 include sites-enabled，请手动检查"
  fi
else
  # RHEL/CentOS/OpenCloudOS：conf.d 目录
  NGINX_CONFD="/etc/nginx/conf.d"
  $SUDO mkdir -p "$NGINX_CONFD"
  $SUDO cp "$NGINX_CONF" "$NGINX_CONFD/store-content.conf"
  # 移除默认 server 配置避免冲突
  $SUDO rm -f "$NGINX_CONFD/default.conf"
  # 确保 Nginx 主配置 include conf.d
  if ! grep -q "conf.d" /etc/nginx/nginx.conf; then
    warn "Nginx 主配置未 include conf.d，请手动检查"
  fi
  # SELinux 放行 HTTP
  if command -v semanage &> /dev/null; then
    $SUDO setsebool -P httpd_can_network_connect on 2>/dev/null || true
  fi
fi

# 修正 dist 路径（把默认的 /home/ubuntu 替换为当前用户目录）
NGINX_TARGET=""
if is_debian; then
  NGINX_TARGET="$NGINX_AVAIL/store-content"
else
  NGINX_TARGET="$NGINX_CONFD/store-content.conf"
fi
$SUDO sed -i "s|/home/ubuntu/store-content-treasure/dist|$PROJECT_DIR/dist|g" "$NGINX_TARGET"

$SUDO nginx -t && $SUDO systemctl reload nginx
log "Nginx 已配置并重载"

# ═══════════════════════════════════════════
# 检查防火墙（RHEL 系统默认开启 firewalld）
if is_rhel && command -v firewall-cmd &> /dev/null; then
  if $SUDO firewall-cmd --state 2>/dev/null; then
    $SUDO firewall-cmd --permanent --add-service=http 2>/dev/null || true
    $SUDO firewall-cmd --permanent --add-service=https 2>/dev/null || true
    $SUDO firewall-cmd --reload 2>/dev/null || true
    log "防火墙已放行 HTTP/HTTPS"
  fi
fi

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
echo "    sudo systemctl reload nginx  重载 Nginx"
echo ""
echo "  首次访问如果打不开，请检查："
echo "    1. 腾讯云安全组/防火墙是否放行 80 端口"
echo "    2. nginx 是否运行：systemctl status nginx"
echo "    3. 后端是否运行：pm2 status"
echo ""

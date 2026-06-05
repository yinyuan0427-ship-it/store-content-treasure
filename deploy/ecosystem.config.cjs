// PM2 进程守护配置
// 使用：
//   pm2 start deploy/ecosystem.config.cjs
//   pm2 save
//   pm2 startup

module.exports = {
  apps: [
    {
      name: 'store-api',
      script: 'server/index.js',
      cwd: '/home/ubuntu/store-content-treasure',
      instances: 1,
      exec_mode: 'fork',
      env: {
        NODE_ENV: 'production',
        PORT: 3001,
        LOCAL_STORE: '1',           // 免数据库模式（上线初期）
        UPLOAD_DIR: './uploads',
        AUTH_SECRET: process.env.AUTH_SECRET || 'change-me-in-production',
      },
      // 日志
      log_date_format: 'YYYY-MM-DD HH:mm:ss',
      error_file: './logs/api-error.log',
      out_file: './logs/api-out.log',
      merge_logs: true,
      // 自动重启
      max_restarts: 10,
      restart_delay: 5000,
      // 内存保护
      max_memory_restart: '300M',
    },
  ],
};

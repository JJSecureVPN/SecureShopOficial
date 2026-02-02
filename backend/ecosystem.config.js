const path = require("path");

// Cargar variables de entorno si existe un .env en el servidor.
// Nota: Este archivo se ejecuta en el host remoto (PM2), no en el build.
try {
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  require("dotenv").config({ path: path.join(__dirname, ".env") });
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  require("dotenv").config({ path: path.join(__dirname, ".env.production") });
} catch {
  // dotenv puede no estar disponible en el host, o no existir el archivo .env.
}

module.exports = {
  apps: [
    {
      name: "secureshop-backend",
      script: "./dist/index.js",
      cwd: "/home/secureshop/secureshop-vpn/backend",
      instances: "max",
      exec_mode: "cluster",
      wait_ready: true,
      listen_timeout: 30000,
      kill_timeout: 30000,
      env: {
        NODE_ENV: "production",
        // Secrets: deben venir del entorno del servidor (.env / variables exportadas)
        MP_ACCESS_TOKEN: process.env.MP_ACCESS_TOKEN,
        MP_PUBLIC_KEY: process.env.MP_PUBLIC_KEY,
        MP_WEBHOOK_URL: process.env.MP_WEBHOOK_URL,
        SERVEX_API_KEY: process.env.SERVEX_API_KEY,
        SUPABASE_URL: process.env.SUPABASE_URL,
        SUPABASE_SERVICE_KEY: process.env.SUPABASE_SERVICE_KEY,
        SUPABASE_WEBHOOK_SECRET: process.env.SUPABASE_WEBHOOK_SECRET,
        SUPPORT_NOTIFY_EMAIL: process.env.SUPPORT_NOTIFY_EMAIL,
        ADMIN_EMAIL: process.env.ADMIN_EMAIL,
        EMAIL_USER: process.env.EMAIL_USER,
        EMAIL_PASS: process.env.EMAIL_PASS,
        SMTP_USER: process.env.SMTP_USER,
        SMTP_PASS: process.env.SMTP_PASS,
        EMAIL_FROM: process.env.EMAIL_FROM,
        EMAIL_DEBUG: process.env.EMAIL_DEBUG,

        // No-secrets / defaults
        SERVEX_BASE_URL: process.env.SERVEX_BASE_URL || "https://servex.ws/api",
        DATABASE_PATH:
          process.env.DATABASE_PATH ||
          "/home/secureshop/secureshop-vpn/backend/database/secureshop.db",
        CORS_ORIGIN: process.env.CORS_ORIGIN || "https://shop.jhservices.com.ar,null",
        PORT: process.env.PORT || "4001",
        RATE_LIMIT_WINDOW_MS: process.env.RATE_LIMIT_WINDOW_MS || "900000",
        RATE_LIMIT_MAX_REQUESTS: process.env.RATE_LIMIT_MAX_REQUESTS || "100",
        SERVEX_TIMEOUT: process.env.SERVEX_TIMEOUT || "30000",
        SMTP_HOST: process.env.SMTP_HOST || "smtp.gmail.com",
        SMTP_PORT: process.env.SMTP_PORT || "587",
      },
      error_file: "~/.pm2/logs/secureshop-backend-error.log",
      out_file: "~/.pm2/logs/secureshop-backend-out.log",
      log_date_format: "YYYY-MM-DD HH:mm:ss Z",
      merge_logs: true,
      max_memory_restart: "500M",
      max_size: "50M",
      max_restarts: 5,
      min_uptime: "30s",
      autorestart: true,
      watch: false,
      force_kill: true,
      shutdown_with_message: true,
    },
  ],
};

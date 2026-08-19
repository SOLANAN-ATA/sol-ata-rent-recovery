import { defineConfig } from "vite";

// Vite 前端构建：入口在 frontend/，产物输出到 public/（Express 静态服务目录）
export default defineConfig({
  root: "frontend",
  build: {
    outDir: "../public",
    emptyOutDir: true,
    target: "es2020",
  },
  // 开发模式（npm run dev）时把 API 代理到后端 3725
  server: {
    proxy: {
      "/api": "http://127.0.0.1:3725",
    },
  },
});

import { defineConfig } from "vite";
import { resolve } from "path";

// Vite 前端构建：入口在 frontend/，产物输出到 public/（Express 静态服务目录）
// 多页面（MPA）：首页工具 + SEO 静态内容页（Google 直接抓取，不依赖 JS 渲染）
export default defineConfig({
  root: "frontend",
  build: {
    outDir: "../public",
    emptyOutDir: true,
    target: "es2020",
    rollupOptions: {
      input: {
        main: resolve(__dirname, "frontend/index.html"),
        guide: resolve(__dirname, "frontend/guide.html"),
        faq: resolve(__dirname, "frontend/faq.html"),
        "what-is-rent": resolve(__dirname, "frontend/what-is-rent.html"),
      },
    },
  },
  // 开发模式（npm run dev）时把 API 代理到后端 3725
  server: {
    proxy: {
      "/api": "http://127.0.0.1:3725",
    },
  },
});

import { defineConfig } from 'vite';
import vue from '@vitejs/plugin-vue';
import path from 'path';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [vue()],
  base: '/',
  resolve: {
    alias: {
      '@': path.resolve(__dirname, 'src'),
    },
  },
  server: {
    port: 3000,
    open: true,
    hmr: {
      overlay: false, // 禁用服务器错误遮罩层
      timeout: 5000,  // 热更新超时时间
    },
    watch: {
      usePolling: true,  // 使用轮询监听文件变化
      interval: 100,     // 轮询间隔
    }
  },
  build: {
    outDir: 'dist',
    assetsDir: 'assets',
    minify: 'terser',
    terserOptions: {
      compress: {
        drop_console: true,
        drop_debugger: true,
      },
    },
    reportCompressedSize: false,
    chunkSizeWarningLimit: 2000,
  },
}); 
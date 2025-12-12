import {defineConfig, loadEnv} from 'vite'
import vue from '@vitejs/plugin-vue'
import path from "path";
const pathSrc = path.resolve(__dirname, "src");
export default defineConfig((mode): any =>{
  const env = loadEnv(mode.mode, process.cwd());
  return {
    base: "./",
    root: process.cwd(), // 绝对路径
    server: {
      host: "0.0.0.0",
      open: true,
      port: +env.VITE_APP_PORT,
      cors: true,
      proxy: {
        [env.VITE_APP_BASE_API]: {
          changeOrigin: true,
          target: env.VITE_APP_API_URL,
          rewrite: (path: any) =>
              path.replace(new RegExp("^" + env.VITE_APP_BASE_API), ""),
        },
      },
    },
    plugins: [
      vue(),
    ],
    resolve: {
      alias: {
        "@": pathSrc,
      }
    },
    build: {
      minify: 'terser',
      // 清除所有console和debugger
      terserOptions: {
        compress: {
          drop_console: true,
          drop_debugger: true
        }
      },
      rollupOptions: {
        // 直接告诉 rollup 忽略类型检查
        onwarn(warning:any, handler:any) {
          if (warning.code === 'TS7016' && warning.message.includes('@wangeditor')) {
            return
          }
          handler(warning)
        }
      }
    }
  }
})

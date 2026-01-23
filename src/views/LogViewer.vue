<template>
    <div class="log-page">
        <div class="terminal-window glass-panel">
            <div class="terminal-header">
                <div class="header-left">
                    <div class="dot red"></div>
                    <div class="dot yellow"></div>
                    <div class="dot green"></div>
                    <span class="title">System.log — bash — 80x24</span>
                </div>
                <div class="header-right">
                    <el-tag :type="isConnected ? 'success' : 'danger'" effect="dark" size="small" class="status-tag">
                        {{ isConnected ? '● Live' : '○ Disconnected' }}
                    </el-tag>

                    <el-tooltip content="自动滚动到底部" placement="top">
                        <div class="action-btn" :class="{ active: autoScroll }" @click="autoScroll = !autoScroll">
                            <el-icon><Download /></el-icon>
                        </div>
                    </el-tooltip>

                    <el-tooltip content="清屏" placement="top">
                        <div class="action-btn" @click="clearLogs">
                            <el-icon><Delete /></el-icon>
                        </div>
                    </el-tooltip>
                </div>
            </div>

            <div class="terminal-body" ref="logContainerRef">
                <div class="log-line" v-for="(log, index) in logList" :key="index">
                    <span class="line-num">{{ index + 1 }}</span>
                    <span class="line-content" v-html="highlightLog(log)"></span>
                </div>
                <div v-if="logList.length === 0" class="empty-tip">等待日志数据流...</div>
            </div>
        </div>

        <div class="back-link" @click="goHome">
            <el-icon><ArrowLeft /></el-icon> 退出终端
        </div>
    </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted, nextTick, shallowRef } from 'vue'
import {useRoute, useRouter} from 'vue-router'
import { ArrowLeft, Delete, Download } from '@element-plus/icons-vue'

const router = useRouter()
const logContainerRef = ref<HTMLElement | null>(null)

const route = useRoute()
const targetTime = ref((route?.query?.time as string) || '')
// 使用 shallowRef 而不是 ref，因为日志数组很大且不需要深度监听内部对象变化，提升性能
const logList = shallowRef<string[]>([])
const isConnected = ref(false)
const autoScroll = ref(true)
let ws: WebSocket | null = null

// 最大保留行数，防止浏览器卡死
// const MAX_LINES = 2000

const highlightLog = (text: string) => {
    if (!text) return ''
    let formatted = text
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/INFO/g, '<span class="log-info">INFO</span>')
        .replace(/WARN/g, '<span class="log-warn">WARN</span>')
        .replace(/ERROR/g, '<span class="log-error">ERROR</span>')
        .replace(/Exception/g, '<span class="log-error">Exception</span>')
        .replace(/(\d{4}-\d{2}-\d{2}\s\d{2}:\d{2}:\d{2}\.\d{3})/g, '<span class="log-time">$1</span>') // 时间戳
        .replace(/(\[.*?\])/g, '<span class="log-thread">$1</span>') // 线程名 [main]

    return formatted
}

const goHome = () => {
    if (ws) {
        ws.close()
    }
    router.push('/')
}

const initWebSocket = () => {
    const param = targetTime.value ? encodeURIComponent(targetTime.value) : 'none';
    const protocol = location.protocol === 'https:' ? 'wss:' : 'ws:'
    const host = import.meta.env.MODE === 'development' ? 'localhost:8090' : "www.munjie.com"
    ws = new WebSocket(`${protocol}//${host}/ws/log/${param}`)
    ws.onmessage = (event) => {
        const line = event.data;
        logList.value = [...logList.value, line];
        if (targetTime.value && line.includes(targetTime.value.substring(0, 19))) {
            autoScroll.value = false; // 锁定滚动
            // 滚动到该行并闪烁
            nextTick(() => {
                const elements = document.querySelectorAll('.line-content');
                for (const el of elements) {
                    if (el.textContent?.includes(targetTime.value.substring(0, 19))) {
                        el.scrollIntoView({ behavior: 'smooth', block: 'center' });
                        el.classList.add('target-highlight'); // 加上之前定义的闪烁样式
                        break;
                    }
                }
            });
            if (autoScroll.value) {
                scrollToBottom()
            }
        }
    };

    ws.onclose = () => {
        isConnected.value = false
        logList.value = [...logList.value, 'SYSTEM: 连接已断开']
    }

    ws.onerror = () => {
        isConnected.value = false
        logList.value = [...logList.value, 'SYSTEM: 连接发生错误']
    }
};


const scrollToBottom = () => {
    nextTick(() => {
        if (logContainerRef.value) {
            logContainerRef.value.scrollTop = logContainerRef.value.scrollHeight
        }
    })
}

const clearLogs = () => {
    logList.value = []
}

onMounted(() => {
    initWebSocket()
})

onUnmounted(() => {
    if (ws) ws.close()
})
</script>


<style scoped lang="scss">
.log-page {
  min-height: 100vh;
  padding: 40px 20px;
  background: #050505;
  display: flex;
  flex-direction: column;
  align-items: center;
  /* 隐藏页面级别的滚动条 */
  overflow: hidden;
}

.terminal-window {
  width: 100%;
  max-width: 1000px;
  height: 80vh;
  border-radius: 12px;
  background: rgba(10, 10, 12, 0.95); // 极深的背景
  border: 1px solid #333;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  box-shadow: 0 0 30px rgba(0, 0, 0, 0.8);

  /* 玻璃拟态边框发光 */
  transition: box-shadow 0.3s;
  &:hover {
    box-shadow: 0 0 50px rgba(99, 102, 241, 0.15);
    border-color: #444;
  }
}

.terminal-header {
  height: 40px;
  background: #1a1a1a;
  border-bottom: 1px solid #333;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 15px;
  flex-shrink: 0; // 防止头部被压缩

  .header-left {
    display: flex;
    align-items: center;
    gap: 8px;

    .dot {
      width: 10px;
      height: 10px;
      border-radius: 50%;
      &.red { background: #ff5f56; }
      &.yellow { background: #ffbd2e; }
      &.green { background: #27c93f; }
    }

    .title {
      margin-left: 10px;
      font-family: 'Consolas', 'Monaco', monospace;
      font-size: 12px;
      color: #666;
    }
  }

  .header-right {
    display: flex;
    align-items: center;
    gap: 15px;

    .action-btn {
      cursor: pointer;
      color: #666;
      transition: all 0.2s;

      &:hover, &.active {
        color: var(--accent-color, #6366f1);
      }
    }
  }
}

.terminal-body {
  flex: 1;
  padding: 10px;
  overflow-y: auto;
  overflow-x: auto;
  background: #0a0a0c;
  font-family: 'Consolas', 'Fira Code', 'Monaco', monospace;
  font-size: 13px;
  line-height: 1.5;
  color: #d4d4d4; // 默认字体灰白色

  /* 自定义滚动条 */
  &::-webkit-scrollbar {
    width: 8px;
    height: 8px;
  }
  &::-webkit-scrollbar-thumb {
    background: #333;
    border-radius: 4px;
    &:hover { background: #555; }
  }
  &::-webkit-scrollbar-track {
    background: #0a0a0c;
  }
}

.log-line {
  white-space: pre-wrap; // 保留空格和换行
  word-break: break-all; // 强制换行防止撑开
  display: flex;
  margin-bottom: 2px;

  &:hover {
    background: rgba(255, 255, 255, 0.03);
  }

  .line-num {
    display: inline-block;
    width: 35px;
    color: #444;
    text-align: right;
    margin-right: 15px;
    user-select: none;
    flex-shrink: 0;
  }

  .line-content {
    flex: 1;
  }
}

/* 日志语法高亮 CSS */
:deep(.log-info) { color: #61afef; }
:deep(.log-warn) { color: #e5c07b; }
:deep(.log-error) { color: #e06c75; font-weight: bold; }
:deep(.log-time) { color: #5c6370; margin-right: 8px; }
:deep(.log-thread) { color: #98c379; margin-right: 8px; }

.empty-tip {
  text-align: center;
  color: #444;
  margin-top: 100px;
  animation: pulse 2s infinite;
}

@keyframes pulse {
  0% { opacity: 0.5; }
  50% { opacity: 1; }
  100% { opacity: 0.5; }
}

.back-link {
    margin-top: 20px;
    padding: 10px 20px;
    background: rgba(255, 255, 255, 0.05);
    border-radius: 20px;
    color: #888;
    cursor: pointer;
    display: flex;
    align-items: center;
    gap: 8px;
    transition: all 0.3s ease;
    border: 1px solid transparent;

    &:hover {
        color: #fff;
        background: rgba(255, 255, 255, 0.1);
        border-color: var(--el-color-primary);
        box-shadow: 0 0 15px rgba(64, 158, 255, 0.2);
    }
}

/* 移动端适配 */
@media (max-width: 768px) {
  .log-page {
    padding: 10px;
  }
  .terminal-window {
    height: 90vh;
  }
  .header-left .title { display: none; } // 手机上隐藏标题
  .log-line { font-size: 11px; } // 字体变小
  .line-num { width: 25px; margin-right: 5px; }
}
</style>
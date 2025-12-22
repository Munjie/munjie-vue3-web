<template>
    <div class="chat-container">
        <aside class="chat-sidebar glass-panel" :class="{ 'collapsed': !showSidebar }">
            <el-button class="new-chat-btn" @click="createNewChat" :icon="Plus">新对话</el-button>
            <div class="history-list">
                <div
                    v-for="item in sessions"
                    :key="item.id"
                    :class="['history-item', { active: currentSessionId === item.id }]"
                    @click="switchSession(item.id)"
                >
                    <el-icon><ChatLineRound /></el-icon>
                    <span class="title">{{ item.title }}</span>
                    <el-icon class="del-btn" @click="deleteSession(item.id, $event)"><Delete /></el-icon>
                </div>
            </div>
        </aside>
        <main class="chat-main" v-if="currentSession">
            <div class="messages-wrapper" ref="scrollRef">
                <div v-for="(msg, index) in currentSession.messages" :key="index" :class="['message-row', msg.role]">
                    <div class="avatar">
                        <el-icon v-if="msg.role === 'assistant'"><Cpu /></el-icon>
                        <el-icon v-else><User /></el-icon>
                    </div>
                    <div class="message-content glass-panel">
                        <div class="text">
                            <MdPreview :modelValue="msg.content" theme="dark" />
                        </div>
                        <div class="message-actions" v-if="msg.role === 'assistant' && msg.content">
                            <el-icon class="copy-icon" @click="copyText(msg.content)"><DocumentCopy /></el-icon>
                        </div>
                    </div>
                </div>
                <div v-if="isTyping" class="message-row assistant">
                    <div class="typing-indicator"><span>.</span><span>.</span><span>.</span></div>
                </div>
            </div>
            <div class="input-area-container">
                <div class="input-card glass-panel">
                    <el-input
                        v-model="userInput"
                        type="textarea"
                        :autosize="{ minRows: 1, maxRows: 6 }"
                        placeholder="问问 AI..."
                        @keydown.enter.prevent="handleEnter"
                        class="chat-textarea"
                    />

                    <div class="input-toolbar">
                        <div class="toolbar-left">
                            <el-upload
                                action="#"
                                :auto-upload="false"
                                :show-file-list="false"
                                @change="handleFileUpload"
                            >
                                <template #trigger>
                                    <div class="icon-btn-wrapper">
                                        <el-icon class="action-icon"><Picture /></el-icon>
                                    </div>
                                </template>
                            </el-upload>
                            <div class="icon-btn-wrapper">
                                <el-icon class="action-icon"><Files /></el-icon>
                            </div>
                        </div>

                        <div class="toolbar-right">
                            <el-select
                                v-model="selectedModel"
                                size="small"
                                class="gemini-pill-selector"
                                :teleported="true"
                                placement="top-end"
                            >
                                <template #prefix>
                                    <el-icon class="model-sparkle"><MagicStick /></el-icon>
                                </template>

                                <el-option
                                    v-for="item in modelOptions"
                                    :key="item.value"
                                    :label="item.label"
                                    :value="item.value"
                                >
                                    <div class="model-option-content">
                                        <div class="model-name">{{ item.label }}</div>
                                        <div class="model-description">{{ item.desc }}</div>
                                    </div>
                                </el-option>
                            </el-select>

                            <el-button
                                class="gemini-send-btn"
                                :disabled="!userInput || isTyping"
                                @click="sendMessage"
                                circle
                            >
                                <el-icon><Promotion /></el-icon>
                            </el-button>
                        </div>
                    </div>
                </div>
            </div>
        </main>
    </div>
</template>

<script setup lang="ts">

interface Message {
    role: 'user' | 'assistant';
    content: string;
}

interface ChatSession {
    id: string;
    title: string;
    messages: Message[];
    updateTime: number;
}
import { ref, onMounted, nextTick } from 'vue'
import { MdPreview } from 'md-editor-v3'
import { ElMessage, ElMessageBox } from 'element-plus'
import {Plus, Cpu, User, DocumentCopy, Delete, ChatLineRound, Promotion} from '@element-plus/icons-vue'

// 模型选项配置
const modelOptions = [
    { label: 'GPT-5-Nano', value: 1, desc: '平衡性能与速度' },
    { label: 'GPT-5.2', value: 5, desc: 'gpt-5.2' },
    { label: 'DeepSeek-R1', value: 2, desc: '日常处理' },
    { label: 'DeepSeek-V3', value: 3, desc: '快速' },
    { label: 'DeepSeek-V3-2-Exp', value: 4, desc: '日常处理' },
]
const handleFileUpload = (file: any) => {
    ElMessage.info(`已选择文件: ${file.name} (后端接入开发中...)`)
}

const selectedModel = ref<number>(modelOptions[0]?.value ?? 0)
// --- 状态定义 ---
const STORAGE_KEY = 'nocturne_chat_history'
const sessions = ref<ChatSession[]>([])
const currentSessionId = ref<string>('')
const isTyping = ref(false)
const userInput = ref('')
const scrollRef = ref<HTMLElement | null>(null)
const showSidebar = ref(true)
const isDevelopment = import.meta.env.MODE === 'development'
// --- 计算当前活动的会话 ---
const currentSession = ref<ChatSession | null>(null)
const baseURL = isDevelopment ? 'http://localhost:8090/blog/chat/completions' : '/api/chat/completions'
const handleEnter = (e: KeyboardEvent) => {
    // 如果是移动端，Enter 通常换行；PC 端 Enter 发送
    if (window.innerWidth > 768 && !e.shiftKey) {
        sendMessage()
    }
}
// --- 核心：初始化加载 ---
onMounted(() => {
    const saved = localStorage.getItem(STORAGE_KEY)
    if (saved) {
        sessions.value = JSON.parse(saved)
        // 修复：显式判断数组长度
        if (sessions.value.length > 0 && sessions.value[0]) {
            switchSession(sessions.value[0].id)
        } else {
            createNewChat()
        }
    } else {
        createNewChat()
    }
})
// --- 核心：保存到本地 ---
const saveToLocal = () => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(sessions.value))
}

// --- 创建新对话 ---
const createNewChat = () => {
    const newId = Date.now().toString()
    const newSession: ChatSession = {
        id: newId,
        title: '新对话',
        messages: [{ role: 'assistant', content: '你好！我是 AI 助手，今天想聊点什么？' }],
        updateTime: Date.now()
    }
    sessions.value.unshift(newSession)
    switchSession(newId)
    saveToLocal()
}

// --- 切换会话 ---
const switchSession = (id: string) => {
    currentSessionId.value = id
    const session = sessions.value.find(s => s.id === id)
    if (session) {
        currentSession.value = session
        scrollToBottom()
    }
}

const deleteSession = (id: string, event: Event) => {
    event.stopPropagation()
    ElMessageBox.confirm('确定要删除这段对话吗？', '提示').then(() => {
        sessions.value = sessions.value.filter(s => s.id !== id)
        if (sessions.value.length === 0) {
            createNewChat()
        } else if (currentSessionId.value === id) {
            // 修复：安全访问第一个元素的 ID
            const firstSession = sessions.value[0]
            if (firstSession) {
                switchSession(firstSession.id)
            }
        }
        saveToLocal()
    })
}
// --- 发送消息 ---
const sendMessage = async () => {
    if (!userInput.value || isTyping.value || !currentSession.value) return
    const userContent = userInput.value
    // 1. 如果是新对话的第一条消息，更新标题
    if (currentSession.value.messages.length === 1 && currentSession.value.title === '新对话') {
        currentSession.value.title = userContent.substring(0, 15) + (userContent.length > 15 ? '...' : '')
    }
    currentSession.value.messages.push({ role: 'user', content: userContent })
    currentSession.value.updateTime = Date.now()
    userInput.value = ''
    isTyping.value = true
    await scrollToBottom()
    // 2. 准备 AI 占位
    currentSession.value.messages.push({ role: 'assistant', content: '' })
    const lastIndex = currentSession.value.messages.length - 1
    try {
        const response = await fetch(baseURL, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                model: selectedModel.value,
                stream: true,
                messages: currentSession.value.messages.slice(0, -1)
            })
        })

        if (!response.body) return
        const reader = response.body.getReader()
        const decoder = new TextDecoder()

        while (true) {
            const { done, value } = await reader.read()
            if (done) break

            const chunk = decoder.decode(value)
            const lines = chunk.split('\n')
            lines.forEach(line => {
                if (line.startsWith('data:')) {
                    const dataStr = line.slice(5).trim()
                    if (dataStr === '[DONE]') return
                    try {
                        const data = JSON.parse(dataStr)
                        const delta = data.choices[0].delta.content
                        // --- sendMessage 内部的流式解析部分 ---
                        if (delta && currentSession.value) {
                            // 修复：获取目标消息引用并进行空值判断
                            const targetMessage = currentSession.value.messages[lastIndex]
                            if (targetMessage) {
                                targetMessage.content += delta
                                scrollToBottom()
                            }
                        }

                    } catch (e) {}
                }
            })
        }
        // 成功结束后保存一次
        saveToLocal()
    } catch (error) {
        ElMessage.error('网络错误')
        isTyping.value = false
    } finally {
        isTyping.value = false
    }
}
const copyText = (text: string) => {
    if (navigator.clipboard && window.isSecureContext) {
        navigator.clipboard.writeText(text)
            .then(() => ElMessage.success('已复制到剪贴板'))
            .catch(() => fallbackCopy(text));
    } else {
        // 2. 兜底方案解决线上不能复制问题
        fallbackCopy(text);
    }
}

const scrollToBottom = async () => {
    await nextTick()
    if (scrollRef.value) {
        scrollRef.value.scrollTop = scrollRef.value.scrollHeight
    }
}
// 兜底方案实现
const fallbackCopy = (text: string) => {
    const textArea = document.createElement("textarea");
    textArea.value = text;
    // 确保 textarea 在页面上不可见但可操作
    textArea.style.position = "fixed";
    textArea.style.left = "-9999px";
    textArea.style.top = "0";
    document.body.appendChild(textArea);
    textArea.focus();
    textArea.select();
    try {
        const successful = document.execCommand('copy');
        if (successful) {
            ElMessage.success('已复制到剪贴板');
        } else {
            ElMessage.error('复制失败，请手动选择复制');
        }
    } catch (err) {
        ElMessage.error('浏览器不支持自动复制');
    }

    document.body.removeChild(textArea);
}
</script>

<style scoped lang="scss">
.chat-container {
  display: flex;
  height: calc(100vh - var(--header-height));
  background: var(--bg-color);
}

.chat-sidebar {
  width: 260px;
  border-right: 1px solid var(--glass-border);
  padding: 20px;
  display: flex;
  flex-direction: column;
  gap: 20px;
  @media (max-width: 768px) { display: none; }
}

.chat-main {
  flex: 1;
  display: flex;
  flex-direction: column;
  position: relative;
  max-width: 900px;
  margin: 0 auto;
  width: 100%;
}

.messages-wrapper {
  flex: 1;
  overflow-y: auto;
  padding: 40px 20px;
  display: flex;
  flex-direction: column;
  gap: 30px;
}

.message-row {
  display: flex;
  gap: 20px;
  max-width: 85%;
  &.user {
    align-self: flex-end;
    flex-direction: row-reverse;
    .message-content { background: var(--accent-color); color: white; }
  }
}

.avatar {
  width: 35px;
  height: 35px;
  border-radius: 8px;
  background: #333;
  display: flex;
  align-items: center;
  justify-content: center;
}

.message-content {
  padding: 2px 15px;
  border-radius: 12px;
  position: relative;
  .message-actions {
    position: absolute;
    bottom: -25px;
    right: 5px;
    cursor: pointer;
    color: var(--text-secondary);
    &:hover { color: var(--accent-color); }
  }
}


.typing-indicator span {
  animation: blink 1.4s infinite;
  &:nth-child(2) { animation-delay: 0.2s; }
  &:nth-child(3) { animation-delay: 0.4s; }
}
@keyframes blink { 0% { opacity: 0.2; } 20% { opacity: 1; } 100% { opacity: 0.2; } }
.history-list {
    flex: 1;
    overflow-y: auto;
    margin-top: 10px;
}

.history-item {
    display: flex;
    align-items: center;
    padding: 12px;
    margin-bottom: 8px;
    border-radius: 8px;
    cursor: pointer;
    transition: all 0.2s;
    color: var(--text-secondary);
    position: relative;
    border: 1px solid transparent;

    &:hover {
        background: rgba(255, 255, 255, 0.05);
        .del-btn { opacity: 1; }
    }

    &.active {
        background: rgba(99, 102, 241, 0.1);
        border-color: rgba(99, 102, 241, 0.3);
        color: var(--accent-color);
    }

    .title {
        flex: 1;
        margin-left: 10px;
        font-size: 14px;
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
        padding-right: 20px;
    }

    .del-btn {
        position: absolute;
        right: 10px;
        opacity: 0;
        transition: opacity 0.2s;
        &:hover { color: #f56c6c; }
    }
}

.new-chat-btn {
    width: 100%;
    background: transparent !important;
    border: 1px dashed var(--glass-border) !important;
    color: var(--text-primary) !important;
    &:hover {
        border-color: var(--accent-color) !important;
        color: var(--accent-color) !important;
    }
}

.input-area-container {
    padding: 0 20px 20px;
    background: transparent;

    @media (max-width: 768px) {
        padding: 10px;
        background: #151515; // 移动端吸底背景
    }
}

.input-card {
    max-width: 850px;
    margin: 0 auto;
    padding: 12px 16px;
    border-radius: 28px; // 超大圆角
    background: rgba(30, 30, 30, 0.7) !important;
    border: 1px solid rgba(255, 255, 255, 0.08);
    transition: border-color 0.3s;

    &:focus-within {
        border-color: rgba(99, 102, 241, 0.4);
        background: rgba(35, 35, 35, 0.9) !important;
    }
}

.chat-textarea {
    :deep(.el-textarea__inner) {
        background: transparent !important;
        box-shadow: none !important;
        border: none !important;
        color: #ececec;
        font-size: 16px;
        padding: 8px 0;
        line-height: 1.6;
        resize: none;
    }
}

/* -------------------
   右下角操作区
   ------------------- */
.input-actions {
    display: flex;
    justify-content: flex-end; // 靠右对齐
    align-items: center;
    gap: 12px;
    margin-top: 4px;
}

.gemini-selector {
    /* 1. 给一个最小宽度，防止文字消失 */
    min-width: 150px;
    width: auto;

    :deep(.el-input__wrapper) {
        background-color: rgba(255, 255, 255, 0.07) !important;
        box-shadow: none !important;
        border-radius: 20px !important;
        padding: 4px 12px !important;
        border: 1px solid rgba(255, 255, 255, 0.1);

        /* 2. 确保选中的内容颜色可见 */
        .el-input__inner {
            color: #bbbbbb !important; /* 浅灰色文字 */
            font-size: 13px;
            font-weight: 500;
            text-align: left;
            cursor: pointer;
            /* 防止文字被裁切 */
            height: 24px;
            line-height: 24px;
        }

        /* 3. 调整图标位置 */
        .el-input__prefix {
            display: flex;
            align-items: center;
            .model-icon {
                color: var(--accent-color);
                margin-right: 2px;
                font-size: 14px;
            }
        }

        /* 4. 隐藏右侧的小箭头（Gemini 风格通常更简洁） */
        /* 如果你想留着箭头，可以删掉下面这段 */
        .el-input__suffix {
            display: none;
        }
    }
}
/* 发送按钮样式 */
.gemini-send-btn {
    width: 40px;
    height: 40px;
    background: var(--accent-color) !important;
    border: none !important;
    color: white !important;
    font-size: 18px;
    transition: all 0.2s;

    &:hover {
        transform: scale(1.05);
        box-shadow: 0 0 15px rgba(99, 102, 241, 0.4);
    }

    &:disabled {
        background: rgba(255, 255, 255, 0.1) !important;
        color: rgba(255, 255, 255, 0.3) !important;
    }
}

/* 下拉菜单样式定制 */
.model-option {
    display: flex;
    flex-direction: column;
    padding: 4px 0;

    .label { font-weight: bold; font-size: 14px; }
    .desc { font-size: 11px; color: #888; margin-top: 2px; }
}

/* -------------------
   1. 输入框外壳
   ------------------- */
.input-card {
    max-width: 850px;
    margin: 0 auto;
    padding: 12px 16px;
    border-radius: 28px;
    background: rgba(32, 33, 36, 0.9) !important; // 更接近深色模式底色
    border: 1px solid rgba(255, 255, 255, 0.1);
    display: flex;
    flex-direction: column;
}

/* -------------------
   2. 底部工具栏布局
   ------------------- */
.input-toolbar {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-top: 8px;
}

.toolbar-left {
    display: flex;
    gap: 8px;

    .icon-btn-wrapper {
        width: 36px;
        height: 36px;
        border-radius: 50%;
        display: flex;
        align-items: center;
        justify-content: center;
        cursor: pointer;
        transition: background 0.2s;
        color: #c4c7c5;

        &:hover {
            background: rgba(255, 255, 255, 0.08);
            color: #fff;
        }

        .action-icon { font-size: 20px; }
    }
}

.toolbar-right {
    display: flex;
    align-items: center;
    gap: 12px;
}

/* -------------------
   3. 核心：胶囊模型选择器
   ------------------- */
.gemini-pill-selector {
    min-width: 100px;
    width: auto;
    :deep(.el-input__wrapper) {
        background-color: transparent !important;
        border: 1px solid #444746 !important; // Gemini 风格的细边框
        border-radius: 20px !important; // 胶囊圆角
        padding: 2px 12px !important;
        box-shadow: none !important;
        height: 32px;

        &:hover {
            background-color: rgba(255, 255, 255, 0.05) !important;
            border-color: #5f6368 !important;
        }

        .el-input__inner {
            color: #c4c7c5 !important;
            font-size: 13px;
            font-weight: 500;
            width: 150px; // 固定宽度防止文字溢出
        }

        .model-sparkle {
            color: #a8c7fa; // 浅蓝色图标
            font-size: 14px;
        }
    }
}

/* -------------------
   4. 核心：下拉描述样式
   ------------------- */
/* 注意：此部分需要去掉 scoped 或者使用 :deep 确保作用于弹出层 */
.model-option-content {
    display: flex;
    flex-direction: column;
    padding: 6px 0;
    line-height: 1.4;

    .model-name {
        color: #e3e3e3;
        font-weight: 500;
        font-size: 10px;
    }

    .model-description {
        color: #9aa0a6;
        font-size: 8px;
        margin-top: 2px;
        white-space: normal; // 允许描述文字换行
    }
}

/* 强制覆盖 Element Plus 默认样式以显示完整高度 */
:deep(.el-select-dropdown__item) {
    height: auto !important;
    padding: 8px 15px !important;
}

.gemini-send-btn {
    background: #a8c7fa !important; // Gemini 风格淡蓝
    color: #062e6f !important; // 深色图标
    border: none !important;
}
</style>
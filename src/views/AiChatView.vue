<template>
    <div class="chat-container">
        <div
                v-if="showSidebar && isMobile"
                class="sidebar-mask"
                @click="showSidebar = false"
        ></div>
        <aside
                class="chat-sidebar glass-panel"
                :class="{ 'collapsed': !showSidebar, 'mobile-open': showSidebar && isMobile }"
        >
            <div class="sidebar-header-mobile" v-if="isMobile">
                <span>聊天历史</span>
                <el-icon @click="showSidebar = false">
                    <Close/>
                </el-icon>
            </div>
            <el-button class="new-chat-btn" @click="createNewChat" :icon="Plus">新聊天</el-button>
            <div class="history-list">
                <div
                        v-for="item in sessions"
                        :key="item.id"
                        :class="['history-item', { active: currentSessionId === item.id }]"
                        @click="handleSessionClick(item.id)"
                >
                    <el-icon>
                        <ChatLineRound/>
                    </el-icon>
                    <span class="title">{{ item.title }}</span>
                    <el-icon class="del-btn" @click="deleteSession(item.id, $event)">
                        <Delete/>
                    </el-icon>
                </div>
            </div>
        </aside>
        <main class="chat-main" v-if="currentSession">
            <div class="mobile-nav" v-if="isMobile">
                <el-icon @click="showSidebar = true">
                    <Expand/>
                </el-icon>
                <span class="nav-title">{{ currentSession.title }}</span>
                <el-icon @click="createNewChat">
                    <Plus/>
                </el-icon>
            </div>
            <div class="messages-wrapper" ref="scrollRef">
                <div v-for="(msg, index) in currentSession.messages" :key="index" :class="['message-row', msg.role]">
                    <div class="message-content glass-panel">
                        <div class="text">
                            <MdPreview :modelValue="msg.content" theme="dark"/>
                        </div>
                        <div class="message-actions"
                             v-if="msg.role === 'user' || (index < currentSession.messages.length - 1) || !isTyping">
                            <el-icon class="copy-icon" @click="copyText(msg.content)">
                                <DocumentCopy/>
                            </el-icon>
                        </div>
                    </div>
                </div>
                <div v-if="isTyping" class="message-row assistant">
                    <div class="typing-indicator"><span>.</span><span>.</span><span>.</span></div>
                </div>
            </div>
            <div class="input-area-container" ref="inputAreaRef">
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
                                        <el-icon class="action-icon">
                                            <Picture/>
                                        </el-icon>
                                    </div>
                                </template>
                            </el-upload>
                            <div class="icon-btn-wrapper">
                                <el-icon class="action-icon">
                                    <Files/>
                                </el-icon>
                            </div>
                            <div
                                    class="icon-btn-wrapper search-btn"
                                    :class="{ 'is-active': isSearchEnabled }"
                                    @click="isSearchEnabled = !isSearchEnabled"
                                    title="联网搜索"
                            >
                                <svg width="24" height="24" viewBox="0 0 24 24" fill="none"
                                     xmlns="http://www.w3.org/2000/svg">
                                    <circle cx="12" cy="12" r="10" stroke="currentColor" stroke-width="2"/>
                                    <path d="M12 2C14.5 5 15.8 8.3 16 12C15.8 15.7 14.5 19 12 22" stroke="currentColor"
                                          stroke-width="2" stroke-linecap="round"/>
                                    <path d="M12 2C9.5 5 8.2 8.3 8 12C8.2 15.7 9.5 19 12 22" stroke="currentColor"
                                          stroke-width="2" stroke-linecap="round"/>
                                    <path d="M2 12H22" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
                                    <path d="M4 7C6.5 8 9.3 8.5 12 8.5C14.7 8.5 17.5 8 20 7" stroke="currentColor"
                                          stroke-width="2" stroke-linecap="round"/>
                                    <path d="M4 17C6.5 16 9.3 15.5 12 15.5C14.7 15.5 17.5 16 20 17"
                                          stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
                                </svg>
                                <span class="search-label" v-if="!isMobile"></span>
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
                                    <el-icon class="model-sparkle">
                                        <MagicStick/>
                                    </el-icon>
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
                                <el-icon>
                                    <Promotion/>
                                </el-icon>
                            </el-button>
                        </div>
                    </div>
                </div>
            </div>
        </main>
    </div>
</template>

<script setup lang="ts">

import {getAllModel, getChatHistory, saveChat} from "../api/chat.ts";

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

import {ref, onMounted, nextTick} from 'vue'
import {MdPreview} from 'md-editor-v3'
import {ElMessage, ElMessageBox} from 'element-plus'
import {Plus, DocumentCopy, Delete, ChatLineRound, Promotion} from '@element-plus/icons-vue'


// 2. 定义联网搜索状态
const isSearchEnabled = ref(false)
const modelOptions = ref();
const handleFileUpload = (file: any) => {
    ElMessage.info(`已选择文件: ${file.name} (后端接入开发中...)`)
}


const selectedModel = ref()
// --- 状态定义 ---
const sessions = ref<ChatSession[]>([])
const currentSessionId = ref<string>('')
const isTyping = ref(false)
const userInput = ref('')
const scrollRef = ref<HTMLElement | null>(null)
const showSidebar = ref(true)
const isDevelopment = import.meta.env.MODE === 'development'
// --- 计算当前活动的会话 ---
const currentSession = ref<ChatSession | null>(null)
const baseURL = isDevelopment ? 'http://localhost:8090/chat/completions' : '/api/chat/completions'
const inputAreaRef = ref<HTMLElement | null>(null);
// --- 新增响应式状态 ---
const isMobile = ref(false)

// 在 script 顶部定义
const typewriterQueue: string[] = [];
let isProcessingQueue = false;

// 打字机处理函数
const processTypewriter = async (targetMsg: any) => {
    if (isProcessingQueue) return;
    isProcessingQueue = true;

    while (typewriterQueue.length > 0) {
        const char = typewriterQueue.shift();
        if (char) {
            targetMsg.content += char;
            // 控制打字速度：30ms 一个字
            await new Promise(resolve => setTimeout(resolve, 30));
            await scrollToBottom();
        }
    }
    isProcessingQueue = false;
};

// 检查是否是移动端
const checkMobile = () => {
    isMobile.value = window.innerWidth <= 768
    // 移动端默认关闭侧边栏，PC端默认开启
    if (isMobile.value) {
        showSidebar.value = false
    } else {
        showSidebar.value = true
    }
}

const handleSessionClick = (id: string) => {
    switchSession(id)
    if (isMobile.value) {
        showSidebar.value = false // 移动端选中后自动收起
    }
}
const handleEnter = (e: KeyboardEvent) => {
    // 如果是移动端，Enter 通常换行；PC 端 Enter 发送
    if (window.innerWidth > 768 && !e.shiftKey) {
        sendMessage()
    }
}
// --- 核心：初始化加载 ---
onMounted(async () => {
    await fetchAllModel();
    checkMobile()
    window.addEventListener('resize', checkMobile)
    // const saved = localStorage.getItem(STORAGE_KEY)
    const saved = await getChatHistory();
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
const saveToLocal = async () => {
    let chatForm = {
        chat: JSON.stringify(sessions.value),
    }
    await saveChat(chatForm);
    // localStorage.setItem(STORAGE_KEY, JSON.stringify(sessions.value))
}

// --- 创建新对话 ---
const createNewChat = () => {
    const newId = Date.now().toString()
    const newSession: ChatSession = {
        id: newId,
        title: '新聊天',
        messages: [{role: 'assistant', content: '你好！我是 AI 助手，今天想聊点什么？'}],
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
    ElMessageBox.confirm('确定要删除这段聊天记录吗？', '提示').then(() => {
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
    if (currentSession.value.messages.length === 1 && currentSession.value.title === '新聊天') {
        currentSession.value.title = userContent.substring(0, 15) + (userContent.length > 15 ? '...' : '')
    }
    currentSession.value.messages.push({role: 'user', content: userContent})
    currentSession.value.updateTime = Date.now()
    userInput.value = ''
    isTyping.value = true
    await scrollToBottom()
    // 2. 准备 AI 占位
    currentSession.value.messages.push({role: 'assistant', content: ''})
    // const lastIndex = currentSession.value.messages.length - 1
    try {
        const response = await fetch(baseURL, {
            method: 'POST',
            headers: {'Content-Type': 'application/json'},
            body: JSON.stringify({
                model: selectedModel.value,
                stream: true,
                search: isSearchEnabled.value,
                messages: currentSession.value.messages.slice(0, -1)
            })
        })
        if (!response.body) return
        const reader = response.body.getReader()
        const decoder = new TextDecoder()


        while (true) {
            const {done, value} = await reader.read()
            if (done) {
                // 等待队列中的打字机效果全部处理完
                const checkFinished = setInterval(() => {
                    if (typewriterQueue.length === 0 && !isProcessingQueue) {
                        isTyping.value = false;
                        clearInterval(checkFinished);
                        saveToLocal();
                    }
                }, 100);
                break;
            }

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
                            typewriterQueue.push(...delta.split(''));
                            const lastIndex = currentSession.value.messages.length - 1;
                            processTypewriter(currentSession.value.messages[lastIndex]);
                        }

                    } catch (e) {
                    }
                }
            })
        }
    } catch (error) {
        ElMessage.error('网络错误')
        isTyping.value = false
    } finally {
        setTimeout(scrollToBottom, 100);
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
    await nextTick();
    if (scrollRef.value) {
        // 直接设置 scrollTop 是最稳妥的，不依赖 behavior: smooth 的兼容性
        scrollRef.value.scrollTop = scrollRef.value.scrollHeight;
        // 针对 iOS 键盘收起/弹出的抖动，再补一个延迟滚动
        setTimeout(() => {
            if (scrollRef.value) {
                scrollRef.value.scrollTop = scrollRef.value.scrollHeight;
            }
        }, 50);
    }
    if (isMobile.value && inputAreaRef.value) {
        inputAreaRef.value.scrollIntoView({
            behavior: 'smooth',
            block: 'end' // 确保输入框容器的底部对齐视口底部
        });
    }
};
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

const fetchAllModel = async () => {
    try {
        const res = await getAllModel();
        modelOptions.value = (res as any).data.map((item: any) => ({
            label: item.modelName,
            value: item.id,
            desc: item.modelDesc
        }))
        if (modelOptions.value.length > 0) {
            selectedModel.value = modelOptions.value[1].value
        }
    } catch (error) {
        modelOptions.value = []
    }
}
</script>

<style scoped lang="scss">

:global(html, body, #app) {
  height: 100%;
  margin: 0;
  padding: 0;
}

.chat-container {
  display: flex;
  height: calc(100dvh - var(--header-height));
  width: 100vw;
  background: var(--bg-color);
  overflow: hidden; /* 防止整页滚动 */
}


/* 主容器适配顶部导航 */
.chat-main {
  flex: 1;
  display: flex;
  flex-direction: column;
  position: relative;
  max-width: 900px;
  margin: 0 auto;
  width: 100%;
  height: 100%;
  overflow: hidden; /* 关键：锁定主容器 */

}

/* 确保消息容器在移动端也能滑动 */
.messages-wrapper {
  flex: 1;
  overflow-y: auto;
  padding: 20px 15px;
  display: flex;
  flex-direction: column;
  gap: 30px;
  /*  @media (max-width: 768px) {
      !* 移动端减小底部 padding，因为输入框不再是绝对定位，不会遮挡内容 *!
      padding: 60px 15px 20px;
    }*/
  -webkit-overflow-scrolling: touch;
  @media (max-width: 768px) {
    /* 顶部预留出移动端导航栏的高度，防止遮挡第一条消息 */
    padding-top: 60px;
  }
}

.message-row {
  display: flex;
  gap: 20px;
  max-width: 85%;

  &.user {
    align-self: flex-end;
    flex-direction: row-reverse;

    /*    .message-content {
          background: var(--accent-color);
          color: white;
        }*/
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

    &:hover {
      color: var(--accent-color);
    }
  }
}


.typing-indicator span {
  animation: blink 1.4s infinite;

  &:nth-child(2) {
    animation-delay: 0.2s;
  }

  &:nth-child(3) {
    animation-delay: 0.4s;
  }
}

@keyframes blink {
  0% {
    opacity: 0.2;
  }
  20% {
    opacity: 1;
  }
  100% {
    opacity: 0.2;
  }
}

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

    .del-btn {
      opacity: 1;
    }
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

    &:hover {
      color: #f56c6c;
    }
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
  flex-shrink: 0; /* 关键：确保输入框不会因为消息多而被挤扁 */
  padding: 10px 20px 20px; /* PC 端间距 */
  //background: #151515;
  width: 100%;
  display: flex;
  justify-content: center; /* 核心：强制子元素水平居中 */
  align-items: center;
  box-sizing: border-box; /* 确保 padding 不会撑大容器宽度 */
  @media (max-width: 768px) {
    /* 移动端适配：padding-bottom 使用 env 确保贴合 iOS 底边 */
    padding: 10px 10px calc(10px + env(safe-area-inset-bottom));
    background: #151515;
    position: relative;
    z-index: 10;
  }

}

.input-card {
  max-width: 850px;
  margin: 0 auto;
  padding: 12px 16px;
  border-radius: 28px; // 超大圆角
  background: rgba(30, 30, 30, 0.7) !important;
  border: 1px solid rgba(255, 255, 255, 0.08);
  //transition: border-color 0.3s;
  width: 100%;
  transition: all 0.3s ease;

  /* 解决移动端阴影或边框导致的视觉偏移 */
  box-sizing: border-box;

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

  .label {
    font-weight: bold;
    font-size: 14px;
  }

  .desc {
    font-size: 11px;
    color: #888;
    margin-top: 2px;
  }
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

    .action-icon {
      font-size: 20px;
    }
  }

  /* 联网搜索按钮特有样式 */
  .search-btn {
    display: flex !important;
    gap: 4px;
    box-sizing: border-box;

    .search-label {
      font-size: 12px;
      font-weight: 500;
    }

    /* 高亮状态：使用你项目的主色调 */
    &.is-active {
      background: rgba(99, 102, 241, 0.15) !important;
      color: var(--accent-color) !important;
      border: 1px solid rgba(99, 102, 241, 0.3);
      box-shadow: 0 0 10px rgba(99, 102, 241, 0.1);

      .action-icon {
        /* 让图标有一点点发光感 */
        filter: drop-shadow(0 0 2px var(--accent-color));
      }
    }
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

/* --- 移动端专用样式 --- */

/* 顶部导航条 */
.mobile-nav {
  display: none;
  @media (max-width: 768px) {
    position: absolute; /* 改为绝对定位，不占流空间，由 wrapper 的 padding-top 避开 */
    top: 0;
    left: 0;
    height: 50px;
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 10px 15px;
    background: rgba(30, 30, 30, 0.9);
    border-bottom: 1px solid var(--glass-border);

    width: 100%;
    z-index: 100;
    color: #fff;
    .nav-title {
      font-size: 14px;
      font-weight: 500;
    }
    .el-icon {
      font-size: 20px;
      cursor: pointer;
    }
  }
}

/* 遮罩层 */
.sidebar-mask {
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  background: rgba(0, 0, 0, 0.5);
  backdrop-filter: blur(2px);
  z-index: 999;
}

/* 侧边栏抽屉化改造 */
.chat-sidebar {
  width: 150px;
  border-right: 1px solid var(--glass-border);
  padding: 20px;
  display: flex;
  flex-direction: column;
  gap: 20px;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);

  @media (max-width: 768px) {
    position: fixed;
    left: 0;
    top: 0;
    height: 100vh;
    z-index: 1000;
    background: #1e1e1e; /* 移动端使用实色防止透视混乱 */
    transform: translateX(-100%); /* 默认隐藏在左侧外 */

    &.mobile-open {
      transform: translateX(0); /* 展开 */
    }

    .sidebar-header-mobile {
      display: flex;
      justify-content: space-between;
      align-items: center;
      color: #fff;
      font-weight: bold;
      margin-bottom: 10px;
    }
  }
}

/* 消息文本的基础样式 */
.message-content .text {
  line-height: 1.6;
  word-break: break-word;

  /* 给新生成的文字一个自然的过渡 */
  transition: all 0.2s ease;
}

/* 模拟打字机光标 (正在输入时显示) */
.is-typing .text::after {
  content: " ";
  display: inline-block;
  width: 4px;
  height: 18px;
  background-color: var(--accent-color);
  margin-left: 4px;
  vertical-align: middle;
  animation: blink 0.8s infinite;
}

@keyframes blink {
  0%, 100% {
    opacity: 1;
  }
  50% {
    opacity: 0;
  }
}

.thinking-dots {
  display: flex;
  gap: 4px;
  padding: 10px;

  span {
    width: 6px;
    height: 6px;
    background: var(--accent-color);
    border-radius: 50%;
    animation: dot-jump 1.4s infinite ease-in-out;

    &:nth-child(2) {
      animation-delay: 0.2s;
    }

    &:nth-child(3) {
      animation-delay: 0.4s;
    }
  }
}

@keyframes dot-jump {
  0%, 80%, 100% {
    transform: translateY(0);
  }
  40% {
    transform: translateY(-6px);
  }
}
</style>
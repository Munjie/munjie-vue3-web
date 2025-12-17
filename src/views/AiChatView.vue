<template>
    <div class="chat-container">
        <aside class="chat-sidebar glass-panel" :class="{ 'mobile-hide': !showSidebar }">
            <el-button class="new-chat-btn" @click="resetChat" icon="Plus">新对话</el-button>
            <div class="history-list">
                <div class="history-item active">当前话题: {{ historyTitle }}</div>
            </div>
        </aside>

        <main class="chat-main">
            <div class="messages-wrapper" ref="scrollRef">
                <div v-for="(msg, index) in messages" :key="index" :class="['message-row', msg.role]">
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

            <div class="input-area glass-panel">
                <el-input
                        v-model="userInput"
                        type="textarea"
                        :autosize="{ minRows: 1, maxRows: 5 }"
                        placeholder="给 DeepSeek 发送消息..."
                        @keyup.enter.prevent="sendMessage"
                />
                <el-button
                        class="send-btn"
                        type="primary"
                        :disabled="!userInput || isTyping"
                        @click="sendMessage"
                        icon="Promotion"
                />
            </div>
        </main>
    </div>
</template>

<script setup lang="ts">
import { ref, nextTick } from 'vue'
import { MdPreview } from 'md-editor-v3'
import { ElMessage } from 'element-plus'

interface Message {
    role: 'user' | 'assistant';
    content: string;
}

const messages = ref<Message[]>([
    { role: 'assistant', content: '你好！我是你的 AI 助手，有什么可以帮你的吗？' }
])
const userInput = ref('')
const isTyping = ref(false)
const scrollRef = ref<HTMLElement | null>(null)
const historyTitle = ref('新对话')

const scrollToBottom = async () => {
    await nextTick()
    if (scrollRef.value) {
        scrollRef.value.scrollTop = scrollRef.value.scrollHeight
    }
}

const sendMessage = async () => {
    if (!userInput.value || isTyping.value) return

    const content = userInput.value
    messages.value.push({ role: 'user', content })
    userInput.value = ''
    isTyping.value = true
    scrollToBottom()

    // 准备 AI 占位回复
    messages.value.push({ role: 'assistant', content: '' })
    const lastIndex = messages.value.length - 1

    try {
        const response = await fetch('http://localhost:8090/blog/api/chat/completions', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                model: "DeepSeek-R1-0528-Qwen3-8B",
                stream: true, // 开启流式
                messages: messages.value.slice(0, -1) // 发送历史上下文实现连续对话
            })
        })

        if (!response.body) return
        const reader = response.body.getReader()
        const decoder = new TextDecoder()

        while (true) {
            const { done, value } = await reader.read()
            if (done) break

            const chunk = decoder.decode(value)
            // 处理 SSE 数据格式 (具体解析取决于后端转发的格式)
            const lines = chunk.split('\n')
            lines.forEach(line => {
                if (line.startsWith('data:')) {
                    try {
                        const data = JSON.parse(line.slice(5))
                        const delta = data.choices[0].delta.content
                        if (delta) {
                            messages.value[lastIndex].content += delta
                            scrollToBottom()
                        }
                    } catch (e) { /* 忽略心跳或非JSON数据 */ }
                }
            })
        }
    } catch (error) {
        ElMessage.error('对话出错，请稍后再试')
    } finally {
        isTyping.value = false
    }
}

const copyText = (text: string) => {
    navigator.clipboard.writeText(text)
    ElMessage.success('已复制到剪贴板')
}

const resetChat = () => {
    messages.value = [{ role: 'assistant', content: '你好！新对话已开启。' }]
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

.input-area {
  margin: 20px;
  padding: 10px;
  border-radius: 15px;
  display: flex;
  align-items: flex-end;
  gap: 10px;
  :deep(.el-textarea__inner) {
    background: transparent !important;
    box-shadow: none !important;
    border: none !important;
    color: white;
  }
}

.typing-indicator span {
  animation: blink 1.4s infinite;
  &:nth-child(2) { animation-delay: 0.2s; }
  &:nth-child(3) { animation-delay: 0.4s; }
}
@keyframes blink { 0% { opacity: 0.2; } 20% { opacity: 1; } 100% { opacity: 0.2; } }
</style>
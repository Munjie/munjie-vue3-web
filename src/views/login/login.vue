<template>
    <div class="login-page">
        <div class="stars-bg"></div>

        <div class="login-card glass-panel">
            <div class="mode-switch" @click="toggleLoginMode">
                <el-tooltip :content="loginMode === 'qr' ? '账号密码登录' : '扫码登录'" placement="left">
                    <div class="switch-icon">
                        <el-icon v-if="loginMode === 'qr'">
                            <Monitor/>
                        </el-icon>
                        <el-icon v-else>
                            <FullSelection/>
                        </el-icon>
                    </div>
                </el-tooltip>
            </div>

            <div class="login-header">
                <h2>{{ loginMode === 'qr' ? '微信扫码登录' : '欢迎回来' }}</h2>
                <p>{{ loginMode === 'qr' ? '安全、便捷、快速' : '使用您的账号密码登录' }}</p>
            </div>

            <div class="login-body">
                <transition name="fade-slide" mode="out-in">
                    <div v-if="loginMode === 'qr'" class="qr-view">
                        <div class="qr-container">
                            <img v-if="qrImg" :src="qrImg" class="qr-img"/>
                            <div class="qr-overlay" :class="loginStatus">
                                <div  v-if="['loading', 'refreshing'].includes(loginStatus)" class="status loading">
                                    <el-icon class="is-loading icon">
                                        <Loading/>
                                    </el-icon>
                                    <p>{{ loginStatus === 'loading' ? '加载中...' : '刷新中...' }}</p>
                                </div>
                                <div v-if="loginStatus === 'scanned'" class="status scanned">
                                    <el-icon class="success-icon">
                                        <Check/>
                                    </el-icon>
                                    <p style="margin-top: 20px; font-size: 14px; color: #666;">请在手机上确认登录</p>
                                </div>
                                <div v-if="loginStatus === 'failed'" class="status failed" @click="refreshQr">
                                    <el-icon>
                                        <Refresh/>
                                    </el-icon>
                                    <p>二维码失效，点击刷新</p>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div v-else class="form-view">
                        <el-form :model="loginForm" label-position="top">
                            <el-form-item label="用户名 / 邮箱">
                                <el-input
                                        v-model="loginForm.username"
                                        placeholder="请输入账号"
                                        prefix-icon="User"
                                />
                            </el-form-item>
                            <el-form-item label="密码">
                                <el-input
                                        v-model="loginForm.password"
                                        type="password"
                                        show-password
                                        placeholder="请输入密码"
                                        prefix-icon="Lock"
                                />
                            </el-form-item>
                            <div class="form-options">
                                <el-checkbox v-model="rememberMe">记住我</el-checkbox>
                                <span class="forgot-pwd">忘记密码？</span>
                            </div>
                            <el-button
                                    type="primary"
                                    class="submit-btn"
                                    :loading="isSubmitting"
                                    @click="handlePwdLogin"
                            >
                                登 录
                            </el-button>
                        </el-form>
                    </div>
                </transition>
            </div>

            <div class="login-footer">
                <p v-if="loginMode === 'pwd'">还没有账号？<span class="link">立即注册</span></p>
                <p v-else @click="loginMode = 'pwd'" class="link-switch">使用账号密码登录</p>
            </div>
        </div>
    </div>
</template>

<script setup lang="ts">
import {ref, reactive, onMounted, onUnmounted} from 'vue'
import {useRouter} from 'vue-router'
import axios from 'axios'
import {ElMessage, ElIcon} from 'element-plus'
import {Check, Loading, Monitor, Refresh} from '@element-plus/icons-vue'
import {useUserStore} from '../../stores'

const router = useRouter()
const userStore = useUserStore()
const qrImg = ref<string>('')
const scene = ref<string>('')
let ws: WebSocket | null = null
let currentObjectUrl = ''
let loginStatus = ref<'loading' | 'waiting' | 'scanned' | 'refreshing' | 'failed'>('loading')
// 状态管理
const loginMode = ref<'qr' | 'pwd'>('qr')
const isSubmitting = ref(false)
const rememberMe = ref(true)
// 账号登录表单
const loginForm = reactive({
    username: '',
    password: ''
})

const toggleLoginMode = () => {
    loginMode.value = loginMode.value === 'qr' ? 'pwd' : 'qr'
    if (loginMode.value === 'qr' && !qrImg.value) {
        loadQrCode()
    }
}

// 密码登录逻辑
const handlePwdLogin = async () => {
    if (!loginForm.username || !loginForm.password) {
        return ElMessage.warning('请填写完整的登录信息')
    }
    isSubmitting.value = true
    try {
        // 这里对接你的账号登录接口
        // const res = await axios.post('/api/auth/login', loginForm)
        // performLogin(res.token, ...)
        ElMessage.success('登录成功（演示）')
        await router.push('/')
    } finally {
        isSubmitting.value = false
    }
}

//NEW


const refreshQr = () => {
    if (loginStatus.value === 'loading') return
    loginStatus.value = 'refreshing'
    if (ws) {
        ws.close()
        ws = null
    }
    // 重新加载二维码
    loadQrCode().finally(() => {
        // 加载完成（无论成功失败）恢复等待状态
        setTimeout(() => {
            loginStatus.value = 'waiting'
        }, 800)
    })
}
const loadQrCode = async () => {
    loginStatus.value = 'loading'
    try {
        const response = await axios.get('/api/wechat/qr', {responseType: 'blob'})
        if (response.status !== 200) {
            ElMessage.error('服务器错误')
            return
        }
        scene.value = response.headers['x-scene'] || response.headers['X-Scene']
        if (!scene.value) {
            ElMessage.error('获取二维码失败，请刷新重新获取')
            loginStatus.value = 'failed'
            return
        }
        if (currentObjectUrl) URL.revokeObjectURL(currentObjectUrl)
        currentObjectUrl = URL.createObjectURL(response.data)
        qrImg.value = currentObjectUrl
        loginStatus.value = 'waiting'
        connectWebSocket()
    } catch (err) {
        ElMessage.error('加载二维码失败，请刷新重新获取')
        loginStatus.value = 'failed'
    }
}
const isDevelopment = import.meta.env.MODE === 'development'
const connectWebSocket = () => {
    if (!scene.value) return
    if (ws) ws.close()
    let backendHost = 'localhost:8090'
    if (!isDevelopment) {
        backendHost = "www.munjie.com"
    }
    const protocol = location.protocol === 'https:' ? 'wss:' : 'ws:'
    const wsUrl = `${protocol}//${backendHost}/ws/qrlogin?scene=${scene.value}`
    console.log('WebSocket 连接地址:', wsUrl)
    ws = new WebSocket(wsUrl)
    ws.onopen = () => console.log('WebSocket 连接成功！')
    ws.onerror = (e) => console.error('WebSocket 错误', e)
    ws.onclose = () => console.log('WebSocket 已关闭')
    ws.onmessage = (event) => {
        const msg = event.data
        console.log('收到后端推送:', msg)
        if (msg === 'SCANNED') {
            loginStatus.value = 'scanned'
        }
        if (msg.startsWith('SUCCESS|')) {
            const parts = msg.split('|')
            const token = parts[1]
            const userId = Number(parts[2])
            const username = parts[3]
            const avatar = parts[4]
            performLogin(token, userId, username, avatar)
        }
    }
}

const performLogin = async (token: string, userId: number, username: string, avatar: string) => {
    localStorage.setItem('vuems_name', username)
    userStore.setUsername(username)
    userStore.setUserid(userId)
    userStore.setToken(token)
    userStore.setAvatar(avatar)
    ElMessage.success('登录成功！')
    await router.push('/')
}


onMounted(() => loadQrCode())
onUnmounted(() => {
    if (ws) ws.close()
    if (currentObjectUrl) URL.revokeObjectURL(currentObjectUrl)
})


</script>

<style scoped lang="scss">
.login-page {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #0a0a0c; /* 暗黑背景基调 */
  position: relative;
  overflow: hidden;
}

/* 玻璃卡片样式 */
.login-card {
  position: relative;
  width: 420px;
  padding: 40px;
  border-radius: 24px;
  background: rgba(255, 255, 255, 0.03);
  border: 1px solid rgba(255, 255, 255, 0.08);
  backdrop-filter: blur(20px);
  box-shadow: 0 20px 50px rgba(0, 0, 0, 0.5);
  z-index: 10;
}

.mode-switch {
  position: absolute;
  top: 0;
  right: 0;
  width: 60px;
  height: 60px;
  background: rgba(255, 255, 255, 0.05);
  clip-path: polygon(100% 0, 0 0, 100% 100%);
  border-radius: 0 24px 0 0;
  cursor: pointer;
  transition: background 0.3s;

  &:hover {
    background: rgba(255, 255, 255, 0.1);
  }

  .switch-icon {
    position: absolute;
    top: 12px;
    right: 12px;
    color: var(--el-color-primary);
    font-size: 20px;
  }
}

.login-header {
  text-align: center;
  margin-bottom: 35px;

  h2 {
    color: #fff;
    font-size: 26px;
    font-weight: 600;
    margin-bottom: 10px;
  }

  p {
    color: #888;
    font-size: 14px;
  }
}

/* 二维码美化 */
.qr-container {
  position: relative;
  width: 220px;
  height: 220px;
  margin: 0 auto;
  padding: 10px;
  background: #fff;
  border-radius: 16px;

  .qr-img {
    width: 100%;
    height: 100%;
  }
}

.qr-overlay {
  position: absolute;
  inset: 0;
  background: rgba(0, 0, 0, 0.7);
  border-radius: 16px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  backdrop-filter: blur(4px);
  opacity: 0;
  pointer-events: none;
  transition: opacity 0.3s;
  color: #fff;
}
/* 加载中状态 */
.qr-overlay.loading {
    background: rgba(255, 255, 255, 0.8);
    pointer-events: auto;
}

.qr-overlay.loading .status {
    color: #409eff;
}

/* 等待扫码：浅遮罩，二维码清晰可见，能正常扫描 */
.qr-overlay.waiting {
    background: rgba(255, 255, 255, 0.2);
    pointer-events: none;
}

.qr-overlay.waiting .status {
    color: #999;
}

/* 已扫码状态：超大绿色打钩 */
.qr-overlay.scanned {
    background: rgba(255, 255, 255, 0.98);
    pointer-events: auto;
}

.qr-overlay.scanned .status {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
}

/* 加载中状态 */
.qr-overlay.failed {
    background: rgba(255, 255, 255, 0.8);
    pointer-events: auto;
}

.qr-overlay.failed .status {
    color: #d11530;
}

@keyframes checkPulse {
    0%, 100% {
        transform: scale(1);
    }
    50% {
        transform: scale(1.08);
    }
}

/* 表单美化 */
:deep(.el-form-item__label) {
  color: #aaa !important;
}

:deep(.el-input__wrapper) {
  background: rgba(255, 255, 255, 0.05) !important;
  box-shadow: none !important;
  border: 1px solid rgba(255, 255, 255, 0.1) !important;
  padding: 8px 15px;

  .el-input__inner {
    color: #fff;
  }
}

:deep(.el-input__wrapper.is-focus) {
  border-color: var(--el-color-primary) !important;
  background: rgba(255, 255, 255, 0.08) !important;
}

.form-options {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
  font-size: 13px;

  .forgot-pwd {
    color: #888;
    cursor: pointer;

    &:hover {
      color: #fff;
    }
  }
}

.submit-btn {
  width: 100%;
  padding: 12px;
  font-size: 16px;
  height: auto;
  border-radius: 12px;
}

.login-footer {
  text-align: center;
  margin-top: 30px;
  font-size: 13px;
  color: #666;

  .link, .link-switch {
    color: var(--el-color-primary);
    cursor: pointer;
    margin-left: 5px;
  }
}

/* 动画 */
.fade-slide-enter-active, .fade-slide-leave-active {
  transition: all 0.4s ease;
}

.fade-slide-enter-from {
  opacity: 0;
  transform: translateX(20px);
}

.fade-slide-leave-to {
  opacity: 0;
  transform: translateX(-20px);
}

.status {
    color: #666;
    font-size: 16px;
}

.status .icon {
    font-size: 48px;
    margin-bottom: 16px;
}

.status.waiting .icon {
    color: #999;
}

.status.scanned .icon {
    color: #07c160;
    animation: pulse 1.5s infinite;
}

.status.refreshing .icon {
    color: #409eff;
}

.success-icon {
    color: #67C23A;
    font-size: 160px !important;
    font-weight: bold;
    animation: checkScale 0.8s ease-in-out, checkPulse 2s ease-in-out infinite 0.8s;
}

.qr-overlay.scanned p {
    margin-top: 20px;
    font-size: 14px;
    color: #666;
}
</style>


<template>
    <div v-if="show" class="login-mask" @click.self="show = false">
        <div class="login-card">
            <h3>微信安全登录</h3>
            <div class="qr-wrapper">
                <img :src="qrCodeUrl" alt="扫码登录" />
                <div class="scan-hint">请使用微信扫描二维码</div>
            </div>
            <div class="footer-tips">登录即代表同意用户协议</div>
        </div>
    </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from 'vue';
import { useRouter } from 'vue-router';
import { v4 as uuidv4 } from 'uuid'; // npm install uuid

const show = ref(false);
const sceneId = ref('');
const qrCodeUrl = ref('');
let socket = null;
const router = useRouter();

const openLogin = () => {
    sceneId.value = uuidv4();
    // 生成小程序码的链接 (通常后端返回，此处示例直接拼接)
    // 规则：https://yourdomain.com/login?scene=sceneId
    qrCodeUrl.value = `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent('https://your-blog.com/mp?scene=' + sceneId.value)}`;

    initWebSocket();
    show.value = true;
};

const initWebSocket = () => {
    const wsUrl = `ws://localhost:8080/ws/login/${sceneId.value}`;
    socket = new WebSocket(wsUrl);

    socket.onmessage = (event) => {
        const data = JSON.parse(event.data);
        if (data.status === 'success') {
            localStorage.setItem('token', data.token);
            show.value = false;
            window.location.reload(); // 刷新登录状态
        }
    };
};

onUnmounted(() => socket?.close());
</script>

<style scoped>
.login-mask {
    position: fixed;
    inset: 0;
    background: rgba(0, 0, 0, 0.7);
    backdrop-filter: blur(8px);
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 999;
}
.login-card {
    background: #1e1e1e;
    border: 1px solid rgba(255, 255, 255, 0.1);
    padding: 40px;
    border-radius: 24px;
    text-align: center;
    color: #fff;
    box-shadow: 0 20px 50px rgba(0,0,0,0.5);
}
.qr-wrapper img {
    width: 200px;
    height: 200px;
    border-radius: 12px;
    margin: 20px 0;
    border: 4px solid #fff;
}
.scan-hint {
    color: #888;
    font-size: 14px;
}
</style>
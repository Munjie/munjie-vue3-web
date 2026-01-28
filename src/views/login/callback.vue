<template>
    <div class="login-callback">
        <div class="loading-spinner"></div>
        <p>正在进行 GitHub 安全验证...</p>
    </div>
</template>

<script setup>
import {onMounted} from 'vue';
import {useRouter} from 'vue-router';
import {useUserStore} from "../../stores";

const router = useRouter();
const userStore = useUserStore();

onMounted(() => {
    handleLogin();
});

const handleLogin = () => {
    const urlParams = new URLSearchParams(window.location.search || window.location.hash.split('?')[1]);
    const token = urlParams.get('token');
    const userId = urlParams.get('userId');
    const username = urlParams.get('username');
    const avatar = urlParams.get('avatar');
    const targetPathRaw = urlParams.get('state');
    if (token) {
        if (typeof username === "string") {
            userStore.setUsername(username)
        }
        userStore.setUserid(userId)
        userStore.setToken(token, 65555)
        if (typeof avatar === "string") {
            userStore.setAvatar(avatar)
        }
        let redirectUrl = '/';
        if (targetPathRaw) {
            router.replace(targetPathRaw);
        }
        router.replace(redirectUrl);
    } else {
        router.replace('/login?error=callback_failed');
    }
};
</script>

<style scoped>
.login-callback {
    height: 100vh;
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
    background-color: #f0f2f5;
}

/* 简单写一个转圈圈的动画 */
.loading-spinner {
    width: 50px;
    height: 50px;
    border: 5px solid #ddd;
    border-top-color: #333;
    border-radius: 50%;
    animation: spin 1s linear infinite;
    margin-bottom: 20px;
}

@keyframes spin {
    to {
        transform: rotate(360deg);
    }
}
</style>
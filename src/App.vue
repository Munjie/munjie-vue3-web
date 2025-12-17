<template>
    <TheHeader />
    <div class="app-content">
        <router-view v-slot="{ Component }">
            <transition name="fade" mode="out-in">
                <component :is="Component" />
            </transition>
        </router-view>
    </div>
    <TheFooter />
    <div class="ai-float-btn" @click="$router.push('/ai-chat')">
        <el-icon :size="28"><ChatDotRound /></el-icon>
    </div>
</template>

<script setup lang="ts">
import TheHeader from '@/components/TheHeader.vue'
import TheFooter from '@/components/TheFooter.vue'
import {ChatDotRound} from "@element-plus/icons-vue";
</script>

<style>
.app-content {
    padding-top: var(--header-height);
    min-height: 100vh;
}

/* 页面切换动画 */
.fade-enter-active,
.fade-leave-active {
    transition: opacity 0.3s ease;
}

.fade-enter-from,
.fade-leave-to {
    opacity: 0;
}
.ai-float-btn {
    position: fixed;
    bottom: 40px;
    left: 40px;
    width: 60px;
    height: 60px;
    background: var(--accent-color);
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    color: white;
    cursor: pointer;
    box-shadow: 0 0 20px rgba(99, 102, 241, 0.5);
    z-index: 1000;
    transition: transform 0.3s;
}
.ai-float-btn:hover { transform: scale(1.1) rotate(15deg); }
@media (max-width: 768px) { .ai-float-btn { left: 20px; bottom: 80px; width: 50px; height: 50px; } }
</style>
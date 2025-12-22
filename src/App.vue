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
<!--    <transition name="el-fade-in">
        <div
            v-if="showFloatBtn"
            class="ai-float-btn"
            @click="goToChat"
        >
            <el-icon :size="28"><ChatDotRound /></el-icon>
        </div>
    </transition>-->
</template>

<script setup lang="ts">
import TheHeader from '@/components/TheHeader.vue'
import TheFooter from '@/components/TheFooter.vue'
/*import {ChatDotRound} from "@element-plus/icons-vue";
import { computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
const route = useRoute()
const router = useRouter()
const showFloatBtn = computed(() => {
    if (!route || !route.path) return true;
    return route.path !== '/ai-chat'
})
const goToChat = () => {
    router.push('/ai-chat')
}*/
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
/*.ai-float-btn {
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
@media (max-width: 768px) { .ai-float-btn { left: 20px; bottom: 80px; width: 50px; height: 50px; } }*/
.ai-float-btn {
    position: fixed;
    right: 30px;
    bottom: 100px; /* 避开 Footer 的位置 */
    width: 56px;
    height: 56px;
    background: var(--accent-color, #6366f1);
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    color: white;
    cursor: pointer;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
    z-index: 99;
    transition: transform 0.3s;
}
.ai-float-btn:hover {
    transform: scale(1.1);
}
</style>
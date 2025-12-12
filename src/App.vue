<template>
    <TheHeader />
    <div class="app-content">
        <router-view v-slot="{ Component }">
            <transition name="fade" mode="out-in">
                <component :is="Component" />
            </transition>
        </router-view>
    </div>
</template>

<script setup lang="ts">
import TheHeader from './components/TheHeader.vue'
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
</style>
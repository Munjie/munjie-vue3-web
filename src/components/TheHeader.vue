<template>
    <header class="site-header glass-panel">
        <div class="container">
            <div class="logo">
                <span>JCloud</span>
            </div>
            <div class="actions">

                <nav class="desktop-nav">
                    <el-popover

                            placement="bottom-start"
                            hide-on-click
                            trigger="click"
                            :width="350"
                            popper-class="premium-search-popover"
                            :teleported="true"
                    >
                        <template #reference>
                            <div
                                    class="search-trigger-icon"
                                    @click="searchVisible = !searchVisible"
                            >
                                <el-icon :size="20">
                                    <Search/>
                                </el-icon>
                            </div>
                        </template>

                        <div class="search-panel-content">
                            <el-input
                                    v-model="searchText"
                                    placeholder="搜索文章..."
                                    size="large"
                                    clearable
                                    @keyup.enter="handleSearch"
                                    ref="searchInputRef"
                            >
                                <template #append>
                                    <el-button :icon="Search" @click="handleSearch"/>
                                </template>
                            </el-input>
                            <!-- <p class="search-hint">按 Enter 键搜索，或点击按钮</p> -->
                        </div>
                    </el-popover>

                    <router-link to="/">首页</router-link>
                    <router-link to="/chat">AI</router-link>
                    <router-link to="/tech">技术</router-link>
                    <router-link to="/life">生活</router-link>
                    <router-link to="/about">关于</router-link>

                    <div class="user-status-pc">
                        <template v-if="userStore.getToken">
                            <el-dropdown trigger="click">
                                <div class="avatar-wrapper">
                                    <el-avatar :size="32" class="custom-avatar" :src="userStore.getAvatar">
<!--                                        {{ userStore.getUsername?.charAt(0) || 'U' }}-->
                                    </el-avatar>
                                    <span class="user-name">{{ userStore.getUsername }}</span>
                                </div>
                                <template #dropdown>
                                    <el-dropdown-menu class="dark-dropdown">
                                        <el-dropdown-item @click="router.push('/chat')">我的聊天</el-dropdown-item>
                                        <el-dropdown-item @click="router.push('/profile')">个人中心</el-dropdown-item>
                                        <el-dropdown-item divided @click="handleLogout" class="logout-item">
                                            <el-icon><SwitchButton /></el-icon>退出登录
                                        </el-dropdown-item>
                                    </el-dropdown-menu>
                                </template>
                            </el-dropdown>
                        </template>
                        <template v-else>
                            <el-button type="primary" size="small" round @click="router.push('/login')">登录</el-button>
                        </template>
                    </div>
                </nav>

            </div>
            <div class="mobile-actions">
                <div class="mobile-search-icon" @click="toggleMobileSearch">
                    <el-icon :size="22"><Search /></el-icon>
                </div>
                <div class="mobile-menu-btn" @click="drawer = true">
                    <el-icon :size="24">
                        <Menu/>
                    </el-icon>
                </div>
                <el-drawer
                    v-model="drawer"
                    direction="rtl"
                    size="250px"
                    :show-close="false"
                    :append-to-body="true"
                    :z-index="3000"
                    class="mobile-drawer"
                >
                    <template #header>
                        <div class="drawer-custom-header">
                            <span class="logo-text">JCloud</span>
                            <el-icon class="close-icon" @click="drawer = false"><CloseBold /></el-icon>
                        </div>
                    </template>

                    <div class="mobile-menu-wrapper">
                        <div class="mobile-user-profile" v-if="userStore.getToken">
                            <div class="profile-content">
                                <el-avatar :size="48" class="premium-avatar" :src="userStore.getAvatar">
<!--                                    {{ userStore.getUsername?.charAt(0).toUpperCase() }}-->
                                </el-avatar>
                                <div class="user-meta">
                                    <span class="user-name">{{ userStore.getUsername }}</span>
                                </div>
                            </div>
                        </div>

                        <nav class="mobile-nav-list">
                            <router-link
                                v-for="link in menuLinks"
                                :key="link.path"
                                :to="link.path"
                                class="nav-item"
                                @click="drawer = false"
                            >
                                <span class="nav-label">{{ link.name }}</span>
                                <el-icon :size="14"><ArrowRight /></el-icon>
                            </router-link>
                        </nav>

                        <div class="mobile-drawer-footer">
                            <button v-if="userStore.getToken" class="premium-logout-btn" @click="handleLogout">
                                <el-icon :size="16"><SwitchButton /></el-icon>
                                <span>退出登录</span>
                            </button>
                            <button v-else class="premium-login-btn" @click="router.push('/login')">
                                立即登录
                            </button>
                        </div>
                    </div>
                </el-drawer>
            </div>
        </div>
        <transition name="slide-down">
            <div v-if="isMobileSearchActive" class="mobile-search-bar glass-panel">
                <el-input
                    v-model="searchText"
                    placeholder="输入关键词.."
                    size="large"
                    clearable
                    @keyup.enter="handleMobileSearch"
                    ref="mobileSearchInputRef"
                >
                    <template #append>
                        <el-button :icon="Search" @click="handleMobileSearch" />
                    </template>
                </el-input>
                <el-icon class="close-mobile-search" @click="isMobileSearchActive = false">
                    <CloseBold />
                </el-icon>
            </div>
        </transition>
    </header>
</template>

<script setup lang="ts">
import {ref, watch, nextTick} from 'vue'
import {useRoute} from 'vue-router'
import { Search, Menu, CloseBold, SwitchButton, ArrowRight } from '@element-plus/icons-vue'
import {ElInput} from 'element-plus';
import router from "../router";
import { useUserStore } from '../stores'
import {logout} from "../api/login.ts"; // 确保路径正确指向你的 Pinia Store

const userStore = useUserStore()

const drawer = ref(false)
const route = useRoute()

// 搜索 Popover 状态
const searchVisible = ref(false)
const searchText = ref('')
const searchInputRef = ref<InstanceType<typeof ElInput> | null>(null);

// 退出登录
const handleLogout = () => {
    logout().then(() => {
        userStore.logout()
    })
}
watch(() => route.path, () => { if (drawer.value) drawer.value = false })

// 核心逻辑：监听 Popover 状态，自动聚焦输入框
watch(searchVisible, (newVal) => {
    if (newVal) {
        nextTick(() => {
            // 自动聚焦，提升用户体验
            searchInputRef.value?.focus()
        })
    }
})
// 桌面搜索逻辑 (修改)
const handleSearch = () => {
    if (searchText.value.trim()) {
        // 关键步骤：执行路由跳转，设置 keyword 参数，并强制 page=1
        router.push({
            path: '/',
            query: {
                keyword: searchText.value.trim(),
                page: '1'
            }
        })

        // 搜索完成后关闭 Popover
        searchVisible.value = false
    } else {
        // 如果清空搜索，也应该清除路由中的 keyword 参数
        router.push({ path: '/', query: { page: '1' } })
    }
    // searchText.value = '' // 清空输入框
}

// 移动端搜索逻辑 (修改)
const handleMobileSearch = () => {
    if (searchText.value.trim()) {
        // 关键步骤：执行路由跳转，设置 keyword 参数，并强制 page=1
        router.push({
            path: '/',
            query: {
                keyword: searchText.value.trim(),
                page: '1'
            }
        })

        // 搜索完成后关闭搜索栏
        isMobileSearchActive.value = false
    } else {
        // 如果清空搜索，也应该清除路由中的 keyword 参数
        router.push({ path: '/', query: { page: '1' } })
    }
    searchText.value = '' // 清空输入框
}
// 搜索 Popover 状态 (桌面)
// 新增：移动端搜索状态
const isMobileSearchActive = ref(false)
const mobileSearchInputRef = ref<InstanceType<typeof ElInput> | null>(null);

// 切换移动端搜索状态并聚焦
const toggleMobileSearch = () => {
    isMobileSearchActive.value = !isMobileSearchActive.value
    if (isMobileSearchActive.value) {
        nextTick(() => {
            mobileSearchInputRef.value?.focus()
        })
    }
}

const menuLinks = [
    {name: '首页', path: '/'},
    {name: 'AI', path: '/chat'},
    {name: '技术', path: '/tech'},
    {name: '生活', path: '/life'},
    {name: '关于', path: '/about'},
    {name: '个人中心', path: '/profile'}
]

watch(
    () => route.path,
    () => {
        // 只有当抽屉是打开状态时才执行关闭操作
        if (drawer.value) {
            drawer.value = false
        }
    }
)
</script>

<style scoped lang="scss">
.site-header {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: var(--header-height);
  z-index: 100;
  display: flex;
  align-items: center;

  .container {
    width: 90%;
    max-width: 1200px;
    margin: 0 auto;
    display: flex;
    justify-content: space-between;
    align-items: center;
  }
}

.logo {
  font-size: 1.5rem;
  font-weight: 800;
  letter-spacing: 2px;
  display: flex;
  align-items: center;
  gap: 10px;

  span {
    background: linear-gradient(to right, #fff, #a5a5a5);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
  }
}

.desktop-nav {
  display: none;
  gap: 40px;

  a {
    text-decoration: none;
    color: var(--text-secondary);
    font-size: 0.95rem;
    transition: color 0.3s;

    &:hover, &.router-link-active {
      color: var(--accent-color);
    }
  }

  // PC端显示
  @media (min-width: 768px) {
    display: flex;
  }
}

.mobile-menu-btn {
  display: block;
  cursor: pointer;
  color: var(--text-primary);

  // PC端隐藏
  @media (min-width: 768px) {
    display: none;
  }
}

// 移动端菜单样式
.mobile-nav {
  display: flex;
  flex-direction: column;
  gap: 20px;

  a {
    font-size: 1.2rem;
    color: var(--text-primary);
    text-decoration: none;
    border-bottom: 1px solid #333;
    padding-bottom: 10px;
  }
}

//
.actions {
  display: flex;
  align-items: center;
  gap: 20px;
}

.desktop-nav {
  // 确保所有导航项（包括搜索图标）垂直居中对齐
  display: flex;
  align-items: center;
  gap: 40px;

  @media (max-width: 768px) {
    display: none;
  }
}

.search-trigger-icon {
  // 搜索图标样式，使其看起来像一个导航链接
  display: flex;
  align-items: center;
  color: var(--text-secondary);
  cursor: pointer;
  transition: color 0.3s;

  &:hover {
    color: var(--accent-color);
  }
}

.search-panel-content {
  padding: 5px 0 0;
}

.search-hint {
  margin-top: 10px;
  font-size: 0.8rem;
  color: var(--text-secondary);
  text-align: center;
}

// 保持移动端菜单按钮的可见性
.mobile-menu-btn {
  display: block;
  cursor: pointer;
  color: var(--text-primary);

  @media (min-width: 768px) {
    display: none;
  }
}

.mobile-actions {
    display: none; /* 桌面端隐藏 */
    align-items: center;
    gap: 20px;

    @media (max-width: 768px) {
        display: flex; /* 移动端显示 */
        // 当移动搜索激活时，隐藏所有图标，由 JS 控制，但 CSS 也可以辅助
        &.hidden {
            visibility: hidden;
            opacity: 0;
        }
    }
}

.mobile-search-icon, .mobile-menu-btn {
    cursor: pointer;
    color: var(--text-primary);
    transition: color 0.3s;
    &:hover { color: var(--accent-color); }
}

// =======================
// 移动端全宽搜索栏样式 (新增)
// =======================
.mobile-search-bar {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: var(--header-height);
    padding: 0 20px;
    box-sizing: border-box;
    display: flex;
    align-items: center;
    z-index: 90; // 略低于 drawer (z-index: 100)

    // 继承玻璃面板样式，使其高级
    background: var(--glass-bg);
    backdrop-filter: blur(10px);
    border: 1px solid var(--glass-border);

    .close-mobile-search {
        cursor: pointer;
        margin-left: 15px;
        font-size: 1.4rem;
        color: var(--text-secondary);
    }

    // 覆盖输入框样式使其更高级
    :deep(.el-input__wrapper) {
        background-color: rgba(255, 255, 255, 0.05) !important;
        box-shadow: none !important;
        border: 1px solid rgba(255, 255, 255, 0.1);
        transition: border-color 0.3s;

        &:focus-within {
            border-color: var(--accent-color) !important;
        }
    }

    // 覆盖搜索按钮样式
    :deep(.el-input-group__append) {
        background-color: var(--accent-color) !important;
        color: #fff !important;
        border: none !important;
    }

    // 确保它只在小屏幕上生效，大屏幕时隐藏
    @media (min-width: 769px) {
        display: none;
    }
}

// =======================
// 平滑弹出动画 (Slide Down)
// =======================

.slide-down-enter-active,
.slide-down-leave-active {
    transition: transform 0.3s ease-out;
}

.slide-down-enter-from,
.slide-down-leave-to {
    transform: translateY(-100%);
}

/* 浅色模式 */
.mlogo {
    color: #6366f1; /* 深科技蓝灰 */
}

.dark .mlogo {
    color: #6366f1;
}

/* --- 新增：用户状态样式 --- */
.user-status-pc {
    margin-left: 10px;
    display: flex;
    align-items: center;

    .avatar-wrapper {
        display: flex;
        align-items: center;
        gap: 8px;
        cursor: pointer;
        padding: 4px 8px;
        border-radius: 20px;
        transition: background 0.3s;

        &:hover {
            background: rgba(255, 255, 255, 0.05);
        }

        .user-name {
            font-size: 0.9rem;
            color: var(--text-secondary);
        }
    }
}

.custom-avatar {
    //background: linear-gradient(135deg, #6366f1, #a855f7);
    color: #fff;
    font-weight: bold;
    border: 1px solid rgba(255, 255, 255, 0.1);
}

/* 移动端抽屉内的用户卡片 */
.mobile-user-card {
    display: flex;
    align-items: center;
    gap: 15px;
    padding: 20px;
    margin-bottom: 20px;
    background: rgba(255, 255, 255, 0.03);
    border-radius: 12px;

    .info {
        .name {
            font-size: 1.1rem;
            font-weight: bold;
            color: #fff;
            margin: 0;
        }
        .role {
            font-size: 0.8rem;
            color: #888;
            margin-top: 4px;
        }
    }
}

.mobile-logout {
    margin-top: 30px;
    padding: 12px;
    text-align: center;
    color: #f56c6c;
    border: 1px solid rgba(245, 108, 108, 0.2);
    border-radius: 8px;
    cursor: pointer;
}

/* --- 下拉菜单暗黑样式 --- */
:deep(.dark-dropdown) {
    background-color: #1a1a1a !important;
    border: 1px solid rgba(255, 255, 255, 0.1) !important;

    .el-dropdown-menu__item {
        color: #ccc !important;
        &:hover {
            background-color: rgba(255, 255, 255, 0.05) !important;
            color: var(--accent-color) !important;
        }
    }

    .logout-item {
        color: #f56c6c !important;
    }
}

/* 抽屉整体背景优化 */
:deep(.mobile-drawer) {
    background-color: #0f1115 !important; /* 更深的底色 */

    .el-drawer__header {
        margin-bottom: 0;
        padding: 20px;
        border-bottom: 1px solid rgba(255, 255, 255, 0.05);
    }
}

/*.drawer-custom-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    width: 100%;
    .logo-text {
        font-weight: 800;
        background: linear-gradient(to right, #6366f1, #a855f7);
        -webkit-background-clip: text;
        -webkit-text-fill-color: transparent;
    }
}*/
.drawer-custom-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    width: 100%;

    .logo-text {
        font-size: 1.2rem;
        font-weight: 800;
        background: linear-gradient(to right, #6366f1, #a855f7);
        -webkit-background-clip: text;
        -webkit-text-fill-color: transparent;
    }

    /* 优化关闭图标样式 */
    .close-icon {
        font-size: 1.2rem;
        color: rgba(255, 255, 255, 0.5); /* 半透明灰色 */
        cursor: pointer;
        transition: all 0.3s;
        padding: 5px;
        border-radius: 8px;

        &:hover {
            color: #fff;
            background: rgba(255, 255, 255, 0.1); /* 悬浮时有个小底色 */
            transform: rotate(90deg); /* 旋转特效，更有动感 */
        }
    }
}


.mobile-menu-wrapper {
    height: 100%;
    display: flex;
    flex-direction: column;
    padding: 20px;
}

/* 用户信息卡片优化 */
.mobile-user-profile {
    background: rgba(255, 255, 255, 0.03);
    border: 1px solid rgba(255, 255, 255, 0.08);
    border-radius: 20px;
    padding: 20px;
    margin-bottom: 30px;
    backdrop-filter: blur(10px);

    .profile-content {
        display: flex;
        align-items: center;
        gap: 15px;
    }

    .premium-avatar {
        //background: linear-gradient(135deg, #6366f1, #a855f7);
        border: 2px solid rgba(255, 255, 255, 0.2);
        box-shadow: 0 8px 16px rgba(0, 0, 0, 0.3);
        font-size: 24px;
        font-weight: bold;
    }

    .user-meta {
        display: flex;
        flex-direction: column;
        .user-name {
            font-size: 1.2rem;
            font-weight: 600;
            color: #fff;
        }
        .user-status {
            font-size: 0.8rem;
            color: rgba(255, 255, 255, 0.4);
            margin-top: 4px;
        }
    }
}

/* 导航项优化 */
.mobile-nav-list {
    flex: 1;
    .nav-item {
        display: flex;
        justify-content: space-between;
        align-items: center;
        padding: 18px 0;
        border-bottom: 1px solid rgba(255, 255, 255, 0.05);
        text-decoration: none;
        color: rgba(255, 255, 255, 0.7);
        transition: all 0.3s;

        .nav-label { font-size: 1.1rem; }

        &:active {
            color: #6366f1;
            padding-left: 10px;
        }
    }
}

/* 退出按钮优化 */
.mobile-drawer-footer {
    padding-bottom: env(safe-area-inset-bottom); // 适配苹果刘海屏底部

    .premium-logout-btn {
        width: 100%;
        height: 54px;
        background: rgba(245, 108, 108, 0.1);
        border: 1px solid rgba(245, 108, 108, 0.2);
        border-radius: 16px;
        color: #f56c6c;
        display: flex;
        align-items: center;
        justify-content: center;
        gap: 10px;
        font-size: 1rem;
        font-weight: 500;
        cursor: pointer;
        transition: all 0.3s;

        &:active {
            background: rgba(245, 108, 108, 0.2);
            transform: scale(0.98);
        }
    }

    .premium-login-btn {
        @extend .premium-logout-btn;
        background: rgba(99, 102, 241, 0.1);
        border-color: rgba(99, 102, 241, 0.2);
        color: #6366f1;
    }
}

/* 抽屉整体 */
:deep(.mobile-drawer) {
    background-color: #0f1115 !important;

    .el-drawer__header {
        padding: 15px 20px; /* 缩小头部高度 */
        margin-bottom: 0;
    }
}

.mobile-menu-wrapper {
    height: 100%;
    display: flex;
    flex-direction: column;
    padding: 0 20px 20px; /* 减小内边距 */
}

/* 用户卡片缩小 */
.mobile-user-profile {
    background: rgba(255, 255, 255, 0.03);
    border: 1px solid rgba(255, 255, 255, 0.08);
    border-radius: 16px; /* 稍微减小圆角 */
    padding: 15px; /* 缩小内边距 */
    margin: 15px 0 20px; /* 减小外边距 */

    .premium-avatar {
        /* 头像由 60px 缩小到 48px */
        //background: linear-gradient(135deg, #6366f1, #a855f7);
        border: 1px solid rgba(255, 255, 255, 0.2);
        font-size: 18px; /* 缩小字母大小 */
    }

    .user-meta {
        .user-name {
            font-size: 1rem; /* 从 1.2rem 缩小 */
            font-weight: 600;
        }
        .user-status {
            font-size: 0.75rem; /* 缩小状态文字 */
            opacity: 0.5;
        }
    }
}

/* 导航列表缩小 */
.mobile-nav-list {
    .nav-item {
        padding: 14px 0; /* 从 18px 缩小，间距更紧凑 */
        color: rgba(255, 255, 255, 0.6);

        .nav-label {
            font-size: 0.95rem; /* 从 1.1rem 缩小 */
        }

        &:active {
            color: #6366f1;
            padding-left: 5px; /* 减小点击位移量 */
        }
    }
}

/* 退出按钮缩小 */
.mobile-drawer-footer {
    padding-top: 10px;

    .premium-logout-btn, .premium-login-btn {
        height: 44px; /* 从 54px 缩小到 44px */
        border-radius: 12px; /* 减小圆角 */
        font-size: 0.9rem; /* 缩小字体 */
        gap: 8px;
    }
}

/* 自定义关闭按钮也同步缩小 */
.drawer-custom-header {
    .logo-text { font-size: 1.1rem; }
    .close-icon {
        font-size: 1.1rem;
        color: #666;
    }
}
</style>
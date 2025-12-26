<template>
    <header class="site-header glass-panel">
        <div class="container">
            <div class="logo">
                <span>JCloud</span>
            </div>
            <div class="actions">

                <nav class="desktop-nav">
                    <el-popover
                            :visible="searchVisible"
                            placement="bottom-start"
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
                                    placeholder="输入关键词..."
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
                                    <el-avatar :size="32" class="custom-avatar">
                                        {{ userStore.getUsername?.charAt(0) || 'U' }}
                                    </el-avatar>
                                    <span class="user-name">{{ userStore.getUsername }}</span>
                                </div>
                                <template #dropdown>
                                    <el-dropdown-menu class="dark-dropdown">
                                        <el-dropdown-item @click="router.push('/chat')">我的聊天</el-dropdown-item>
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
                        size="30%"
                        :append-to-body="true"
                        :z-index="3000"
                        class="mobile-drawer"
                >
                    <template #header>
                        <span class="drawer-title">MENU</span>
                    </template>

                    <nav class="mobile-nav">
                        <div class="mobile-user-card glass-panel" v-if="userStore.getToken">
                            <el-avatar :size="50">{{ userStore.getUsername?.charAt(0) }}</el-avatar>
                            <div class="info">
                                <p class="name">{{ userStore.getUsername }}</p>
                            </div>
                        </div>
                        <div v-for="link in menuLinks" :key="link.path" class="mobile-nav-item">
                            <router-link :to="link.path" @click="drawer = false">
                                {{ link.name }}
                            </router-link>
                        </div>
                        <div v-if="userStore.getToken" class="mobile-logout" @click="handleLogout">
                            退出登录
                        </div>
                        <div v-else class="mobile-logout" @click="router.push('/login')">
                            前往登录
                        </div>
                    </nav>
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
import { Search, Menu, CloseBold } from '@element-plus/icons-vue'
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
    searchText.value = '' // 清空输入框
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
    {name: '关于', path: '/about'}
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
    background: linear-gradient(135deg, #6366f1, #a855f7);
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
</style>
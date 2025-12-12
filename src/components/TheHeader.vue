<template>
    <header class="site-header glass-panel">
        <div class="container">
            <div class="logo">
                <el-icon :size="24" color="#6366f1">
                    <Moon/>
                </el-icon>
                <span>NOCTURNE</span>
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
                                <el-icon :size="20"><Search /></el-icon>
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
                                    <el-button :icon="Search" @click="handleSearch" />
                                </template>
                            </el-input>
                            <p class="search-hint">按 Enter 键搜索，或点击按钮</p>
                        </div>
                    </el-popover>

                    <router-link to="/">首页</router-link>
                    <router-link to="/tech">技术</router-link>
                    <router-link to="/life">生活</router-link>
                    <router-link to="/about">关于</router-link>
                </nav>

                <div class="mobile-menu-btn" @click="drawer = true">
                    <el-icon :size="24">
                        <Menu/>
                    </el-icon>
                </div>
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
                    <div v-for="link in menuLinks" :key="link.path" class="mobile-nav-item">
                        <router-link :to="link.path" @click="drawer = false">
                            {{ link.name }}
                        </router-link>
                    </div>
                </nav>
            </el-drawer>
        </div>
    </header>
</template>

<script setup lang="ts">
import { ref, watch, nextTick } from 'vue'
import { useRoute } from 'vue-router'
import { Search, Menu, Moon } from '@element-plus/icons-vue' // 确保引入 Search 图标
import { ElInput } from 'element-plus';

const drawer = ref(false)
const route = useRoute()

// 搜索 Popover 状态
const searchVisible = ref(false)
const searchText = ref('')
const searchInputRef = ref<InstanceType<typeof ElInput> | null>(null);

// 核心逻辑：监听 Popover 状态，自动聚焦输入框
watch(searchVisible, (newVal) => {
    if (newVal) {
        nextTick(() => {
            // 自动聚焦，提升用户体验
            searchInputRef.value?.focus()
        })
    }
})

// 处理搜索逻辑
const handleSearch = () => {
    if (searchText.value.trim()) {
        console.log('执行搜索:', searchText.value)
        // 实际应用中：
        // 1. router.push({ path: '/search', query: { q: searchText.value } })
        // 2. 清空 searchText.value

        // 搜索完成后关闭 Popover
        searchVisible.value = false
    }
}
const menuLinks = [
    {name: '首页', path: '/'},
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

// 隐藏移动端搜索图标（因为我们只在桌面使用 Popover）
.mobile-search-icon {
    display: none;
}
</style>
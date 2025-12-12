<template>
    <header class="site-header glass-panel">
        <div class="container">
            <div class="logo">
                <el-icon :size="24" color="#6366f1"><Moon /></el-icon>
                <span>NOCTURNE</span>
            </div>

            <nav class="desktop-nav">
                <router-link to="/">首页</router-link>
                <router-link to="/tech">技术</router-link>
                <router-link to="/life">生活</router-link>
                <router-link to="/about">关于</router-link>
            </nav>

            <div class="mobile-menu-btn" @click="drawer = true">
                <el-icon :size="24"><Menu /></el-icon>
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
import {ref, watch} from 'vue'
const drawer = ref(false)
import { useRoute } from 'vue-router'
const route = useRoute()
const menuLinks = [
    { name: '首页', path: '/' },
    { name: '技术', path: '/tech' },
    { name: '生活', path: '/life' },
    { name: '关于', path: '/about' }
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
</style>
<template>
    <div class="home-view">
        <section class="hero">
            <div class="hero-content">
                <h1 class="animate-fade-up">探索数字深渊</h1>
                <p class="animate-fade-up delay-1">Vue3 / TypeScript / Design</p>
            </div>
        </section>

        <main class="container">
            <div class="section-title">最新文章</div>

            <el-row :gutter="24">
                <el-col
                    v-for="post in posts"
                    :key="post.id"
                    :xs="24" :sm="12" :md="8"
                    class="mb-24"
                >
                    <PostCard :post="post" />
                </el-col>
            </el-row>
        </main>
    </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import PostCard from '../components/PostCard.vue'

// 模拟数据
const posts = ref([
    {
        id: 1,
        title: 'Vue 3 Composition API 深度解析',
        summary: '深入探讨 setup 语法糖与响应式原理，如何构建更高效的前端应用...',
        date: '2023-10-24',
        category: '前端',
        cover: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?q=80&w=2564&auto=format&fit=crop'
    },
    {
        id: 2,
        title: '构建暗黑模式 UI 的设计哲学',
        summary: '不仅仅是反转颜色。探讨对比度、阴影以及视觉层级在暗黑设计中的运用。',
        date: '2023-10-20',
        category: '设计',
        cover: 'https://images.unsplash.com/photo-1550751827-4bd374c3f58b?q=80&w=2670&auto=format&fit=crop'
    },
    {
        id: 3,
        title: 'TypeScript 高级类型体操',
        summary: '掌握泛型、条件类型与映射类型，让你的代码类型安全固若金汤。',
        date: '2023-10-15',
        category: '后端',
        cover: 'https://images.unsplash.com/photo-1555066931-4365d14bab8c?q=80&w=2670&auto=format&fit=crop'
    },
    {
        id: 4,
        title: 'WebGL 与 Three.js 入门',
        summary: '在浏览器中创造令人惊叹的 3D 体验，从基础几何体到复杂的着色器编写。',
        date: '2023-10-10',
        category: '图形学',
        cover: 'https://images.unsplash.com/photo-1614728263952-84ea256f9679?q=80&w=2616&auto=format&fit=crop'
    }
])
</script>

<style scoped lang="scss">
.hero {
    height: 60vh;
    display: flex;
    align-items: center;
    justify-content: center;
    text-align: center;
    margin-bottom: 60px;

    h1 {
        font-size: 3.5rem;
        font-weight: 900;
        margin: 0;
        background: linear-gradient(135deg, #fff 0%, #6366f1 100%);
        -webkit-background-clip: text;
        -webkit-text-fill-color: transparent;

        @media (max-width: 768px) {
            font-size: 2.5rem;
        }
    }

    p {
        font-size: 1.2rem;
        color: var(--text-secondary);
        margin-top: 10px;
        letter-spacing: 4px;
    }
}

.container {
    width: 90%;
    max-width: 1200px;
    margin: 0 auto;
    padding-bottom: 60px;
}

.section-title {
    font-size: 1.5rem;
    font-weight: bold;
    margin-bottom: 30px;
    border-left: 4px solid var(--accent-color);
    padding-left: 15px;
}

.mb-24 {
    margin-bottom: 24px;
}

// 简单入场动画
.animate-fade-up {
    animation: fadeUp 1s ease-out forwards;
    opacity: 0;
    transform: translateY(20px);
}

.delay-1 {
    animation-delay: 0.2s;
}

@keyframes fadeUp {
    to {
        opacity: 1;
        transform: translateY(0);
    }
}
</style>
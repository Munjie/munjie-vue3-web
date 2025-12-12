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
                        v-for="post in displayedPosts"
                        :key="post.id"
                        :xs="24" :sm="12" :md="8"
                        class="mb-24"
                >
                    <PostCard :post="post"/>
                </el-col>
            </el-row>

            <div class="pagination-area">
                <el-pagination
                        :total="totalPosts"
                        :page-size="pageSize"
                        :current-page="currentPage"
                        @current-change="handleCurrentChange"
                        layout="prev, pager, next"
                        hide-on-single-page
                        background
                        class="premium-pagination"
                />
            </div>
        </main>
    </div>
</template>

<script setup lang="ts">
import {ref, computed, onMounted} from 'vue'
import PostCard from '../components/PostCard.vue'
import {useRoute, useRouter} from 'vue-router'
import {pageHomeArticle} from "../api/home.ts";
import type {ArticleVO} from "../types/article.ts";
const ALL_POSTS = ref<ArticleVO[]>([])
onMounted(() => {
    fetchList()
})
// 模拟全部文章数据 (假设有 15 篇文章)
/*const ALL_POSTS = [
    {
        id: 100,
        title: 'Vue 3 Composition API 深度解析',
        summary: '深入探讨 setup 语法糖与响应式原理，如何构建更高效的前端应用...',
        date: '2023-10-24',
        category: '前端',
        cover: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?q=80&w=2564&auto=format&fit=crop'
    },
    {
        id: 200,
        title: '构建暗黑模式 UI 的设计哲学',
        summary: '不仅仅是反转颜色。探讨对比度、阴影以及视觉层级在暗黑设计中的运用。',
        date: '2023-10-20',
        category: '设计',
        cover: 'https://images.unsplash.com/photo-1550751827-4bd374c3f58b?q=80&w=2670&auto=format&fit=crop'
    },
    {
        id: 300,
        title: 'TypeScript 高级类型体操',
        summary: '掌握泛型、条件类型与映射类型，让你的代码类型安全固若金汤。',
        date: '2023-10-15',
        category: '后端',
        cover: 'https://images.unsplash.com/photo-1555066931-4365d14bab8c?q=80&w=2670&auto=format&fit=crop'
    },
    {
        id: 400,
        title: 'WebGL 与 Three.js 入门',
        summary: '在浏览器中创造令人惊叹的 3D 体验，从基础几何体到复杂的着色器编写。',
        date: '2023-10-10',
        category: '图形学',
        cover: 'https://images.unsplash.com/photo-1614728263952-84ea256f9679?q=80&w=2616&auto=format&fit=crop'
    },
    {
        id: 1,
        title: 'Vue 3 Composition API 深度解析',
        summary: '...',
        date: '2023-10-24',
        category: '前端',
        cover: 'https://images.unsplash.com/photo-1555066931-4365d14bab8c?q=80&w=2670&auto=format&fit=crop'
    },
    {
        id: 2,
        title: '构建暗黑模式 UI 的设计哲学',
        summary: '...',
        date: '2023-10-20',
        category: '设计',
        cover: 'https://images.unsplash.com/photo-1555066931-4365d14bab8c?q=80&w=2670&auto=format&fit=crop'
    },
    {
        id: 3,
        title: 'TypeScript 高级类型体操',
        summary: '...',
        date: '2023-10-15',
        category: '后端',
        cover: 'https://images.unsplash.com/photo-1555066931-4365d14bab8c?q=80&w=2670&auto=format&fit=crop'
    },
    {
        id: 4,
        title: 'WebGL 与 Three.js 入门',
        summary: '...',
        date: '2023-10-10',
        category: '图形学',
        cover: 'https://images.unsplash.com/photo-1555066931-4365d14bab8c?q=80&w=2670&auto=format&fit=crop'
    },
    // 增加更多模拟数据以实现分页
    {
        id: 5,
        title: '使用 Vite 构建高性能应用',
        summary: '...',
        date: '2023-10-05',
        category: '前端',
        cover: 'https://images.unsplash.com/photo-1555066931-4365d14bab8c?q=80&w=2670&auto=format&fit=crop'
    },
    {
        id: 6,
        title: '探索 WebAssembly 的边界',
        summary: '...',
        date: '2023-09-30',
        category: '后端',
        cover: 'https://images.unsplash.com/photo-1555066931-4365d14bab8c?q=80&w=2670&auto=format&fit=crop'
    },
    {
        id: 7,
        title: '设计系统中的 Token 管理',
        summary: '...',
        date: '2023-09-25',
        category: '设计',
        cover: 'https://images.unsplash.com/photo-1555066931-4365d14bab8c?q=80&w=2670&auto=format&fit=crop'
    },
    {
        id: 8,
        title: 'Next.js Server Components',
        summary: '...',
        date: '2023-09-20',
        category: '前端',
        cover: 'https://images.unsplash.com/photo-1555066931-4365d14bab8c?q=80&w=2670&auto=format&fit=crop'
    },
    {
        id: 9,
        title: '数据库优化：索引与查询',
        summary: '...',
        date: '2023-09-15',
        category: '后端',
        cover: 'https://images.unsplash.com/photo-1555066931-4365d14bab8c?q=80&w=2670&auto=format&fit=crop'
    },
    {
        id: 10,
        title: 'UI/UX 趋势预测 2024',
        summary: '...',
        date: '2023-09-10',
        category: '设计',
        cover: 'https://images.unsplash.com/photo-1555066931-4365d14bab8c?q=80&w=2670&auto=format&fit=crop'
    },
    {
        id: 11,
        title: 'Rust 语言入门',
        summary: '...',
        date: '2023-09-05',
        category: '后端',
        cover: 'https://images.unsplash.com/photo-1555066931-4365d14bab8c?q=80&w=2670&auto=format&fit=crop'
    },
    {
        id: 12,
        title: 'Vue Use 实用指南',
        summary: '...',
        date: '2023-09-01',
        category: '前端',
        cover: 'https://images.unsplash.com/photo-1555066931-4365d14bab8c?q=80&w=2670&auto=format&fit=crop'
    },
    // 总共 12 篇
]*/

const route = useRoute()
const router = useRouter()

const pageSize = ref(6) // 每页显示 6 篇文章
const totalPosts = ref()
const fetchList = async () => {
    try {
        let pageForm = {
            pageSize: pageSize.value,
            pageNum: currentPage.value
        }
        const res = await pageHomeArticle(pageForm);
        ALL_POSTS.value = res.data.records,
            totalPosts.value = res.data.total

    } catch (error) {
        console.log('登录请求失败，请稍后再试' + error);

    }
};
// 从路由获取当前页码，默认为 1
const currentPage = computed({
    get: () => {
        // 确保从 URL 获取的页码是数字，如果不存在或无效则默认为 1
        const page = parseInt(route.query.page as string || '1')
        return isNaN(page) || page < 1 ? 1 : page
    },
    set: (val) => {
        // 改变页码时，更新路由
        router.push({query: {...route.query, page: val.toString()}})
    }
})

// 计算当前页应该显示的文章
const displayedPosts = computed(() => {
    const start = (currentPage.value - 1) * pageSize.value
    const end = start + pageSize.value
    return ALL_POSTS.value.slice(start, end)
})

// 分页变化处理函数
const handleCurrentChange = (val: number) => {
    currentPage.value = val
    // 优化：切换页码后自动滚动到文章列表顶部
    window.scrollTo({top: 300, behavior: 'smooth'})
}
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

.pagination-area {
  margin-top: 50px;
  padding-top: 20px;
  display: flex;
  justify-content: center;
}

// =======================
// 高级分页栏样式 (深度定制)
// =======================
.premium-pagination {
  --el-pagination-bg-color: transparent; // 整体背景透明

  :deep(.el-pager) {
    li {
      // 默认页码按钮
      background-color: var(--bg-secondary) !important;
      border: 1px solid var(--glass-border);
      color: var(--text-primary);
      border-radius: 6px;
      margin: 0 5px;
      transition: all 0.3s;
      min-width: 40px; // 增大点击区域
      height: 40px;
      line-height: 40px;

      &:hover:not(.is-active) {
        background-color: rgba(99, 102, 241, 0.1) !important; // 轻微的悬浮高亮
        color: var(--accent-color);
      }

      // 当前激活页码 (科技感重点)
      &.is-active {
        background: var(--accent-color) !important; // 使用主题色填充
        color: #fff !important;
        font-weight: bold;
        // 增加微妙的阴影/发光效果
        box-shadow: 0 0 15px rgba(99, 102, 241, 0.6);
        border-color: var(--accent-color);
      }
    }
  }

  // 前后按钮 (Prev/Next)
  :deep(.btn-prev),
  :deep(.btn-next) {
    background-color: var(--bg-secondary) !important;
    border: 1px solid var(--glass-border);
    color: var(--text-secondary);
    border-radius: 6px;
    margin: 0 10px;
    height: 40px;
    min-width: 40px;

    &:hover {
      background-color: var(--accent-color) !important;
      border-color: var(--accent-color);
      color: #fff !important;
    }
  }

  // 响应式调整：移动端
  @media (max-width: 500px) {
    :deep(.el-pager) li,
    :deep(.btn-prev),
    :deep(.btn-next) {
      min-width: 30px;
      height: 30px;
      line-height: 30px;
      font-size: 0.8rem;
    }
  }
}
</style>
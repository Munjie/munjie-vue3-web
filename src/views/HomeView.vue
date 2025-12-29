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

            <el-row :gutter="24" v-loading="loading">
                <el-col
                        v-for="post in ALL_POSTS"
                        :key="post.id"
                        :xs="24" :sm="12" :md="8"
                        class="mb-24"
                >
                    <PostCard :post="post"/>
                </el-col>
            </el-row>
            <el-empty v-if="!loading && ALL_POSTS.length === 0" description="暂无文章"></el-empty>
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
import {ref, computed, onMounted, watch} from 'vue'
import PostCard from '../components/PostCard.vue'
import {useRoute, useRouter} from 'vue-router'
import {pageHomeArticle} from "../api/home.ts";
import type {ArticleVO} from "../types/article.ts";


const route = useRoute()
const router = useRouter()
const ALL_POSTS = ref<ArticleVO[]>([])
const pageSize = ref(6) // 每页显示 6 篇文章
const totalPosts = ref(0)
const loading = ref(false)

// --- 新增：从路由中获取搜索关键词 ---
const currentKeyword = computed<string>(() => {
    // 如果路由中有 keyword 参数，则使用它，否则为空字符串
    return route.query.keyword ? String(route.query.keyword) : ''
})

// --- 计算属性：与路由同步的当前页码 ---
const currentPage = computed<number>({
    get: () => {
        // 从路由获取当前页码，默认为 1
        const page = parseInt(route.query.page as string || '1')
        return isNaN(page) || page < 1 ? 1 : page
    },
    set: (val) => {
        // 改变页码时，更新路由
        router.push({ query: { ...route.query, page: val.toString() } })
    }
})
// --- 数据请求函数 ---
const fetchPosts = async (page: number, size: number,keyword: string) => {
    loading.value = true
    ALL_POSTS.value = [] // 清空列表，显示 Loading
    try {

        let pageForm = {
            pageSize: size,
            pageNum: page,
            content: keyword,
        }
        const response = await pageHomeArticle(pageForm);
        ALL_POSTS.value = response.data.records,
            totalPosts.value = response.data.total
    } catch (error) {
        console.error('Error fetching posts:', error)
        // 可以在这里显示一个错误提示 ElementPlus Message
        ALL_POSTS.value = []
        totalPosts.value = 0
    } finally {
        loading.value = false
    }
}

// --- 事件处理 ---
const handleCurrentChange = (val: number) => {
    currentPage.value = val
    // 切换页码后自动滚动到文章列表顶部
    window.scrollTo({ top: 300, behavior: 'smooth' })
}

/*// 1. 组件挂载时，加载第一页数据
onMounted(() => {
    fetchPosts(currentPage.value, pageSize.value)
})

// 2. 监听 currentPage 变化，重新请求数据
watch(currentPage, (newPage) => {
    fetchPosts(newPage, pageSize.value)
})*/
// 1. 组件挂载时，加载数据
onMounted(() => {
    // 首次加载时，使用当前路由中的 keyword
    fetchPosts(currentPage.value, pageSize.value, currentKeyword.value)
})

// 2. 监听 currentPage 或 currentKeyword 变化，重新请求数据
watch([currentPage, currentKeyword], ([newPage, newKeyword]) => {
    // 当 keyword 变化时，currentPage 可能会被重置为 1，但监听器会捕获最新的值
    fetchPosts(newPage as number, pageSize.value, newKeyword as string)
})
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
<template>
    <div class="home-view">
        <section class="hero">
            <div class="hero-bg"></div>
            <div class="hero-fade-bottom"></div>
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
import {pageHomeArticle} from "../api/article.ts";
import type {ArticleVO} from "../types/article.ts";


const route = useRoute()
const router = useRouter()
const ALL_POSTS = ref<ArticleVO[]>([])
const pageSize = ref(6)
const totalPosts = ref(0)
const loading = ref(false)

// --- 新增：从路由中获取搜索关键词 ---
const currentKeyword = computed<string>(() => {
    return route.query.keyword ? String(route.query.keyword) : ''
})

// --- 计算属性：与路由同步的当前页码 ---
const currentPage = computed<number>({
    get: () => {
        // 从路由获取当前页码
        const page = parseInt(route.query.page as string || '1')
        return isNaN(page) || page < 1 ? 1 : page
    },
    set: (val) => {
        // 改变页码时，更新路由
        router.push({query: {...route.query, page: val.toString()}})
    }
})
// --- 数据请求函数 ---
const fetchPosts = async (page: number, size: number, keyword: string) => {
    loading.value = true
    ALL_POSTS.value = []
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
    window.scrollTo({top: 300, behavior: 'smooth'})
}

onMounted(() => {
    // 首次加载时，使用当前路由中的 keyword
    fetchPosts(currentPage.value, pageSize.value, currentKeyword.value)
})

// 2. 监听 currentPage 或 currentKeyword 变化，重新请求数据
watch([currentPage, currentKeyword], ([newPage, newKeyword]) => {
    fetchPosts(newPage as number, pageSize.value, newKeyword as string)
})
</script>

<style scoped lang="scss">

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

// 入场动画
.animate-fade-up {
  animation: fadeUp 2s ease-out forwards;
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


// 高级分页栏样式
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

      // 当前激活页码
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


.hero {
  position: relative;
  height: 50vh;
  display: flex;
  align-items: center;
  justify-content: center;
  text-align: center;
  overflow: hidden; // 防止图片溢出
  background-color: var(--bg-color);
}

// 1. 背景图片层样式
.hero-bg {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-image: url('https://images.unsplash.com/photo-1451187580459-43490279c0fa?q=80&w=2072&auto=format&fit=crop');
  background-size: cover;
  background-position: center;
  background-repeat: no-repeat;
  z-index: 1;
  filter: brightness(0.6) blur(0px);
}


.hero-fade-bottom {
  position: absolute;
  bottom: -2px;
  left: 0;
  width: 100%;
  z-index: 2;
  inset: auto 0 0 0;
  height: 300px;
  pointer-events: none;
    background: linear-gradient(
            to bottom,
            rgba(18, 18, 18, 0) 0%,
            rgba(18, 18, 18, 0.5) 40%,
            var(--bg-color) 100%
    );
    backface-visibility: hidden;
    transform: translateZ(0);
}

.hero-content {
  position: relative;
  z-index: 3;
  //padding: 0 20px;
    margin-bottom: 0;
    padding-bottom: 20px;
  h1 {
    font-size: 3.5rem;
    font-weight: 900;
    margin: 0;
    color: #ffffff;
    text-shadow: 0 4px 20px rgba(0, 0, 0, 0.5);

    background: linear-gradient(135deg, #fff 0%, #a5b4fc 100%);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;

    @media (max-width: 768px) {
      font-size: 2.8rem;
    }
  }

  p {
    font-size: 1.2rem;
    color: rgba(255, 255, 255, 0.85); // 半透明白
    margin-top: 15px;
    letter-spacing: 6px;
    font-weight: 300;
    text-shadow: 0 2px 10px rgba(0, 0, 0, 0.5);
  }
}

.container {
  width: 90%;
  max-width: 1200px;
  margin: 0 auto;
  padding-bottom: 60px;
  position: relative;
  z-index: 3;
  margin-top: -20px;
}

.section-title {
  font-size: 1.5rem;
  font-weight: bold;
  margin-bottom: 30px;
  border-left: 4px solid var(--accent-color);
  padding-left: 15px;
  // 确保标题颜色和背景对比明显
  color: var(--text-primary);
}



</style>
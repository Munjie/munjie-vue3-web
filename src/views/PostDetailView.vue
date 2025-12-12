<template>
    <div class="post-detail" v-if="post">
        <div class="post-hero" :style="{ backgroundImage: `url(${post.cover})` }">
            <div class="hero-overlay">
                <div class="container">
                    <el-breadcrumb separator="/" class="custom-breadcrumb">
                        <el-breadcrumb-item :to="{ path: '/' }">首页</el-breadcrumb-item>
                        <el-breadcrumb-item>{{ post.category }}</el-breadcrumb-item>
                    </el-breadcrumb>
                    <h1 class="post-title">{{ post.title }}</h1>
                    <div class="post-meta">
                        <span><el-icon><Calendar /></el-icon> {{ post.date }}</span>
                        <span><el-icon><View /></el-icon> 2.4k 阅读</span>
                        <el-tag size="small" effect="plain">{{ post.category }}</el-tag>
                    </div>
                </div>
            </div>
        </div>

        <div class="container content-wrapper">
            <div class="post-body glass-panel">
                <MdPreview
                        :modelValue="post.content"
                        theme="dark"
                        preview-theme="github"
                        class="custom-md-preview"
                />

                <div class="post-tags">
                    <el-tag v-for="tag in ['Vue3', 'TypeScript', 'ElementPlus']" :key="tag" round>
                        # {{ tag }}
                    </el-tag>
                </div>
            </div>

            <div class="back-action">
                <el-button @click="$router.back()" icon="ArrowLeft" round size="large">返回列表</el-button>
            </div>
        </div>

        <el-backtop :right="40" :bottom="40" />
    </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import { MdPreview } from 'md-editor-v3'
import 'md-editor-v3/lib/preview.css'

const route = useRoute()
const post = ref<any>(null)

// 模拟获取数据
onMounted(() => {
    const postId = route.params.id
    // 实际开发中此处应为 API 请求
    post.value = {
        id: postId,
        title: 'Vue 3 Composition API 深度解析',
        date: '2023-10-24',
        category: '前端',
        cover: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?q=80&w=2564&auto=format&fit=crop',
        content: `
# 为什么选择 Composition API?

Composition API 提供了一种更灵活的方式来组织逻辑，特别是在处理复杂组件时。

## 1. 逻辑复用
通过 \`ref\`, \`computed\` 和 \`watch\`，我们可以轻松提取可重用的函数。

\`\`\`typescript
import { ref, onMounted } from 'vue';

export function useMouse() {
  const x = ref(0);
  const y = ref(0);
  // ...逻辑
  return { x, y };
}
\`\`\`

## 2. 更好的类型推导
由于是函数式风格，对 **TypeScript** 的支持几乎是天然的。

> 提示：在 Vue 3.2+ 中，推荐使用 \`<script setup>\` 语法糖。

### 高端暗黑风格实现方案
1. **色调控制**：避免纯黑，使用深灰色。
2. **光影效果**：利用 \`box-shadow\` 模拟紫色或蓝色的微光。
3. **字体**：推荐使用 Inter 或 PingFang SC。
    `
    }
})
</script>

<style scoped lang="scss">
.post-hero {
  height: 450px;
  background-size: cover;
  background-position: center;
  position: relative;

  .hero-overlay {
    position: absolute;
    inset: 0;
    background: linear-gradient(to bottom, rgba(0,0,0,0.3) 0%, var(--bg-color) 100%);
    display: flex;
    align-items: flex-end;
    padding-bottom: 40px;
  }
}

.container {
  width: 90%;
  max-width: 900px; // 详情页窄一些，方便阅读
  margin: 0 auto;
}

.post-title {
  font-size: 2.8rem;
  font-weight: 800;
  margin: 20px 0;
  color: #fff;
  line-height: 1.2;

  @media (max-width: 768px) {
    font-size: 1.8rem;
  }
}

.post-meta {
  display: flex;
  gap: 20px;
  align-items: center;
  color: var(--text-secondary);
  font-size: 0.9rem;

  span {
    display: flex;
    align-items: center;
    gap: 5px;
  }
}

.content-wrapper {
  margin-top: -30px; // 向上偏移覆盖在 hero 上
  position: relative;
  z-index: 2;
}

.post-body {
  padding: 40px;
  border-radius: 20px;

  @media (max-width: 768px) {
    padding: 20px;
  }
}

// 覆盖 Markdown 预览器样式
:deep(.custom-md-preview) {
  background: transparent !important;
  color: var(--text-primary);
  font-size: 1.1rem;

  .md-editor-preview {
    padding: 0;
  }

  h1, h2, h3 {
    color: var(--accent-color);
    margin-top: 1.5em;
  }

  blockquote {
    border-left: 4px solid var(--accent-color);
    background: rgba(99, 102, 241, 0.1);
    padding: 15px;
    border-radius: 4px;
  }
}

.post-tags {
  margin-top: 50px;
  padding-top: 20px;
  border-top: 1px solid var(--glass-border);
  display: flex;
  gap: 10px;
}

.back-action {
  margin-top: 40px;
  display: flex;
  justify-content: center;
}

// 面包屑颜色修改
:deep(.custom-breadcrumb) {
  .el-breadcrumb__inner {
    color: var(--text-secondary) !important;
    &:hover { color: var(--accent-color) !important; }
  }
}
</style>
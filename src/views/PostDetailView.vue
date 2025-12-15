<template>
    <div class="post-detail" v-if="post">
        <div class="post-hero" :style="{ backgroundImage: `url(${post.image})` }">
            <div class="hero-overlay">
                <div class="container">
                    <el-breadcrumb separator="/" class="custom-breadcrumb">
                        <el-breadcrumb-item :to="{ path: '/' }">首页</el-breadcrumb-item>
                        <el-breadcrumb-item>{{ post.category }}</el-breadcrumb-item>
                    </el-breadcrumb>
                    <h1 class="post-title">{{ post.title }}</h1>
                    <div class="post-meta">
                        <span><el-icon><Calendar/></el-icon> {{ post.createTime }}</span>
                        <span><el-icon><View/></el-icon> {{ post.views }} 阅读</span>
                        <el-tag size="small" effect="plain">{{ post.category }}</el-tag>
                    </div>
                </div>
            </div>
        </div>

        <div class="container content-wrapper">
            <div class="post-body glass-panel">
                <MdPreview
                        v-if="contentLoaded"
                        :modelValue="post.content"
                        theme="dark"
                        preview-theme="github"
                        class="custom-md-preview"
                />

                <div class="post-tags">
                    <el-tag v-for="tag in post.tags" :key="tag" round>
                        # {{ tag }}
                    </el-tag>
                </div>
            </div>

            <div class="back-action">
                <el-button @click="$router.back()" icon="ArrowLeft" round size="large">返回列表</el-button>
            </div>
        </div>

        <el-backtop :right="40" :bottom="40"/>
    </div>
</template>

<script setup lang="ts">
import {ref, onMounted, watch, nextTick} from 'vue'
import {useRoute} from 'vue-router'
import {MdPreview} from 'md-editor-v3'
import 'md-editor-v3/lib/preview.css'
import {getArticleById} from "../api/home.ts";
import type {ArticleVO} from "../types/article.ts";
import router from "../router";

const route = useRoute()
const post = ref<ArticleVO>()
const contentLoaded = ref(false);
// 模拟获取数据
onMounted(async () => {
    const postId = Array.isArray(route.params.id) ? route.params.id[0] : route.params.id
    if (!postId) {
        await router.push('/404')
    }
    post.value = await getArticleById(postId)
    await nextTick();
    contentLoaded.value = true;
})
watch(post, async (newPost) => {
    if (newPost) {
        await nextTick();

    }
});
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
    background: linear-gradient(to bottom, rgba(0, 0, 0, 0.3) 0%, var(--bg-color) 100%);
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

    &:hover {
      color: var(--accent-color) !important;
    }
  }
}
</style>
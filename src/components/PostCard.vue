<template>
    <div class="post-card glass-panel" @click="goToDetail(post)">
        <div class="card-image" :style="{ backgroundImage: `url(${post.image})` }"></div>
        <div class="card-content">
            <div class="meta">
                <el-tag size="small" effect="dark" type="info">{{ post.category }}</el-tag>
                <span class="date">{{ post.publishTime }}</span>
            </div>
            <h3>{{ post.title }}</h3>
            <p>{{ post.introduction }}</p>
            <div class="footer">
                <el-button link type="primary" @click.stop="goToDetail(post)">
                    阅读全文
                    <el-icon><ArrowRight /></el-icon>
                </el-button>
            </div>
        </div>
    </div>
</template>

<script setup lang="ts">
// 定义 Props 类型
interface Post {
    id: number;
    title: string;
    introduction: string;
    publishTime: string;
    category: string;
    image: string;
}
defineProps<{ post: Post }>()

import { ArrowRight } from '@element-plus/icons-vue'
import { useRouter } from 'vue-router'
const router = useRouter()

// 单独的跳转方法
const goToDetail = (post:any) => {
    router.push({
        name: 'post',
        params: { id: post.id }
    })
}

</script>


<style scoped lang="scss">
.post-card {
    cursor: pointer;
  border-radius: 16px;
  overflow: hidden;
  transition: transform 0.3s ease, box-shadow 0.3s ease;
  height: 100%;
  display: flex;
  flex-direction: column;


    &:hover {
    transform: translateY(-5px);
    box-shadow: 0 12px 40px rgba(99, 102, 241, 0.15); // 紫色光晕
    border-color: rgba(99, 102, 241, 0.3);
  }
}

.card-image {
  height: 200px;
  background-size: cover;
  background-position: center;
  position: relative;

  &::after {
    content: '';
    position: absolute;
    bottom: 0;
    left: 0;
    width: 100%;
    height: 50%;
    background: linear-gradient(to top, var(--glass-bg), transparent);
  }
}

.card-content {
  padding: 20px;
  flex: 1;
  display: flex;
  flex-direction: column;
}

.meta {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 10px;

  .date {
    font-size: 0.8rem;
    color: var(--text-secondary);
  }
}

h3 {
  margin: 10px 0;
  font-size: 1.25rem;
  line-height: 1.4;
  color: var(--text-primary);
}

p {
  color: var(--text-secondary);
  font-size: 0.9rem;
  line-height: 1.6;
  flex: 1;
  display: -webkit-box;
  -webkit-line-clamp: 3;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.footer {
  margin-top: 20px;
  display: flex;
  justify-content: flex-end;
}
</style>
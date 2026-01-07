<template>
    <div class="exception-container">
        <div class="exception-content glass-panel">
            <h1 class="error-code">{{ errorCode }}</h1>
            <div class="error-status">{{ errorTitle }}</div>
            <p class="error-desc">{{ errorDesc }}</p>
            <div v-if="errorCode === '404'" class="useful-links">
                <p>你可能在找：<router-link to="/chat">AI</router-link></p>
            </div>
            <div class="actions">
                <el-button type="primary" round @click="goHome">返回首页</el-button>
                <el-button round @click="goBack">返回上一页</el-button>
            </div>
        </div>

    </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'

const route = useRoute()
const router = useRouter()

// 从路由参数或查询字符串获取错误代码，默认为 404
const errorCode = computed(() => route.params.code || route.query.code || '404')

// 根据代码匹配标题
const errorTitle = computed(() => {
    const titles: Record<string, string> = {
        '400': '请求错误',
        '403': '拒绝访问',
        '404': '页面不存在',
        '408': '请求超时',
        '500': '服务器内部错误',
        '502': '网络错误',
        '503': '服务不可用',
        '504': '网络超时'
    }
    return titles[errorCode.value as string] || '连接出错'
})

const errorDesc = computed(() => `这不是你的错误，而是我的问题.`)

const goHome = () => router.push('/')
const goBack = () => router.back()
</script>

<style scoped lang="scss">
.exception-container {
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: calc(100vh - var(--header-height));
  padding: 20px;
  background: #0f1115;
}

.exception-content {
  max-width: 500px;
  width: 100%;
  padding: 60px 40px;
  text-align: center;
  border-radius: 24px;
  background: rgba(255, 255, 255, 0.02);
  border: 1px solid rgba(255, 255, 255, 0.08);
  backdrop-filter: blur(20px);

  .error-code {
    font-size: 120px;
    font-weight: 900;
    margin: 0;
    line-height: 1;
    background: linear-gradient(135deg, #6366f1, #a855f7);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    letter-spacing: -5px;
    filter: drop-shadow(0 10px 20px rgba(99, 102, 241, 0.3));
  }

  .error-status {
    font-size: 24px;
    color: #fff;
    margin-top: 20px;
    font-weight: 600;
  }

  .error-desc {
    color: rgba(255, 255, 255, 0.5);
    margin: 15px 0 40px;
    font-size: 14px;
    line-height: 1.6;
  }

  .actions {
    display: flex;
    gap: 15px;
    justify-content: center;

    :deep(.el-button) {
      padding: 12px 25px;
      font-weight: 500;
    }

    :deep(.el-button--primary) {
      background: linear-gradient(to right, #6366f1, #a855f7);
      border: none;
      &:hover { opacity: 0.9; transform: translateY(-2px); }
    }
  }
}

/* 移动端适配 */
@media (max-width: 480px) {
  .exception-content {
    padding: 40px 20px;
    .error-code { font-size: 80px; }
  }
}
</style>
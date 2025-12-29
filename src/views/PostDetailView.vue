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

                <div class="post-actions-bar">
                    <div class="action-item-big" :class="{ 'active': postLiked }" @click="handlePostLike">
                        <div class="icon-circle">
                            <el-icon>
                                <Pointer/>
                            </el-icon>
                        </div>
                        <span class="count">{{ postLikeCount }} 人点赞</span>
                    </div>
                </div>
            </div>

            <div class="comment-section glass-panel">
                <h3 class="section-title">
                    <el-icon>
                        <ChatDotRound/>
                    </el-icon>
                    评论交流
                </h3>

                <div class="comment-input-wrapper glass-panel">
                    <el-input
                            v-model="commentForm.content"
                            type="textarea"
                            :rows="3"
                            placeholder="说点什么吧..."
                            maxlength="200"
                            class="dark-input"
                    />
                    <div class="input-footer">
                        <el-popover
                                placement="top-start"
                                :width="260"
                                trigger="click"
                                popper-class="emoji-popover"
                        >
                            <template #reference>
                                <div class="emoji-trigger-btn">
                                    <el-icon :size="20">
                                        <ChatLineRound/>
                                    </el-icon>
                                </div>
                            </template>
                            <div class="emoji-list">
                <span v-for="emoji in emojiList" :key="emoji" @click="addEmoji(emoji, 'main')">
                    {{ emoji }}
                </span>
                            </div>
                        </el-popover>

                        <el-button type="primary" round @click="submitComment(0)">发表评论</el-button>
                    </div>
                </div>

                <div class="comment-list" v-loading="commentsLoading">
                    <div v-for="item in commentList" :key="item.id" class="comment-item">
                        <el-avatar :size="40" class="user-avatar">{{ item.username.charAt(0) }}</el-avatar>
                        <div class="comment-content">
                            <div class="comment-header">
                                <span class="username">{{ item.username }}</span>
                                <span class="time">{{ item.createTime }}</span>
                            </div>
                            <p class="text">{{ item.content }}</p>
                            <div class="comment-actions">
                                  <span class="action-btn like" :class="{ 'is-liked': item.isLiked }"
                                        @click="handleCommentLike(item)">
                            <el-icon><Pointer/></el-icon> {{ item.likes || '赞' }}
                        </span>
                                <span class="reply-btn" @click="toggleReply(item.id)">回复</span>
                            </div>

                            <div v-if="replyId === item.id" class="reply-input-wrapper">
                                <el-input
                                        v-model="replyContent"
                                        size="small"
                                        placeholder="回复内容..."
                                        class="dark-input"
                                />
                                <div class="input-footer mini">
                                    <el-popover placement="top-start" :width="220" trigger="click"
                                                popper-class="emoji-popover">
                                        <template #reference>
                                            <div class="emoji-trigger-btn mini">
                                                <el-icon :size="16">
                                                    <ChatLineRound/>
                                                </el-icon>
                                            </div>
                                        </template>
                                        <div class="emoji-list">
                <span v-for="emoji in emojiList" :key="emoji" @click="addEmoji(emoji, 'reply')">
                    {{ emoji }}
                </span>
                                        </div>
                                    </el-popover>
                                    <div class="right-btns">
                                        <el-button size="small" link @click="replyId = 0">取消</el-button>
                                        <el-button size="small" type="primary" round @click="submitComment(item.id)">
                                            发送
                                        </el-button>
                                    </div>
                                </div>
                            </div>

                            <div v-if="item.children && item.children.length > 0" class="child-comments">
                                <div v-for="child in item.children" :key="child.id" class="child-item">
                                    <el-avatar :size="24">{{ child.username.charAt(0) }}</el-avatar>
                                    <div class="child-info">
                                        <span class="child-username">{{ child.username }}</span>
                                        <p class="child-text">{{ child.content }}</p>
                                        <div class="child-footer">
                                            <span class="time">{{ child.createTime }}</span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                    <el-empty v-if="commentList.length === 0" description="暂无评论"/>
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
import {ElMessage} from "element-plus";
import {useUserStore} from '../stores'
import {getComments, addComment} from "../api/comment.ts"
import {Pointer, ChatDotRound, Calendar, View, ChatLineRound} from '@element-plus/icons-vue'

const userStore = useUserStore()
const route = useRoute()
const post = ref<ArticleVO>()
const contentLoaded = ref(false);
// 评论相关状态
const commentList = ref<any[]>([])
const commentsLoading = ref(false)
const replyId = ref(0)
const replyContent = ref('')
const commentForm = ref({content: ''})
// 常用表情列表
const emojiList = ['😃', '😁', '😅', '🤣', '😘', '🥰', '😗', '😋', '😛', '😜', '🧐', '🤓', '😎', '🤩', '🥳', '😏', '😒', '😞', '😔', '😟', '😕', '😫', '😲', '😳', '🥺', '😢', '😭', '😱', '😖', '😴', '👻', '💀', '👽', '🤖', '🎃', '😺', '🤲', '👍', '👎', '👊', '✊', '🤛', '🤜', '🤞', '✌️', '🤘', '👌', '👈', '👉', '👆', '👇', '✋', '🤚', '👋', '👏', '💪', '🙏', '🧠', '👀', '❤️', '🔥', '✨', '🌟', '🌈']

// 文章点赞状态
const postLiked = ref(false)
const postLikeCount = ref(128)
onMounted(async () => {
    const postId = Array.isArray(route.params.id) ? route.params.id[0] : route.params.id
    if (!postId) {
        await router.push('/404')
    }
    post.value = await getArticleById(postId)
    await nextTick();
    contentLoaded.value = true;
    await loadComments()
})
watch(post, async (newPost) => {
    if (newPost) {
        await nextTick();

    }
});

// 处理文章点赞
const handlePostLike = () => {
    if (!userStore.getToken) {
        ElMessage.warning('登录后即可点赞支持哦')
        return
    }
    postLiked.value = !postLiked.value
    postLikeCount.value += postLiked.value ? 1 : -1
    // 调用 API: updateArticleLike(post.value.id, postLiked.value)
}

// 处理评论点赞
const handleCommentLike = (item: any) => {
    if (!userStore.getToken) {
        ElMessage.warning('登录后即可点赞评论')
        return
    }
    item.isLiked = !item.isLiked
    item.likes = (item.likes || 0) + (item.isLiked ? 1 : -1)
    // 调用 API: updateCommentLike(item.id, item.isLiked)
}

const addEmoji = (emoji: string, type: 'main' | 'reply') => {
    if (type === 'main') {
        commentForm.value.content += emoji
    } else {
        replyContent.value += emoji
    }
}
// 模拟加载评论数据
const loadComments = async () => {
    commentsLoading.value = true
    commentList.value = await getComments( post.value?.id)
    // 模拟数据结构：
    setTimeout(() => {
        commentList.value = [
            {
                id: 1, username: '路人甲', content: 'goooooooooooood',
                createTime: '2023-01-20', children: [
                    {id: 101, username: 'mwj', content: '6666666666666！', createTime: '2023-01-21'}
                ]
            }
        ]
        commentsLoading.value = false
    }, 500)
}

const toggleReply = (id: number) => {
    if (!userStore.getToken) {
        ElMessage.warning('请登录后再回复')
        return
    }
    replyId.value = replyId.value === id ? 0 : id
    replyContent.value = ''
}


const submitComment = async (parentId: number) => {
    if (!userStore.getToken) {
        ElMessage.warning('请登录后再操作')
        return
    }
    const content = parentId === 0
        ? commentForm.value.content
        : replyContent.value;
    if (!content || !content.trim()) {
        ElMessage.warning('请输入内容')
        return
    }
    let contentForm = {
        content: content
    }

    try {

        await addComment(contentForm)

        ElMessage.success('发布成功')

        // 清空输入
        if (parentId === 0) {
            commentForm.value.content = ''
        } else {
            replyContent.value = ''
            replyId.value = 0
        }
        await loadComments()
    } catch (err) {
        ElMessage.error('发布失败')
    }
}
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

.comment-section {
  margin-top: 40px;
  padding: 40px;
  border-radius: 20px;


  .comment-input-wrapper {
    margin-bottom: 60px;
  }

  .section-title {
    display: flex;
    align-items: center;
    gap: 10px;
    margin-bottom: 25px;
    font-size: 1.3rem;
    color: var(--accent-color);
  }
}

/* 输入框区域 */
.comment-input-area {
  margin-bottom: 40px;

  .input-actions {
    margin-top: 15px;
    display: flex;
    justify-content: flex-end;
  }
}

/* 评论列表 */
.comment-item {
  display: flex;
  gap: 15px;
  margin-bottom: 30px;

  .comment-content {
    flex: 1;

    .comment-header {
      margin-bottom: 8px;

      .username {
        font-weight: bold;
        color: #fff;
        margin-right: 12px;
      }

      .time {
        font-size: 0.8rem;
        color: #666;
      }
    }

    .text {
      line-height: 1.6;
      color: var(--text-primary);
      margin-bottom: 8px;
    }

    .comment-actions {
      .reply-btn {
        font-size: 0.85rem;
        color: var(--accent-color);
        cursor: pointer;

        &:hover {
          opacity: 0.8;
        }
      }
    }
  }
}

/* 回复框 */
.reply-input-box {
  margin-top: 15px;
  padding: 15px;
  background: rgba(255, 255, 255, 0.02);
  border-radius: 12px;

  .btns {
    margin-top: 10px;
    display: flex;
    justify-content: flex-end;
    gap: 10px;
  }
}

/* 子评论（嵌套样式） */
.child-comments {
  margin-top: 15px;
  padding: 15px;
  background: rgba(255, 255, 255, 0.03);
  border-radius: 12px;
  display: flex;
  flex-direction: column;
  gap: 15px;

  .child-item {
    display: flex;
    gap: 10px;

    .child-username {
      font-size: 0.9rem;
      color: #aaa;
      font-weight: 500;
    }

    .child-text {
      font-size: 0.95rem;
      margin-top: 4px;
      color: #eee;
    }

    .child-footer {
      margin-top: 4px;

      .time {
        font-size: 0.75rem;
        color: #555;
      }
    }
  }
}

/* 深度覆盖 Element Plus 输入框样式 */
:deep(.dark-input) {
  .el-textarea__inner, .el-input__inner {
    background: rgba(0, 0, 0, 0.2) !important;
    border: 1px solid rgba(255, 255, 255, 0.1) !important;
    color: #fff !important;

    &:focus {
      border-color: var(--accent-color) !important;
    }
  }

  .el-input__count {
    background: transparent !important;
  }
}

/* 移动端适配 */
@media (max-width: 768px) {
  .comment-section {
    padding: 20px;
  }
  .comment-item {
    gap: 10px;
  }
  .child-comments {
    margin-left: 0;
  }
}

/* 表情触发器样式 */
.emoji-trigger {
  display: flex;
  align-items: center;
  gap: 5px;
  cursor: pointer;
  color: var(--text-secondary);
  font-size: 0.9rem;
  transition: color 0.3s;
  margin-right: auto; // 靠左对齐

  &:hover {
    color: var(--accent-color);
  }
}

.emoji-trigger-mini {
  cursor: pointer;
  margin-right: 10px;
  filter: grayscale(1);
  transition: filter 0.3s;

  &:hover {
    filter: grayscale(0);
  }
}

/* 表情面板容器（全局或 :deep） */
:deep(.emoji-popover) {
  background: rgba(30, 30, 30, 0.9) !important;
  border: 1px solid rgba(255, 255, 255, 0.1) !important;
  backdrop-filter: blur(10px);
  padding: 10px !important;

  .emoji-list {
    display: grid;
    grid-template-columns: repeat(8, 1fr);
    gap: 5px;
    max-height: 200px;
    overflow-y: auto;

    span {
      font-size: 1.2rem;
      cursor: pointer;
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 5px;
      border-radius: 6px;
      transition: background 0.2s;

      &:hover {
        background: rgba(255, 255, 255, 0.1);
      }
    }
  }

  /* 自定义滚动条 */
  .emoji-list::-webkit-scrollbar {
    width: 4px;
  }

  .emoji-list::-webkit-scrollbar-thumb {
    background: rgba(255, 255, 255, 0.2);
    border-radius: 10px;
  }
}

/* 输入框包裹器 */
.comment-input-wrapper {
  background: rgba(255, 255, 255, 0.02);
  border: 1px solid rgba(255, 255, 255, 0.08);
  border-radius: 16px;
  padding: 10px;
  transition: all 0.3s ease;

  &:focus-within {
    border-color: var(--accent-color);
    background: rgba(255, 255, 255, 0.04);
  }
}

/* 底部操作栏布局 */
.input-footer {
  display: flex;
  justify-content: space-between; /* 关键：两端对齐 */
  align-items: center;
  margin-top: 10px;
  padding: 0 5px;

  &.mini {
    margin-top: 8px;
  }
}

/* 笑脸按钮美化 */
.emoji-trigger-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 36px;
  height: 36px;
  border-radius: 10px;
  color: rgba(255, 255, 255, 0.5);
  cursor: pointer;
  transition: all 0.2s;

  &:hover {
    background: rgba(99, 102, 241, 0.15);
    color: var(--accent-color);
    transform: scale(1.1);
  }

  &.mini {
    width: 28px;
    height: 28px;
  }
}

/* 深度覆盖输入框，去除多余边框，让它和包裹器融为一体 */
:deep(.dark-input) {
  .el-textarea__inner, .el-input__inner {
    background: transparent !important; /* 设为透明，由包裹器提供背景 */
    border: none !important;
    box-shadow: none !important;
    color: #fff !important;
    padding: 5px;
    font-size: 1rem;
  }

  .el-input__count {
    background: transparent !important;
    bottom: -5px;
  }
}

/* 右侧按钮组（用于回复框） */
.right-btns {
  display: flex;
  gap: 8px;
  align-items: center;
}

/* 表情面板的美化（保持一致） */
:deep(.emoji-popover) {
  border-radius: 12px !important;

  .emoji-list {
    display: grid;
    grid-template-columns: repeat(8, 1fr);
    gap: 8px;

    span {
      font-size: 1.3rem;
      text-align: center;
      padding: 4px;
      border-radius: 6px;

      &:hover {
        background: rgba(255, 255, 255, 0.1);
      }
    }
  }
}



/* 2. 文章点赞区样式 */
.post-actions-bar {
  display: flex;
  justify-content: center;
  margin-top: 50px;
  padding-top: 30px;
  border-top: 1px solid rgba(255, 255, 255, 0.05);

  .action-item-big {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 12px;
    cursor: pointer;
    transition: all 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275);

    .icon-circle {
      width: 64px;
      height: 64px;
      border-radius: 50%;
      background: rgba(255, 255, 255, 0.03);
      border: 1px solid rgba(255, 255, 255, 0.1);
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 28px;
      color: rgba(255, 255, 255, 0.5);
      transition: all 0.3s;
    }

    .count {
      font-size: 0.9rem;
      color: var(--text-secondary);
    }

    &:hover .icon-circle {
      background: rgba(99, 102, 241, 0.1);
      border-color: var(--accent-color);
      color: var(--accent-color);
    }

    &.active {
      .icon-circle {
        background: var(--accent-color);
        color: #fff;
        border-color: var(--accent-color);
        box-shadow: 0 0 20px rgba(99, 102, 241, 0.4);
      }

      .count {
        color: #fff;
      }

      transform: scale(1.1); /* 点击放大反馈 */
    }
  }
}

/* 3. 评论点赞按钮样式 */
.comment-actions {
  display: flex;
  gap: 20px;
  margin-top: 10px;

  .action-btn {
    display: flex;
    align-items: center;
    gap: 4px;
    font-size: 0.85rem;
    color: rgba(255, 255, 255, 0.4);
    cursor: pointer;
    transition: all 0.2s;

    &:hover {
      color: var(--text-primary);
    }

    &.is-liked {
      color: var(--accent-color);
      font-weight: bold;
    }

    &.reply:hover {
      color: var(--accent-color);
    }
  }
}

/* 移动端适配间距 */
@media (max-width: 768px) {
  .comment-section {
    margin-top: 25px;
    padding: 20px;

    .comment-input-wrapper {
      margin-bottom: 40px;
    }
  }
  .post-actions-bar {
    margin-top: 30px;
  }
}
</style>
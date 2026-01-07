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
                            <span class="custom-icon" v-html="ThumbUpIcon"></span>
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
                                :width="300"
                                trigger="click"
                                popper-class="custom-emoji-box"
                        >
                            <template #reference>
                                <div class="emoji-trigger-btn">
                                    <el-icon :size="20">
                                        <EmojiSmile/>
                                    </el-icon>
                                </div>
                            </template>
                            <div class="emoji-scroll-container">
                            <div class="emoji-list">
                <span v-for="emoji in emojiList" :key="emoji" @click="addEmoji(emoji, 'main')">
                    {{ emoji }}
                </span>
                            </div>
                            </div>
                        </el-popover>
                        <el-button type="primary" round @click="submitComment(0)"
                                   :disabled="!commentForm.content.trim()">发表评论
                        </el-button>
                    </div>
                </div>

                <div class="comment-list" v-loading="commentsLoading">
                    <div v-for="item in commentList" :key="item.id" class="comment-item">
                        <el-avatar :size="40" class="user-avatar" :src="item.avatar"></el-avatar>
                        <div class="comment-content">
                            <div class="comment-header">
                                <span class="username">{{ item.username }}</span>
                                <span class="time">{{ item.createTime }}</span>
                            </div>
                            <p class="text">{{ item.content }}</p>
                            <div class="comment-actions">
                                  <span class="action-btn like" :class="{ 'is-liked': item.isLiked }"
                                        @click="handleCommentLike(item)">
                           <span class="mini-icon" v-html="ThumbUpIcon"></span> {{ item.likes || '赞' }}
                        </span>
                                <span class="reply-btn" @click="toggleReply(item)">回复</span>
                            </div>
                            <div v-if="replyId === item.id" class="reply-input-wrapper glass-panel">
                                <el-input
                                        v-model="replyContent"
                                        type="textarea"
                                        :rows="2"
                                        placeholder="写下你的回复..."
                                        class="dark-input"
                                        maxlength="100"
                                />
                                <div class="input-footer mini">
                                    <el-popover
                                            placement="top-start"
                                            :width="280"
                                            trigger="click"
                                            popper-class="custom-emoji-box"
                                    >
                                        <template #reference>
                                            <div class="emoji-trigger-btn mini">
                                                <el-icon :size="18">
                                                    <EmojiSmile/>
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
                                        <el-button
                                                size="small"
                                                type="primary"
                                                round
                                                @click="submitComment(item.id)"
                                                :disabled="!replyContent.trim()"
                                        >发送
                                        </el-button>
                                    </div>
                                </div>
                            </div>

                            <div v-if="item.children && item.children.length > 0" class="child-comments">
                                <div v-for="child in item.children" :key="child.id" class="child-item-wrapper">
                                    <div class="child-item">
                                        <el-avatar :size="24" class="child-avatar" :src="child.avatar"></el-avatar>
                                        <div class="child-info">
                                            <div class="child-header">
                                                <span class="child-username">{{ child.username }}</span>
                                                <span class="child-time">{{ child.createTime }}</span>
                                            </div>
                                            <p class="child-text">{{ child.content }}</p>

                                            <div class="child-actions">
                    <span class="action-btn like"
                          :class="{ 'is-liked': child.isLiked }"
                          @click="handleCommentLike(child)">
                        <span class="mini-icon" v-html="ThumbUpIcon"></span>
                        {{ child.likes || '赞' }}
                    </span>
                                                <span class="action-btn reply" @click="toggleReply(child)">回复</span>
                                            </div>
                                        </div>
                                    </div>

                                    <div v-if="replyId === child.id" class="reply-input-wrapper child-reply-box">
                                        <el-input
                                            v-model="replyContent"
                                            type="textarea"
                                            :rows="2"
                                            :placeholder="`回复 @${replyTargetName}`"
                                            class="dark-input"
                                        />
                                        <div class="input-footer mini">
                                            <el-popover popper-class="emoji-popover" trigger="click" :width="280">
                                                <template #reference>
                                                    <div class="emoji-trigger-btn mini">
                                                        <el-icon :size="16"><EmojiSmile /></el-icon>
                                                    </div>
                                                </template>
                                                <div class="emoji-list">
                                                    <span v-for="emoji in emojiList" :key="emoji" @click="addEmoji(emoji, 'reply')">{{ emoji }}</span>
                                                </div>
                                            </el-popover>
                                            <div class="right-btns">
                                                <el-button size="small" link @click="replyId = 0">取消</el-button>
                                                <el-button size="small" type="primary" round
                                                           :disabled="!replyContent.trim()"
                                                           @click="submitComment(item.id)">发送</el-button>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                    <el-empty v-if="commentList.length === 0" description="暂无评论" :image-size="40"
                              style="padding: 1px 0;"/>
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
import {ref, onMounted, watch, nextTick,onUnmounted} from 'vue'
import {useRoute} from 'vue-router'
import {MdPreview} from 'md-editor-v3'
import 'md-editor-v3/lib/preview.css'
import {getArticleById, sendView} from "../api/article.ts";
import type {ArticleVO} from "../types/article.ts";
import router from "../router";
import {ElMessage} from "element-plus";
import {useUserStore} from '../stores'
import {getComments, addComment, updateArticleLike, updateCommentLike} from "../api/comment.ts"
import {ChatDotRound, Calendar, View} from '@element-plus/icons-vue'
import EmojiSmile from '../components/icons/SmilSvg.vue'

const ThumbUpIcon = `
<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor">
  <path stroke-linecap="round" stroke-linejoin="round" d="M6.633 10.5c.806 0 1.533-.446 2.031-1.08a9.041 9.041 0 012.861-2.4c.723-.384 1.35-.956 1.653-1.715a4.498 4.498 0 00.322-1.672V3a.75.75 0 01.75-.75A2.25 2.25 0 0116.5 4.5c0 1.152-.26 2.243-.723 3.218-.266.558.107 1.282.725 1.282h3.126c1.026 0 1.945.694 2.054 1.715.045.422.068.85.068 1.285a11.95 11.95 0 01-2.649 7.521c-.388.482-.987.729-1.605.729H13.48c-.483 0-.964-.078-1.423-.23l-3.114-1.04a4.501 4.501 0 00-1.423-.23H5.904M14.25 9h2.25M5.904 18.75c.083.205.173.405.27.602.197.4-.078.898-.523.898h-.908c-.889 0-1.713-.518-1.972-1.368a12 12 0 01-.521-3.507c0-1.553.295-3.036.831-4.398C3.387 10.203 4.167 9.75 5 9.75h1.053c.472 0 .745.556.5.96a8.958 8.958 0 00-1.302 4.665c0 1.194.232 2.333.654 3.375z" />
</svg>
`

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
const postLikeCount = ref(0)
const replyTargetName = ref('');
const replyTargetId = ref(0);

const props = defineProps(['id']);
const viewTriggered = ref(false);

let observer: IntersectionObserver | null = null;
onMounted(async () => {
    const postId = Array.isArray(route.params.id) ? route.params.id[0] : route.params.id
    if (!postId) {
        await router.push('/404')
    }
    post.value = await getArticleById(postId)
    if (post.value === null) {
        await router.push('/404')
        return
    }
    await nextTick();
    contentLoaded.value = true;
    postLikeCount.value = post.value?.likes;
    postLiked.value = post.value?.postLiked;
    await loadComments()
})


const initObserver = () => {
    const target = document.querySelector('.post-body');
    if (!target) {
        console.warn("未找到 .post-body 节点");
        return;
    }
    observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            // 只要元素进入视口超过 10% 即可触发
            if (entry.isIntersecting && entry.intersectionRatio > 0.1 && !viewTriggered.value) {
                sendViewStat();
                viewTriggered.value = true;
                if (observer) {
                    observer.unobserve(target);
                }
            }
        });
    }, { threshold: [0.1, 0.5] });
    observer.observe(target);
};



// 关键：监听数据加载完成后再初始化
watch(() => post.value, (newPost) => {
    if (newPost) {
        nextTick(() => {
            initObserver();
        });
    }
}, { immediate: true });


const toggleReply = (item: any) => {
    if (!userStore.getToken) {
        ElMessage.warning('请登录后再回复')
        return
    }
    if (replyId.value === item.id) {
        replyId.value = 0;
        replyTargetName.value = '';
        replyTargetId.value = 0;
    } else {
        replyId.value = item.id;
        replyTargetName.value = item.username;
        replyContent.value = '';
        replyTargetId.value = item.userId;
    }
};
// 处理文章点赞
const handlePostLike = async () => {
    if (!userStore.getToken) {
        ElMessage.warning('登录后即可点赞支持哦')
        return
    }
    const prevLiked = postLiked.value;
    const prevCount = postLikeCount.value;
    postLiked.value = !postLiked.value;
    postLikeCount.value += postLiked.value ? 1 : -1;

    try {
        const res = await updateArticleLike(post.value?.id,userStore.getUserid);
        postLiked.value = res.liked;
        postLikeCount.value = res.likeCount;

    } catch (error) {
        // 失败时回滚到操作前状态
        postLiked.value = prevLiked;
        postLikeCount.value = prevCount;
        ElMessage.error('操作失败，请重试');
    }
    // 成功反馈
    if (postLiked.value) {
        ElMessage({
            message: '感谢点赞！',
            type: 'success',
            plain: true,
            duration: 1000
        })
    }
}

// 处理评论点赞
const handleCommentLike = async (item: any) => {
    if (!userStore.getToken) {
        ElMessage.warning('登录后即可点赞评论')
        return
    }
    const prevLiked = item.isLiked;
    const prevCount = item.likes;
    item.isLiked = !item.isLiked
    item.likes = (item.likes || 0) + (item.isLiked ? 1 : -1)
    try {

        const res = await updateCommentLike(item.id,userStore.getUserid);
        item.isLiked = res.liked;
        item.likes = res.likeCount;

    } catch (error) {
        // 失败时回滚到操作前状态
        item.isLiked = prevLiked;
        item.likes = prevCount;
        ElMessage.error('操作失败，请重试');
    }

}

const addEmoji = (emoji: string, type: 'main' | 'reply') => {
    if (type === 'main') {
        commentForm.value.content += emoji
    } else {
        replyContent.value += emoji
    }
}

const loadComments = async () => {
    commentsLoading.value = true
    setTimeout(async () => {
        commentList.value = await getComments(post.value?.id,userStore.getUserid)
        commentsLoading.value = false
    }, 500)
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
    if (parentId === 0) {
        replyTargetId.value = 0;
    }
    let contentForm = {
        content:  content,
        articleId: post.value?.id,
        parentId: parentId,
        userId: userStore.getUserid,
        replyTargetId:  replyTargetId.value,
    };

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


const sendViewStat = async () => {
    try {
        let viewForm = {
            articleId: post.value?.id,
            userId: userStore.getUserid,
        }
        await sendView(viewForm);
    } catch (err) {
        console.error("统计发送失败", err);
    }
};

onUnmounted(() => {
    if (observer) {
        observer.disconnect();
        observer = null;
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

/* 统一 SVG 图标样式 */
.custom-icon, .mini-icon {
  display: inline-flex;
  align-items: center;
  justify-content: center;

  :deep(svg) {
    width: 1em;
    height: 1em;
    fill: currentColor; // 允许通过 color 属性控制颜色
  }
}

/* 1. 文章底部大按钮 */
.action-item-big {
  .icon-circle {
    font-size: 32px; // 稍微调大一点
    color: rgba(255, 255, 255, 0.4);
    border: 1px solid rgba(255, 255, 255, 0.1);
    background: rgba(255, 255, 255, 0.02);
    transition: all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275);
  }

  &.active {
    .icon-circle {
      background: linear-gradient(135deg, #6366f1, #a855f7);
      color: #fff;
      border: none;
      box-shadow: 0 10px 25px rgba(99, 102, 241, 0.4);
      transform: scale(1.15) translateY(-5px); // 激活时向上跳动一下
    }

    .count {
      color: #fff;
      font-weight: 600;
    }
  }

  &:hover:not(.active) .icon-circle {
    border-color: #6366f1;
    color: #6366f1;
    background: rgba(99, 102, 241, 0.05);
  }
}

/* 2. 评论区小点赞按钮 */
.comment-actions {
  .action-btn.like {
    .mini-icon {
      font-size: 16px;
      margin-right: 4px;
      transition: transform 0.2s;
    }

    &:hover .mini-icon {
      transform: rotate(-15px) scale(1.2);
    }

    &.is-liked {
      color: #a855f7; // 激活时使用紫色
      font-weight: bold;

      .mini-icon {
        transform: scale(1.2);
        filter: drop-shadow(0 0 5px rgba(168, 85, 247, 0.5));
      }
    }
  }
}

/* 3. 布局优化：拉开间距（补充之前的需求） */
.comment-section {
  margin-top: 50px; // 与正文拉开
  .comment-input-wrapper {
    margin-bottom: 50px; // 与评论列表拉开
  }
}

/* --- 回复框高度与间距优化 --- */
.reply-input-wrapper {
  margin-top: 15px;
  padding: 12px;
  background: rgba(255, 255, 255, 0.03);
  border: 1px solid rgba(255, 255, 255, 0.06);
  border-radius: 12px;
  animation: fadeInDown 0.3s ease-out; // 增加一个小动画

  .dark-input {
    :deep(.el-textarea__inner) {
      font-size: 0.95rem;
      line-height: 1.5;
      min-height: 60px !important; // 确保回复框不会太扁
    }
  }
}

/* --- 输入框底部工具栏优化 --- */
.input-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: 12px;

  &.mini {
    padding-top: 8px;
    border-top: 1px solid rgba(255, 255, 255, 0.05);
  }
}

/* --- 移动端体验专项提升 --- */
@media (max-width: 768px) {
  .container {
    width: 95%; // 移动端侧边间距缩小
  }

  .comment-section {
    padding: 20px 15px; // 缩小内边距
  }

  .reply-input-wrapper {
    padding: 10px;

    .right-btns .el-button {
      padding: 8px 16px; // 按钮更易点击
    }
  }

  // 隐藏移动端不必要的修饰
  .emoji-trigger-btn {
    width: 40px;
    height: 40px; // 增大点击热区
  }
}

@keyframes fadeInDown {
  from {
    opacity: 0;
    transform: translateY(-10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

/* 针对弹出层内容的全局样式（因为 teleport 到了 body） */
.custom-emoji-box {
  background: rgba(30, 30, 30, 0.95) !important;
  border: 1px solid rgba(255, 255, 255, 0.1) !important;
  padding: 12px !important;
  border-radius: 12px !important;
  backdrop-filter: blur(10px);

  /* 设置滚动容器 */
  .emoji-scroll-container {
    max-height: 250px; /* 超过这个高度就开始滚动 */
    overflow-y: auto; /* 开启上下滚动 */
    padding-right: 5px;

    /* 美化滚动条 */
    &::-webkit-scrollbar {
      width: 4px;
    }

    &::-webkit-scrollbar-thumb {
      background: rgba(255, 255, 255, 0.2);
      border-radius: 4px;
    }
  }

  /* 使用 Grid 布局解决间隔问题 */
  .emoji-list {
    display: grid;
    /* 核心：minmax 决定了每个表情的最小宽度。PC端建议 42px，移动端自适应 */
    grid-template-columns: repeat(auto-fill, minmax(42px, 1fr));
    gap: 12px; /* 这里可以精准控制间隔，不管是多大表情都不会挨着 */

    span {
      /* 核心：放大表情 */
      font-size: 1.5rem !important; /* 调整这里！2rem 很大，可以根据需要微调 */
      /* PC端手势：变成手 */
      cursor: pointer;

      display: flex;
      align-items: center;
      justify-content: center;
      aspect-ratio: 1 / 1; /* 保持正方形，点击热区更大 */
      border-radius: 8px;
      transition: all 0.2s;
      user-select: none; /* 防止频繁点击时选中文字蓝块 */

      &:hover {
        background: rgba(255, 255, 255, 0.1);
        transform: scale(1.2); /* 悬浮放大 */
      }
    }
  }
}

/* 移动端特殊增强 */
@media (max-width: 768px) {
  .custom-emoji-box {
    width: 90vw !important; /* 移动端宽度占满 */
    .emoji-grid {
      grid-template-columns: repeat(6, 1fr); /* 移动端每行固定 6 个 */
      span {
        font-size: 2.2rem !important; /* 移动端手指大，表情也要大点 */
      }
    }
  }
}
/* 子评论容器 */
.child-comments {
    margin-top: 15px;
    padding: 12px 15px;
    background: rgba(255, 255, 255, 0.02);
    border-radius: 12px;

    .child-item-wrapper {
        margin-bottom: 15px;
        &:last-child { margin-bottom: 0; }
    }
}

/* 子评论头部：名字与时间同行 */
.child-header {
    display: flex;
    align-items: center;
    gap: 10px;
    margin-bottom: 4px;

    .child-username {
        font-size: 0.85rem;
        color: var(--accent-color);
        font-weight: 600;
    }

    .child-time {
        font-size: 0.75rem;
        color: rgba(255, 255, 255, 0.3);
    }
}

/* 子评论操作按钮样式 */
.child-actions {
    display: flex;
    gap: 15px;
    margin-top: 6px;

    .action-btn {
        font-size: 0.75rem; /* 比一级评论小一号 */
        color: rgba(255, 255, 255, 0.4);
        cursor: pointer;
        display: flex;
        align-items: center;
        gap: 3px;
        transition: all 0.2s;

        &:hover {
            color: var(--accent-color);
        }

        &.is-liked {
            color: #a855f7;
            .mini-icon { transform: scale(1.1); }
        }

        .mini-icon {
            font-size: 12px;
            :deep(svg) { width: 14px; height: 14px; }
        }
    }
}

/* 嵌套的回复框微调 */
.child-reply-box {
    margin-top: 10px;
    background: rgba(255, 255, 255, 0.03) !important;
    border: 1px solid rgba(255, 255, 255, 0.05) !important;

    :deep(.el-textarea__inner) {
        min-height: 60px !important;
        font-size: 0.9rem !important;
    }
}
</style>



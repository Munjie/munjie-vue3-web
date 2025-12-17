import { createRouter, createWebHistory } from 'vue-router'
// @ts-ignore
import HomeView from '../views/HomeView.vue'

const router = createRouter({
    history: createWebHistory(import.meta.env.BASE_URL),
    routes: [
        {
            path: '/',
            name: 'home',
            component: HomeView
        },
        {
            path: '/post/:id',
            name: 'post-detail',
            component: () => import('../views/PostDetailView.vue')
        },
        {
            path: '/ai-chat',
            name: 'ai-chat',
            component: () => import('../views/AiChatView.vue')
        }
    ],
    scrollBehavior() {
        return { top: 0 }
    }
})

export default router
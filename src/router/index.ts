import { createRouter, createWebHistory } from 'vue-router'
// @ts-ignore
import HomeView from '../views/HomeView.vue'
import {useUserStore} from "../stores";

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
            name: 'post',
            props: true,
            component: () => import('../views/PostDetailView.vue')
        },
        {
            path: '/chat',
            name: 'chat',
            component: () => import('../views/AiChatView.vue')
        },
        {
            path: '/login',
            name: 'login',
            component: () => import('../views/login/index.vue')
        },
        {
            path: '/exception/:code',
            name: 'Exception',
            component: () => import('../views/ExceptionView.vue'),
            meta: { title: '异常页面' }
        },
        // 捕获所有未定义路由跳转到 404
        {
            path: '/:pathMatch(.*)*',
            redirect: '/exception/404'
        }
    ],
    scrollBehavior() {
        return { top: 0 }
    }
})


router.beforeEach((to, _from, next) => {
    const userStore = useUserStore();
    const token: string = userStore.getToken || localStorage.getItem('token') || '';

    if (to.path === '/login' && token) {
        next('/');
        return;
    }

    next();
});



export default router
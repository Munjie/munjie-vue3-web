// src/stores/allData.ts
import { defineStore } from 'pinia'
import router from '../../router'

interface AllDataState {
    isCollapse: boolean
    username: string
    avatar: string
    userid: number
    token: string
    permissions: any[] // 可定义具体 Permission 类型
    currentPagePath: string
    locale: string
}


// 初始化状态函数
function stateIni(): AllDataState {
    return {
        isCollapse: false,
        username: '',
        avatar: '',
        userid: 0,
        token: '',
        permissions: [],
        currentPagePath: '/',
        locale: 'en'
    }
}

export const useUserStore = defineStore('useAllData', {
    // 定义状态
    state: stateIni,
    // 定义 getters
    getters: {
        getUsername: (state) => state.username,
        getAvatar: (state) => state.avatar,
        getUserid: (state) => state.userid,
        getToken: (state) => state.token,
        getPermissions: (state) => state.permissions,
        getLocale: (state) => state.locale,
        getCurrentPagePath: (state) => state.currentPagePath,
    },
    // 定义 actions
    actions: {
        // 设置用户名
        setUsername(username: string) {
            this.username = username
        },
        setAvatar(avatar: string) {
            this.avatar = avatar
        },
        // 设置 userid
        setUserid(userid: number) {
            this.userid = userid
        },
        // 设置 token
        setToken(token: string) {
            this.token = token
        },
        // 权限
        setPermissions(val: any[]) {
            this.permissions = val
        },
        // 当前语言
        setLocale(val: string) {
            this.locale = val
        },
        // 当前页面路径
        setCurrentPagePath(val: string) {
            this.currentPagePath = val
        },
        resetStore() {
            // 重置为初始状态
            Object.assign(this.$state, stateIni())
            localStorage.removeItem('user-store')
        },
        // 登出方法
        logout() {
            this.resetStore()
            router.push('/')
        },
    },
    // Persist 配置（修正：移除 enabled 和 strategies，使用 pick）
    persist: {
        key: 'user-store',
        storage: localStorage,
        pick: ['token',  'username',  'avatar', 'userid'] // 使用 pick 指定持久化字段
    }
})


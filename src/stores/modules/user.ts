// src/stores/allData.ts
import {defineStore} from 'pinia'
import router from '../../router'

interface AllDataState {
    isCollapse: boolean
    username: string
    avatar: string
    userid: number
    token: string
    bio: string
    expireAt: number | null
    permissions: any[]
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
        bio: '',
        expireAt: null,
        permissions: [],
        currentPagePath: '/',
        locale: 'en',
    }
}

export const useUserStore = defineStore('useAllData', {
    // 定义状态
    state: stateIni,
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
        setBio(bio: string) {
            this.bio = bio
        },
        setToken(token: string, expireIn?: number) {
            this.token = token
            if (expireIn) {
                // 保存过期时间戳（毫秒）
                this.expireAt = new Date().getTime() + expireIn * 1000
            }
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
            localStorage.clear();
            sessionStorage.clear();
        },
        // 登出方法
        logout() {
            this.resetStore()
            router.push('/')
        },
        getToken() {
            if (!this.token) return ''
            if (this.expireAt && Date.now() > this.expireAt) {
                this.resetStore()
                return ''
            }
            return this.token
        },
        getUserId() {
            if (!this.userid) return 0
            if (this.expireAt && Date.now() > this.expireAt) {
                this.resetStore()
                return ''
            }
            return this.userid
        },
        getUserName() {
            if (!this.username) return ''
            if (this.expireAt && Date.now() > this.expireAt) {
                this.resetStore()
                return ''
            }
            return this.username
        },
        getAvatar() {
            if (!this.avatar) return ''
            if (this.expireAt && Date.now() > this.expireAt) {
                this.resetStore()
                return ''
            }
            return this.avatar
        },
        getBio() {
            if (!this.bio) return ''
            if (this.expireAt && Date.now() > this.expireAt) {
                this.resetStore()
                return ''
            }
            return this.bio
        }


    },
    // Persist 配置
    persist: {
        key: 'user-store',
        storage: localStorage,
        pick: ['token', 'expireAt', 'username', 'avatar', 'userid'] // 使用 pick 指定持久化字段
    }
})


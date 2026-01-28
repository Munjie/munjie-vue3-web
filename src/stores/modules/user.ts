// src/stores/allData.ts
import {defineStore} from 'pinia'
import router from '../../router'

interface AllDataState {
    isCollapse: boolean
    username: string
    avatar: string
    userid: number
    token: string
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
        expireAt: null,
        permissions: [],
        currentPagePath: '/',
        locale: 'en',
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
        // getToken: (state) => state.token,
        getToken: (state) => {
            if (!state.token) return ''
            if (state.expireAt && new Date().getTime() > state.expireAt) {
                // token 已过期：清除并返回空
                const store = useUserStore()
                store.resetStore()
                return ''
            }
            return state.token
        },
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
        /*  setToken(token: string) {
              this.token = token
          },*/
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
        ensureToken() {
            if (!this.token) return ''
            if (this.expireAt && Date.now() > this.expireAt) {
                this.resetStore()
                return ''
            }
            return this.token
        },
        getUserName() {
            if (!this.username) return ''
            if (this.expireAt && Date.now() > this.expireAt) {
                this.resetStore()
                return ''
            }
            return this.username
        },
        getAva() {
            if (!this.avatar) return ''
            if (this.expireAt && Date.now() > this.expireAt) {
                this.resetStore()
                return ''
            }
            return this.avatar
        }


    },
    // Persist 配置
    persist: {
        key: 'user-store',
        storage: localStorage,
        pick: ['token', 'expireAt', 'username', 'avatar', 'userid'] // 使用 pick 指定持久化字段
    }
})


// src/stores/allData.ts
import { defineStore } from 'pinia'
import router from '../../router'

interface PersistedData {
    expireAt: number | null
    data: {
        username: string
        avatar: string
        userid: number
        token: string
        permissions: any[]
        locale: string
        currentPagePath: string
    }
}

function defaultPersisted(): PersistedData {
    return {
        expireAt: null,
        data: {
            username: '',
            avatar: '',
            userid: 0,
            token: '',
            permissions: [],
            locale: 'en',
            currentPagePath: '/'
        }
    }
}

export const useUserStore = defineStore('useAllData', {
    state: () => ({
        isCollapse: false,
        _persistedData: defaultPersisted()
    }),

    getters: {
        // 统一判断是否过期
        _validData(): PersistedData["data"] {
            const { expireAt, data } = this._persistedData

            if (!expireAt || Date.now() < expireAt) {
                return data
            }

            // token过期自动清理
            const store = useUserStore()
            store.resetStore()
            return defaultPersisted().data
        },

        getUsername(): string {
            return this._validData.username
        },

        getAvatar(): string {
            return this._validData.avatar
        },

        getUserid(): number {
            return this._validData.userid
        },

        getToken(): string {
            return this._validData.token
        },

        getPermissions(): any[] {
            return this._validData.permissions
        },

        getLocale(): string {
            return this._validData.locale
        },

        getCurrentPagePath(): string {
            return this._validData.currentPagePath
        },
    },


    actions: {
        // 设置单个字段时统一写入 data 对象
        setUsername(v: string) {
            this._persistedData.data.username = v
        },

        setAvatar(v: string) {
            this._persistedData.data.avatar = v
        },

        setUserid(v: number) {
            this._persistedData.data.userid = v
        },

        setToken(token: string, expireIn?: number) {
            this._persistedData.data.token = token
            if (expireIn) {
                this._persistedData.expireAt = Date.now() + expireIn * 1000
            }
        },

        setPermissions(val: any[]) {
            this._persistedData.data.permissions = val
        },

        setLocale(v: string) {
            this._persistedData.data.locale = v
        },

        setCurrentPagePath(v: string) {
            this._persistedData.data.currentPagePath = v
        },

        resetStore() {
            this._persistedData = defaultPersisted()
            localStorage.removeItem('user-store')
        },

        logout() {
            this.resetStore()
            router.push('/')
        }
    },

    persist: {
        key: 'user-store',
        storage: localStorage,
        pick: ['_persistedData']
    }
})

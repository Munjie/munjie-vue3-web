import http from './http.ts'


// 用户登录
export const logout  = async () => {
    try {
        return await http.get('/api/user/logout')  ;
    } catch (error) {
        console.error(error);
    }
};
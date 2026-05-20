import http from './http.ts'


// 用户登录
export const logout  = async () => {
    try {
        return await http.get('/api/auth/logout')  ;
    } catch (error) {
        console.error(error);
    }
};


export const login = (data?: object) => {
    return http.post(
        '/api/auth/login',
        data
    );
};
import http from './http.ts';





export const updateName = (data?: object) => {
    return http.put(
        '/api/user/update-name',
        data
    );
};




export const updatePwd = (data?: object) => {
    return http.put(
        '/api/user/update-pwd',
        data
    );
};
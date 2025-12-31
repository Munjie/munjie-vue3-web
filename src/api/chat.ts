import http from './http.ts';





export const saveChat = (data?: object) => {
    return http.post(
        '/api/chat/save-chat',
        data
    );
};


export const getChatHistory = async (): Promise<any> => {
    try {
        const response = await http.get(`/api/chat/get-chat-history`);
        return response.data;
    } catch (error) {
        console.error(error);
        throw error;
    }
};


export const getAllModel  = async () => {
    try {
        return await http.get('/api/chat/all-model')  ;
    } catch (error) {
        console.error('获取数据失败:', error);
        return [];
    }
};
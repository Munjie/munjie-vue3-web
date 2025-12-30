import http from './http.ts';
import type {ArticleVO} from "../types/article.ts";

export const pageHomeArticle = (data?: object) => {
    return http.post(
        '/api/article/page-home-article',
        data
    );
};



export const sendView = (data?: object) => {
    return http.post(
        '/api/article/count-view',
        data
    );
};


export const getArticleById = async (id: any): Promise<ArticleVO> => {
    try {
        const response = await http.get(`/api/article/get-article-by-id/${id}`);
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
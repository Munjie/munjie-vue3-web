import http from './http.ts';


export const pageHomeArticle = (data?: object) => {
    return http.post(
        '/api/article/page-home-article',
        data
    );
};







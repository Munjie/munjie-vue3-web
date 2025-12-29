import http from './http.ts';





export const addComment = (data?: object) => {
    return http.post(
        '/api/article/add-comment',
        data
    );
};


export const getComments = async (id: number| undefined): Promise<any> => {
    try {
        const response = await http.get(`/api/article/all-comment/${id}`);
        return response.data;
    } catch (error) {
        return null;
    }
};

export const updateArticleLike = async (id: number| undefined): Promise<any> => {
    try {
        const response = await http.get(`/api/article/article-like/${id}`);
        return response.data;
    } catch (error) {
        return null;
    }
};

export const updateCommentLike = async (id: number| undefined): Promise<any> => {
    try {
        const response = await http.get(`/api/article/comment-like/${id}`);
        return response.data;
    } catch (error) {
        return null;
    }
};
import http from './http.ts';





export const addComment = (data?: object) => {
    return http.post(
        '/api/article/add-comment',
        data
    );
};


export const getComments = async (id: any,userId: any): Promise<any> => {
    try {
        const response = await http.get(`/api/article/all-comment/${id}/${userId}`);
        return response.data;
    } catch (error) {
        return null;
    }
};

export const updateArticleLike = async (id: any,userId: any): Promise<any> => {
    try {
        const response = await http.get(`/api/article/article-like/${id}/${userId}`);
        return response.data;
    } catch (error) {
        return null;
    }
};

export const updateCommentLike = async (id: any,userId: any): Promise<any> => {
    try {
        const response = await http.get(`/api/article/comment-like/${id}/${userId}`);
        return response.data;
    } catch (error) {
        return null;
    }
};
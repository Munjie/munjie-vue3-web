import http from './http.ts';





export const addComment = (data?: object) => {
    return http.post(
        '/api/comments/add-comment',
        data
    );
};


export const getComments = async (id: number| undefined): Promise<any> => {
    try {
        const response = await http.get(`/api/comments/get-comments/${id}`);
        return response.data;
    } catch (error) {
        return null;
    }
};
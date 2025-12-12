// src/types/article.ts
export interface ArticleVO {
    id: number
    title: string
    introduction: string
    publishTime: string        // 你已经决定用 string
    category: string
    image: string
    content: string
    createTime: string
    views: number
}
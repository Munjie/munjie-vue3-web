// src/types/article.ts
export interface ArticleVO {
    id: number
    title: string
    introduction: string
    publishTime: string
    category: string
    image: string
    content: string
    createTime: string
    views: number
    tags: []
}
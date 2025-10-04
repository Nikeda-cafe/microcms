export interface EyecatchImage {
  url: string;
  width?: number;
  height?: number;
}

export interface Category {
  id: string;
  name: string;
  slug: string;
}

export interface Tag {
  id: string;
  name: string;
  slug: string;
}

export interface Article {
  id: string;
  slug: string;
  title: string;
  description?: string;
  body: string;
  category: Category | null;
  tags: Tag[];
  publishedAt: string;
  updatedAt: string;
  eyecatch?: EyecatchImage | null;
}

export interface ArticleListResponse {
  totalCount: number;
  offset: number;
  limit: number;
  contents: Article[];
}

import {
  createClient,
  type MicroCMSListResponse,
  type MicroCMSQueries
} from 'microcms-js-sdk';
import type { Article, Category, Tag } from '~/types/blog';

type MicroCMSClient = ReturnType<typeof createClient> | null;

interface MicroCMSArticle extends Article {}

const sampleCategory: Category = {
  id: 'news',
  name: 'News',
  slug: 'news'
};

const sampleTag: Tag = {
  id: 'nuxt',
  name: 'Nuxt',
  slug: 'nuxt'
};

const sampleArticles: Article[] = [
  {
    id: 'welcome-to-the-blog',
    slug: 'welcome-to-the-blog',
    title: 'Welcome to the Nuxt3 + microCMS Blog',
    description: 'Overview of the demo blog powered by Nuxt3, Pinia, and microCMS.',
    body: '# Welcome\nThis is sample content rendered with **Markdown**.',
    category: sampleCategory,
    tags: [sampleTag],
    publishedAt: '2024-01-01T00:00:00.000Z',
    updatedAt: '2024-01-01T00:00:00.000Z',
    eyecatch: {
      url: 'https://placehold.co/800x400',
      width: 800,
      height: 400
    }
  },
  {
    id: 'getting-started-with-nuxt3',
    slug: 'getting-started-with-nuxt3',
    title: 'Getting Started with Nuxt3',
    description: 'Learn how this project uses Nuxt3 features together with microCMS.',
    body: '## Getting Started\nSet MICROCMS credentials to fetch real data.',
    category: sampleCategory,
    tags: [sampleTag],
    publishedAt: '2024-01-08T00:00:00.000Z',
    updatedAt: '2024-01-08T00:00:00.000Z',
    eyecatch: {
      url: 'https://placehold.co/800x400?text=Nuxt3',
      width: 800,
      height: 400
    }
  }
];

let cachedClient: MicroCMSClient = null;

const mapArticle = (entry: MicroCMSArticle): Article => ({
  id: entry.id,
  slug: entry.slug || entry.id,
  title: entry.title,
  description: entry.description,
  body: entry.body,
  category: entry.category ?? null,
  tags: entry.tags ?? [],
  publishedAt: entry.publishedAt,
  updatedAt: entry.updatedAt,
  eyecatch: entry.eyecatch ?? null
});

const getClient = (): MicroCMSClient => {
  if (cachedClient) {
    return cachedClient;
  }

  const nuxtApp = useNuxtApp();
  const injected = nuxtApp.$microcmsClient;

  if (injected) {
    cachedClient = injected;
    return cachedClient;
  }

  const config = useRuntimeConfig();
  if (!config.microcmsServiceDomain || !config.microcmsApiKey) {
    return null;
  }

  cachedClient = createClient({
    serviceDomain: config.microcmsServiceDomain,
    apiKey: config.microcmsApiKey
  });

  return cachedClient;
};

const buildListResponse = (
  articles: Article[],
  totalCount = articles.length,
  offset = 0,
  limit = articles.length
): MicroCMSListResponse<Article> => ({
  totalCount,
  offset,
  limit,
  contents: articles
});

export const fetchArticles = async (
  queries?: MicroCMSQueries
): Promise<MicroCMSListResponse<Article>> => {
  const client = getClient();

  if (!client) {
    const limit = queries?.limit ?? sampleArticles.length;
    return buildListResponse(sampleArticles.slice(0, limit));
  }

  const response = await client.getList<MicroCMSArticle>({
    endpoint: 'articles',
    queries
  });

  return {
    totalCount: response.totalCount,
    offset: response.offset,
    limit: response.limit,
    contents: response.contents.map(mapArticle)
  };
};

export const fetchArticleBySlug = async (slug: string): Promise<Article | null> => {
  if (!slug) {
    return null;
  }

  const client = getClient();

  if (!client) {
    return sampleArticles.find((article) => article.slug === slug) ?? null;
  }

  const response = await client.getList<MicroCMSArticle>({
    endpoint: 'articles',
    queries: {
      filters: `slug[equals]${slug}`,
      limit: 1,
      depth: 2
    }
  });

  if (!response.contents.length) {
    return null;
  }

  return mapArticle(response.contents[0]);
};

export const fetchArticlesByCategory = async (
  categorySlug: string,
  queries?: MicroCMSQueries
): Promise<MicroCMSListResponse<Article>> => {
  const client = getClient();

  if (!client) {
    const filtered = sampleArticles.filter(
      (article) => article.category?.slug === categorySlug
    );
    return buildListResponse(filtered);
  }

  const response = await client.getList<MicroCMSArticle>({
    endpoint: 'articles',
    queries: {
      ...queries,
      filters: `category[equals]${categorySlug}`
    }
  });

  return {
    totalCount: response.totalCount,
    offset: response.offset,
    limit: response.limit,
    contents: response.contents.map(mapArticle)
  };
};

export const fetchArticlesByTag = async (
  tagSlug: string,
  queries?: MicroCMSQueries
): Promise<MicroCMSListResponse<Article>> => {
  const client = getClient();

  if (!client) {
    const filtered = sampleArticles.filter((article) =>
      article.tags.some((tag) => tag.slug === tagSlug)
    );
    return buildListResponse(filtered);
  }

  const response = await client.getList<MicroCMSArticle>({
    endpoint: 'articles',
    queries: {
      ...queries,
      filters: `tags[contains]${tagSlug}`
    }
  });

  return {
    totalCount: response.totalCount,
    offset: response.offset,
    limit: response.limit,
    contents: response.contents.map(mapArticle)
  };
};

export const fetchPopularArticles = async (
  queries?: MicroCMSQueries
): Promise<Article[]> => {
  const client = getClient();

  if (!client) {
    return sampleArticles;
  }

  const response = await client.getList<MicroCMSArticle>({
    endpoint: 'articles',
    queries: {
      orders: '-popularity',
      limit: queries?.limit ?? 5
    }
  });

  return response.contents.map(mapArticle);
};

export type { MicroCMSQueries } from 'microcms-js-sdk';

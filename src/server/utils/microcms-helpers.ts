import { createClient } from 'microcms-js-sdk';
import type { MicroCMSQueries } from 'microcms-js-sdk';
import { useRuntimeConfig } from '#imports';
import type { Article, Category, Tag, EyecatchImage, ArticleListResponse } from '~/types/blog';

type MicroCMSClient = ReturnType<typeof createClient> | null;

export interface MicroCMSArticle {
  id: string;
  slug?: string;
  title: string;
  description?: string;
  body: string;
  category?: Category | null;
  tags?: Tag[];
  eyecatch?: EyecatchImage | null;
  thumbnail?: EyecatchImage | null;
  publishedAt: string;
  updatedAt: string;
}

export const ARTICLE_ENDPOINT = 'news';

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

export const sampleArticles: Article[] = [
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

export const sanitizeServiceDomain = (value: string): string => {
  const trimmed = value?.trim() ?? '';
  return trimmed
    .replace(/^https?:\/\//i, '')
    .replace(/\.microcms\.io.*$/i, '')
    .replace(/\/.*/, '');
};

export const createMicroCMSClient = (): MicroCMSClient => {
  const config = useRuntimeConfig();
  const domain = sanitizeServiceDomain(config.microcmsServiceDomain ?? '');
  const apiKey = config.microcmsApiKey ?? '';

  if (!domain || !apiKey) {
    return null;
  }

  return createClient({
    serviceDomain: domain,
    apiKey
  });
};

export const mapArticle = (entry: MicroCMSArticle): Article => ({
  id: entry.id,
  slug: entry.slug || entry.id,
  title: entry.title,
  description: entry.description,
  body: entry.body,
  category: entry.category ?? null,
  tags: entry.tags ?? [],
  publishedAt: entry.publishedAt,
  updatedAt: entry.updatedAt,
  eyecatch: entry.eyecatch ?? entry.thumbnail ?? null
});

type SampleListParams = {
  limit?: number;
  offset?: number;
  orders?: string;
  category?: string;
  tag?: string;
};

const sortArticles = (articles: Article[], orders?: string) => {
  if (!orders) {
    return articles;
  }

  const field = orders.startsWith('-') ? orders.slice(1) : orders;
  const direction = orders.startsWith('-') ? -1 : 1;

  if (!['publishedAt', 'updatedAt'].includes(field)) {
    return articles;
  }

  return [...articles].sort((a, b) => {
    const left = Date.parse(String(a[field as keyof Article] ?? ''));
    const right = Date.parse(String(b[field as keyof Article] ?? ''));
    return (left - right) * direction;
  });
};

export const buildSampleList = (params: SampleListParams = {}): ArticleListResponse => {
  const { limit, offset, orders, category, tag } = params;
  let articles = [...sampleArticles];

  if (category) {
    articles = articles.filter((article) => article.category?.slug === category);
  }

  if (tag) {
    articles = articles.filter((article) =>
      article.tags.some((entry) => entry.slug === tag)
    );
  }

  articles = sortArticles(articles, orders);

  const safeOffset = Math.max(0, offset ?? 0);
  const safeLimit = limit ?? articles.length;

  return {
    totalCount: articles.length,
    offset: safeOffset,
    limit: safeLimit,
    contents: articles.slice(safeOffset, safeOffset + safeLimit)
  };
};

export const findSampleArticle = (slug: string): Article | null => {
  return sampleArticles.find((article) => article.slug === slug || article.id === slug) ?? null;
};

export const buildMicroCMSQueries = (params: SampleListParams): MicroCMSQueries => {
  const queries: MicroCMSQueries = {};

  if (typeof params.limit === 'number') {
    queries.limit = params.limit;
  }

  if (typeof params.offset === 'number') {
    queries.offset = params.offset;
  }

  if (params.orders) {
    queries.orders = params.orders;
  }

  const filters: string[] = [];
  if (params.category) {
    filters.push(`category[equals]${params.category}`);
  }
  if (params.tag) {
    filters.push(`tags[contains]${params.tag}`);
  }

  if (filters.length) {
    queries.filters = filters.join('[and]');
  }

  return queries;
};

export const parseQueryParams = (
  input: Record<string, string | string[] | undefined>
): SampleListParams => {
  const pickNumber = (value: string | string[] | undefined) => {
    if (value === undefined) {
      return undefined;
    }
    const parsed = Number(Array.isArray(value) ? value[0] : value);
    return Number.isNaN(parsed) ? undefined : parsed;
  };

  const pickString = (value: string | string[] | undefined) => {
    if (value === undefined) {
      return undefined;
    }
    return String(Array.isArray(value) ? value[0] : value);
  };

  return {
    limit: pickNumber(input.limit),
    offset: pickNumber(input.offset),
    orders: pickString(input.orders),
    category: pickString(input.category),
    tag: pickString(input.tag)
  };
};

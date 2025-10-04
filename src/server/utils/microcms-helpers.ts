import { createClient } from 'microcms-js-sdk';
import type { MicroCMSListResponse, MicroCMSQueries } from 'microcms-js-sdk';
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

let cachedClient: MicroCMSClient = null;
let cachedServiceDomain: string | null = null;

export const sanitizeServiceDomain = (domain: string): string => {
  if (!domain) {
    return '';
  }

  let sanitized = domain.trim();
  sanitized = sanitized.replace(/^https?:\/\//i, '');
  sanitized = sanitized.replace(/\.microcms\.io.*$/i, '');
  sanitized = sanitized.replace(/\/.*/, '');
  return sanitized;
};

export const getCachedServiceDomain = (): string | null => cachedServiceDomain;

export const getMicroCMSClient = (): MicroCMSClient => {
  if (cachedClient) {
    return cachedClient;
  }

  const config = useRuntimeConfig();
  const serviceDomain = sanitizeServiceDomain(config.microcmsServiceDomain ?? '');

  if (!serviceDomain || !config.microcmsApiKey) {
    return null;
  }

  cachedClient = createClient({
    serviceDomain,
    apiKey: config.microcmsApiKey
  });
  cachedServiceDomain = serviceDomain;

  return cachedClient;
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

const sortArticles = (articles: Article[], orders?: string) => {
  if (!orders) {
    return articles;
  }

  const direction = orders.startsWith('-') ? -1 : 1;
  const field = orders.replace(/^-/, '');

  const sortableFields: Array<keyof Article> = ['publishedAt', 'updatedAt'];
  if (!sortableFields.includes(field as keyof Article)) {
    return articles;
  }

  return [...articles].sort((a, b) => {
    const left = a[field as keyof Article];
    const right = b[field as keyof Article];

    if (typeof left === 'string' && typeof right === 'string') {
      const leftTime = Date.parse(left);
      const rightTime = Date.parse(right);

      if (!Number.isNaN(leftTime) && !Number.isNaN(rightTime)) {
        return (leftTime - rightTime) * direction;
      }

      return left.localeCompare(right) * direction;
    }

    return direction;
  });
};

interface SampleListParams {
  limit?: number;
  offset?: number;
  orders?: string;
  category?: string;
  tag?: string;
}

export const buildSampleListResponse = ({
  limit,
  offset,
  orders,
  category,
  tag
}: SampleListParams): ArticleListResponse => {
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

  const resolvedOffset = offset ?? 0;
  const resolvedLimit = limit ?? articles.length;
  const sliced = articles.slice(resolvedOffset, resolvedOffset + resolvedLimit);

  return {
    totalCount: articles.length,
    offset: resolvedOffset,
    limit: resolvedLimit,
    contents: sliced
  };
};

export const buildMicroCMSQueries = (
  query: Record<string, string | string[] | undefined>
): MicroCMSQueries => {
  const queries: MicroCMSQueries = {};

  const numberKeys: Array<keyof Pick<MicroCMSQueries, 'limit' | 'offset' | 'depth'>> = [
    'limit',
    'offset',
    'depth'
  ];

  numberKeys.forEach((key) => {
    const value = query[key];
    if (value === undefined) {
      return;
    }
    const parsed = Number(value);
    if (!Number.isNaN(parsed)) {
      queries[key] = parsed;
    }
  });

  const stringKeys: Array<keyof Pick<MicroCMSQueries, 'fields' | 'orders' | 'filters' | 'q'>> = [
    'fields',
    'orders',
    'filters',
    'q'
  ];

  stringKeys.forEach((key) => {
    const value = query[key];
    if (value !== undefined) {
      queries[key] = String(value);
    }
  });

  const filters: string[] = [];

  if (query.category) {
    filters.push(`category[equals]${query.category}`);
  }

  if (query.tag) {
    filters.push(`tags[contains]${query.tag}`);
  }

  if (queries.filters) {
    filters.push(String(queries.filters));
  }

  if (filters.length) {
    queries.filters = filters.join('[and]');
  }

  return queries;
};

export const buildSampleQueries = (
  query: Record<string, string | string[] | undefined>
): SampleListParams => {
  const params: SampleListParams = {};

  if (query.limit !== undefined) {
    const parsed = Number(query.limit);
    if (!Number.isNaN(parsed)) {
      params.limit = parsed;
    }
  }

  if (query.offset !== undefined) {
    const parsed = Number(query.offset);
    if (!Number.isNaN(parsed)) {
      params.offset = parsed;
    }
  }

  if (query.orders !== undefined) {
    params.orders = String(query.orders);
  }

  if (query.category !== undefined) {
    params.category = String(query.category);
  }

  if (query.tag !== undefined) {
    params.tag = String(query.tag);
  }

  return params;
};

export type { MicroCMSListResponse, MicroCMSQueries };

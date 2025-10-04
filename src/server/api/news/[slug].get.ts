import { defineEventHandler, createError } from 'h3';
import type { Article } from '~/types/blog';
import {
  ARTICLE_ENDPOINT,
  getMicroCMSClient,
  mapArticle,
  sampleArticles,
  type MicroCMSArticle
} from '~/server/utils/microcms-helpers';

export default defineEventHandler(async (event) => {
  const params = event.context.params ?? {};
  const slug = String(params.slug ?? '');

  if (!slug) {
    throw createError({ statusCode: 400, statusMessage: 'Article slug is required' });
  }

  const client = getMicroCMSClient();

  if (!client) {
    if (process.dev && process.server) {
      console.warn('[api/news/:slug] microCMS client unavailable, using sample data', slug);
    }
    const article = sampleArticles.find(
      (entry) => entry.slug === slug || entry.id === slug
    );
    if (!article) {
      throw createError({ statusCode: 404, statusMessage: 'Article not found' });
    }
    return article;
  }

  try {
    if (process.dev && process.server) {
      console.log('[api/news/:slug] fetching detail', slug);
    }
    const entry = await client.getListDetail<MicroCMSArticle>({
      endpoint: ARTICLE_ENDPOINT,
      contentId: slug
    });

    const article: Article = mapArticle(entry);
    return article;
  } catch (_error) {
    if (process.dev && process.server) {
      console.warn('[api/news/:slug] fallback to slug filter', slug, _error);
    }
    const response = await client.getList<MicroCMSArticle>({
      endpoint: ARTICLE_ENDPOINT,
      queries: {
        filters: `slug[equals]${slug}`,
        limit: 1,
        depth: 2
      }
    });

    if (!response.contents.length) {
      if (process.dev && process.server) {
        console.error('[api/news/:slug] not found', slug, _error);
      }
      throw createError({ statusCode: 404, statusMessage: 'Article not found' });
    }

    return mapArticle(response.contents[0]);
  }
});

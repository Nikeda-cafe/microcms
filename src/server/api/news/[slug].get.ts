import { defineEventHandler, createError } from 'h3';
import type { Article } from '~/types/blog';
import {
  ARTICLE_ENDPOINT,
  createMicroCMSClient,
  mapArticle,
  type MicroCMSArticle
} from '~/server/utils/microcms-helpers';

export default defineEventHandler(async (event) => {
  const params = event.context.params ?? {};
  const slug = String(params.slug ?? '');

  if (!slug) {
    throw createError({ statusCode: 400, statusMessage: 'Article slug is required' });
  }

  const client = createMicroCMSClient();
  if (!client) {
    throw createError({ statusCode: 502, statusMessage: 'MicroCMS client is not available' });
  }
  try {
    const entry = await client.getListDetail<MicroCMSArticle>({
      endpoint: ARTICLE_ENDPOINT,
      contentId: slug
    });

    const article: Article = mapArticle(entry);
    return article;
  } catch (_error) {
    const response = await client.getList<MicroCMSArticle>({
      endpoint: ARTICLE_ENDPOINT,
      queries: {
        filters: `slug[equals]${slug}`,
        limit: 1,
        depth: 2
      }
    });

    if (!response.contents.length) {
      throw createError({ statusCode: 404, statusMessage: 'Article not found' });
    }

    return mapArticle(response.contents[0]);
  }
});

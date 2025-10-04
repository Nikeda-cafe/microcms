import { defineEventHandler, getQuery, createError } from 'h3';
import type { ArticleListResponse } from '~/types/blog';
import {
  ARTICLE_ENDPOINT,
  buildMicroCMSQueries,
  createMicroCMSClient,
  mapArticle,
  parseQueryParams,
  type MicroCMSArticle
} from '~/server/utils/microcms-helpers';

export default defineEventHandler(async (event) => {
  const params = parseQueryParams(getQuery(event));
  const client = createMicroCMSClient();

  if (!client) {
    throw createError({ statusCode: 502, statusMessage: 'MicroCMS client is not available' });
  }

  const queries = buildMicroCMSQueries(params);

  try {
    const response = await client.getList<MicroCMSArticle>({
      endpoint: ARTICLE_ENDPOINT,
      queries
    });

    const payload: ArticleListResponse = {
      totalCount: response.totalCount,
      offset: response.offset,
      limit: response.limit,
      contents: response.contents.map(mapArticle)
    };

    if (process.dev && process.server) {
      console.log('[api/news] fetched from microCMS', queries);
    }

    return payload;
  } catch (error) {
    throw createError({
      statusCode: 502,
      statusMessage: 'Failed to fetch articles from microCMS',
      data: error instanceof Error ? error.message : error
    });
  }
});

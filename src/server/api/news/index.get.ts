import { defineEventHandler, getQuery, createError } from 'h3';
import { useRuntimeConfig } from '#imports';
import type { ArticleListResponse } from '~/types/blog';
import {
  ARTICLE_ENDPOINT,
  buildMicroCMSQueries,
  buildSampleListResponse,
  buildSampleQueries,
  getMicroCMSClient,
  mapArticle,
  sanitizeServiceDomain,
  type MicroCMSArticle
} from '~/server/utils/microcms-helpers';

export default defineEventHandler(async (event) => {
  const query = getQuery(event);
  if (process.dev && process.server) {
    console.log('[api/news] incoming query', query);
  }
  const client = getMicroCMSClient();

  if (!client) {
    if (process.dev && process.server) {
      console.warn('[api/news] microCMS client unavailable, using sample data');
    }
    return buildSampleListResponse(buildSampleQueries(query));
  }

  const queries = buildMicroCMSQueries(query);

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
      const params = new URLSearchParams();
      Object.entries(queries).forEach(([key, value]) => {
        if (value !== undefined) {
          params.set(key, String(value));
        }
      });
      const { microcmsServiceDomain } = useRuntimeConfig();
      const domain = sanitizeServiceDomain(microcmsServiceDomain ?? '');
      if (domain) {
        const baseUrl = `https://${domain}.microcms.io/api/v1/${ARTICLE_ENDPOINT}`;
        const queryString = params.toString();
        console.log('[api/news] GET', queryString ? `${baseUrl}?${queryString}` : baseUrl);
      }
    }

    return payload;
  } catch (error) {
    if (process.dev && process.server) {
      console.error('[api/news] request failed', error);
    }
    throw createError({
      statusCode: 502,
      statusMessage: 'Failed to fetch articles from microCMS',
      data: error instanceof Error ? error.message : error
    });
  }
});

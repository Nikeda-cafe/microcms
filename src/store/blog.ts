import { defineStore } from 'pinia';
import type { Article } from '~/types/blog';
import {
  fetchArticles,
  fetchPopularArticles,
  type MicroCMSQueries
} from '~/utils/microcms';

interface BlogState {
  articles: Article[];
  popularArticles: Article[];
  loading: boolean;
  totalCount: number;
  error: string | null;
}

export const useBlogStore = defineStore('blog', {
  state: (): BlogState => ({
    articles: [],
    popularArticles: [],
    loading: false,
    totalCount: 0,
    error: null
  }),
  actions: {
    async loadArticles(queries?: MicroCMSQueries) {
      this.loading = true;
      try {
        const response = await fetchArticles(queries);
        this.articles = response.contents;
        this.totalCount = response.totalCount;
        this.error = null;
      } catch (error) {
        this.error =
          error instanceof Error ? error.message : 'Failed to load articles';
      } finally {
        this.loading = false;
      }
    },
    async loadPopularArticles(limit = 5) {
      try {
        const articles = await fetchPopularArticles({ limit });
        this.popularArticles = articles;
      } catch (error) {
        if (!this.error) {
          this.error =
            error instanceof Error ? error.message : 'Failed to load popular articles';
        }
      }
    }
  }
});

<template>
  <div class="home">
    <PageHeader
      title="microCMS Blog"
      description="Nuxt3 application using microCMS for headless content management."
    />

    <section class="home__section">
      <header class="home__section-header">
        <h2>Latest Articles</h2>
        <NuxtLink class="home__more" to="/blog">View all</NuxtLink>
      </header>
      <p v-if="errorMessage" class="home__error">{{ errorMessage }}</p>
      <p v-else-if="loading" class="home__loading">Loading articles...</p>
      <BlogList v-else :articles="latestArticles" />
    </section>

    <section v-if="popularArticles.length" class="home__section">
      <header class="home__section-header">
        <h2>Popular Articles</h2>
      </header>
      <BlogList :articles="popularArticles" />
    </section>
  </div>
</template>

<script setup lang="ts">
import PageHeader from '~/components/ui/PageHeader.vue';
import BlogList from '~/components/blog/BlogList.vue';
import type { ArticleListResponse } from '~/types/blog';
import { useSiteMeta } from '~/composables/useSiteMeta';

useSiteMeta('microCMS Blog', 'Nuxt3 application using microCMS for headless content management.');

const {
  data: latestResponse,
  pending: latestPending,
  error: latestError
} = await useFetch<ArticleListResponse>('/api/news', {
  query: { limit: 6, orders: '-publishedAt' }
});

const {
  data: popularResponse,
  error: popularError
} = await useFetch<ArticleListResponse>('/api/news', {
  query: { limit: 3, orders: '-publishedAt' }
});

const latestArticles = computed(() => latestResponse.value?.contents ?? []);
const popularArticles = computed(() => (popularError.value ? [] : popularResponse.value?.contents ?? []));
const loading = computed(() => latestPending.value);
const errorMessage = computed(() => latestError.value?.message ?? null);
</script>

<style scoped>
.home__section {
  margin-top: 3rem;
}

.home__section-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 1rem;
}

.home__section-header h2 {
  font-size: 1.5rem;
  color: #111827;
}

.home__more {
  font-size: 0.95rem;
  color: #2563eb;
  text-decoration: none;
}

.home__error {
  color: #dc2626;
}

.home__loading {
  color: #4b5563;
}
</style>

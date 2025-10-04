<template>
  <article v-if="article" class="article">
    <PageHeader :title="article.title" :description="article.description" />
    <ArticleMeta
      class="article__meta"
      :published-at="article.publishedAt"
      :updated-at="article.updatedAt"
      :category="article.category"
      :tags="article.tags"
    />
    <img
      v-if="article.eyecatch?.url"
      class="article__image"
      :src="article.eyecatch.url"
      :alt="article.title"
    />
    <div class="article__body" v-html="html"></div>
  </article>
  <p v-else-if="errorMessage" class="article__status">{{ errorMessage }}</p>
  <p v-else-if="isLoading" class="article__status">Loading article...</p>
  <p v-else class="article__status">Article unavailable.</p>
</template>

<script setup lang="ts">
import { createError } from '#app';
import PageHeader from '~/components/ui/PageHeader.vue';
import ArticleMeta from '~/components/blog/ArticleMeta.vue';
import { renderMarkdown } from '~/utils/markdown';
import { useSiteMeta } from '~/composables/useSiteMeta';
import type { Article } from '~/types/blog';

const route = useRoute();
const slug = computed(() => String(route.params.slug));

const {
  data,
  pending,
  error
} = await useFetch<Article>(() => `/api/news/${slug.value}`, {
  key: computed(() => `article-${slug.value}`)
});

if (error.value?.statusCode === 404) {
  throw createError({
    statusCode: 404,
    statusMessage: 'Article not found'
  });
}

const article = computed(() => data.value ?? null);
const html = computed(() => (article.value ? renderMarkdown(article.value.body) : ''));
const errorMessage = computed(() => error.value?.message || null);
const isLoading = computed(() => pending.value && !article.value && !error.value);

watchEffect(() => {
  if (article.value) {
    useSiteMeta(`${article.value.title} | microCMS Blog`, article.value.description);
  }
});
</script>

<style scoped>
.article__meta {
  margin-bottom: 2rem;
}

.article__image {
  width: 100%;
  border-radius: 12px;
  margin-bottom: 2rem;
}

.article__body :global(h2) {
  font-size: 1.5rem;
  margin-top: 2rem;
}

.article__body :global(p) {
  margin: 1rem 0;
  line-height: 1.8;
  color: #1f2937;
}

.article__body :global(pre) {
  background: #0f172a;
  color: #f8fafc;
  padding: 1rem;
  border-radius: 8px;
  overflow-x: auto;
}

.article__status {
  color: #4b5563;
}
</style>

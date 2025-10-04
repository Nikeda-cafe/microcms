<template>
  <div class="blog-index">
    <PageHeader
      title="Blog Articles"
      description="Browse all published articles from microCMS."
    />

    <p v-if="error" class="blog-index__status">{{ error }}</p>
    <p v-else-if="loading" class="blog-index__status">Loading articles...</p>
    <BlogList v-else :articles="articles" />

    <nav v-if="totalPages > 1" class="blog-index__pagination">
      <NuxtLink
        v-if="currentPage > 1"
        class="blog-index__page"
        :to="pageHref(currentPage - 1)"
      >
        Previous
      </NuxtLink>
      <span class="blog-index__page">Page {{ currentPage }} / {{ totalPages }}</span>
      <NuxtLink
        v-if="currentPage < totalPages"
        class="blog-index__page"
        :to="pageHref(currentPage + 1)"
      >
        Next
      </NuxtLink>
    </nav>
  </div>
</template>

<script setup lang="ts">
import PageHeader from '~/components/ui/PageHeader.vue';
import BlogList from '~/components/blog/BlogList.vue';
import { useBlogStore } from '~/store/blog';
import { useSiteMeta } from '~/composables/useSiteMeta';

const limit = 10;
const blogStore = useBlogStore();
const route = useRoute();

const currentPage = computed(() => {
  const page = Number(route.query.page ?? '1');
  return Number.isNaN(page) || page < 1 ? 1 : page;
});

useSiteMeta('Blog Articles | microCMS Blog', 'Browse the full list of blog articles powered by microCMS.');

await useAsyncData('blog-index', async () => {
  const offset = (currentPage.value - 1) * limit;
  await blogStore.loadArticles({ limit, offset, orders: '-publishedAt' });
  return true;
});

const articles = computed(() => blogStore.articles);
const totalPages = computed(() => Math.ceil(blogStore.totalCount / limit) || 1);
const loading = computed(() => blogStore.loading);
const error = computed(() => blogStore.error);

const pageHref = (page: number) => ({
  path: '/blog',
  query: page > 1 ? { page } : {}
});
</script>

<style scoped>
.blog-index__status {
  color: #4b5563;
  margin-bottom: 1.5rem;
}

.blog-index__pagination {
  margin-top: 2rem;
  display: flex;
  gap: 1rem;
  align-items: center;
  justify-content: center;
}

.blog-index__page {
  color: #2563eb;
  text-decoration: none;
}
</style>

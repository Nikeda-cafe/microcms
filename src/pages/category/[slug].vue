<template>
  <div class="category-page">
    <PageHeader :title="categoryTitle" :description="categoryDescription" />
    <p v-if="error" class="category-page__status">{{ errorMessage }}</p>
    <p v-else-if="loading" class="category-page__status">Loading articles...</p>
    <BlogList v-else :articles="articles" />
  </div>
</template>

<script setup lang="ts">
import PageHeader from '~/components/ui/PageHeader.vue';
import BlogList from '~/components/blog/BlogList.vue';
import { fetchArticlesByCategory } from '~/utils/microcms';
import { useSiteMeta } from '~/composables/useSiteMeta';

const route = useRoute();
const slug = computed(() => String(route.params.slug));

const { data, pending, error } = await useAsyncData(`category-${slug.value}`, async () => {
  return fetchArticlesByCategory(slug.value, {
    limit: 20,
    orders: '-publishedAt'
  });
});

const articles = computed(() => data.value?.contents ?? []);
const loading = computed(() => pending.value);
const errorMessage = computed(
  () => error.value?.message || 'Failed to fetch category articles.'
);
const categoryTitle = computed(() => {
  const first = articles.value[0];
  return first?.category?.name || `Category: ${slug.value}`;
});
const categoryDescription = computed(() =>
  `Articles in the ${categoryTitle.value} category.`
);

watchEffect(() => {
  useSiteMeta(`${categoryTitle.value} | microCMS Blog`, categoryDescription.value);
});
</script>

<style scoped>
.category-page__status {
  color: #4b5563;
}
</style>

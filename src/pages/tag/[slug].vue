<template>
  <div class="tag-page">
    <PageHeader :title="tagTitle" :description="tagDescription" />
    <p v-if="error" class="tag-page__status">{{ errorMessage }}</p>
    <p v-else-if="loading" class="tag-page__status">Loading articles...</p>
    <BlogList v-else :articles="articles" />
  </div>
</template>

<script setup lang="ts">
import PageHeader from '~/components/ui/PageHeader.vue';
import BlogList from '~/components/blog/BlogList.vue';
import { fetchArticlesByTag } from '~/utils/microcms';
import { useSiteMeta } from '~/composables/useSiteMeta';

const route = useRoute();
const slug = computed(() => String(route.params.slug));

const { data, pending, error } = await useAsyncData(`tag-${slug.value}`, async () => {
  return fetchArticlesByTag(slug.value, {
    limit: 20,
    orders: '-publishedAt'
  });
});

const articles = computed(() => data.value?.contents ?? []);
const loading = computed(() => pending.value);
const errorMessage = computed(() => error.value?.message || 'Failed to fetch tag articles.');
const tagTitle = computed(() => {
  const first = articles.value[0];
  const matchedTag = first?.tags.find((tag) => tag.slug === slug.value);
  return matchedTag?.name || `Tag: ${slug.value}`;
});
const tagDescription = computed(() => `Articles tagged with ${tagTitle.value}.`);

watchEffect(() => {
  useSiteMeta(`${tagTitle.value} | microCMS Blog`, tagDescription.value);
});
</script>

<style scoped>
.tag-page__status {
  color: #4b5563;
}
</style>

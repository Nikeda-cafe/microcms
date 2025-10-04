<template>
  <div class="blog-list">
    <BlogCard
      v-for="article in articles"
      :key="article.id"
      :title="article.title"
      :description="article.description"
      :href="`/blog/${article.slug}`"
      :published-at="article.publishedAt"
      :category="article.category"
      :tags="article.tags"
      :eyecatch="article.eyecatch"
    />
  </div>
</template>

<script setup lang="ts">
import type { Article } from '~/types/blog';
import BlogCard from '~/components/blog/BlogCard.vue';

interface Props {
  articles: Article[];
}

withDefaults(defineProps<Props>(), {
  articles: () => []
});
</script>

<style scoped>
.blog-list {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(260px, 1fr));
  gap: 1.5rem;
}
</style>

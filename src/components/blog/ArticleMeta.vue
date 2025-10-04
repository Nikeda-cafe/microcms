<template>
  <aside class="article-meta">
    <div v-if="publishedAt" class="article-meta__row">
      <span class="article-meta__label">Published</span>
      <time :datetime="publishedAt">{{ formattedPublished }}</time>
    </div>
    <div v-if="updatedAt" class="article-meta__row">
      <span class="article-meta__label">Updated</span>
      <time :datetime="updatedAt">{{ formattedUpdated }}</time>
    </div>
    <div v-if="category" class="article-meta__row">
      <span class="article-meta__label">Category</span>
      <NuxtLink :to="`/category/${category.slug}`">{{ category.name }}</NuxtLink>
    </div>
    <div v-if="tags.length" class="article-meta__row article-meta__tags">
      <span class="article-meta__label">Tags</span>
      <ul>
        <li v-for="tag in tags" :key="tag.slug">
          <NuxtLink :to="`/tag/${tag.slug}`">#{{ tag.name }}</NuxtLink>
        </li>
      </ul>
    </div>
  </aside>
</template>

<script setup lang="ts">
import type { Category, Tag } from '~/types/blog';

interface Props {
  publishedAt?: string;
  updatedAt?: string;
  category?: Category | null;
  tags?: Tag[];
}

const props = withDefaults(defineProps<Props>(), {
  tags: () => []
});

const formattedPublished = computed(() =>
  props.publishedAt ? new Date(props.publishedAt).toLocaleDateString() : ''
);

const formattedUpdated = computed(() =>
  props.updatedAt ? new Date(props.updatedAt).toLocaleDateString() : ''
);

const tags = computed(() => props.tags ?? []);
</script>

<style scoped>
.article-meta {
  border: 1px solid #e5e7eb;
  border-radius: 12px;
  padding: 1.25rem;
  background: #f9fafb;
  display: grid;
  gap: 1rem;
}

.article-meta__row {
  display: flex;
  gap: 0.5rem;
  font-size: 0.95rem;
  color: #4b5563;
}

.article-meta__label {
  min-width: 90px;
  font-weight: 600;
  color: #111827;
}

.article-meta__tags ul {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
  list-style: none;
  padding: 0;
  margin: 0;
}

.article-meta__tags a {
  text-decoration: none;
  color: #2563eb;
}
</style>

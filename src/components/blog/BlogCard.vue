<template>
  <article class="blog-card">
    <NuxtLink :to="href" class="blog-card__link">
      <img
        v-if="eyecatch?.url"
        class="blog-card__image"
        :src="eyecatch.url"
        :alt="title"
      />
      <div class="blog-card__meta">
        <span v-if="category" class="blog-card__category">{{ category.name }}</span>
        <time v-if="publishedAt" class="blog-card__date" :datetime="publishedAt">
          {{ formattedDate }}
        </time>
      </div>
      <h3 class="blog-card__title">{{ title }}</h3>
      <p v-if="description" class="blog-card__description">{{ description }}</p>
      <ul v-if="tags.length" class="blog-card__tags">
        <li v-for="tag in tags" :key="tag.slug">#{{ tag.name }}</li>
      </ul>
    </NuxtLink>
  </article>
</template>

<script setup lang="ts">
import type { Article, Category, Tag } from '~/types/blog';

interface Props {
  title: string;
  description?: string;
  href: string;
  publishedAt?: string;
  category?: Category | null;
  tags?: Tag[];
  eyecatch?: Article['eyecatch'];
}

const props = withDefaults(defineProps<Props>(), {
  description: '',
  tags: () => [],
  eyecatch: null
});

const formattedDate = computed(() => {
  if (!props.publishedAt) {
    return '';
  }
  return new Date(props.publishedAt).toLocaleDateString();
});

const tags = computed(() => props.tags ?? []);
</script>

<style scoped>
.blog-card {
  border: 1px solid #e5e7eb;
  border-radius: 12px;
  overflow: hidden;
  transition: transform 0.2s ease, box-shadow 0.2s ease;
  background: #fff;
}

.blog-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 10px 25px rgba(15, 23, 42, 0.08);
}

.blog-card__link {
  display: block;
  color: inherit;
  text-decoration: none;
  padding: 1rem;
}

.blog-card__image {
  width: 100%;
  height: auto;
  border-radius: 8px;
  margin-bottom: 1rem;
}

.blog-card__meta {
  display: flex;
  gap: 0.5rem;
  align-items: center;
  font-size: 0.875rem;
  color: #6b7280;
}

.blog-card__category {
  font-weight: 600;
  color: #16a34a;
}

.blog-card__date {
  font-variant-numeric: tabular-nums;
}

.blog-card__title {
  font-size: 1.25rem;
  margin: 0.75rem 0 0.5rem;
  color: #111827;
}

.blog-card__description {
  color: #4b5563;
  line-height: 1.6;
  margin-bottom: 0.75rem;
}

.blog-card__tags {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
  font-size: 0.75rem;
  color: #2563eb;
  padding: 0;
  list-style: none;
  margin: 0;
}
</style>

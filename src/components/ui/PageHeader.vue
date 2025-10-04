<template>
  <div class="page-header">
    <h1 class="page-header__title">{{ title }}</h1>
    <p v-if="description" class="page-header__description">{{ description }}</p>
  </div>
</template>

<script setup lang="ts">
interface Props {
  title: string;
  description?: string;
}

const props = defineProps<Props>();

const title = computed(() => props.title);
const description = computed(() => props.description);
</script>

<style scoped>
.page-header {
  margin-bottom: 2rem;
}

.page-header__title {
  font-size: 2rem;
  margin-bottom: 0.5rem;
  color: #111827;
}

.page-header__description {
  color: #4b5563;
  line-height: 1.6;
}
</style>

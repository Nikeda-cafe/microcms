<template>
  <header class="layout__header">
    <NuxtLink class="layout__brand" to="/">{{ siteName }}</NuxtLink>
    <nav class="layout__nav">
      <NuxtLink to="/">Home</NuxtLink>
      <NuxtLink to="/blog">Blog</NuxtLink>
    </nav>
  </header>
</template>

<script setup lang="ts">
const config = useRuntimeConfig();
const siteName = computed(() => config.public.siteName || 'microCMS Blog');
</script>

<style scoped>
.layout__header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 1.5rem 1rem;
  border-bottom: 1px solid #e2e8f0;
}

.layout__brand {
  font-weight: 700;
  font-size: 1.25rem;
  text-decoration: none;
  color: #111827;
}

.layout__nav {
  display: flex;
  gap: 1rem;
}

.layout__nav a {
  color: #4b5563;
  text-decoration: none;
}

.layout__nav a.router-link-active {
  color: #1f2937;
  font-weight: 600;
}
</style>

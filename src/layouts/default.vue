<template>
  <div class="layout">
    <header class="layout__header">
      <NuxtLink class="layout__brand" to="/">{{ siteName }}</NuxtLink>
      <nav class="layout__nav">
        <NuxtLink to="/">Home</NuxtLink>
        <NuxtLink to="/blog">Blog</NuxtLink>
      </nav>
    </header>
    <main class="layout__main">
      <slot />
    </main>
    <footer class="layout__footer">
      <small>&copy; {{ new Date().getFullYear() }} {{ siteName }}</small>
    </footer>
  </div>
</template>

<script setup lang="ts">
const config = useRuntimeConfig();
const siteName = computed(() => config.public.siteName || 'microCMS Blog');
</script>

<style scoped>
.layout {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  font-family: system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
}

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

.layout__main {
  flex: 1;
  width: min(960px, 100%);
  margin: 0 auto;
  padding: 2rem 1rem 4rem;
}

.layout__footer {
  text-align: center;
  padding: 1rem;
  border-top: 1px solid #e2e8f0;
  color: #6b7280;
  font-size: 0.875rem;
}
</style>

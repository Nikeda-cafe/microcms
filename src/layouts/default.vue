<template>
  <div class="layout">
    <DefaultHeader />
    <main class="layout__main">
      <slot />
    </main>
    <footer class="layout__footer">
      <small>&copy; {{ new Date().getFullYear() }} {{ siteName }}</small>
    </footer>
  </div>
</template>

<script setup lang="ts">
import DefaultHeader from '~/components/ui/DefaultHeader.vue';
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

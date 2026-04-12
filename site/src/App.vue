<template>
  <AppNavbar />
  <main class="app-content">
    <RouterView />
  </main>
  <Notifications position="bottom right" />
</template>

<script setup lang="ts">
import { Notifications } from '@kyvg/vue3-notification'
import { RouterView } from 'vue-router'
import AppNavbar from '@/components/AppNavbar.vue'
</script>

<style scoped lang="scss">
@use '@/assets/styles/theme' as *;

.app-content {
  max-width: 1200px;
  margin: 0 auto;
  padding: $spacing-lg;
}
</style>

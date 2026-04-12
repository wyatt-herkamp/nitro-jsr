<template>
  <nav class="navbar">
    <RouterLink to="/" class="navbar-brand">Nitro-JSF</RouterLink>
    <div class="navbar-links">
      <RouterLink to="/debug" class="nav-link">
        <font-awesome-icon icon="bug" />
        Debug
      </RouterLink>
      <span v-if="schemaStore.hasSchema" class="schema-indicator">
        <font-awesome-icon icon="file-text" />
        {{ schemaStore.schemaName }}
      </span>
    </div>
  </nav>
</template>

<script setup lang="ts">
import { RouterLink } from 'vue-router'
import { useSchemaStore } from '@/stores/schema'

const schemaStore = useSchemaStore()
</script>

<style scoped lang="scss">
@use '@/assets/styles/theme' as *;

.navbar {
  display: flex;
  align-items: center;
  padding: $spacing-sm $spacing-lg;
  background-color: $bg-secondary;
  border-bottom: 1px solid $border-color;
  gap: $spacing-lg;
}

.navbar-brand {
  font-size: 1.1rem;
  font-weight: 700;
  color: $accent;
  text-decoration: none;
}

.navbar-links {
  display: flex;
  align-items: center;
  gap: $spacing-md;
}

.nav-link {
  display: flex;
  align-items: center;
  gap: $spacing-xs;
  color: $text-muted;
  text-decoration: none;
  padding: $spacing-xs $spacing-sm;
  border-radius: $border-radius;
  font-size: 0.9rem;
  transition: color 0.15s, background-color 0.15s;

  &:hover,
  &.router-link-active {
    color: $text-primary;
    background-color: $bg-hover;
  }
}

.schema-indicator {
  display: flex;
  align-items: center;
  gap: $spacing-xs;
  color: $type-string;
  font-size: 0.85rem;
  margin-left: auto;
}
</style>

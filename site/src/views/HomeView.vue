<template>
  <div class="home">
    <h1>Nitro-JSF</h1>
    <p class="subtitle">Framework-agnostic JSON Schema to form generator.</p>

    <div class="features">
      <p>Use the debug tool to inspect how schemas are parsed:</p>
      <ul>
        <li>View parsed properties with types, constraints, and validators</li>
        <li>Test validation with custom JSON input</li>
        <li>Inspect conditional properties (if/then/else)</li>
        <li>View raw schema JSON</li>
      </ul>
    </div>

    <div class="quick-start">
      <RouterLink to="/debug" class="btn-primary start-btn">
        <font-awesome-icon icon="bug" />
        Open Debug Tool
      </RouterLink>
    </div>

    <div class="test-schemas-section">
      <h2>Quick Load</h2>
      <div class="schema-links">
        <button
          v-for="ts in testSchemas"
          :key="ts.name"
          class="btn schema-link"
          @click="loadAndGo(ts)"
        >
          {{ ts.name }}
          <span class="muted schema-link-desc">{{ ts.description }}</span>
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { RouterLink, useRouter } from 'vue-router'
import { testSchemas, type TestSchema } from '@/data/testSchemas'
import { useSchemaStore } from '@/stores/schema'

const router = useRouter()
const schemaStore = useSchemaStore()

function loadAndGo(ts: TestSchema) {
  schemaStore.loadSchema(ts.name, JSON.stringify(ts.schema))
  router.push('/debug')
}
</script>

<style scoped lang="scss">
@use '@/assets/styles/theme' as *;

.home {
  display: flex;
  flex-direction: column;
  gap: $spacing-lg;
  max-width: 700px;
}

.subtitle {
  color: $text-muted;
  font-size: 1.1rem;
  margin-top: -$spacing-sm;
}

.features {
  color: $text-secondary;
  font-size: 0.95rem;

  ul {
    margin-top: $spacing-xs;
    padding-left: $spacing-lg;
  }

  li {
    margin-bottom: $spacing-xs;
  }
}

.quick-start {
  display: flex;
}

.start-btn {
  text-decoration: none;
  font-size: 1rem;
  padding: $spacing-sm $spacing-lg;
}

.test-schemas-section {
  display: flex;
  flex-direction: column;
  gap: $spacing-sm;
}

.schema-links {
  display: flex;
  flex-wrap: wrap;
  gap: $spacing-sm;
}

.schema-link {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  min-width: 180px;
}

.schema-link-desc {
  font-size: 0.7rem;
}
</style>

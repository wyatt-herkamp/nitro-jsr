<template>
  <div class="debug-page">
    <!-- Schema Loader -->
    <section v-if="!schemaStore.hasSchema" class="schema-loader">
      <h1>Load a Schema</h1>

      <div class="test-schemas">
        <h2>Test Schemas</h2>
        <div class="schema-buttons">
          <button
            v-for="ts in testSchemas"
            :key="ts.name"
            class="btn schema-btn"
            @click="loadTestSchema(ts)"
          >
            <span class="schema-btn-name">{{ ts.name }}</span>
            <span class="schema-btn-desc">{{ ts.description }}</span>
          </button>
        </div>
      </div>

      <div class="upload-section">
        <h2>Upload Custom Schema</h2>
        <UploadFileBox @fileAdded="onFileAdded" />
      </div>

      <div v-if="schemaStore.hasError" class="error-banner">
        <font-awesome-icon icon="exclamation-circle" />
        <span>{{ schemaStore.parseError?.message }}</span>
      </div>
    </section>

    <!-- Schema Inspector -->
    <section v-else class="schema-inspector">
      <div class="inspector-header">
        <div>
          <h1>{{ schemaStore.parsedSchema!.title }}</h1>
          <span class="muted mono">{{ schemaStore.parsedSchema!.schema }}</span>
        </div>
        <button class="btn-danger" @click="schemaStore.clearSchema()">
          <font-awesome-icon icon="trash" />
          Clear
        </button>
      </div>

      <div class="tab-bar">
        <button
          v-for="tab in tabs"
          :key="tab.id"
          class="tab-btn"
          :class="{ active: activeTab === tab.id }"
          @click="activeTab = tab.id"
        >
          <font-awesome-icon :icon="tab.icon" />
          {{ tab.label }}
        </button>
      </div>

      <div class="tab-content">
        <DebugParent
          v-if="activeTab === 'properties'"
          :schema="schemaStore.parsedSchema!"
        />
        <ValidationPanel
          v-else-if="activeTab === 'validation'"
          :schema="schemaStore.parsedSchema!"
        />
        <RawSchemaView
          v-else-if="activeTab === 'raw'"
          :rawJson="schemaStore.rawSchemaJson!"
        />
      </div>
    </section>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useSchemaStore } from '@/stores/schema'
import { testSchemas, type TestSchema } from '@/data/testSchemas'
import UploadFileBox from '@/components/UploadFileBox.vue'
import DebugParent from '@/components/schema/debug/DebugParent.vue'
import ValidationPanel from '@/components/schema/debug/ValidationPanel.vue'
import RawSchemaView from '@/components/schema/debug/RawSchemaView.vue'

const schemaStore = useSchemaStore()
const activeTab = ref<string>('properties')

const tabs = [
  { id: 'properties', label: 'Parsed Properties', icon: 'bug' },
  { id: 'validation', label: 'Validation', icon: 'flask' },
  { id: 'raw', label: 'Raw Schema', icon: 'code' }
]

function loadTestSchema(ts: TestSchema) {
  schemaStore.loadSchema(ts.name, JSON.stringify(ts.schema))
}

function onFileAdded(fileAsString: string) {
  try {
    const parsed = JSON.parse(fileAsString)
    const name = parsed.title ?? 'Custom Schema'
    schemaStore.loadSchema(name, fileAsString)
  } catch {
    schemaStore.loadSchema('Custom Schema', fileAsString)
  }
}
</script>

<style scoped lang="scss">
@use '@/assets/styles/theme' as *;

.schema-loader {
  display: flex;
  flex-direction: column;
  gap: $spacing-lg;
}

.test-schemas {
  display: flex;
  flex-direction: column;
  gap: $spacing-sm;
}

.schema-buttons {
  display: flex;
  flex-wrap: wrap;
  gap: $spacing-sm;
}

.schema-btn {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  padding: $spacing-sm $spacing-md;
  min-width: 200px;
}

.schema-btn-name {
  font-weight: 600;
}

.schema-btn-desc {
  font-size: 0.75rem;
  color: $text-muted;
}

.upload-section {
  display: flex;
  flex-direction: column;
  gap: $spacing-sm;
}

.error-banner {
  display: flex;
  align-items: center;
  gap: $spacing-sm;
  padding: $spacing-md;
  background-color: rgba($danger, 0.15);
  border: 1px solid $danger;
  border-radius: $border-radius;
  color: $danger;
}

.inspector-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: $spacing-md;
}

.tab-bar {
  display: flex;
  gap: 2px;
  border-bottom: 1px solid $border-color;
  margin-bottom: $spacing-lg;
}

.tab-btn {
  display: flex;
  align-items: center;
  gap: $spacing-xs;
  padding: $spacing-sm $spacing-md;
  background: none;
  border: none;
  border-bottom: 2px solid transparent;
  color: $text-muted;
  font-size: 0.9rem;
  cursor: pointer;
  transition: color 0.15s, border-color 0.15s;

  &:hover {
    color: $text-primary;
  }

  &.active {
    color: $accent;
    border-bottom-color: $accent;
  }
}
</style>

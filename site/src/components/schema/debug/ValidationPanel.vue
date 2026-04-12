<template>
  <div class="validation-panel">
    <div class="input-section">
      <label for="json-input">Input JSON to validate:</label>
      <textarea
        id="json-input"
        v-model="inputJson"
        rows="10"
        placeholder='{ "key": "value" }'
      ></textarea>
    </div>

    <div class="actions">
      <button class="btn-primary" @click="runValidation">
        <font-awesome-icon icon="flask" />
        Validate
      </button>
    </div>

    <!-- Parse error -->
    <div v-if="jsonParseError" class="result-banner error-banner">
      <font-awesome-icon icon="exclamation-circle" />
      <span>Invalid JSON: {{ jsonParseError }}</span>
    </div>

    <!-- Validation results -->
    <div v-if="hasRun && !jsonParseError" class="validation-results">
      <div v-if="validationErrors.length === 0" class="result-banner success-banner">
        <font-awesome-icon icon="check" />
        <span>Validation passed</span>
      </div>

      <div v-else class="errors-list">
        <div class="result-banner error-banner">
          <font-awesome-icon icon="exclamation-triangle" />
          <span>{{ validationErrors.length }} validation error{{ validationErrors.length > 1 ? 's' : '' }}</span>
        </div>
        <div
          v-for="(err, i) in validationErrors"
          :key="i"
          class="error-item"
        >
          <code class="error-property">{{ err.property }}</code>
          <span class="error-message">{{ err.message ?? 'Invalid value' }}</span>
        </div>
      </div>

      <div class="active-properties">
        <span class="muted">Active properties for this input: <strong>{{ activePropertyCount }}</strong></span>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import type { SchemaForm, ValidationError } from 'nitro-jsf'

const props = defineProps<{
  schema: SchemaForm
}>()

const inputJson = ref('{}')
const jsonParseError = ref<string | undefined>(undefined)
const validationErrors = ref<ValidationError[]>([])
const activePropertyCount = ref(0)
const hasRun = ref(false)

function runValidation() {
  jsonParseError.value = undefined
  validationErrors.value = []
  hasRun.value = true

  let parsed: any
  try {
    parsed = JSON.parse(inputJson.value)
  } catch (e) {
    jsonParseError.value = (e as Error).message
    return
  }

  try {
    validationErrors.value = props.schema.validate(parsed)
    activePropertyCount.value = props.schema.getProperties(parsed).length
  } catch (e) {
    jsonParseError.value = `Validation error: ${(e as Error).message}`
  }
}
</script>

<style scoped lang="scss">
@use '@/assets/styles/theme' as *;

.validation-panel {
  display: flex;
  flex-direction: column;
  gap: $spacing-md;
}

.input-section {
  display: flex;
  flex-direction: column;
  gap: $spacing-xs;

  label {
    font-size: 0.9rem;
    font-weight: 600;
    color: $text-secondary;
  }
}

.actions {
  display: flex;
  gap: $spacing-sm;
}

.result-banner {
  display: flex;
  align-items: center;
  gap: $spacing-sm;
  padding: $spacing-sm $spacing-md;
  border-radius: $border-radius;
  font-size: 0.9rem;
}

.success-banner {
  background-color: rgba($success, 0.12);
  border: 1px solid rgba($success, 0.3);
  color: $success;
}

.error-banner {
  background-color: rgba($danger, 0.12);
  border: 1px solid rgba($danger, 0.3);
  color: $danger;
}

.errors-list {
  display: flex;
  flex-direction: column;
  gap: $spacing-xs;
}

.error-item {
  display: flex;
  align-items: center;
  gap: $spacing-sm;
  padding: $spacing-sm $spacing-md;
  background-color: $bg-card;
  border: 1px solid $border-color;
  border-radius: $border-radius;
}

.error-property {
  font-family: $font-mono;
  font-size: 0.85rem;
  color: $danger;
  background: none;
  padding: 0;
  font-weight: 600;
}

.error-message {
  font-size: 0.85rem;
  color: $text-secondary;
}

.active-properties {
  font-size: 0.85rem;
  padding-top: $spacing-sm;
  border-top: 1px solid $border-color;
}
</style>

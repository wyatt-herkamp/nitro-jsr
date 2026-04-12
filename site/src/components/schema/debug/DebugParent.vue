<template>
  <div class="debug-parent">
    <!-- Required fields -->
    <div v-if="schema.primary.required.length > 0" class="required-summary">
      <span class="required-label">Required fields:</span>
      <code v-for="req in schema.primary.required" :key="req" class="required-field">{{ req }}</code>
    </div>

    <!-- Primary properties -->
    <section v-if="schema.primary.properties && schema.primary.properties.length > 0">
      <h2>Properties</h2>
      <PropertyCard
        v-for="prop in schema.primary.properties"
        :key="getKey(prop)"
        :property="prop"
      />
    </section>

    <!-- Primary conditions -->
    <section v-if="schema.primary.condition">
      <ConditionDisplay :condition="schema.primary.condition" />
    </section>

    <!-- AllOf sections -->
    <section v-if="schema.allOf && schema.allOf.length > 0">
      <h2>AllOf</h2>
      <div
        v-for="(instance, i) in schema.allOf"
        :key="i"
        class="allof-section panel"
      >
        <h3>AllOf[{{ i }}]</h3>
        <PropertyCard
          v-for="prop in instance.properties"
          :key="getKey(prop)"
          :property="prop"
        />
        <ConditionDisplay v-if="instance.condition" :condition="instance.condition" />
      </div>
    </section>
  </div>
</template>

<script setup lang="ts">
import type { SchemaForm, FormInputType } from 'nitro-jsf'
import PropertyCard from './PropertyCard.vue'
import ConditionDisplay from './ConditionDisplay.vue'

defineProps<{
  schema: SchemaForm
}>()

function getKey(prop: FormInputType): string {
  const k = prop.key()
  return Array.isArray(k) ? k.join('-') : k
}
</script>

<style scoped lang="scss">
@use '@/assets/styles/theme' as *;

.debug-parent {
  display: flex;
  flex-direction: column;
  gap: $spacing-md;
}

.required-summary {
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: $spacing-xs;
  padding: $spacing-sm $spacing-md;
  background-color: rgba($danger, 0.08);
  border: 1px solid rgba($danger, 0.2);
  border-radius: $border-radius;
}

.required-label {
  font-size: 0.85rem;
  font-weight: 600;
  color: $danger;
}

.required-field {
  font-family: $font-mono;
  font-size: 0.8rem;
  padding: 0.1rem 0.4rem;
  background-color: rgba($danger, 0.1);
  color: $danger;
  border-radius: 4px;
}

.allof-section {
  margin-bottom: $spacing-sm;
}

section > h2 {
  margin-bottom: $spacing-sm;
}
</style>

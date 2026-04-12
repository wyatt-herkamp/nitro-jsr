<template>
  <div class="condition-display">
    <div class="condition-header">
      <font-awesome-icon icon="code" />
      <span>Conditional Properties</span>
    </div>

    <div class="condition-checks">
      <span class="condition-label">If:</span>
      <span
        v-for="(cond, i) in conditions"
        :key="i"
        class="condition-check mono"
      >
        {{ getConditionText(cond) }}
      </span>
    </div>

    <div v-if="condition.extraProperties.length > 0" class="condition-branch then-branch">
      <span class="branch-label">Then:</span>
      <PropertyCard
        v-for="prop in condition.extraProperties"
        :key="getKey(prop)"
        :property="prop"
        :depth="0"
      />
    </div>

    <div v-if="condition.elseProperties.length > 0" class="condition-branch else-branch">
      <span class="branch-label">Else:</span>
      <PropertyCard
        v-for="prop in condition.elseProperties"
        :key="getKey(prop)"
        :property="prop"
        :depth="0"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import type { FormConditionalInput, FormCondition, FormInputType } from 'nitro-jsf'
import PropertyCard from './PropertyCard.vue'

const props = defineProps<{
  condition: FormConditionalInput
}>()

const conditions = computed(() => props.condition.conditions)

function getConditionText(cond: FormCondition): string {
  // EqualsFormCondition has key and value properties
  const c = cond as any
  if (c.key !== undefined && c.value !== undefined) {
    return `${c.key} === ${JSON.stringify(c.value)}`
  }
  return 'custom condition'
}

function getKey(prop: FormInputType): string {
  const k = prop.key()
  return Array.isArray(k) ? k.join('-') : k
}
</script>

<style scoped lang="scss">
@use '@/assets/styles/theme' as *;

.condition-display {
  border: 1px solid $border-color;
  border-left: 3px solid $accent;
  border-radius: $border-radius;
  background-color: rgba($accent, 0.03);
  padding: $spacing-md;
  margin-bottom: $spacing-sm;
}

.condition-header {
  display: flex;
  align-items: center;
  gap: $spacing-sm;
  font-weight: 600;
  font-size: 0.9rem;
  color: $accent;
  margin-bottom: $spacing-sm;
}

.condition-checks {
  display: flex;
  align-items: center;
  gap: $spacing-sm;
  margin-bottom: $spacing-md;
}

.condition-label {
  font-weight: 600;
  font-size: 0.85rem;
  color: $text-muted;
}

.condition-check {
  font-size: 0.85rem;
  background-color: rgba($border-color, 0.4);
  padding: 0.15rem 0.5rem;
  border-radius: $border-radius;
  color: $type-string;
}

.condition-branch {
  margin-top: $spacing-sm;
}

.branch-label {
  display: block;
  font-weight: 600;
  font-size: 0.8rem;
  color: $text-muted;
  text-transform: uppercase;
  margin-bottom: $spacing-xs;
}

.then-branch .branch-label {
  color: $success;
}

.else-branch .branch-label {
  color: $warning;
}
</style>

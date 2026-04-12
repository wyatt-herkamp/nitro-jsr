<template>
  <span class="type-badge" :class="typeClass">{{ typeName }}</span>
</template>

<script setup lang="ts">
import { computed } from 'vue'

const props = defineProps<{
  typeName: string
}>()

const typeClass = computed(() => {
  switch (props.typeName) {
    case 'string':
      return 'type-string'
    case 'number':
    case 'integer':
      return 'type-number'
    case 'boolean':
      return 'type-boolean'
    case 'enum':
      return 'type-enum'
    case 'array':
      return 'type-array'
    case 'object':
      return 'type-object'
    default:
      return 'type-default'
  }
})
</script>

<style scoped lang="scss">
@use '@/assets/styles/theme' as *;

.type-badge {
  display: inline-block;
  padding: 0.1rem 0.5rem;
  border-radius: 999px;
  font-size: 0.7rem;
  font-weight: 700;
  font-family: $font-mono;
  text-transform: uppercase;
  letter-spacing: 0.03em;
}

.type-string {
  background-color: rgba($type-string, 0.15);
  color: $type-string;
}

.type-number {
  background-color: rgba($type-number, 0.15);
  color: $type-number;
}

.type-boolean {
  background-color: rgba($type-boolean, 0.15);
  color: $type-boolean;
}

.type-enum {
  background-color: rgba($type-enum, 0.15);
  color: $type-enum;
}

.type-array {
  background-color: rgba($type-array, 0.15);
  color: $type-array;
}

.type-object {
  background-color: rgba($type-object, 0.15);
  color: $type-object;
}

.type-default {
  background-color: rgba($type-default, 0.15);
  color: $type-default;
}
</style>

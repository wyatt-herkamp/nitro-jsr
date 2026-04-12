<template>
  <div class="raw-schema-view">
    <pre>{{ formattedJson }}</pre>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'

const props = defineProps<{
  rawJson: string
}>()

const formattedJson = computed(() => {
  try {
    return JSON.stringify(JSON.parse(props.rawJson), null, 2)
  } catch {
    return props.rawJson
  }
})
</script>

<style scoped lang="scss">
@use '@/assets/styles/theme' as *;

.raw-schema-view {
  pre {
    max-height: 70vh;
    overflow-y: auto;
  }
}
</style>

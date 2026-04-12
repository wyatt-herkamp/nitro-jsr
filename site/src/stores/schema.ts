import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { parseJsonSchema, type SchemaForm } from 'nitro-jsf'

export const useSchemaStore = defineStore('schema', () => {
  const rawSchemaJson = ref<string | undefined>(undefined)
  const parsedSchema = ref<SchemaForm | undefined>(undefined)
  const parseError = ref<Error | undefined>(undefined)
  const schemaName = ref<string | undefined>(undefined)

  const hasSchema = computed(() => parsedSchema.value !== undefined)
  const hasError = computed(() => parseError.value !== undefined)

  function loadSchema(name: string, jsonString: string) {
    rawSchemaJson.value = jsonString
    parsedSchema.value = undefined
    parseError.value = undefined
    schemaName.value = name

    try {
      parsedSchema.value = parseJsonSchema(jsonString)
    } catch (e) {
      parseError.value = e as Error
    }
  }

  function clearSchema() {
    rawSchemaJson.value = undefined
    parsedSchema.value = undefined
    parseError.value = undefined
    schemaName.value = undefined
  }

  return {
    rawSchemaJson,
    parsedSchema,
    parseError,
    schemaName,
    hasSchema,
    hasError,
    loadSchema,
    clearSchema
  }
})

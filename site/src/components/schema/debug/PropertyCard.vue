<template>
  <div class="property-card" :style="{ marginLeft: `${depth * 1.5}rem` }">
    <!-- Header -->
    <div class="property-header">
      <TypeBadge :typeName="property.type()" />
      <code class="property-key">{{ displayKey }}</code>
      <span v-if="safeGet(() => property.title()) && safeGet(() => property.title()) !== displayKey" class="property-title">
        {{ safeGet(() => property.title()) }}
      </span>
    </div>

    <!-- Flags -->
    <div class="property-flags" v-if="hasFlags">
      <span v-if="safeGet(() => property.isRequired())" class="flag flag-required">required</span>
      <span v-if="safeGet(() => property.readOnly())" class="flag flag-readonly">read-only</span>
      <span v-if="safeGet(() => property.writeOnly())" class="flag flag-writeonly">write-only</span>
      <span v-if="safeGet(() => property.deprecated())" class="flag flag-deprecated">deprecated</span>
    </div>

    <!-- Description -->
    <p v-if="safeGet(() => property.description())" class="property-description">
      {{ safeGet(() => property.description()) }}
    </p>

    <!-- Default value -->
    <div v-if="safeGet(() => property.default()) !== undefined" class="property-default">
      Default: <code>{{ JSON.stringify(safeGet(() => property.default())) }}</code>
    </div>

    <!-- Type-specific details -->
    <div class="property-constraints" v-if="hasConstraints">
      <!-- String constraints -->
      <template v-if="property.type() === 'string'">
        <span v-if="origProp?.minLength" class="constraint">
          Min length: <code>{{ origProp.minLength }}</code>
        </span>
        <span v-if="origProp?.maxLength" class="constraint">
          Max length: <code>{{ origProp.maxLength }}</code>
        </span>
        <span v-if="origProp?.pattern" class="constraint">
          Pattern: <code class="mono">{{ origProp.pattern }}</code>
        </span>
        <span v-if="origProp?.format" class="constraint">
          Format: <code>{{ origProp.format }}</code>
        </span>
      </template>

      <!-- Number constraints -->
      <template v-if="property.type() === 'number' || property.type() === 'integer'">
        <span v-if="origProp?.minimum !== undefined" class="constraint">
          Min: <code>{{ origProp.minimum }}</code>
        </span>
        <span v-if="origProp?.exclusiveMinimum !== undefined" class="constraint">
          Min (exclusive): <code>{{ origProp.exclusiveMinimum }}</code>
        </span>
        <span v-if="origProp?.maximum !== undefined" class="constraint">
          Max: <code>{{ origProp.maximum }}</code>
        </span>
        <span v-if="origProp?.exclusiveMaximum !== undefined" class="constraint">
          Max (exclusive): <code>{{ origProp.exclusiveMaximum }}</code>
        </span>
        <span v-if="origProp?.multipleOf" class="constraint">
          Multiple of: <code>{{ origProp.multipleOf }}</code>
        </span>
      </template>

      <!-- Array constraints -->
      <template v-if="property.type() === 'array'">
        <span v-if="origProp?.minItems" class="constraint">
          Min items: <code>{{ origProp.minItems }}</code>
        </span>
        <span v-if="origProp?.maxItems" class="constraint">
          Max items: <code>{{ origProp.maxItems }}</code>
        </span>
        <span v-if="origProp?.uniqueItems" class="constraint">
          Unique items required
        </span>
      </template>

      <!-- Enum values -->
      <template v-if="property.type() === 'enum' && enumValues.length > 0">
        <div class="enum-values">
          <span class="constraint-label">Variants:</span>
          <!-- Simple enum (string values only) -->
          <div v-if="!isTaggedEnum" class="enum-list">
            <div v-for="(ev, i) in enumValues" :key="i" class="enum-item">
              <code>{{ enumValueLabel(ev) }}</code>
              <span v-if="ev.title" class="enum-title">{{ ev.title }}</span>
              <span v-if="ev.description" class="muted enum-desc">{{ ev.description }}</span>
            </div>
          </div>
          <!-- Tagged enum (variants with nested types) -->
          <div v-else class="variant-list">
            <div v-for="(ev, i) in enumValues" :key="i" class="variant-card">
              <div class="variant-header">
                <code class="variant-name">{{ enumValueLabel(ev) }}</code>
                <TypeBadge v-if="enumValueType(ev)" :typeName="enumValueType(ev)!" />
                <span v-if="ev.description" class="muted enum-desc">{{ ev.description }}</span>
              </div>
              <div v-if="enumValueNestedItems(ev).length > 0" class="variant-fields">
                <PropertyCard
                  v-for="item in enumValueNestedItems(ev)"
                  :key="getItemKey(item)"
                  :property="item"
                  :depth="depth + 1"
                />
              </div>
            </div>
          </div>
        </div>
      </template>
    </div>

    <!-- Nested object properties -->
    <div v-if="nestedItems.length > 0" class="nested-properties">
      <PropertyCard
        v-for="item in nestedItems"
        :key="getItemKey(item)"
        :property="item"
        :depth="depth + 1"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import {
  type FormInputType,
  EnumInput,
  ObjectInputType
} from 'nitro-jsf'
import TypeBadge from './TypeBadge.vue'

// Importing AdjacentEnumInput may not be in the main exports, so we access values dynamically
const props = withDefaults(
  defineProps<{
    property: FormInputType
    depth?: number
  }>(),
  { depth: 0 }
)

const displayKey = computed(() => {
  const k = props.property.key()
  return Array.isArray(k) ? k.join(', ') : k
})

const origProp = computed(() => props.property.originalProperty())

/** Safely call a method that may throw if the underlying property is undefined (e.g. AdjacentEnumInput) */
function safeGet<T>(fn: () => T, fallback?: T): T | undefined {
  try {
    return fn()
  } catch {
    return fallback
  }
}

const hasFlags = computed(() => {
  return (
    safeGet(() => props.property.isRequired()) ||
    safeGet(() => props.property.readOnly()) ||
    safeGet(() => props.property.writeOnly()) ||
    safeGet(() => props.property.deprecated())
  )
})

const enumValues = computed(() => {
  const p = props.property as any
  if (p.values && Array.isArray(p.values)) {
    return p.values
  }
  return []
})

const nestedItems = computed(() => {
  if (props.property instanceof ObjectInputType) {
    return props.property.items
  }
  return []
})

const hasConstraints = computed(() => {
  const type = props.property.type()
  const op = origProp.value

  if (type === 'string') {
    return !!(op?.minLength || op?.maxLength || op?.pattern || op?.format)
  }
  if (type === 'number' || type === 'integer') {
    return !!(
      op?.minimum !== undefined ||
      op?.exclusiveMinimum !== undefined ||
      op?.maximum !== undefined ||
      op?.exclusiveMaximum !== undefined ||
      op?.multipleOf
    )
  }
  if (type === 'array') {
    return !!(op?.minItems || op?.maxItems || op?.uniqueItems)
  }
  if (type === 'enum') {
    return enumValues.value.length > 0
  }
  return false
})

/** Whether this is a tagged enum (adjacent or internal) with complex variant values */
const isTaggedEnum = computed(() => {
  if (enumValues.value.length === 0) return false
  const first = enumValues.value[0]
  return first.keyProperty !== undefined || first.variantKey !== undefined
})

/** Display the readable label for an enum value, handling all three enum types */
function enumValueLabel(ev: any): string {
  if (ev.variantKey !== undefined) return ev.variantKey
  if (ev.keyProperty !== undefined) return ev.keyProperty
  return JSON.stringify(ev.value)
}

/** Get the type name of a tagged enum variant's value */
function enumValueType(ev: any): string | undefined {
  const val = ev.value as FormInputType | undefined
  if (!val || typeof val.type !== 'function') return undefined
  return val.type()
}

/** Get nested items for a tagged enum variant (e.g. object fields) */
function enumValueNestedItems(ev: any): FormInputType[] {
  const val = ev.value as any
  if (!val) return []
  // ObjectInputType stores sub-properties in items
  if (val.items && Array.isArray(val.items)) return val.items
  return []
}

function getItemKey(item: FormInputType): string {
  const k = item.key()
  return Array.isArray(k) ? k.join('-') : k
}
</script>

<style scoped lang="scss">
@use '@/assets/styles/theme' as *;

.property-card {
  padding: $spacing-md;
  border: 1px solid $border-color;
  border-radius: $border-radius;
  background-color: $bg-card;
  margin-bottom: $spacing-sm;
}

.property-header {
  display: flex;
  align-items: center;
  gap: $spacing-sm;
  margin-bottom: $spacing-xs;
}

.property-key {
  font-family: $font-mono;
  font-size: 0.9rem;
  font-weight: 600;
  color: $text-primary;
  background: none;
  padding: 0;
}

.property-title {
  color: $text-muted;
  font-size: 0.85rem;
}

.property-flags {
  display: flex;
  gap: $spacing-xs;
  margin-bottom: $spacing-xs;
}

.flag {
  display: inline-block;
  padding: 0.05rem 0.4rem;
  border-radius: 999px;
  font-size: 0.65rem;
  font-weight: 600;
  text-transform: uppercase;
}

.flag-required {
  background-color: rgba($danger, 0.15);
  color: $danger;
}

.flag-readonly {
  background-color: rgba($text-muted, 0.15);
  color: $text-muted;
}

.flag-writeonly {
  background-color: rgba($text-muted, 0.15);
  color: $text-muted;
}

.flag-deprecated {
  background-color: rgba($warning, 0.15);
  color: $warning;
  text-decoration: line-through;
}

.property-description {
  color: $text-secondary;
  font-size: 0.85rem;
  margin-bottom: $spacing-xs;
}

.property-default {
  font-size: 0.85rem;
  color: $text-muted;
  margin-bottom: $spacing-xs;

  code {
    font-family: $font-mono;
    color: $type-string;
    background: none;
    padding: 0;
  }
}

.property-constraints {
  display: flex;
  flex-wrap: wrap;
  gap: $spacing-sm;
  margin-top: $spacing-xs;
}

.constraint {
  font-size: 0.8rem;
  color: $text-secondary;
  background-color: rgba($border-color, 0.3);
  padding: 0.15rem 0.5rem;
  border-radius: $border-radius;

  code {
    font-family: $font-mono;
    color: $accent;
    background: none;
    padding: 0;
  }
}

.constraint-label {
  font-size: 0.8rem;
  color: $text-muted;
  font-weight: 600;
}

.enum-values {
  width: 100%;
  display: flex;
  flex-direction: column;
  gap: $spacing-xs;
}

.enum-list {
  display: flex;
  flex-wrap: wrap;
  gap: $spacing-xs;
}

.enum-item {
  display: flex;
  align-items: center;
  gap: $spacing-xs;
  background-color: rgba($type-enum, 0.1);
  padding: 0.2rem 0.5rem;
  border-radius: $border-radius;
  font-size: 0.8rem;

  code {
    font-family: $font-mono;
    color: $type-enum;
    background: none;
    padding: 0;
  }
}

.enum-title {
  font-size: 0.75rem;
  color: $text-secondary;
}

.enum-desc {
  font-size: 0.7rem;
}

.variant-list {
  display: flex;
  flex-direction: column;
  gap: $spacing-sm;
  width: 100%;
}

.variant-card {
  border: 1px solid $border-color;
  border-radius: $border-radius;
  padding: $spacing-sm $spacing-md;
  background-color: rgba($bg-card, 0.5);
}

.variant-header {
  display: flex;
  align-items: center;
  gap: $spacing-sm;
}

.variant-name {
  font-family: $font-mono;
  font-size: 0.85rem;
  font-weight: 600;
  color: $type-enum;
  background: none;
  padding: 0;
}

.variant-fields {
  margin-top: $spacing-sm;
  padding-top: $spacing-sm;
  border-top: 1px solid $border-color;
}

.nested-properties {
  margin-top: $spacing-sm;
  padding-top: $spacing-sm;
  border-top: 1px solid $border-color;
}
</style>

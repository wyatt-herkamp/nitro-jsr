// Detects whether a `oneOf`/`anyOf` array is really a tagged-enum pattern rather than a set of
// unrelated alternatives.
//
// Two shapes are recognised, and they are told apart by whether a *discriminator* property — one
// whose subschema pins a literal via `const` — is present in every branch:
//
//   Adjacently tagged (serde `#[serde(tag = "t", content = "c")]`):
//     { properties: { t: { const: "Unit" } },                    required: ["t"] }
//     { properties: { t: { const: "Data" }, c: { ...schema } },   required: ["t", "c"] }
//   Externally tagged (serde's default, `{"Variant": {...}}`):
//     { properties: { Unit: { ...schema } } }
//     { properties: { Data: { ...schema } } }
//
// Note that branch *arity* cannot be used to classify: an adjacently tagged enum mixing unit and
// data variants has both 1-property and 2-property branches, and an earlier version of this file
// locked its answer in from the first branch and so rejected exactly that case.

import { BaseSchema } from './index'
export type EnumPatternType =
  | {
      type: EnumPatternTypes.AdjacentlyTagged
      keyTag: string
      /**
       * The content property. `undefined` when every variant is a unit variant, so no branch
       * carries a content property at all.
       */
      valueTag: string | undefined
    }
  | {
      type: EnumPatternTypes.InternallyTagged
    }
export enum EnumPatternTypes {
  AdjacentlyTagged,
  /**
   * One property per branch, naming the variant, with no `const` discriminator.
   *
   * This is serde's *externally* tagged form. The name is kept for backwards compatibility.
   */
  InternallyTagged
}

type Properties = NonNullable<BaseSchema['properties']>

export function isAnyOfEnumPattern(anyOf: Array<BaseSchema>): EnumPatternType | undefined {
  if (anyOf.length === 0) {
    return undefined
  }
  // Every branch has to be an object schema with properties, in either shape.
  const branches = new Array<Properties>()
  for (const schema of anyOf) {
    if (schema.properties === undefined) {
      return undefined
    }
    branches.push(schema.properties)
  }

  const adjacent = detectAdjacentlyTagged(branches)
  if (adjacent) {
    return adjacent
  }
  if (isExternallyTagged(branches)) {
    return { type: EnumPatternTypes.InternallyTagged }
  }
  return undefined
}

/**
 * Looks for a single property key that carries a `const` in *every* branch, where each branch holds
 * at most one other property and all such properties agree on a name.
 *
 * Candidates come from the first branch: a tag has to be `const` everywhere, so anything that is
 * not `const` in branch 0 cannot be the tag.
 */
function detectAdjacentlyTagged(branches: Array<Properties>): EnumPatternType | undefined {
  const candidates = Object.keys(branches[0]).filter((key) => branches[0][key].const !== undefined)
  for (const keyTag of candidates) {
    if (!branches.every((properties) => properties[keyTag]?.const !== undefined)) {
      continue
    }
    let valueTag: string | undefined = undefined
    let consistent = true
    for (const properties of branches) {
      const others = Object.keys(properties).filter((key) => key !== keyTag)
      if (others.length === 0) {
        // A unit variant carries no content, which must not disqualify the set.
        continue
      }
      if (others.length > 1) {
        consistent = false
        break
      }
      if (valueTag === undefined) {
        valueTag = others[0]
      } else if (valueTag !== others[0]) {
        consistent = false
        break
      }
    }
    if (!consistent) {
      continue
    }
    return { type: EnumPatternTypes.AdjacentlyTagged, keyTag, valueTag }
  }
  return undefined
}

function isExternallyTagged(branches: Array<Properties>): boolean {
  return branches.every((properties) => {
    const keys = Object.keys(properties)
    return keys.length === 1 && properties[keys[0]].const === undefined
  })
}

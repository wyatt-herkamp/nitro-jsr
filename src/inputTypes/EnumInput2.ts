import { FormInputType, InputValidator, ValidationResult } from './index'
import { parseProperty, Property, BaseSchema } from '../lib'
import { ParsingSchema } from '../schemaParser'

export interface AdjacentEnumValue {
  /** The variant name, i.e. the `const` pinned on the tag property for this branch. */
  keyProperty: string
  /** The content sub-form. `undefined` for a unit variant, which carries no content. */
  value: FormInputType | undefined
  title?: string
  description?: string
}

export class AdjacentEnumValidator implements InputValidator {
  values: AdjacentEnumValue[]
  keyProperty: string
  valueProperty: string | undefined
  hasDefaultValue: boolean = false
  constructor(
    values: AdjacentEnumValue[],
    keyProperty: string,
    valueProperty: string | undefined,
    hasDefaultValue: boolean = false
  ) {
    this.values = values
    this.keyProperty = keyProperty
    this.hasDefaultValue = hasDefaultValue
    this.valueProperty = valueProperty
  }
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  validate(value: any): ValidationResult {
    return { success: true }
  }
}
/**
 * An adjacently tagged enum — serde's `#[serde(tag = "t", content = "c")]`.
 *
 * The tag is rendered as a choice between {@link values}; whichever variant is selected, its
 * content sub-form is what {@link getProperties} returns.
 */
export class AdjacentEnumInput implements FormInputType {
  values: AdjacentEnumValue[]
  propertyKey: string
  /** `undefined` when every variant is a unit variant, so no branch has a content property. */
  valueKey: string | undefined
  property: Property | undefined
  constructor(
    property: Property | undefined,
    propertyKey: string,
    valuekey: string | undefined,
    values: AdjacentEnumValue[]
  ) {
    this.property = property
    this.values = values
    this.valueKey = valuekey
    this.propertyKey = propertyKey
  }
  originalProperty(): Property | undefined {
    return this.property
  }
  title(): string | undefined {
    return this.property?.title ?? this.propertyKey
  }
  type(): string {
    return 'enum'
  }
  key(): string {
    return this.propertyKey
  }
  description(): string | undefined {
    return this.property?.description
  }
  isRequired(): boolean {
    return this.property?.required ?? false
  }
  readOnly(): boolean {
    return this.property?.readOnly ?? false
  }
  writeOnly(): boolean {
    return this.property?.writeOnly ?? false
  }
  deprecated(): boolean {
    return this.property?.deprecated ?? false
  }
  default() {
    return this.property?.default
  }
  debug(): string {
    const titleOrKey = this.title() ?? this.key()
    const variants = this.values.map((value) => value.keyProperty)
    return `AdjacentEnumInput: ${titleOrKey} with variants ${JSON.stringify(variants)}`
  }

  validator(): InputValidator {
    return new AdjacentEnumValidator(
      this.values,
      this.propertyKey,
      this.valueKey,
      this.property?.default !== undefined
    )
  }
  getProperties(input: any): Array<FormInputType> | undefined {
    if (input === undefined) {
      return undefined
    }
    const value = input[this.propertyKey]
    if (value === undefined) {
      return undefined
    }
    const enumValue = this.values.find((enumValue) => enumValue.keyProperty === value)
    if (enumValue && enumValue.value) {
      return [enumValue.value]
    }
  }
}

export function enumInputAdjacentTagged(
  keyProperty: string,
  valueProperty: string | undefined,
  enumDef: Array<BaseSchema>,
  parsingSchema: ParsingSchema
): AdjacentEnumInput | undefined {
  const values = new Array<AdjacentEnumValue>()
  for (const enumValue of enumDef) {
    const tag = enumValue.properties?.[keyProperty]
    if (tag?.const === undefined) {
      // Without a tag literal there is no way to say which variant this branch is, so it cannot be
      // offered as a choice. Previously such a branch was pushed with `keyProperty: undefined`,
      // which then matched nothing in `getProperties` and rendered as a blank option.
      console.warn(`[WARN] Skipping adjacently tagged variant with no \`${keyProperty}\` const`)
      continue
    }
    let valuePropertyValue = undefined
    if (valueProperty !== undefined) {
      const property = enumValue.properties?.[valueProperty]
      if (property) {
        valuePropertyValue = parseProperty(valueProperty, property, parsingSchema)
      }
    }
    values.push({
      keyProperty: tag.const,
      // The variant name is the only label always available — schemars puts a variant's doc
      // comment on the branch, not on the tag.
      title: enumValue.title ?? tag.title ?? tag.const,
      value: valuePropertyValue,
      description: enumValue.description ?? tag.description
    })
  }
  if (values.length === 0) {
    return undefined
  }

  return new AdjacentEnumInput(undefined, keyProperty, valueProperty, values)
}

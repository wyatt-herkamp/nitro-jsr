import { FormInputType, InputValidator, ValidationResult } from './index'
import { Property } from '../schemaParser/properties'
import { parseProperty } from '../schemaParser/properties'
import { ParsingSchema, BaseSchema } from '../schemaParser'

export interface InternalEnumValue {
  variantKey: string
  value: FormInputType | undefined
  title?: string
  description?: string
}

export class InternalEnumValidator implements InputValidator {
  variantKeys: string[]

  constructor(variantKeys: string[]) {
    this.variantKeys = variantKeys
  }

  validate(value: any): ValidationResult {
    if (value === undefined || value === null || typeof value !== 'object') {
      return { success: false, error: 'Value must be an object' }
    }
    const presentKeys = Object.keys(value).filter((k) => this.variantKeys.includes(k))
    if (presentKeys.length === 0) {
      return { success: false, error: `Must contain one of: ${this.variantKeys.join(', ')}` }
    }
    if (presentKeys.length > 1) {
      return {
        success: false,
        error: `Must contain exactly one variant key, found: ${presentKeys.join(', ')}`
      }
    }
    return { success: true }
  }
}

export class InternalEnumInput implements FormInputType {
  values: InternalEnumValue[]
  schemaTitle: string | undefined

  constructor(values: InternalEnumValue[], title?: string) {
    this.values = values
    this.schemaTitle = title
  }

  originalProperty(): Property | undefined {
    return undefined
  }

  title(): string | undefined {
    return this.schemaTitle
  }

  type(): string {
    return 'enum'
  }

  key(): string[] {
    return this.values.map((v) => v.variantKey)
  }

  description(): string | undefined {
    return undefined
  }

  isRequired(): boolean {
    return false
  }

  readOnly(): boolean {
    return false
  }

  writeOnly(): boolean {
    return false
  }

  deprecated(): boolean {
    return false
  }

  default(): any | undefined {
    return undefined
  }

  debug(): string {
    const keys = this.key()
    return `InternalEnumInput: [${keys.join(', ')}] with ${this.values.length} variants`
  }

  validator(): InputValidator {
    return new InternalEnumValidator(this.values.map((v) => v.variantKey))
  }

  getProperties(input: any): Array<FormInputType> | undefined {
    if (input === undefined || input === null) {
      return undefined
    }
    for (const variant of this.values) {
      if (input[variant.variantKey] !== undefined) {
        if (variant.value) {
          return [variant.value]
        }
        return undefined
      }
    }
    return undefined
  }
}

export function enumInputInternallyTagged(
  enumDef: Array<BaseSchema>,
  parsingSchema: ParsingSchema
): InternalEnumInput | undefined {
  const values = new Array<InternalEnumValue>()

  for (const variant of enumDef) {
    if (!variant.properties) {
      return undefined
    }
    const propertyNames = Object.keys(variant.properties)
    if (propertyNames.length !== 1) {
      return undefined
    }

    const variantKey = propertyNames[0]
    const variantProperty = variant.properties[variantKey]

    let parsedValue: FormInputType | undefined = undefined
    try {
      parsedValue = parseProperty(variantKey, variantProperty, parsingSchema)
    } catch (e) {
      console.warn(
        `[WARN] Could not parse internally tagged variant property for key ${variantKey}`
      )
    }

    values.push({
      variantKey: variantKey,
      value: parsedValue,
      title: variant.title,
      description: variant.description
    })
  }

  if (values.length === 0) {
    return undefined
  }

  return new InternalEnumInput(values)
}

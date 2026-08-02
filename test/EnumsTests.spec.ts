import * as fs from 'fs'
import { AdjacentEnumInput, parseJsonSchema, type SchemaForm } from '../src/lib.js'

function load(path: string): SchemaForm {
  return parseJsonSchema(fs.readFileSync(path, 'utf8'))
}

/** The single root-level input, which for a tagged enum is the variant selector. */
function onlyInput(form: SchemaForm) {
  const properties = form.getProperties({})
  expect(properties).toHaveLength(1)
  return properties[0]
}

test('Parse EnumSchemaAdjacentTest.json', () => {
  const input = onlyInput(load('test/schemas/enums/EnumSchemaAdjacentTest.json'))
  expect(input).toBeInstanceOf(AdjacentEnumInput)
  const adjacent = input as AdjacentEnumInput
  expect(adjacent.propertyKey).toBe('type')
  expect(adjacent.valueKey).toBe('data')
  expect(adjacent.values.map((value) => value.keyProperty)).toEqual(['A', 'B', 'String', 'Other'])
})

test('Evaluate EnumSchemaAdjacentTest.json', () => {
  const form = load('test/schemas/enums/EnumSchemaAdjacentTest.json')
  // Selecting a variant should surface that variant's content sub-form, and only that one.
  const selected = form.getProperties({ type: 'Other', data: { a: 1, b: 2 } })
  expect(selected.length).toBeGreaterThanOrEqual(2)
  expect(form.validate({ type: 'A', data: 1 })).toHaveLength(0)
})

// Regression: schemars renders an adjacently tagged enum as a `oneOf` whose unit variants have one
// property (the tag) and whose data variants have two (tag + content). Detection used to classify
// from the first branch's property count alone, so a mixed enum was rejected outright and a
// unit-only one was misread as externally tagged. Both fixtures are real `nitro_repo` output from
// `nitro_repo export repository-config-types`.
test('MavenRepositoryConfig.json — unit and data variants in one enum', () => {
  const input = onlyInput(load('test/schemas/enums/MavenRepositoryConfig.json'))
  expect(input).toBeInstanceOf(AdjacentEnumInput)
  const adjacent = input as AdjacentEnumInput
  expect(adjacent.propertyKey).toBe('type')
  expect(adjacent.valueKey).toBe('config')
  expect(adjacent.values.map((value) => value.keyProperty)).toEqual(['Hosted', 'Proxy'])
  // `Hosted` is a unit variant, so it has no content sub-form; `Proxy` carries MavenProxyConfig.
  expect(adjacent.values[0].value).toBeUndefined()
  expect(adjacent.values[1].value).toBeDefined()
  // The label has to fall back to the variant name — schemars sets no title on these branches.
  expect(adjacent.values.map((value) => value.title)).toEqual(['Hosted', 'Proxy'])
})

test('MavenRepositoryConfig.json — the selected variant drives the sub-form', () => {
  const form = load('test/schemas/enums/MavenRepositoryConfig.json')
  const input = onlyInput(form) as AdjacentEnumInput
  expect(input.getProperties({ type: 'Proxy', config: {} })).toHaveLength(1)
  // A unit variant has nothing further to fill in.
  expect(input.getProperties({ type: 'Hosted' })).toBeUndefined()
})

test('NPMRegistryConfig.json — an all-unit enum is still adjacently tagged', () => {
  const input = onlyInput(load('test/schemas/enums/NPMRegistryConfig.json'))
  expect(input).toBeInstanceOf(AdjacentEnumInput)
  const adjacent = input as AdjacentEnumInput
  expect(adjacent.propertyKey).toBe('type')
  // No branch carries a content property, so there is no content key to report.
  expect(adjacent.valueKey).toBeUndefined()
  expect(adjacent.values.map((value) => value.keyProperty)).toEqual(['Hosted'])
  expect(adjacent.values[0].value).toBeUndefined()
})

test('Parse EnumSchemaTest.json (internally tagged)', () => {
  const schema = fs.readFileSync('test/schemas/enums/EnumSchemaTest.json', 'utf8')
  const parsed = parseJsonSchema(schema)
  console.log(JSON.stringify(parsed, null, 2))
  const properties = parsed.getProperties({})
  expect(properties.length).toBeGreaterThanOrEqual(1)
  expect(properties[0].type()).toBe('enum')
})

test('Evaluate EnumSchemaTest.json with variant A', () => {
  const schema = fs.readFileSync('test/schemas/enums/EnumSchemaTest.json', 'utf8')
  const parsed = parseJsonSchema(schema)
  const properties = parsed.getProperties({ A: 42 })
  for (const property of properties) {
    console.log(property.debug())
  }
  // Should find the InternalEnumInput and the sub-property for variant A (integer)
  expect(properties.length).toBeGreaterThanOrEqual(2)
})

test('Evaluate EnumSchemaTest.json with variant Other', () => {
  const schema = fs.readFileSync('test/schemas/enums/EnumSchemaTest.json', 'utf8')
  const parsed = parseJsonSchema(schema)
  const properties = parsed.getProperties({ Other: { a: 1, b: 2 } })
  for (const property of properties) {
    console.log(property.debug())
  }
  expect(properties.length).toBeGreaterThanOrEqual(2)
})

test('Validate EnumSchemaTest.json - valid input', () => {
  const schema = fs.readFileSync('test/schemas/enums/EnumSchemaTest.json', 'utf8')
  const parsed = parseJsonSchema(schema)
  const errors = parsed.validate({ A: 42 })
  expect(errors.length).toBe(0)
})

test('Validate EnumSchemaTest.json - empty input', () => {
  const schema = fs.readFileSync('test/schemas/enums/EnumSchemaTest.json', 'utf8')
  const parsed = parseJsonSchema(schema)
  const errors = parsed.validate({})
  expect(errors.length).toBeGreaterThan(0)
})

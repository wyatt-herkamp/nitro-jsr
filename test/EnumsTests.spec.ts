import * as fs from 'fs'
import { parseJsonSchema } from '../src/lib.js'
test('Parse EnumSchemaAdjacentTest.json', () => {
  const schema = fs.readFileSync('test/schemas/enums/EnumSchemaAdjacentTest.json', 'utf8')
  const parsed = parseJsonSchema(schema)
  console.log(JSON.stringify(parsed, null, 2))
})

test('Evaluate EnumSchemaAdjacentTest.json', () => {
  const schema = fs.readFileSync('test/schemas/enums/EnumSchemaAdjacentTest.json', 'utf8')
  const parsed = parseJsonSchema(schema)
  const properties = parsed.getProperties({})
  for (const property of properties) {
    console.log(property.debug())
  }
  const validationErrors = parsed.validate({})
  for (const error of validationErrors) {
    console.log(error)
  }
  {
    const validationErrors = parsed.validate({
      type: 'A',
      data: 1
    })
    for (const error of validationErrors) {
      console.log(error)
    }
  }
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

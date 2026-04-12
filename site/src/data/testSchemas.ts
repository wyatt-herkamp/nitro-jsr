import Badge from '../../../test/schemas/Badge.json'
import PageType from '../../../test/schemas/PageType.json'
import Security from '../../../test/schemas/Security.json'
import EnumSchemaTest from '../../../test/schemas/enums/EnumSchemaTest.json'
import EnumSchemaAdjacentTest from '../../../test/schemas/enums/EnumSchemaAdjacentTest.json'

export interface TestSchema {
  name: string
  description: string
  schema: object
}

export const testSchemas: TestSchema[] = [
  { name: 'Badge', description: '$refs, nested objects, enums, regex patterns', schema: Badge },
  { name: 'PageType', description: 'if/then conditional logic', schema: PageType },
  { name: 'Security', description: 'oneOf enum with descriptions', schema: Security },
  {
    name: 'EnumSchemaTest',
    description: 'Internally tagged enum pattern',
    schema: EnumSchemaTest
  },
  {
    name: 'EnumSchemaAdjacentTest',
    description: 'Adjacently tagged enum pattern',
    schema: EnumSchemaAdjacentTest
  }
]

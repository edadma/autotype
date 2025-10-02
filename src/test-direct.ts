import type { ParseWithSchema, Schema } from './schema'

// Direct test without function - just the types
type TestSchema = {
  readonly users: {
    readonly $array: true
    readonly $schema: {
      readonly id: 'string'
      readonly posts: {
        readonly $array: true
        readonly $schema: {
          readonly title: 'string'
        }
      }
    }
  }
}

// Test parsing with both strings
type Result1 = ParseWithSchema<'{ users { id posts { title } } }', TestSchema>
type Result2 = ParseWithSchema<'{ users { posts { title } } }', TestSchema>

// Export for inspection in IDE
export const test1: Result1 = {} as any
export const test2: Result2 = {} as any

import type { Schema } from './schema'

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

// Test IsArrayInSchema
type IsArrayInSchema<S extends Schema, FieldName extends string> = FieldName extends keyof S
  ? S[FieldName] extends { $array: true; $schema: Schema }
    ? true
    : false
  : false

type Test1 = IsArrayInSchema<TestSchema, 'users'>  // Should be true
type Test2 = keyof TestSchema  // Should include 'users'
type Test3 = TestSchema['users']  // Should be the $array object
type Test4 = TestSchema['users'] extends { $array: true; $schema: Schema } ? 'yes' : 'no'  // Should be 'yes'

export const t1: Test1 = null as any
export const t2: Test2 = null as any
export const t3: Test3 = null as any
export const t4: Test4 = null as any

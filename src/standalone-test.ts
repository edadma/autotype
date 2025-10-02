// Completely standalone test - copy of the working logic
import type { Schema } from './schema'
import type { ParseAST } from './simpleParser'

type Prettify<T> = {
  [K in keyof T]: T[K] extends infer U ? U : never
} extends infer O ? { [K in keyof O]: O[K] } : never

type Field = {
  readonly name: string
  readonly value: 'string' | readonly Field[]
}

type IsArrayInSchema<S extends Schema, FieldName extends string> = FieldName extends keyof S
  ? S[FieldName] extends { $array: true; $schema: Schema }
    ? true
    : false
  : false

type GetNestedSchema<S extends Schema, FieldName extends string> = FieldName extends keyof S
  ? S[FieldName] extends { $array: true; $schema: infer Nested extends Schema }
    ? Nested
    : {}
  : {}

type FieldsToType<Fields extends readonly Field[], SchemaObj extends Schema> =
  Fields extends readonly [infer First, ...infer Rest extends readonly Field[]]
    ? First extends { name: infer FieldName extends string; value: infer FieldValue }
      ? {
          [K in FieldName]: FieldValue extends 'string'
            ? IsArrayInSchema<SchemaObj, FieldName> extends true
              ? string[]
              : string
            : FieldValue extends readonly Field[]
              ? IsArrayInSchema<SchemaObj, FieldName> extends true
                ? FieldsToType<FieldValue, GetNestedSchema<SchemaObj, FieldName>>[]
                : FieldsToType<FieldValue, GetNestedSchema<SchemaObj, FieldName>>
              : never
        } & FieldsToType<Rest, SchemaObj>
      : {}
    : {}

type MyParseWithSchema<S extends string, SchemaObj extends Schema> =
  ParseAST<S> extends readonly Field[]
    ? Prettify<FieldsToType<ParseAST<S>, SchemaObj>>
    : never

// Test it
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

type Result1 = MyParseWithSchema<'{ users { id posts { title } } }', TestSchema>
type Result2 = MyParseWithSchema<'{ users { posts { title } } }', TestSchema>

export const r1: Result1 = null as any
export const r2: Result2 = null as any

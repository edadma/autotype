import type { ParseAST } from './simpleParser'

// Simplified FieldsToType test
type Prettify<T> = {
  [K in keyof T]: T[K] extends infer U ? U : never
} extends infer O ? { [K in keyof O]: O[K] } : never

type Field = {
  readonly name: string
  readonly value: 'string' | readonly Field[]
}

type SimpleSchema = {
  readonly id: 'string'
  readonly name: 'string'
}

type AST = ParseAST<'{ id name }'>

// Manual conversion test
type Manual = {
  id: string
  name: string
}

// Test if AST extends the Field array type
type TestExtends = AST extends readonly Field[] ? 'yes' : 'no'

// Try FieldsToType manually
type FieldsToType<Fields extends readonly Field[], SchemaObj> =
  Fields extends readonly [infer First extends Field, ...infer Rest extends readonly Field[]]
    ? { [K in First['name']]: First['value'] extends 'string' ? string : never } & FieldsToType<Rest, SchemaObj>
    : {}

type Converted = FieldsToType<AST, SimpleSchema>

export const testExtends: TestExtends = null as any
export const converted: Converted = null as any

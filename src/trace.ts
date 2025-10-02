import type { ParseAST } from './simpleParser'
import type { Schema } from './schema'

type Field = {
  readonly name: string
  readonly value: 'string' | readonly Field[]
}

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

// Step 1: Parse AST
type AST = ParseAST<'{ users { id posts { title } } }'>
export const ast: AST = null as any

// Step 2: Check if it extends Field[]
type ExtendsFieldArray = AST extends readonly Field[] ? 'yes' : 'no'
export const extendsCheck: ExtendsFieldArray = null as any

// Step 3: What is AST really?
type ASTType = AST extends readonly any[]
  ? AST extends readonly [any, ...any[]]
    ? 'tuple'
    : 'array'
  : AST extends never
    ? 'never'
    : 'other'
export const astType: ASTType = null as any

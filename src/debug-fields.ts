import type { ParseAST } from './simpleParser'

// Test field parsing
type AST1 = ParseAST<'{ id name }'>
type AST2 = ParseAST<'{ users { id } }'>

// Test the Fields extraction
type FirstField<Fields> = Fields extends readonly [infer First, ...any[]] ? First : never
type RestFields<Fields> = Fields extends readonly [any, ...infer Rest] ? Rest : never

type First1 = FirstField<AST1>
type Rest1 = RestFields<AST1>

type First2 = FirstField<AST2>
type Rest2 = RestFields<AST2>

export const ast1: AST1 = null as any
export const ast2: AST2 = null as any
// export const f1: First1 = null as any
// export const r1: Rest1 = null as any
// export const f2: First2 = null as any
// export const r2: Rest2 = null as any

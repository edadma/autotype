import type { ParseAST } from './simpleParser'

// Test simple parsing
type Test1 = ParseAST<'{ id name }'>
// Should be: [{ name: 'id', value: 'string' }, { name: 'name', value: 'string' }]

type Test2 = ParseAST<'{ users { id } }'>
// Should be: [{ name: 'users', value: [{ name: 'id', value: 'string' }] }]

export const t1: Test1 = null as any
export const t2: Test2 = null as any

import type { ParseWithSchema } from './simpleParser'

// Test the full conversion
type TestSchema = {
  readonly id: 'string'
  readonly name: 'string'
}

type Result = ParseWithSchema<'{ id name }', TestSchema>

export const result: Result = null as any

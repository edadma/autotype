import { autotypeWithSchema } from './typeFunction'

// Simplest possible test - no createSchema, direct literal
const result = autotypeWithSchema('{ id name }', {
  id: 'string',
  name: 'string',
  email: 'string',
} as const)

// result should only have id and name, NOT email
export const test = result
